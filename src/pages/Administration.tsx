import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUpload, FiEdit, FiTrash2, FiFile } from 'react-icons/fi';
import { useStaticContent } from '../contexts/StaticContentContext';
import { SectionContentItem } from '../utils/parseHomeHtml';
import { UploadedTemplate } from '../types/index';
import {
  getAllTemplates,
  deleteTemplate,
  updateTemplate,
  formatFileSize,
} from '../services/uploadedTemplateService';
import UploadTemplateDialog from '../components/UploadTemplateDialog';

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
  overflow-y: auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #222;
  margin: 0;
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
  max-width: 750px;
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

const UploadButton = styled.button`
  padding: 10px 24px;
  border-radius: 6px;
  border: 1px solid #222;
  background: #222;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #444;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const TemplatesTable = styled.div`
  width: 100%;
  max-width: 1200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 120px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  transition: background 0.2s;
  
  &:hover {
    background: #f8f8f8;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TemplateName = styled.div`
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TemplateDescription = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'ACTIVE':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'DRAFT':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'ARCHIVED':
        return `
          background: #e0e0e0;
          color: #666;
        `;
      default:
        return `
          background: #f0f0f0;
          color: #666;
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $variant?: 'danger' }>`
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 4px;
  color: ${props => props.$variant === 'danger' ? '#dc3545' : '#666'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? '#dc354515' : '#f0f0f0'};
    color: ${props => props.$variant === 'danger' ? '#dc3545' : '#222'};
  }
`;

const EmptyState = styled.div`
  padding: 60px 24px;
  text-align: center;
  color: #666;
`;

const EmptyStateIcon = styled(FiFile)`
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 16px;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

const EmptyStateHint = styled.p`
  font-size: 0.9rem;
  color: #999;
`;

type CategoryKey = 'announcements' | 'releasenotes' | 'keynotes' | 'training';

const categories = [
  { key: 'announcements', label: 'Important Announcements' },
  { key: 'releasenotes', label: 'Release Notes' },
  { key: 'keynotes', label: 'Key Notes' },
  { key: 'training', label: 'Training Material' },
];

interface AdministrationProps {
}

const Collapsible: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ width: '100%', maxWidth: 750, marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          background: '#e9e9e9',
          borderRadius: '8px 8px 0 0',
          padding: '12px 18px',
          fontWeight: 600,
          fontSize: '1.1rem',
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span style={{ marginRight: 12 }}>{open ? '▼' : '▶'}</span>
        {title}
      </div>
      {open && (
        <div style={{ border: '1px solid #e9e9e9', borderTop: 'none', borderRadius: '0 0 8px 8px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const Administration: React.FC<AdministrationProps> = () => {
  const [activeTile, setActiveTile] = useState('static');
  const [activeTab, setActiveTab] = useState<CategoryKey>('announcements');
  const { content, setContent } = useStaticContent();
  const [form, setForm] = useState<{ title: string; body: string }>({ title: '', body: '' });
  const [editIdx, setEditIdx] = useState<number|null>(null);
  
  // Template upload state
  const [templates, setTemplates] = useState<UploadedTemplate[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (activeTile === 'templates') {
      loadTemplates();
    }
  }, [activeTile]);

  const loadTemplates = () => {
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContent(prev => {
      const arr = [...(prev as any)[activeTab]];
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
    const item = (content as any)[activeTab][idx];
    setForm({ 
      title: item.title, 
      body: typeof item.body === 'string' ? item.body : String(item.body) 
    });
    setEditIdx(idx);
  };

  const handleDelete = (idx: number) => {
    setContent(prev => {
      const arr = [...(prev as any)[activeTab]];
      arr.splice(idx, 1);
      return { ...prev, [activeTab as CategoryKey]: arr };
    });
    setForm({ title: '', body: '' });
    setEditIdx(null);
  };

  const handleTemplateDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
      loadTemplates();
    }
  };

  const handleTemplateStatusChange = (templateId: string, newStatus: 'ACTIVE' | 'DRAFT' | 'ARCHIVED') => {
    updateTemplate(templateId, { status: newStatus });
    loadTemplates();
  };

  const handleUploadSuccess = () => {
    loadTemplates();
  };

  return (
    <Layout>
      <LeftPanel>
        <NavTile active={activeTile==='static'} onClick={()=>setActiveTile('static')}>Static Content</NavTile>
        <NavTile active={activeTile==='templates'} onClick={()=>setActiveTile('templates')}>Template Upload</NavTile>
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
            <Collapsible title={`View All ${categories.find(c => c.key === activeTab)?.label}`}> 
              {((content as any)[activeTab] || []).map((item: SectionContentItem, idx: number) => (
                <Card key={idx}>
                  <h4>{item.title}</h4>
                  <p style={{whiteSpace:'pre-line'}}>{typeof item.body === 'string' && item.body.length > 120 ? item.body.slice(0,120)+'...' : item.body}</p>
                  <Button type="button" onClick={()=>handleEdit(idx)}>Edit</Button>
                  <Button type="button" style={{marginLeft:8,background:'#fff',color:'#222',border:'1px solid #222'}} onClick={()=>handleDelete(idx)}>Delete</Button>
                </Card>
              ))}
            </Collapsible>
          </>
        )}
        
        {activeTile==='templates' && (
          <>
            <PageHeader>
              <PageTitle>Template Management</PageTitle>
              <UploadButton onClick={() => setUploadDialogOpen(true)}>
                <FiUpload />
                Upload Template
              </UploadButton>
            </PageHeader>

            {templates.length === 0 ? (
              <TemplatesTable>
                <EmptyState>
                  <EmptyStateIcon />
                  <EmptyStateText>No templates uploaded yet</EmptyStateText>
                  <EmptyStateHint>Click "Upload Template" to add your first template</EmptyStateHint>
                </EmptyState>
              </TemplatesTable>
            ) : (
              <TemplatesTable>
                <TableHeader>
                  <div>Template Name</div>
                  <div>Type</div>
                  <div>Uploaded</div>
                  <div>Size</div>
                  <div>Status</div>
                  <div>Actions</div>
                </TableHeader>
                {templates.map(template => (
                  <TableRow key={template.id}>
                    <div>
                      <TemplateName>
                        <FiFile />
                        {template.name}
                      </TemplateName>
                      {template.description && (
                        <TemplateDescription>{template.description}</TemplateDescription>
                      )}
                    </div>
                    <div>{template.documentType}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {new Date(template.uploadedAt).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatFileSize(template.fileSize)}
                    </div>
                    <div>
                      <StatusBadge $status={template.status}>{template.status}</StatusBadge>
                    </div>
                    <ActionButtons>
                      {template.status !== 'ACTIVE' && (
                        <IconButton
                          onClick={() => handleTemplateStatusChange(template.id, 'ACTIVE')}
                          title="Set as Active"
                        >
                          <FiEdit size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        $variant="danger"
                        onClick={() => handleTemplateDelete(template.id)}
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </IconButton>
                    </ActionButtons>
                  </TableRow>
                ))}
              </TemplatesTable>
            )}

            <UploadTemplateDialog
              isOpen={uploadDialogOpen}
              onClose={() => setUploadDialogOpen(false)}
              onSuccess={handleUploadSuccess}
            />
          </>
        )}
      </MainContent>
    </Layout>
  );
};

export { Administration }; 