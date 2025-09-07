import styled from 'styled-components';
import React from 'react';
import { useStaticContent, StaticContentProvider } from '../contexts/StaticContentContext';
import { categoriesMeta, getCategoryFromTitle } from '../constants/categories';

const Container = styled.div`
  max-width: 1100px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
`;

const PriorityCard = styled.div`
  background: #fff;
  border-radius: 18px;
  border: 2.5px solid #d21919;
  padding: 32px 28px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  transition: box-shadow 0.2s, border 0.2s;
`;

const PriorityAccent = styled.div`
  position: absolute;
  left: 0;
  top: 24px;
  width: 6px;
  height: 36px;
  border-radius: 6px;
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const PriorityCardTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: #111;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const PriorityPanel = styled.div`
  background: #fff6f6;
  border-radius: 12px;
  margin-top: 8px;
  padding: 22px 18px 12px 18px;
  max-height: 320px;
  overflow-y: auto;
`;

const SmallCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(210, 25, 25, 0.06);
  border: 1.5px solid #f3c2c2;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 180px;
  max-height: none;
  transition: box-shadow 0.2s, border 0.2s;
`;

const SmallCardTitle = styled.h4`
  margin: 0;
  font-size: 1.08rem;
  color: #111;
  font-weight: 700;
`;

const SmallPanel = styled.div`
  background: #fff8f8;
  border-radius: 8px;
  border: 1px solid #f3c2c2;
  margin-top: 4px;
  padding: 12px 10px 8px 10px;
  width: 100%;
  max-height: none;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(210, 25, 25, 0.02);
`;

const Summary = styled.p`
  color: #666;
  margin-bottom: 20px;
  padding-bottom: 20px;
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
    color: #d21919;
    text-decoration: underline;
    &:hover {
      color: #111;
    }
  }
  strong {
    font-weight: 600;
  }
`;

const HomeContentInner = () => {
  const { content } = useStaticContent();

  // Filter out sections with no content
  const sectionsWithContent = content.filter(section => {
    // Check if the body has actual content (not just empty elements)
    if (!section.body) return false;
    
    // If body is a string, check if it's not empty
    if (typeof section.body === 'string') {
      return section.body.trim().length > 0;
    }
    
    // If body is a React element, check if it has children or text content
    if (React.isValidElement(section.body)) {
      return true; // React elements are considered to have content
    }
    
    // For arrays or other React nodes, consider them as having content
    return true;
  });

  // Find the two priority cards
  const importantIdx = sectionsWithContent.findIndex(s => s.title.replace(/[:：]+$/, '').toLowerCase().includes('important announcement'));
  const releaseIdx = sectionsWithContent.findIndex(s => s.title.replace(/[:：]+$/, '').toLowerCase().includes('announcement -') || s.title.replace(/[:：]+$/, '').toLowerCase().includes('release notes'));
  const priorityCards = [
    importantIdx !== -1 ? sectionsWithContent[importantIdx] : null,
    releaseIdx !== -1 ? sectionsWithContent[releaseIdx] : null,
  ].filter((s): s is NonNullable<typeof s> => s !== null);
  const otherCards = sectionsWithContent.filter((_, idx) => idx !== importantIdx && idx !== releaseIdx);

  return (
    <Container>
      <Summary>
        The Data Transfer Compliance Tool helps you ensure compliance for all your data transfer activities.
      </Summary>
      <TopGrid>
        {priorityCards.map((section, idx) => {
          const category = getCategoryFromTitle(section.title);
          return (
            <PriorityCard key={idx}>
              <PriorityAccent />
              <CardHeader>
                {/*category && <IconWrapper>{categoriesMeta[category].icon}</IconWrapper>*/}
                <PriorityCardTitle>{section.title}</PriorityCardTitle>
              </CardHeader>
              <PriorityPanel>
                <EntryBody>{section.body}</EntryBody>
              </PriorityPanel>
            </PriorityCard>
          );
        })}
      </TopGrid>
      <BottomGrid>
        {otherCards.map((section, idx) => {
          const category = getCategoryFromTitle(section.title);
          return (
            <SmallCard key={idx}>
              <CardHeader>
                {category && <IconWrapper>{categoriesMeta[category].icon}</IconWrapper>}
                <SmallCardTitle>{section.title}</SmallCardTitle>
              </CardHeader>
              <SmallPanel>
                <EntryBody>{section.body}</EntryBody>
              </SmallPanel>
            </SmallCard>
          );
        })}
      </BottomGrid>
    </Container>
  );
};

const HomeContent = ({ homeContentHtml }: { homeContentHtml: string }) => (
  <StaticContentProvider rawHtml={homeContentHtml}>
    <HomeContentInner />
  </StaticContentProvider>
);

const Home = ({ homeContentHtml }: { homeContentHtml: string }) => (
  <HomeContent homeContentHtml={homeContentHtml} />
);

export default Home; 