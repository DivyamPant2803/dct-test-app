import React from 'react';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { sanitizeHtml } from '../../../shared/sanitize';
import { isSafeUrl } from '../../../shared/sanitize';

const BRAND = '#c5152a';

const List = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Entry = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:first-child { padding-top: 0; }
  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const DateColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
`;

const DayNum = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
`;

const MonthLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 1px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryTitle = styled.a`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  line-height: 1.3;

  &:hover { color: ${BRAND}; text-decoration: underline; }
`;

const EntryTitlePlain = styled.div`
  font-size: 0.82rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 2px;
  flex-wrap: wrap;
`;

const VersionChip = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  background: #eff6ff;
  color: #1d4ed8;
`;

const LatestChip = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  background: #d1fae5;
  color: #065f46;
`;

const EntryBody = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
  margin-top: 3px;
  b, strong { color: #374151; }
`;

interface Props { card: Card }

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const TimelineCard: React.FC<Props> = ({ card }) => {
  const now = Date.now();

  const visible = (card.items ?? []).filter((item) => {
    const from = item.effectiveFromUtc ? new Date(item.effectiveFromUtc).getTime() : -Infinity;
    const to   = item.effectiveToUtc   ? new Date(item.effectiveToUtc).getTime()   :  Infinity;
    return now >= from && now <= to;
  });

  if (visible.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>No timeline entries.</p>;
  }

  return (
    <List>
      {visible.map((item) => {
        const version  = typeof item.extra?.version === 'string' ? item.extra.version : null;
        const dateStr  = typeof item.extra?.date === 'string' ? item.extra.date : null;
        const safeUrl  = item.url && isSafeUrl(item.url) ? item.url : null;

        // Parse date for day/month display
        let day: string | null = null;
        let month: string | null = null;
        if (dateStr) {
          try {
            const d = new Date(dateStr);
            day   = String(d.getDate());
            month = MONTHS[d.getMonth()];
          } catch { /* ignore */ }
        }

        return (
          <Entry key={item.id}>
            <DateColumn aria-label={dateStr ?? undefined}>
              {day && <DayNum>{day}</DayNum>}
              {month && <MonthLabel>{month}</MonthLabel>}
              {!day && !month && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: BRAND, marginTop: 4 }} />
              )}
            </DateColumn>

            <Content>
              {safeUrl ? (
                <EntryTitle href={safeUrl} target="_blank" rel="noopener noreferrer">
                  {item.title ?? 'Entry'}
                </EntryTitle>
              ) : (
                <EntryTitlePlain>{item.title ?? 'Entry'}</EntryTitlePlain>
              )}

              <BadgeRow>
                {version && <VersionChip>{version}</VersionChip>}
                {item.badgeText && <LatestChip>{item.badgeText}</LatestChip>}
                {dateStr && (
                  <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                    {new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </BadgeRow>

              {item.bodyHtml && (
                <EntryBody dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.bodyHtml) }} />
              )}
            </Content>
          </Entry>
        );
      })}
    </List>
  );
};

export default TimelineCard;
