import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Trash2, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  X, 
  Users, 
  FileText, 
  Calendar, 
  Image as ImageIcon,
  ShieldAlert,
  HardDrive
} from 'lucide-react';

interface SystemWipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemWipeModal: React.FC<SystemWipeModalProps> = ({ isOpen, onClose }) => {
  const { 
    citizens, 
    requests, 
    interviews, 
    cheques, 
    organizationRecords, 
    documents, 
    officialLetters, 
    exportToExcel,
    wipeAllSystemData,
    resetToDefaultData,
    isSystemZeroed,
    setActiveSection
  } = useApp();

  const [confirmInput, setConfirmInput] = useState('');
  const [exportBackupFirst, setExportBackupFirst] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  if (!isOpen) return null;

  const totalRecords = citizens.length + requests.length + interviews.length + cheques.length + organizationRecords.length + documents.length + officialLetters.length;

  const handleExecuteWipe = async () => {
    if (confirmInput.trim() !== 'تصفير') {
      alert('يرجى كتابة كلمة (تصفير) في الحقل أدناه لتأكيد رغبتك بحذف كافة البيانات.');
      return;
    }

    setIsWiping(true);

    try {
      // 1. Export safety backup if selected
      if (exportBackupFirst && totalRecords > 0) {
        const backupData = [
          ...citizens.map(c => ({ 'النوع': 'مراجع', 'المعرف': c.Citizen_ID, 'الاسم': c.FullName, 'الهاتف': c.Phone1, 'القضاء': c.District })),
          ...requests.map(r => ({ 'النوع': 'طلب', 'رقم الطلب': r.Request_ID, 'المراجع': r.CitizenName, 'الجهة': r.Entity, 'الحالة': r.ProcessingStatus }))
        ];
        exportToExcel(backupData, 'نسخة_أمان_احتياطية_قبل_التصفير');
      }

      // 2. Perform total system wipe
      await wipeAllSystemData();
      setWipeSuccess(true);
      setTimeout(() => {
        setIsWiping(false);
        setWipeSuccess(false);
        setConfirmInput('');
        onClose();
        setActiveSection('dashboard');
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsWiping(false);
      alert('حدث خطأ أثناء محاولة تصفير البيانات.');
    }
  };

  const handleExecuteDefaultRestore = () => {
    if (window.confirm('هل أنت متأكد من استعادة السجلات والبيانات التجريبية الافتراضية للنظام؟')) {
      resetToDefaultData();
      alert('تمت استعادة البيانات التجريبية الافتراضية بنجاح.');
      onClose();
      setActiveSection('dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-xl w-full overflow-hidden text-right">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>تصفير النظام وحذف جميع البيانات</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-amber-200 font-mono">
                  Factory Reset (0 Records)
                </span>
              </h3>
              <p className="text-xs text-red-100 font-medium">
                تفريغ كافة الجداول والسجلات وصور الأرشيف للبدء بإدخال بيانات العمل الميداني الفعلي
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {wipeSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">تم تصفير المنظومة بنجاح تام!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                تم تفريغ كافة سجلات المراجعين، المعاملات، المقابلات، وأرشيف الصور بالكامل (جميع الجداول الآن 0 سجل). المنظومة جاهزة للعمل الفعلي.
              </p>
            </div>
          ) : (
            <>
              {/* Warning Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">تنبيه هام ومصيري:</p>
                  <p className="text-amber-800 leading-relaxed">
                    هذا الإجراء سيقوم بحذف كافة السجلات المخزنة في النظام وتفريغ الجداول لتصبح (0 مراجع، 0 طلب، 0 وثيقة)، وإفراغ قاعدة صور الأرشيف الممسوحة ضوئياً بالكامل. لن تتأثر حسابات الكادر ولا إعدادات المنظومة الأساسية.
                  </p>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>إحصائية السجلات التي سيتم تصفيرها وحذفها:</span>
                  <span className="text-rose-600 font-mono">إجمالي: {totalRecords} سجل</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>المراجعين</span>
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">{citizens.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>الطلبات والمعاملات</span>
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">{requests.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>المقابلات</span>
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">{interviews.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                      <span>الصكوك والتنظيم</span>
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">{cheques.length + organizationRecords.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                      <span>الكتب والوثائق</span>
                    </span>
                    <span className="text-xs font-black text-slate-800 font-mono">{documents.length + officialLetters.length}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                      <span>صور الأرشيف وOCR</span>
                    </span>
                    <span className="text-xs font-black text-rose-600 font-mono">مسح كلي</span>
                  </div>
                </div>
              </div>

              {/* Safety Option: Export Backup First */}
              <label className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={exportBackupFirst}
                  onChange={(e) => setExportBackupFirst(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 font-bold">
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>تصدير نسخة احتياطية إكسيل (Excel) تلقائياً قبل التصفير للأمان</span>
                </span>
              </label>

              {/* Safety Confirmation Input */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                <label className="block text-xs font-bold text-rose-900">
                  لتأكيد رغبتك بالتصفير، اكتب كلمة <span className="text-rose-600 underline font-black font-mono px-1">تصفير</span> في الحقل أدناه:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="اكتب هنا: تصفير"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-slate-900 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteWipe}
                  disabled={confirmInput.trim() !== 'تصفير' || isWiping}
                  className={`w-full py-3 px-4 rounded-xl text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                    confirmInput.trim() === 'تصفير' && !isWiping
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer active:scale-[0.99]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isWiping ? 'جارِ تصفير البيانات وتفريغ الجداول...' : 'تأكيد وحذف جميع البيانات (تصفير المنظومة بالكامل)'}</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleExecuteDefaultRestore}
                    className="py-1.5 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>أو استعادة البيانات التجريبية الافتراضية</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-1.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء التراجع
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
