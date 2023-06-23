<script lang="ts" context="module">
	export type GameOverEvent = CustomEvent<GameOver>;
	export type MoveEvent = CustomEvent<Move>;
	export type { Square, Color, PieceSymbol, Move, GameOver };
	export { Engine } from '$lib/engine.js';
</script>
<script lang="ts">
	import { Chessground } from 'svelte-chessground';
	import PromotionDialog from '$lib/PromotionDialog.svelte';
	import { Api, type Square, type Color, type PieceSymbol, type Move, type GameOver } from '$lib/api.js';
	import type { Engine } from '$lib/engine.js';

	import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ move: Move, gameOver: GameOver }>();

	let chessground: Chessground;
	let container: HTMLElement;

	/*
	 * Props
	 */

	// bindable read-only props
	export let moveNumber = 0;
	export let turn: Color = 'w';
	export let inCheck = false;
	export let history: string[] = [];
	export let isGameOver = false;

	// Initial values used, also bindable
	export let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	export let orientation: Color = 'w';

	// non-bindable
	export let engine: Engine | undefined = undefined;
	let className: string | undefined = undefined;
	export { className as class };

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
	export function playEngineMove(): void {
		if ( ! api ) throw new Error( 'component not mounted yet' );
		api.playEngineMove();
	}

	/*
	 * API Construction
	 */

	function stateChangeCallback(api: Api) {
		fen = api.fen();
		orientation = api.orientation();
		moveNumber = api.moveNumber();
		turn = api.turn();
		inCheck = api.inCheck();
		history = api.history();
		isGameOver = api.isGameOver();
	}

	function promotionCallback( square: Square ): Promise<PieceSymbol> {
		return new Promise((resolve) => {
			const element = new PromotionDialog({
				target: container,
				props: { 
					square,
					orientation,
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

	onMount( async () => {
		api = new Api( chessground, fen, stateChangeCallback, promotionCallback, moveCallback, gameOverCallback, orientation, engine );
		await api.init();
	} );
	
</script>

<div style="position:relative;" bind:this={container}>
	<Chessground bind:this={chessground} {className}/>
</div>

