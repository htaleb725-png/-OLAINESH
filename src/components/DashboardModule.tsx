import React from 'react';
import { useApp } from '../context/AppContext';
import { ReceptionDashboard } from './dashboards/ReceptionDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { InterviewsDashboard } from './dashboards/InterviewsDashboard';
import { OrganizationDashboard } from './dashboards/OrganizationDashboard';
import { MachineDashboard } from './dashboards/MachineDashboard';
import { AuditDashboard } from './dashboards/AuditDashboard';
import { ExecutiveDirectorDashboard } from './dashboards/ExecutiveDirectorDashboard';

export const DashboardModule: React.FC = () => {
  const { currentUser } = useApp();
  const role = currentUser?.Role;

  // 1. Reception department isolation:
  // Reception officers see ONLY their dedicated Reception dashboard
  // (Visitor entries, today's arrivals, badge issuance, Dhi Qar districts flow, zero admin data)
  if (role === 'reception' || role === 'reception_officer') {
    return <ReceptionDashboard />;
  }

  // 2. Administration / Transactions department isolation:
  // Admin officers see ONLY government requests, ministries, and completion tracking
  if (role === 'admin' || role === 'admin_officer') {
    return <AdminDashboard />;
  }

  // 3. Interviews department isolation:
  // Interviews officers see citizen meetings schedule, subjects, and directives
  if (role === 'interviews_officer') {
    return <InterviewsDashboard />;
  }

  // 4. Organization & Public Relations department isolation:
  // Organization officers see cadres, public supporters, clans, and referrers
  if (role === 'organization' || role === 'organization_officer') {
    return <OrganizationDashboard />;
  }

  // 5. Office Machine & Printing department isolation:
  // Machine officers see printing queue, citizen cards and barcodes
  if (role === 'machine' || role === 'machine_officer') {
    return <MachineDashboard />;
  }

  // 6. Audit & Legislative inspection isolation:
  // Audit officers see live activity logs, modifications, and system compliance
  if (role === 'audit') {
    return <AuditDashboard />;
  }

  // 7. Executive Director, Deputy, Developer, Archive:
  // Comprehensive office-wide overview with supervisor preview switcher
  return <ExecutiveDirectorDashboard />;
};
