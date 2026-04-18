"use client";

import React from 'react';
import { Typography, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, Bar, Pie } from 'recharts';
import dynamic from 'next/dynamic';
import { usePulsStore } from '@/store/usePulsStore';
import { useGymStore, calculateOneRepMax, calculateTonnage } from '@/store/useGymStore';
import AppLayout from '@/components/AppLayout';

// Lazy load heavy recharts chart containers
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false, loading: () => <LoadingOutlined style={{ fontSize: 24, color: '#8c8c8c' }} /> });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false, loading: () => <LoadingOutlined style={{ fontSize: 24, color: '#8c8c8c' }} /> });

const { Title, Text } = Typography;

type ExerciseStat = {
  name: string;
  tonnage: number;
  sets: number;
  reps: number;
  maxOneRep: number;
};

export default function AnalyticsDashboard() {
  const { weeks } = usePulsStore();
  const { sessions: gymSessions } = useGymStore();

  // Data Aggregation
  const zoneStats = {
    z1: { label: 'Z1 (Восстановление)', color: '#d9d9d9', min: 0 },
    z2: { label: 'Z2 (База)', color: '#a3e635', min: 0 },
    z3: { label: 'Z3 (Темп)', color: '#facc15', min: 0 },
    z4: { label: 'Z4 (ПАНО)', color: '#fb923c', min: 0 },
    z5_mpk: { label: 'Z5 (МПК)', color: '#ef4444', min: 0 },
    hiit: { label: 'HIIT (Интервалы)', color: '#c084fc', min: 0 },
  };

  let totalMinutes = 0;
  let highestHr = 0;
  let totalHr = 0;
  let hrCount = 0;
  let completedDaysCount = 0;

  const weeklyData: { name: string; z2: number; hiit: number; other: number }[] = [];

  weeks.forEach((week, idx) => {
    let weekZ2 = 0;
    let weekHiit = 0;
    let weekOther = 0;

    week.days.forEach(day => {
      if (day.state !== 'empty') {
        const key = day.state as keyof typeof zoneStats;
        if (zoneStats[key]) {
          zoneStats[key].min += day.minutes;
        }
        totalMinutes += day.minutes;
        completedDaysCount++;

        if (day.state === 'z2') weekZ2 += day.minutes;
        else if (day.state === 'hiit') weekHiit += day.minutes;
        else weekOther += day.minutes;

        if (day.avgHeartRate) {
          totalHr += day.avgHeartRate;
          hrCount++;
          if (day.avgHeartRate > highestHr) highestHr = day.avgHeartRate;
        }
      }
    });

    weeklyData.push({
      name: `W${idx + 1}`,
      z2: weekZ2,
      hiit: weekHiit,
      other: weekOther,
    });
  });

  const pieData = Object.keys(zoneStats)
    .filter(k => zoneStats[k as keyof typeof zoneStats].min > 0)
    .map(k => ({
      name: zoneStats[k as keyof typeof zoneStats].label,
      value: zoneStats[k as keyof typeof zoneStats].min,
      fill: zoneStats[k as keyof typeof zoneStats].color,
    }));

  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgHr = hrCount > 0 ? Math.round(totalHr / hrCount) : 0;
  const sortedGymSessions = [...gymSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const totalGymTonnage = gymSessions.reduce((sum, session) => sum + calculateTonnage(session.exercises), 0);
  const totalGymSets = gymSessions.reduce(
    (sum, session) => sum + session.exercises.reduce((exerciseSum, exercise) => exerciseSum + exercise.sets.length, 0),
    0
  );
  const totalGymReps = gymSessions.reduce(
    (sum, session) =>
      sum +
      session.exercises.reduce(
        (exerciseSum, exercise) => exerciseSum + exercise.sets.reduce((setSum, set) => setSum + set.reps, 0),
        0
      ),
    0
  );
  const averageGymTonnage = gymSessions.length > 0 ? Math.round(totalGymTonnage / gymSessions.length) : 0;

  const bestGymSession = gymSessions.reduce<{ title: string; tonnage: number } | null>((best, session) => {
    const tonnage = calculateTonnage(session.exercises);
    if (!best || tonnage > best.tonnage) {
      return { title: session.title, tonnage };
    }
    return best;
  }, null);

  const exerciseStats = gymSessions.reduce<Record<string, ExerciseStat>>((acc, session) => {
    session.exercises.forEach((exercise) => {
      const name = exercise.name.trim() || 'Без названия';
      const current = acc[name] || { name, tonnage: 0, sets: 0, reps: 0, maxOneRep: 0 };

      exercise.sets.forEach((set) => {
        current.tonnage += set.weight * set.reps;
        current.sets += 1;
        current.reps += set.reps;
        current.maxOneRep = Math.max(current.maxOneRep, calculateOneRepMax(set.weight, set.reps));
      });

      acc[name] = current;
    });

    return acc;
  }, {});

  const topExerciseData = Object.values(exerciseStats)
    .sort((a, b) => b.tonnage - a.tonnage)
    .slice(0, 6);

  const gymSessionData = sortedGymSessions.map((session) => ({
    name: session.date.slice(5),
    title: session.title,
    tonnage: calculateTonnage(session.exercises),
  }));

  // Find most frequent zone
  let favoriteZone = 'Нет данных';
  let maxMin = 0;
  Object.values(zoneStats).forEach(stat => {
     if (stat.min > maxMin) {
        maxMin = stat.min;
        favoriteZone = stat.label;
     }
  });

  return (
    <AppLayout>
      <div className="analytics-page" style={{ padding: '40px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ color: '#38bdf8', fontSize: '16px', fontWeight: 800 }}>
            Аналитика Кардио
          </span>
        </div>

            {/* Top Stat Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>ВСЕГО ЧАСОВ</div>
                     <div style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>{totalHours}<span style={{fontSize:'16px', color:'#666'}}>ч</span></div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>КОМБО (ДНЕЙ)</div>
                     <div style={{ color: '#a3e635', fontSize: '28px', fontWeight: 800 }}>{completedDaysCount}</div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>СРЕДНИЙ ПУЛЬС</div>
                     <div style={{ color: '#fb923c', fontSize: '28px', fontWeight: 800 }}>{avgHr > 0 ? avgHr : '--'}<span style={{fontSize:'16px', color:'#666'}}>bpm</span></div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>ЧАСТАЯ ЗОНА</div>
                     <div style={{ color: '#fff', fontSize: '18px', fontWeight: 800, marginTop: '8px' }}>{favoriteZone.split(' ')[0]}</div>
                  </div>
               </Col>
            </Row>

            <Row gutter={[24, 24]}>
               {/* Pie Chart */}
               <Col xs={24} md={10}>
                  <div className="analytics-panel" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '24px', height: '100%' }}>
                     <Title level={4} style={{ color: '#fff', marginTop: 0 }}>Распределение по зонам</Title>
                     <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>Доля минут, проведенных в каждой пульсовой зоне</Text>
                     
                     <div className="analytics-chart" style={{ height: '300px', marginTop: '20px' }}>
                        {pieData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                 >
                                    {pieData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                 </Pie>
                                 <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#262626', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                 />
                              </PieChart>
                           </ResponsiveContainer>
                        ) : (
                           <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Нет данных</div>
                        )}
                     </div>
                  </div>
               </Col>

               {/* Bar Chart Weekly */}
               <Col xs={24} md={14}>
                  <div className="analytics-panel" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '24px', height: '100%' }}>
                     <Title level={4} style={{ color: '#fff', marginTop: 0 }}>Тренировочный объем (Недели)</Title>
                     <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>Время в минутах по типам тренировок</Text>
                     
                     <div className="analytics-chart" style={{ height: '300px', marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                              <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                              <YAxis stroke="#888" tickLine={false} axisLine={false} />
                              <RechartsTooltip 
                                 cursor={{fill: '#262626'}}
                                 contentStyle={{ backgroundColor: '#262626', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                              />
                              <Bar dataKey="z2" name="Zone 2 (База)" stackId="a" fill="#a3e635" radius={[0, 0, 4, 4]} />
                              <Bar dataKey="hiit" name="HIIT" stackId="a" fill="#c084fc" />
                              <Bar dataKey="other" name="Остальные зоны" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </Col>
            </Row>

            <div style={{ marginTop: '48px', marginBottom: '24px' }}>
              <span style={{ color: '#fb923c', fontSize: '16px', fontWeight: 800 }}>
                Тренажерный зал
              </span>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>ТОННАЖ</div>
                     <div style={{ color: '#fff', fontSize: '28px', fontWeight: 800 }}>{totalGymTonnage.toLocaleString()}<span style={{fontSize:'16px', color:'#666'}}>кг</span></div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>ТРЕНИРОВОК</div>
                     <div style={{ color: '#a3e635', fontSize: '28px', fontWeight: 800 }}>{gymSessions.length}</div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>ПОДХОДОВ / ПОВТОРОВ</div>
                     <div style={{ color: '#38bdf8', fontSize: '28px', fontWeight: 800 }}>{totalGymSets}<span style={{fontSize:'16px', color:'#666'}}> / {totalGymReps}</span></div>
                  </div>
               </Col>
               <Col xs={24} sm={12} md={6}>
                  <div className="analytics-stat-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '20px' }}>
                     <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>СРЕДНИЙ ТОННАЖ</div>
                     <div style={{ color: '#fb923c', fontSize: '28px', fontWeight: 800 }}>{averageGymTonnage.toLocaleString()}<span style={{fontSize:'16px', color:'#666'}}>кг</span></div>
                  </div>
               </Col>
            </Row>

            <Row gutter={[24, 24]}>
               <Col xs={24} md={14}>
                  <div className="analytics-panel" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '24px', height: '100%' }}>
                     <Title level={4} style={{ color: '#fff', marginTop: 0 }}>Тоннаж по тренировкам</Title>
                     <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>Суммарный вес по каждой записи в зале</Text>

                     <div className="analytics-chart" style={{ height: '300px', marginTop: '20px' }}>
                        {gymSessionData.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={gymSessionData} margin={{ top: 20, right: 0, left: -10, bottom: 0 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                 <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                                 <YAxis stroke="#888" tickLine={false} axisLine={false} />
                                 <RechartsTooltip
                                    cursor={{fill: '#262626'}}
                                    contentStyle={{ backgroundColor: '#262626', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''}
                                    formatter={(value) => [`${Number(value).toLocaleString()} кг`, 'Тоннаж']}
                                 />
                                 <Bar dataKey="tonnage" name="Тоннаж" fill="#fb923c" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        ) : (
                           <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Нет данных</div>
                        )}
                     </div>
                  </div>
               </Col>

               <Col xs={24} md={10}>
                  <div className="analytics-panel" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '12px', padding: '24px', height: '100%' }}>
                     <Title level={4} style={{ color: '#fff', marginTop: 0 }}>Лидеры по объему</Title>
                     <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>Упражнения с самым большим тоннажем</Text>

                     <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topExerciseData.length > 0 ? (
                           topExerciseData.map((exercise) => (
                              <div key={exercise.name} style={{ borderBottom: '1px solid #333', paddingBottom: '12px' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                                    <Text style={{ color: '#fff', fontWeight: 700 }}>{exercise.name}</Text>
                                    <Text style={{ color: '#fb923c', fontWeight: 800 }}>{exercise.tonnage.toLocaleString()} кг</Text>
                                 </div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#8c8c8c', fontSize: '12px' }}>
                                    <span>{exercise.sets} подходов, {exercise.reps} повторов</span>
                                    <span>1ПМ {exercise.maxOneRep || '-'} кг</span>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Нет данных</div>
                        )}

                        {bestGymSession && (
                           <div style={{ marginTop: '4px', backgroundColor: '#262626', border: '1px solid #333', borderRadius: '8px', padding: '14px' }}>
                              <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>ЛУЧШАЯ ТРЕНИРОВКА</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                 <Text style={{ color: '#fff', fontWeight: 700 }}>{bestGymSession.title}</Text>
                                 <Text style={{ color: '#a3e635', fontWeight: 800 }}>{bestGymSession.tonnage.toLocaleString()} кг</Text>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </Col>
            </Row>
      </div>
    </AppLayout>
  );
}
