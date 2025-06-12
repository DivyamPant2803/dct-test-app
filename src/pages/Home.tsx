import styled from 'styled-components';
import { useState } from 'react';
import { useStaticContent, StaticContentProvider } from '../contexts/StaticContentContext';

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

const EntryBody = styled.div`
  margin-bottom: 12px;
  color: #333;

  ul, ol {
    margin: 0.5em 0 0.5em 1.5em;
    padding: 0;
  }
  li {
    margin: 0.25em 0;
    list-style: disc inside;
  }
  p {
    margin: 0.5em 0;
  }
  a {
    color: #3366cc;
    text-decoration: underline;
    &:hover {
      color: #003399;
    }
  }
  strong {
    font-weight: 600;
  }
`;
const Divider = styled.div`
  border-bottom: 1px solid #ececec;
  margin: 10px 0 12px 0;
`;

// Inner content that uses the context
const HomeContentInner = () => {
  const [expanded, setExpanded] = useState<number|null>(null);
  const { content } = useStaticContent();

  const handleExpand = (idx: number) => {
    setExpanded(prev => (prev === idx ? null : idx));
  };

  return (
    <Container>
      <Summary>
        The Data Transfer Compliance Tool helps you ensure compliance for all your data transfer activities.
      </Summary>
      <Grid>
        {content.map((section, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            {expanded === idx ? (
              <>
                <Button onClick={() => handleExpand(idx)} aria-expanded={expanded===idx} aria-controls={`panel-${idx}`}>
                  Hide Details
                </Button>
                <ExpandedPanel id={`panel-${idx}`}>
                  <EntryBody>{section.body}</EntryBody>
                </ExpandedPanel>
              </>
            ) : (
              <Button onClick={() => handleExpand(idx)} aria-expanded={expanded===idx} aria-controls={`panel-${idx}`}>
                View Details
              </Button>
            )}
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

// HomeContent receives the HTML as a prop and provides it to the context
const HomeContent = ({ homeContentHtml }: { homeContentHtml: string }) => (
  <StaticContentProvider rawHtml={homeContentHtml}>
    <HomeContentInner />
  </StaticContentProvider>
);

// Home receives the HTML as a prop and passes it down
const Home = ({ homeContentHtml }: { homeContentHtml: string }) => (
  <HomeContent homeContentHtml={homeContentHtml} />
);

export default Home; 