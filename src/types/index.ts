export type UserRole = 
  | 'developer'          // مطور النظام
  | 'director'           // مدير المكتب
  | 'admin'              // موظف الإدارة
  | 'reception'          // موظف الاستعلامات
  | 'deputy'             // النائب
  | 'organization'       // موظف التنظيم
  | 'machine'            // مدير مكنة المكتب
  | 'archive'            // مسؤول الأرشيف
  | 'audit'              // مسؤول الرقابة والتشريع
  | 'reception_officer'
  | 'admin_officer'
  | 'interviews_officer'
  | 'organization_officer'
  | 'machine_officer';

export interface User {
  User_ID: string;
  Username: string;
  Password?: string;
  Role: UserRole;
  RoleArabic: string;
  Status?: 'active' | 'frozen';
  Active?: boolean;
  FullName: string;
  Department: string;
  Avatar?: string;
  CreatedAt?: string;
}

export type CitizenRating = 'لائق' | 'غير لائق' | 'قلق' | 'غير محترم' | string;
export type Gender = 'ذكر' | 'أنثى';
export type OrgRating = 'مؤيد' | 'محايد' | 'ضعيف' | 'متردد' | 'معارض' | 'كادر قيادي' | 'شخصية مؤثرة' | string;

export type WorkflowStage = 'الاستعلامات' | 'مدير المكتب' | 'مدير الإدارة' | 'مدير التنظيم' | 'مكتمل';

export interface WorkflowAction {
  id: string;
  fromStage: WorkflowStage | string;
  toStage: WorkflowStage | string;
  fromUser: string;
  actionDate: string;
  directiveNote?: string;
  statusText?: string;
  targetEntity?: string;
  FromStage?: WorkflowStage | string;
  ToStage?: WorkflowStage | string;
  ActionBy?: string;
  Timestamp?: string;
  DirectiveNotes?: string;
}

export interface Citizen {
  Citizen_ID: string;
  FirstName?: string;
  FatherName?: string;
  GrandFatherName?: string;
  GreatGrandFatherName?: string;
  Surname?: string;
  FullName: string;
  Phone1: string;
  Phone2?: string;
  National_ID?: string;
  Job?: string;
  Education?: string;
  Gender: Gender;
  Rating: CitizenRating;
  District: string;
  SubDistrict: string;
  ReferralSource?: string;
  CreatedAt: string;
  CreatedBy?: string;
  CurrentStage?: WorkflowStage;
  WorkflowHistory?: WorkflowAction[];
  CustomFields?: Record<string, string | number | boolean>;
  PhotoUrl?: string;
  RegisteredVia?: 'استعلامات' | 'إدارة' | 'بوابة_المواطن' | 'قارئ OCR الذكي' | 'مسح OCR ذكي' | 'مسح OCR فردي' | 'أرشفة صور' | string;
  AttendanceType?: 'شخصياً' | 'عبر معتمد' | 'وكيل'; // شخصياً أو عبر وسيط/معتمد
  DependencyStatus?: 'مستقل' | 'غير مستقل'; // المستفيدين المستقلين أو غير المستقلين
}

export type RequestStatus = 'مستلم' | 'غير مستلم' | 'معاد' | 'غير مستوفي للشروط' | 'خاص';
export type ProcessingStatus = 'منجز' | 'قيد الإجراء' | 'قيد التدقيق' | 'مرفوض' | 'تم الطباعة' | 'مرسل إلى الوزارة/الهيئة' | 'بانتظار الموافقة' | 'مسودة';
export type Priority = 'عاجل' | 'عام' | 'خاص جداً';

export interface OfficeRequest {
  Request_ID: string;
  Citizen_ID: string;
  CitizenName: string;
  CitizenPhone?: string;
  Entity: string; // الجهة المعنية
  RequestStatus: RequestStatus;
  ProcessingStatus: ProcessingStatus;
  Priority: Priority;
  Details: string;
  AttachmentRequest?: string;  // الطلب المقدم
  AttachmentResponse?: string; // الطلب المستلم / كتاب الإجابة
  AttachedRequestImage?: string; // صورة أو مسح الطلب المرفق
  CreatedAt: string;
  CreatedDate?: string;
  CreatedBy: string;
  CurrentStage?: WorkflowStage;
  WorkflowHistory?: WorkflowAction[];
  DeputyNotes?: string;
  ExecutiveAction?: string;
  OutgoingNumber?: string; // العدد الصادر التراكمي
  OutgoingDate?: string;   // تاريخ الصادر
  IsKhadamatAlliance?: boolean; // خاص بتحالف خدمات
  RegisteredVia?: 'استعلامات' | 'إدارة' | 'بوابة_المواطن' | string;
  AttendanceType?: 'شخصياً' | 'عبر معتمد' | 'وكيل';
  DependencyStatus?: 'مستقل' | 'غير مستقل';
  GeneratedAiDraft?: string; // الطلب المولد بالذكاء الاصطناعي
  CustomFields?: Record<string, string | number | boolean>;
}

