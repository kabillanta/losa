"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const images = [
  { src: "/1.JPG", alt: "Students competing" },
  { src: "/2.JPG", alt: "Science exhibition" },
  { src: "/3.JPG", alt: "Stage performance" },
  { src: "/4.JPG", alt: "Audience cheering" },
];

export function HorizontalGallery() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden bg-onyx w-full">
      {/* Decorative Eyebrow (Limit: 1 per 3 sections, so this is okay) */}
      <div className="absolute top-12 left-6 md:left-12 z-20 mix-blend-difference text-white">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
          EVENT HIGHLIGHTS
        </span>
      </div>

      <div ref={track} className="flex h-[100dvh] items-center gap-12 px-[10vw] md:px-[20vw]">
        {images.map((img, i) => (
          <div 
            key={i} 
            className="relative shrink-0 w-[80vw] sm:w-[60vw] md:w-[45vw] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl shadow-black/40"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 80vw, 45vw"
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/10 ring-1 ring-inset ring-white/10" />
          </div>
        ))}
        {/* Empty padding block at the end to allow the last image to stop in the center */}
        <div className="shrink-0 w-[10vw] md:w-[20vw]" />
      </div>
    </section>
  );
}
