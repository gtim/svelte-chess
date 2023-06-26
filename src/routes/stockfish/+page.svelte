<script lang="ts">
	import Chess, { Engine } from '$lib/Chess.svelte';
	// Note: stockfish.js must be manually downloaded (see Readme)
	let chess: Chess;
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:this={chess} orientation="b" engine={new Engine({depth: 20, moveTime: 1500, color: 'none'})} />
	<button on:click={()=>chess?.playEngineMove()}>Engine move</button>
</div>

<style>
	button {
		margin-top:16px;
	}
</style>
