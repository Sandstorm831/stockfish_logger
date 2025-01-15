# Stockfish Terminal
So this project is a Next.js clone of a demo project prepared for WebAssembly port of [Stockfish](https://github.com/official-stockfish/Stockfish) with NNUE support. You can find the original project [here](https://github.com/hi-ogawa/stockfish-nnue-wasm-demo/).

###### An important note

In this project, in `app/page.tsx` file, from line `104 - 111`, you can see a constant variable `x` is declared first for holding the `object Arraybuffer` output from the Stockfish web assembly, instead of putting it directly in the already declared variable `stockfishEngine`, also stockfishEngine is a state variable, and not a normal variable, which is not normal as it won't be rendered anyway. First we ***have*** to use state variables or `useRef` value that are not affected by rerendereing, and we also ***have*** to use a `const x` for the wasm object as `setState()` hooks are asynchronous in nature, so we can't use the assigned variables instantly after assigning, doing which, will inevitably throw an error, so we first use a normal variable for it, and at last capture in our state variable. 

---
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
