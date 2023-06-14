# svelte-chess

Fully playable chess component for Svelte, combining the features of chess.js and chessground.

## Features

* Track game state via bindable props or synchronous API
* Pawn promotion dialog
* Move history, undo moves
* Detailed events on move and game end
* Fully typed

## Usage examples

Install:

    npm install svelte-chess

Basic playable chessboard ([REPL](https://svelte.dev/repl/b1a489538165489aa2720a65b476a58b?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
    </script>    

    <Chess />

Bindable svelte props to monitor state reactively ([REPL](https://svelte.dev/repl/d0ec69dde1f84390ac8b4d5746db9505?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
        let moveNumber, turnColor, history;
    </script>    

	<Chess bind:moveNumber bind:turnColor bind:history/>
    
    <p>
        It's move {moveNumber}, with {turnColor} to move.
        Moves played: {history?.join(' ')}.
    </p>

Undo/restart buttons using the API object ([REPL](https://svelte.dev/repl/7dd7b6454b12466e90ac78a842151311?version=3.59.1)):

    <script>
        import {Chess} from 'svelte-chess';
        let chessApi;
    </script>    

    <Chess bind:api={chessApi}/>

    <button on:click={()=>chessApi.resetBoard()}>Restart</button>
    <button on:click={()=>chessApi.undoLastMove()}>Undo</button>

Start from a specific FEN ([REPL](https://svelte.dev/repl/ebce18a71d774b2db987abc71f45648a?version=3.59.1)):

    <Chess fen="rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" />

## Props

Game state can be observed by binding to props or by calls to the API object.
This table lists all available props along with their corresponding API calls.

| Prop        | API call         | Bindable? | Value                                             |
| ----------- | ---------------- | --------- | ------------------------------------------------- |
| `turnColor` | `getTurnColor()` | ✓         | Current player's color: `w` or `b`                |
| `moveNumber`| `getMoveNumber()`| ✓         | Current move number (whole moves)                 |
| `history`   | `getHistory()`   | ✓         | All moves: array of SAN strings.                  |
| `fen`       | `getFen()`       | ✓         | Current position in [FEN](https://www.chessprogramming.org/Forsyth-Edwards_Notation)] |
| `api`       | n/a              | ✓         | Api object                                        |

All props are read-only, except for `fen`. The initial value of `fen` is used
for the starting position. All bindable props are updated as soon as the game
state changes.

## Events

In addition to props and API calls, the game state can be tracked through events.

A `move` event is emitted after every move. The Move object in the event is inherited from Chess.js and contains:
* `color`: `w` for White move or `b` for Black move.
* `from` and `to`: Origin and destination squares, e.g. `g1` and `f3`.
* `piece`: Piece symbol, one of `pnbrqk` (pawn, knight, bishop, rook, queen, king).
* `captured` and `promotion`: Piece symbol of a capture or promotion, if applicable.
* `san`: Standard algebraic notation, e.g. `Nf3`.
* `lan`: Long algebraic notation, e.g. `g1f3`.
* `before` and `after`: FEN of positions before and after the move.
* `flags`: String of letters for each flag that applies to the move: `c` for standard capture, `e` for en passant capture, `n` for non-capture, `b` for two-square pawn move, `p` for promotion, `k` for kingside castling and `q` for queenside castling.

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

## API

The board state can be read and manipulated via the bindable `api` prop, which 
implements the following methods:

* getPossibleMoves
* getFen
* move
* resetBoard
* undoLastMove
* toggleOrientation
* getTurnColor
* getMoveNumber
* getHistory

## Not yet implemented

* getPgn
* Styling
* Demo