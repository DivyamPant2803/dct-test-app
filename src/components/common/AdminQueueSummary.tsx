import React from 'react';
import { Evidence } from '../../types/index';
import { colors } from '../../styles/designTokens';
import { FiClock, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { DashboardStats, StatItem } from './DashboardStats';

interface AdminQueueSummaryProps {
  evidence: Evidence[];
}

export const AdminQueueSummary: React.FC<AdminQueueSummaryProps> = ({ evidence }) => {
  // Calculate statistics
  const pending = evidence.filter(e => e.status === 'PENDING').length;
  const underReview = evidence.filter(e => e.status === 'UNDER_REVIEW').length;
  const escalated = evidence.filter(e => e.status === 'ESCALATED').length;
  const approved = evidence.filter(e => e.status === 'APPROVED').length;
  
  // Calculate today's reviews (evidence reviewed today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReviews = evidence.filter(e => {
    if (!e.reviewedAt) return false;
    const reviewedDate = new Date(e.reviewedAt);
    reviewedDate.setHours(0, 0, 0, 0);
    return reviewedDate.getTime() === today.getTime();
  }).length;
  
  // Calculate overdue (evidence pending for more than 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const overdue = evidence.filter(e => {
    if (e.status === 'APPROVED' || e.status === 'REJECTED') return false;
    const uploadDate = new Date(e.uploadedAt);
    return uploadDate < sevenDaysAgo;
  }).length;

  const stats: StatItem[] = [
    {
      label: 'Pending Review',
      value: pending,
      icon: <FiClock />,
      color: colors.status.pending,
      subtext: 'Awaiting initial review'
    },
    {
      label: 'Under Review',
      value: underReview,
      icon: <FiRefreshCw />,
      color: colors.status.underReview,
      subtext: 'Currently being reviewed'
    },
    {
      label: 'Escalated',
      value: escalated,
      icon: <FiAlertTriangle />,
      color: colors.status.escalated,
      subtext: 'Requires legal review',
      highlight: escalated > 0
    },
    {
      label: 'Approved',
      value: approved,
      icon: <FiCheckCircle />,
      color: colors.status.approved,
      subtext: 'Completed reviews'
    },
    {
      label: "Today's Reviews",
      value: todayReviews,
      icon: <FiFileText />,
      color: colors.semantic.info,
      subtext: 'Reviewed today'
    }
  ];

  if (overdue > 0) {
    stats.push({
      label: 'Overdue',
      value: overdue,
      icon: <FiAlertTriangle />,
      color: colors.semantic.error,
      subtext: 'Pending > 7 days',
      highlight: true
    });
  }

  return <DashboardStats items={stats} />;
};


