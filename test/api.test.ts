import {describe, expect} from 'vitest';
import { Api } from '../src/lib/api.js';
import { Chessground } from 'svelte-chessground';

// Mock svelte-chessground: Chessground changes are *not* tested here
vi.mock('svelte-chessground', () => {
	const Chessground = vi.fn();
	Chessground.prototype.move = vi.fn();
	Chessground.prototype.set = vi.fn();
	return { Chessground };
});

let api: Api;
beforeEach(() => {
	api = new Api( new Chessground() );
} );

describe("possibleMovesDests", () => {
	test("correct moves from initial position", () => {
		expect(api.possibleMovesDests()).toEqual(
			new Map( Object.entries( {
				a2: ['a3','a4'],
				b2: ['b3','b4'],
				c2: ['c3','c4'],
				d2: ['d3','d4'],
				e2: ['e3','e4'],
				f2: ['f3','f4'],
				g2: ['g3','g4'],
				h2: ['h3','h4'],
				b1: ['a3','c3'],
				g1: ['f3','h3'],
			} ) )
		);
	});
});

describe("move", () => {
	test("play 1. e4 e5 2. Nf3", () => {
		api.move('e4');
		api.move('e5');
		api.move('Nf3');
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2' );
	});
	test("1. d5 is illegal", () => {
		expect( () => api.move('d5') ).toThrowError();
	});
});

describe("board manipulation", () => {
	test("reset board", () => {
		const initialFen = api.fen();
		api.reset();
		expect( api.fen() ).toEqual( initialFen );
		api.move('e4');
		expect( api.fen() ).not.toEqual( initialFen );
		api.reset();
		expect( api.fen() ).toEqual( initialFen );
	} );
	test("undo last move", () => {
		let move;
		api.move('e4');
		api.move('e5');
		api.move('Bc4');
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2' );
		move = api.undo();
		expect( move.san ).toEqual( 'Bc4' );
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' );
		api.move('Qh5');
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2' );
		move = api.undo();
		expect( move.san ).toEqual( 'Qh5' );
		move = api.undo();
		expect( move.san ).toEqual( 'e5' );
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1' );
	} );
});

