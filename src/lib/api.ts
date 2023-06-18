import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';
import type { Square, PieceSymbol, Move, Color } from 'chess.js';
export type { Square, PieceSymbol, Move, Color };

export type GameOver = {
	reason: "checkmate" | "stalemate" | "repetition" | "insufficient material" | "fifty-move rule",
	result: 1 | 0 | 0.5,
};

export class Api {
	private chessJS: ChessJS;
	private gameIsOver: boolean = false;
	constructor(
		private cg: Chessground,
		fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		private stateChangeCallback: (api:Api) => void = (api)=>{}, // called when the game state (not visuals) changes
		private promotionCallback: (sq:Square) => Promise<PieceSymbol> = async (sq)=>'q', // called before promotion
		private moveCallback: (move:Move) => void = (m)=>{}, // called after move
		private gameOverCallback: ( gameOver:GameOver ) => void = (go)=>{}, // called after game-ending move
		private _orientation: Color = 'w',
	) {
		this.cg.set( {
			orientation: Api._colorToCgColor( _orientation ),
			movable: { free: false },
		} );
		this.chessJS = new ChessJS( fen );
		this.load( fen );
	}

	// Load FEN. Throws exception on invalid FEN.
	load( fen: string ) {
		this.chessJS.load( fen );
		this._checkForGameOver();
		this.cg.set( { animation: { enabled: false } } );
		const cgColor = Api._colorToCgColor( this.chessJS.turn() );
		this.cg.set( {
			fen: fen,
			turnColor: cgColor,
			check: this.chessJS.inCheck(),
			lastMove: undefined,
			selected: undefined,
			movable: {
				free: false,
				color: cgColor,
				dests: this.possibleMovesDests(),
				events: {
					after: (orig, dest) => { this._chessgroundMoveCallback(orig,dest) },
				},
			},
		} );
		this.cg.set( { animation: { enabled: true } } );
		this.stateChangeCallback(this);
	}

	/*
	 * Making a move
	 */

	// called after a move is played on Chessground
	async _chessgroundMoveCallback( orig: Square|'a0', dest: Square|'a0' ) {
		if ( orig === 'a0' || dest === 'a0' ) {
			// the Chessground square type (Key) includes a0
			throw Error('invalid square');
		}
		let move: Move;
		if ( this._moveIsPromotion( orig, dest ) ) {
			const promotion = await this.promotionCallback( dest );
			move = this.chessJS.move({ from: orig, to: dest, promotion });
		} else {
			move = this.chessJS.move({ from: orig, to: dest });
		}
		this._updateChessgroundAfterMove( move );
	}

	private _moveIsPromotion( orig: Square, dest: Square ): boolean {
		return this.chessJS.get(orig).type === 'p' && ( dest.charAt(1) == '1' || dest.charAt(1) == '8' );
	}

	// Make a move programmatically
	move(moveSan: string) {
		if ( this.gameIsOver )
			throw new Error(`Invalid move: Game is over.`);
		const move = this.chessJS.move( moveSan ); // throws on illegal move
		this.cg.move( move.from, move.to );
		this._updateChessgroundAfterMove( move );
	}

	// Called after chess.js move and chessground move to update chess-logic details Chessground doesn't handle
	private _updateChessgroundAfterMove( move: Move ) {
		// reload FEN after en-passant or promotion. TODO make promotion smoother
		if ( move.flags.includes('e') || move.flags.includes('p') ) {
			this.cg.set({ fen: this.chessJS.fen() });
		}
		// highlight king if in check
		if ( this.chessJS.inCheck() ) {
			this.cg.set({ check: true });
		}
		// dispatch move event
		this.moveCallback( move );
		// dispatch gameOver event if applicable
		this._checkForGameOver();
		// set legal moves
		this._updateChessgroundWithPossibleMoves();
		// update state props
		this.stateChangeCallback(this);
	}

	private _updateChessgroundWithPossibleMoves() {
		const cgColor = Api._colorToCgColor( this.chessJS.turn() );
		this.cg.set({
			turnColor: cgColor,
			movable: {
				color: cgColor,
				dests: this.possibleMovesDests(),
			},
		});
	}
	private _checkForGameOver() {
		if ( this.chessJS.isCheckmate() ) {
			const result = this.chessJS.turn() == 'w' ? 0 : 1;
			this.gameOverCallback( { reason: 'checkmate', result } );
			this.gameIsOver = true;
		} else if ( this.chessJS.isStalemate() ) {
			this.gameOverCallback( { reason: 'stalemate', result: 0.5 } );
			this.gameIsOver = true;
		} else if ( this.chessJS.isInsufficientMaterial() ) {
			this.gameOverCallback( { reason: 'insufficient material', result: 0.5 } );
			this.gameIsOver = true;
		} else if ( this.chessJS.isThreefoldRepetition() ) {
			this.gameOverCallback( { reason: 'repetition', result: 0.5 } );
			this.gameIsOver = true;
		} else if ( this.chessJS.isDraw() ) {
			// use isDraw until chess.js exposes isFiftyMoveDraw()
			this.gameOverCallback( { reason: 'fifty-move rule', result: 0.5 } );
			this.gameIsOver = true;
		} else {
			this.gameIsOver = false;
		}
	}


	/*
	 *
	 */

	// Find all legal moves in chessground "dests" format
	possibleMovesDests() {
		const dests = new Map();
		if ( ! this.gameIsOver ) {
			SQUARES.forEach(s => {
				const ms = this.chessJS.moves({square: s, verbose: true});
				if (ms.length) dests.set(s, ms.map(m => m.to));
			});
		}
		return dests;
	}

	// Reset board to the starting position
	reset(): void {
		this.load( 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' );
	}

	// Undo last move
	undo(): Move | null {
		const move = this.chessJS.undo();
		this.cg.set({
			fen: this.chessJS.fen(),
			turnColor: Api._colorToCgColor( this.chessJS.turn() ),
			lastMove: undefined,
		});
		this.gameIsOver = false;
		this._updateChessgroundWithPossibleMoves();
		this.stateChangeCallback(this);
		return move;
	}

	// Board orientation
	toggleOrientation(): void {
		this._orientation = this._orientation === 'w' ? 'b' : 'w';
		this.cg.set({
			orientation: Api._colorToCgColor( this._orientation ),
		});
		this.stateChangeCallback(this);
	}
	orientation(): Color {
		return this._orientation;
	}

	// Check if game is over (checkmate, stalemate, repetition, insufficient material, fifty-move rule)
	isGameOver(): boolean {
		return this.gameIsOver;
	}


	/*
	 * Methods passed through to chess.js
	 */
	
	fen(): string {
		return this.chessJS.fen();
	}
	turn() {
		return this.chessJS.turn();
	}
	moveNumber() {
		return this.chessJS.moveNumber();
	}
	history(): string[]
	history({ verbose }: { verbose: true }): Move[]
	history({ verbose }: { verbose: false }): string[]
	history({ verbose }: { verbose: boolean }): string[] | Move[]
	history({ verbose = false }: { verbose?: boolean } = {}) {
		return this.chessJS.history({ verbose });
	}
	board() {
		return this.chessJS.board();
	}

	// Convert between chess.js color (w/b) and chessground color (white/black).
	// Chess.js color is always used internally.
	static _colorToCgColor( chessjsColor: Color ): 'white' | 'black' {
		return chessjsColor === 'w' ? 'white' : 'black';
	}
	static _cgColorToColor( chessgroundColor: 'white' | 'black' ): Color {
		return chessgroundColor === 'white' ? 'w' : 'b';
	}

}
