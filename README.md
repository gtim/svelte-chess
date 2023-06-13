# svelte-chess

Svelte chess component that combines chess.js and chessground for a fully playable chessboard component.

This alpha version is under development. Everything described here is already
implemented. See the end of this document for what remains.

## Features

* Track state via bindable props, events or synchronous API
* Pawn promotion dialog
* Move history, undo moves
* Events on moves
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

Listening for `move` events:

    <script>
        import {Chess} from 'svelte-chess';
        function handleMove(event) {
            const move = event.detail;
            console.log( `${move.color} played (${move.san})` );
        }
    </script>    

    <Chess on:move={handleMove} />

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

* Events on game end (mate/stalemate/repetition/insufficient)
* getPgn
* Styling
* Demo
