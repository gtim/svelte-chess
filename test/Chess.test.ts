import Chess from '../src/lib/Chess.svelte';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';

describe("Chess Component basic usage", () => {

	test("Play a simple game", async () => {
		const { component } = render( Chess );
		component.move( 'e4' );
		component.move( 'e5' );
		component.move( 'Bc4' );
		component.move( 'Nc6' );
		component.move( 'Qh5' );
		component.move( 'Nf6' );
		component.move( 'Qxf7' );
	});
});

test.todo( 'each bindable prop (moveNumber, turn, inCheck, history, isGameOver)' );
test.todo( 'class prop' );
test.todo( 'initial board orientation' );
test.todo( 'initial FEN' );
test.todo( 'promotion' );
test.todo( 'en passant' );
test.todo( 'events emitted: move, checkmate' );
test.todo( 'load()' );
test.todo( 'getHistory()' );
test.todo( 'getBoard()' );
test.todo( 'undo()' );
test.todo( 'reset()' );
test.todo( 'toggleOrientation()' );
test.todo( 'game ends on checkmate' );
test.todo( 'game ends on various draw conditions' );
test.todo( 'board displayed on screen' );
test.todo( 'pieces displayed on screen' );
test.todo( 'promotion dialog displayed on screen' );
test.todo( 'non-programmatic moves (click board)' );
test.todo( 'class attribute applies style ' );
test.todo( 'dispatches move event' );
test.todo( 'dispatches gameOver event' );
