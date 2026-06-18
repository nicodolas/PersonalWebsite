"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  "NEKO.OS v4.0.0 (x86_64-neko-desktop)",
  "Initializing system memory check... 16GB RAM [OK]",
  "Loading kernel modules [fs, net, sys, input]... Done.",
  "Mounting digital presence at nekovibecoder.site...",
  "Retrieving environment settings... MODE=PUBLIC [OK]",
  "Connecting to GitHub servers (https://api.github.com)...",
  "Fetching profile metadata for 'nicodolas'...",
  "Found 4 public core repositories...",
  "Found 1,500+ commit records...",
  "Caching timeline events and achievements locally...",
  "Parsing Developer DNA: Builder(92%), Automator(88%), Researcher(80%)...",
  "Initializing GreenSock Animation Engine (GSAP v3.15)... [SUCCESS]",
  "Applying CRT phosphor simulation scanlines...",
  "System boot sequence completed.",
  "Ready to accept visitor input.",
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in skip button
      gsap.fromTo(
        skipRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5 }
      );

      // Sequentially print lines
      let delay = 0.1;
      bootLines.forEach((line, index) => {
        setTimeout(() => {
          setLogs((prev) => [...prev, line]);
          // Scroll to bottom
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
          
          // Trigger completion on last line after a small delay
          if (index === bootLines.length - 1) {
            gsap.delayedCall(1.2, onComplete);
          }
        }, delay * 1000);
        
        // Add random slight delay to make it look realistic
        delay += 0.15 + Math.random() * 0.25;
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#05070a] text-[#00ff66] font-mono p-6 md:p-12 overflow-y-auto select-none crt-screen"
    >
      <div className="scanline-effect"></div>
      
      {/* Top Header bar */}
      <div className="flex justify-between items-center border-b border-[#00ff66]/30 pb-3 mb-6">
        <span className="text-xs uppercase tracking-widest font-bold glow-green">
          System Boot Sequence
        </span>
        <button
          ref={skipRef}
          onClick={onComplete}
          className="px-3 py-1 border border-[#00ff66] text-xs hover:bg-[#00ff66] hover:text-[#05070a] transition-all cursor-pointer font-bold rounded"
        >
          SKIP BOOT
        </button>
      </div>

      {/* Logging content */}
      <div className="space-y-2 text-sm md:text-base max-w-4xl mx-auto">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start">
            <span className="text-[#00ccff] mr-3 shrink-0 select-none">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span className="leading-relaxed whitespace-pre-wrap">{log}</span>
          </div>
        ))}
        
        {logs.length < bootLines.length && (
          <div className="flex items-center text-sm md:text-base mt-2">
            <span className="text-[#00ccff] mr-3 shrink-0">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span className="text-[#00ff66] opacity-75">Loading system modules...</span>
            <span className="blinking-cursor"></span>
          </div>
        )}
      </div>
    </div>
  );
}
