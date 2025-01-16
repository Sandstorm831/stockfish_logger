"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const formatMB = (n: number) => {
  return (n ? (n / 1e6).toPrecision(3) : "?") + "MB";
};

type stockfishState = "Loading" | "Ready" | "Waiting" | "Failed";
type progressState = {
  loaded: number;
  total: number;
};

function wasmThreadsSupported() {
  // WebAssembly 1.0
  const source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
  if (
    typeof WebAssembly !== "object" ||
    typeof WebAssembly.validate !== "function"
  )
    return false;
  if (!WebAssembly.validate(source)) return false;

  // SharedArrayBuffer
  if (typeof SharedArrayBuffer !== "function") return false;

  // Atomics
  if (typeof Atomics !== "object") return false;

  // Shared memory
  const mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
  if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

  // Structured cloning
  try {
    window.postMessage(mem, "*");
  } catch (e) {
    console.log(`Browser Error ${e}`);
    return false;
  }

  // Growable shared memory (optional)
  try {
    mem.grow(8);
  } catch (e) {
    console.log(`Browser Error ${e}`);
    return false;
  }

  return true;
}

export default function Home() {
  const [state, setState] = useState<stockfishState>("Waiting");
  const [progress, setProgress] = useState<progressState>({
    loaded: 0,
    total: 0,
  });
  const [stockfishResponse, setStockfishResponse] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [stockfishEngine, setStockfishEngine] = useState<object>();
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  let output: string = "";
  const scrollToBottom = () => {
    if (autoScroll)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [stockfishResponse]);

  useEffect(() => {
    if (!wasmThreadsSupported()) {
      alert(
        "Web assembly threads are not supported in this browser, please update or switch the browser"
      );
      return;
    } else {
      const script = document.createElement("script");
      script.src = "/lib/stockfish.js";
      script.async = true;
      script.type = "text/javascript";
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
      script.onload = () => {
        try {
          axios({
            url: "/lib/stockfish.wasm",
            method: "GET",
            headers: {
              Accept: "*/*",
              "Cross-Origin-Embedder-Policy": "require-corp",
            },
            responseType: "arraybuffer",
            onDownloadProgress: (progressEvent) => {
              setState("Loading");
              const loading = progressEvent.loaded;
              const total = progressEvent.total || 27444194;
              setProgress({ loaded: loading, total: total });
              console.log(loading);
            },
          }).then(async (_stockfish) => {
            // @ts-expect-error Loaded from the stockfish.js script, it works but doesn't get detected
            const x = await Stockfish(_stockfish); // Loaded from the stockfish.js script, it works but doesn't get detected
            x.addMessageListener((line: string) => {
              output += line + `\n`;
              setStockfishResponse(output);
            });
            x.postMessage("isready");
            setStockfishEngine(x);
            setState("Ready");
          });
        } catch (err) {
          console.log(
            `Some error occured while fetching web assembly module: ${err}`
          );
        }
      };
      return () => {
        console.log("I am removing the script");
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex pt-5 pl-5 w-11/12">
        <input
          type="string"
          placeholder="Enter UCI Command Here"
          className="w-5/6 border px-2"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button
          className={`bg-[#888888] text-white px-2 mr-5 ${
            state === "Ready" ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          onClick={() => {
            if(!stockfishEngine) return;
            // @ts-expect-error will contain a postMessage and stockfishEngine is vast enough to not to define it's type
            stockfishEngine.postMessage(value);
          }}
          disabled={state === "Ready" ? false : true}
        >
          SEND
        </button>
        <select className="px-3">
          <option>-- EXAMPLE --</option>
          <option value={"stop"} onClick={() => setValue("stop")}>
            stop
          </option>
          <option value={"isready"} onClick={() => setValue("isready")}>
            isready
          </option>
          <option value={"uci"} onClick={() => setValue("uci")}>
            uci
          </option>
          <option value={"go depth 15"} onClick={() => setValue("go depth 15")}>
            go depth 15
          </option>
          <option value={"eval"} onClick={() => setValue("eval")}>
            eval
          </option>
          <option value={"d"} onClick={() => setValue("d")}>
            d
          </option>
          <option
            value={"position startpos"}
            onClick={() => setValue("position startpos")}
          >
            position startpos
          </option>
          <option
            value={"setoption name Threads value 4"}
            onClick={() => setValue("setoption name Threads value 4")}
          >
            setoption name Threads value 4
          </option>
          <option
            value={"setoption name Threads value 1"}
            onClick={() => setValue("setoption name Threads value 1")}
          >
            setoption name Threads value 1
          </option>
          <option value={"go infinite"} onClick={() => setValue("go infinite")}>
            go infinite
          </option>
        </select>
      </div>
      <div className="pl-5 w-full mt-3 font-mono">
        - download : {<>{formatMB(progress.loaded)}</>} /{" "}
        {<>{formatMB(progress.total)}</>}
      </div>
      <div className="pl-5 w-full flex font-mono whitespace-pre">
        - autoScroll :{" "}
        <div
          onClick={() => {
            setAutoScroll((x) => !x);
          }}
        >
          [{autoScroll ? "x" : " "}]
        </div>
      </div>
      <div className="pl-5 w-full mb-3 font-mono">
        - stockfish state : {state}
      </div>
      <div className="mx-5 mb-3 border flex-1 overflow-scroll whitespace-pre-wrap font-mono">
        {stockfishResponse}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
}
