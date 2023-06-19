import PromotionDialog from '../src/lib/PromotionDialog.svelte';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

describe("PromotionDialog Component", () => {

	test("all four piece options displayed", () => {
		render( PromotionDialog, {
			square: 'a1',
			callback: (piece: PieceSymbol) => {},
		});
		const queen  = screen.getByRole( 'button', { name: /queen/ } );
		const knight = screen.getByRole( 'button', { name: /knight/ } );
		const rook   = screen.getByRole( 'button', { name: /rook/ } );
		const bishop = screen.getByRole( 'button', { name: /bishop/ } );
		expect(  queen.className.split(' ') ).toContain( 'q' );
		expect( knight.className.split(' ') ).toContain( 'n' );
		expect(   rook.className.split(' ') ).toContain( 'r' );
		expect( bishop.className.split(' ') ).toContain( 'b' );
		expect(  queen.className.split(' ') ).toContain( 'piece' );
		expect( knight.className.split(' ') ).toContain( 'piece' );
		expect(   rook.className.split(' ') ).toContain( 'piece' );
		expect( bishop.className.split(' ') ).toContain( 'piece' );
	});

	test("1st rank promotion shows black pieces", () => {
		render( PromotionDialog, {
			square: 'a1',
			callback: (piece: PieceSymbol) => {},
		});
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'black' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'black' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'black' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'black' );
	});

	test("8th rank promotion shows white pieces", () => {
		render( PromotionDialog, {
			square: 'a8',
			callback: (piece: PieceSymbol) => {},
		});
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'white' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'white' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'white' );
		expect( screen.getByRole( 'button', { name: /queen/ } ).className.split(' ') ).toContain( 'white' );
	});

	test.each([
		{ piece: 'queen',  symbol: 'q' },
		{ piece: 'knight', symbol: 'n' },
		{ piece: 'rook',   symbol: 'r' },
		{ piece: 'bishop', symbol: 'b' },
	])( 'clicking $piece calls back with $symbol', async ({piece,symbol}) => {
			const callback = vi.fn();
			render( PromotionDialog, {
				square: 'a1',
				callback
			});
			const button = screen.getByRole( 'button', { name: new RegExp(piece) } );
			fireEvent.click( button );
			await waitFor( () => expect(callback).toHaveBeenLastCalledWith(symbol) );
	});

});

describe("button positions", () => {

	// Tests marginTop and marginLeft on specific elements.
	// Would preferably test div screen position directly.

	test.each([
		{ square: 'c8', orientation: 'w', marginLeft: '25%',   marginsTop: ['0%','12.5%','25%','37.5%'] },
		{ square: 'c1', orientation: 'w', marginLeft: '25%',   marginsTop: ['87.5%','75%','62.5%','50%'] },
		{ square: 'c8', orientation: 'b', marginLeft: '62.5%', marginsTop: ['87.5%','75%','62.5%','50%'] },
		{ square: 'c1', orientation: 'b', marginLeft: '62.5%', marginsTop: ['0%','12.5%','25%','37.5%'] },
		{ square: 'h8', orientation: 'w', marginLeft: '87.5%', marginsTop: ['0%','12.5%','25%','37.5%'] },
		{ square: 'h1', orientation: 'w', marginLeft: '87.5%', marginsTop: ['87.5%','75%','62.5%','50%'] },
		{ square: 'h8', orientation: 'b', marginLeft: '0%',    marginsTop: ['87.5%','75%','62.5%','50%'] },
		{ square: 'h1', orientation: 'b', marginLeft: '0%',    marginsTop: ['0%','12.5%','25%','37.5%'] },
	])( 'button positions for promotion $square, $orientation orientation', async ({square,orientation,marginLeft,marginsTop}) => {
		render( PromotionDialog, {
			square,
			orientation,
			callback: (piece: PieceSymbol) => {},
		});
		const queenStyle  = screen.getByRole( 'button', { name: /queen/  } ).parentElement.style;
		const knightStyle = screen.getByRole( 'button', { name: /knight/ } ).parentElement.style;
		const rookStyle   = screen.getByRole( 'button', { name: /rook/   } ).parentElement.style;
		const bishopStyle = screen.getByRole( 'button', { name: /bishop/ } ).parentElement.style;
		expect(  queenStyle.marginTop ).toEqual( marginsTop[0] );
		expect( knightStyle.marginTop ).toEqual( marginsTop[1] );
		expect(   rookStyle.marginTop ).toEqual( marginsTop[2] );
		expect( bishopStyle.marginTop ).toEqual( marginsTop[3] );
		expect(  queenStyle.marginLeft ).toEqual( marginLeft );
		expect( knightStyle.marginLeft ).toEqual( marginLeft );
		expect(   rookStyle.marginLeft ).toEqual( marginLeft );
		expect( bishopStyle.marginLeft ).toEqual( marginLeft );
	} );
});
