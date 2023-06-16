<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	let chess: Chess;

	const fens = [
		'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		'r3k1nr/p2p1ppp/3B4/1pbN1N1P/4P1P1/3P1Q2/PqP5/R4KR1 b kq - 1 18',
		'r1b1kbnr/pppp1Npp/8/8/2Bnq3/8/PPPP1P1P/RNBQKR2 w Qkq - 0 7',
		'r1b1kbnr/pppp1ppp/8/4p1B1/3nP3/2N3P1/PPP1NP1P/R2QKB1R b KQkq - 0 6',
		'5K2/k7/4P1p1/8/8/8/4b3/8 w - - 0 1',
		'7k/5K2/7P/6pP/8/8/8/8 w - - 0 1'
	];
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess bind:this={chess}/>
	{#each fens as fen, i}
		<button on:click={()=>{chess.load(fen)}}>{i}</button>
	{/each}
</div>



<style>
	button {
		margin:8px;
	}
</style>
