"use client";
import { Button } from "@/components/Button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  return (
    <motion.section
      ref={sectionRef}
      className="relative h-[492px] md:h-[800px] flex items-center overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] 2xl:-mt-32"

    >
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-[-2]"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(75%_75%_at_center_center,rgb(0,69,255,0.5)_15%,rgb(0,0,36,0.5)_78%,transparent)]" />

      {/* Rings */}
      {/* <motion.div
        style={{ translateY: "-50%", translateX: "-50%" }}
        animate={{ rotate: "1turn" }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute size-[344px] md:size-[580px] border border-white opacity-20 top-1/2 left-1/2 rounded-full"
      >
        <div className="absolute size-2 bg-white top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute size-2 bg-white top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute size-5 border border-white top-1/2 left-full -translate-x-1/2 -translate-y-1/2 rounded-full flex justify-center items-center">
          <div className="size-2 bg-white rounded-full"></div>
        </div>
      </motion.div> */}

      {/* <motion.div
        style={{ translateY: "-50%", translateX: "-50%" }}
        animate={{ rotate: "-1turn" }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="absolute size-[444px] md:size-[780px] border border-dashed border-white/20 top-1/2 left-1/2 rounded-full"
      ></motion.div>

      <motion.div
        style={{ translateY: "-50%", translateX: "-50%" }}
        animate={{ rotate: "1turn" }}
        transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
        className="absolute size-[544px] md:size-[980px] border border-white opacity-20 top-1/2 left-1/2 rounded-full"
      >
        <div className="absolute size-2 bg-gray-400 top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute size-2 bg-white top-1/2 left-full -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
      </motion.div> */}

      {/* Hero Content */}
      <div className="container relative mt-16">
        <h1 className="text-6xl md:text-[170px] md:leading-none font-semibold tracking-tighter text-center bg-white text-transparent bg-clip-text">
          AHURA MAXDA
        </h1>
        {/* <p className="text-lg md:text-xl text-white/70 mt-5 text-center max-w-xl mx-auto">
          The one stop tool for effective digital dominance.
        </p> */}
        <div className="flex justify-center p-8 mt-24">
          <Link href="/services"><Button classname="p-4">Get Started</Button></Link>
        </div>
      </div>
    </motion.section>
  );
};
