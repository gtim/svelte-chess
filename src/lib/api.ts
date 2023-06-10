import type { Chessground } from 'svelte-chessground';
import { Chess as ChessJS, SQUARES } from 'chess.js';

export class Api {
	cg: Chessground;
	chessJS: ChessJS;
	constructor( cg: Chessground ) {
		this.cg = cg;
		this.chessJS = new ChessJS();
		this.cg.set( {
			movable: {
				free: false,
				dests: this.getPossibleMoves(),
				events: {
					after: (orig,dest) => {
						this.chessJS.move({ from: orig, to: dest });
						this._updateChessgroundWithPossibleMoves();
					},
				},
			},
		} );
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
		this._updateChessgroundWithPossibleMoves();
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
	}

	// Undo last move
	undoLastMove(): void {
		this.chessJS.undo();
		this.cg.set({
			fen: this.chessJS.fen(),
			turnColor: 'white',
			lastMove: undefined,
		});
		this._updateChessgroundWithPossibleMoves();
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
