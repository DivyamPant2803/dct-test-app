import styled from 'styled-components';
import { useState } from 'react';
import { useStaticContent } from '../contexts/StaticContentContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const TwoPanel = styled.div`
  display: flex;
  gap: 32px;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0;
  }
`;

const CardList = styled.div`
  flex: 0 0 300px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 16px 0;
  overflow-y: auto;
  max-height: 70vh;
  @media (max-width: 900px) {
    max-height: none;
    flex: unset;
    margin-bottom: 24px;
  }
`;

const CardListItem = styled.button<{ selected: boolean }>`
  display: block;
  width: 100%;
  background: ${({ selected }) => (selected ? '#ececec' : 'transparent')};
  border: none;
  text-align: left;
  padding: 16px 24px;
  font-size: 1rem;
  color: #222;
  font-weight: ${({ selected }) => (selected ? 600 : 500)};
  cursor: pointer;
  border-left: 4px solid ${({ selected }) => (selected ? '#222' : 'transparent')};
  transition: background 0.2s, border-color 0.2s;
  &:hover, &:focus {
    background: #ececec;
    outline: none;
  }
`;

const DetailsPanel = styled.div`
  flex: 1 1 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 32px 28px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 700px;
  @media (max-width: 1200px) {
    min-width: 320px;
    max-width: 100%;
  }
  @media (max-width: 900px) {
    min-width: unset;
    max-width: 100%;
  }
  align-items: flex-start;
  text-align: left;
`;

const Title = styled.h2`
  margin: 0 0 12px 0;
  font-size: 1.4rem;
  color: #222;
  font-weight: 700;
`;

const EntryBody = styled.div`
  color: #333;
  margin-top: 8px;
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

const HomeTwoPanel = () => {
  const { content } = useStaticContent();
  const [selected, setSelected] = useState(0);

  return (
    <Container>
      <TwoPanel>
        <CardList>
          {content.map((section, idx) => (
            <CardListItem
              key={idx}
              selected={selected === idx}
              onClick={() => setSelected(idx)}
              aria-current={selected === idx}
            >
              {section.title}
            </CardListItem>
          ))}
        </CardList>
        <DetailsPanel>
          <Title>{content[selected].title}</Title>
          <EntryBody>{content[selected].body}</EntryBody>
        </DetailsPanel>
      </TwoPanel>
    </Container>
  );
};

export default HomeTwoPanel; 