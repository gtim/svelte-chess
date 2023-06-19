import PromotionDialog from '../src/lib/PromotionDialog.svelte';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

describe("PromotionDialog Component", () => {

	test("all four piece options show up", () => {
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

	const piecesWithSymbols = [
		[ 'queen',  'q' ],
		[ 'knight', 'n' ],
		[ 'rook',   'r' ],
		[ 'bishop', 'b' ],
	];
	for ( const [ piece, symbol ] of piecesWithSymbols ) {
		test(`clicking ${piece} calls back with ${symbol}`, async () => {
			const callback = vi.fn();//(piece: PieceSymbol) => {};
			render( PromotionDialog, {
				square: 'a1',
				callback
			});
			const button = screen.getByRole( 'button', { name: new RegExp(piece) } );
			fireEvent.click( button );
			await waitFor( () => expect(callback).toHaveBeenLastCalledWith(symbol) );
		});
	}

});

describe("button positions", () => {

	// Tests marginTop and marginLeft on specific elements.
	// Would preferably test div screen position directly.

	test( 'button positions for white pawn', async () => {
		render( PromotionDialog, {
			square: 'c8',
			orientation: 'w',
			callback: (piece: PieceSymbol) => {},
		});
		const queenStyle  = screen.getByRole( 'button', { name: /queen/  } ).parentElement.style;
		const knightStyle = screen.getByRole( 'button', { name: /knight/ } ).parentElement.style;
		const rookStyle   = screen.getByRole( 'button', { name: /rook/   } ).parentElement.style;
		const bishopStyle = screen.getByRole( 'button', { name: /bishop/ } ).parentElement.style;
		expect(  queenStyle.marginTop ).toEqual( '0%' );
		expect( knightStyle.marginTop ).toEqual( '12.5%' );
		expect(   rookStyle.marginTop ).toEqual( '25%' );
		expect( bishopStyle.marginTop ).toEqual( '37.5%' );
		expect(  queenStyle.marginLeft ).toEqual( '25%' );
		expect( knightStyle.marginLeft ).toEqual( '25%' );
		expect(   rookStyle.marginLeft ).toEqual( '25%' );
		expect( bishopStyle.marginLeft ).toEqual( '25%' );
	} );
	test( 'button positions for black pawn', async () => {
		render( PromotionDialog, {
			square: 'c1',
			orientation: 'w',
			callback: (piece: PieceSymbol) => {},
		});
		const queenStyle  = screen.getByRole( 'button', { name: /queen/  } ).parentElement.style;
		const knightStyle = screen.getByRole( 'button', { name: /knight/ } ).parentElement.style;
		const rookStyle   = screen.getByRole( 'button', { name: /rook/   } ).parentElement.style;
		const bishopStyle = screen.getByRole( 'button', { name: /bishop/ } ).parentElement.style;
		expect(  queenStyle.marginTop ).toEqual( '87.5%' );
		expect( knightStyle.marginTop ).toEqual( '75%' );
		expect(   rookStyle.marginTop ).toEqual( '62.5%' );
		expect( bishopStyle.marginTop ).toEqual( '50%' );
		expect(  queenStyle.marginLeft ).toEqual( '25%' );
		expect( knightStyle.marginLeft ).toEqual( '25%' );
		expect(   rookStyle.marginLeft ).toEqual( '25%' );
		expect( bishopStyle.marginLeft ).toEqual( '25%' );
	} );
	test( 'button positions for white pawn, flipped board', async () => {
		render( PromotionDialog, {
			square: 'c8',
			orientation: 'b',
			callback: (piece: PieceSymbol) => {},
		});
		const queenStyle  = screen.getByRole( 'button', { name: /queen/  } ).parentElement.style;
		const knightStyle = screen.getByRole( 'button', { name: /knight/ } ).parentElement.style;
		const rookStyle   = screen.getByRole( 'button', { name: /rook/   } ).parentElement.style;
		const bishopStyle = screen.getByRole( 'button', { name: /bishop/ } ).parentElement.style;
		expect(  queenStyle.marginTop ).toEqual( '87.5%' );
		expect( knightStyle.marginTop ).toEqual( '75%' );
		expect(   rookStyle.marginTop ).toEqual( '62.5%' );
		expect( bishopStyle.marginTop ).toEqual( '50%' );
		expect(  queenStyle.marginLeft ).toEqual( '62.5%' );
		expect( knightStyle.marginLeft ).toEqual( '62.5%' );
		expect(   rookStyle.marginLeft ).toEqual( '62.5%' );
		expect( bishopStyle.marginLeft ).toEqual( '62.5%' );
	} );
	test( 'button positions for black pawn, flipped board', async () => {
		render( PromotionDialog, {
			square: 'c1',
			orientation: 'b',
			callback: (piece: PieceSymbol) => {},
		});
		const queenStyle  = screen.getByRole( 'button', { name: /queen/  } ).parentElement.style;
		const knightStyle = screen.getByRole( 'button', { name: /knight/ } ).parentElement.style;
		const rookStyle   = screen.getByRole( 'button', { name: /rook/   } ).parentElement.style;
		const bishopStyle = screen.getByRole( 'button', { name: /bishop/ } ).parentElement.style;
		expect(  queenStyle.marginTop ).toEqual( '0%' );
		expect( knightStyle.marginTop ).toEqual( '12.5%' );
		expect(   rookStyle.marginTop ).toEqual( '25%' );
		expect( bishopStyle.marginTop ).toEqual( '37.5%' );
		expect(  queenStyle.marginLeft ).toEqual( '62.5%' );
		expect( knightStyle.marginLeft ).toEqual( '62.5%' );
		expect(   rookStyle.marginLeft ).toEqual( '62.5%' );
		expect( bishopStyle.marginLeft ).toEqual( '62.5%' );
	} );

});
