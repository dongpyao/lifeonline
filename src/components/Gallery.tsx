import React from 'react';
import { motion } from 'motion/react';
import LifelineCanvas from './LifelineCanvas';

interface Point {
  age: number;
  value: number;
}

interface Milestone {
  age: number;
  label: string;
  description: string;
}

interface LifelineData {
  id: string;
  displayName: string;
  startAge: number;
  endAge: number;
  currentAge: number;
  points: Point[];
  color: string;
  milestones: Milestone[];
  createdAt: any;
}

interface Props {
  lifelines: LifelineData[];
}

export default function Gallery({ lifelines }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
      {lifelines.map((life) => (
        <motion.div 
          key={life.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="bg-paper border border-ink/5 rounded-3xl p-6 md:p-8 space-y-6 hover:shadow-xl hover:shadow-ink/5 transition-all group"
        >
          <div className="flex justify-between items-start border-b border-ink/5 pb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-serif italic tracking-tight group-hover:text-ink transition-colors">
                {life.displayName} 的生命线
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">
                  {new Date(life.createdAt?.seconds * 1000).toLocaleDateString('zh-CN')}
                </p>
                <div className="w-1 h-1 rounded-full bg-ink/20" />
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">
                  {life.startAge} — {life.endAge} 岁
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full border border-ink/10 text-[10px] font-mono opacity-60">
              当前 {life.currentAge} 岁
            </div>
          </div>
          
          <div className="h-64 md:h-80 opacity-90 group-hover:opacity-100 transition-opacity">
            <LifelineCanvas 
              startAge={life.startAge}
              endAge={life.endAge}
              currentAge={life.currentAge}
              points={life.points}
              milestones={life.milestones}
              onPointsChange={() => {}}
              isEditable={false}
              color={life.color}
            />
          </div>

          {life.milestones.length > 0 && (
            <div className="pt-4 flex flex-wrap gap-x-4 gap-y-2">
              {life.milestones.slice(0, 4).map((m, i) => (
                <div key={i} className="text-[10px] flex items-center gap-1 border-r border-ink/10 pr-4 last:border-0">
                  <span className="font-mono opacity-40">[{m.age}]</span>
                  <span className="font-serif italic">{m.label}</span>
                </div>
              ))}
              {life.milestones.length > 4 && (
                <span className="text-[10px] opacity-20 italic">+{life.milestones.length - 4} 更多...</span>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
