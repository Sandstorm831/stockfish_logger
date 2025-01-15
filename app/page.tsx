'use client'
import { useEffect, useState } from "react";
import xhr2 from "xhr2"
global.XMLHttpRequest = require("xhr2");

const formatMB = (n: number) => {
  return (n ? (n / 1e6).toPrecision(3) : "?") + "MB";
};

type stockfishState = "Loading" | "Ready" | "Waiting" | "Failed";
type progressState = {
  loaded: number,
  total: number,
}

const isSupported = () => {
  if (typeof WebAssembly !== "object") return false;
  const source = Uint8Array.from([
    0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 7, 8,
    1, 4, 116, 101, 115, 116, 0, 0, 10, 15, 1, 13, 0, 65, 0, 253, 17, 65, 0,
    253, 17, 253, 186, 1, 11,
  ]);
  if (
    typeof WebAssembly.validate !== "function" ||
    !WebAssembly.validate(source)
  )
    return false;
  if (typeof Atomics !== "object") return false;
  if (typeof SharedArrayBuffer !== "function") return false;
  return true;
};

export default function Home() {
  const [state, setState] = useState<stockfishState>('Waiting')
  const [progress, setProgress] = useState<progressState>({loaded: 0, total: 0});
  const [stockfishResponse, setStockfishResponse] = useState<string>("");
  const [stockfishWorker, setStockfishWorker] = useState<any>();
  let output : string = ""

  async function initializeStockfishWorker(Print: boolean){
    if(Print) {
      console.log(stockfishWorker);
      stockfishWorker.postMessage('go')
      return;
    }
    const x = await Stockfish(xhr.response)  // loaded with the script
    console.log(typeof x);
    setStockfishWorker(x);
    x.addMessageListener((line: string) => {
      output += line + `\n`;
      setStockfishResponse(output);
    })
    x.postMessage('setoption name threads value 1');
    // x.postMessage('go infinite');
    // x.postMessage('uci');
    // x.postMessage('setoption name threads value 2');
    setTimeout(async () => {
      await x.postMessage('go infinite');
    }, 5000);
    setTimeout(() => {
      x.postMessage('uci');
    }, 5000);
    setTimeout(() => {
      x.postMessage('stop');
    }, 5000);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/lib/stockfish.wasm', true);
  xhr.setRequestHeader('Accept', '*/*');
  xhr.setRequestHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  xhr.responseType = 'arraybuffer';
  xhr.onload = async (doneEvent) => {
    setState('Ready')
    console.log(`module loaded: ${doneEvent.loaded} bytes transferred`);
    initializeStockfishWorker(false);
  }
  xhr.onerror = (errorEvent) => {
    setState('Failed');
    console.log(`Some Error occured while laoding modules: ${errorEvent.loaded} bytes transferred`)
  }
  xhr.onprogress = (ProgressEvent) => {
    setState('Loading');
    let loaded = ProgressEvent.loaded;
    let total = ProgressEvent.total || 7031229;
    setProgress({loaded: loaded, total: total});
    // console.log(`loaded : ${formatMB(loaded)} / ${formatMB(total)}`)
  }

  const [value, setValue] = useState("");
  useEffect(()=>{
    const script = document.createElement("script");
    script.src = "/lib/stockfish.js";
    script.async = true;
    script.type = 'text/javascript'
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script);
    script.onload = () => {
      // console.log(script.text)
      xhr.send();
    }
    return() => {
      console.log("I am removing the script")
      document.body.removeChild(script);
    }

  }, [])

  useEffect(() => {
    console.log(`stockfish worker is changed : ${stockfishWorker}`);
  }, [stockfishWorker])
  return (
    <div className="w-screen h-screen flex flex-col">
      <script src="/lib/stockfish.js" />
      <div className="flex pt-5 pl-5 w-full">
        <input type="string" placeholder="Enter UCI Command Here" className="w-5/6 border px-2" onChange={(e) => setValue(e.target.value)} value={value} />
        <button className="bg-[#888888] text-white px-2 mr-5" onClick={() => {initializeStockfishWorker(true)}}>SEND</button>
        <select className="px-3">
          <option >-- EXAMPLE --</option>
          <option value={"stop"} onClick={() => setValue("stop")}>stop</option>
          <option value={"uci"} onClick={() => setValue("uci")}>uci</option>
          <option value={"go depth 15"} onClick={() => setValue("go depth 15")}>go depth 15</option>
          <option value={"go infinite"} onClick={() => setValue("go infinite")}>go infinite</option>
        </select>
      </div>
        <div className="pl-5 w-full mt-3">- download : {<>{formatMB(progress.loaded)}</>} / {<>{formatMB(progress.total)}</>}</div>
        <div className="pl-5 w-full mb-3">- stockfish state : {state}</div>
        <span className="mx-5 mb-3 border flex-1 overflow-scroll whitespace-pre-wrap">
          {stockfishResponse}
        </span>
    </div>
  );
}
