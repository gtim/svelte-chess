export interface EngineOptions {
	//skill?: number, // 1-20
	moveTime?: number, // Maximum time in ms to spend on a move
	depth?: number, // Maximum depth to search per move
};

enum State {
	Uninitialised,
	Initialising,
	Initialised,
};

export class Engine {
	private moveTime: number;
	private depth: number;
	private stockfish: Worker | undefined;
	private state = State.Uninitialised;
	private onUciOk: ( () => void ) | undefined = undefined; // callback on receiving "uciok", used during initialisation
	constructor( options: EngineOptions = {} ) {
		this.moveTime = options.moveTime || 2000;
		this.depth = options.depth || 40;
	}

	// Initialise Stockfish. Resolve promise after receiving uciok.
	init(): Promise<void> {
		return new Promise((resolve) => {
			this.state = State.Initialising;
			// NOTE: stockfish.js is not part of the npm package due to its size (1-2 MB).
			// You can find the file here: https://github.com/gtim/svelte-chess/tree/main/static
			this.stockfish = new Worker('stockfish.js');
			this.stockfish.addEventListener('message', (e)=>this.onUci(e) );
			this.onUciOk = () => {
				if ( this.state === State.Initialising ) {
					this.state = State.Initialised;
					this.onUciOk = undefined;
					resolve();
				}
			};
			this.stockfish.postMessage('uci');
		});
	}

	// Callback when receiving UCI messages from Stockfish.
	onUci( { data }: { data: string } ): void {
		const uci = data;
		console.log('UCI: ' + uci);
		if ( this.onUciOk && uci === 'uciok' ) {
			this.onUciOk();
		}
	}
}
