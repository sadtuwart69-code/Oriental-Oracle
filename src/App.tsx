/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { TRIGRAMS, TRIGRAM_NAMES, HEXAGRAM_NAMES } from './constants';

interface HexagramResult {
  benGua: number[];
  bianGua: number[];
  movingLine: number;
  benName: string;
  bianName: string;
  benPinyin?: string;
  bianPinyin?: string;
}

export default function App() {
  const [n1, setN1] = useState<string>('');
  const [n2, setN2] = useState<string>('');
  const [n3, setN3] = useState<string>('');
  const [result, setResult] = useState<HexagramResult | null>(null);

  const cast = () => {
    if (!n1 || !n2 || !n3) return;

    const num1 = parseInt(n1);
    const num2 = parseInt(n2);
    const num3 = parseInt(n3);

    const upper = TRIGRAMS[TRIGRAM_NAMES[num1 % 8]];
    const lower = TRIGRAMS[TRIGRAM_NAMES[num2 % 8]];
    const movingLine = (num3 - 1) % 6; // Adjust to 0-indexed, 1-6 input maps to 0-5

    const benGua = [...lower, ...upper];
    const bianGua = [...benGua];
    bianGua[movingLine] = bianGua[movingLine] === 1 ? 0 : 1;

    const benNameFull = HEXAGRAM_NAMES[benGua.join('')] || "Unknown Hexagram";
    const bianNameFull = HEXAGRAM_NAMES[bianGua.join('')] || "Unknown Hexagram";

    const splitName = (full: string) => {
      const match = full.match(/^(.*) \((.*)\)$/);
      return match ? { name: match[1], pinyin: match[2] } : { name: full, pinyin: "" };
    };

    const ben = splitName(benNameFull);
    const bian = splitName(bianNameFull);

    setResult({ 
      benGua, 
      bianGua, 
      movingLine, 
      benName: ben.name, 
      bianName: bian.name,
      benPinyin: ben.pinyin,
      bianPinyin: bian.pinyin
    });
  };

  const renderHexagramLines = (arr: number[], movingIdx: number | null) => {
    return (
      <div className="flex flex-col gap-3 items-center">
        {[...arr].reverse().map((val, i) => {
          const idx = 5 - i;
          const isMoving = idx === movingIdx;
          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-2 items-center"
            >
              {val === 1 ? (
                <div 
                  className={`h-2 w-32 rounded-full ${isMoving ? 'bg-[#FF4500] shadow-[0_0_10px_#FF4500]' : 'bg-[#D4AF37]'}`}
                />
              ) : (
                <div className="flex gap-4">
                  <div className={`h-2 w-14 rounded-full ${isMoving ? 'bg-[#FF4500] shadow-[0_0_10px_#FF4500]' : 'bg-[#D4AF37]'}`} />
                  <div className={`h-2 w-14 rounded-full ${isMoving ? 'bg-[#FF4500] shadow-[0_0_10px_#FF4500]' : 'bg-[#D4AF37]'}`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3a1510] blur-[120px] opacity-20 rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a1a1a] blur-[120px] opacity-40 rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-widest gold-text glow-gold mb-4 uppercase">
            Oriental Oracle
          </h1>
          <p className="text-sm tracking-[0.3em] text-white/40 uppercase font-sans">
            The Digital I Ching Divination System
          </p>
        </motion.header>

        <section className="w-full luxury-card p-8 md:p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-sans">Upper Trigram Seed</label>
              <input 
                type="number" 
                value={n1} 
                onChange={(e) => setN1(e.target.value)}
                placeholder="0-999"
                className="text-3xl py-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-sans">Lower Trigram Seed</label>
              <input 
                type="number" 
                value={n2} 
                onChange={(e) => setN2(e.target.value)}
                placeholder="0-999"
                className="text-3xl py-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-sans">Moving Line Seed</label>
              <input 
                type="number" 
                value={n3} 
                onChange={(e) => setN3(e.target.value)}
                placeholder="0-999"
                className="text-3xl py-2"
              />
            </div>
          </div>

          <button 
            onClick={cast}
            disabled={!n1 || !n2 || !n3}
            className="w-full py-4 bg-[#D4AF37] text-black font-medium tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#e5c158] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Decipher the Future
          </button>
        </section>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col items-center luxury-card p-8">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-sans mb-6">Original Hexagram</span>
                  {renderHexagramLines(result.benGua, result.movingLine)}
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl gold-text tracking-widest mb-1">{result.benName}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">{result.benPinyin}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center luxury-card p-8">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-sans mb-6">Transformed Hexagram</span>
                  {renderHexagramLines(result.bianGua, result.movingLine)}
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl gold-text tracking-widest mb-1">{result.bianName}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">{result.bianPinyin}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-12">
                <button 
                  onClick={() => window.open('https://easternoracle.gumroad.com/l/oracle29', '_blank')}
                  className="px-8 py-4 bg-transparent border border-[#D4AF37] text-[#D4AF37] text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black transition-all font-sans font-bold"
                >
                  Unlock Deep Destiny Blueprint
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-24 mb-12 text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/20">
            © 2026 Oriental Oracle System • Built for the Modern Seeker
          </p>
        </footer>
      </main>
    </div>
  );
}
