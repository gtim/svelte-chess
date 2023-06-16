<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	let chess: Chess;
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:this={chess} />
	<button on:click={()=>chess?.reset()}>Reset board</button>
	<button on:click={()=>chess?.undo()}>Undo</button>
	<button on:click={()=>chess?.toggleOrientation()}>Flip board</button>
</div>

<style>
	button {
		margin-top:16px;
	}
</style>
