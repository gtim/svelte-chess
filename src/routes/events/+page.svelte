<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	import type { Move } from '$lib/api.js';
	import { flip } from 'svelte/animate' ;
	import { fade } from 'svelte/transition';

	let messages = [];

	function moveHandler( event: CustomEvent<Move> ) {
		messages.unshift( {
			title: "Move: " + event.detail.san,
			details: JSON.stringify(event.detail, null, 2)
		} );
		messages = messages;
	}
</script>

<div style="max-width:512px;margin:0 auto;">
	<p>This example listens for <code>move</code> and <code>end</code> events.</p>
	<Chess on:move={moveHandler}/>
	<div class="messages">
		{#each messages as message (message.details)}
			<div animate:flip in:fade title="{message.details}">
				{message.title}
			</div>
		{/each}
	</div>
</div>

<style>
	div.messages {
		margin-top:16px;
		display:flex;
		flex-wrap:wrap;
		gap:8px;
	}
	div.messages div {
		padding:8px 12px;
		border-radius:8px;
		background-color: #f0d9b5;
	}
</style>
