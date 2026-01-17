import styled from 'styled-components';

// -- Layout Components --

export const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
`;

export const SidebarWrapper = styled.div`
  flex-shrink: 0;
`;

export const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 0;
`;

export const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
  flex-shrink: 0;
`;

// -- Table Components --

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  min-height: 0;
`;

// Added fixed layout support for better column control if needed
export const FixedTable = styled(Table)`
  table-layout: fixed;
`;

export const Th = styled.th<{ $width?: string }>`
  background: #f8f8f8;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
  width: ${props => props.$width || 'auto'};
`;

export const Td = styled.td<{ $width?: string }>`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  vertical-align: middle; // Common default
  width: ${props => props.$width || 'auto'};
`;

export const Tr = styled.tr`
  &:hover {
    background: #f9f9f9;
  }
`;

// -- Filters & Controls --

export const Filters = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
`;

export const SelectWrapper = styled.div`
  min-width: 150px;
`;

// -- Interactive Elements --

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; $size?: 'sm' | 'md' }>`
  padding: ${props => props.$size === 'sm' ? '0.3rem 0.6rem' : '0.4rem 0.8rem'};
  border-radius: 4px;
  border: 1px solid ${props => {
    if (props.variant === 'danger') return '#F44336';
    if (props.variant === 'primary') return '#222'; // Default primary color
    return '#ccc';
  }};
  background: ${props => {
    if (props.variant === 'danger') return '#F44336';
    if (props.variant === 'primary') return '#222';
    return 'white';
  }};
  color: ${props => (props.variant === 'primary' || props.variant === 'danger') ? 'white' : '#222'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${props => props.$size === 'sm' ? '0.7rem' : '0.8rem'};
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

  &:hover {
    background: ${props => {
      if (props.variant === 'danger') return '#d32f2f';
      if (props.variant === 'primary') return '#444';
      return '#f8f8f8';
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:last-child {
    margin-right: 0;
  }
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: ${props => props.$active ? '#222' : 'white'};
  color: ${props => props.$active ? 'white' : '#222'};
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$active ? '#444' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
`;

// -- Feedback & Status --

export const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

export const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-size: 0.9rem;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  
  ${props => {
    switch (props.$status) {
      case 'PENDING':
        return `background: #fef3c7; color: #92400e;`;
      case 'APPROVED':
      case 'COMPLETED':
        return `background: #d1fae5; color: #065f46;`;
      case 'REJECTED':
        return `background: #fee2e2; color: #991b1b;`;
      case 'UNDER_REVIEW':
      case 'review':
        return `background: #dbeafe; color: #1e40af;`;
      case 'ESCALATED':
        return `background: #e9d5ff; color: #7c3aed;`;
      case 'CURRENT':
        return `background: #d1fae5; color: #065f46;`;
      case 'DUE_SOON':
        return `background: #fef3c7; color: #92400e;`;
      case 'OVERDUE':
        return `background: #fee2e2; color: #991b1b;`;
      default:
        return `background: #f3f4f6; color: #6b7280;`;
    }
  }}
`;

export const PriorityBadge = styled.span<{ $priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  
  background-color: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FFA000';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  }};
`;

export const SLABadge = styled.span<{ $type: 'breached' | 'approaching' | 'ok' }>`
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: white;
  
  background-color: ${props => {
    switch (props.$type) {
      case 'breached':
        return '#F44336';
      case 'approaching':
        return '#FFA000';
      default:
        return '#4CAF50';
    }
  }};
`;

// -- Stats --

export const StatsGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 4}, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
`;

export const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 600;
  color: #222; // Default, can be overridden with inline style
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
