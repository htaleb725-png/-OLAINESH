import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OfficeRequest, ProcessingStatus, RequestStatus, Priority, WorkflowStage, Citizen } from '../types';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  Paperclip, 
  Clock, 
  Printer, 
  UserPlus, 
  Phone, 
  MapPin, 
  SendHorizontal, 
  Eye, 
  CheckCircle, 
  Scan, 
  Users2, 
  ArrowLeft, 
  Sliders, 
  FileText, 
  AlertCircle,
  Trash2,
  AlertTriangle,
  Sparkles,
  FileImage
} from 'lucide-react';
import { DirectScannerPrinter } from './DirectScannerPrinter';
import { AiRequestDrafterModal } from './AiRequestDrafterModal';
import { SmartImageArchiveModule } from './SmartImageArchiveModule';
import { ReferrersStats } from './ReferrersStats';

export const AdminModule: React.FC = () => {
  const { 
    requests, 
    addRequest, 
    updateRequest, 
    deleteRequest,
    citizens, 
    updateCitizen,
    getDropdownOptions, 
    addDocument,
    currentUser,
    setSelectedCitizenForHistory,
    setPrintableBadgeCitizen,
    setActiveSection,
    forwardCitizenWorkflow,
    forwardRequestWorkflow
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests_list' | 'reception_citizens' | 'direct_scanner' | 'smart_images' | 'referrers'>('requests_list');

  const [searchQuery, setSearchQuery] = useState('');
  const [receptionSearch, setReceptionSearch] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'personal' | 'men' | 'women' | 'independent' | 'dependent'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiDrafterModal, setShowAiDrafterModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<OfficeRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<OfficeRequest | null>(null);
  const [scannerCitizenId, setScannerCitizenId] = useState<string>('');

  // Attendance and Dependency form state
  const [attendanceType, setAttendanceType] = useState<'شخصياً' | 'عبر معتمد' | 'وكيل'>('شخصياً');
  const [dependencyStatus, setDependencyStatus] = useState<'مستقل' | 'غير مستقل'>('مستقل');

  // Referral Modal state
  const [referralTargetCitizen, setReferralTargetCitizen] = useState<Citizen | null>(null);
  const [referralTargetRequest, setReferralTargetRequest] = useState<OfficeRequest | null>(null);
  const [referralStage, setReferralStage] = useState<WorkflowStage>('مدير التنظيم');
  const [referralDirective, setReferralDirective] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Form states
  const [selectedCitizenId, setSelectedCitizenId] = useState('');
  const [entity, setEntity] = useState('وزارة العمل والشؤون الاجتماعية (شبكة الحماية)');
  const [customEntity, setCustomEntity] = useState('');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('مستلم');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('قيد التدقيق');
  const [priority, setPriority] = useState<Priority>('عام');
  const [details, setDetails] = useState('');
  const [attachmentReq, setAttachmentReq] = useState('');
  const [attachmentResp, setAttachmentResp] = useState('');
  const [deputyNotes, setDeputyNotes] = useState('');
  const [editableCitizenName, setEditableCitizenName] = useState('');
  const [editableCitizenPhone, setEditableCitizenPhone] = useState('');

  const entitiesList = getDropdownOptions('Entity');

  const citizenMap = React.useMemo(() => {
    const map = new Map<string, Citizen>();
    (citizens || []).forEach(c => {
      if (c?.Citizen_ID) map.set(c.Citizen_ID, c);
    });
    return map;
  }, [citizens]);

  const filterCounts = React.useMemo(() => {
    let personal = 0;
    let men = 0;
    let women = 0;
    let independent = 0;
    let dependent = 0;

    (requests || []).forEach(req => {
      const cit = citizenMap.get(req.Citizen_ID);
      const gender = cit?.Gender || 'ذكر';
      const att = req.AttendanceType || cit?.AttendanceType || 'شخصياً';
      const dep = req.DependencyStatus || cit?.DependencyStatus || 'مستقل';

      if (att === 'شخصياً') personal++;
      if (gender === 'ذكر') men++;
      if (gender === 'أنثى') women++;
      if (dep === 'مستقل') independent++;
      if (dep === 'غير مستقل') dependent++;
    });

    return {
      all: requests.length,
      personal,
      men,
      women,
      independent,
      dependent
    };
  }, [requests, citizenMap]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.Request_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.CitizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.Details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.Entity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = selectedEntityFilter === 'all' || req.Entity === selectedEntityFilter;
    const matchesStatus = selectedStatusFilter === 'all' || req.ProcessingStatus === selectedStatusFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || req.Priority === selectedPriorityFilter;

    // Filter Category Check (شخصياً / رجال فقط / امرأة فقط / مستقلين / غير مستقلين / الكل)
    const cit = citizenMap.get(req.Citizen_ID);
    const gender = cit?.Gender || 'ذكر';
    const att = req.AttendanceType || cit?.AttendanceType || 'شخصياً';
    const dep = req.DependencyStatus || cit?.DependencyStatus || 'مستقل';

    let matchesCategory = true;
    if (filterCategory === 'personal') matchesCategory = att === 'شخصياً';
    else if (filterCategory === 'men') matchesCategory = gender === 'ذكر';
    else if (filterCategory === 'women') matchesCategory = gender === 'أنثى';
    else if (filterCategory === 'independent') matchesCategory = dep === 'مستقل';
    else if (filterCategory === 'dependent') matchesCategory = dep === 'غير مستقل';

    return matchesSearch && matchesEntity && matchesStatus && matchesPriority && matchesCategory;
  });

  const filteredReceptionCitizens = citizens.filter(c => {
    if (!receptionSearch.trim()) return true;
    const q = receptionSearch.toLowerCase().trim();
    return (
      (c.FullName && c.FullName.toLowerCase().includes(q)) ||
      (c.Citizen_ID && c.Citizen_ID.toLowerCase().includes(q)) ||
      (c.Phone1 && c.Phone1.includes(q)) ||
      (c.District && c.District.toLowerCase().includes(q)) ||
      (c.Surname && c.Surname.toLowerCase().includes(q))
    );
  });

  const openScannerForCitizen = (citId: string) => {
    setScannerCitizenId(citId);
    setActiveTab('direct_scanner');
  };

  const openReferralForCitizen = (cit: Citizen) => {
    setReferralTargetCitizen(cit);
    setReferralTargetRequest(null);
    setReferralStage('مدير التنظيم');
    setReferralDirective(`تم استلام وتدقيق ملف المراجع (${cit.FullName}) في الإدارة وإحالته لقسم التنظيم للمتابعة الميدانية والانتخابية.`);
    setShowReferralModal(true);
  };

  const handleConfirmReferral = () => {
    if (referralTargetCitizen) {
      forwardCitizenWorkflow(
        referralTargetCitizen.Citizen_ID,
        referralStage,
        referralDirective.trim()
      );
    } else if (referralTargetRequest) {
      forwardRequestWorkflow(
        referralTargetRequest.Request_ID,
        referralStage,
        referralDirective.trim()
      );
    }
    setShowReferralModal(false);
    setReferralTargetCitizen(null);
    setReferralTargetRequest(null);
    setReferralDirective('');
  };

  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const finalEntity = entity === 'أخرى' && customEntity ? customEntity.trim() : entity;

    if (editingRequest) {
      const finalName = editableCitizenName.trim() || editingRequest.CitizenName;
      const finalPhone = editableCitizenPhone.trim() || editingRequest.CitizenPhone;

      updateRequest({
        ...editingRequest,
        CitizenName: finalName,
        CitizenPhone: finalPhone,
        Entity: finalEntity,
        RequestStatus: requestStatus,
        ProcessingStatus: processingStatus,
        Priority: priority,
        Details: details,
        AttachmentRequest: attachmentReq || editingRequest.AttachmentRequest,
        AttachmentResponse: attachmentResp || editingRequest.AttachmentResponse,
        DeputyNotes: deputyNotes,
        AttendanceType: attendanceType,
        DependencyStatus: dependencyStatus
      });

      // Also sync citizen master record if name or phone changed
      const targetCit = citizens.find(c => c.Citizen_ID === editingRequest.Citizen_ID);
      if (targetCit) {
        updateCitizen({
          ...targetCit,
          FullName: finalName,
          Phone1: finalPhone
        });
      }

      setEditingRequest(null);
    } else {
      const citizen = citizens.find(c => c.Citizen_ID === selectedCitizenId);
      if (!citizen) {
        alert('يرجى اختيار مراجع مسجل بالنظام أولاً.');
        return;
      }

      addRequest({
        Citizen_ID: citizen.Citizen_ID,
        CitizenName: citizen.FullName,
        CitizenPhone: citizen.Phone1,
        Entity: finalEntity,
        RequestStatus: requestStatus,
        ProcessingStatus: processingStatus,
        Priority: priority,
        Details: details,
        AttachmentRequest: attachmentReq || undefined,
        AttachmentResponse: attachmentResp || undefined,
        DeputyNotes: deputyNotes || undefined,
        AttendanceType: attendanceType,
        DependencyStatus: dependencyStatus,
        CreatedBy: currentUser ? currentUser.FullName : 'قسم الإدارة'
      });

      // If document attached, archive automatically
      if (attachmentReq) {
        addDocument({
          Citizen_ID: citizen.Citizen_ID,
          CitizenName: citizen.FullName,
          Title: `مرفق طلب: ${details.slice(0, 30)}`,
          Category: 'طلب مقدم',
          FileUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80',
          FileType: 'pdf',
          FileSize: '1.5 MB',
          UploadedBy: currentUser?.FullName || 'موظف الإدارة'
        });
      }

      setShowAddModal(false);
    }

    // Reset
    setDetails('');
    setCustomEntity('');
    setAttachmentReq('');
    setAttachmentResp('');
    setDeputyNotes('');
    setAttendanceType('شخصياً');
    setDependencyStatus('مستقل');
  };

  const openEditModal = (req: OfficeRequest) => {
    setEditingRequest(req);
    setSelectedCitizenId(req.Citizen_ID);
    setEditableCitizenName(req.CitizenName || '');
    setEditableCitizenPhone(req.CitizenPhone || '');
    setEntity(req.Entity);
    setRequestStatus(req.RequestStatus);
    setProcessingStatus(req.ProcessingStatus);
    setPriority(req.Priority);
    setDetails(req.Details);
    setAttachmentReq(req.AttachmentRequest || '');
    setAttachmentResp(req.AttachmentResponse || '');
    setDeputyNotes(req.DeputyNotes || '');
    const cit = citizenMap.get(req.Citizen_ID);
    setAttendanceType(req.AttendanceType || cit?.AttendanceType || 'شخصياً');
    setDependencyStatus(req.DependencyStatus || cit?.DependencyStatus || 'مستقل');
  };

  const openCreateForCitizen = (citId: string) => {
    setEditingRequest(null);
    setSelectedCitizenId(citId);
    setDetails('');
    const cit = citizenMap.get(citId);
    setAttendanceType(cit?.AttendanceType || 'شخصياً');
    setDependencyStatus(cit?.DependencyStatus || 'مستقل');
    setShowAddModal(true);
  };

  return (
    <div className="space-y-4 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">قسم الإدارة ومتابعة المعاملات الحكومية</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {requests.length} معاملة مسجلة
            </span>
          </div>
          <p className="text-xs text-slate-500">
            سلسلة الإحالات المتكاملة: الاستعلامات ← مدير المكتب ← مدير الإدارة ← مدير التنظيم مع ماسح ضوئي وطباعة مباشرة.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setScannerCitizenId(citizens[0]?.Citizen_ID || '');
              setActiveTab('direct_scanner');
            }}
            className="px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Scan className="w-4 h-4 text-blue-300" />
            <span>سكنر مباشر إلى الطابعة</span>
          </button>

          <button
            onClick={() => setActiveTab('smart_images')}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="أرشفة واستخراج صور المعاملات (1000 - 2000 صورة) بالاسم التلقائي واليدوي"
          >
            <FileImage className="w-4 h-4 text-emerald-200" />
            <span>إرفاق صور المعاملات (1000 - 2000 صورة)</span>
          </button>

          <button
            onClick={() => setActiveSection('drive_requests')}
            className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="البحث والطباعة المباشرة من أرشيف Google Drive"
          >
            <Printer className="w-4 h-4" />
            <span>البحث والطباعة (Drive)</span>
          </button>

          <button
            onClick={() => setShowAiDrafterModal(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="توليد وصياغة طلب رسمي بالذكاء الاصطناعي"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>توليد طلب بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => {
              setEditingRequest(null);
              setDetails('');
              setSelectedCitizenId(citizens[0]?.Citizen_ID || '');
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء طلب إداري جديد</span>
          </button>
        </div>
      </div>

      {/* Workflow Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('requests_list')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests_list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>جدول المعاملات والطلبات الحكومية ({filteredRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reception_citizens')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reception_citizens'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>وارد مراجعي الاستعلامات والإحالات ({citizens.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('direct_scanner')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'direct_scanner'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Scan className="w-4 h-4 text-amber-500" />
          <span>خانة سكنر مباشر إلى الطابعة (Scanner to Printer) 🖨️</span>
        </button>

        <button
          onClick={() => setActiveTab('smart_images')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'smart_images'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
          }`}
        >
          <FileImage className="w-4 h-4 text-emerald-500" />
          <span>أرشيف واستخراج الصور الذكية (1000 - 2000 صورة)</span>
        </button>

        <button
          onClick={() => setActiveTab('referrers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'referrers'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-purple-900 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <Users2 className="w-4 h-4 text-purple-600" />
          <span>قسم المعرفين وتزكيات المراجعين</span>
        </button>
      </div>

      {/* Tab 1: Requests List */}
      {activeTab === 'requests_list' && (
        <>
          {/* Filter Bar */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الطلب، اسم المواطن..."
                  className="w-full pr-8 pl-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <select
                  value={selectedEntityFilter}
                  onChange={(e) => setSelectedEntityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">-- تصفية حسب الجهة المعنية (الكل) --</option>
                  {entitiesList.map((ent, idx) => (
                    <option key={idx} value={ent}>{ent}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">-- تصفية حسب المسار الإداري (الكل) --</option>
                  <option value="قيد التدقيق">قيد التدقيق</option>
                  <option value="مرسل إلى الوزارة/الهيئة">مرسل إلى الوزارة/الهيئة</option>
                  <option value="منجز">منجز</option>
                  <option value="تم الطباعة">تم الطباعة</option>
                  <option value="بانتظار الموافقة">بانتظار الموافقة</option>
                  <option value="مرفوض">مرفوض</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">-- تصفية حسب الأولوية (الكل) --</option>
                  <option value="عاجل">عاجل</option>
                  <option value="خاص جداً">خاص جداً</option>
                  <option value="عام">عام</option>
                </select>
              </div>
            </div>

            {/* Quick Category Filter Tabs */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">تصنيف المراجعين:</span>
              
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>الكل</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{filterCounts.all}</span>
              </button>

              <button
                onClick={() => setFilterCategory('personal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'personal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                <span>حضور شخصي</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200/50">{filterCounts.personal}</span>
              </button>

              <button
                onClick={() => setFilterCategory('men')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'men'
                    ? 'bg-cyan-700 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200/60'
                }`}
              >
                <span>رجال فقط</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-200/50">{filterCounts.men}</span>
              </button>

              <button
                onClick={() => setFilterCategory('women')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'women'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
                }`}
              >
                <span>نساء فقط</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/50">{filterCounts.women}</span>
              </button>

              <button
                onClick={() => setFilterCategory('independent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'independent'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                <span>مستقلين</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/50">{filterCounts.independent}</span>
              </button>

              <button
                onClick={() => setFilterCategory('dependent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterCategory === 'dependent'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                }`}
              >
                <span>غير مستقلين</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/50">{filterCounts.dependent}</span>
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800">
                جدول المعاملات الإدارية ({filteredRequests.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                انقر على "سكنر" لمسح مستندات المعاملة فوراً، أو "إحالة" لنقلها لمدير التنظيم
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
                  <tr>
                    <th className="p-3">رقم الطلب</th>
                    <th className="p-3">اسم المواطن</th>
                    <th className="p-3">الجهة المعنية</th>
                    <th className="p-3">شرح وتفاصيل الطلب</th>
                    <th className="p-3">المسار الإداري</th>
                    <th className="p-3">المسار والمرحلة</th>
                    <th className="p-3">الأولوية</th>
                    <th className="p-3">المرفقات</th>
                    <th className="p-3 text-center">الإجراءات والمسح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        لا توجد طلبات إدارية مطابقة لخيارات البحث والتصفية.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req, idx) => (
                      <tr key={`${req.Request_ID}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-700 text-[11px]">{req.Request_ID}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{req.CitizenName}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span>{req.Citizen_ID}</span>
                            {(() => {
                              const cit = citizenMap.get(req.Citizen_ID);
                              const gender = cit?.Gender || 'ذكر';
                              const att = req.AttendanceType || cit?.AttendanceType || 'شخصياً';
                              const dep = req.DependencyStatus || cit?.DependencyStatus || 'مستقل';
                              return (
                                <>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${gender === 'ذكر' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {gender}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${att === 'شخصياً' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                    {att}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${dep === 'مستقل' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                    {dep}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{req.Entity}</td>
                        <td className="p-3 max-w-xs">
                          <p className="line-clamp-2 text-slate-600">{req.Details}</p>
                          {req.DeputyNotes && (
                            <div className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-1 border border-amber-200 inline-block">
                              توجيه: {req.DeputyNotes}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            req.ProcessingStatus === 'منجز'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : req.ProcessingStatus === 'مرسل إلى الوزارة/الهيئة'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : req.ProcessingStatus === 'مرفوض'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.ProcessingStatus}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {req.CurrentStage || 'مدير الإدارة'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            req.Priority === 'عاجل' || req.Priority === 'خاص جداً'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {req.Priority}
                          </span>
                        </td>
                        <td className="p-3">
                          {req.AttachmentRequest || req.AttachmentResponse ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                              <Paperclip className="w-3 h-3" />
                              <span>مرفق</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">لا يوجد</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openScannerForCitizen(req.Citizen_ID)}
                              className="px-2 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="سكنر مباشر للمستندات وطباعة فورية"
                            >
                              <Scan className="w-3 h-3 text-blue-300" />
                              <span>سكنر</span>
                            </button>

                            <button
                              onClick={() => {
                                const cit = citizens.find(c => c.Citizen_ID === req.Citizen_ID);
                                if (cit) openReferralForCitizen(cit);
                              }}
                              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="إحالة إلى مدير التنظيم"
                            >
                              <SendHorizontal className="w-3 h-3" />
                              <span>إحالة</span>
                            </button>

                            <button
                              onClick={() => openEditModal(req)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer"
                            >
                              تعديل
                            </button>

                            <button
                              onClick={() => setRequestToDelete(req)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold cursor-pointer"
                              title="حذف هذا الطلب رسمياً"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Reception Citizens Feed & Workflow Pipeline */}
      {activeTab === 'reception_citizens' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={receptionSearch}
                onChange={(e) => setReceptionSearch(e.target.value)}
                placeholder="بحث في مراجعي الاستعلامات (الاسم، رقم ID، الهاتف، القضاء)..."
                className="w-full h-9 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-right"
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold px-2">
              إجمالي مراجعي الاستعلامات: {filteredReceptionCitizens.length} مراجع
            </span>
          </div>

          <div className="space-y-3">
            {filteredReceptionCitizens.length === 0 ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-xs">
                لا توجد سجلات مطابقة للبحث في وارد الاستعلامات.
              </div>
            ) : (
              filteredReceptionCitizens.map((cit) => {
                const citRequests = requests.filter(r => r.Citizen_ID === cit.Citizen_ID);

                return (
                  <div
                    key={cit.Citizen_ID}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs space-y-3 transition-all text-right"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {cit.Citizen_ID}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{cit.FullName}</h4>
                        {cit.Surname && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            عشيرة: {cit.Surname}
                          </span>
                        )}
                        
                        {/* Current Workflow Stage Badge */}
                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 text-[10px] font-bold">
                          <span>المرحلة الحالية:</span>
                          <span className="text-indigo-950 font-black">{cit.CurrentStage || 'الاستعلامات'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cit.CreatedAt}</span>
                        </span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-600">
                          مسجل بواسطة: {cit.CreatedBy || 'الاستعلامات'}
                        </span>
                      </div>
                    </div>

                    {/* Workflow Pipeline Breadcrumbs */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] flex-wrap gap-2">
                      <span className="text-slate-500 font-bold text-[10px]">مسار المعاملة:</span>
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          (cit.CurrentStage === 'الاستعلامات' || !cit.CurrentStage)
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          1. الاستعلامات ✓
                        </span>
                        <span className="text-slate-400">←</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          cit.CurrentStage === 'مدير المكتب'
                            ? 'bg-blue-600 text-white'
                            : (cit.CurrentStage === 'مدير الإدارة' || cit.CurrentStage === 'مدير التنظيم')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          2. مدير المكتب
                        </span>
                        <span className="text-slate-400">←</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          cit.CurrentStage === 'مدير الإدارة'
                            ? 'bg-blue-600 text-white'
                            : cit.CurrentStage === 'مدير التنظيم'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          3. مدير الإدارة
                        </span>
                        <span className="text-slate-400">←</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          cit.CurrentStage === 'مدير التنظيم'
                            ? 'bg-indigo-700 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          4. مدير التنظيم 👥
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] mb-0.5">رقم الهاتف</span>
                        <span className="font-mono font-bold text-slate-900 flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-emerald-600 inline" />
                          {cit.Phone1}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] mb-0.5">السكن والموقع</span>
                        <span className="font-semibold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600 inline" />
                          {cit.District} {cit.SubDistrict ? `(${cit.SubDistrict})` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] mb-0.5">المهنة والتحصيل</span>
                        <span className="font-semibold text-slate-900">{cit.Job || 'كاسب'} - {cit.Education || 'إعدادية'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] mb-0.5">المعرّف / التزكية</span>
                        <span className="font-semibold text-slate-900">{cit.ReferralSource || 'مباشر بدون معرف'}</span>
                      </div>
                    </div>

                    {/* Associated Requests */}
                    {citRequests.length > 0 && (
                      <div className="space-y-1.5 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-[11px] font-bold text-blue-900 block">المعاملات المربوطة ({citRequests.length}):</span>
                        {citRequests.map((r, idx) => (
                          <div key={`${r.Request_ID}-${idx}`} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-blue-200">
                            <div>
                              <span className="font-mono font-bold text-blue-700 ml-2">{r.Request_ID}</span>
                              <span className="font-bold text-slate-900">[{r.Entity}]</span>
                              <span className="text-slate-600 mr-2">- {r.Details}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {r.ProcessingStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Admin Actions for Citizen */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => openScannerForCitizen(cit.Citizen_ID)}
                        className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Scan className="w-3.5 h-3.5 text-blue-300" />
                        <span>سكنر وطباعة مباشرة</span>
                      </button>

                      <button
                        onClick={() => openReferralForCitizen(cit)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <SendHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>إحالة لمدير التنظيم 👥</span>
                      </button>

                      <button
                        onClick={() => setPrintableBadgeCitizen(cit)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="طباعة باج"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة الباج</span>
                      </button>

                      <button
                        onClick={() => setSelectedCitizenForHistory(cit)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>الأرشيف والسجل</span>
                      </button>

                      <button
                        onClick={() => openCreateForCitizen(cit.Citizen_ID)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ كتاب رسمي / معاملة</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Direct Scanner & Printer (سكنر مباشر الى الطابعة) */}
      {activeTab === 'direct_scanner' && (
        <DirectScannerPrinter initialCitizenId={scannerCitizenId} />
      )}

      {/* Tab 4: Smart Images Archive (أرشفة واستخراج صور المعاملات 1000 - 2000 صورة) */}
      {activeTab === 'smart_images' && (
        <SmartImageArchiveModule onOpenCitizenHistory={(cid) => {
          const cit = citizens.find(c => c.Citizen_ID === cid);
          if (cit) setSelectedCitizenForHistory(cit);
        }} />
      )}

      {/* Tab 5: Referrers Section in Admin (قسم المعرفين وتزكيات المراجعين) */}
      {activeTab === 'referrers' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-l from-purple-900 via-slate-900 to-purple-950 text-white rounded-2xl p-4 border border-purple-800/40 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users2 className="w-4 h-4 text-purple-400" />
                <span>قسم المعرفين والتزكيات - قسم الإدارة</span>
              </h3>
              <p className="text-xs text-purple-200">
                إدارة ومتابعة المعرفين والمزكين للمراجعين، وتحليل إحصائيات المعرفين الأكثر نشاطاً في مكتب النائب.
              </p>
            </div>
          </div>
          <ReferrersStats />
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SendHorizontal className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">إحالة مسار المعاملة والمراجع</h3>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-right">
              {referralTargetCitizen && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">المراجع:</span>
                    <strong className="text-slate-900 font-bold">{referralTargetCitizen.FullName}</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500">الرقم التعريفي والسكن:</span>
                    <span className="font-mono text-blue-700 font-bold">{referralTargetCitizen.Citizen_ID} - {referralTargetCitizen.District}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المرحلة / القسم المحال إليه:</label>
                <select
                  value={referralStage}
                  onChange={(e) => setReferralStage(e.target.value as WorkflowStage)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-indigo-900 focus:bg-white outline-none"
                >
                  <option value="مدير التنظيم">مدير التنظيم (قسم العلاقات والتنظيم والموقف الجماهيري)</option>
                  <option value="مدير المكتب">مدير المكتب التنفيذي</option>
                  <option value="مدير الإدارة">مدير الإدارة والمعاملات</option>
                  <option value="الاستعلامات">الاستعلامات والاستقبال</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الهامش / توجيه الإحالة:</label>
                <textarea
                  value={referralDirective}
                  onChange={(e) => setReferralDirective(e.target.value)}
                  rows={3}
                  placeholder="اكتب التوجيه أو الهامش المرفق مع الإحالة..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmReferral}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SendHorizontal className="w-4 h-4" />
                <span>تأكيد الإحالة الفورية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Request Modal */}
      {(showAddModal || editingRequest) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white text-slate-800 rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRequest ? `تعديل ومتابعة الطلب (${editingRequest.Request_ID})` : 'إنشاء وتوثيق طلب إداري جديد'}
                  </h3>
                  <p className="text-xs text-slate-500">تحديث الجهة المعنية، المسار، الأولوية، والمرفقات</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRequest(null);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-3.5 text-right">
              {/* Select Citizen (if creating new) */}
              {!editingRequest ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اختر المراجع *</label>
                  <select
                    value={selectedCitizenId}
                    onChange={(e) => setSelectedCitizenId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">-- اختر مراجع من المسجلين بالاستعلامات --</option>
                    {citizens.map((c) => (
                      <option key={c.Citizen_ID} value={c.Citizen_ID}>
                        {c.FullName} ({c.Citizen_ID}) - {c.District}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">تعديل بيانات صاحب الطلب:</span>
                    <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {editingRequest.Citizen_ID}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">الاسم الرباعي واللقب</label>
                      <input
                        type="text"
                        value={editableCitizenName}
                        onChange={(e) => setEditableCitizenName(e.target.value)}
                        placeholder="اسم المواطن..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={editableCitizenPhone}
                        onChange={(e) => setEditableCitizenPhone(e.target.value)}
                        placeholder="07800000000"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Entity (Auto add) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الجهة المعنية *</label>
                <select
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {entitiesList.map((ent, idx) => (
                    <option key={idx} value={ent}>{ent}</option>
                  ))}
                  <option value="أخرى">+ أخرى (إضافة وزارة أو جهة جديدة)</option>
                </select>
                {entity === 'أخرى' && (
                  <input
                    type="text"
                    value={customEntity}
                    onChange={(e) => setCustomEntity(e.target.value)}
                    placeholder="اكتب اسم الجهة أو المديرية..."
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-400 text-slate-900 text-xs text-right"
                    required
                  />
                )}
              </div>

              {/* Statuses & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الاستلام</label>
                  <select
                    value={requestStatus}
                    onChange={(e) => setRequestStatus(e.target.value as RequestStatus)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="مستلم">مستلم</option>
                    <option value="غير مستلم">غير مستلم</option>
                    <option value="معاد">معاد</option>
                    <option value="غير مستوفي للشروط">غير مستوفي للشروط</option>
                    <option value="خاص">خاص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسار الإداري</label>
                  <select
                    value={processingStatus}
                    onChange={(e) => setProcessingStatus(e.target.value as ProcessingStatus)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
                  >
                    <option value="قيد التدقيق">قيد التدقيق</option>
                    <option value="مرسل إلى الوزارة/الهيئة">مرسل إلى الوزارة/الهيئة</option>
                    <option value="منجز">منجز</option>
                    <option value="تم الطباعة">تم الطباعة</option>
                    <option value="بانتظار الموافقة">بانتظار الموافقة</option>
                    <option value="مرفوض">مرفوض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">درجة الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-red-700"
                  >
                    <option value="عام">عام</option>
                    <option value="عاجل">عاجل (إشعار فوري)</option>
                    <option value="خاص جداً">خاص جداً (إشعار فوري)</option>
                  </select>
                </div>
              </div>

              {/* Attendance & Dependency classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الحضور والتسجيل</label>
                  <select
                    value={attendanceType}
                    onChange={(e) => setAttendanceType(e.target.value as 'شخصياً' | 'عبر معتمد' | 'وكيل')}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs text-right focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="شخصياً">شخصياً (المواطن حضر بنفسه)</option>
                    <option value="عبر معتمد">عبر معتمد (عن طريق معتمد/منسق)</option>
                    <option value="وكيل">وكيل (وكيل رسمي أو تفويض)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة التبعية والشمول</label>
                  <select
                    value={dependencyStatus}
                    onChange={(e) => setDependencyStatus(e.target.value as 'مستقل' | 'غير مستقل')}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs text-right focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="مستقل">مستقل (رب أسرة / معيل مستقل)</option>
                    <option value="غير مستقل">غير مستقل (تابع لأسرته / معال)</option>
                  </select>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شرح وتفاصيل المعاملة *</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="موضوع الطلب والإجراء والمتابعة مع الوزارة..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Attachments / Files */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم/رابط الطلب المقدم</label>
                  <input
                    type="text"
                    value={attachmentReq}
                    onChange={(e) => setAttachmentReq(e.target.value)}
                    placeholder="طلب_مقدم_2026.pdf"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم/رابط كتاب الإجابة أو الأمر</label>
                  <input
                    type="text"
                    value={attachmentResp}
                    onChange={(e) => setAttachmentResp(e.target.value)}
                    placeholder="كتاب_الإجابة_الرسمي.pdf"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Deputy Notes */}
              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1">توجيه وقرار النائب (إن وجد)</label>
                <input
                  type="text"
                  value={deputyNotes}
                  onChange={(e) => setDeputyNotes(e.target.value)}
                  placeholder="مثال: مفاتحة معالي الوزير مباشرة، إحالة للمتابعة الشخصية..."
                  className="w-full px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-300 text-slate-900 text-xs text-right focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Submit buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                {editingRequest ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDel = editingRequest;
                      setShowAddModal(false);
                      setEditingRequest(null);
                      setRequestToDelete(toDel);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف هذا الطلب</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingRequest(null);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {editingRequest ? 'حفظ التعديلات' : 'حفظ وإرسال التنبيه'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog for Admin Requests */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">تأكيد حذف المعاملة / الطلب</h3>
                <p className="text-xs text-rose-600 font-semibold">إجراء إداري رسمي موثق</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
              <div className="text-slate-800">
                <span className="font-bold text-slate-500">رقم الطلب: </span>
                <span className="font-mono text-blue-700 font-bold">{requestToDelete.Request_ID}</span>
              </div>
              <div className="text-slate-800">
                <span className="font-bold text-slate-500">صاحب الطلب: </span>
                <span className="font-bold text-slate-900">{requestToDelete.CitizenName}</span>
              </div>
              <div className="text-slate-800">
                <span className="font-bold text-slate-500">الجهة المعنية: </span>
                <span>{requestToDelete.Entity}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                ⚠️ تنبيه: سيتم حذف هذا الطلب نهائياً وتوثيق هوية الموظف في سجل الرقابة والتدقيق الداخلي.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRequest(requestToDelete.Request_ID);
                  setRequestToDelete(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد حذف الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Request Drafter Modal */}
      <AiRequestDrafterModal
        isOpen={showAiDrafterModal}
        onClose={() => setShowAiDrafterModal(false)}
      />
    </div>
  );
};
