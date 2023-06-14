<script lang="ts" context="module">
	export type GameOverEvent = CustomEvent<GameOver>;
	export type MoveEvent = CustomEvent<Move>;
	export type { Api, Square, PieceSymbol, Move, Gameover };
</script>
<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import PromotionDialog from '$lib/PromotionDialog.svelte';
	import { Api, type Square, type PieceSymbol, type Move, type GameOver } from '$lib/api.js';

	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ move: Move, gameOver: GameOver }>();

	let chessground: Chessground;
	let container: HTMLElement;

	// bindable read-only props
	export let api: Api | undefined = undefined;
	export let moveNumber: number = 0;
	export let turn = 'w';
	export let history: string[] = [];

	// Initial FEN; also bindable
	export let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	function stateChangeCallback(api: Api) {
		fen = api.fen();
		moveNumber = api.moveNumber();
		turn = api.turn();
		history = api.history();
	}

	function promotionCallback( square: Square ): Promise<PieceSymbol> {
		return new Promise((resolve, reject) => {
			const element = new PromotionDialog({
				target: container,
				props: { 
					square,
					callback: (piece: PieceSymbol) => {
						element.$destroy();
						resolve( piece );
					}
				},
			});
		});
	}

	function moveCallback( move: Move ) {
		dispatch( 'move', move );
	}
	function gameOverCallback( gameOver: GameOver ) {
		dispatch( 'gameOver', gameOver );
	}

	onMount( () => {
		api = new Api( chessground, fen, stateChangeCallback, promotionCallback, moveCallback, gameOverCallback );
	} );
	
</script>

<div style="position:relative;" bind:this={container}>
	<Chessground bind:this={chessground}/>
</div>

