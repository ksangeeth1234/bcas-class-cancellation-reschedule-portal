import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Building2,
  Mail,
  UserCheck,
  Crown,
  Star,
  Award,
  ChevronRight,
  Send,
  DoorOpen
} from 'lucide-react';
import { BCAS_DEPARTMENTS, BCAS_CLASSROOMS, Lecturer } from '../data/bcasDirectory';

interface AcademicDirectoryViewProps {
  onSelectLecturer?: (deptName: string, lecturerName: string, coordEmail?: string, hodEmail?: string) => void;
}

export const AcademicDirectoryView: React.FC<AcademicDirectoryViewProps> = ({
  onSelectLecturer
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'facilities'>('staff');

  const filteredDepts = BCAS_DEPARTMENTS.filter(dept => {
    if (selectedDeptId !== 'all' && dept.id !== selectedDeptId) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Directory Title */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>BCAS Campus Master Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Academic Staff &amp; Department Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative reference of all 10 academic faculties, departmental leaders (HOD, Deputy HOD, Course Coordinators), permanent internal &amp; visiting faculty, and campus classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Academic Staff (89)
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'facilities'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Classrooms &amp; Labs (39)
          </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <>
          {/* Department Filter & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedDeptId('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  selectedDeptId === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Departments
              </button>
              {BCAS_DEPARTMENTS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptId(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                    selectedDeptId === d.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d.shortName}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search lecturer, staff code, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Departments & Faculty Cards */}
          <div className="space-y-6">
            {filteredDepts.map((dept) => {
              const matchedLecturers = dept.lecturers.filter(l => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  l.name.toLowerCase().includes(q) ||
                  l.code.toLowerCase().includes(q) ||
                  l.email.toLowerCase().includes(q) ||
                  l.designation.toLowerCase().includes(q)
                );
              });

              if (searchQuery.trim() && matchedLecturers.length === 0) return null;

              return (
                <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Department Banner */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-amber-400" />
                        <h2 className="text-base font-bold text-white">{dept.name}</h2>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-4">
                        {dept.hodName && (
                          <span>👑 <strong>HOD:</strong> {dept.hodName} ({dept.hodEmail})</span>
                        )}
                        {dept.deputyHodName && (
                          <span>⭐ <strong>Deputy HOD:</strong> {dept.deputyHodName}</span>
                        )}
                        <span>👥 <strong>Total Staff:</strong> {dept.lecturers.length}</span>
                      </div>
                    </div>

                    {dept.coordinators.length > 0 && (
                      <div className="text-xs bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/80">
                        <span className="text-amber-400 font-bold block mb-0.5">🎖️ Course Coordinators:</span>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                          {dept.coordinators.map(c => (
                            <span key={c.code} className="font-medium">
                              {c.name} &lt;{c.email}&gt;
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Staff Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-4 w-24">Staff Code</th>
                          <th className="py-2.5 px-4">Lecturer Name</th>
                          <th className="py-2.5 px-4">Designation &amp; Role</th>
                          <th className="py-2.5 px-4">Faculty Type</th>
                          <th className="py-2.5 px-4">Official Email</th>
                          <th className="py-2.5 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedLecturers.map((lec) => (
                          <tr key={lec.code} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                              {lec.code}
                            </td>

                            <td className="py-2.5 px-4">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {lec.isHod && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                {lec.isDeputyHod && <Star className="w-3.5 h-3.5 text-blue-500" />}
                                {lec.isCoordinator && <Award className="w-3.5 h-3.5 text-emerald-500" />}
                                <span>{lec.name}</span>
                              </div>
                            </td>

                            <td className="py-2.5 px-4 text-slate-600">
                              {lec.designation}
                            </td>

                            <td className="py-2.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  lec.type === 'Internal'
                                    ? 'bg-slate-100 text-slate-800'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {lec.type === 'Internal' ? '🏛️ Internal' : '✈️ Visiting'}
                              </span>
                            </td>

                            <td className="py-2.5 px-4 font-mono text-slate-600">
                              <a
                                href={`mailto:${lec.email}`}
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3 text-slate-400" />
                                {lec.email}
                              </a>
                            </td>

                            <td className="py-2.5 px-4 text-right">
                              {onSelectLecturer && (
                                <button
                                  onClick={() =>
                                    onSelectLecturer(
                                      dept.name,
                                      lec.name,
                                      dept.coordinators[0]?.email,
                                      dept.hodEmail
                                    )
                                  }
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200 text-[11px] transition-colors"
                                >
                                  Cancel Lecture →
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Campus Classrooms & Facilities */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <DoorOpen className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              BCAS Campus Teaching Facilities &amp; Classrooms (39 Locations)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {BCAS_CLASSROOMS.map((room, idx) => (
              <div
                key={room}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between"
              >
                <span>{room}</span>
                <span className="text-[10px] text-slate-400 font-mono">CR-{String(idx + 1).padStart(3, '0')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
