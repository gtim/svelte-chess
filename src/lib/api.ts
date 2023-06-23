import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';
import type { Square, PieceSymbol, Color, Move as CjsMove } from 'chess.js';
export type { Square, PieceSymbol, Color };
import type { Engine } from '$lib/engine.js';

export type Move = CjsMove & {
	check: boolean,
	checkmate: boolean,
};

export type GameOver = {
	reason: "checkmate" | "stalemate" | "repetition" | "insufficient material" | "fifty-move rule",
	result: 1 | 0 | 0.5,
};

export class Api {
	private chessJS: ChessJS;
	private gameIsOver = false;
	constructor(
		private cg: Chessground,
		fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		private stateChangeCallback: (api:Api) => void = (api)=>{}, // called when the game state (not visuals) changes
		private promotionCallback: (sq:Square) => Promise<PieceSymbol> = async (sq)=>'q', // called before promotion
		private moveCallback: (move:Move) => void = (m)=>{}, // called after move
		private gameOverCallback: ( gameOver:GameOver ) => void = (go)=>{}, // called after game-ending move
		private _orientation: Color = 'w',
		private engine: Engine | undefined = undefined,
	) {
		this.cg.set( {
			orientation: Api._colorToCgColor( _orientation ),
			movable: { free: false },
			premovable: { enabled: false },
		} );
		this.chessJS = new ChessJS( fen );
		this.load( fen );
	}

	async init() {
		if ( this.engine ) {
			this.engine.init().then( () => {
				if ( this._enginePlaysNextMove() ) {
					this.playEngineMove()
				}
			} );
		}
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
				dests: this._enginePlaysNextMove() ? new Map() : this.possibleMovesDests(),
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
		let cjsMove: CjsMove;
		if ( this._moveIsPromotion( orig, dest ) ) {
			const promotion = await this.promotionCallback( dest );
			cjsMove = this.chessJS.move({ from: orig, to: dest, promotion });
		} else {
			cjsMove = this.chessJS.move({ from: orig, to: dest });
		}
		const move = Api._cjsMoveToMove( cjsMove );
		this._postMoveAdmin( move );
	}

	private _moveIsPromotion( orig: Square, dest: Square ): boolean {
		return this.chessJS.get(orig).type === 'p' && ( dest.charAt(1) == '1' || dest.charAt(1) == '8' );
	}

	// Make a move programmatically
	// argument is either a short algebraic notation (SAN) string
	// or an object with from/to/promotion (see chess.js move())
	move( moveSanOrObj: string | { from: string, to: string, promotion?: string } ) {
		if ( this.gameIsOver )
			throw new Error('Invalid move: Game is over.');
		const cjsMove = this.chessJS.move( moveSanOrObj ); // throws on illegal move
		const move = Api._cjsMoveToMove( cjsMove );
		this.cg.move( move.from, move.to );
		this._postMoveAdmin( move );
	}
	// Make a move programmatically from long algebraic notation (LAN) string,
	// as returned by UCI engines.
	moveLan( moveLan: string ) {
		const from = moveLan.slice(0,2);
		const to = moveLan.slice(2,4);
		const promotion = moveLan.charAt(4) || undefined;
		this.move( { from, to, promotion } );
	}

	// Called after a move (chess.js or chessground) to:
	// - update chess-logic details Chessground doesn't handle
	// - dispatch events
	// - play engine move 
	private _postMoveAdmin( move: Move ) {

		// reload FEN after en-passant or promotion. TODO make promotion smoother
		if ( move.flags.includes('e') || move.flags.includes('p') ) {
			this.cg.set({ fen: this.chessJS.fen() });
		}
		// highlight king if in check
		if ( move.check ) {
			this.cg.set({ check: true });
		}
		// dispatch move event
		this.moveCallback( move );
		// dispatch gameOver event if applicable
		this._checkForGameOver();
		// set legal moves
		if ( this._enginePlaysNextMove() ) {
			this.cg.set({ movable: { dests: new Map() } }); // no legal moves
		} else {
			this._updateChessgroundWithPossibleMoves();
		}
		// update state props
		this.stateChangeCallback(this);
		
		// engine move
		if ( ! this.gameIsOver && this._enginePlaysNextMove() ) {
			this.playEngineMove();
		}

	}

	private playEngineMove() {
		if ( ! this.engine ) {
			throw Error('playEngineMove called without initialised engine');
		}
		this.engine.getMove( this.chessJS.fen() ).then( (lan) => {
			this.moveLan(lan);
		});
	}

	private _enginePlaysNextMove() {
		return this.engine && ( this.engine.getColor() === 'both' || this.engine.getColor() === this.chessJS.turn() );
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
		const cjsMove = this.chessJS.undo();
		const move = cjsMove ? Api._cjsMoveToMove( cjsMove ) : null;
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
	inCheck() {
		return this.chessJS.inCheck();
	}
	history(): string[]
	history({ verbose }: { verbose: true }): Move[]
	history({ verbose }: { verbose: false }): string[]
	history({ verbose }: { verbose: boolean }): string[] | Move[]
	history({ verbose = false }: { verbose?: boolean } = {}) {
		if ( verbose ) {
			return this.chessJS.history({ verbose }).map( Api._cjsMoveToMove );
		} else {
			return this.chessJS.history({ verbose });
		}
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

	// Convert chess.js move (CjsMove) to svelte-chess Move.
	// Only difference is check:boolean and checkmate:boolean in the latter.
	static _cjsMoveToMove( cjsMove: CjsMove ): Move {
		const lastSanChar = cjsMove.san.slice(-1);
		const checkmate = lastSanChar === '#';
		const check     = lastSanChar === '+' || checkmate;
		return { ...cjsMove, check, checkmate };
	}

}
