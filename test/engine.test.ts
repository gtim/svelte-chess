// engine.ts interface

test.todo( "init finishes initialising" );
test.todo( "getMove returns a valid move" );
test.todo( "getMove throws when engine uninitialised" );
test.todo( "engine spends approx. moveTime ms on a move" );
test.todo( "engine does not solve some example puzzle at low depth" );
test.todo( "engine initialisation happens after uciok" );
test.todo( "engine.ts checks that stockfish is ready before sending position+go" );
test.todo( "opening moves are varied (opening book, stochastic test)" );
test.todo( "engine solves some example puzzles" );
test.todo( "getColor()" );
test.todo( "isSearching()" );
test.todo( "stopSearch() stops search and reaches State.Waiting" );

// Chess.svelte/Api.ts engine part

test.todo( "engine plays first move when white/both, not when black/none" );
test.todo( "engine plays first move when white/both and game is reset" );
test.todo( "engine plays first move when black/both and black-to-move position is loaded, not when white/none" );
test.todo( "playEngineMove() plays an engine move");
test.todo( "playEngineMove() throws before engine is loaded" );
test.todo( "engine-vs-engine game plays out and ends properly (test from appropriate position)" );
test.todo( "chessground interactions are disabled before engine is loaded" );
test.todo( "chessground interactions are enabled after engine is loaded" );
test.todo( "chessground interactions are disabled while engine is searching" );
test.todo( "move()/chessground move do not throw if the engine was searching" );
test.todo( "move()/chessground move stop engine move search if the engine was searching" );
test.todo( "engine moves or does not move correctly after undo()" );
test.todo( "on:uci forwards UCI messages");
test.todo( "correct king is hilighted on check");

