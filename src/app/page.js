import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import ProductIcon from "@/components/ProductIcon";
import WhatsAppButton from "@/components/WhatsAppButton";
import Reveal from "@/components/Reveal";
import MilkPour3D from "@/components/MilkPour3D";
import NoticePopup from "@/components/NoticePopup";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { inr, round3, unitLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getProducts() {
  try {
    await dbConnect();
    return await Product.find({ showOnSite: { $ne: false } }).sort({ sortOrder: 1 }).lean();
  } catch {
    return null; // DB unreachable — page still renders
  }
}

function StockBadge({ p }) {
  if (p.stock <= 0)
    return <span className="chip bg-red-100 text-red-700">Sold out today</span>;
  if (p.stock <= p.lowStockAt)
    return (
      <span className="chip bg-amber-100 text-amber-700">
        Only {round3(p.stock)} {unitLabel(p.unit)} left
      </span>
    );
  return (
    <span className="chip bg-green-100 text-green-700">
      Available: {round3(p.stock)} {unitLabel(p.unit)}
    </span>
  );
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      {/* ── Hero with 3D farm (scroll-driven zoom) ──────────── */}
      <HeroSection />

      {/* ── Live availability ───────────────────────────── */}
      <section id="products" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal from="up">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold text-stone-900">Today&apos;s Stock</h2>
              <p className="mt-1 text-sm text-stone-500">
                Live availability — the moment something sells out at the farm, it shows here.
              </p>
            </div>
            <Link href="/portal" className="btn-ghost">
              📒 View your purchase history
            </Link>
          </div>
        </Reveal>

        {!products ? (
          <div className="card mt-8 p-8 text-center text-sm text-stone-500">
            Stock is temporarily unavailable — please refresh in a moment.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal
                key={p.slug}
                from={i % 2 ? "right" : "left"}
                delay={(i % 3) * 90}
                className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
              >
                <div
                  className={`card group relative h-full overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lg ${
                    i === 0 ? "ring-2 ring-leaf/50" : ""
                  }`}
                >
                  {i === 0 && (
                    <span className="absolute right-4 top-4 chip bg-leaf text-white">
                      ⭐ Best seller
                    </span>
                  )}
                  <ProductIcon slug={p.slug} className="h-14 w-14" />
                  <h3 className="mt-3 font-display text-xl font-bold text-stone-900">
                    {p.name}{" "}
                    <span className="text-sm font-normal text-stone-400">{p.nameHindi}</span>
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-leafdark">
                      {inr(p.price)}
                      <span className="text-xs font-medium text-stone-400"> / {unitLabel(p.unit)}</span>
                    </p>
                    <StockBadge p={p} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Why us ───────────────────────────── */}
      <section className="bg-butter/50">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <Reveal from="up">
            <h2 className="text-center font-display text-3xl font-bold text-stone-900">
              Why Magadh Farm & Dairy?
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🐃",
                title: "Our own cattle",
                text: "Every drop comes from our own cows and buffaloes, milked fresh at the farm — no middlemen, no mixing.",
              },
              {
                icon: "🧾",
                title: "Transparent digital ledger",
                text: "Daily purchases and balances are recorded digitally. Check your account and payment history any time from your phone.",
              },
              {
                icon: "🚫",
                title: "Zero adulteration",
                text: "No water, no powder. If something runs out, the website says so — we never stretch the supply.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} from={i === 0 ? "left" : i === 2 ? "right" : "up"} delay={i * 90}>
                <div className="card h-full p-6 text-center">
                  <div className="text-4xl">{f.icon}</div>
                  <h3 className="mt-3 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="relative overflow-hidden bg-leafdark text-green-100">
        {/* flowing milk 3D accent */}
        <MilkPour3D />

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
          <div>
            <p className="font-display text-lg font-bold text-white">🐄 Magadh Farm & Dairy Products</p>
            <p className="text-xs text-green-200/80">
              Farm-fresh milk &amp; dairy from the Magadh region, Bihar.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm sm:justify-end">
            <a
              href="https://wa.me/919973807755"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              📱 WhatsApp: 99738 07755
            </a>
            <span className="opacity-40">•</span>
            <Link href="/portal" className="hover:text-white">
              My Account
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/admin" className="hover:text-white">
              Admin Panel
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-4 text-center text-xs text-green-200/80 sm:flex-row sm:justify-between sm:px-8 sm:text-left">
            <p>© {new Date().getFullYear()} Magadh Farm & Dairy Products. All rights reserved.</p>
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              Developed by{" "}
              <a
                href="https://me-mj.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:underline"
              >
                Mosanna Jalal
              </a>
              <span className="opacity-40">·</span>
              <a
                href="https://me-mj.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:underline"
              >
                MJX Web Studio
              </a>
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
      <NoticePopup />
    </main>
  );
}
