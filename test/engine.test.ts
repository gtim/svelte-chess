import { Engine } from '../src/lib/engine.js';
import { Chess as ChessJS } from 'chess.js';
import '@vitest/web-worker';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe("basic engine tests", () => {

	const engine = new Engine({
		stockfishPath: 'static/stockfish.js',
		moveTime: 500,
	});

	test( "getMove throws when engine uninitialised", async () => {
		await expect( ()=>engine.getMove( INITIAL_FEN ) ).rejects.toThrow(/init/);
	});

	test("init finishes initialising", async () => {
		const initSpy = vi.spyOn( engine, 'init' );
		await engine.init();
		await expect( initSpy ).toHaveReturned();
	}, 10e3);

	test.each([
		{ fen: INITIAL_FEN, note: 'initial position' },
		{ fen: 'rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 2 5', note: 'black to move' },
		{ fen: '5k2/p1p4R/1pr5/3p1pP1/P2P1P2/2P2K2/8/8 w - - 0 35' },
		{ fen: '8/6P1/7k/5K2/8/8/8/8 w - - 0 1', note: 'promotion' },
		{ fen: '8/8/3q3B/8/8/3k2P1/7b/R3K3 w Q - 0 1', note: 'castle'},
	])( 'getMove returns a valid move for position $fen ($note)', async ({fen}) => {
		const move = await engine.getMove(fen);
		const chess = new ChessJS(fen);
		await chess.move( move, { strict: false } ); // throws on invalid move
	} );

	test("engine spends approx. moveTime ms on a move (500ms)", async () => {
		const start = new Date();
		await engine.getMove( INITIAL_FEN );
		const timeTakenMs = new Date() - start;
		expect( timeTakenMs ).toBeGreaterThan( 400 );
		expect( timeTakenMs ).toBeLessThan( 600 );
	});

	test("isSearching is true when searching, false before and after", async () => {
		expect( engine.isSearching() ).toBeFalsy();
		const movePromise = engine.getMove( INITIAL_FEN );
		expect( engine.isSearching() ).toBeTruthy();
		await new Promise(resolve => setTimeout(resolve, 100));
		expect( engine.isSearching() ).toBeTruthy();
		await movePromise;
		expect( engine.isSearching() ).toBeFalsy();
	});

	test( "stopSearch() stops search", async () => {
		const movePromise = engine.getMove( INITIAL_FEN );
		await new Promise(resolve => setTimeout(resolve, 100));
		expect( engine.isSearching() ).toBeTruthy();
		expect( engine['state'] ).toEqual( 'searching' ); // test private prop 
		await engine.stopSearch();
		expect( engine.isSearching() ).toBeFalsy();
		expect( engine['state'] ).toEqual( 'waiting' ); // test private prop 
	});

	test.each([
		{ fen: '2r2rk1/p5pp/1P2p3/6q1/1P2Qn2/P7/2R2PPP/3B1RK1 b - - 2 27', answer: 'c8c2' },
		{ fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', answer: 'h5f7' },
		{ fen: '8/8/8/4k3/8/8/8/2BQKB2 w - - 0 1', answer: 'f1c4' },
		{ fen: '7B/8/8/8/8/N7/pp1K4/k7 w - - 0 1', answer: 'd2c3' },
	])( 'engine solves puzzle: $fen', async ({fen,answer}) => {
		await expect( engine.getMove( fen ) ).resolves.toEqual( answer );
		await new Promise(resolve => setTimeout(resolve, 20));
	});
});

test.each(['w','b','both','none'])("getColor returns %s", (color) => {
	const engine = new Engine({ color });
	expect( engine.getColor() ).toEqual( color );
});

test("engine does not solve hard puzzle at low depth", async () => {
	const engine = new Engine({
		stockfishPath: 'static/stockfish.js',
		depth: 8,
	});
	await engine.init();
	await expect( engine.getMove( 'r2q1r2/1b2bpkp/n3p1p1/2ppP1P1/p6R/1PN1BQR1/NPP2P1P/4K3 w - - 0 1' ) ).resolves.not.toEqual( 'f3f6' );
	await expect( engine.getMove( '8/8/4kpp1/3p1b2/p6P/2B5/6P1/6K1 b - - 0 1' ) ).resolves.not.toEqual( 'f5h3' );
}, 10e3);

test( "getMove throws if initialisation hasn't finished", async () => {
	const engine = new Engine({ stockfishPath: 'static/stockfish.js' });
	const initPromise = engine.init();
	await expect( ()=>engine.getMove( INITIAL_FEN ) ).rejects.toThrow(/not ready/);
	await initPromise;
});
