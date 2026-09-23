import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DropdownCategory, UserRole, User } from '../types';
import { 
  Settings, 
  Users, 
  ListPlus, 
  Sliders, 
  Trash2, 
  Plus, 
  CheckCircle, 
  RotateCcw,
  KeyRound,
  ShieldCheck,
  Building2,
  Phone,
  MapPin,
  FileText,
  UserCheck,
  Edit2,
  Lock,
  Cloud,
  Check,
  X,
  Monitor,
  Download,
  Laptop,
  Terminal,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { AiRequestDrafterModal } from './AiRequestDrafterModal';

export const MasterAdminModule: React.FC = () => {
  const { 
    dropdowns,
    addDropdownItem, 
    removeDropdownItem, 
    users, 
    addUser, 
    updateUser,
    deleteUser,
    systemSettings, 
    updateSystemSettings, 
    resetToInitialData,
    currentUser,
    setIsDesktopInstallModalOpen,
    citizens,
    requests,
    interviews,
    cheques,
    organizationRecords,
    documents,
    officialLetters,
    exportToExcel,
    isSystemZeroed,
    setIsSystemWipeModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'dropdowns' | 'sync' | 'desktop' | 'data_wipe'>('system');
  const [selectedCategory, setSelectedCategory] = useState<DropdownCategory>('Entity');
  const [newItemValue, setNewItemValue] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAiDrafterModal, setShowAiDrafterModal] = useState(false);

  // Editing User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('admin');
  const [editDepartment, setEditDepartment] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'frozen'>('active');

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('reception');
  const [newUserDepartment, setNewUserDepartment] = useState('قسم الاستعلامات والمراجعين');

  // General System State
  const [appName, setAppName] = useState(systemSettings.appName);
  const [deputyName, setDeputyName] = useState(systemSettings.deputyName);
  const [deputyTitle, setDeputyTitle] = useState(systemSettings.deputyTitle);
  const [province, setProvince] = useState(systemSettings.province);
  const [officeAddress, setOfficeAddress] = useState(systemSettings.officeAddress);
  const [hotline, setHotline] = useState(systemSettings.hotline);
  const [tickerNewsText, setTickerNewsText] = useState(systemSettings.tickerNews.join('\n'));
  const [googleSheetId, setGoogleSheetId] = useState(systemSettings.googleSheetId);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState(systemSettings.googleDriveFolderId);
  const [appsScriptUrl, setAppsScriptUrl] = useState(systemSettings.appsScriptUrl);
  const [maintenanceMode, setMaintenanceMode] = useState(systemSettings.maintenanceMode);
  const [allowAdminOpenDriveFolder, setAllowAdminOpenDriveFolder] = useState(Boolean(systemSettings.allowAdminOpenDriveFolder));

  const categoryLabels: { [key in DropdownCategory]: string } = {
    Surname: 'العشائر والألقاب',
    Job: 'المهن والوظائف',
    Education: 'التحصيل الدراسي',
    Rating: 'التقييم الجماهيري',
    District: 'الأقضية السكنية',
    SubDistrict: 'النواحي والأحياء',
    ReferralSource: 'المعرّفون والمصرّحون',
    Entity: 'الجهات والوزارات والدوائر'
  };

  const roleMap: Record<string, string> = {
    developer: 'مطور المنظومة (صلاحية برمجية مطلقة)',
    director: 'مدير المكتب التنفيذي (إشراف ومصادقة)',
    deputy: 'النائب علا الناشي',
    admin: 'مسؤول قسم الإدارة والمعاملات',
    reception: 'مسؤول قسم الاستعلامات والمراجعين',
    organization: 'مسؤول قسم التنظيم والجماهير',
    machine: 'مدير مكنة المكتب وطباعة الكتب',
    audit: 'مسؤول قسم الرقابة والتشريع',
    archive: 'مسؤول قسم الأرشفة والوثائق',
    reception_officer: 'موظف قسم الاستعلامات',
    admin_officer: 'موظف قسم الإدارة',
    interviews_officer: 'مسؤول قسم المقابلات',
    organization_officer: 'موظف قسم التنظيم',
    machine_officer: 'موظف قسم المكنة'
  };

  // Dropdown helper
  const currentCategoryItems = dropdowns
    .filter(d => d.Category.toLowerCase() === selectedCategory.toLowerCase())
    .map(d => d.ItemValue);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemValue.trim()) return;

    addDropdownItem(selectedCategory, newItemValue.trim());
    setSuccessMessage(`تمت إضافة "${newItemValue.trim()}" إلى قائمة [${categoryLabels[selectedCategory]}] بنجاح.`);
    setNewItemValue('');
  };

  const handleRemoveItem = (val: string) => {
    if (confirm(`هل أنت متأكد من حذف "${val}" من قائمة [${categoryLabels[selectedCategory]}]؟`)) {
      removeDropdownItem(selectedCategory, val);
      setSuccessMessage(`تم حذف "${val}" بنجاح.`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPassword.trim() || !newUserFullName.trim()) {
      alert('يرجى ملء كافة بيانات الموظف.');
      return;
    }

    addUser({
      Username: newUserName.trim().toLowerCase(),
      Password: newUserPassword.trim(),
      FullName: newUserFullName.trim(),
      Role: newUserRole,
      RoleArabic: roleMap[newUserRole] || 'موظف معتمد',
      Department: newUserDepartment.trim(),
      Status: 'active'
    });

    setSuccessMessage(`تم إنشاء حساب الموظف (${newUserFullName}) وتعيين صلاحياته بنجاح.`);
    setNewUserName('');
    setNewUserFullName('');
    setNewUserPassword('');
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.User_ID);
    setEditFullName(user.FullName);
    setEditUsername(user.Username);
    setEditPassword(user.Password || '123');
    setEditRole(user.Role);
    setEditDepartment(user.Department);
    setEditStatus(user.Status || 'active');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    const targetUser = users.find(u => u.User_ID === editingUserId);
    if (!targetUser) return;

    const updatedUser: User = {
      ...targetUser,
      FullName: editFullName.trim(),
      Username: editUsername.trim().toLowerCase(),
      Password: editPassword.trim(),
      Role: editRole,
      RoleArabic: roleMap[editRole] || targetUser.RoleArabic,
      Department: editDepartment.trim(),
      Status: editStatus
    };

    updateUser(updatedUser);
    setEditingUserId(null);
    setSuccessMessage(`تم تحديث بيانات وصلاحيات الحساب (${editFullName}) بنجاح.`);
  };

  const handleDeleteUserClick = (userId: string, name: string) => {
    if (userId === currentUser?.User_ID) {
      alert('لا يمكنك حذف الحساب النشط الحالي الذي تستخدمه لتسجيل الدخول.');
      return;
    }
    if (confirm(`تحذير: هل أنت متأكد من رغبتك في حذف حساب الموظف (${name}) نهائياً من المنظومة؟`)) {
      deleteUser(userId);
      setSuccessMessage(`تم حذف حساب الموظف (${name}) بنجاح.`);
    }
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newsArray = tickerNewsText.split('\n').map(s => s.trim()).filter(Boolean);

    updateSystemSettings({
      appName: appName.trim(),
      deputyName: deputyName.trim(),
      deputyTitle: deputyTitle.trim(),
      province: province.trim(),
      officeAddress: officeAddress.trim(),
      hotline: hotline.trim(),
      tickerNews: newsArray,
      googleSheetId: googleSheetId.trim(),
      googleDriveFolderId: googleDriveFolderId.trim(),
      appsScriptUrl: appsScriptUrl.trim(),
      maintenanceMode,
      allowAdminOpenDriveFolder
    });

    setSuccessMessage('تم حفظ وتطبيق كافة إعدادات المنظومة والنصوص بنجاح.');
  };

  const handleResetData = () => {
    if (confirm('تنبيه هام: هل تريد استعادة البيانات الافتراضية الأولية للنظام؟')) {
      resetToInitialData();
      setSuccessMessage('تمت استعادة البيانات الافتراضية بنجاح.');
    }
  };

  return (
    <div className="space-y-4 text-right">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">مركز تحكم المطور والإدارة المطلقة (Developer & Master Control)</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  صلاحية مطور النظام كاملة 100%
                </span>
                <span className="text-[11px] text-slate-500">
                  تعديل أدق التفاصيل، إدارة الكادر، تخصيص القوائم، وتجهيز النظام للنشر
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Zero / Wipe All Data Button */}
          <button
            onClick={() => setIsSystemWipeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            title="تصفير وحذف جميع بيانات النظام (تفريغ الجداول بالكامل 0 سجل)"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>تصفير وحذف جميع البيانات (0 سجل)</span>
          </button>

          <button
            onClick={() => setShowAiDrafterModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            title="توليد وتجربة صياغة طلب رسمي بالذكاء الاصطناعي"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>توليد طلب بالذكاء الاصطناعي</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الضبط الافتراضي</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'system' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>تخصيص نصوص وبيانات المنظومة والنائب</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>تقسيم المهام وحسابات الكادر والموظفين ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dropdowns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dropdowns' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ListPlus className="w-3.5 h-3.5" />
          <span>القوائم المنسدلة والحقول الديناميكية ({dropdowns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sync' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>معرّفات الربط السحابي (Google Sheets & Drive)</span>
        </button>

        <button
          onClick={() => setActiveTab('desktop')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'desktop' 
              ? 'bg-orange-600 text-white shadow-xs' 
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-indigo-600" />
          <span>تثبيت سطح المكتب وحزم Windows (PWA / .EXE)</span>
        </button>

        <button
          onClick={() => setActiveTab('data_wipe')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'data_wipe' 
              ? 'bg-red-600 text-white shadow-xs' 
              : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span>إدارة وتصفير البيانات ({citizens.length + requests.length} سجل)</span>
        </button>
      </div>

      {/* TAB 1: System Texts & Settings */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            <form onSubmit={handleSaveAllSettings} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>تعديل نصوص وعناوين المنظومة بالكامل (من أصغر حرف إلى الهيدر)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم البرنامج / المنظومة *</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم النائب الرسمي *</label>
                  <input
                    type="text"
                    value={deputyName}
                    onChange={(e) => setDeputyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">صفة النائب الرسمية *</label>
                  <input
                    type="text"
                    value={deputyTitle}
                    onChange={(e) => setDeputyTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة / الدائرة الانتخابية *</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان مقر المكتب *</label>
                  <input
                    type="text"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الخط الساخن / هاتف الاستعلامات *</label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-mono text-left font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شريط الأخبار والتعميمات الإدارية المباشرة (كل تعميم في سطر مستقل):
                </label>
                <textarea
                  value={tickerNewsText}
                  onChange={(e) => setTickerNewsText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 leading-relaxed font-medium"
                  placeholder="أدخل الأخبار والتعميمات..."
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="maintModeFull"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 cursor-pointer accent-orange-600"
                />
                <label htmlFor="maintModeFull" className="text-xs font-bold text-slate-800 cursor-pointer">
                  تفعيل وضع الصيانة العام (Maintenance Mode)
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وتعميم التعديلات على النظام فوراً</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>جاهزية النظام للنشر (Production Status)</span>
              </h4>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
                  <span>هيكلية الصلاحيات RBAC</span>
                  <span className="font-bold">مفعلة بالكامل ✓</span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-between">
                  <span>أرشفة السجلات والحفظ التلقائي</span>
                  <span className="font-bold font-mono">LocalStorage + Cloud</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-between">
                  <span>دعم طباعة الباجات والهويات</span>
                  <span className="font-bold">جاهز مع الباركود QR</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
                  <span>منظومة المقابلات والكتب الرسمية</span>
                  <span className="font-bold">مفعلة ومتكاملة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users & Tasks Breakdown */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Form Column (5 Cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <KeyRound className="w-4 h-4 text-orange-600" />
                <span>{editingUserId ? 'تعديل بيانات وحساب الموظف' : 'إضافة موظف جديد وتقسيم الصلاحيات'}</span>
              </h3>

              {editingUserId ? (
                <form onSubmit={handleSaveEditUser} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف الكامل *</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (Login) *</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-left"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
                      <input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-left"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الدور والصلاحية المخصصة (Role) *</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-orange-800"
                    >
                      <option value="developer">المطور (صلاحية مطلقة لكافة المنظومة)</option>
                      <option value="director">مدير المكتب التنفيذي (إشراف شامل)</option>
                      <option value="reception">قسم الاستعلامات والمراجعين (تسجيل وبطاقات)</option>
                      <option value="admin">قسم الإدارة والمعاملات (متابعة وإنجاز)</option>
                      <option value="interviews_officer">قسم مقابلات النائب (حجز وجدولة)</option>
                      <option value="organization">قسم التنظيم والجماهير (الموقف الجماهيري)</option>
                      <option value="machine">قسم المكنة والطباعة (كتب رسمية)</option>
                      <option value="audit">قسم الرقابة والتشريع (تدقيق ومتابعة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">القسم الإداري</label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">حالة الحساب</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-bold"
                    >
                      <option value="active">نشط (مسموح بالدخول)</option>
                      <option value="frozen">مجمّد (معلق مؤقتاً)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف الكامل *</label>
                    <input
                      type="text"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      placeholder="مثال: حيدر كريم العتابي"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (Login) *</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="haider.user"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-left font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور *</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-left"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الدور وتخصيص القسم *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        const r = e.target.value as UserRole;
                        setNewUserRole(r);
                        if (r === 'reception') setNewUserDepartment('قسم الاستعلامات والمراجعين');
                        else if (r === 'admin') setNewUserDepartment('قسم الإدارة والمعاملات');
                        else if (r === 'interviews_officer') setNewUserDepartment('قسم مقابلات النائب');
                        else if (r === 'organization') setNewUserDepartment('قسم التنظيم والجماهير');
                        else if (r === 'machine') setNewUserDepartment('قسم مكنة وطباعة الكتب');
                        else if (r === 'audit') setNewUserDepartment('قسم الرقابة والتشريع');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 text-orange-800"
                    >
                      <option value="reception">موظف قسم الاستعلامات (تسجيل وتوليد باجات)</option>
                      <option value="admin">موظف قسم الإدارة (إدارة وتدقيق المعاملات)</option>
                      <option value="interviews_officer">مسؤول قسم المقابلات (جدولة وإحالة المقابلات)</option>
                      <option value="organization">مسؤول قسم التنظيم (الموقف الجماهيري والتنظيمي)</option>
                      <option value="machine">مدير مكنة المكتب (صياغة وطباعة الكتب الرسمية)</option>
                      <option value="audit">مسؤول الرقابة والتشريع (تدقيق ومطابقة)</option>
                      <option value="director">مدير المكتب التنفيذي (إشراف ومصادقة)</option>
                      <option value="developer">مطور المنظومة (صلاحية برمجية مطلقة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">القسم الإداري</label>
                    <input
                      type="text"
                      value={newUserDepartment}
                      onChange={(e) => setNewUserDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة حساب الموظف وتفعيل دوره</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List Column (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-orange-600" />
                  <span>كادر وموظفي أقسام المكتب المسجلين ({users.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500">انقر على "تعديل" لتغيير الصلاحية أو كلمة المرور</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {users.map((u, idx) => {
                  const isCurrent = currentUser?.User_ID === u.User_ID;
                  return (
                    <div
                      key={`${u.User_ID}-${idx}`}
                      className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? 'bg-orange-50/50 border-orange-200' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs truncate">{u.FullName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-orange-800 border border-orange-200 shrink-0">
                            {u.RoleArabic}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-600 text-white shrink-0">
                              أنت (الحساب الحالي)
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                          <span>اليوزر: <strong className="text-slate-800">{u.Username}</strong></span>
                          <span>•</span>
                          <span>القسم: {u.Department}</span>
                          <span>•</span>
                          <span className={u.Status === 'frozen' ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {u.Status === 'frozen' ? 'مجمّد' : 'نشط'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => startEditUser(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="تعديل الصلاحيات وكلمة المرور"
                        >
                          <Edit2 className="w-3 h-3 text-slate-600" />
                          <span>تعديل</span>
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUserClick(u.User_ID, u.FullName)}
                            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dropdowns & Dynamic Fields */}
      {activeTab === 'dropdowns' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Category Selector (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2">اختر القائمة المراد إدارتها وتعديل خياراتها:</h4>
            {Object.entries(categoryLabels).map(([catKey, label]) => {
              const count = dropdowns.filter(d => d.Category.toLowerCase() === catKey.toLowerCase()).length;
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey as DropdownCategory)}
                  className={`w-full p-3 rounded-xl text-right text-xs font-semibold transition-all cursor-pointer border flex items-center justify-between shadow-2xs ${
                    isSelected
                      ? 'bg-orange-50 text-orange-900 border-orange-300 ring-1 ring-orange-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{label}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-mono font-bold">
                    {count} عنصر
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Items List & Add New (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-900">
                  عناصر وخيارات قائمة: [{categoryLabels[selectedCategory]}]
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  أي إضافة تظهر فوراً في استمارات التسجيل والمعاملات
                </span>
              </div>

              {/* Add New Item Input */}
              <form onSubmit={handleAddItem} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  placeholder={`اكتب عنصراً أو جهة جديدة لإضافتها إلى قائمة ${categoryLabels[selectedCategory]}...`}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs text-right outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة للقائمة</span>
                </button>
              </form>

              {/* List of items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pt-1">
                {currentCategoryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-800 font-medium">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="حذف هذا العنصر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cloud Sync IDs */}
      {activeTab === 'sync' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs max-w-3xl">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>إعدادات ومعرّفات المزامنة السحابية (Google Sheets & Google Drive)</span>
          </h3>

          <form onSubmit={handleSaveAllSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                معرّف جدول Google Sheets (Spreadsheet ID)
              </label>
              <input
                type="text"
                value={googleSheetId}
                onChange={(e) => setGoogleSheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono text-left outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                معرّف مجلد الأرشيف في Google Drive (Folder ID)
              </label>
              <input
                type="text"
                value={googleDriveFolderId}
                onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                placeholder="1AbC_Drive_Office_OlaAlNashi_Archive_2026"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono text-left outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابط Google Apps Script Web App URL
              </label>
              <input
                type="text"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono text-left outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Developer-Only Permission for opening Google Drive folder */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold text-slate-800">
                    صلاحية فتح مجلد Google Drive المباشر لمدير الإدارة
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    تحكم حصري للمطور
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  حسب توجيه المنظومة: فتح مجلد Google Drive مقتصر حصراً على المطور. هل يمنح المطور هذا الخيار لمدير الإدارة لفتحه أيضاً؟
                </p>
              </div>

              {currentUser?.Role === 'developer' ? (
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 cursor-pointer text-xs font-bold text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={allowAdminOpenDriveFolder}
                    onChange={(e) => setAllowAdminOpenDriveFolder(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <span>{allowAdminOpenDriveFolder ? 'الصلاحية مفعّلة لمدير الإدارة' : 'معطّل (مقتصر على المطور)'}</span>
                </label>
              ) : (
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg">
                  {allowAdminOpenDriveFolder ? 'ممنوحة من قبل المطور' : 'محجوبة (تتطلب إذن المطور البرمجي)'}
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                حفظ معرّفات المزامنة السحابية
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Desktop App Deployment & Windows Packages */}
      {activeTab === 'desktop' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-xs max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-600" />
              <span>إدارة تثبيت التطبيق على سطح المكتب في حواسيب المكتب (Windows Desktop App)</span>
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
              يعمل أونلاين + اختصار مكتبي مستقل
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-700" />
                <h4 className="font-bold text-xs text-indigo-950">معالج التثبيت التفاعلي (Next-Next Setup Wizard)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                معالج تثبيت متكامل يوفر تجربة تثبيت سريعة وسلسة (Next-Next-Install)، يقوم بإنشاء اختصار سطح المكتب والتشغيل كنافذة مستقلة بدون شريط المتصفح.
              </p>
              <button
                onClick={() => setIsDesktopInstallModalOpen(true)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Monitor className="w-4 h-4 text-amber-300" />
                <span>فتح معالج التثبيت المكتبي الآن</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-800" />
                <h4 className="font-bold text-xs text-slate-950">سكريبت التشغيل والتثبيت السريع (.BAT)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ملف تشغيل دفعي يعمل بنقرة واحدة على ويندوز 10 و 11، ينشئ الاختصار الرسمي باسم "مكتب النائب علا الناشي" ويضبط أبعاد النافذة تلقائياً.
              </p>
              <button
                onClick={() => setIsDesktopInstallModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تنزيل ملفات التثبيت لويندوز (.BAT / .PS1)</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-2">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
              <span>💡 ملاحظات التشغيل في شبكة وحواسيب المكتب:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pr-1">
              <li>البرنامج مثبت عليه معيار PWA العالمي، وعند فتحه من خلال الاختصار يعمل في وضع <strong>Standalone Window</strong> بدون شريط العناوين.</li>
              <li>كافة التعديلات والمعاملات المدخلة من أي حاسوب في المكتب تتم مزامنتها سحابياً فوراً مع قاعدة البيانات ومجلدات الأرشيف في Google Drive.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 6: Data Wipe & Zero-Out Control Center */}
      {activeTab === 'data_wipe' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-red-200 shadow-sm space-y-6">
            
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>مركز تصفير وحذف بيانات المنظومة</span>
                    {isSystemZeroed ? (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        المنظومة مصفّرة ونظيفة (0 سجل)
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        المنظومة تحتوي بيانات وسجلات ({citizens.length + requests.length} سجل)
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تفريغ كافة الجداول والأرشيفات بصورة قطعية مع إمكانية التصدير الاحتياطي قبل الحذف أو استرجاع النماذج الافتراضية
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSystemWipeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>تصفير النظام الآن (فتح نافذة التأكيد)</span>
                </button>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-950">ماذا يعني تصفير النظام؟</p>
                <p className="leading-relaxed text-rose-800">
                  التصفير يقوم بتفريغ سجلات (المراجعين، الطلبات، المقابلات، معاملات الصكوك والتنظيم، الكتب والوثائق، وصور الأرشيف والـ OCR) بالكامل ليصبح عدد السجلات صفر (0). 
                  <br />
                  <strong>تبقى حسابات المستخدمين وإعدادات الربط السحابي ومسميات المكتب محفوظة دون مساس.</strong>
                </p>
              </div>
            </div>

            {/* Current System Inventory Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800">إحصائية السجلات المخزنة في النظام حالياً:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">سجلات المواطنين والمراجعين</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1">{citizens.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">الطلبات والمعاملات الرسمية</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1">{requests.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">المقابلات مع النائب</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1">{interviews.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">معاملات الصكوك والتنظيم</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1">{cheques.length + organizationRecords.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">الكتب الصادرة والأرشيف</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1">{documents.length + officialLetters.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-500 font-bold">صور المعاملات ومسح OCR</span>
                  <span className="text-xs font-black text-slate-800 font-mono mt-1">مخزنة محلياً (IndexedDB)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between col-span-2">
                  <span className="text-[11px] text-slate-500 font-bold">إجمالي السجلات التي سيتم تصفيرها</span>
                  <span className="text-lg font-black text-rose-600 font-mono mt-1">
                    {citizens.length + requests.length + interviews.length + cheques.length + organizationRecords.length + documents.length + officialLetters.length} سجل
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const exportData = [
                      ...citizens.map(c => ({ 'النوع': 'مراجع', 'المعرف': c.Citizen_ID, 'الاسم': c.FullName, 'الهاتف': c.Phone1, 'القضاء': c.District })),
                      ...requests.map(r => ({ 'النوع': 'طلب', 'رقم الطلب': r.Request_ID, 'المراجع': r.CitizenName, 'الجهة': r.Entity, 'الحالة': r.ProcessingStatus }))
                    ];
                    exportToExcel(exportData, 'نسخة_احتياطية_شاملة_قبل_التصفير');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>تصدير نسخة احتياطية إكسيل (Excel) الآن</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد استرجاع البيانات والطلبات الافتراضية التجريبية للنظام؟')) {
                      resetToInitialData();
                      alert('تمت استعادة البيانات التجريبية الافتراضية بنجاح.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>استرجاع النماذج والبيانات الافتراضية</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSystemWipeModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>زر التصفير الشامل وحذف كافة السجلات</span>
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
