<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	import { onMount } from 'svelte';
	let chess: Chess;
	onMount( () => {
		chess.toggleOrientation();
	} );
</script>

<div class="boards">
	<div class="board">
		<Chess />
	</div>
	<div class="board">
		<Chess fen="rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2K1PP/RN1Q1BnR w kq - 0 8" bind:this={chess}/>
	</div>
</div>



<style>
	div.boards {
		display:flex;
		gap:32px;
		margin:32px;
	}
	div.board {
		width:500px;
	}
</style>
