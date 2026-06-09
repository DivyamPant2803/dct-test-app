import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styled from 'styled-components';
import { Card } from '../../../shared/types';
import { useCardData } from '../hooks/useCardData';

const COLORS = ['#c5152a', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const ErrorMsg = styled.div`
  color: #9ca3af;
  font-size: 0.82rem;
  text-align: center;
  padding: 1rem;
`;

const SkeletonChart = styled.div`
  width: 100%;
  height: 180px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

interface Props {
  card: Card;
}

const ChartCard: React.FC<Props> = ({ card }) => {
  const { data, isLoading, isError } = useCardData(card.id);
  const chartType = (card.settings?.chartType as string) ?? 'bar';

  if (isLoading) return <SkeletonChart />;
  if (isError || data?.error) return <ErrorMsg>Chart data unavailable</ErrorMsg>;

  const series = data?.series as Record<string, unknown>[] | undefined;
  if (!series || series.length === 0) return <ErrorMsg>No data</ErrorMsg>;

  if (chartType === 'pie' || chartType === 'donut') {
    const pieData = series.map((s) => ({
      name: String(s.name ?? ''),
      value: Number(s.value ?? 0),
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={chartType === 'donut' ? 50 : 0}
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const keys = Object.keys(series[0] ?? {}).filter((k) => k !== 'name');

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {keys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={series}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartCard;
