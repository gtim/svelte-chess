<script lang="ts">
	import Chess, { Engine } from '$lib/Chess.svelte';
	// Note: stockfish.js must be manually downloaded (see Readme)
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess engine={new Engine({depth: 20, moveTime: 1500, color: 'b'})} />
</div>
