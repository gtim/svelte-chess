var n=Object.defineProperty;var a=(e,t,i)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i;var s=(e,t,i)=>(a(e,typeof t!="symbol"?t+"":t,i),i);class k{constructor(t={}){s(this,"stockfish");s(this,"state","uninitialised");s(this,"moveTime");s(this,"depth");s(this,"color");s(this,"stockfishPath");s(this,"externalUciCallback");s(this,"onUciOk");s(this,"onBestMove");this.moveTime=t.moveTime||2e3,this.depth=t.depth||40,this.color=t.color||"b",this.stockfishPath=t.stockfishPath||"stockfish.js"}init(){return new Promise(t=>{this.state="initialising",this.stockfish=new Worker(this.stockfishPath),this.stockfish.addEventListener("message",i=>this._onUci(i)),this.onUciOk=()=>{this.state==="initialising"&&(this.state="waiting",this.onUciOk=void 0,t())},this.stockfish.postMessage("uci")})}_onUci({data:t}){const i=t;this.onUciOk&&i==="uciok"&&this.onUciOk(),this.onBestMove&&i.slice(0,8)==="bestmove"&&this.onBestMove(i),this.externalUciCallback&&this.externalUciCallback(i)}setUciCallback(t){this.externalUciCallback=t}getMove(t){return new Promise(i=>{if(!this.stockfish)throw new Error("Engine not initialised");if(this.state!=="waiting")throw new Error("Engine not ready (state: "+this.state+")");this.state="searching",this.stockfish.postMessage("position fen "+t),this.stockfish.postMessage(`go depth ${this.depth} movetime ${this.moveTime}`),this.onBestMove=o=>{const h=o.split(" ")[1];this.state="waiting",this.onBestMove=void 0,i(h)}})}getColor(){return this.color}isSearching(){return this.state==="searching"}async stopSearch(){return new Promise(t=>{if(!this.stockfish)throw new Error("Engine not initialised");this.state!=="searching"&&t(),this.onBestMove=i=>{this.state="waiting",this.onBestMove=void 0,t()},this.stockfish.postMessage("stop")})}}export{k as E};
