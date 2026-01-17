import React from 'react';
import styled from 'styled-components';
import { colors, borderRadius, shadows, spacing, transitions, typography } from '../../styles/designTokens';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string; // Icon and highlight color
  subtext?: string;
  highlight?: boolean;
  onClick?: () => void;
}

interface DashboardStatsProps {
  items: StatItem[];
  columns?: number;
}

const StatsContainer = styled.div<{ $columns?: number }>`
  display: ${props => props.$columns ? 'grid' : 'flex'};
  ${props => props.$columns && `grid-template-columns: repeat(${props.$columns}, 1fr);`}
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
`;

const CompactCard = styled.div<{ $highlight?: boolean; $color?: string; $clickable?: boolean }>`
  background: ${colors.background.paper};
  border-radius: ${borderRadius.base};
  padding: ${spacing.md} ${spacing.lg};
  box-shadow: ${shadows.sm};
  border: 1px solid ${props => props.$highlight && props.$color ? props.$color : colors.neutral.gray200};
  transition: all ${transitions.base};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;

  ${props => props.$highlight && `
    background: linear-gradient(to right, ${colors.background.paper}, ${props.$color}08);
    border-left: 4px solid ${props.$color};
  `}

  &:hover {
    box-shadow: ${shadows.md};
    transform: translateY(-2px);
    border-color: ${props => props.$color || colors.neutral.gray400};
  }
`;

const IconWrapper = styled.div<{ $color?: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${borderRadius.full};
  background: ${props => props.$color ? `${props.$color}15` : colors.neutral.gray100};
  color: ${props => props.$color || colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Value = styled.div<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$color || colors.text.primary};
  line-height: 1.1;
`;

const Label = styled.div`
  font-size: ${typography.fontSize.xs};
  font-weight: 600;
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
`;

const Subtext = styled.div`
  font-size: 0.7rem;
  color: ${colors.text.tertiary};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DashboardStats: React.FC<DashboardStatsProps> = ({ items, columns }) => {
  return (
    <StatsContainer $columns={columns}>
      {items.map((item, index) => (
        <CompactCard 
          key={index} 
          $highlight={item.highlight} 
          $color={item.color}
          $clickable={!!item.onClick}
          onClick={item.onClick}
        >
          {item.icon && (
            <IconWrapper $color={item.color}>
              {item.icon}
            </IconWrapper>
          )}
          <Content>
            <Value $color={item.highlight ? item.color : undefined}>{item.value}</Value>
            <Label>{item.label}</Label>
            {item.subtext && <Subtext>{item.subtext}</Subtext>}
          </Content>
        </CompactCard>
      ))}
    </StatsContainer>
  );
};
