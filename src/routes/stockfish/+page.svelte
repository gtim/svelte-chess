<script lang="ts">
	import Chess, { Engine, type UciEvent } from '$lib/Chess.svelte';
	let chess: Chess;

	// Note: stockfish.js must be manually downloaded (see Readme)
	const engine = new Engine({
		depth: 20,
		moveTime: 500,
		color: 'w'
	});

	// Output all UCI messages
	let uciMessages: { text: string, type: string }[] = [];
	function handleUci( event: UciEvent ) {
		uciMessages = [ {
			text: event.detail,
			type: event.detail.split(' ')[0],
		}, ...uciMessages ];
	}
</script>

<div class="container">
	<div class="board">
		<Chess bind:this={chess} orientation="b" on:uci={handleUci} {engine} />
		<button on:click={()=>chess?.playEngineMove()}>Play engine move</button>
	</div>
	<div class="uci">
		<div class="header">UCI messages from Stockfish</div>
		{#each uciMessages as message}
			<div class="message {message.type}">{message.text}</div>
		{/each}
	</div>
</div>

<style>
	.container {
		display:flex;
		height:100vh;
	}
	.board {
		width:450px;
		max-width:100%;
		padding:16px;
		flex-shrink:0;
	}
	.uci {
		flex-grow:1;
		overflow-y:scroll;
		overflow-x:scroll;
		height:100%;
		min-width:100px;
	}
	.uci .header {
		margin-top:16px;
		margin-bottom:8px;
		font-weight:bold;
	}
	.uci .message {
		white-space: nowrap;
		margin-left:2px;
		margin-bottom:2px;
	}

	.uci .message.bestmove  { color: hsla(25, 94%, 41%, 1); font-weight: bold; }
	.uci .message.uciok     { color: hsla(128,94%, 31%, 1); font-weight: bold; }
	.uci .message.Stockfish { color: hsla(286,94%, 41%, 1); }
	.uci .message.info,
	.uci .message.option    { color: hsla(25,  0%, 41%, 1); }

	button {
		margin-top:16px;
	}
	:global(body, html) {
		margin:0;
		padding:0;
	}

	@media only screen and (max-width: 450px) {
		.container {
			flex-direction:column;
		}
		.board {
			padding:0;
		}
		button {
			margin:0;
		}
	}
</style>
