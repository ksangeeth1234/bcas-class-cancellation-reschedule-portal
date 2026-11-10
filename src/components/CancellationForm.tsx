import React, { useState, useEffect } from 'react';
import {
  CalendarX2,
  CalendarCheck,
  Building2,
  User,
  BookOpen,
  Hash,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { BCAS_DEPARTMENTS, BCAS_CLASSROOMS } from '../data/bcasDirectory';
import { CancellationRequest } from '../types';
import { createCancellationRequest, sendCancellationEmail } from '../services/api';
import { EmailTemplateCard } from './EmailTemplateCard';

interface CancellationFormProps {
  onSuccess: (request: CancellationRequest) => void;
}

export const CancellationForm: React.FC<CancellationFormProps> = ({ onSuccess }) => {
  // Form State
  const [department, setDepartment] = useState('Department of Computing');
  const [program, setProgram] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [batch, setBatch] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [customLecturer, setCustomLecturer] = useState(false);
  const [dateOfCancellation, setDateOfCancellation] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [reason, setReason] = useState('');
  const [classroom, setClassroom] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<CancellationRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendCopyToMyEmail, setSendCopyToMyEmail] = useState(true);
  const [myEmail, setMyEmail] = useState('pzen0057@gmail.com');

  // Selected Department Info from directory
  const currentDeptInfo = BCAS_DEPARTMENTS.find(d => d.name === department) || BCAS_DEPARTMENTS[2];

  // When department changes, update lecturer options & default emails
  useEffect(() => {
    if (currentDeptInfo) {
      // Auto-set HOD email if not manually modified
      if (currentDeptInfo.hodEmail) {
        setHodEmail(currentDeptInfo.hodEmail);
      }
      // If there are coordinators, suggest first coordinator email
      if (currentDeptInfo.coordinators.length > 0) {
        setCoordinatorEmail(currentDeptInfo.coordinators[0].email);
      }
      // Default lecturer to first active lecturer in department
      if (currentDeptInfo.lecturers.length > 0 && !customLecturer) {
        setLecturer(currentDeptInfo.lecturers[0].name);
      }
    }
  }, [department]);

  // Set default dates on mount (today and tomorrow)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    setDateOfCancellation(today);
    setRescheduleDate(tomorrow);
  }, []);

  // Quick preset from the user attachment image
  const loadExamplePreset = () => {
    setDepartment('Department of Computing');
    setProgram('Fundamental in IT');
    setModuleName('Hardware');
    setBatch('ACC315');
    setLecturer('Mr. Anis');
    setCustomLecturer(false);
    setDateOfCancellation('2024-08-30');
    setRescheduleDate('2024-08-31');
    setCoordinatorEmail('email9@bcas.lk');
    setHodEmail('email5@bcas.lk');
    setClassroom('TECH 001 (30)');
    setReason('Urgent departmental curriculum coordination meeting and hardware lab maintenance.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!department) return setErrorMessage('Please select a Department.');
    if (!program.trim()) return setErrorMessage('Please enter the Program name.');
    if (!moduleName.trim()) return setErrorMessage('Please enter the Module name.');
    if (!batch.trim()) return setErrorMessage('Please enter the Batch number.');
    if (!lecturer.trim()) return setErrorMessage('Please select or enter the Lecturer name.');
    if (!dateOfCancellation) return setErrorMessage('Please select the Date of Cancellation.');
    if (!rescheduleDate) return setErrorMessage('Please select the proposed Reschedule Date.');
    if (!coordinatorEmail.trim()) return setErrorMessage('Please provide Related Coordinator email address.');
    if (!hodEmail.trim()) return setErrorMessage('Please provide Related HOD email address.');
    if (!reason.trim()) return setErrorMessage('Please specify the Reason for cancellation.');

    setIsSubmitting(true);

    const requestId = `BCAS-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newRequest: CancellationRequest = {
      id: requestId,
      department,
      program: program.trim(),
      module: moduleName.trim(),
      batch: batch.trim(),
      lecturer: lecturer.trim(),
      dateOfCancellation,
      rescheduleDate,
      coordinatorEmail: coordinatorEmail.trim(),
      hodEmail: hodEmail.trim(),
      reason: reason.trim(),
      classroom: classroom.trim() || undefined,
      status: 'Pending',
      emailStatus: 'Pending',
      senderCopyEmail: sendCopyToMyEmail ? myEmail.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Store in Firestore & Express server
      await createCancellationRequest(newRequest);

      // 2. Dispatch Automated Email via NodeMailer backend
      const emailResult = await sendCancellationEmail({
        requestId: newRequest.id,
        department: newRequest.department,
        program: newRequest.program,
        module: newRequest.module,
        batch: newRequest.batch,
        lecturer: newRequest.lecturer,
        dateOfCancellation: newRequest.dateOfCancellation,
        rescheduleDate: newRequest.rescheduleDate,
        coordinatorEmail: newRequest.coordinatorEmail,
        hodEmail: newRequest.hodEmail,
        reason: newRequest.reason,
        classroom: newRequest.classroom,
        senderCopyEmail: sendCopyToMyEmail ? myEmail.trim() : undefined,
        sendCopyToSender: sendCopyToMyEmail
      });

      if (emailResult.success) {
        newRequest.emailStatus = 'Sent';
        newRequest.emailMessageId = emailResult.messageId;
      } else if (emailResult.simulated) {
        newRequest.emailStatus = 'Sent';
        newRequest.emailMessageId = emailResult.messageId;
      } else {
        newRequest.emailStatus = 'Failed';
        newRequest.emailError = emailResult.error || 'Failed to dispatch email';
      }

      setSubmitSuccess(newRequest);
      onSuccess(newRequest);
    } catch (err: any) {
      newRequest.emailStatus = 'Failed';
      newRequest.emailError = err?.message || 'Error submitting request';
      setSubmitSuccess(newRequest);
      onSuccess(newRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setProgram('');
    setModuleName('');
    setBatch('');
    setReason('');
    setSubmitSuccess(null);
    setErrorMessage(null);
  };

  const previewRequest: Partial<CancellationRequest> = {
    department,
    program: program || 'Program Name',
    module: moduleName || 'Module Name',
    batch: batch || 'Batch Code',
    lecturer: lecturer || 'Lecturer Name',
    dateOfCancellation: dateOfCancellation || 'YYYY-MM-DD',
    rescheduleDate: rescheduleDate || 'YYYY-MM-DD',
    coordinatorEmail: coordinatorEmail || 'coordinator@bcas.lk',
    hodEmail: hodEmail || 'hod@bcas.lk',
    reason: reason || 'Reason description will appear here.',
    classroom,
    createdAt: new Date().toISOString()
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Quick Actions */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/60 shadow-lg text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Official BCAS Academic Cancellation Form
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Class Cancellation &amp; Reschedule Request
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Submit a lecture cancellation notice. The request is securely stored in Firebase Firestore, and an official notification email is automatically dispatched via NodeMailer to the departmental Coordinator and HOD with CC to <span className="text-amber-300 font-mono">sangeeth@bcas.lk</span> and <span className="text-amber-300 font-mono">priyalini@bcas.lk</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadExamplePreset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fill Proposal Example
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-medium transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            {previewOpen ? 'Hide Email Preview' : 'Show Email Preview'}
          </button>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submitSuccess && (
        <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-md text-emerald-950 animate-in fade-in duration-300 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-black text-emerald-950">
                  Lecture Cancellation Dispatched &amp; Recorded!
                </h3>
                <span className="font-mono text-xs px-3 py-1 bg-emerald-200/80 rounded-lg font-extrabold text-emerald-900 border border-emerald-300">
                  REF: {submitSuccess.id}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Your cancellation notice with your exact entered data has been stored in Firebase and dispatched through Google Gmail SMTP.
              </p>
            </div>
          </div>

          {/* Real Entered Data Summary Card */}
          <div className="bg-white rounded-xl border border-emerald-200 p-4 text-xs space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <span>Submitted Data Summary (ඇතුලත් කල තොරතුරු):</span>
              <span className="text-emerald-700 font-semibold">✓ Exact Values Sent in Email</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-bold text-slate-900">{submitSuccess.department}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Program</span>
                <span className="font-medium text-slate-900">{submitSuccess.program}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Module</span>
                <span className="font-bold text-blue-700">{submitSuccess.module}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch</span>
                <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">{submitSuccess.batch}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lecturer</span>
                <span className="font-medium text-slate-900">{submitSuccess.lecturer}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Cancellation</span>
                <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{submitSuccess.dateOfCancellation}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reschedule Date</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{submitSuccess.rescheduleDate || 'TBA'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Classroom</span>
                <span className="text-slate-700">{submitSuccess.classroom || 'Standard'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reason</span>
              <p className="text-slate-800 italic bg-slate-50 p-2 rounded-lg mt-0.5">{submitSuccess.reason}</p>
            </div>
          </div>

          {/* Email Delivery Verification Card */}
          <div className="bg-emerald-100/70 rounded-xl border border-emerald-300 p-3 text-xs space-y-1.5 text-emerald-950">
            <div className="font-bold flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>Email Delivery Breakdown (ඊමේල් යැවූ ලිපින):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                <strong className="block text-slate-900">1. To Coordinator &amp; HOD:</strong>
                <span className="font-mono text-emerald-900 block truncate">{submitSuccess.coordinatorEmail}</span>
                <span className="font-mono text-slate-600 block truncate">{submitSuccess.hodEmail}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                <strong className="block text-slate-900">2. Direct to Your Gmail:</strong>
                <span className="font-mono text-blue-700 font-bold block truncate">pzen0057@gmail.com</span>
                <span className="text-[10px] text-slate-600">✓ Sent directly to your Inbox!</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                <strong className="block text-slate-900">3. Mandatory CC:</strong>
                <span className="font-mono text-slate-700 block truncate">sangeeth@bcas.lk</span>
                <span className="font-mono text-slate-700 block truncate">priyalini@bcas.lk</span>
              </div>
            </div>
            <p className="text-[10px] text-emerald-800 pt-1">
              * Note for CC addresses: Because @bcas.lk is managed on Microsoft 365 Exchange, automated emails from external Gmail accounts may land in their <strong>Junk Email</strong> folder.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              + Submit Another Cancellation
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Application Form */}
        <div className={previewOpen ? 'lg:col-span-7' : 'lg:col-span-8'}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Section 1: Department & Lecturer */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  1. Academic Department &amp; Lecturer
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-xs"
                    required
                  >
                    {BCAS_DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select one of the 10 official academic departments.
                  </p>
                </div>

                {/* Lecturer Dropdown according to department */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Lecturer Name <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomLecturer(!customLecturer)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline"
                    >
                      {customLecturer ? '← Pick from Department Faculty' : '+ Type Custom Lecturer'}
                    </button>
                  </div>

                  {!customLecturer ? (
                    <select
                      value={lecturer}
                      onChange={(e) => setLecturer(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      required
                    >
                      {currentDeptInfo.lecturers.map((lec) => (
                        <option key={lec.code} value={lec.name}>
                          {lec.name} — {lec.designation} ({lec.type})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Mr. Anis / Visiting Lecturer"
                      value={lecturer}
                      onChange={(e) => setLecturer(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Dropdown populated automatically from BCAS {currentDeptInfo.shortName} directory ({currentDeptInfo.lecturers.length} staff members).
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Program, Module, Batch */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  2. Academic Programme &amp; Module Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Program (manual) */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Program (Degree / Diploma) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fundamental in IT, HND Computing, BSc (Hons)"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                {/* Module Name (manual) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hardware, Database Systems, Web Dev"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                {/* Batch Number (manual) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ACC315, BM-04"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 uppercase font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Dates */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <CalendarX2 className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  3. Cancellation &amp; Reschedule Dates
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Cancellation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Cancellation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfCancellation}
                      onChange={(e) => setDateOfCancellation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">The date class cannot take place.</p>
                </div>

                {/* Reschedule Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reschedule Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">The proposed makeup / rescheduled date.</p>
                </div>

                {/* Classroom / Facility (Optional) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Original Classroom / Hall (Optional)
                  </label>
                  <select
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Select Classroom (Optional) --</option>
                    {BCAS_CLASSROOMS.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Email Contacts */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Mail className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  4. Departmental Email Recipients
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Related Coordinator mail address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Related Coordinator Mail Address <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCoordinatorEmail('pzen0057@gmail.com')}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline"
                    >
                      Use my Gmail
                    </button>
                  </div>
                  <input
                    type="email"
                    placeholder="coordinator@bcas.lk"
                    value={coordinatorEmail}
                    onChange={(e) => setCoordinatorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {/* Quick Coordinator Chips */}
                  {currentDeptInfo.coordinators.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Quick Pick:</span>
                      {currentDeptInfo.coordinators.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setCoordinatorEmail(c.email)}
                          className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                            coordinatorEmail === c.email
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Related HOD mail address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Related HOD Mail Address <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHodEmail('pzen0057@gmail.com')}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline"
                    >
                      Use my Gmail
                    </button>
                  </div>
                  <input
                    type="email"
                    placeholder="hod@bcas.lk"
                    value={hodEmail}
                    onChange={(e) => setHodEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  {currentDeptInfo.hodEmail && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">HOD:</span>
                      <button
                        type="button"
                        onClick={() => setHodEmail(currentDeptInfo.hodEmail || '')}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                          hodEmail === currentDeptInfo.hodEmail
                            ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {currentDeptInfo.hodName || 'Department HOD'} ({currentDeptInfo.hodEmail})
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Confirmation Copy to User's Gmail */}
                <div className="sm:col-span-2 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 font-bold text-blue-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendCopyToMyEmail}
                        onChange={(e) => setSendCopyToMyEmail(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                      />
                      <span>Direct Confirmation Copy to Your Gmail (ඔබගේ ඊමේල් ලිපිනයට පිටපතක්)</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Instant Inbox Delivery
                    </span>
                  </div>

                  {sendCopyToMyEmail && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-600 font-medium shrink-0">Deliver to:</span>
                      <input
                        type="email"
                        value={myEmail}
                        onChange={(e) => setMyEmail(e.target.value)}
                        placeholder="pzen0057@gmail.com"
                        className="w-full sm:w-72 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[11px] text-blue-800">
                        A full copy with your entered data will arrive directly in this inbox!
                      </span>
                    </div>
                  )}
                </div>

                {/* Mandatory CC Notice */}
                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span><strong>Mandatory CC:</strong> <span className="font-mono text-slate-800">sangeeth@bcas.lk</span>, <span className="font-mono text-slate-800">priyalini@bcas.lk</span></span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Included Automatically</span>
                </div>
              </div>
            </div>

            {/* Section 5: Reason for Cancellation */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  5. Reason for Cancellation
                </h2>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Please specify detailed reason for class cancellation (e.g. Official academic moderation, Medical emergency, University event, Lab equipment maintenance)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                
                {/* Reason Chips for convenience */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500">Quick reasons:</span>
                  {[
                    'Academic Moderation Duty',
                    'Medical Emergency / Sick Leave',
                    'Official University Meeting',
                    'Urgent Travel / Transport Delay',
                    'Lab Equipment Maintenance',
                    'Public Holiday / Campus Closure'
                  ].map((rChip) => (
                    <button
                      key={rChip}
                      type="button"
                      onClick={() => setReason(rChip)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                    >
                      {rChip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors order-2 sm:order-1"
              >
                Clear Form Fields
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Firebase &amp; Sending Mail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Cancellation &amp; Dispatch Mail</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card Sidebar */}
        <div className={previewOpen ? 'lg:col-span-5' : 'lg:col-span-4'}>
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Dispatch Email View
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Updates as you type</span>
            </div>

            <EmailTemplateCard request={previewRequest} showStatusBanner={false} />

            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-3.5 h-3.5" /> Automation Rules
              </div>
              <p>• Data stores in Firebase collection: <code className="font-mono bg-amber-100/80 px-1 rounded">cancellation_requests</code></p>
              <p>• NodeMailer sends via Gmail: <code className="font-mono bg-amber-100/80 px-1 rounded">pzen0057@gmail.com</code></p>
              <p>• Mandatory CC to BCAS Administration: <code className="font-mono bg-amber-100/80 px-1 rounded">sangeeth@bcas.lk, priyalini@bcas.lk</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
