import React, { useState } from 'react';
import styled from 'styled-components';
import { useStaticContent, ContentItem } from '../contexts/StaticContentContext';

const Layout = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const LeftPanel = styled.div`
  width: 220px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  padding-top: 32px;
`;

const NavTile = styled.button<{active: boolean}>`
  background: ${({active}) => active ? '#f0f0f0' : 'transparent'};
  border: none;
  border-left: ${({active}) => active ? '4px solid #222' : '4px solid transparent'};
  color: #222;
  font-size: 1.1rem;
  padding: 16px 24px;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
  &:hover, &:focus {
    background: #f0f0f0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Tabs = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{active: boolean}>`
  background: ${({active}) => active ? '#222' : '#fff'};
  color: ${({active}) => active ? '#fff' : '#222'};
  border: 1px solid #222;
  border-radius: 6px 6px 0 0;
  padding: 10px 24px;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  font-weight: 500;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 24px 18px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-height: 80px;
`;

const Button = styled.button`
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid #222;
  background: #222;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  align-self: flex-start;
  transition: background 0.2s;
  &:hover, &:focus {
    background: #444;
    outline: none;
  }
`;

type CategoryKey = 'announcements' | 'releasenotes' | 'keynotes' | 'training';

const categories = [
  { key: 'announcements', label: 'Important Announcements' },
  { key: 'releasenotes', label: 'Release Notes' },
  { key: 'keynotes', label: 'Key Notes' },
  { key: 'training', label: 'Training Material' },
];

const Administration = () => {
  const [activeTile, setActiveTile] = useState('static');
  const [activeTab, setActiveTab] = useState<CategoryKey>('announcements');
  const { content, setContent } = useStaticContent();
  const [form, setForm] = useState<ContentItem>({ title: '', body: '' });
  const [editIdx, setEditIdx] = useState<number|null>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContent(prev => {
      const arr = [...prev[activeTab as CategoryKey]];
      if (editIdx !== null) {
        arr[editIdx] = { ...form };
      } else {
        arr.unshift({ ...form });
      }
      return { ...prev, [activeTab as CategoryKey]: arr };
    });
    setForm({ title: '', body: '' });
    setEditIdx(null);
  };

  const handleEdit = (idx: number) => {
    setForm(content[activeTab as CategoryKey][idx]);
    setEditIdx(idx);
  };

  const handleDelete = (idx: number) => {
    setContent(prev => {
      const arr = [...prev[activeTab as CategoryKey]];
      arr.splice(idx, 1);
      return { ...prev, [activeTab as CategoryKey]: arr };
    });
    setForm({ title: '', body: '' });
    setEditIdx(null);
  };

  return (
    <Layout>
      <LeftPanel>
        <NavTile active={activeTile==='static'} onClick={()=>setActiveTile('static')}>Static Content</NavTile>
        {/* Future tiles here */}
      </LeftPanel>
      <MainContent>
        {activeTile==='static' && (
          <>
            <Tabs>
              {categories.map(cat => (
                <Tab key={cat.key} active={activeTab===cat.key} onClick={()=>{setActiveTab(cat.key as CategoryKey); setForm({title:'',body:''}); setEditIdx(null);}}>{cat.label}</Tab>
              ))}
            </Tabs>
            <Card>
              <Form onSubmit={handleSubmit}>
                <Input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required />
                <TextArea name="body" placeholder="Content" value={form.body} onChange={handleFormChange} required />
                <Button type="submit">{editIdx!==null ? 'Update' : 'Add'} Content</Button>
              </Form>
            </Card>
            {content[activeTab as CategoryKey].map((item: ContentItem, idx: number) => (
              <Card key={idx}>
                <h4>{item.title}</h4>
                <p style={{whiteSpace:'pre-line'}}>{item.body.length > 120 ? item.body.slice(0,120)+'...' : item.body}</p>
                <Button type="button" onClick={()=>handleEdit(idx)}>Edit</Button>
                <Button type="button" style={{marginLeft:8,background:'#fff',color:'#222',border:'1px solid #222'}} onClick={()=>handleDelete(idx)}>Delete</Button>
              </Card>
            ))}
          </>
        )}
      </MainContent>
    </Layout>
  );
};

export default Administration; 