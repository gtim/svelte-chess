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
		expect( api.move('e4') ).toBeTruthy();
		expect( api.move('e5') ).toBeTruthy();
		expect( api.move('Nf3') ).toBeTruthy();
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2' );
	});
	test("1. d5 is illegal", () => {
		expect( api.move('d5') ).toBeFalsy();
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
		api.move('e4');
		api.move('e5');
		api.move('Bc4');
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2' );
		api.undo();
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' );
		expect( api.move('Qh5') ).toBeTruthy();
		expect( api.fen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2' );
		api.undo();
		api.undo();
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
			}
		] );
		api.move('a6');
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
		});
		api.reset();
		expect( api.history({verbose:true}) ).toEqual( [] );
	} );
} );

describe("start from FEN", () => {
	test( "start from FEN", () => {
		api = new Api( new Chessground(), 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N1B3/PPP2PPP/R2QKB1R b KQkq - 1 6' );
		expect( api.moveNumber() ).toEqual(6);
		expect( api.turn() ).toEqual('b');
		expect( api.move('d6') ).toBeFalsy();
		expect( api.move('Ng4') ).toBeTruthy();
	} );
} );
