"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export type HomeOffer = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  image: string;
  link: string;
};

type HomeOffersSliderProps = {
  offers: HomeOffer[];
};

const AUTO_INTERVAL_MS = 2000;

export default function HomeOffersSlider({ offers }: HomeOffersSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenImageIds, setBrokenImageIds] = useState<string[]>([]);
  const touchStartX = useRef<number | null>(null);

  const hasOffers = offers.length > 0;
  const safeActiveIndex = hasOffers ? activeIndex % offers.length : 0;
  const currentOffer = hasOffers ? offers[safeActiveIndex] : null;

  useEffect(() => {
    if (!hasOffers || offers.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hasOffers, offers.length]);

  const slideStyle = useMemo(
    () => ({ transform: `translateX(-${safeActiveIndex * 100}%)` }),
    [safeActiveIndex],
  );

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!hasOffers || offers.length < 2 || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) < 45) return;
    if (delta < 0) {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + offers.length) % offers.length);
    }
    touchStartX.current = null;
  }

  if (!hasOffers) {
    return (
      <section className="overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-rose-100/40 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-zinc-500">Offres</p>
            <p className="mt-1 text-xl font-bold text-[#97002f]">Aucune offre active</p>
            <p className="mt-1 text-sm text-zinc-600">
              Revenez bientot pour decouvrir nos promotions en cours.
            </p>
          </div>
          <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-sm font-semibold text-[#97002f] sm:flex">
            DStore
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/70 shadow-sm">
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="overflow-hidden">
        <div
          className="flex w-full transition-transform duration-500 ease-out"
          style={slideStyle}
        >
          {offers.map((offer) => (
            <article key={offer.id} className="min-w-full p-2 sm:p-3">
              <Link href={offer.link || "/promotions"} className="block">
                <div className="relative h-[180px] w-full overflow-hidden rounded-xl md:h-[220px]">
                  {offer.image && !brokenImageIds.includes(offer.id) ? (
                    <Image
                      src={offer.image || "/placeholder.jpg"}
                      alt={offer.title || "Offre"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 900px"
                      onError={() =>
                        setBrokenImageIds((prev) =>
                          prev.includes(offer.id) ? prev : [...prev, offer.id],
                        )
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#97002f] to-[#b0134d] text-lg font-semibold text-white">
                      DStore
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-4 text-white md:p-5">
                      <p className="text-sm text-white/85">{offer.subtitle || "Offres speciales"}</p>
                      <p className="mt-1 line-clamp-2 text-2xl font-bold leading-tight md:text-3xl">
                        {offer.title || "Offre"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/90">
                        {offer.description || "Decouvrez nos offres exclusives."}
                      </p>
                      <span className="mt-3 inline-flex rounded-xl bg-[#97002f] px-4 py-2 text-sm font-semibold text-white">
                        {offer.buttonText || "Decouvrir"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
      <div className="pb-3">
        <div className="flex items-center justify-center gap-1.5">
          {offers.map((offer, index) => (
            <button
              key={offer.id}
              type="button"
              aria-label={`Afficher l'offre ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                safeActiveIndex === index ? "w-5 bg-[#97002f]" : "w-2 bg-[#97002f]/35"
              }`}
            />
          ))}
        </div>
      </div>
      {currentOffer ? (
        <div className="sr-only" aria-live="polite">
          Offre active: {currentOffer.title}
        </div>
      ) : null}
    </section>
  );
}
