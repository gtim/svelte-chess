<script lang="ts">
	import Chess, { type Api } from '$lib/Chess.svelte';

	let api: Api | undefined;
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:api={api} />
	<button on:click={()=>api?.reset()}>Reset board</button>
	<button on:click={()=>api?.undo()}>Undo</button>
	<button on:click={()=>api?.toggleOrientation()}>Flip board</button>
</div>

<style>
	button {
		margin-top:16px;
	}
</style>
