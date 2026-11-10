import * as XLSX from 'xlsx';
import { CancellationRequest } from '../types';

export function exportMonthlyReportToExcel(
  requests: CancellationRequest[],
  selectedMonth: string = 'All-Months'
) {
  // 1. Calculate Summary Metrics
  const total = requests.length;
  const rescheduled = requests.filter(r => r.status === 'Rescheduled' || (r.rescheduleDate && r.rescheduleDate.trim() !== '')).length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const approved = requests.filter(r => r.status === 'Approved').length;
  const emailsSent = requests.filter(r => r.emailStatus === 'Sent').length;

  // Department counts
  const deptCounts: Record<string, { total: number; rescheduled: number; pending: number }> = {};
  requests.forEach(r => {
    const dept = r.department || 'Unknown';
    if (!deptCounts[dept]) {
      deptCounts[dept] = { total: 0, rescheduled: 0, pending: 0 };
    }
    deptCounts[dept].total += 1;
    if (r.rescheduleDate && r.rescheduleDate.trim() !== '') {
      deptCounts[dept].rescheduled += 1;
    }
    if (r.status === 'Pending') {
      deptCounts[dept].pending += 1;
    }
  });

  // Build Sheet 1: Summary Data
  const summaryRows = [
    ['BCAS CAMPUS - ACADEMIC OPERATIONS'],
    ['MONTHLY CLASS CANCELLATION & RESCHEDULE REPORT'],
    ['Generated On:', new Date().toLocaleString()],
    ['Selected Period:', selectedMonth],
    [],
    ['EXECUTIVE SUMMARY METRICS', ''],
    ['Total Class Cancellation Requests', total],
    ['Total Rescheduled Classes Arranged', rescheduled],
    ['Pending Class Arrangements', pending],
    ['Approved Cancellations', approved],
    ['Automated Emails Dispatched Successfully', emailsSent],
    [],
    ['DEPARTMENT-WISE BREAKDOWN', '', '', ''],
    ['Department Name', 'Total Cancellations', 'Rescheduled', 'Pending Action'],
    ...Object.entries(deptCounts).map(([dept, c]) => [
      dept,
      c.total,
      c.rescheduled,
      c.pending
    ])
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

  // Set column widths for summary
  wsSummary['!cols'] = [
    { wch: 45 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 }
  ];

  // Build Sheet 2: Detailed Request Records
  const detailHeaders = [
    'Request ID',
    'Date Created',
    'Department',
    'Program',
    'Module',
    'Batch Code',
    'Lecturer Name',
    'Date of Cancellation',
    'Reschedule Date',
    'Classroom / Hall',
    'Reason for Cancellation',
    'Coordinator Email',
    'HOD Email',
    'Email Status',
    'Workflow Status'
  ];

  const detailRows = requests.map(r => [
    r.id,
    new Date(r.createdAt).toLocaleString(),
    r.department,
    r.program,
    r.module,
    r.batch,
    r.lecturer,
    r.dateOfCancellation,
    r.rescheduleDate || 'Pending / TBA',
    r.classroom || 'Not specified',
    r.reason,
    r.coordinatorEmail,
    r.hodEmail,
    r.emailStatus || 'Pending',
    r.status || 'Pending'
  ]);

  const wsDetails = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);

  // Set column widths for details
  wsDetails['!cols'] = [
    { wch: 18 }, // ID
    { wch: 22 }, // Date Created
    { wch: 35 }, // Dept
    { wch: 26 }, // Program
    { wch: 22 }, // Module
    { wch: 14 }, // Batch
    { wch: 24 }, // Lecturer
    { wch: 18 }, // Cancel Date
    { wch: 18 }, // Resched Date
    { wch: 20 }, // Classroom
    { wch: 45 }, // Reason
    { wch: 26 }, // Coord email
    { wch: 26 }, // HOD email
    { wch: 14 }, // Email status
    { wch: 16 }  // Status
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Overview');
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Detailed Cancellations');

  // Trigger download
  const cleanPeriod = selectedMonth.replace(/\s+/g, '_');
  const filename = `BCAS_Class_Cancellations_${cleanPeriod}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
