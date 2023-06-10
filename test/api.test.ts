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

describe("getPossibleMoves", () => {
	test("correct moves from initial position", () => {
		expect(api.getPossibleMoves()).toEqual(
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
		expect( api.getFen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2' );
	});
	test("1. d5 is illegal", () => {
		expect( api.move('d5') ).toBeFalsy();
	});
});

describe("board manipulation", () => {
	test("reset board", () => {
		const initialFen = api.getFen();
		api.resetBoard();
		expect( api.getFen() ).toEqual( initialFen );
		api.move('e4');
		expect( api.getFen() ).not.toEqual( initialFen );
		api.resetBoard();
		expect( api.getFen() ).toEqual( initialFen );
	} );
	test("undo last move", () => {
		api.move('e4');
		api.move('e5');
		api.move('Bc4');
		expect( api.getFen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2' );
		api.undoLastMove();
		expect( api.getFen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2' );
		expect( api.move('Qh5') ).toBeTruthy();
		expect( api.getFen() ).toEqual( 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2' );
		api.undoLastMove();
		api.undoLastMove();
		expect( api.getFen() ).toEqual( 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1' );
	} );
});

describe("turn color", () => {
	test("turn color", () => {
		expect( api.getTurnColor() ).toEqual( 'w' );
		api.move('e4');
		expect( api.getTurnColor() ).toEqual( 'b' );
		api.move('e5');
		expect( api.getTurnColor() ).toEqual( 'w' );
		api.move('Bc4');
		expect( api.getTurnColor() ).toEqual( 'b' );
		api.move('d6');
		expect( api.getTurnColor() ).toEqual( 'w' );
		api.undoLastMove();
		expect( api.getTurnColor() ).toEqual( 'b' );
		api.resetBoard();
		expect( api.getTurnColor() ).toEqual( 'w' );
	} );
} );
