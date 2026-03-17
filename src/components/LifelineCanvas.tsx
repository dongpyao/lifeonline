import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Point {
  age: number;
  value: number; // -100 to 100
}

interface Milestone {
  age: number;
  label: string;
  description: string;
}

interface Props {
  startAge: number;
  endAge: number;
  currentAge: number;
  points: Point[];
  milestones: Milestone[];
  onPointsChange: (points: Point[]) => void;
  isEditable?: boolean;
  color?: string;
}

export default function LifelineCanvas({
  startAge,
  endAge,
  currentAge,
  points,
  milestones,
  onPointsChange,
  isEditable = true,
  color = "#1A1A1A"
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [hoverAge, setHoverAge] = useState<number | null>(null);

  const getAgeFromX = (x: number, width: number) => {
    const ratio = x / width;
    return startAge + ratio * (endAge - startAge);
  };

  const getXFromAge = (age: number, width: number) => {
    const ratio = (age - startAge) / (endAge - startAge);
    return ratio * width;
  };

  const getYFromValue = (value: number, height: number) => {
    const ratio = (value + 100) / 200;
    return height - ratio * height;
  };

  const getValueFromY = (y: number, height: number) => {
    const ratio = (height - y) / height;
    return ratio * 200 - 100;
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    const age = getAgeFromX(x, rect.width);
    setHoverAge(age);

    if (!isEditable || !isDrawing) return;

    const value = getValueFromY(y, rect.height);
    const newPoints = [...points];
    const existingIndex = newPoints.findIndex(p => Math.abs(p.age - age) < 0.5);
    
    if (existingIndex > -1) {
      newPoints[existingIndex] = { age, value };
    } else {
      newPoints.push({ age, value });
    }

    newPoints.sort((a, b) => a.age - b.age);
    onPointsChange(newPoints);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditable) return;
    setIsDrawing(true);
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isEditable) {
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  };

  // Generate smooth SVG path using Catmull-Rom or simple Bezier
  const generatePath = (width: number, height: number, isArea = false) => {
    if (points.length < 2) return "";
    
    let path = "";
    points.forEach((p, i) => {
      const x = getXFromAge(p.age, width);
      const y = getYFromValue(p.value, height);
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prev = points[i - 1];
        const prevX = getXFromAge(prev.age, width);
        const prevY = getYFromValue(prev.value, height);
        // Control points for smooth curve
        const cp1x = prevX + (x - prevX) / 2;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) / 2;
        const cp2y = y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    });

    if (isArea) {
      const firstX = getXFromAge(points[0].age, width);
      const lastX = getXFromAge(points[points.length - 1].age, width);
      path += ` L ${lastX} ${height} L ${firstX} ${height} Z`;
    }
    
    return path;
  };

  const gradientId = `grad-${color.replace('#', '')}`;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-64 md:h-96 border-b border-ink/10 lifeline-grid cursor-crosshair overflow-hidden group/canvas",
        !isEditable && "cursor-default"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { handleMouseUp(); setHoverAge(null); }}
      onTouchMove={handleTouchMove}
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

      {/* Grid Labels */}
      <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] opacity-30 pointer-events-none z-10 font-mono">
        巅峰 / PEAK
      </div>
      <div className="absolute left-4 bottom-4 text-[10px] uppercase tracking-[0.2em] opacity-30 pointer-events-none z-10 font-mono">
        低谷 / VALLEY
      </div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.2em] opacity-30 pointer-events-none z-10 font-mono">
        平稳 / NEUTRAL
      </div>

      <svg className="w-full h-full pointer-events-none overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="50%" stopColor={color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Baseline */}
        <line 
          x1="0" y1="50%" x2="100%" y2="50%" 
          stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-10" 
        />

        {/* Hover Guide */}
        {hoverAge !== null && containerRef.current && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <line 
              x1={getXFromAge(hoverAge, containerRef.current.clientWidth)} 
              y1="0" 
              x2={getXFromAge(hoverAge, containerRef.current.clientWidth)} 
              y2="100%" 
              stroke={color} strokeWidth="1" className="opacity-10"
            />
            <circle 
              cx={getXFromAge(hoverAge, containerRef.current.clientWidth)} 
              cy={getYFromValue(points.find(p => Math.abs(p.age - hoverAge!) < 1)?.value || 0, containerRef.current.clientHeight)}
              r="3"
              fill={color}
              className="opacity-40"
            />
            <text 
              x={getXFromAge(hoverAge, containerRef.current.clientWidth)} 
              y="25" 
              textAnchor="middle" 
              style={{ fill: color }}
              className="text-[10px] font-mono font-bold tracking-tighter"
            >
              {Math.round(hoverAge)} 岁
            </text>
          </motion.g>
        )}

        {/* Current Age Marker */}
        {containerRef.current && (
          <line 
            x1={getXFromAge(currentAge, containerRef.current.clientWidth)} 
            y1="0" 
            x2={getXFromAge(currentAge, containerRef.current.clientWidth)} 
            y2="100%" 
            stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-30"
          />
        )}

        {/* The Area Fill */}
        {containerRef.current && points.length >= 2 && (
          <motion.path
            d={generatePath(containerRef.current.clientWidth, containerRef.current.clientHeight, true)}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
        )}

        {/* The Line */}
        {containerRef.current && (
          <motion.path
            d={generatePath(containerRef.current.clientWidth, containerRef.current.clientHeight)}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}

        {/* Milestones */}
        {containerRef.current && milestones.map((m, i) => {
          const x = getXFromAge(m.age, containerRef.current!.clientWidth);
          const point = points.find(p => Math.abs(p.age - m.age) < 1) || { value: 0 };
          const y = getYFromValue(point.value, containerRef.current!.clientHeight);

          return (
            <g key={i} className="group/milestone">
              {/* Vertical Anchor Line */}
              <line 
                x1={x} y1={y} x2={x} y2={containerRef.current!.clientHeight} 
                stroke={color} strokeWidth="0.5" strokeDasharray="2 2" 
                className="opacity-20 group-hover/milestone:opacity-50 transition-opacity" 
              />
              
              <circle 
                cx={x} cy={y} r="4" 
                fill={color} 
                className="opacity-80 group-hover/milestone:scale-150 transition-transform" 
              />
              
              <g className="opacity-0 group-hover/milestone:opacity-100 transition-opacity">
                <rect 
                  x={x - 40} y={y - 35} width="80" height="20" rx="4" 
                  fill="white" stroke={color} strokeWidth="0.5" className="shadow-sm"
                />
                <text 
                  x={x} y={y - 21} 
                  textAnchor="middle" 
                  style={{ fill: color }}
                  className="text-[10px] font-serif italic font-medium"
                >
                  {m.label}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Age labels at bottom */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 py-1 text-[9px] font-mono opacity-40 pointer-events-none">
        <span>起始 {startAge} 岁</span>
        <span>终点 {endAge} 岁</span>
      </div>
    </div>
  );
}
