import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ExecutiveDirectorDashboard } from './dashboards/ExecutiveDirectorDashboard';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const { currentUser, setActiveSection } = useApp();
  const role = currentUser?.Role;
  const isSuperUser = role === 'developer' || role === 'director' || role === 'deputy';

  const getTargetSection = () => {
    if (role === 'reception' || role === 'reception_officer') return 'reception';
    if (role === 'admin' || role === 'admin_officer') return 'admin';
    if (role === 'interviews_officer') return 'interviews';
    if (role === 'organization' || role === 'organization_officer') return 'organization';
    if (role === 'machine' || role === 'machine_officer') return 'machine';
    if (role === 'audit') return 'audit';
    return 'search_archive';
  };

  useEffect(() => {
    if (!isSuperUser && role) {
      const timer = setTimeout(() => {
        setActiveSection(getTargetSection());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuperUser, role, setActiveSection]);

  // If not Developer or Director, show guard and route to department
  if (!isSuperUser) {
    const targetSection = getTargetSection();
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto shadow-xs font-['Tajawal',sans-serif]" dir="rtl">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">لوحة التحكم المركزية مخصصة للمطور ومدير المكتب فقط</h3>
          <p className="text-xs text-slate-500">
            وفقاً لتعليمات الصلاحيات، تم تخصيص هذه اللوحة للمطور والمدير التنفيذي فقط. بإمكانك الانتقال مباشرة إلى قسمك المعتمد.
          </p>
        </div>
        <button
          onClick={() => setActiveSection(targetSection)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>الانتقال إلى قسمك المعتمد ({currentUser?.RoleArabic})</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Developer & Executive Director Comprehensive Dashboard
  return <ExecutiveDirectorDashboard />;
};
