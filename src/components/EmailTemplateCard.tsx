import React from 'react';
import { Mail, CheckCircle2, Clock, Send, ShieldAlert } from 'lucide-react';
import { CancellationRequest } from '../types';

interface EmailTemplateCardProps {
  request: Partial<CancellationRequest>;
  title?: string;
  showStatusBanner?: boolean;
}

export const EmailTemplateCard: React.FC<EmailTemplateCardProps> = ({
  request,
  title = 'Email Preview (Automated NodeMailer Dispatch)',
  showStatusBanner = true
}) => {
  const formattedDate = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-white">
          <Mail className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        </div>
        {showStatusBanner && (
          <div className="flex items-center space-x-1.5 text-xs">
            {request.emailStatus === 'Sent' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sent to Department
              </span>
            ) : request.emailStatus === 'Failed' ? (
              <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" /> Delivery Pending / Check SMTP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                <Clock className="w-3.5 h-3.5" /> Dispatched on Submit
              </span>
            )}
          </div>
        )}
      </div>

      {/* Email metadata banner */}
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="flex items-start">
          <span className="w-16 font-semibold text-slate-500">To:</span>
          <span className="font-mono text-slate-800 break-all">
            {request.coordinatorEmail || '(Coordinator Email)'}
            {request.hodEmail ? `, ${request.hodEmail}` : ''}
          </span>
        </div>
        <div className="flex items-start">
          <span className="w-16 font-semibold text-slate-500">CC:</span>
          <span className="font-mono text-slate-700">sangeeth@bcas.lk, priyalini@bcas.lk</span>
        </div>
        <div className="flex items-start">
          <span className="w-16 font-semibold text-slate-500">From:</span>
          <span className="text-slate-700 font-medium">BCAS Automation &lt;pzen0057@gmail.com&gt;</span>
        </div>
        <div className="flex items-start">
          <span className="w-16 font-semibold text-slate-500">Subject:</span>
          <span className="text-slate-900 font-semibold">
            Class cancellation Approval Request to Coordinator - {request.module || '[Module]'} ({request.batch || '[Batch]'})
          </span>
        </div>
      </div>

      {/* Main Email Body - Exact replica of the reference screenshot */}
      <div className="p-6 text-slate-800 leading-relaxed text-sm bg-white">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Class cancellation Approval Request to Coordinator
        </h2>

        <div className="text-xs text-slate-600 mb-4 pb-2 border-b border-slate-100">
          <p>
            Requested by <strong className="text-slate-900">BCAS Automation</strong> &lt;
            <span className="text-blue-600 hover:underline">automation@bcas.lk</span>&gt;
          </p>
          <p className="mt-1">
            <span className="text-slate-500">Date Created</span> &nbsp;{formattedDate}
          </p>
        </div>

        <p className="mb-2">Dear Coordinator,</p>
        <p className="mb-4">Please to request for a class cancellation. Details as follows;</p>

        <div className="space-y-1.5 my-4 bg-slate-50/70 p-4 rounded-lg border border-slate-100">
          <div className="flex">
            <span className="w-44 font-semibold text-slate-700">School :</span>
            <span className="text-slate-900 font-medium">{request.department || 'Department of Computing'}</span>
          </div>
          <div className="flex">
            <span className="w-44 font-semibold text-slate-700">Program :</span>
            <span className="text-slate-900">{request.program || 'Fundamental in IT'}</span>
          </div>
          <div className="flex">
            <span className="w-44 font-semibold text-slate-700">Module :</span>
            <span className="text-slate-900">{request.module || 'Hardware'}</span>
          </div>

          <div className="h-2"></div>

          <div className="flex">
            <span className="w-44 font-semibold text-slate-700">Batch :</span>
            <span className="text-slate-900 font-semibold">{request.batch || 'ACC315'}</span>
          </div>
          <div className="flex">
            <span className="w-44 font-semibold text-slate-700">Lecturer :</span>
            <span className="text-slate-900">{request.lecturer || 'Anis Test'}</span>
          </div>
          {request.classroom && (
            <div className="flex">
              <span className="w-44 font-semibold text-slate-700">Classroom :</span>
              <span className="text-slate-900">{request.classroom}</span>
            </div>
          )}

          <div className="h-2"></div>

          <div className="flex items-center">
            <span className="w-44 font-semibold text-slate-700">Date of Cancellation :</span>
            <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-sm">
              {request.dateOfCancellation || '2024-08-30'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-44 font-semibold text-slate-700">Reschedule Date :</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-sm">
              {request.rescheduleDate || '2024-08-31'}
            </span>
          </div>
        </div>

        {request.reason && (
          <div className="mt-4 p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-lg">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
              Reason for Cancellation
            </div>
            <div className="text-slate-800 text-sm whitespace-pre-line">{request.reason}</div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Automated dispatch via NodeMailer</span>
          <span className="font-mono text-slate-400">BCAS Campus System</span>
        </div>
      </div>
    </div>
  );
};
