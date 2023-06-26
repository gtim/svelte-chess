<script lang="ts">
	import Chess, { type MoveEvent, type GameOverEvent } from '$lib/Chess.svelte';
	import { flip } from 'svelte/animate' ;
	import { fade } from 'svelte/transition';

	let messages: {title:string, details:string}[] = [];
	function moveHandler( event: MoveEvent ) {
		messages.unshift( {
			title: "MoveEvent: " + event.detail.san,
			details: JSON.stringify(event.detail, null, 2)
		} );
		messages = messages;
	}
	function gameOverHandler( event: GameOverEvent ) {
		messages.unshift( {
			title: "GameOverEvent: " + event.detail.reason,
			details: JSON.stringify(event.detail, null, 2)
		} );
		messages = messages;
	}
	function readyHandler( event: CustomEvent<{}> ) {
		messages.unshift( {
			title: "Ready Event",
			details: ""
		} );
		messages = messages;
	}
</script>

<div style="max-width:512px;margin:0 auto;">
	<p>This example listens for <code>move</code> and <code>gameOver</code> events.</p>
	<Chess on:move={moveHandler} on:gameOver={gameOverHandler} on:ready={readyHandler} />
</div>
	<div class="messages">
		{#each messages as message (message.details)}
			<div animate:flip in:fade title="{message.details}">
				{message.title}
			</div>
		{/each}
	</div>

<style>
	div.messages {
		margin-top:16px;
		display:flex;
		flex-wrap:wrap;
		gap:8px;
		justify-content:center;
	}
	div.messages div {
		padding:8px 12px;
		border-radius:8px;
		background-color: #f0d9b5;
	}
</style>
