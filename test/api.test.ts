import {describe, expect} from 'vitest';
import { Api } from '../src/lib/api.js';
import { Chessground } from 'svelte-chessground';

// Mock svelte-chessground: no need to mount components for these tests
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
