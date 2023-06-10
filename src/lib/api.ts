import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';

export class Api {
	cg: Chessground;
	chessJS: ChessJS;
	stateChangeCallback: (api:Api) => void;
	constructor(
		cg: Chessground,
		fen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		stateChangeCallback: (api:Api) => void = (api:Api)=>{}, // called when the game state (not visuals) changes
	) {
		this.cg = cg;
		this.chessJS = new ChessJS( fen );
		this.stateChangeCallback = stateChangeCallback;
		this.cg.set( {
			fen: fen,
			turnColor: this.chessJS.turn() == 'w' ? 'white' : 'black',
			movable: {
				free: false,
				dests: this.getPossibleMoves(),
				events: {
					after: (orig,dest) => {
						const move = this.chessJS.move({ from: orig, to: dest });
						if ( move.flags.includes('e') ) {
							// remove en-passant pawn from chessground. TODO make smoother
							this.cg.set({ fen: this.chessJS.fen() });
						}
						this._updateChessgroundWithPossibleMoves();
						this.stateChangeCallback(this);
					},
				},
			},
		} );
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
		let move;
		try {
			move = this.chessJS.move( moveSan );
		} catch ( err ) {
			// illegal move
			return false;
		}
		this.cg.move( move.from, move.to );
		if ( move.flags.includes('e') ) {
			// remove en-passant pawn from chessground. TODO make smoother
			this.cg.set({ fen: this.chessJS.fen() });
		}
		this._updateChessgroundWithPossibleMoves();
		this.stateChangeCallback(this);
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

}
