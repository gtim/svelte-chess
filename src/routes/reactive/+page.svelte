<script lang="ts">
	import Chess, { type Color } from '$lib/Chess.svelte';
	let fen:string, moveNumber:number, turn:Color, history:string[], inCheck:boolean;
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:fen bind:moveNumber bind:turn bind:history bind:inCheck />
</div>

{#if inCheck}
	<p>Check!</p>
{/if}
<p>Move {moveNumber}, {turn == 'w' ? 'White' : 'Black'} to move.</p>
{#if history?.length > 0}
	<p>Moves: {history.join(' ')}</p>
{/if}
<p style="white-space:nowrap;">FEN: {fen}</p>

<style>
	div, p {
		max-width:512px;
		margin:8px auto;
	}
</style>
