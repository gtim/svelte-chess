# svelte-chess

Svelte chess component that combines chess.js and chessground for a fully playable chessboard.

This alpha version is under development. Everything described here is already
implemented. See the end of this document for what remains.

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

* Events on move and on game end (mate/stalemate/repetition/insufficient)
* Promotion dialog
* Highlight king when checked
* getPgn
* Styling
* Demo
