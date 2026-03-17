import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Plus, Send, User as UserIcon, Info } from 'lucide-react';
import { auth, signIn, logOut, db } from './firebase';
import LifelineCanvas from './components/LifelineCanvas';
import Gallery from './components/Gallery';
import { cn } from './lib/utils';

interface Point {
  age: number;
  value: number;
}

interface Milestone {
  age: number;
  label: string;
  description: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [lifelines, setLifelines] = useState<any[]>([]);
  
  // Local state for current drawing
  const [startAge, setStartAge] = useState(0);
  const [endAge, setEndAge] = useState(80);
  const [currentAge, setCurrentAge] = useState(25);
  const [points, setPoints] = useState<Point[]>([]);
  const [color, setColor] = useState("#1A1A1A");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({ age: 20, label: '', description: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'home' | 'draw' | 'gallery'>('home');

  const colors = [
    { name: '墨黑', value: '#1A1A1A' },
    { name: '朱砂', value: '#B22222' },
    { name: '石青', value: '#2F4F4F' },
    { name: '藤黄', value: '#DAA520' },
    { name: '黛蓝', value: '#000080' },
    { name: '胭脂', value: '#C71585' },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'lifelines'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLifelines(docs);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    if (!user) {
      signIn();
      return;
    }

    if (points.length < 2) {
      alert("请先绘制你的生命线。");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'lifelines'), {
        uid: user.uid,
        displayName: user.displayName || '匿名',
        startAge,
        endAge,
        currentAge,
        points,
        color,
        milestones,
        createdAt: serverTimestamp()
      });
      alert("你的生命线已分享。");
      setView('gallery');
    } catch (error) {
      console.error("Error saving:", error);
      alert("分享失败，请检查控制台。");
    } finally {
      setIsSaving(false);
    }
  };

