import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExecutiveDirectorDashboard } from './dashboards/ExecutiveDirectorDashboard';
import { ReceptionDashboard } from './dashboards/ReceptionDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { InterviewsDashboard } from './dashboards/InterviewsDashboard';
import { OrganizationDashboard } from './dashboards/OrganizationDashboard';
import { MachineDashboard } from './dashboards/MachineDashboard';
import { AuditDashboard } from './dashboards/AuditDashboard';
import { 
  LayoutDashboard, 
  UserPlus, 
  FolderKanban, 
  Handshake, 
  Users2, 
  Printer, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  BarChart3,
  Building2,
  ExternalLink
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const { currentUser, setActiveSection } = useApp();
  const role = currentUser?.Role || 'reception';
  const isSuperUser = role === 'developer' || role === 'director' || role === 'deputy';

  // For superusers, allow switching between executive view and any department's dashboard
  const [selectedDepartmentTab, setSelectedDepartmentTab] = useState<string>('executive');

  // Determine which dashboard to render for department users
  const getDepartmentComponent = () => {
    switch (role) {
      case 'reception':
      case 'reception_officer':
        return <ReceptionDashboard />;
      case 'admin':
      case 'admin_officer':
        return <AdminDashboard />;
      case 'interviews_officer':
        return <InterviewsDashboard />;
      case 'organization':
      case 'organization_officer':
        return <OrganizationDashboard />;
      case 'machine':
      case 'machine_officer':
        return <MachineDashboard />;
      case 'audit':
        return <AuditDashboard />;
      default:
        return <ReceptionDashboard />;
    }
  };

  const getDepartmentWorkspaceSection = () => {
    switch (role) {
      case 'reception':
      case 'reception_officer':
        return { id: 'reception', label: 'الانتقال إلى واجهة تسجيل واستقبال المراجعين' };
      case 'admin':
      case 'admin_officer':
        return { id: 'admin', label: 'الانتقال إلى سجل وإجراءات المعاملات والكتب' };
      case 'interviews_officer':
        return { id: 'interviews', label: 'الانتقال إلى جدول ومواعيد مقابلات النائب' };
      case 'organization':
      case 'organization_officer':
        return { id: 'organization', label: 'الانتقال إلى سجل الكوادر والاتصال الجماهيري' };
      case 'machine':
      case 'machine_officer':
        return { id: 'machine', label: 'الانتقال إلى وحدة الطباعة والكتب الرسمية' };
      case 'audit':
        return { id: 'audit', label: 'الانتقال إلى سجل الرقابة والتشريع' };
      default:
        return { id: 'search_archive', label: 'الانتقال إلى سجل البحث والأرشيف' };
    }
  };

  // If SuperUser: provide a department dashboard switcher
  if (isSuperUser) {
    const departmentTabs = [
      { id: 'executive', label: 'الرؤية الإشرافية المركزية', icon: LayoutDashboard, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
      { id: 'reception', label: 'إحصائيات الاستعلامات', icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
      { id: 'admin', label: 'إحصائيات الإدارة والمعاملات', icon: FolderKanban, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
      { id: 'interviews', label: 'إحصائيات المقابلات', icon: Handshake, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
      { id: 'organization', label: 'إحصائيات التنظيم والجماهير', icon: Users2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
      { id: 'machine', label: 'إحصائيات المكنة والطباعة', icon: Printer, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
      { id: 'audit', label: 'إحصائيات الرقابة والتشريع', icon: ShieldCheck, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    ];

    return (
      <div className="space-y-4 text-right select-none font-['Tajawal',sans-serif]" dir="rtl">
        {/* Top Department Switcher for Developer & Director */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-white">
                    لوحات التحكم والإحصائيات لجميع أقسام المكتب
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    صلاحية الإشراف الشامل
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  بإمكانك استعراض لوحة الإحصائيات الخاصة بكل قسم ومتابعة سير الإنجاز والعمليات اليومية
                </p>
              </div>
            </div>

            {/* Department Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
              {departmentTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = selectedDepartmentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedDepartmentTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40' 
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Dashboard View */}
        {selectedDepartmentTab === 'executive' && <ExecutiveDirectorDashboard />}
        {selectedDepartmentTab === 'reception' && <ReceptionDashboard />}
        {selectedDepartmentTab === 'admin' && <AdminDashboard />}
        {selectedDepartmentTab === 'interviews' && <InterviewsDashboard />}
        {selectedDepartmentTab === 'organization' && <OrganizationDashboard />}
        {selectedDepartmentTab === 'machine' && <MachineDashboard />}
        {selectedDepartmentTab === 'audit' && <AuditDashboard />}
      </div>
    );
  }

  // Department User: Dedicated Custom Dashboard for their specific department!
  const targetWorkspace = getDepartmentWorkspaceSection();

  return (
    <div className="space-y-4 text-right select-none font-['Tajawal',sans-serif]" dir="rtl">
      {/* Top Department Header & Operational Toggle */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white rounded-2xl p-3.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                لوحة إحصائيات ومؤشرات {currentUser?.RoleArabic}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentUser?.FullName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              متابعة مباشرة لمؤشرات الأداء، الأرقام التحليلية، والعمليات الخاصة بقسمكم المعتمد
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection(targetWorkspace.id)}
          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
        >
          <span>{targetWorkspace.label}</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Render the department's dedicated dashboard component */}
      {getDepartmentComponent()}
    </div>
  );
};
