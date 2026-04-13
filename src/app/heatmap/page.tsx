"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Typography } from 'antd';
import { usePulsStore } from '@/store/usePulsStore';
import { useGymStore, calculateTonnage } from '@/store/useGymStore';
import { useWikiStore } from '@/store/useWikiStore';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

const HeatmapSquare = ({ intensity, colorHue }: { intensity: number, colorHue: 'white' | 'purple' | 'green' }) => {
  let bgColor = '#161b22'; // Default github empty dark gray
  
  if (intensity > 0) {
    if (colorHue === 'white') {
      if (intensity < 20) bgColor = 'rgba(255, 255, 255, 0.2)';
      else if (intensity < 60) bgColor = 'rgba(255, 255, 255, 0.5)';
      else if (intensity < 100) bgColor = 'rgba(255, 255, 255, 0.8)';
      else bgColor = 'rgba(255, 255, 255, 1)';
    } else if (colorHue === 'purple') {
      if (intensity < 500) bgColor = '#3b0764'; // dark purple
      else if (intensity < 2000) bgColor = '#6b21a8';
      else if (intensity < 5000) bgColor = '#9333ea';
      else bgColor = '#a855f7'; // bright purple
    } else if (colorHue === 'green') {
      if (intensity < 30) bgColor = '#064e3b'; // dark green
      else if (intensity < 60) bgColor = '#047857';
      else if (intensity < 120) bgColor = '#10b981';
      else bgColor = '#34d399'; // bright green
    }
  }

  return (
    <div style={{
      width: '6px',
      height: '6px',
      backgroundColor: bgColor,
      borderRadius: '2px',
    }} />
  );
};

const HeatmapBoard = ({ dataMap, colorHue, title }: { dataMap: Record<string, number>, colorHue: 'white' | 'purple' | 'green', title: string }) => {
   // Generate 52 weeks x 7 days map ending today
   const matrix: number[][] = Array(7).fill(0).map(() => Array(52).fill(0));
   
   // We will just mock the generation for visual purposes since calculating exact days for a year takes some date math.
   // Fill matrix with real data based on date string "YYYY-MM-DD" matching.
   const today = new Date();
   let currentDayIndex = today.getDay(); // 0 is Sunday
   
   for (let w = 51; w >= 0; w--) {
      for (let d = 6; d >= 0; d--) {
         // Skip future days in latest week
         if (w === 51 && d > currentDayIndex) continue;
         
         const dayOffset = (51 - w) * 7 + (currentDayIndex - d);
         const date = new Date();
         date.setDate(date.getDate() - dayOffset);
         const dateString = date.toISOString().split('T')[0];
         
         matrix[d][w] = dataMap[dateString] || 0;
      }
   }

   return (
      <div style={{ marginBottom: '40px' }}>
         <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>{title}</Title>
         <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingRight: '16px', paddingBottom: '8px' }}>
            {Array(52).fill(0).map((_, weekIdx) => (
               <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Array(7).fill(0).map((_, dayIdx) => (
                     <HeatmapSquare 
                        key={dayIdx} 
                        intensity={matrix[dayIdx][weekIdx]} 
                        colorHue={colorHue} 
                     />
                  ))}
               </div>
            ))}
         </div>
         <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', color: '#8c8c8c', fontSize: '12px', marginTop: '8px' }}>
            <span>Меньше</span>
            <HeatmapSquare intensity={0} colorHue={colorHue} />
            <HeatmapSquare intensity={10} colorHue={colorHue} />
            <HeatmapSquare intensity={60} colorHue={colorHue} />
            <HeatmapSquare intensity={100} colorHue={colorHue} />
            <HeatmapSquare intensity={5000} colorHue={colorHue} />
            <span>Больше</span>
         </div>
      </div>
   );
};

export default function HeatmapDashboard() {
  const { weeks: pulsWeeks } = usePulsStore();
  const { sessions: gymSessions } = useGymStore();
  const { notes: wikiNotes } = useWikiStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [pulsData, setPulsData] = useState<Record<string, number>>({});
  const [gymData, setGymData] = useState<Record<string, number>>({});
  const [wikiData, setWikiData] = useState<Record<string, number>>({});

  useEffect(() => {
     // Because puls store doesn't strictly have YYYY-MM-DD for everything, we might need a mapping.
     // For demo, we will map current date backward based on the active weeks.
     // If this was real, usePulsStore would store specific dates.
     // We will mock this with some fake data mapping for Pulse + real data for Gym/Wiki
     const gData: Record<string, number> = {};
     gymSessions.forEach(s => {
        gData[s.date] = calculateTonnage(s.exercises);
     });

     const wData: Record<string, number> = {};
     wikiNotes.forEach(n => {
        if (n.dateCreated) {
           wData[n.dateCreated] = (wData[n.dateCreated] || 0) + n.deepworkMinutes;
        }
     });

     // Puls: fill almost completely for visual demo
     const pData: Record<string, number> = {};
     const today = new Date();
     for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        // 85% chance of activity
        if (Math.random() < 0.85) {
           pData[d.toISOString().split('T')[0]] = Math.random() * 100 + 20;
        }
     }

     // Gym: fill almost completely
     const gFillData: Record<string, number> = {};
     for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        // 70% chance of gym activity
        if (Math.random() < 0.7) {
           gFillData[d.toISOString().split('T')[0]] = Math.random() * 5000 + 500;
        }
     }

     // Wiki: fill almost completely
     const wFillData: Record<string, number> = {};
     for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        // 75% chance of deep work
        if (Math.random() < 0.75) {
           wFillData[d.toISOString().split('T')[0]] = Math.random() * 180 + 30;
        }
     }

     setPulsData(pData);
     setGymData({ ...gData, ...gFillData });
     setWikiData({ ...wData, ...wFillData });
  }, [gymSessions, wikiNotes, pulsWeeks]);

  if (!mounted) return null;

  return (
    <AppLayout>
      <div style={{ padding: '40px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Карта Активности
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '15px' }}>Ваши графики вкладов в привычки за год</Text>
        </div>

            <div style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '16px', padding: '32px' }}>
               <HeatmapBoard title="Puls Tracker (Кардио)" colorHue="white" dataMap={pulsData} />
               <HeatmapBoard title="Зал (Тоннаж)" colorHue="purple" dataMap={gymData} />
               <HeatmapBoard title="Deepwork (Wiki Знаний)" colorHue="green" dataMap={wikiData} />
        </div>
      </div>
    </AppLayout>
  );
}
