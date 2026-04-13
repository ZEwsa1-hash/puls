"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Modal, Select, InputNumber, Button, Tooltip } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { usePulsStore, DayRecord, WorkoutType } from '@/store/usePulsStore';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

const LegendItem = ({ color, label }: { color: string, label: string }) => (
   <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '10px', height: '10px', backgroundColor: color, borderRadius: '2px', marginRight: '8px' }}></div>
      <Text style={{ color: '#d9d9d9', fontSize: '13px', fontWeight: 600 }}>{label}</Text>
   </div>
);

export default function PulsGeminiDashboard() {
  const { weeks, targetZ2, updateDay } = usePulsStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{weekId: string, dayId: string} | null>(null);
  
  const [editType, setEditType] = useState<WorkoutType>('empty');
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editAvgHr, setEditAvgHr] = useState<number | undefined>(undefined);

  let totalZ2 = 0;
  let weeksDone = 0;
  let hiitWeeks = 0;

  weeks.forEach(week => {
    let weekZ2Minutes = 0;
    let hasHiit = false;
    
    week.days.forEach(day => {
      // In typical Z2 plans, we count Z2 towards the target
      if (day.state === 'z2') {
        totalZ2 += day.minutes;
        weekZ2Minutes += day.minutes;
      }
      if (day.state === 'hiit') {
        hasHiit = true;
      }
    });

    if (weekZ2Minutes >= week.targetMin) weeksDone++;
    if (hasHiit) hiitWeeks++;
  });

  const currentWeekIdx = weeks.findIndex(w => w.isTodayParent) + 1 || 1;

  const handleDayClick = (weekId: string, day: DayRecord) => {
    setSelectedDay({ weekId, dayId: day.id });
    setEditType(day.state);
    setEditMinutes(day.state === 'empty' ? 0 : day.minutes);
    setEditAvgHr(day.avgHeartRate);
    setModalOpen(true);
  };

  const saveDay = () => {
    if (selectedDay) {
      updateDay(selectedDay.weekId, selectedDay.dayId, editType, editMinutes || 0, editAvgHr);
    }
    setModalOpen(false);
  };

  if (!mounted) return null;

  return (
    <AppLayout>
      <div style={{ padding: '40px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            RHR 50 <ArrowRightOutlined style={{ fontSize: '20px', verticalAlign: 'middle', margin: '0 4px', color: '#ffffff' }} /> 45 Experiment
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '15px', fontWeight: 600 }}>
            8-week zone 2 + HIIT plan • Feb 18 — Apr 14, 2026 - <span style={{ color: '#38bdf8', fontWeight: 700 }}>Dashboard</span>
          </Text>
        </div>

            <div style={{ 
               backgroundColor: '#262626', 
               borderRadius: '12px', 
               padding: '20px 24px',
               marginBottom: '24px',
               border: '1px solid #363636'
             }}>
               <Row gutter={48}>
                  <Col>
                     <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>TOTAL Z2</div>
                     <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>{totalZ2}m</div>
                  </Col>
                  <Col>
                     <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>TARGET</div>
                     <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>{targetZ2}m</div>
                  </Col>
                  <Col>
                     <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>WEEKS DONE</div>
                     <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>{weeksDone} / {weeks.length}</div>
                  </Col>
                  <Col>
                     <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>HIIT WEEKS</div>
                     <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>{hiitWeeks} / 1</div>
                  </Col>
                  <Col>
                     <div style={{ fontSize: '11px', color: '#8c8c8c', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>WEEK</div>
                     <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>{currentWeekIdx} of {weeks.length}</div>
                  </Col>
               </Row>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
               <LegendItem color="#d9d9d9" label="Z1: Восстановление" />
               <LegendItem color="#a3e635" label="Z2: База" />
               <LegendItem color="#facc15" label="Z3: Темп" />
               <LegendItem color="#fb923c" label="Z4: ПАНО" />
               <LegendItem color="#ef4444" label="Z5: МПК" />
               <LegendItem color="#c084fc" label="HIIT" />
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #38bdf8', borderRadius: '2px', marginRight: '8px', backgroundColor: 'transparent' }}></div>
                  <Text style={{ color: '#d9d9d9', fontSize: '13px', fontWeight: 600 }}>Today</Text>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {weeks.map((week) => {
                  let weekZ2Minutes = 0;
                  let hasHiit = false;
                  week.days.forEach(day => {
                     if (day.state === 'z2') weekZ2Minutes += day.minutes;
                     if (day.state === 'hiit') hasHiit = true;
                  });

                  const isDone = weekZ2Minutes >= week.targetMin;
                  let progressPercent = Math.min((weekZ2Minutes / week.targetMax) * 100, 100);
                  if (isNaN(progressPercent)) progressPercent = 0;
                  
                  let statusText = 'upcoming';
                  let statusColor = '#8c8c8c';

                  if (week.isTodayParent || weekZ2Minutes > 0) {
                     if (isDone) {
                        statusText = 'Goal reached!';
                        statusColor = '#a3e635';
                     } else {
                        const left = week.targetMin - weekZ2Minutes;
                        statusText = `${left}m Z2 left` + (hasHiit ? '' : ' • need HIIT');
                        statusColor = '#38bdf8';
                     }
                  }

                  return (
                     <WeekRow 
                        key={week.id}
                        title={week.title} 
                        subtitle={week.subtitle}
                        subtitleColor={week.subtitleColor}
                        dates={week.dates} 
                        days={week.days}
                        progress={`${weekZ2Minutes}m / ${week.targetMin}-${week.targetMax}m`}
                        progressPercent={progressPercent}
                        statusText={statusText}
                        statusColor={statusColor}
                        isTodayParent={week.isTodayParent}
                        onDayClick={(day) => handleDayClick(week.id, day)}
                     />
                  );
               })}
        </div>

        <Modal 
          title="Добавить тренировку" 
          open={modalOpen} 
          onOk={saveDay} 
          onCancel={() => setModalOpen(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalOpen(false)}>Отмена</Button>,
            <Button key="save" type="primary" onClick={saveDay}>Сохранить</Button>
          ]}
        >
          <div style={{ marginBottom: 20, marginTop: 20 }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>Пульсовая зона / Тип:</Text>
            <Select 
               value={editType} 
               onChange={val => {
                  setEditType(val);
                  if (val === 'empty') {
                     setEditMinutes(0);
                     setEditAvgHr(undefined);
                  }
               }}
               style={{ width: '100%' }}
               options={[
                  { value: 'empty', label: 'Пусто (Отдых)' },
                  { value: 'z1', label: 'Zone 1 (Восстановление)' },
                  { value: 'z2', label: 'Zone 2 (База / Аэробная)' },
                  { value: 'z3', label: 'Zone 3 (Темп / Смешанная)' },
                  { value: 'z4', label: 'Zone 4 (ПАНО / Пороговая)' },
                  { value: 'z5_mpk', label: 'Zone 5 (МПК / Максимальная)' },
                  { value: 'hiit', label: 'HIIT (Интервалы)' },
               ]}
            />
         </div>

         {editType !== 'empty' && (
            <Row gutter={16}>
               <Col span={12}>
                  <Text style={{ display: 'block', marginBottom: 8 }}>Длительность (мин):</Text>
                  <InputNumber 
                     min={0} 
                     max={600} 
                     value={editMinutes} 
                     onChange={val => setEditMinutes(val || 0)} 
                     style={{ width: '100%' }} 
                  />
               </Col>
               <Col span={12}>
                  <Text style={{ display: 'block', marginBottom: 8 }}>Средний пульс (уд/мин):</Text>
                  <InputNumber 
                     min={30} 
                     max={220} 
                     value={editAvgHr} 
                     onChange={val => setEditAvgHr(val || undefined)} 
                     placeholder="Например, 142"
                     style={{ width: '100%' }} 
                  />
               </Col>
            </Row>
         )}
        </Modal>
      </div>
    </AppLayout>
  );
}

interface WeekRowProps {
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  dates: string;
  days: DayRecord[];
  progress: string;
  progressPercent?: number;
  statusText: string;
  statusColor?: string;
  isTodayParent?: boolean;
  onDayClick: (day: DayRecord) => void;
}

function WeekRow({ title, subtitle, subtitleColor, dates, days, progress, progressPercent = 0, statusText, statusColor = '#8c8c8c', isTodayParent = false, onDayClick }: WeekRowProps) {
   return (
      <div style={{
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         backgroundColor: '#1c1c1c',
         border: `1px solid ${isTodayParent ? '#38bdf8' : '#333333'}`,
         borderRadius: '10px',
         padding: '16px 20px',
         boxShadow: isTodayParent ? '0 0 0 1px #38bdf8 inset, 0 0 12px rgba(56, 189, 248, 0.1)' : 'none'
      }}>
         <div style={{ width: '130px' }}>
            <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
               {title} 
               {subtitle && <span style={{ color: subtitleColor, fontSize: '11px', fontWeight: 800 }}>{subtitle}</span>}
            </div>
            <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>{dates}</div>
         </div>

         <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
            {days.map((day: any, idx: number) => {
               let bgColor = '#181818';
               let borderColor = '#2d2d2d';
               let textColor = '#8c8c8c';

               if (day.state === 'z1') {
                  bgColor = 'rgba(217, 217, 217, 0.15)'; borderColor = 'rgba(217, 217, 217, 0.5)'; textColor = '#d9d9d9';
               } else if (day.state === 'z2') {
                  bgColor = 'rgba(163, 230, 53, 0.15)'; borderColor = 'rgba(163, 230, 53, 0.5)'; textColor = '#a3e635'; 
               } else if (day.state === 'z3') {
                  bgColor = 'rgba(250, 204, 21, 0.15)'; borderColor = 'rgba(250, 204, 21, 0.5)'; textColor = '#facc15';
               } else if (day.state === 'z4') {
                  bgColor = 'rgba(251, 146, 60, 0.15)'; borderColor = 'rgba(251, 146, 60, 0.5)'; textColor = '#fb923c';
               } else if (day.state === 'z5_mpk') {
                  bgColor = 'rgba(239, 68, 68, 0.15)'; borderColor = 'rgba(239, 68, 68, 0.5)'; textColor = '#ef4444';
               } else if (day.state === 'hiit') {
                  bgColor = 'rgba(192, 132, 252, 0.15)'; borderColor = 'rgba(192, 132, 252, 0.5)'; textColor = '#c084fc'; 
               }
               
               if (day.isToday) {
                  borderColor = '#38bdf8'; 
               }

               const dayContent = (
                  <div 
                     key={`box-${idx}`}
                     onClick={() => onDayClick(day)}
                     style={{
                        width: '64px',
                        height: '36px',
                        backgroundColor: bgColor,
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: textColor,
                        fontSize: '13px',
                        fontWeight: 700,
                        userSelect: 'none',
                        cursor: 'pointer',
                        boxShadow: day.isToday ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                        transition: 'all 0.2s'
                     }}
                  >
                     {day.label}
                  </div>
               );

               return day.avgHeartRate ? (
                  <Tooltip 
                     key={idx} 
                     title={
                        <div style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: '11px', color: '#8c8c8c', marginBottom: '2px' }}>Средний пульс</div>
                           <div style={{ fontSize: '16px', fontWeight: 700 }}>
                              <span style={{ color: '#ff4d4f', marginRight: '4px' }}>❤</span>
                              {day.avgHeartRate} уд/мин
                           </div>
                        </div>
                     } 
                     color="#1f1f1f" 
                     overlayInnerStyle={{ border: `1px solid ${borderColor}` }}
                  >
                     {dayContent}
                  </Tooltip>
               ) : (
                  <React.Fragment key={idx}>{dayContent}</React.Fragment>
               );
            })}
         </div>

         <div style={{ width: '160px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{progress}</div>
            <div style={{ width: '100%', height: '4px', backgroundColor: '#333333', borderRadius: '2px', position: 'relative', overflow: 'hidden', marginBottom: '6px' }}>
               {progressPercent > 0 && (
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progressPercent}%`, backgroundColor: '#38bdf8', borderRadius: '2px', transition: 'width 0.3s' }}></div>
               )}
            </div>
            <div style={{ color: statusColor, fontSize: '12px', fontWeight: 600 }}>{statusText}</div>
         </div>
      </div>
   );
}
