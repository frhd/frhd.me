"use client";

import dynamic from "next/dynamic";

const XTerminal = dynamic(() => import("./XTerminal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="text-green-500 font-mono">Loading terminal...</div>
    </div>
  ),
});

export default function ClientTerminalWrapper() {
  return <XTerminal />;
}