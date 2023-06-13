import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';
import type { Square, PieceSymbol, Move } from 'chess.js';
export type { Square, PieceSymbol };

export class Api {
	cg: Chessground;
	chessJS: ChessJS;
	stateChangeCallback: (api:Api) => void;
	promotionCallback: (sq:Square) => Promise<PieceSymbol>;
	constructor(
		cg: Chessground,
		fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		stateChangeCallback: (api:Api) => void = (api:Api)=>{}, // called when the game state (not visuals) changes
		promotionCallback: (sq:Square) => Promise<PieceSymbol>, // called before promotion
	) {
		this.cg = cg;
		this.chessJS = new ChessJS( fen );
		this.stateChangeCallback = stateChangeCallback;
		this.promotionCallback = promotionCallback;
		this.cg.set( {
			fen: fen,
			turnColor: this.chessJS.turn() == 'w' ? 'white' : 'black',
			movable: {
				free: false,
				dests: this.getPossibleMoves(),
				events: {
					after: async (orig,dest) => {
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
					},
				},
			},
		} );
		this.stateChangeCallback(this);
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
		this._updateChessgroundWithPossibleMoves();
		this.stateChangeCallback(this);
	}

	// Find all legal moves
	getPossibleMoves() {
		const dests = new Map();
		SQUARES.forEach(s => {
			const ms = this.chessJS.moves({square: s, verbose: true});
			if (ms.length) dests.set(s, ms.map(m => m.to));
		});
		return dests;
	}

	// Get FEN of the current position
	getFen(): string {
		return this.chessJS.fen();
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

	// Reset board to the starting position
	resetBoard(): void {
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
	undoLastMove(): void {
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

	// Get current turn's color
	getTurnColor() {
		return this.chessJS.turn();
	}

	// Get current move number (whole moves)
	getMoveNumber() {
		return this.chessJS.moveNumber();
	}

	// Get history of moves
	getHistory() {
		return this.chessJS.history();
	}


	private _updateChessgroundWithPossibleMoves() {
		const cgColor = this.chessJS.turn() == 'w' ? 'white' : 'black';
		this.cg.set({
			turnColor: cgColor,
			movable: {
				color: cgColor,
				dests: this.getPossibleMoves(),
			},
		});
	}

	private _moveIsPromotion( orig: Square, dest: Square ): boolean {
		return this.chessJS.get(orig).type === 'p' && ( dest.charAt(1) == '1' || dest.charAt(1) == '8' );
	}

}
