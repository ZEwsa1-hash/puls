"use client";

import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Modal, Input, Button, Card, Table, Space, Image, Divider, InputNumber } from 'antd';
import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useGymStore, GymSession, ExerciseRecord, SetRecord, calculateTonnage, calculateOneRepMax, calculatePercentage } from '@/store/useGymStore';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

export default function GymDashboard() {
  const { sessions, addSession } = useGymStore();
  const [mounted, setMounted] = useState(false);

  // New session modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Form builder logic
  const handleAddExercise = () => {
     setExercises([...exercises, { id: `ex-${Date.now()}`, name: '', sets: [{ id: `s-${Date.now()}`, weight: 0, reps: 0 }] }]);
  };

  const handeAddSet = (exerciseId: string) => {
     setExercises(exercises.map(ex => {
        if (ex.id === exerciseId) {
           return { ...ex, sets: [...ex.sets, { id: `s-${Date.now()}`, weight: 0, reps: 0 }] };
        }
        return ex;
     }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps' | 'rpe', value: number) => {
      setExercises(exercises.map(ex => {
         if (ex.id === exerciseId) {
            const newSets = ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s);
            return { ...ex, sets: newSets };
         }
         return ex;
      }));
  };

  const updateExercise = (exerciseId: string, field: 'name' | 'photoUrl', value: string) => {
      setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex));
  };

  const saveWorkout = () => {
     if (!newTitle) return;
     const session: GymSession = {
        id: `sess-${Date.now()}`,
        date: newDate,
        title: newTitle,
        exercises: exercises.filter(e => e.name.trim().length > 0)
     };
     addSession(session);
     setModalOpen(false);
     setNewTitle('');
     setExercises([]);
  };

  // Rendering Session Feed
  // Sort by date desc
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppLayout>
      <div style={{ padding: '40px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              Лента тренировок
            </Title>
            <Text style={{ color: '#8c8c8c', fontSize: '15px' }}>Тренировочные веса, сеты, RPE и тоннаж</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setModalOpen(true)} style={{ backgroundColor: '#595959', borderColor: '#595959', fontWeight: 600 }}>
            Записать тренировку
          </Button>
        </div>

            {/* Session Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {sortedSessions.map(session => {
                  const totalTonnage = calculateTonnage(session.exercises);
                  
                  return (
                     <div key={session.id} style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Session Header */}
                        <div style={{ padding: '20px 24px', backgroundColor: '#262626', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div>
                              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '13px', marginBottom: '4px', textTransform: 'uppercase' }}>{session.date}</div>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>{session.title}</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700 }}>ОБЩИЙ ТОННАЖ</div>
                              <div style={{ color: '#fb923c', fontSize: '24px', fontWeight: 800 }}>{totalTonnage.toLocaleString()} <span style={{fontSize:'14px', color:'#888'}}>кг</span></div>
                           </div>
                        </div>

                        {/* Exercises List */}
                        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                           {session.exercises.map((ex, exIdx) => {
                              const columns = [
                                 { title: 'Сет', dataIndex: 'setNum', key: 'setNum', render: (text: string) => <strong style={{ color: '#8c8c8c' }}>{text}</strong> },
                                 { title: 'Вес (кг)', dataIndex: 'weight', key: 'weight', render: (text: number) => <span style={{ color: '#fff', fontWeight: 600 }}>{text}</span> },
                                 { title: 'Повторения', dataIndex: 'reps', key: 'reps', render: (text: number) => <span style={{ color: '#a3e635', fontWeight: 700 }}>{text}</span> },
                                 { title: 'RPE', dataIndex: 'rpe', key: 'rpe', render: (text: number) => <span style={{ color: '#fb923c', fontWeight: 600 }}>{text || '-'}</span> },
                              ];

                              const tableData = ex.sets.map((s, i) => ({
                                 key: s.id,
                                 setNum: i + 1,
                                 weight: s.weight,
                                 reps: s.reps,
                                 rpe: s.rpe,
                              }));

                              return (
                                 <div key={ex.id} style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                    {ex.photoUrl && (
                                       <div style={{ width: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                          <Image src={ex.photoUrl} alt={ex.name} width={120} height={120} style={{ objectFit: 'cover' }} />
                                       </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                       <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <ThunderboltOutlined style={{ color: '#8c8c8c' }} /> {exIdx + 1}. {ex.name}
                                       </div>
                                       <Table 
                                          dataSource={tableData} 
                                          columns={columns} 
                                          pagination={false} 
                                          size="small"
                                          style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}
                                       />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  );
               })}
               {sortedSessions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                     Пока нет записей. Создайте тренировку!
                  </div>
               )}
        </div>
      </div>

      {/* Create Workout Modal */}
      <Modal
         title="Новая тренировка в зале"
         open={modalOpen}
         onOk={saveWorkout}
         onCancel={() => setModalOpen(false)}
         width={800}
         footer={[
            <Button key="cancel" onClick={() => setModalOpen(false)}>Отмена</Button>,
            <Button key="save" type="primary" onClick={saveWorkout} style={{ backgroundColor: '#595959' }}>Сохранить тренировку</Button>
         ]}
      >
         <div style={{ marginBottom: 20, marginTop: 20, display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
               <Text style={{ display: 'block', marginBottom: 8 }}>Название (н-р: Грудь, Спина):</Text>
               <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Название тренировки" />
            </div>
            <div>
               <Text style={{ display: 'block', marginBottom: 8 }}>Дата:</Text>
               <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
         </div>

         <Divider style={{ borderColor: '#333' }} />

         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {exercises.map((ex, exIndex) => (
               <div key={ex.id} style={{ backgroundColor: '#262626', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                     <div style={{ flex: 1 }}>
                        <Text style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>Упражнение {exIndex + 1}:</Text>
                        <Input value={ex.name} onChange={e => updateExercise(ex.id, 'name', e.target.value)} placeholder="Жим лежа" />
                     </div>
                     <div style={{ flex: 1 }}>
                        <Text style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>Фото URL (опционально):</Text>
                        <Input value={ex.photoUrl || ''} onChange={e => updateExercise(ex.id, 'photoUrl', e.target.value)} placeholder="Ссылка на фото упражнения" />
                     </div>
                  </div>

                  {/* Sets Builder */}
                  <div style={{ marginLeft: '16px' }}>
                     <Row gutter={8} style={{ marginBottom: '8px', color: '#8c8c8c', fontSize: '12px', fontWeight: 600 }}>
                        <Col span={3}>Сет</Col>
                        <Col span={4}>Вес (кг)</Col>
                        <Col span={3}>Повторения</Col>
                        <Col span={3}>RPE</Col>
                        <Col span={4}>1ПМ (кг)</Col>
                        <Col span={3}>% 1ПМ</Col>
                     </Row>
                     {ex.sets.map((set, sIdx) => {
                        const oneRM = calculateOneRepMax(set.weight, set.reps);
                        const pct = calculatePercentage(set.weight, oneRM);
                        return (
                        <Row key={set.id} gutter={8} style={{ marginBottom: '8px' }}>
                           <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ color: '#fff', fontWeight: 600 }}>{sIdx + 1}</Text>
                           </Col>
                           <Col span={4}>
                              <InputNumber style={{ width: '100%' }} value={set.weight} onChange={v => updateSet(ex.id, set.id, 'weight', v || 0)} min={0} />
                           </Col>
                           <Col span={3}>
                              <InputNumber style={{ width: '100%' }} value={set.reps} onChange={v => updateSet(ex.id, set.id, 'reps', v || 0)} min={0} />
                           </Col>
                           <Col span={3}>
                              <InputNumber style={{ width: '100%' }} value={set.rpe} onChange={v => updateSet(ex.id, set.id, 'rpe', v || 0)} min={1} max={10} placeholder="RPE" />
                           </Col>
                           <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ color: '#a855f7', fontWeight: 600 }}>{oneRM > 0 ? oneRM : '-'}</Text>
                           </Col>
                           <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
                              <Text style={{ color: '#22d3ee', fontWeight: 600 }}>{pct > 0 ? `${pct}%` : '-'}</Text>
                           </Col>
                        </Row>
                     );
                     })}
                     <Button type="dashed" size="small" onClick={() => handeAddSet(ex.id)} style={{ marginTop: '8px' }}>+ Подход</Button>
                     <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#1c1c1c', borderRadius: '6px', display: 'inline-block' }}>
                        <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>Тоннаж упражнения: </Text>
                        <Text style={{ color: '#fb923c', fontWeight: 700 }}>{calculateTonnage([ex]).toLocaleString()} кг</Text>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <Button type="dashed" block onClick={handleAddExercise} style={{ marginTop: '16px', height: '40px' }}>
            + Добавить упражнение
         </Button>

      </Modal>
    </AppLayout>
  );
}
