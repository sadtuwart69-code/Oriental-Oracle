/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, ArrowRight, ChevronRight, Loader2, TrendingUp, User, Calendar, Clock } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
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

interface BirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
}


const ICHING_CONTENT: Record<string, { title: string; content: string }> = {
    "Asking Questions": {
      title: "Asking Questions",
      content: "Asking questions for Yi divination is like getting to know a new friend in conversation. Our communication reflects what is going on inside of us. Getting more clarity in our answers tends to happen as we learn to create more specific clarity with how we communicate. The Yi is a mirror, reflecting the quality of our inquiry back to us."
    },
    "Cosmology of Change": {
      title: "Cosmology of Change",
      content: "A cosmology of change begins with the concept of Nothing and Something. From the void (Wuji) comes the supreme ultimate (Taiji), which then divides into the two forces of Yin and Yang. These further divide into the four forces and finally the eight elemental forces (Trigrams) that form the basis of all existence. This cycle of expansion and contraction is the heartbeat of the universe."
    },
    "Four Virtues of Change": {
      title: "Four Virtues of Change",
      content: "The four virtues of change—Yuan, Heng, Li, and Zhen—represent the cycle of the seasons and the stages of any process. Yuan is the beginning, the spring; Heng is the growth, the summer; Li is the harvest, the autumn; and Zhen is the storage, the winter. Understanding these virtues allows one to align their actions with the natural flow of time."
    },
    "Core Characters of Change": {
      title: "Core Characters of Change",
      content: "The core characters of the I-Ching are the foundational symbols that represent the building blocks of reality. These include the solid line (Yang) and the broken line (Yin), which combine to form the eight trigrams and sixty-four hexagrams. Each character carries a specific frequency and meaning, acting as a language for the soul."
    },
    "Yi Jing | I Ching": {
      title: "Yi Jing | I Ching",
      content: "The Yi Jing, or I-Ching, is the oldest of the Chinese classic texts. It is a system of symbols used to identify order in what may seem like chance events. The book consists of 64 hexagrams, each with its own name, image, and judgment, providing a comprehensive map of human experience and cosmic law."
    },
    "Unchanging Hexagrams": {
      title: "Unchanging Hexagrams",
      content: "When a hexagram is cast without any moving lines, it is called an unchanging hexagram. This represents a state of stability or a situation where the core essence of the hexagram is fully present without immediate transformation. It is a call to deeply contemplate the current state of affairs and find the 'still point' within the change."
    },
    "The King Wen Sequence": {
      title: "The King Wen Sequence",
      content: "The King Wen sequence is the traditional ordering of the 64 hexagrams. It is a profound arrangement that tells the story of the evolution of consciousness and the development of human society. The sequence moves from the pure creative and receptive forces to the final state of 'Not Yet Crossed Over,' symbolizing the eternal nature of change."
    },
    "The Great Commentary": {
      title: "The Great Commentary",
      content: "The Xici Zhuan, or Great Commentary, is one of the most important 'Ten Wings' of the I-Ching. It provides a philosophical framework for understanding the book, explaining how the sages created the system to mirror the laws of heaven and earth. It emphasizes the importance of self-cultivation and living in harmony with the Dao."
    },
    "The Yi Zodiac": {
      title: "The Yi Zodiac",
      content: "The Yi Zodiac correlates the 64 hexagrams with the cycles of the sun, moon, and planets. It is a sophisticated system of astrology that uses the I-Ching as its primary tool. By understanding the seasonal breath and planetary influences, one can better navigate the currents of destiny."
    },
    "Wanglai": {
      title: "Wanglai",
      content: "Wanglai, or 'Coming and Going,' refers to the dynamic interplay between the different lines and hexagrams. It is the study of how energy flows through the system, moving from one state to another. This concept highlights the interconnectedness of all things and the fluid nature of reality."
    },
    "Wordsimagesideas": {
      title: "Wordsimagesideas",
      content: "The I-Ching uses words, images, and ideas to communicate its wisdom. Words provide the structure, images provide the feeling, and ideas provide the meaning. By working with all three, the practitioner can gain a deeper, more holistic understanding of the messages being conveyed by the Oracle."
    }
  };

  const DAO_CONTENT: Record<string, { title: string; content: string }> = {
    "The Way": {
      title: "The Way",
      content: "The Way, or Dao, is the underlying principle of the universe. it is the source of all things and the path that leads back to the origin. It is wordless, formless, and eternal. To follow the Way is to live in accordance with nature, practicing non-action (Wu Wei) and maintaining a state of inner peace and balance."
    },
    "The Original Spirit of Dao De Jing": {
      title: "The Original Spirit of Dao De Jing",
      content: "The Dao De Jing is the foundational text of Daoism, attributed to the sage Laozi. Its original spirit is one of simplicity, humility, and profound wisdom. It teaches that the soft overcomes the hard and that true power comes from yielding. By returning to the 'uncarved block,' we can rediscover our true nature."
    },
    "The Breath of Dao": {
      title: "The Breath of Dao",
      content: "The Breath of Dao refers to the movement of Qi through the universe and the human body. It is the life force that animates all things. Through practices like Qi Gong and meditation, we can learn to harmonize our own breath with the cosmic breath, leading to health, longevity, and spiritual awakening."
    },
    "Withdrawal from Attachment": {
      title: "Withdrawal from Attachment",
      content: "Withdrawal from attachment is a key practice in Daoist cultivation. It involves letting go of desires, expectations, and the ego's need for control. By withdrawing from the external world and turning inward, we can find the stillness that allows the Dao to manifest within us. This is the path to true freedom."
    },
    "Gu San Fen": {
      title: "Gu San Fen",
      content: "Gu San Fen is an ancient Daoist concept describing the stages of cosmic inception. It moves from primordial chaos (Hun Dun) to the Great Inception (Tai Shi), then to the Great Birth (Tai Chu), and finally to the Great Innocence (Tai Su). This sequence explains how the myriad things emerge from the void and return to it."
    },
    "Ling Bao Bi Fa": {
      title: "Ling Bao Bi Fa",
      content: "The Ling Bao Bi Fa is a classic text on internal alchemy (Neidan). It provides detailed instructions on how to refine the body's energy and achieve spiritual immortality. It emphasizes the importance of the meridian clock, the timing of practices, and the harmonization of the internal and external environments."
    },
    "Dual Cultivation of Xing and Ming": {
      title: "Dual Cultivation of Xing and Ming",
      content: "The dual cultivation of Xing (Innate Nature) and Ming (Life/Destiny) is the hallmark of Daoist practice. Xing refers to the mind and spirit, while Ming refers to the body and energy. By cultivating both simultaneously, the practitioner can achieve a state of complete integration and harmony, leading to the realization of the Dao."
    },
    "Stylistic Lineage Tree": {
      title: "Stylistic Lineage Tree",
      content: "The stylistic lineage tree of Daoist practices shows the historical development and transmission of various internal arts, such as Tai Chi and Qi Gong. It traces the connections between different masters and schools, highlighting the evolution of techniques and the preservation of ancient wisdom through the generations."
    }
  };

