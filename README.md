# svelte-chess

Svelte chess component that combines chess.js and chessground for a fully playable chessboard.

Alpha, though all methods listed here are implemented.

## Usage

Create a playable chessboard:

    <script>
        import {Chess} from 'svelte-chess';
    </script>    

    <Chess />

Accessing the board API for undo/restart buttons:

    <script>
        import {Chess} from 'svelte-chess';
        let chessApi;
    </script>    

    <Chess bind:api={chessApi}/>

    <button on:click={()=>chessApi.resetBoard()}>Restart</button>
    <button on:click={()=>chessApi.undoLastMove()}>Undo</button>

Start from a specific FEN:

    <Chess fen="rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" />

## API

* getPossibleMoves
* getFen
* move
* resetBoard
* undoLastMove
* toggleOrientation
* getTurnColor
* getMoveNumber
* getHistory

