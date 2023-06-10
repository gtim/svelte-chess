<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Api } from '$lib/api.js';

	import { onMount } from 'svelte';

	let chessground: Chessground;
	export let api: Api;

	export let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	onMount( () => {
		api = new Api( chessground, fen );
	} );
	
</script>

<Chessground bind:this={chessground}/>
