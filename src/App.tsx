/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CancellationForm } from './components/CancellationForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AcademicDirectoryView } from './components/AcademicDirectoryView';
import { CancellationRequest } from './types';
import { fetchCancellationRequests, createCancellationRequest } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'admin' | 'directory'>('form');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Check stored admin session
  useEffect(() => {
    const isAuth = localStorage.getItem('bcas_admin_auth') === 'true';
    setIsAdmin(isAuth);
  }, []);

  // Fetch all cancellations on mount
  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchCancellationRequests();
      setRequests(data);
    } catch (err) {
      console.warn('Could not load cancellations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Populate sample proposals including the one from the user's attachment screenshot
  const handleAddDemoData = async () => {
    const sample1: CancellationRequest = {
      id: 'REQ-2024-082901',
      department: 'Department of Computing',
      program: 'Fundamental in IT',
      module: 'Hardware',
      batch: 'ACC315',
      lecturer: 'Mr. Anis',
      dateOfCancellation: '2024-08-30',
      rescheduleDate: '2024-08-31',
      coordinatorEmail: 'email9@bcas.lk',
      hodEmail: 'email5@bcas.lk',
      classroom: 'TECH 001 (30)',
      reason: 'Urgent departmental coordination meeting and hardware practical lab setup.',
      status: 'Rescheduled',
      emailStatus: 'Sent',
      createdAt: '2024-08-29T14:23:00.000Z'
    };

    const sample2: CancellationRequest = {
      id: 'REQ-2026-110202',
      department: 'Department of Business Management',
      program: 'BSc (Hons) Business Administration',
      module: 'Financial Management',
      batch: 'BM2024',
      lecturer: 'Dr. Chethana',
      dateOfCancellation: '2026-11-12',
      rescheduleDate: '2026-11-15',
      coordinatorEmail: 'email18@bcas.lk',
      hodEmail: 'chathana@bcas.lk',
      classroom: 'WEST 102 (40)',
      reason: 'Official university accreditation audit panel session.',
      status: 'Pending',
      emailStatus: 'Sent',
      createdAt: '2026-11-10T08:30:00.000Z'
    };

    const sample3: CancellationRequest = {
      id: 'REQ-2026-110503',
      department: 'Department of Construction & Built Environment',
      program: 'Higher National Diploma in Quantity Surveying',
      module: 'Measurement & Estimating',
      batch: 'QS-42',
      lecturer: 'Mr. Kithsiri',
      dateOfCancellation: '2026-11-18',
      rescheduleDate: '2026-11-20',
      coordinatorEmail: 'hasara@bcas.lk',
      hodEmail: 'email32@bcas.lk',
      classroom: 'CIVIL LAB BASE 001 [20]',
      reason: 'Construction site surveying field practical assessment.',
      status: 'Approved',
      emailStatus: 'Sent',
      createdAt: '2026-11-08T10:15:00.000Z'
    };

    await createCancellationRequest(sample1);
    await createCancellationRequest(sample2);
    await createCancellationRequest(sample3);
    await loadRequests();
  };

  const handleLogout = () => {
    localStorage.removeItem('bcas_admin_auth');
    setIsAdmin(false);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onAdminClick={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        requestsCount={requests.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'form' && (
          <CancellationForm
            onSuccess={(newReq) => {
              setRequests(prev => [newReq, ...prev.filter(r => r.id !== newReq.id)]);
            }}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              requests={requests}
              onRefresh={loadRequests}
              onAddDemoData={handleAddDemoData}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-lg font-bold text-slate-900">Authentication Required</h2>
              <p className="text-xs text-slate-500 mt-2 mb-6">
                Please sign in with administrator credentials (user: <span className="font-mono font-bold">admin</span>) to view cancellation records and export monthly Excel reports.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}

        {activeTab === 'directory' && (
          <AcademicDirectoryView
            onSelectLecturer={(deptName, lecturerName) => {
              setActiveTab('form');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">BCAS Campus</span>
            <span>• Academic Operations &amp; Class Scheduling Automation</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-500">
            <span>Admin: <strong className="text-slate-400 font-mono">admin</strong></span>
            <span>• NodeMailer Service: <strong className="text-slate-400 font-mono">pzen0057@gmail.com</strong></span>
            <span>• CC: sangeeth@bcas.lk, priyalini@bcas.lk</span>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />
    </div>
  );
}
