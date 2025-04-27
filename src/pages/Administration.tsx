import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 1rem;
`;

const Administration = () => (
  <Container>
    <Title>Administration</Title>
    <p>This section is reserved for future administrative functionalities.</p>
  </Container>
);

export default Administration; 