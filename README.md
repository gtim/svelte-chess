# svelte-chess

Fully playable chess component for Svelte, combining the features of chess.js and chessground.

## Features

* Track game state via bindable props or synchronous API
* Pawn promotion dialog
* Move history, undo moves
* Detailed events on move and game end
* Fully typed

## Usage 

Installation:

    npm install svelte-chess

Basic playable chessboard ([REPL](https://svelte.dev/repl/b1a489538165489aa2720a65b476a58b?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
    </script>    
    <Chess />

## Props

Game state can be observed by binding to props or by calls to the API object.
This table lists all available props along with their corresponding API calls.

| Prop        | API call      | Bindable? | Value                                                 |
| ----------- | ------------- | :-------: | ----------------------------------------------------- |
| `turn`      | `turn()`      |     ✓     | Current color to move: `w` or `b`                     |
| `moveNumber`| `moveNumber()`|     ✓     | Current move number (whole moves)                     |
| `history`   | `history()`   |     ✓     | Array of all moves as SAN strings, e.g. `['d4','Nf6']`|
| `fen`       | `fen()`       |     ✓     | Current position in [FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation) |
| `api`       | n/a           |     ✓     | Api instance (see next section)                       |

All props are read-only, except for `fen`. The initial value of `fen` is used
for the starting position. All bindable props are updated as soon as the game
state changes.

Example using bindable props to monitor state ([REPL](https://svelte.dev/repl/d0ec69dde1f84390ac8b4d5746db9505?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
        let moveNumber, turn, history;
    </script>    
	<Chess bind:moveNumber bind:turn bind:history/>
    <p>
        It's move {moveNumber}, with {turn} to move.
        Moves played: {history?.join(' ')}.
    </p>

Starting from a specific FEN ([REPL](https://svelte.dev/repl/ebce18a71d774b2db987abc71f45648a?version=3.59.1)):

    <Chess fen="rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" />


## Board/Game API

The board state can be read and manipulated via the bindable `api` prop, which 
implements the following methods. The API should closely resemble that of chess.js.

Methods for reading game/board state:

* `turn()`: Current color to move: `w` or `b`.
* `moveNumber()`: Current move number (whole moves).
* `history()`: All moves played in the game, as an array of SAN strings, e.g. `['d4','Nf6','Bg5']`. 
* `history({verbose: true})`: All moves played in the game, as an array of [#move](Move objects).
* `fen()`: Current position in [FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation).

Methods for manipulating game/board state:

* `move( san )`: Make a move programmatically. Argument is the move in [short algebraic notation](https://en.wikipedia.org/wiki/Algebraic_notation_(chess)), e.g. `Nf3`. Returns true if successful, or false if the move was illegal.
* `reset()`: Resets the game to the initial position.
* `undo()`: Undoes the last move and returns it.
* `toggleOrientation()`

Example using the API object for undo/reset buttons ([REPL](https://svelte.dev/repl/7dd7b6454b12466e90ac78a842151311?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
        let chessApi;
    </script>    
    <Chess bind:api={chessApi}/>
    <button on:click={()=>chessApi.reset()}>Reset</button>
    <button on:click={()=>chessApi.undo()}>Undo</button>


## Events

In addition to props and API calls, the game state can be tracked through events.

A `move` event is dispatched after every move, containing the corresponding [#move](Move object).

A `gameOver` event is emitted after a move that ends the game. The GameOver object has two keys:
* `reason`: `checkmate`, `stalemate`, `repetition`, `insufficient material` or `fifty-move rule`.
* `result`: 1 for White win, 0 for Black win, or 0.5 for a draw.

Listening for `move` and `gameOver` events ([REPL](https://svelte.dev/repl/6fc2874d1a594d76aede4834722e4f83?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
        function moveListener(event) {
            const move = event.detail;
            console.log( `${move.color} played ${move.san}` );
        }
        function gameOverListener(event) {
            console.log( `The game ended due to ${event.detail.reason}` );
        }
    </script>
    <Chess on:move={moveListener} on:gameOver={gameOverListener} />

Svelte-chess exports the MoveEvent and GameOverEvent types.

## Types

### Move

A `Move` describes a chess move. It is identical to the chess.js Move type. Properties:
  - `color`: `w` for White move or `b` for Black move.
  - `from` and `to`: Origin and destination squares, e.g. `g1` and `f3`.
  - `piece`: Piece symbol, one of `pnbrqk` (pawn, knight, bishop, rook, queen, king).
  - `captured` and `promotion`: Piece symbol of a capture or promotion, if applicable.
  - `san`: Standard algebraic notation, e.g. `Nf3`.
  - `lan`: Long algebraic notation, e.g. `g1f3`.
  - `before` and `after`: FEN of positions before and after the move.
  - `flags`: String of letters for each flag that applies to the move: `c` for standard capture, `e` for en passant capture, `n` for non-capture, `b` for two-square pawn move, `p` for promotion, `k` for kingside castling and `q` for queenside castling.


## Not yet implemented

* getPgn
* Styling
* Demo
