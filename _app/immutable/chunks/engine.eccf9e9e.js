var h=Object.defineProperty;var c=(e,i,t)=>i in e?h(e,i,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[i]=t;var s=(e,i,t)=>(c(e,typeof i!="symbol"?i+"":i,t),t);class v{constructor(i={}){s(this,"stockfish");s(this,"state","uninitialised");s(this,"moveTime");s(this,"depth");s(this,"color");s(this,"onUciOk");s(this,"onBestMove");this.moveTime=i.moveTime||2e3,this.depth=i.depth||40,this.color=i.color||"b"}init(){return new Promise(i=>{this.state="initialising",this.stockfish=new Worker("stockfish.js"),this.stockfish.addEventListener("message",t=>this._onUci(t)),this.onUciOk=()=>{this.state==="initialising"&&(this.state="waiting",this.onUciOk=void 0,i())},this.stockfish.postMessage("uci")})}_onUci({data:i}){const t=i;console.log("UCI: "+t),this.onUciOk&&t==="uciok"&&this.onUciOk(),this.onBestMove&&t.slice(0,8)==="bestmove"&&this.onBestMove(t)}getMove(i){return new Promise(t=>{if(!this.stockfish)throw new Error("Engine not initialised");if(this.state!=="waiting")throw new Error("Engine not ready (state: "+this.state);this.state="finding move",this.stockfish.postMessage("position fen "+i),this.stockfish.postMessage(`go depth ${this.depth} movetime ${this.moveTime}`),this.onBestMove=o=>{const n=o.split(" ")[1];this.state="waiting",this.onBestMove=void 0,t(n)}})}getColor(){return this.color}}export{v as E};
