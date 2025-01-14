'use client'
import axios from "axios";
import { useEffect, useState } from "react";

const formatMB = (n) => {
  return (n ? (n / 1e6).toPrecision(3) : "?") + "MB";
};


export default function Home() {
  const [value, setValue] = useState("");
  useEffect(()=>{
    const script = document.createElement("script");
    script.src = "/lib/stockfish.js";
    script.async = true;
    document.body.appendChild(script);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/lib/stockfish.wasm', true);
    xhr.setRequestHeader('Accept', '*/*');
    xhr.setRequestHeader('x-decompressed-content-length', '7031229');
    xhr.responseType = 'arraybuffer';
    xhr.onloadend = (doneEvent) => {
      console.log(`decoded length of the response : ${doneEvent.loaded}`)
    }
    xhr.onprogress = (ProgressEvent) => {
      let loaded = ProgressEvent.loaded;
      let total = ProgressEvent.total || 7031229;
      console.log(`loaded : ${formatMB(loaded)} / ${formatMB(total)}`)
    }
    script.onload = () => {
      xhr.send();
    }
    return() => {
      document.body.removeChild(script);
    }

  }, [])
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex pt-5 pl-5 w-full">
        <input type="string" placeholder="Enter UCI Command Here" className="w-5/6 border px-2" onChange={(e) => setValue(e.target.value)} value={value} />
        <button className="bg-[#888888] text-white px-2 mr-5">SEND</button>
        <select className="px-3">
          <option >-- EXAMPLE --</option>
          <option value={"stop"} onClick={() => setValue("stop")}>stop</option>
          <option value={"uci"} onClick={() => setValue("uci")}>uci</option>
          <option value={"go depth 15"} onClick={() => setValue("go depth 15")}>go depth 15</option>
          <option value={"go infinite"} onClick={() => setValue("go infinite")}>go infinite</option>
        </select>
      </div>
        <div className="pl-5 w-full mt-3">- download : </div>
        <div className="pl-5 w-full mb-3">- stockfish state : </div>
        <div className="mx-5 border flex-1 overflow-scroll">
          
        </div>
    </div>
  );
}
