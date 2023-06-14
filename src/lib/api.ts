import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';
import type { Square, PieceSymbol, Move } from 'chess.js';
export type { Square, PieceSymbol, Move };

export type GameOver = {
	reason: "checkmate" | "stalemate" | "repetition" | "insufficient material" | "fifty-move rule",
	result: 1 | 0 | 0.5,
};

export class Api {
	private chessJS: ChessJS;
	constructor(
		private cg: Chessground,
		fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		private stateChangeCallback: (api:Api) => void = (api)=>{}, // called when the game state (not visuals) changes
		private promotionCallback: (sq:Square) => Promise<PieceSymbol> = async (sq)=>'q', // called before promotion
		private moveCallback: (move:Move) => void = (m)=>{}, // called after move
		private gameOverCallback: ( gameOver:GameOver ) => void = (go)=>{}, // called after game-ending move
	) {
		this.chessJS = new ChessJS( fen );
		this.cg.set( {
			fen: fen,
			turnColor: this.chessJS.turn() == 'w' ? 'white' : 'black',
			movable: {
				free: false,
				dests: this.possibleMovesDests(),
				events: {
					after: (orig, dest) => { this._chessgroundMoveCallback(orig,dest) },
				},
			},
		} );
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
	move(moveSan: string): boolean {
		let move: Move;
		try {
			move = this.chessJS.move( moveSan );
		} catch ( err ) {
			// illegal move
			return false;
		}
		this.cg.move( move.from, move.to );
		this._updateChessgroundAfterMove( move );
		return true;
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
		// set legal moves
		this._updateChessgroundWithPossibleMoves();
		// update state props
		this.stateChangeCallback(this);
		// dispatch move event
		this.moveCallback( move );
		// dispatch gameOver event if applicable
		this._checkForGameOver();
	}

	private _updateChessgroundWithPossibleMoves() {
		const cgColor = this.chessJS.turn() == 'w' ? 'white' : 'black';
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
		} else if ( this.chessJS.isStalemate() ) {
			this.gameOverCallback( { reason: 'stalemate', result: 0.5 } );
		} else if ( this.chessJS.isInsufficientMaterial() ) {
			this.gameOverCallback( { reason: 'insufficient material', result: 0.5 } );
		} else if ( this.chessJS.isThreefoldRepetition() ) {
			this.gameOverCallback( { reason: 'repetition', result: 0.5 } );
		} else if ( this.chessJS.isDraw() ) {
			// use isDraw until chess.js exposes isFiftyMoveDraw()
			this.gameOverCallback( { reason: 'fifty-move rule', result: 0.5 } );
		}
	}


	/*
	 *
	 */

	// Find all legal moves in chessground "dests" format
	possibleMovesDests() {
		const dests = new Map();
		SQUARES.forEach(s => {
			const ms = this.chessJS.moves({square: s, verbose: true});
			if (ms.length) dests.set(s, ms.map(m => m.to));
		});
		return dests;
	}

	// Reset board to the starting position
	reset(): void {
		this.chessJS.reset();
		this.cg.set({
			fen: this.chessJS.fen(),
			turnColor: 'white',
			lastMove: undefined,
		});
		this._updateChessgroundWithPossibleMoves();
		this.stateChangeCallback(this);
	}

	// Undo last move
	undo(): void {
		this.chessJS.undo();
		this.cg.set({
			fen: this.chessJS.fen(),
			turnColor: this.chessJS.turn() == 'w' ? 'white' : 'black',
			lastMove: undefined,
		});
		this._updateChessgroundWithPossibleMoves();
		this.stateChangeCallback(this);
	}

	// Toggle board orientation
	toggleOrientation(): void {
		this.cg.toggleOrientation();
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
	history() {
		return this.chessJS.history();
	}



}
