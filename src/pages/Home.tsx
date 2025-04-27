import styled from 'styled-components';
import { FaBullhorn, FaFileAlt, FaBookOpen, FaStickyNote, FaInfoCircle } from 'react-icons/fa';

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

const IconWrapper = styled.div`
  font-size: 1.6rem;
  margin-bottom: 10px;
  color:rgb(0, 0, 0);
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #222;
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

const Collapsible = styled.details`
  width: 100%;
  margin-top: 16px;
  summary {
    font-weight: 500;
    cursor: pointer;
    outline: none;
  }
`;

const Home = () => (
  <Container>
    <Summary>
      The Data Transfer Compliance Tool helps you manage, track, and ensure compliance for all your data transfer activities.
    </Summary>
    <Grid>
      <Card>
        <IconWrapper><FaBullhorn aria-hidden="true" /></IconWrapper>
        <CardTitle>Important Announcements</CardTitle>
        <Summary>System maintenance on April 30</Summary>
        <Button>View All</Button>
      </Card>
      <Card>
        <IconWrapper><FaFileAlt aria-hidden="true" /></IconWrapper>
        <CardTitle>Release Notes</CardTitle>
        <Summary>v2.3.1 Released - Minor bug fixes</Summary>
        <Button>View All</Button>
      </Card>
      <Card>
        <IconWrapper><FaStickyNote aria-hidden="true" /></IconWrapper>
        <CardTitle>Key Notes</CardTitle>
        <Summary>Updated compliance guidelines</Summary>
        <Button>View All</Button>
      </Card>
      <Card>
        <IconWrapper><FaBookOpen aria-hidden="true" /></IconWrapper>
        <CardTitle>Training Materials</CardTitle>
        <Summary>New user onboarding module available</Summary>
        <Button>View All</Button>
      </Card>
    </Grid>
  </Container>
);

export default Home; 