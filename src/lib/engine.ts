export interface EngineOptions {
	//skill?: number, // 1-20
	moveTime?: number, // Maximum time in ms to spend on a move
	depth?: number, // Maximum depth to search per move
};

export class Engine {
	private moveTime: number;
	private depth: number;
	constructor( options: EngineOptions = {} ) {
		this.moveTime = options.moveTime || 2000;
		this.depth = options.depth || 40;
	}
	initialize() {
		const stockfish = new Worker('stockfish.js');
		stockfish.addEventListener('message', function (e) {
			console.log(e.data);
		} );
		stockfish.postMessage('uci');
	}
}