describe("board state", () => {
	test("turn color", () => {
		expect( api.turn() ).toEqual( 'w' );
		api.move('e4');
		expect( api.turn() ).toEqual( 'b' );
		api.move('e5');
		expect( api.turn() ).toEqual( 'w' );
		api.move('Bc4');
		expect( api.turn() ).toEqual( 'b' );
		api.move('d6');
		expect( api.turn() ).toEqual( 'w' );
		api.undo();
		expect( api.turn() ).toEqual( 'b' );
		api.reset();
		expect( api.turn() ).toEqual( 'w' );
	} );
	test("move number", () => {
		expect( api.moveNumber() ).toEqual( 1 );
		api.move('e4');
		expect( api.moveNumber() ).toEqual( 1 );
		api.move('e5');
		expect( api.moveNumber() ).toEqual( 2 );
		api.move('Bc4');
		expect( api.moveNumber() ).toEqual( 2 );
		api.move('d6');
		expect( api.moveNumber() ).toEqual( 3 );
		api.undo();
		expect( api.moveNumber() ).toEqual( 2 );
		api.reset();
		expect( api.moveNumber() ).toEqual( 1 );
	} );
	test("move history, verbose", () => {
		expect( api.history({verbose:true}) ).toEqual( [] );
		api.move('e4');
		api.move('e5');
		expect( api.history({verbose:true}) ).toEqual( [
			{
				after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
				before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				color: 'w',
				flags: 'b',
				from: 'e2',
				lan: 'e2e4',
				piece: 'p',
				san: 'e4',
				to: 'e4',
				check: false,
				checkmate: false,
			},
			{
				after: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
				before: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
				color: 'b',
				flags: 'b',
				from: 'e7',
				lan: 'e7e5',
				piece: 'p',
				san: 'e5',
				to: 'e5',
				check: false,
				checkmate: false,
			}
		] );
		expect( () => api.move('a6') ).toThrowError();
		api.move('Bc4');
		expect( api.history({verbose:true}) ).toHaveLength(3);
		expect( (api.history({verbose:true}))[2] ).toEqual( {
			before: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
			after: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
			color: 'w',
			piece: 'b',
			from: 'f1',
			to: 'c4',
			san: 'Bc4',
			flags: 'n',
			lan: 'f1c4',
			check: false,
			checkmate: false,
		});
		api.reset();
		expect( api.history({verbose:true}) ).toEqual( [] );
	} );
	test("move history, verbose, check/checkmate", () => {
		api.move('e4');
		api.move('e5');
		api.move('Bc4');
		api.move('Bc5');
		api.move('Qf3');
		api.move('Bxf2');
		api.move('Qxf2');
		api.move('d6');
		api.move('Qxf7');
		const history = api.history({verbose:true});
		expect( history ).toHaveLength(9);
		expect( history[0] ).toContain( { check: false, checkmate: false } );
		expect( history[1] ).toContain( { check: false, checkmate: false } );
		expect( history[2] ).toContain( { check: false, checkmate: false } );
		expect( history[3] ).toContain( { check: false, checkmate: false } );
		expect( history[4] ).toContain( { check: false, checkmate: false } );
		expect( history[5] ).toContain( { check: true,  checkmate: false } );
		expect( history[6] ).toContain( { check: false, checkmate: false } );
		expect( history[7] ).toContain( { check: false, checkmate: false } );
		expect( history[8] ).toContain( { check: true,  checkmate: true  } );
	} );

	test("board()", () => {
		api.move('e4');
		const board = api.board();
		expect( board ).toHaveLength(8);
		expect( board[0] ).toEqual( [
			{ square: 'a8', type: 'r', color: 'b' },
			{ square: 'b8', type: 'n', color: 'b' },
			{ square: 'c8', type: 'b', color: 'b' },
			{ square: 'd8', type: 'q', color: 'b' },
			{ square: 'e8', type: 'k', color: 'b' },
			{ square: 'f8', type: 'b', color: 'b' },
			{ square: 'g8', type: 'n', color: 'b' },
			{ square: 'h8', type: 'r', color: 'b' }
		]);
		expect( board[1] ).toEqual( [
			{ square: 'a7', type: 'p', color: 'b' },
			{ square: 'b7', type: 'p', color: 'b' },
			{ square: 'c7', type: 'p', color: 'b' },
			{ square: 'd7', type: 'p', color: 'b' },
			{ square: 'e7', type: 'p', color: 'b' },
			{ square: 'f7', type: 'p', color: 'b' },
			{ square: 'g7', type: 'p', color: 'b' },
			{ square: 'h7', type: 'p', color: 'b' }
		] );
		expect( board[2] ).toEqual( [ null, null, null, null, null, null, null, null ] );
		expect( board[3] ).toEqual( [ null, null, null, null, null, null, null, null ] );
		expect( board[4] ).toEqual( [ null, null, null, null, { square: 'e4', type: 'p', color: 'w' }, null, null, null ] );
		expect( board[5] ).toEqual( [ null, null, null, null, null, null, null, null ] );
		expect( board[6] ).toEqual( [
			{ square: 'a2', type: 'p', color: 'w' },
			{ square: 'b2', type: 'p', color: 'w' },
			{ square: 'c2', type: 'p', color: 'w' },
			{ square: 'd2', type: 'p', color: 'w' },
			null,
			{ square: 'f2', type: 'p', color: 'w' },
			{ square: 'g2', type: 'p', color: 'w' },
			{ square: 'h2', type: 'p', color: 'w' }
		] );
		expect( board[7] ).toEqual( [
			{ square: 'a1', type: 'r', color: 'w' },
			{ square: 'b1', type: 'n', color: 'w' },
			{ square: 'c1', type: 'b', color: 'w' },
			{ square: 'd1', type: 'q', color: 'w' },
			{ square: 'e1', type: 'k', color: 'w' },
			{ square: 'f1', type: 'b', color: 'w' },
			{ square: 'g1', type: 'n', color: 'w' },
			{ square: 'h1', type: 'r', color: 'w' }
		] );
	} );
} );

describe("game end", () => {
	test("game ends after repetition", () => {
		api.move('e4');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('e5');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Nf3');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Nf6');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Ng1');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Ng8');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Nf3');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Nf6');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('Ng1');
		expect( api.isGameOver() ).toBeFalsy();
		expect( api.possibleMovesDests() ).not.toEqual( new Map() );
		api.move('Ng8');
		expect( api.isGameOver() ).toBeTruthy();
		expect( () => api.move('Nf3') ).toThrowError();
		expect( api.isGameOver() ).toBeTruthy();
		expect( api.possibleMovesDests() ).toEqual( new Map() );
	} );
	test("game ends after checkmate", () => {
		api.move('f4');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('e6');
		expect( api.isGameOver() ).toBeFalsy();
		api.move('g4');
		expect( api.isGameOver() ).toBeFalsy();
		expect( api.possibleMovesDests() ).not.toEqual( new Map( ));
		api.move('Qh4');
		expect( api.isGameOver() ).toBeTruthy();
		expect( api.possibleMovesDests() ).toEqual( new Map( ));
	} );
} );

describe("start from FEN", () => {
	test( "start from FEN", () => {
		api = new Api( new Chessground(), 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6' );
		expect( api.moveNumber() ).toEqual(6);
		expect( api.turn() ).toEqual('b');
		expect( () => api.move('d6') ).toThrowError();
		api.move('Ng4');
	} );
} );

test.todo( 'stateChangeCallback is called' );
test.todo( 'promotionCallback is called' );
test.todo( 'moveCallback is called' );
test.todo( 'gameOverCallback is called' );
