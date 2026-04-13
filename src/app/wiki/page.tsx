"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Typography, Row, Col, Input, Button, List, Card, Divider, Select } from 'antd';
import { PlusOutlined, EditOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import { useWikiStore, WikiNote } from '@/store/useWikiStore';
import AppLayout from '@/components/AppLayout';
import dynamic from 'next/dynamic';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Dynamic import for force graph to prevent SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function WikiKnowledgeDashboard() {
  const { notes, addNote, updateNote, deleteNote, addLinks } = useWikiStore();
  const [mounted, setMounted] = useState(false);
  
  // Editor State
  const [selectedNote, setSelectedNote] = useState<WikiNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMinutes, setEditMinutes] = useState(0);
  const [editLinks, setEditLinks] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  // Compute graph data
  const graphData = useMemo(() => {
    const nodes = notes.map(n => ({ id: n.id, name: n.title, val: n.deepworkMinutes || 10 }));
    const links: any[] = [];
    
    notes.forEach(note => {
       note.links.forEach(targetId => {
          // ensure target exists
          if (notes.find(n => n.id === targetId)) {
             links.push({ source: note.id, target: targetId });
          }
       });
    });

    return { nodes, links };
  }, [notes]);

  const handleCreateNew = () => {
     setSelectedNote(null);
     setEditTitle('');
     setEditContent('');
     setEditMinutes(0);
     setEditLinks([]);
     setIsEditing(true);
  };

  const handleSave = () => {
     if (!editTitle) return;

     if (selectedNote) {
        updateNote(selectedNote.id, {
           ...selectedNote,
           title: editTitle,
           content: editContent,
           deepworkMinutes: editMinutes,
           links: editLinks
        });
     } else {
        addNote({
           id: `wiki-${Date.now()}`,
           title: editTitle,
           content: editContent,
           deepworkMinutes: editMinutes,
           links: editLinks,
           dateCreated: new Date().toISOString().split('T')[0]
        });
     }
     setIsEditing(false);
     setSelectedNote(null);
  };

  if (!mounted) return null;

  return (
    <AppLayout>
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
              База Знаний (Deepwork)
            </Title>
            <Text style={{ color: '#a3e635', fontSize: '15px' }}>Связанные заметки и потраченное время</Text>
          </div>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreateNew} style={{ backgroundColor: '#a3e635', borderColor: '#a3e635', color: '#121212', fontWeight: 700 }}>
            Новая Заметка
          </Button>
        </div>

            <Row gutter={[24, 24]}>
               {/* Left Pane: Notes & Editor */}
               <Col xs={24} md={12} lg={10}>
                  <div style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '16px', padding: '24px', minHeight: '600px' }}>
                     {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                           <Title level={4} style={{ marginTop: 0, color: '#fff' }}>{selectedNote ? 'Редактировать' : 'Новая Заметка'}</Title>
                           <Input placeholder="Заголовок..." value={editTitle} onChange={e => setEditTitle(e.target.value)} size="large" style={{ backgroundColor: '#121212', borderColor: '#333' }} />
                           <TextArea placeholder="Текст заметки..." rows={8} value={editContent} onChange={e => setEditContent(e.target.value)} style={{ backgroundColor: '#121212', borderColor: '#333' }} />
                           
                           <div>
                              <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Связи (Links):</Text>
                              <Select
                                 mode="multiple"
                                 style={{ width: '100%' }}
                                 placeholder="Выберите связанные заметки"
                                 value={editLinks}
                                 onChange={setEditLinks}
                                 options={notes.filter(n => n.id !== selectedNote?.id).map(n => ({ label: n.title, value: n.id }))}
                              />
                           </div>

                           <div>
                              <Text style={{ color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>Минут сфокусированной работы (Deepwork):</Text>
                              <Input type="number" min={0} value={editMinutes} onChange={e => setEditMinutes(Number(e.target.value))} style={{ backgroundColor: '#121212', borderColor: '#333', width: '100px' }} />
                           </div>

                           <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <Button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#262626', borderColor: '#333', color: '#fff' }}>Отмена</Button>
                              <Button type="primary" onClick={handleSave} style={{ backgroundColor: '#a3e635', borderColor: '#a3e635', color: '#121212', fontWeight: 600 }}>Сохранить</Button>
                           </div>
                        </div>
                     ) : (
                        <div>
                           <List
                              itemLayout="horizontal"
                              dataSource={notes}
                              renderItem={note => (
                                 <div 
                                    style={{ padding: '16px', borderRadius: '8px', border: '1px solid #333', marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: selectedNote?.id === note.id ? '#262626' : '#121212' }}
                                    onClick={() => setSelectedNote(note)}
                                 >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <Typography.Text strong style={{ color: '#fff', fontSize: '16px' }}>{note.title}</Typography.Text>
                                       <Typography.Text style={{ color: '#a3e635', fontWeight: 600 }}>{note.deepworkMinutes}m</Typography.Text>
                                    </div>
                                    <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '4px' }}>{note.dateCreated}</div>
                                 </div>
                              )}
                           />

                           {selectedNote && (
                              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <Title level={3} style={{ color: '#fff', margin: 0 }}>{selectedNote.title}</Title>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                       <Button icon={<EditOutlined />} onClick={() => {
                                          setEditTitle(selectedNote.title);
                                          setEditContent(selectedNote.content);
                                          setEditMinutes(selectedNote.deepworkMinutes);
                                          setEditLinks(selectedNote.links);
                                          setIsEditing(true);
                                       }} style={{ backgroundColor: '#262626', borderColor: '#333', color: '#fff' }} />
                                       <Button icon={<DeleteOutlined />} onClick={() => {
                                          deleteNote(selectedNote.id);
                                          setSelectedNote(null);
                                       }} style={{ backgroundColor: '#262626', borderColor: '#333', color: '#ef4444' }} />
                                    </div>
                                 </div>
                                 <Paragraph style={{ color: '#d9d9d9', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {selectedNote.content}
                                 </Paragraph>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </Col>

               {/* Right Pane: Graph */}
               <Col xs={24} md={12} lg={14}>
                  <div style={{ backgroundColor: '#090909', border: '1px solid #333', borderRadius: '16px', overflow: 'hidden', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {graphData.nodes.length > 0 ? (
                        <ForceGraph2D
                           graphData={graphData}
                           nodeColor={() => '#a3e635'}
                           linkColor={() => '#333333'}
                           nodeLabel="name"
                           nodeVal="val"
                           backgroundColor="#090909"
                           width={800}
                           height={600}
                           onNodeClick={node => {
                               const found = notes.find(n => n.id === node.id);
                               if (found) {
                                  setSelectedNote(found);
                                  setIsEditing(false);
                               }
                           }}
                        />
                     ) : (
                        <Text style={{ color: '#555' }}>Нет данных для графа</Text>
                     )}
                  </div>
               </Col>
        </Row>
      </div>
    </AppLayout>
  );
}
