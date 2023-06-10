<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Api } from '$lib/api.js';

	import { onMount } from 'svelte';

	let chessground: Chessground;

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

	onMount( () => {
		api = new Api( chessground, fen, stateChangeCallback );
	} );
	
</script>

<Chessground bind:this={chessground}/>
