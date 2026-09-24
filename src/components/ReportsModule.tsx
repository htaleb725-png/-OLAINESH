import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import { BulkNameOperations } from './BulkNameOperations';
import { DepartmentWorkReportsModal } from './DepartmentWorkReportsModal';
import { 
  BarChart3, 
  Printer, 
  FileSpreadsheet,
  ClipboardCheck,
  Search,
  Users,
  Handshake,
  FolderKanban,
  UserCheck,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { citizens, requests, interviews, organizationRecords, addAuditLog, currentUser } = useApp();

  // RBAC for Bulk operations: strictly Admin / Director / Developer
  const canAccessBulkOperations = ['developer', 'director', 'admin', 'admin_officer'].includes(currentUser?.Role || '');

  const [activeModuleTab, setActiveModuleTab] = useState<'reports' | 'bulk'>('reports');
  const [reportType, setReportType] = useState<'requests' | 'citizens' | 'interviews' | 'organization'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Compute breakdown by entity
  const entityCounts: { [entity: string]: number } = {};
  requests.forEach(r => {
    entityCounts[r.Entity] = (entityCounts[r.Entity] || 0) + 1;
  });

  // Compute breakdown by district
  const districtCounts: { [dist: string]: number } = {};
  citizens.forEach(c => {
    districtCounts[c.District] = (districtCounts[c.District] || 0) + 1;
  });

  // Compute breakdown by status
  const statusCounts: { [status: string]: number } = {};
  requests.forEach(r => {
    statusCounts[r.ProcessingStatus] = (statusCounts[r.ProcessingStatus] || 0) + 1;
  });

  // Filtered lists for each report tab
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return requests.filter(r => {
      const matchesSearch = !q || (
        r.CitizenName.toLowerCase().includes(q) ||
        r.Request_ID.toLowerCase().includes(q) ||
        (r.CitizenPhone && r.CitizenPhone.includes(q)) ||
        r.Entity.toLowerCase().includes(q) ||
        r.Details.toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || r.ProcessingStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const filteredCitizens = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return citizens.filter(c => {
      const matchesSearch = !q || (
        c.FullName.toLowerCase().includes(q) ||
        c.Citizen_ID.toLowerCase().includes(q) ||
        c.Phone1.includes(q) ||
        (c.Phone2 && c.Phone2.includes(q)) ||
        c.District.toLowerCase().includes(q) ||
        c.Job.toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || c.Rating === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [citizens, searchQuery, statusFilter]);

  const filteredInterviews = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return interviews.filter(i => {
      const matchesSearch = !q || (
        i.FullName.toLowerCase().includes(q) ||
        i.Interview_ID.toLowerCase().includes(q) ||
        i.Phone1.includes(q) ||
        i.Subject.toLowerCase().includes(q) ||
        i.Address.toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || i.Status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [interviews, searchQuery, statusFilter]);

  const filteredOrganization = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return organizationRecords.filter(o => {
      const matchesSearch = !q || (
        o.FullName.toLowerCase().includes(q) ||
        o.Citizen_ID.toLowerCase().includes(q) ||
        o.Phone1.includes(q) ||
        o.District.toLowerCase().includes(q) ||
        o.InfluenceType.toLowerCase().includes(q)
      );
      const matchesStatus = statusFilter === 'all' || o.OrgRating === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [organizationRecords, searchQuery, statusFilter]);

  // Excel Export
  const exportToExcel = () => {
    let dataToExport: any[] = [];
    let fileName = '';

    if (reportType === 'requests') {
      dataToExport = filteredRequests.map(r => ({
        'رقم الطلب': r.Request_ID,
        'الرقم التعريفي': r.Citizen_ID,
        'اسم المواطن': r.CitizenName,
        'الهاتف': r.CitizenPhone,
        'الجهة المعنية': r.Entity,
        'المسار الإداري': r.ProcessingStatus,
        'الأولوية': r.Priority,
        'تفاصيل المعاملة': r.Details,
        'توجيه النائب': r.DeputyNotes || '',
        'تاريخ التسجيل': r.CreatedAt,
        'الموظف المسجل': r.CreatedBy
      }));
      fileName = 'تقرير_المعاملات_مكتب_النائب_علا_الناشي.xlsx';
    } else if (reportType === 'citizens') {
      dataToExport = filteredCitizens.map(c => ({
        'الرقم التعريفي': c.Citizen_ID,
        'الاسم الرباعي واللقب': c.FullName,
        'الهاتف 1': c.Phone1,
        'الهاتف 2': c.Phone2 || '',
        'القضاء': c.District,
        'الناحية': c.SubDistrict,
        'المهنة': c.Job,
        'التحصيل': c.Education,
        'التقييم': c.Rating,
        'المعرف': c.ReferralSource || '',
        'تاريخ التسجيل': c.CreatedAt
      }));
      fileName = 'سجل_المراجعين_المركزي.xlsx';
    } else if (reportType === 'interviews') {
      dataToExport = filteredInterviews.map(i => ({
        'رقم المقابلة': i.Interview_ID,
        'الاسم': i.FullName,
        'الموضوع': i.Subject,
        'الهاتف': i.Phone1,
        'السكن': i.Address,
        'التاريخ': i.InterviewDate,
        'الوقت': i.InterviewTime || '',
        'الأهمية': i.Priority,
        'الموقف': i.Status,
        'توجيه النائب': i.DeputyNotes || ''
      }));
      fileName = 'جدول_مقابلات_النائب.xlsx';
    } else {
      dataToExport = filteredOrganization.map(o => ({
        'الرقم التعريفي': o.Citizen_ID,
        'الاسم': o.FullName,
        'القضاء': o.District,
        'الموقف التنظيمي': o.OrgRating,
        'الثقل الاجتماعي': o.InfluenceType,
        'التقييم': o.EvaluationPoints,
        'المركز الانتخابي': o.ElectionCenter || '',
        'المحطة': o.StationNumber || ''
      }));
      fileName = 'سجل_الموقف_التنظيمي_والجماهيري.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');
    XLSX.writeFile(wb, fileName);

    addAuditLog(
      'تصدير تقرير Excel',
      'التقارير والإحصائيات',
      `تصدير ملف ${fileName} يحتوي على ${dataToExport.length} سجل`
    );
  };

  const handlePrintReport = () => {
    addAuditLog(
      'طباعة تقرير ورقي',
      'التقارير والإحصائيات',
      `طباعة تقرير ${reportType} لمكتب النائب علا الناشي`
    );
    window.print();
  };

  return (
    <div className="space-y-4 text-right font-['Tajawal',sans-serif]" dir="rtl">

      {/* Main Module Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModuleTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeModuleTab === 'reports'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 التقارير الإحصائية والجداول الرسمية</span>
          </button>

          {/* Bulk Name Operations - STRICTLY ADMIN & DEVELOPER */}
          {canAccessBulkOperations && (
            <button
              onClick={() => setActiveModuleTab('bulk')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeModuleTab === 'bulk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>⚡ المعالجة الجماعية وقوائم الأسماء (خاص بالإدارة)</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-[10px] text-white font-mono">1000 اسم</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsReportsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
        >
          <Calendar className="w-4 h-4" />
          <span>منظومة سحب التقارير التفصيلية (يومي / أسبوعي / شهري)</span>
        </button>
      </div>

      {/* When Bulk Mode Active */}
      {activeModuleTab === 'bulk' && canAccessBulkOperations && (
        <BulkNameOperations />
      )}

      {/* When Reports Mode Active */}
      {activeModuleTab === 'reports' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-600" />
                <h2 className="text-base font-bold text-slate-900">سجل التقارير والإحصائيات وتصدير البيانات</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                  تصدير فوري Excel / PDF / A4
                </span>
              </div>
              <p className="text-xs text-slate-500">
                استعراض كامل السجلات وتصفيتها، التوزيع الجغرافي للمراجعين، وجداول المقابلات والمعاملات الرسمية.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportToExcel}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير ملف Excel (.xlsx)</span>
              </button>

              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التقرير الحالي</span>
              </button>
            </div>
          </div>

          {/* Report Selection Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'requests', label: `تقرير المعاملات الإدارية (${requests.length})`, icon: FolderKanban },
                { id: 'citizens', label: `سجل المراجعين المركزي (${citizens.length})`, icon: Users },
                { id: 'interviews', label: `تقرير مقابلات النائب (${interviews.length})`, icon: Handshake },
                { id: 'organization', label: `تقرير الموقف التنظيمي (${organizationRecords.length})`, icon: UserCheck }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setReportType(tab.id as any);
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      reportType === tab.id
                        ? 'bg-white text-blue-900 shadow-xs border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 text-blue-600" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث في الجدول الحالي..."
                className="w-full pr-8 pl-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* TAB 1: REQUESTS TABLE */}
          {reportType === 'requests' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  جدول المعاملات الإدارية المسجلة ({filteredRequests.length} معاملة)
                </span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 outline-none"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="منجز">منجز</option>
                  <option value="قيد التدقيق">قيد التدقيق</option>
                  <option value="متابعة ديوان المحافظة">متابعة ديوان المحافظة</option>
                  <option value="متابعة بغداد والوزارات">متابعة بغداد والوزارات</option>
                  <option value="قيد الإجراء">قيد الإجراء</option>
                  <option value="بانتظار الموافقة">بانتظار الموافقة</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-8">ت</th>
                      <th className="p-2.5">رقم المعاملة</th>
                      <th className="p-2.5">اسم المواطن</th>
                      <th className="p-2.5">الهاتف</th>
                      <th className="p-2.5">الجهة المعنية</th>
                      <th className="p-2.5">المسار الإداري</th>
                      <th className="p-2.5">الأولوية</th>
                      <th className="p-2.5">تفاصيل وموضوع الطلب</th>
                      <th className="p-2.5">توجيه النائب</th>
                      <th className="p-2.5 text-center">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.map((req, idx) => (
                      <tr key={req.Request_ID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-blue-700 whitespace-nowrap">{req.Request_ID}</td>
                        <td className="p-2 font-bold text-slate-900">{req.CitizenName}</td>
                        <td className="p-2 font-mono text-slate-600" dir="ltr">{req.CitizenPhone || '-'}</td>
                        <td className="p-2 text-slate-700">{req.Entity}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {req.ProcessingStatus}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.Priority === 'خاص جداً' ? 'bg-purple-100 text-purple-800' :
                            req.Priority === 'عاجل' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.Priority}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 max-w-xs truncate">{req.Details}</td>
                        <td className="p-2 text-slate-600 max-w-xs truncate">{req.DeputyNotes || '-'}</td>
                        <td className="p-2 text-center font-mono text-slate-500 whitespace-nowrap">{req.CreatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CITIZENS RECORD TABLE (سجل المراجعين المركزي) */}
          {reportType === 'citizens' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  سجل المراجعين المركزي ومواطني محافظة ذي قار ({filteredCitizens.length} مراجع)
                </span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 outline-none"
                >
                  <option value="all">كافة التقييمات</option>
                  <option value="مؤيد قوي">مؤيد قوي</option>
                  <option value="لائق">لائق</option>
                  <option value="حالة إنسانية">حالة إنسانية</option>
                  <option value="عائلة شهيد">عائلة شهيد</option>
                  <option value="جريح وطن">جريح وطن</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-8">ت</th>
                      <th className="p-2.5">الرقم التعريفي</th>
                      <th className="p-2.5">الاسم الكامل واللقب</th>
                      <th className="p-2.5">رقم الهاتف 1</th>
                      <th className="p-2.5">رقم الهاتف 2</th>
                      <th className="p-2.5">القضاء</th>
                      <th className="p-2.5">الناحية</th>
                      <th className="p-2.5">المهنة</th>
                      <th className="p-2.5">التحصيل</th>
                      <th className="p-2.5">التقييم</th>
                      <th className="p-2.5">جهة التزكية / المعرف</th>
                      <th className="p-2.5 text-center">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCitizens.map((c, idx) => (
                      <tr key={c.Citizen_ID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-emerald-700 whitespace-nowrap">{c.Citizen_ID}</td>
                        <td className="p-2 font-bold text-slate-900">{c.FullName}</td>
                        <td className="p-2 font-mono text-slate-700" dir="ltr">{c.Phone1}</td>
                        <td className="p-2 font-mono text-slate-500" dir="ltr">{c.Phone2 || '-'}</td>
                        <td className="p-2 text-slate-800">{c.District}</td>
                        <td className="p-2 text-slate-600">{c.SubDistrict}</td>
                        <td className="p-2 text-slate-600">{c.Job}</td>
                        <td className="p-2 text-slate-600">{c.Education}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {c.Rating || 'لائق'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-700 font-semibold">{c.ReferralSource || 'مباشر بدون معرف'}</td>
                        <td className="p-2 text-center font-mono text-slate-500 whitespace-nowrap">{c.CreatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEWS REPORT TABLE (تقرير المقابلات) */}
          {reportType === 'interviews' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  تقرير جدول مقابلات النائب المهندسة علا الناشي ({filteredInterviews.length} مقابلة)
                </span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 outline-none"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="مجدولة">مجدولة</option>
                  <option value="تمت المقابلة">تمت المقابلة</option>
                  <option value="تمت الإحالة">تمت الإحالة</option>
                  <option value="معتذرة">معتذرة</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-8">ت</th>
                      <th className="p-2.5">رمز المقابلة</th>
                      <th className="p-2.5">اسم المواطن</th>
                      <th className="p-2.5">موضوع المقابلة</th>
                      <th className="p-2.5">رقم الهاتف</th>
                      <th className="p-2.5">السكن / العنوان</th>
                      <th className="p-2.5 text-center">التاريخ والوقت</th>
                      <th className="p-2.5">الأهمية</th>
                      <th className="p-2.5">الموقف</th>
                      <th className="p-2.5">توجيه النائب</th>
                      <th className="p-2.5">النتيجة والإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInterviews.map((intv, idx) => (
                      <tr key={intv.Interview_ID} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-amber-700 whitespace-nowrap">{intv.Interview_ID}</td>
                        <td className="p-2 font-bold text-slate-900">{intv.FullName}</td>
                        <td className="p-2 font-semibold text-slate-800">{intv.Subject}</td>
                        <td className="p-2 font-mono text-slate-700" dir="ltr">{intv.Phone1}</td>
                        <td className="p-2 text-slate-600">{intv.Address}</td>
                        <td className="p-2 text-center font-mono text-slate-600 whitespace-nowrap">
                          {intv.InterviewDate} ({intv.InterviewTime || '10:30 ص'})
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            intv.Priority === 'خاص جداً' ? 'bg-purple-100 text-purple-800' :
                            intv.Priority === 'عاجل' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {intv.Priority}
                          </span>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {intv.Status}
                          </span>
                        </td>
                        <td className="p-2 text-blue-900 font-semibold">{intv.DeputyNotes || 'إحالة للإدارة'}</td>
                        <td className="p-2 text-slate-600">{intv.Outcome || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORGANIZATION REPORT TABLE (الموقف التنظيمي) */}
          {reportType === 'organization' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">
                  تقرير الموقف التنظيمي والانتخابي والجماهيري ({filteredOrganization.length} قيد)
                </span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 outline-none"
                >
                  <option value="all">كافة التقييمات</option>
                  <option value="مؤيد">مؤيد</option>
                  <option value="مؤيد قوي">مؤيد قوي</option>
                  <option value="محايد">محايد</option>
                </select>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-right text-xs border-collapse">
                  <thead className="bg-slate-900 text-white sticky top-0 text-[11px]">
                    <tr>
                      <th className="p-2.5 text-center w-8">ت</th>
                      <th className="p-2.5">الرقم التعريفي</th>
                      <th className="p-2.5">اسم المواطن</th>
                      <th className="p-2.5">القضاء</th>
                      <th className="p-2.5">الناحية</th>
                      <th className="p-2.5">الهاتف</th>
                      <th className="p-2.5">الموقف التنظيمي</th>
                      <th className="p-2.5">الثقل الاجتماعي</th>
                      <th className="p-2.5 text-center">النقاط</th>
                      <th className="p-2.5">المركز الانتخابي</th>
                      <th className="p-2.5">المحطة</th>
                      <th className="p-2.5">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrganization.map((org, idx) => (
                      <tr key={org.Org_ID || `${org.Citizen_ID}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-purple-700 whitespace-nowrap">{org.Citizen_ID}</td>
                        <td className="p-2 font-bold text-slate-900">{org.FullName}</td>
                        <td className="p-2 text-slate-800">{org.District}</td>
                        <td className="p-2 text-slate-600">{org.SubDistrict || '-'}</td>
                        <td className="p-2 font-mono text-slate-700" dir="ltr">{org.Phone1}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            {org.OrgRating}
                          </span>
                        </td>
                        <td className="p-2 text-slate-800 font-semibold">{org.InfluenceType}</td>
                        <td className="p-2 text-center font-mono font-bold text-blue-600">{org.EvaluationPoints}</td>
                        <td className="p-2 text-slate-600">{org.ElectionCenter || '-'}</td>
                        <td className="p-2 text-slate-600">{org.StationNumber || '-'}</td>
                        <td className="p-2 text-slate-600 max-w-xs truncate">{org.Notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visual Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Entity Distribution */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h4 className="font-bold text-xs text-slate-800 border-r-2 border-blue-600 pr-2">
                توزيع المعاملات حسب الوزارات والجهات
              </h4>
              <div className="space-y-2">
                {Object.entries(entityCounts).slice(0, 5).map(([entity, count]) => {
                  const pct = Math.round((count / requests.length) * 100) || 0;
                  return (
                    <div key={entity} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className="truncate max-w-[180px]">{entity}</span>
                        <span className="font-mono font-bold text-blue-600">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* District Distribution */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h4 className="font-bold text-xs text-slate-800 border-r-2 border-amber-500 pr-2">
                التوزيع الجغرافي للمراجعين بأقضية ذي قار
              </h4>
              <div className="space-y-2">
                {Object.entries(districtCounts).slice(0, 5).map(([district, count]) => {
                  const pct = Math.round((count / citizens.length) * 100) || 0;
                  return (
                    <div key={district} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>{district}</span>
                        <span className="font-mono font-bold text-amber-600">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Processing Status Breakdown */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h4 className="font-bold text-xs text-slate-800 border-r-2 border-emerald-500 pr-2">
                مؤشرات الإنجاز والمسار الإداري
              </h4>
              <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = Math.round((count / requests.length) * 100) || 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>{status}</span>
                        <span className="font-mono font-bold text-emerald-600">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reports and Work Export Modal */}
      <DepartmentWorkReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        defaultDepartment="reception"
      />

    </div>
  );
};