  const addMilestone = () => {
    if (!newMilestone.label) return;
    setMilestones([...milestones, { ...newMilestone }]);
    setNewMilestone({ ...newMilestone, label: '', description: '' });
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-xs uppercase tracking-[0.3em] font-light"
        >
          Loading Journey...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-ink selection:text-paper">
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-24">
          <button 
            onClick={() => setView('home')}
            className="text-2xl font-serif italic tracking-tighter hover:opacity-70 transition-opacity"
          >
            生命线 / LIFELINE
          </button>

          <nav className="flex items-center gap-8">
            <button 
              onClick={() => setView('gallery')}
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all",
                view === 'gallery' ? "opacity-100 font-bold" : "opacity-40 hover:opacity-100"
              )}
            >
              画廊
            </button>
            <button 
              onClick={() => setView('draw')}
              className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all",
                view === 'draw' ? "opacity-100 font-bold" : "opacity-40 hover:opacity-100"
              )}
            >
              绘制
            </button>
            <div className="h-3 w-px bg-ink/10" />
            {user ? (
              <button onClick={logOut} className="group flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-widest">{user.displayName?.split(' ')[0]}</span>
                <LogOut size={12} />
              </button>
            ) : (
              <button onClick={signIn} className="group flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-widest">登录</span>
                <LogIn size={12} />
              </button>
            )}
          </nav>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-32"
              >
                {/* Hero Section */}
                <section className="space-y-12 py-12">
                  <div className="space-y-6">
                    <h1 className="text-6xl md:text-9xl font-serif italic tracking-tighter leading-[0.9]">
                      记录生命的<br />起伏与律动
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl opacity-60 font-serif italic leading-relaxed">
                      在这张无限延伸的画布上，勾勒出你的人生轨迹。标注那些让你欢笑、哭泣、成长与蜕变的瞬间。
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <button 
                      onClick={() => setView('draw')}
                      className="bg-ink text-paper px-10 py-5 rounded-full text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
                    >
                      开始绘制你的生命线
                    </button>
                    <button 
                      onClick={() => setView('gallery')}
                      className="border border-ink/20 px-10 py-5 rounded-full text-xs uppercase tracking-[0.2em] hover:bg-ink hover:text-paper transition-all"
                    >
                      浏览众生画廊
                    </button>
                  </div>
                </section>

                {/* Concept Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                  <div className="space-y-8">
                    <h2 className="text-4xl font-serif italic tracking-tight">为什么要绘制生命线？</h2>
                    <div className="space-y-6 text-sm opacity-60 leading-relaxed">
                      <p>生命并非一条直线，而是一系列波峰与波谷的交织。通过视觉化的方式呈现这些起伏，我们能更清晰地审视过去，理解当下的心境，并对未来抱有更深邃的期待。</p>
                      <p>在这里，每一条线都是独一无二的叙事。你不仅是在记录数据，更是在进行一场关于自我的视觉冥想。</p>
                    </div>
                  </div>
                  <div className="relative aspect-square bg-ink/[0.02] rounded-full flex items-center justify-center overflow-hidden border border-ink/[0.05]">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                    <motion.div 
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="w-2/3 h-2/3 border border-ink/10 rounded-full flex items-center justify-center"
                    >
                      <div className="w-1/2 h-px bg-ink/20" />
                    </motion.div>
                  </div>
                </section>

                {/* Stats / Teaser */}
                <section className="border-t border-ink/10 pt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <div className="text-5xl font-serif italic">{lifelines.length}+</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-40">已分享的生命故事</div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-5xl font-serif italic">∞</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-40">无限可能的未来勾勒</div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-5xl font-serif italic">100%</div>
                    <div className="text-[10px] uppercase tracking-widest opacity-40">纯粹的视觉表达</div>
                  </div>
                </section>
              </motion.div>
            )}

            {view === 'draw' && (
              <motion.div 
                key="draw"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-16"
              >
              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-ink/[0.02] rounded-2xl border border-ink/[0.05]">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">起始年龄</label>
                  <input 
                    type="number" 
                    value={startAge} 
                    onChange={(e) => setStartAge(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">当前年龄</label>
                  <input 
                    type="number" 
                    value={currentAge} 
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">预期终点</label>
                  <input 
                    type="number" 
                    value={endAge} 
                    onChange={(e) => setEndAge(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-ink/10 py-2 focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                  />
                </div>
              </div>

              {/* Canvas Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif italic">绘制你的趋势</h2>
                  <div className="flex items-center gap-2 text-[10px] opacity-40">
                    <Info size={12} />
                    <span>拖动以绘制你到 {currentAge} 岁的情绪或成就趋势</span>
                  </div>
                </div>
                
                <LifelineCanvas 
                  startAge={startAge}
                  endAge={endAge}
                  currentAge={currentAge}
                  points={points}
                  milestones={milestones}
                  onPointsChange={setPoints}
                  color={color}
                />
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setPoints([])}
                    className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    清除路径
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <h2 className="text-xl font-serif italic">选择你的色彩</h2>
                <div className="flex flex-wrap gap-4">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                        color === c.value 
                          ? "border-ink bg-ink text-paper" 
                          : "border-ink/10 hover:border-ink/30"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                      <span className="text-[10px] uppercase tracking-widest">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-8">
                <h2 className="text-xl font-serif italic">关键时刻</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40">年龄</label>
                    <input 
                      type="number" 
                      value={newMilestone.age} 
                      onChange={(e) => setNewMilestone({...newMilestone, age: Number(e.target.value)})}
                      className="w-full bg-transparent border-b border-ink/10 py-2 focus:outline-none focus:border-ink font-mono text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40">标签 (如：毕业、第一份工作)</label>
                    <input 
                      type="text" 
                      value={newMilestone.label} 
                      onChange={(e) => setNewMilestone({...newMilestone, label: e.target.value})}
                      placeholder="发生了什么？"
                      className="w-full bg-transparent border-b border-ink/10 py-2 focus:outline-none focus:border-ink text-sm"
                    />
                  </div>
                  <button 
                    onClick={addMilestone}
                    className="flex items-center justify-center gap-2 bg-ink text-paper py-3 px-6 rounded-full text-[10px] uppercase tracking-widest hover:bg-ink/90 transition-colors"
                  >
                    <Plus size={14} /> 添加时刻
                  </button>
                </div>

                <div className="flex flex-wrap gap-4">
                  {milestones.map((m, i) => (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={i} 
                      className="bg-ink/5 px-4 py-2 rounded-full flex items-center gap-3 border border-ink/5"
                    >
                      <span className="text-[10px] font-mono opacity-40">{m.age}</span>
                      <span className="text-xs font-serif italic">{m.label}</span>
                      <button 
                        onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}
                        className="opacity-40 hover:opacity-100"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-12 flex flex-col items-center gap-6">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="group relative flex items-center gap-4 bg-ink text-paper py-6 px-12 rounded-full text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? "分享中..." : "分享你的生命线"}
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                {!user && <p className="text-[10px] opacity-40 uppercase tracking-widest">需要登录后分享</p>}
              </div>
            </motion.div>
          )}

          {view === 'gallery' && (
              <motion.div 
                key="gallery"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Gallery lifelines={lifelines} />
              </motion.div>
            )}
        </AnimatePresence>
      </main>

      <footer className="mt-48 pt-12 border-t border-ink/5 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] opacity-30">
        <button onClick={() => setView('home')} className="hover:opacity-100 transition-opacity">© 2026 Lifeline Project</button>
        <div className="flex gap-8">
          <button onClick={() => setView('home')} className="hover:opacity-100 transition-opacity">Home</button>
          <span>Privacy</span>
          <span>Terms</span>
          <span>About</span>
        </div>
      </footer>
    </div>
    </div>
  );
}
