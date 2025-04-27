import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #f5f5f5;
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 1rem;
`;

const Home = () => (
  <Container>
    <Title>Welcome to the Data Transfer Compliance Tool</Title>
    <p>Select a tab above to get started.</p>
  </Container>
);

export default Home; 