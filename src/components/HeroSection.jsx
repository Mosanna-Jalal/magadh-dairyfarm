"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// The hero is a tall section (200vh). Its inner panel is sticky for one
// viewport: as you scroll that distance the 3D camera dollies out from a
// zoomed-in close-up to the full farm, then the page scrolls on to the content.
export default function HeroSection() {
  const wrapRef = useRef(null);
  const progressRef = useRef({ value: 0 });
  const copyRef = useRef(null);
  const hintRef = useRef(null);
  const [locked, setLocked] = useState(true); // true while the intro zoom owns the camera
  const lockedRef = useRef(true);

  useEffect(() => {
    const wrap = wrapRef.current;
    function onScroll() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 1;
      progressRef.current.value = p;

      // fade/slide the hero copy in as the farm zooms out
      if (copyRef.current) {
        const fade = Math.min(1, Math.max(0, (p - 0.15) / 0.4));
        copyRef.current.style.opacity = String(0.12 + fade * 0.88);
        copyRef.current.style.transform = `translateY(${(1 - fade) * 14}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p * 4));

      // hand the camera to OrbitControls once the zoom-out completes
      const nowLocked = p < 0.999;
      if (nowLocked !== lockedRef.current) {
        lockedRef.current = nowLocked;
        setLocked(nowLocked);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={wrapRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <FarmScene progressRef={progressRef} locked={locked} />

        {/* soft vignette on the left for text legibility — scene stays visible */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[42%] bg-gradient-to-r from-black/15 via-black/5 to-transparent sm:block" />

        {/* top nav */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 py-3 sm:px-10 sm:py-4">
          <Link
            href="/"
            className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow backdrop-blur sm:px-4 sm:py-2"
          >
            <span className="text-xl sm:text-2xl">🐄</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-bold text-leafdark sm:text-base">
                Magadh Dairy Farm
              </p>
              <p className="hidden text-[10px] uppercase tracking-widest text-stone-500 sm:block">
                Pure • Fresh • Village Made
              </p>
            </div>
          </Link>
          <nav className="pointer-events-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a href="#products" className="btn-light hidden sm:inline-flex">
              Products
            </a>
            <Link href="/portal" aria-label="My Account" className="btn-light !px-3 sm:!px-5">
              <span aria-hidden>📒</span>
              <span className="hidden sm:inline">My Account</span>
            </Link>
            <Link href="/admin" className="btn-primary !px-4 sm:!px-5">
              Admin
            </Link>
          </nav>
        </header>

        {/* hero copy — fades in as the farm reaches full view */}
        <div
          ref={copyRef}
          style={{ opacity: 0.12 }}
          className="pointer-events-none absolute inset-x-4 bottom-5 z-10 sm:inset-x-auto sm:bottom-auto sm:left-10 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-y-1/2"
        >
          <div className="rounded-2xl bg-white/15 p-4 shadow-md backdrop-blur-[2px] sm:bg-white/20 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-leafdark drop-shadow-sm">
              Pure &amp; fresh — straight from the village
            </p>
            <h1
              className="mt-1.5 font-display text-2xl font-bold leading-tight text-stone-900 sm:text-4xl"
              style={{ textShadow: "0 1px 10px rgba(255,255,255,0.65)" }}
            >
              Farm-fresh dairy, every single day
            </h1>
            <p
              className="mt-2 hidden text-sm leading-relaxed text-stone-700 sm:block"
              style={{ textShadow: "0 1px 8px rgba(255,255,255,0.7)" }}
            >
              Our own cows and buffaloes are milked morning and evening. The same pure milk, paneer,
              ghee, khowa and dahi reaches your home — unadulterated, always fresh.
            </p>
            <div className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2.5 sm:mt-4">
              <a href="#products" className="btn-primary">
                🥛 Today&apos;s availability
              </a>
              <Link href="/portal" className="btn-ghost">
                Check your account →
              </Link>
            </div>
          </div>
        </div>

        {/* scroll hint — fades out as you start scrolling */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-1 text-white"
        >
          <span
            className="rounded-full bg-black/35 px-3.5 py-1.5 text-[11px] font-medium backdrop-blur"
          >
            Scroll to zoom out &amp; explore the farm
          </span>
          <span className="animate-bounce text-lg drop-shadow">↓</span>
        </div>
      </div>
    </section>
  );
}
