"use client";

import dynamic from "next/dynamic";

const FarmScene = dynamic(() => import("@/components/three/FarmScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 via-sky-100 to-green-200">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-sm font-medium text-leafdark">Loading the farm…</p>
      </div>
    </div>
  ),
});

export default function Hero3D() {
  return <FarmScene />;
}
