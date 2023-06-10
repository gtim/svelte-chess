<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Api } from '$lib/api.js';

	import { onMount } from 'svelte';

	let chessground: Chessground;
	export let api: Api;

	onMount( () => {
		api = new Api( chessground );
	} );
	
</script>

<Chessground bind:this={chessground}/>
