<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	import type { Api } from '$lib/api.js'; // TODO should be imported via Chess.svelte?

	import { onMount } from 'svelte';

	let api: Api;

	onMount( () => {
		api.move('e4');
	} );
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:api={api}/>
	<button on:click={()=>api.resetBoard()}>Reset board</button>
	<button on:click={()=>api.undoLastMove()}>Undo last move</button>
</div>

<style>
	button {
		margin-top:16px;
	}
</style>
