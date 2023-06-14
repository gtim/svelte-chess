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

Create a simple, playable chessboard:

    <script>
        import {Chess} from 'svelte-chess';
    </script>    

    <Chess />

Bindable svelte props:

    <script>
        import {Chess} from 'svelte-chess';
        let fen, moveNumber, turnColor, history;
    </script>    

	<Chess bind:fen bind:moveNumber bind:turnColor bind:history/>
    
    <p>
        It's move {moveNumber}, with {turnColor} to move.
        Moves played: {history?.join(' ')}.
        Current FEN: {fen}
    </p>

Access the board API for undo/restart buttons:

    <script>
        import {Chess} from 'svelte-chess';
        let chessApi;
    </script>    

    <Chess bind:api={chessApi}/>

    <button on:click={()=>chessApi.resetBoard()}>Restart</button>
    <button on:click={()=>chessApi.undoLastMove()}>Undo</button>

Start from a specific FEN:

    <Chess fen="rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" />

## Events

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

Listening for `move` and `gameOver` events:

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
