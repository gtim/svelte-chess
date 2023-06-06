<script lang="ts">
	import Chess from '$lib/Chess.svelte';

	import { onMount } from 'svelte';

	let chess:Chess;

	onMount( () => {
		console.log(chess.getPossibleMoves());
	} );
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:this={chess}/>
</div>
