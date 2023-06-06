<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import { Chess as ChessJS, SQUARES } from 'chess.js';

	const chessJS = new ChessJS();

	// Find all legal moves
	function possibleMoves(chess: ChessJS) {
		const dests = new Map();
		SQUARES.forEach(s => {
			const ms = chess.moves({square: s, verbose: true});
			if (ms.length) dests.set(s, ms.map(m => m.to));
		});
		return dests;
	}
	export function getPossibleMoves() {
		return possibleMoves(chessJS);
	}
</script>

<Chessground/>
