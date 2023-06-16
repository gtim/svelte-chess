<script lang="ts" context="module">
	export type GameOverEvent = CustomEvent<GameOver>;
	export type MoveEvent = CustomEvent<Move>;
	export type { Square, PieceSymbol, Move, GameOver };
</script>
<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import PromotionDialog from '$lib/PromotionDialog.svelte';
	import { Api, type Square, type PieceSymbol, type Move, type GameOver } from '$lib/api.js';

	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ move: Move, gameOver: GameOver }>();

	let chessground: Chessground;
	let container: HTMLElement;

	/*
	 * Props
	 */

	// bindable read-only props
	export let moveNumber: number = 0;
	export let turn = 'w';
	export let history: string[] = [];
	export let isGameOver: boolean = false;

	// Initial FEN; also bindable
	export let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

	// non-bindable
	export let className: string | undefined = undefined;

	// API: only accessible through props and methods
	let api: Api | undefined = undefined;

	/*
	 * Methods -- passed to API
	 */

	export function load(newFen: string) {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		api.load( newFen );
	}
	export function move(moveSan: string) {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		api.move(moveSan);
	}
	export function getHistory(): string[]
	export function getHistory({ verbose }: { verbose: true }): Move[]
	export function getHistory({ verbose }: { verbose: false }): string[]
	export function getHistory({ verbose }: { verbose: boolean }): string[] | Move[]
	export function getHistory({ verbose = false }: { verbose?: boolean } = {}) {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		return api.history({verbose});
	}
	export function getBoard() {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		return api.board();
	}
	export function undo(): Move | null {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		return api.undo();
	}
	export function reset(): void {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		api.reset();
	}
	export function toggleOrientation(): void {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		api.toggleOrientation();
	}

	/*
	 * API Construction
	 */

	function stateChangeCallback(api: Api) {
		fen = api.fen();
		moveNumber = api.moveNumber();
		turn = api.turn();
		history = api.history();
		isGameOver = api.isGameOver();
	}

	function promotionCallback( square: Square ): Promise<PieceSymbol> {
		return new Promise((resolve, reject) => {
			const element = new PromotionDialog({
				target: container,
				props: { 
					square,
					callback: (piece: PieceSymbol) => {
						element.$destroy();
						resolve( piece );
					}
				},
			});
		});
	}

	function moveCallback( move: Move ) {
		dispatch( 'move', move );
	}
	function gameOverCallback( gameOver: GameOver ) {
		dispatch( 'gameOver', gameOver );
	}

	onMount( () => {
		api = new Api( chessground, fen, stateChangeCallback, promotionCallback, moveCallback, gameOverCallback );
	} );
	
</script>

<div style="position:relative;" bind:this={container}>
	<Chessground bind:this={chessground} {className}/>
</div>

