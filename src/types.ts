export interface CancellationRequest {
  id: string;
  department: string;
  program: string;
  module: string;
  batch: string;
  lecturer: string;
  lecturerCode?: string;
  dateOfCancellation: string;
  rescheduleDate: string;
  coordinatorEmail: string;
  hodEmail: string;
  reason: string;
  classroom?: string;
  status: 'Pending' | 'Approved' | 'Rescheduled' | 'Cancelled';
  emailStatus: 'Pending' | 'Sent' | 'Failed';
  emailError?: string;
  emailMessageId?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt?: string;
  submittedBy?: string;
}

export interface EmailDispatchPayload {
  requestId?: string;
  department: string;
  program: string;
  module: string;
  batch: string;
  lecturer: string;
  dateOfCancellation: string;
  rescheduleDate: string;
  coordinatorEmail: string;
  hodEmail: string;
  reason: string;
  classroom?: string;
}
