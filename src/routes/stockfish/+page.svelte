<script lang="ts">
	import Chess from '$lib/Chess.svelte';
	import { onMount } from 'svelte';
	import { Engine } from '$lib/engine.js';
</script>

<div style="max-width:512px;margin:0 auto;">
	<Chess engine={new Engine({depth: 20, moveTime: 1500})} />
</div>
