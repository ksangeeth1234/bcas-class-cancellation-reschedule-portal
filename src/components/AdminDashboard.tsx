import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  ShieldCheck,
  Building2,
  FileText,
  KeyRound,
  ExternalLink,
  SlidersHorizontal,
  Info,
  SendHorizontal
} from 'lucide-react';
import { CancellationRequest } from '../types';
import { BCAS_DEPARTMENTS } from '../data/bcasDirectory';
import { exportMonthlyReportToExcel } from '../utils/excelExport';
import {
  updateCancellationStatus,
  deleteCancellationRequest,
  sendCancellationEmail,
  verifySmtpConnection,
  getSmtpConfig,
  updateSmtpConfig
} from '../services/api';
import { EmailTemplateCard } from './EmailTemplateCard';

interface AdminDashboardProps {
  requests: CancellationRequest[];
  onRefresh: () => void;
  onAddDemoData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  onRefresh,
  onAddDemoData
}) => {
  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Inspection
  const [inspectRequest, setInspectRequest] = useState<CancellationRequest | null>(null);
  const [deleteConfirmReq, setDeleteConfirmReq] = useState<CancellationRequest | null>(null);
  const [forwardReq, setForwardReq] = useState<CancellationRequest | null>(null);
  const [forwardRecipientEmail, setForwardRecipientEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // SMTP Settings State
  const [smtpUser, setSmtpUser] = useState('pzen0057@gmail.com');
  const [smtpPassInput, setSmtpPassInput] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'live' | 'simulated'>('live');
  const [autoFallback, setAutoFallback] = useState(true);
  const [hasStoredPass, setHasStoredPass] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // SMTP Testing State
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpResult, setSmtpResult] = useState<{
    success?: boolean;
    message?: string;
    isBadCredentials?: boolean;
    tip?: string;
    simulated?: boolean;
  } | null>(null);

  const [testEmailAddress, setTestEmailAddress] = useState('pzen0057@gmail.com');
  const [testSending, setTestSending] = useState(false);

  // Load SMTP config on mount
  useEffect(() => {
    getSmtpConfig()
      .then(res => {
        if (res.success) {
          setSmtpUser(res.user);
          setDeliveryMode(res.mode);
          setAutoFallback(res.autoFallback);
          setHasStoredPass(res.hasPass);
        }
      })
      .catch(err => console.warn('Could not load SMTP config:', err));
  }, []);

  // Extract distinct months from the requests list
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    requests.forEach(r => {
      const d = r.dateOfCancellation || r.createdAt;
      if (d) {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) {
          const monthStr = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          monthsSet.add(monthStr);
        }
      }
    });
    return Array.from(monthsSet);
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Month filter
      if (selectedMonth !== 'ALL') {
        const d = r.dateOfCancellation || r.createdAt;
        if (d) {
          const monthStr = new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          if (monthStr !== selectedMonth) return false;
        }
      }

      // Department filter
      if (selectedDepartment !== 'ALL' && r.department !== selectedDepartment) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.batch.toLowerCase().includes(q) ||
          r.module.toLowerCase().includes(q) ||
          r.lecturer.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [requests, selectedMonth, selectedDepartment, selectedStatus, searchQuery]);

  // Summary Metrics for the filtered slice
  const metrics = useMemo(() => {
    const total = filteredRequests.length;
    const rescheduled = filteredRequests.filter(r => r.status === 'Rescheduled' || (r.rescheduleDate && r.rescheduleDate.trim() !== '')).length;
    const pending = filteredRequests.filter(r => r.status === 'Pending').length;
    const approved = filteredRequests.filter(r => r.status === 'Approved').length;
    const emailsSent = filteredRequests.filter(r => r.emailStatus === 'Sent').length;
    const rescheduleRate = total > 0 ? Math.round((rescheduled / total) * 100) : 0;
    return { total, rescheduled, pending, approved, emailsSent, rescheduleRate };
  }, [filteredRequests]);

  // Handle Excel Export
  const handleDownloadExcel = () => {
    setIsExporting(true);
    try {
      const periodLabel = selectedMonth === 'ALL' ? 'All-Time-Summary' : selectedMonth;
      exportMonthlyReportToExcel(filteredRequests, periodLabel);
      setStatusMessage({
        type: 'success',
        text: `Monthly Excel report exported successfully (${filteredRequests.length} records included).`
      });
    } catch (e: any) {
      console.error('Excel export error:', e);
      setStatusMessage({ type: 'error', text: 'Failed to generate Excel file: ' + e?.message });
    } finally {
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  // Status Change
  const handleStatusChange = async (id: string, newStatus: CancellationRequest['status']) => {
    try {
      await updateCancellationStatus(id, { status: newStatus });
      onRefresh();
      setStatusMessage({ type: 'success', text: `Status updated to ${newStatus}` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Status update failed: ' + err.message });
    }
  };

  // Resend Email via NodeMailer
  const handleResendEmail = async (req: CancellationRequest, customRecipient?: string) => {
    setResendingId(req.id);
    try {
      const targetCoordEmail = customRecipient || req.coordinatorEmail;
      const res = await sendCancellationEmail({
        requestId: req.id,
        department: req.department,
        program: req.program,
        module: req.module,
        batch: req.batch,
        lecturer: req.lecturer,
        dateOfCancellation: req.dateOfCancellation,
        rescheduleDate: req.rescheduleDate,
        coordinatorEmail: targetCoordEmail,
        hodEmail: req.hodEmail,
        reason: req.reason,
        classroom: req.classroom
      });

      if (res.success) {
        await updateCancellationStatus(req.id, {
          emailStatus: 'Sent',
          emailMessageId: res.messageId,
          emailError: undefined
        });
        setStatusMessage({
          type: 'success',
          text: `Notification email dispatched to ${targetCoordEmail} (CC: sangeeth@bcas.lk, priyalini@bcas.lk)!`
        });
      } else {
        await updateCancellationStatus(req.id, {
          emailStatus: 'Failed',
          emailError: res.error
        });
        setStatusMessage({ type: 'error', text: `Email dispatch failed: ${res.error}` });
      }
      onRefresh();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Error dispatching email: ' + e.message });
    } finally {
      setResendingId(null);
      setForwardReq(null);
    }
  };

  // Safe In-App Delete Handler (replacing blocked window.confirm)
  const executeDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteCancellationRequest(id);
      setDeleteConfirmReq(null);
      onRefresh();
      setStatusMessage({ type: 'success', text: `Request ${id} deleted successfully.` });
    } catch (err: any) {
      console.error('Delete error:', err);
      setStatusMessage({ type: 'error', text: 'Delete failed: ' + (err?.message || 'Error deleting request') });
    } finally {
      setIsDeleting(false);
    }
  };

  // Test SMTP connection
  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    setSmtpResult(null);
    try {
      const res = await verifySmtpConnection();
      setSmtpResult(res);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message || 'SMTP verified!' });
      } else if (res.isBadCredentials) {
        setStatusMessage({
          type: 'warning',
          text: 'Google rejected password (535 Bad Credentials). Ensure you are using the 16-character App Password.'
        });
      }
    } catch (err: any) {
      setSmtpResult({ success: false, message: err.message });
    } finally {
      setSmtpTesting(false);
    }
  };

  // Save App Password & Update Delivery Settings
  const handleSaveSmtpSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await updateSmtpConfig({
        user: smtpUser,
        pass: smtpPassInput ? smtpPassInput.trim() : undefined,
        mode: deliveryMode,
        autoFallback
      });
      if (res.success) {
        setHasStoredPass(true);
        setStatusMessage({ type: 'success', text: 'SMTP Delivery settings updated successfully!' });
        if (smtpPassInput) {
          handleTestSmtp();
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to save SMTP settings: ' + err.message });
    } finally {
      setSavingConfig(false);
    }
  };

  // Send single test email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return;
    setTestSending(true);
    try {
      const res = await sendCancellationEmail({
        department: 'Department of Computing',
        program: 'System Verification Test',
        module: 'Live Delivery Diagnostics',
        batch: 'VERIFY-2026',
        lecturer: 'Administrator',
        dateOfCancellation: new Date().toISOString().slice(0, 10),
        rescheduleDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        coordinatorEmail: testEmailAddress,
        hodEmail: 'automation@bcas.lk',
        reason: 'Live test email to verify that incoming emails arrive in the recipient mailbox.'
      });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Test email sent to ${testEmailAddress}! (Please check Sent folder if sending to self, or Spam/Junk)`
        });
      } else {
        setStatusMessage({ type: 'error', text: `Test email failed: ${res.error}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Test send error: ' + err.message });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Cancellation &amp; Reschedule Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate monthly reports, manage lecture rescheduling workflows, and monitor email dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {requests.length === 0 && (
            <button
              onClick={onAddDemoData}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors"
            >
              + Populate Sample Records
            </button>
          )}

          {/* Download Monthly Excel Report */}
          <button
            onClick={handleDownloadExcel}
            disabled={isExporting || filteredRequests.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Download Monthly Excel Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:text-slate-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Cancellations</span>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">{metrics.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">In selected period</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Rescheduled Classes</span>
          <div className="text-3xl font-black text-blue-700 mt-2 font-mono">{metrics.rescheduled}</div>
          <p className="text-[11px] text-blue-500/80 mt-1">{metrics.rescheduleRate}% arrangement rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Action</span>
          <div className="text-3xl font-black text-amber-600 mt-2 font-mono">{metrics.pending}</div>
          <p className="text-[11px] text-amber-700/80 mt-1">Awaiting coordinator</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved Requests</span>
          <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">{metrics.approved}</div>
          <p className="text-[11px] text-emerald-700/80 mt-1">Formally signed off</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Emails Dispatched</span>
          <div className="text-3xl font-black text-purple-700 mt-2 font-mono">{metrics.emailsSent}</div>
          <p className="text-[11px] text-purple-600/80 mt-1">Live NodeMailer</p>
        </div>
      </div>

      {/* Live Email Delivery & Verification Diagnostics Box */}
      <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-5 text-amber-950 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="font-bold text-sm text-amber-950">
              Why an email might not appear in your Primary Inbox (ඊමේල් නොපෙනීමට හේතු):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <strong className="block text-slate-900 mb-1">1. Check Gmail "Sent" folder:</strong>
                <span>
                  When sending from <code className="font-mono bg-amber-100 px-1 rounded">pzen0057@gmail.com</code> to itself, Gmail does <strong>not</strong> create a new unread inbox thread; it places the email in your <strong>Sent</strong> and <strong>All Mail</strong> folders.
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <strong className="block text-slate-900 mb-1">2. Check Spam / Junk:</strong>
                <span>
                  Automated emails sent for the first time often land in the <strong>Spam / Junk</strong> folder of external mailboxes. Check Spam and click "Report not spam".
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <strong className="block text-slate-900 mb-1">3. Test with your personal email:</strong>
                <span>
                  Use the <strong>"Trigger Test Mail"</strong> box below or the <strong>"Send to My Email"</strong> button on any record table row to send a live copy directly to an email inbox you can open right now!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google App Password & NodeMailer Setup Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl border border-slate-800 text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <KeyRound className="w-4 h-4" />
              <span>Email Dispatch Engine &amp; Google App Password Configuration</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              SMTP Delivery Settings (Gmail: {smtpUser})
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Google App Password is configured (<span className="font-mono text-emerald-400 font-bold">gocf ggyz nhaj vpuy</span>). Automated dispatches are routed directly through Google Gmail SMTP with mandatory CC to <strong className="text-amber-300 font-mono">sangeeth@bcas.lk</strong> and <strong className="text-amber-300 font-mono">priyalini@bcas.lk</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gmail SMTP Active
            </span>
          </div>
        </div>

        {/* Quick Test Email Trigger */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3 text-xs">
          <span className="text-slate-300 font-bold shrink-0">Send Live Test Email To:</span>
          <input
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            placeholder="your-personal-email@domain.com"
            className="w-full sm:w-80 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={testSending}
            className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {testSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Trigger Test Mail Now</span>
          </button>

          <button
            onClick={handleTestSmtp}
            disabled={smtpTesting}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {smtpTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Verify SMTP Handshake</span>
          </button>
        </div>

        {/* Live SMTP verification result banner */}
        {smtpResult && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs ${
              smtpResult.success
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                : 'bg-amber-950/70 border-amber-800 text-amber-200'
            }`}
          >
            <div className="font-bold flex items-center gap-2">
              {smtpResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
              <span>{smtpResult.message}</span>
            </div>
            {smtpResult.tip && (
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">{smtpResult.tip}</p>
            )}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-amber-600" />
          <span>Filters &amp; Search</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Monthly Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Filter by Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Available Months ({requests.length} records)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Departments</option>
              {BCAS_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Workflow Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Batch, Lecturer, Module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong>{filteredRequests.length}</strong> of {requests.length} requests
            {selectedMonth !== 'ALL' && <span> in <strong className="text-slate-800">{selectedMonth}</strong></span>}
          </span>
          {(selectedMonth !== 'ALL' || selectedDepartment !== 'ALL' || selectedStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedMonth('ALL');
                setSelectedDepartment('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="text-amber-700 hover:text-amber-800 font-semibold underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Records Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Cancellation &amp; Reschedule Requests Ledger
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredRequests.length} record(s) matching
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Cancellation Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no lecture cancellation records matching the selected period and filters.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={onAddDemoData}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
              >
                Insert Sample Proposals
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Department &amp; Program</th>
                  <th className="py-3 px-4">Module &amp; Batch</th>
                  <th className="py-3 px-4">Lecturer</th>
                  <th className="py-3 px-4">Cancellation Date</th>
                  <th className="py-3 px-4">Reschedule Date</th>
                  <th className="py-3 px-4">Email Dispatch</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {r.id}
                      <div className="text-[10px] font-normal text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <div className="font-bold text-slate-900 truncate" title={r.department}>
                        {r.department}
                      </div>
                      <div className="text-slate-500 truncate" title={r.program}>
                        {r.program}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.module}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-800">
                        {r.batch}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{r.lecturer}</div>
                      {r.classroom && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <span>🏛️</span> {r.classroom}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {r.dateOfCancellation}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {r.rescheduleDate ? (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {r.rescheduleDate}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sent
                        </span>
                        <button
                          onClick={() => {
                            setForwardReq(r);
                            setForwardRecipientEmail('');
                          }}
                          title="Forward copy to your email"
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                        >
                          Forward →
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                          r.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : r.status === 'Rescheduled'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : r.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setInspectRequest(r)}
                          title="View Request & Email Replica"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleResendEmail(r)}
                          disabled={resendingId === r.id}
                          title="Resend Notification Email"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {resendingId === r.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </button>

                        {/* Interactive In-App Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmReq(r)}
                          title="Delete Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-App Delete Confirmation Modal (Guaranteed to work in iframe without blocked window.confirm) */}
      {deleteConfirmReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Cancellation Request</h3>
                <p className="text-xs text-slate-500 font-mono">{deleteConfirmReq.id}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the cancellation request for{' '}
              <strong className="text-slate-900">{deleteConfirmReq.module}</strong> (Batch:{' '}
              <span className="font-mono font-bold text-slate-900">{deleteConfirmReq.batch}</span>, Lecturer:{' '}
              <strong className="text-slate-900">{deleteConfirmReq.lecturer}</strong>)? This record will be removed from both Firebase and the server.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmReq(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDelete(deleteConfirmReq.id)}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Delete Request</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward to Personal Email Modal */}
      {forwardReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <SendHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Forward Email to Your Inbox</h3>
                <p className="text-xs text-slate-500">Test live receipt on any mailbox</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                placeholder="your-email@domain.com"
                value={forwardRecipientEmail}
                onChange={(e) => setForwardRecipientEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Enter an email address you have open right now to verify receipt in your personal inbox.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setForwardReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (forwardRecipientEmail.trim()) {
                    handleResendEmail(forwardReq, forwardRecipientEmail.trim());
                  }
                }}
                disabled={!forwardRecipientEmail.trim() || resendingId === forwardReq.id}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
              >
                {resendingId === forwardReq.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {inspectRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Request Detail: {inspectRequest.id}
                </span>
              </div>
              <button
                onClick={() => setInspectRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <EmailTemplateCard request={inspectRequest} />

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleResendEmail(inspectRequest)}
                  disabled={resendingId === inspectRequest.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Resend Notification Dispatch</span>
                </button>

                <button
                  onClick={() => setInspectRequest(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
