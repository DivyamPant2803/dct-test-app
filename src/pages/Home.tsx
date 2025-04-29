import styled from 'styled-components';
import { FaBullhorn, FaFileAlt, FaBookOpen, FaStickyNote } from 'react-icons/fa';
import { useState } from 'react';
import { useStaticContent } from '../contexts/StaticContentContext';

const Container = styled.div`
  max-width: 1100px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const IconWrapper = styled.div`
  font-size: 1.3rem;
  margin-bottom: 0;
  color:rgb(0, 0, 0);
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  color: #222;
  font-weight: 600;
`;

const Summary = styled.p`
  color: #666;
  margin-bottom: 20px;
  padding-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid rgb(0, 0, 0);
  background: #fff;
  color:rgb(0, 0, 0);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover, &:focus {
    background:rgb(0, 0, 0);
    color: #fff;
    outline: none;
  }
`;

type CategoryKey = 'announcements' | 'releasenotes' | 'keynotes' | 'training';

const categoryMeta = {
  announcements: { icon: <FaBullhorn aria-hidden="true" />, label: 'Important Announcements' },
  releasenotes: { icon: <FaFileAlt aria-hidden="true" />, label: 'Release Notes' },
  keynotes: { icon: <FaStickyNote aria-hidden="true" />, label: 'Key Notes' },
  training: { icon: <FaBookOpen aria-hidden="true" />, label: 'Training Materials' },
};

const ExpandedPanel = styled.div`
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-top: 18px;
  padding: 18px 14px 8px 14px;
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }
`;

const EntryTitle = styled.div`
  font-weight: 600;
  margin-bottom: 2px;
`;
const EntryDate = styled.div`
  font-size: 0.92rem;
  color: #888;
  margin-bottom: 4px;
`;
const EntryBody = styled.div`
  margin-bottom: 12px;
  color: #333;
  white-space: pre-line;
`;
const Divider = styled.div`
  border-bottom: 1px solid #ececec;
  margin: 10px 0 12px 0;
`;

const Home = () => {
  const [expanded, setExpanded] = useState<CategoryKey|null>(null);
  const { content } = useStaticContent();

  const handleExpand = (key: CategoryKey) => {
    setExpanded(prev => (prev === key ? null : key));
  };

  return (
    <Container>
      <Summary>
        The Data Transfer Compliance Tool helps you ensure compliance for all your data transfer activities.
      </Summary>
      <Grid>
        {(Object.keys(content) as CategoryKey[]).map((key) => {
          const entries = content[key];
          const meta = categoryMeta[key];
          return (
            <Card key={key}>
              <CardHeader>
                <IconWrapper>{meta.icon}</IconWrapper>
                <CardTitle>{meta.label}</CardTitle>
              </CardHeader>
              {expanded === key ? (
                <>
                  <Button onClick={() => handleExpand(key)} aria-expanded={expanded===key} aria-controls={`${key}-panel`}>
                    Hide Details
                  </Button>
                  <ExpandedPanel id={`${key}-panel`}>
                    <div style={{fontWeight:500, marginBottom:10}}>▼ All {meta.label}</div>
                    {entries.map((entry, idx) => (
                      <div key={idx}>
                        <EntryTitle>{entry.title}</EntryTitle>
                        <EntryDate>{entry.date ? entry.date : ''}</EntryDate>
                        <EntryBody>{entry.body}</EntryBody>
                        {idx < entries.length-1 && <Divider />}
                      </div>
                    ))}
                  </ExpandedPanel>
                </>
              ) : (
                <Button onClick={() => handleExpand(key)} aria-expanded={expanded===key} aria-controls={`${key}-panel`}>
                  View Details
                </Button>
              )}
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Home; 