export interface ChequeRecord {
  id: string;
  ChequeNumber: string;
  Citizen_ID: string;
  CitizenName: string;
  CitizenPhone?: string;
  Request_ID?: string;
  Amount: number; // المبلغ بالدينار العراقي
  AmountInWords?: string; // تفقيط المبلغ
  BankName: string; // اسم المصرف / الصندوق
  Purpose: string; // الغرض (مساعدة مالية، علاجية، إعمار، رعاية، تعويض...)
  IssueDate: string; // تاريخ التحرير
  DueDate?: string; // تاريخ الاستحقاق / الصرف
  Status: 'قيد الصرف' | 'تم الصرف' | 'مؤجل' | 'ملغى';
  BeneficiaryGender: Gender;
  DependencyStatus: 'مستقل' | 'غير مستقل';
  AttendanceType: 'شخصياً' | 'عبر معتمد' | 'وكيل';
  Notes?: string;
  CreatedBy: string;
  CreatedAt: string;
}

export type InterviewStatus = 'مجدولة' | 'تمت المقابلة' | 'مؤجلة' | 'ملغاة' | 'تمت الإحالة';
export type DeputyDirective = 'إحالة للإدارة' | 'هامش مباشر' | 'متابعة شخصية' | 'غير مستوفي للشروط' | 'توجيه للمكنة' | string;

export interface Interview {
  Interview_ID: string;
  Citizen_ID: string;
  FullName: string;
  CitizenName?: string;
  Subject: string;
  Phone1: string;
  Phone2?: string;
  Address: string;
  Referrer?: string;
  InterviewDate: string;
  InterviewTime?: string;
  Priority: 'عادي' | 'عاجل' | 'خاص جداً';
  Status: InterviewStatus;
  DeputyNotes?: string;
  DeputyDirective?: string;
  Directive?: string;
  Outcome?: string;
  ConvertedToRequest?: boolean;
  CreatedAt?: string;
}

export interface OrganizationRecord {
  Org_ID?: string;
  Citizen_ID: string;
  FullName: string;
  District?: string;
  SubDistrict?: string;
  Phone1?: string;
  Phone?: string;
  OrgRating: OrgRating;
  Rating?: string;
  RoleType?: string;
  ReferralCount?: number;
  InfluenceType?: string;
  EvaluationPoints?: number;
  ElectionCenter?: string;
  StationNumber?: string;
  Notes?: string;
  Referrer?: string;
  CustomFields?: Record<string, string | number | boolean>;
  UpdatedAt?: string;
}

export type DropdownCategory = 
  | 'Surname' 
  | 'Entity' 
  | 'Rating' 
  | 'Job' 
  | 'Education' 
  | 'District' 
  | 'SubDistrict' 
  | 'ReferralSource';

export interface DropdownItem {
  id?: string;
  Category: DropdownCategory | string;
  ItemValue: string;
}

export interface AuditLog {
  Log_ID: string;
  Timestamp: string;
  UserName?: string;
  User?: string;
  PerformedBy?: string;
  ActionType?: string;
  Action?: string;
  Department?: string;
  Section?: string;
  Details: string;
  Ip?: string;
}

export interface DynamicField {
  id: string;
  section: 'reception' | 'admin' | 'interviews' | 'organization' | 'general';
  sectionArabic: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'file';
  options?: string[];
  required: boolean;
}

export interface DocumentRecord {
  Doc_ID: string;
  Citizen_ID: string;
  CitizenName: string;
  Title: string;
  Category: 'طلب مقدم' | 'كتاب رسمي' | 'هوية وبطاقة وطنية' | 'مستمسكات' | 'مستمسكات ثبوتية' | 'كتاب رسمي صادر' | 'أخرى' | string;
  FileUrl: string;
  FileType: 'image' | 'pdf' | 'doc' | string;
  FileSize: string;
  UploadedAt: string;
  UploadedBy: string;
}

export type DocumentArchiveItem = DocumentRecord;

export interface OfficialLetter {
  Letter_ID: string;
  LetterNumber: string;
  LetterDate: string;
  Letter_Number?: string;
  Letter_Date?: string;
  To_Entity?: string;
  Recipient: string;
  Subject: string;
  Body: string;
  Citizen_ID?: string;
  CitizenName?: string;
  Citizen_Name?: string;
  Request_ID?: string;
  Status: string;
  ClerkName: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  text: string;
  category: 'استلام طلب' | 'إنجاز معاملة' | 'تحديد مقابلة' | 'تحديث موقف' | 'تنويه عام';
}

export interface SystemSettings {
  appName: string;
  deputyName: string;
  deputyTitle: string;
  province: string;
  officeAddress: string;
  hotline: string;
  logoUrl: string;
  parliamentEmblemUrl: string;
  maintenanceMode: boolean;
  tickerNews: string[];
  googleSheetId?: string;
  activeGoogleSheetId?: string;
  activeGoogleSheetUrl?: string;
  googleDriveFolderId?: string;
  appsScriptUrl?: string;
  googleAppsScriptUrl?: string;
  primaryThemeColor?: string;
  allowAdminOpenDriveFolder?: boolean; // للمطور لتحديد هل يحق لمدير الإدارة فتح مجلد Google Drive المباشر
}

export interface CitizenInquiryLog {
  id: string;
  citizenName: string;
  phone: string;
  inquiryDate: string;
  matchedRequestsCount: number;
  ip?: string;
  device?: string;
}
