import {describe, expect, it} from 'vitest';
import Chess from '../src/lib/Chess.svelte';

describe("getPossibleMoves", () => {
	let host = null;
	beforeEach(() => {
		host = document.createElement('div');
		document.body.append(host);
	} );

	it("should find correct moves from initial position", () => {
		const chess = new Chess({ target: host});
		expect(chess.getPossibleMoves()).toEqual(
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
	})
})
