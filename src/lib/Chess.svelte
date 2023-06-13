<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import PromotionDialog from '$lib/PromotionDialog.svelte';
	import { Api } from '$lib/api.js';
	import type { Square, PieceSymbol, Move } from '$lib/api.js';

	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{move:Move}>();

	let chessground: Chessground;
	let container: HTMLElement;

	// bindable read-only props
	export let api: Api | undefined = undefined;
	export let moveNumber: number = 0;
	export let turnColor = 'w';
	export let history: string[] = [];

	// Initial FEN; also bindable
	export let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	function stateChangeCallback(api: Api) {
		fen = api.getFen();
		moveNumber = api.getMoveNumber();
		turnColor = api.getTurnColor();
		history = api.getHistory();
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

	onMount( () => {
		api = new Api( chessground, fen, stateChangeCallback, promotionCallback, moveCallback );
	} );
	
</script>

<div style="position:relative;" bind:this={container}>
	<Chessground bind:this={chessground}/>
</div>

