// TODO:
//   don't allow UI interaction until engine loaded? 
//   make move() etc disable engine if it was currently searching for a move?
//   allow color='none' (interaction through playEngineMove())
//   UCI isready after initialization and move
//   on:uci to forward all uci messages
//   bug: wrong king is hilighted when engine checks
//   default opening book
import type { Color } from '$lib/api.js';

export interface EngineOptions {
	//skill?: number, // 1-20
	moveTime?: number, // Maximum time in ms to spend on a move
	depth?: number, // Maximum depth to search per move
	color?: Color | 'both' | 'none',
};

enum State {
	Uninitialised = 'uninitialised',
	Initialising = 'initialising',
	Waiting = 'waiting',
	FindingMove = 'finding move',
};

export class Engine {
	private stockfish: Worker | undefined;
	private state = State.Uninitialised;
	private moveTime: number;
	private depth: number;
	private color: Color | 'both' | 'none';
	// Callbacks used when waiting for specific UCI messages
	private onUciOk: ( () => void ) | undefined = undefined; // "uciok" marks end of initialisation
	private onBestMove: ( (uci:string) => void ) | undefined = undefined; // "uciok", used during initialisation
	// Constructor
	constructor( options: EngineOptions = {} ) {
		this.moveTime = options.moveTime || 2000;
		this.depth = options.depth || 40;
		this.color = options.color || 'b';
	}

	// Initialise Stockfish. Resolve promise after receiving uciok.
	init(): Promise<void> {
		return new Promise((resolve) => {
			this.state = State.Initialising;
			// NOTE: stockfish.js is not part of the npm package due to its size (1-2 MB).
			// You can find the file here: https://github.com/gtim/svelte-chess/tree/main/static
			this.stockfish = new Worker('stockfish.js');
			this.stockfish.addEventListener('message', (e)=>this._onUci(e) );
			this.onUciOk = () => {
				if ( this.state === State.Initialising ) {
					this.state = State.Waiting;
					this.onUciOk = undefined;
					resolve();
				}
			};
			this.stockfish.postMessage('uci');
		});
	}

	// Callback when receiving UCI messages from Stockfish.
	private _onUci( { data }: { data: string } ): void {
		const uci = data;
		console.log('UCI: ' + uci);
		if ( this.onUciOk && uci === 'uciok' ) {
			this.onUciOk();
		}
		if ( this.onBestMove && uci.slice(0,8) === 'bestmove' ) {
			this.onBestMove( uci );
		}
	}

	getMove( fen: string ): Promise<string> {
		return new Promise((resolve) => {
			if ( ! this.stockfish )
				throw new Error('Engine not initialised');
			if ( this.state !== State.Waiting )
				throw new Error('Engine not ready (state: ' + this.state);
			this.state = State.FindingMove;
			this.stockfish.postMessage('position fen ' + fen);
			this.stockfish.postMessage(`go depth ${this.depth} movetime ${this.moveTime}`);
			this.onBestMove = ( uci: string ) => {
				const uciArray = uci.split(' ');
				const bestMoveLan = uciArray[1];
				this.state = State.Waiting;
				this.onBestMove = undefined;
				resolve( bestMoveLan );
			};
		});
	}

	getColor() {
		return this.color;
	}

}