// --- View Components ---

const IChingView = ({ 
  ichingTopic, 
  setIchingTopic, 
  ICHING_CONTENT 
}: { 
  ichingTopic: string | null; 
  setIchingTopic: (t: string | null) => void; 
  ICHING_CONTENT: any 
}) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="w-full max-w-4xl flex flex-col gap-12"
  >
    <div className="luxury-card p-8 md:p-12">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!ichingTopic ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-4xl gold-text mb-4 font-serif italic">The Book of Change</h2>
                <p className="text-lg leading-relaxed text-white/80 mb-8">
                  The I-Ching, or Yi Jing, is a Classical Book about Change. 
                  It may be used to understand change, follow the seasons, or for divination.
                  Explore the knowledge base to deepen your understanding of this ancient wisdom.
                </p>
                <div className="p-6 bg-white/5 border-l-2 border-[#D4AF37] mb-8">
                  <h3 className="text-sm uppercase tracking-widest gold-text mb-4">The Art of Asking</h3>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    "Asking questions for Yi divination is like getting to know a new friend in conversation. 
                    Our communication reflects what is going on inside of us."
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="article"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <button 
                  onClick={() => setIchingTopic(null)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] mb-8 hover:opacity-70 transition-opacity"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to Knowledge Base
                </button>
                <h2 className="text-3xl gold-text mb-6 font-serif italic">{ICHING_CONTENT[ichingTopic].title}</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-white/80">
                    {ICHING_CONTENT[ichingTopic].content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="w-full md:w-64 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-sans border-b border-white/10 pb-2">Knowledge Base</span>
          {Object.keys(ICHING_CONTENT).map((topic) => (
            <div 
              key={topic} 
              onClick={() => setIchingTopic(topic)}
              className={`py-2 border-b border-white/5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer group ${ichingTopic === topic ? 'border-[#D4AF37]' : ''}`}
            >
              <span className={`text-[10px] tracking-widest uppercase transition-colors ${ichingTopic === topic ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`}>
                {topic}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const DaoView = ({ 
  daoTopic, 
  setDaoTopic, 
  DAO_CONTENT 
}: { 
  daoTopic: string | null; 
  setDaoTopic: (t: string | null) => void; 
  DAO_CONTENT: any 
}) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="w-full max-w-4xl flex flex-col gap-12"
  >
    <div className="luxury-card p-8 md:p-12">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {!daoTopic ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-4xl gold-text mb-4 font-serif italic">The Way of Dao</h2>
                <p className="text-lg leading-relaxed text-white/80 mb-8">
                  What is dao? A way that goes somewhere. From nothing, came something. And our universe. 
                  The way is the way that leads back to our origin.
                </p>
                <div className="p-6 bg-white/5 border-l-2 border-[#D4AF37] mb-8">
                  <h3 className="text-sm uppercase tracking-widest gold-text mb-4">The Original Spirit</h3>
                  <p className="text-sm text-white/60 leading-relaxed italic">
                    "We need to cultivate light to return to the origin of light. So we empty our minds, 
                    and listen, and discover there is a way to follow. To return."
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="article"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col"
              >
                <button 
                  onClick={() => setDaoTopic(null)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] mb-8 hover:opacity-70 transition-opacity"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" />
                  Back to The Path
                </button>
                <h2 className="text-3xl gold-text mb-6 font-serif italic">{DAO_CONTENT[daoTopic].title}</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-white/80">
                    {DAO_CONTENT[daoTopic].content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="w-full md:w-64 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-sans border-b border-white/10 pb-2">The Path</span>
          {Object.keys(DAO_CONTENT).map((topic) => (
            <div 
              key={topic} 
              onClick={() => setDaoTopic(topic)}
              className={`py-2 border-b border-white/5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer group ${daoTopic === topic ? 'border-[#D4AF37]' : ''}`}
            >
              <span className={`text-[10px] tracking-widest uppercase transition-colors ${daoTopic === topic ? 'text-[#D4AF37]' : 'group-hover:text-[#D4AF37]'}`}>
                {topic}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const LifeKLineView = ({
  birthInfo,
  setBirthInfo,
  lifeChartData,
  isCalculating,
  handleCalculateLife
}: {
  birthInfo: BirthInfo;
  setBirthInfo: (b: BirthInfo) => void;
  lifeChartData: any[] | null;
  isCalculating: boolean;
  handleCalculateLife: () => void;
}) => {
  const chartOption = {
    backgroundColor: 'transparent',
    title: {
      text: '100-Year Life Fortune K-Line',
      left: 'center',
      textStyle: { color: '#D4AF37', fontSize: 16, fontWeight: 'lighter', fontFamily: 'serif' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#D4AF37',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const data = params[0].data;
        return `
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="color: #D4AF37; margin-bottom: 4px;">Age: ${params[0].name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>Open:</span> <span>${data[1]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>Close:</span> <span>${data[2]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>Low:</span> <span>${data[3]}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>High:</span> <span>${data[4]}</span>
            </div>
            <div style="margin-top: 4px; color: ${data[2] >= data[1] ? '#2ecc71' : '#e74c3c'}">
              Trend: ${data[2] >= data[1] ? 'Auspicious' : 'Inauspicious'}
            </div>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'category',
      name: 'Age',
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
      data: Array.from({ length: 100 }, (_, i) => `${i + 1}`),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 }
    },
    yAxis: {
      scale: true,
      name: 'Fortune Score (0-100)',
      nameTextStyle: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 30 },
      { type: 'slider', start: 0, end: 30, bottom: 0, height: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'transparent', fillerColor: 'rgba(212, 175, 55, 0.1)', handleStyle: { color: '#D4AF37' } }
    ],
    series: [
      {
        type: 'candlestick',
        data: lifeChartData,
        itemStyle: {
          color: '#2ecc71',      // Good: Green
          color0: '#e74c3c',     // Bad: Red
          borderColor: '#2ecc71',
          borderColor0: '#e74c3c'
        }
      }
    ]
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    let value = input.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = value;
    if (value.length > 4) {
      formatted = value.slice(0, 4) + '/' + value.slice(4);
    }
    if (value.length > 6) {
      formatted = formatted.slice(0, 7) + '/' + value.slice(6);
    }

    setBirthInfo({ ...birthInfo, birthDate: formatted });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full max-w-4xl flex flex-col gap-8"
    >
      <div className="luxury-card p-8 md:p-12">
        <div className="flex flex-col gap-12">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
            <h2 className="text-3xl gold-text font-serif italic mb-2 text-center">Life Destiny Quant</h2>
            <p className="text-sm text-white/60 leading-relaxed text-center">
              Quantifying traditional Bazi destiny into a financial-grade K-Line chart. 
              Green bars represent auspicious years, while red bars indicate periods of challenge.
            </p>
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={birthInfo.name}
                  onChange={(e) => setBirthInfo({...birthInfo, name: e.target.value})}
                  placeholder="Enter your name"
                  className="bg-white/5 border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-all text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date of Birth (Year/Month/Day)
                  </label>
                  <input 
                  type="text" 
                  value={birthInfo.birthDate}
                  onChange={handleDateChange}
                  placeholder="YYYY/MM/DD"
                  maxLength={10}
                  className="bg-white/5 border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-all"
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Birth Time
                    </label>
                    <input 
                      type="time" 
                      value={birthInfo.birthTime}
                      onChange={(e) => setBirthInfo({...birthInfo, birthTime: e.target.value})}
                      className="bg-white/5 border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Gender</label>
                    <select 
                      value={birthInfo.gender}
                      onChange={(e) => setBirthInfo({...birthInfo, gender: e.target.value as any})}
                      className="bg-white/5 border border-white/10 p-4 text-white focus:border-[#D4AF37] outline-none transition-all appearance-none"
                    >
                      <option value="male" className="bg-[#1a1a1a]">Male</option>
                      <option value="female" className="bg-[#1a1a1a]">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCalculateLife}
                disabled={!birthInfo.name || !birthInfo.birthDate || isCalculating}
                className="mt-4 py-5 bg-[#D4AF37] text-black font-bold tracking-widest uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#e5c158] disabled:opacity-30 transition-all shadow-lg"
              >
                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                Quantify My Life
              </button>
            </div>
          </div>

          <AnimatePresence>
            {lifeChartData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 w-full"
              >
                <div className="p-6 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-sm">
                  <h3 className="text-[10px] uppercase tracking-widest gold-text mb-4 flex items-center gap-2">
                    <Info className="w-3 h-3" /> How to Read Your Life K-Line
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] text-white/50 leading-relaxed">
                    <div className="flex flex-col gap-2">
                      <p>• <b>Body (Thick Part):</b> Represents the fortune trend from the start of the year (Open) to the end (Close).</p>
                      <p>• <b>Wicks (Thin Lines):</b> The vertical lines show the peak potential (High) and the lowest challenges (Low) of that year.</p>
                      <p>• <b>Thickness:</b> A taller body indicates a significant change in fortune during that year.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p>• <b className="text-[#2ecc71]">Green Bars:</b> Auspicious trend. Your fortune closed higher than it opened.</p>
                      <p>• <b className="text-[#e74c3c]">Red Bars:</b> Inauspicious trend. Challenges led to a lower closing fortune.</p>
                      <p>• <b>Interaction:</b> Scroll or pinch to zoom. Hover for precise scores at any age.</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-[500px] bg-white/5 border border-white/10 p-4 md:p-8 rounded-sm">
                  <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [view, setView] = useState<'oracle' | 'iching' | 'dao' | 'lifeline'>('oracle');
  const [n1, setN1] = useState<string>('');
  const [n2, setN2] = useState<string>('');
  const [n3, setN3] = useState<string>('');
  const [result, setResult] = useState<HexagramResult | null>(null);

  // Life K-Line State
  const [birthInfo, setBirthInfo] = useState<BirthInfo>({
    name: '',
    gender: 'male',
    birthDate: '',
    birthTime: '12:00'
  });
  const [lifeChartData, setLifeChartData] = useState<any[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [ichingTopic, setIchingTopic] = useState<string | null>(null);
  const [daoTopic, setDaoTopic] = useState<string | null>(null);

  const generateLifeData = (info: BirthInfo) => {
    const seed = info.name.length + new Date(info.birthDate).getTime() + parseInt(info.birthTime.split(':')[0]);
    const data = [];
    
    // Deterministic random generator based on seed
    const pseudoRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    for (let age = 1; age <= 100; age++) {
      const ageSeed = seed + age;
      // Base cycle (representing 10-year luck cycles)
      const cycle = Math.sin(age / 10) * 15 + 50;
      
      // Open: Base score for the year
      const open = Math.round(cycle + (pseudoRandom(ageSeed) * 10 - 5));
      
      // Close: Year-end summary
      const close = Math.round(cycle + (pseudoRandom(ageSeed + 0.1) * 20 - 10));
      
      // High: Peak month
      const high = Math.max(open, close) + Math.round(pseudoRandom(ageSeed + 0.2) * 15);
      
      // Low: Taisui/Clash point
      const low = Math.min(open, close) - Math.round(pseudoRandom(ageSeed + 0.3) * 15);

      data.push([
        Math.min(100, Math.max(0, open)),
        Math.min(100, Math.max(0, close)),
        Math.min(100, Math.max(0, low)),
        Math.min(100, Math.max(0, high))
      ]);
    }
    return data;
  };

  const handleCalculateLife = () => {
    if (!birthInfo.name || !birthInfo.birthDate) return;
    setIsCalculating(true);
    setTimeout(() => {
      const data = generateLifeData(birthInfo);
      setLifeChartData(data);
      setIsCalculating(false);
    }, 1500);
  };

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
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3a1510] blur-[120px] opacity-20 rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a1a1a] blur-[120px] opacity-40 rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 w-full max-w-4xl flex justify-center gap-8 mb-16 border-b border-white/10 pb-6">
        {[
          { id: 'oracle', label: 'Oracle', icon: Sparkles },
          { id: 'iching', label: 'I-Ching', icon: Info },
          { id: 'dao', label: 'Dao', icon: ArrowRight },
          { id: 'lifeline', label: 'Life K-Line', icon: TrendingUp }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] transition-all ${
              view === item.id ? 'gold-text glow-gold' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <item.icon className="w-3 h-3" />
            {item.label}
          </button>
        ))}
      </nav>

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
            {view === 'oracle' ? 'The Digital I Ching Divination System' : 
             view === 'iching' ? 'Wisdom of the Changes' : 
             view === 'dao' ? 'The Eternal Way' : 'Life Fortune Quantification'}
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {view === 'oracle' && (
            <motion.div 
              key="oracle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
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
            </motion.div>
          )}

          {view === 'iching' && (
            <IChingView 
              ichingTopic={ichingTopic} 
              setIchingTopic={setIchingTopic} 
              ICHING_CONTENT={ICHING_CONTENT} 
            />
          )}
          {view === 'dao' && (
            <DaoView 
              daoTopic={daoTopic} 
              setDaoTopic={setDaoTopic} 
              DAO_CONTENT={DAO_CONTENT} 
            />
          )}
          {view === 'lifeline' && (
            <LifeKLineView 
              birthInfo={birthInfo}
              setBirthInfo={setBirthInfo}
              lifeChartData={lifeChartData}
              isCalculating={isCalculating}
              handleCalculateLife={handleCalculateLife}
            />
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
