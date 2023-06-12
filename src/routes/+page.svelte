<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	import type { Api } from '$lib/api.js'; // TODO should be imported via Chess.svelte?

	let api: Api | undefined;
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:api={api} />
	<button on:click={()=>api?.resetBoard()}>Reset board</button>
	<button on:click={()=>api?.undoLastMove()}>Undo</button>
	<button on:click={()=>api?.toggleOrientation()}>Flip board</button>
</div>

<style>
	button {
		margin-top:16px;
	}
</style>
