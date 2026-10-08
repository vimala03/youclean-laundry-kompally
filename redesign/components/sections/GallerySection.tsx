"use client";

import { useEffect, useRef } from "react";

const PHOTOS = [
  {
    src: "/assets/laundry-folded.jpg",
    alt: "Freshly folded laundry stacked neatly",
    caption: "Wash & Fold",
    sub: "Sorted, washed, neatly packed",
    aspect: "tall",
  },
  {
    src: "/assets/hangers.jpg",
    alt: "Clean garments on hangers in a bright studio",
    caption: "Dry Cleaning",
    sub: "Fabric-safe process",
    aspect: "wide",
  },
  {
    src: "/assets/curtains.jpg",
    alt: "Soft curtains with sunlight",
    caption: "Home Textiles",
    sub: "Curtains cleaned fresh",
    aspect: "wide",
  },
];

export default function GallerySection() {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const items = galleryRef.current?.querySelectorAll<HTMLElement>(".gallery-item");
      if (!items) return;

      items.forEach((item, i) => {
        gsap.fromTo(
          item,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 1, ease: "power3.out",
            delay: i * 0.12,
            scrollTrigger: { trigger: item, start: "top 85%", once: true },
          }
        );

        // Parallax on image within
        const img = item.querySelector("img");
        if (img) {
          gsap.to(img, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }
    init();
  }, []);

  return (
    <section
      id="gallery"
      className="py-24 lg:py-36"
      style={{ background: "#FAF7F2" }}
    >
      <div className="container-yk">
        <div className="mb-14">
          <p className="eyebrow mb-6" style={{ color: "#1A4B35" }}>
            Real results
          </p>
          <h2 className="section-heading text-ink">
            Clean, cared,
            <br />
            <em className="italic font-light">delivered.</em>
          </h2>
        </div>

        <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Tall left card */}
          <div
            className="gallery-item md:col-span-5 relative rounded-2xl overflow-hidden group"
            style={{ height: "clamp(320px, 60vh, 600px)", opacity: 0 }}
            data-cursor="view"
          >
            <img
              src={PHOTOS[0].src}
              alt={PHOTOS[0].alt}
              className="w-full h-[120%] object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: "center" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(10,9,8,0.7) 0%, transparent 50%)",
              }}
            />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="font-cormorant text-parchment font-light text-3xl leading-tight">
                {PHOTOS[0].caption}
              </p>
              <p className="font-dm-sans text-parchment/50 text-xs tracking-wide mt-1">
                {PHOTOS[0].sub}
              </p>
            </div>
          </div>

          {/* Right column: 2 stacked */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {PHOTOS.slice(1).map((photo, i) => (
              <div
                key={photo.src}
                className="gallery-item relative rounded-2xl overflow-hidden group"
                style={{ height: "clamp(180px, 25vh, 280px)", opacity: 0 }}
                data-cursor="view"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-[130%] object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: "center" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(10,9,8,0.5) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="font-cormorant text-parchment font-light text-2xl leading-tight">
                    {photo.caption}
                  </p>
                  <p className="font-dm-sans text-parchment/50 text-xs tracking-wide mt-1">
                    {photo.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
