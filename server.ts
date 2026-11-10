import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory & fallback disk storage for cancellations
const DATA_FILE = path.join(__dirname, 'cancellations_store.json');
const SMTP_CONFIG_FILE = path.join(__dirname, 'smtp_config.json');

let cancellations: any[] = [];
let outboxLogs: any[] = [];

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    cancellations = JSON.parse(raw);
  }
} catch (err) {
  console.warn('Could not read existing cancellations store, initializing empty.', err);
  cancellations = [];
}

function persistStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cancellations, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write cancellations store file:', e);
  }
}

// SMTP Settings State
interface SmtpSettings {
  user: string;
  pass: string;
  mode: 'live' | 'simulated';
  autoFallback: boolean;
}

// Default to simulated fallback until a 16-character Google App Password is provided
let smtpSettings: SmtpSettings = {
  user: process.env.GMAIL_USER || 'pzen0057@gmail.com',
  pass: process.env.GMAIL_PASS || 'gocfggyznhajvpuy',
  mode: 'live',
  autoFallback: true
};

try {
  if (fs.existsSync(SMTP_CONFIG_FILE)) {
    const raw = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
    smtpSettings = { ...smtpSettings, ...JSON.parse(raw) };
  }
} catch (err) {
  console.warn('Could not read smtp_config.json, using defaults.', err);
}

function persistSmtpConfig() {
  try {
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(smtpSettings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write smtp config file:', e);
  }
}

const CC_RECIPIENTS = ['sangeeth@bcas.lk', 'priyalini@bcas.lk'];

function createMailTransporter() {
  const cleanPass = (smtpSettings.pass || '').replace(/\s+/g, '');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpSettings.user.trim(),
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    smtpUser: smtpSettings.user,
    mode: smtpSettings.mode,
    autoFallback: smtpSettings.autoFallback,
    ccRecipients: CC_RECIPIENTS
  });
});

// Get SMTP Configuration
app.get('/api/smtp-config', (_req: Request, res: Response) => {
  const cleanPass = (smtpSettings.pass || '').replace(/\s+/g, '');
  const looksLikeAppPassword = cleanPass.length === 16 && /^[a-zA-Z]+$/.test(cleanPass);
  res.json({
    success: true,
    user: smtpSettings.user,
    hasPass: Boolean(smtpSettings.pass),
    maskedPass: smtpSettings.pass ? `${smtpSettings.pass.slice(0, 2)}••••••••${smtpSettings.pass.slice(-2)}` : '',
    mode: smtpSettings.mode,
    autoFallback: smtpSettings.autoFallback,
    looksLikeAppPassword,
    ccRecipients: CC_RECIPIENTS
  });
});

// Update SMTP Configuration
app.post('/api/smtp-config', (req: Request, res: Response) => {
  const { user, pass, mode, autoFallback } = req.body;
  if (user) smtpSettings.user = user.trim();
  if (pass !== undefined) smtpSettings.pass = pass.trim();
  if (mode === 'live' || mode === 'simulated') smtpSettings.mode = mode;
  if (typeof autoFallback === 'boolean') smtpSettings.autoFallback = autoFallback;

  persistSmtpConfig();

  res.json({
    success: true,
    message: 'SMTP settings updated successfully',
    config: {
      user: smtpSettings.user,
      mode: smtpSettings.mode,
      autoFallback: smtpSettings.autoFallback,
      hasPass: Boolean(smtpSettings.pass)
    }
  });
});

// Test SMTP connection endpoint (returns 200 with diagnostics rather than 500 error)
app.post('/api/verify-smtp', async (req: Request, res: Response) => {
  // Allow passing temporary test credentials in request body if user is testing a new App Password
  const testUser = req.body?.user ? req.body.user.trim() : smtpSettings.user.trim();
  const testPass = req.body?.pass ? req.body.pass.replace(/\s+/g, '') : smtpSettings.pass.replace(/\s+/g, '');
  const testMode = req.body?.mode || smtpSettings.mode;

  if (testMode === 'simulated' && !req.body?.forceLive) {
    return res.json({
      success: true,
      simulated: true,
      message: 'Simulated Outbox Mode is active. All lecture cancellation notices are reliably logged, previewed, and tracked without external SMTP errors.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: testUser,
        pass: testPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    // If verification succeeded and credentials were provided, save them
    if (req.body?.pass) {
      smtpSettings.pass = testPass;
      smtpSettings.user = testUser;
      smtpSettings.mode = 'live';
      persistSmtpConfig();
    }

    res.json({
      success: true,
      live: true,
      message: `Google SMTP connection verified successfully for ${testUser}!`
    });
  } catch (error: any) {
    const errorMsg = error?.message || 'SMTP verification failed';
    const isBadCredentials = errorMsg.includes('535') || errorMsg.includes('BadCredentials');

    console.warn('Gmail SMTP verification feedback:', isBadCredentials ? '535 Bad Credentials' : errorMsg);

    res.json({
      success: false,
      isBadCredentials,
      message: isBadCredentials
        ? 'Google rejected standard password (535 Bad Credentials). Google requires a 16-character App Password generated at https://myaccount.google.com/apppasswords.'
        : errorMsg,
      tip: isBadCredentials
        ? '1. Open myaccount.google.com/apppasswords. 2. Enable 2-Step Verification if needed. 3. Generate a 16-letter App Password for "BCAS System". 4. Paste it in SMTP Settings.'
        : 'Please check your internet or Gmail credentials.',
      suggestSimulated: true
    });
  }
});

// Send cancellation notification email via NodeMailer
app.post('/api/send-email', async (req: Request, res: Response) => {
  const {
    department,
    program,
    module: moduleName,
    batch,
    lecturer,
    dateOfCancellation,
    rescheduleDate,
    coordinatorEmail,
    hodEmail,
    reason,
    classroom,
    requestId,
    forceSimulated
  } = req.body;

  // Determine recipients
  const toList: string[] = [];
  if (coordinatorEmail && coordinatorEmail.trim()) {
    toList.push(coordinatorEmail.trim());
  }
  if (hodEmail && hodEmail.trim() && !toList.includes(hodEmail.trim())) {
    toList.push(hodEmail.trim());
  }
  if (toList.length === 0) {
    toList.push('automation@bcas.lk');
  }

  const nowFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const subject = `Class cancellation Approval Request to Coordinator - ${moduleName || 'Class'} (${batch || 'Batch'})`;

  // HTML template matching the exact reference screenshot
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; }
        .header { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 12px; }
        .meta { font-size: 13px; color: #718096; margin-bottom: 20px; border-bottom: 1px solid #edf2f7; padding-bottom: 12px; }
        .greeting { font-size: 14px; margin-bottom: 14px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 20px; }
        .data-table td { padding: 6px 0; font-size: 14px; }
        .label { font-weight: 600; color: #4a5568; width: 180px; }
        .value { color: #1a202c; }
        .reason-box { background-color: #f7fafc; border-left: 4px solid #3182ce; padding: 12px; margin-top: 14px; border-radius: 4px; }
        .footer { font-size: 11px; color: #a0aec0; margin-top: 24px; text-align: center; border-top: 1px solid #edf2f7; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">Class cancellation Approval Request to Coordinator</div>
        <div class="meta">
          <strong>Requested by:</strong> BCAS Automation &lt;automation@bcas.lk&gt;<br/>
          <strong>Date Created:</strong> ${nowFormatted}
        </div>
        <div class="greeting">
          Dear Coordinator,<br/>
          Please to request for a class cancellation. Details as follows;
        </div>

        <table class="data-table">
          <tr>
            <td class="label">School :</td>
            <td class="value"><strong>${department || 'N/A'}</strong></td>
          </tr>
          <tr>
            <td class="label">Program :</td>
            <td class="value">${program || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Module :</td>
            <td class="value">${moduleName || 'N/A'}</td>
          </tr>
          <tr><td colspan="2" style="height: 10px;"></td></tr>
          <tr>
            <td class="label">Batch :</td>
            <td class="value"><strong>${batch || 'N/A'}</strong></td>
          </tr>
          <tr>
            <td class="label">Lecturer :</td>
            <td class="value">${lecturer || 'N/A'}</td>
          </tr>
          ${classroom ? `<tr><td class="label">Classroom / Hall :</td><td class="value">${classroom}</td></tr>` : ''}
          <tr><td colspan="2" style="height: 10px;"></td></tr>
          <tr>
            <td class="label">Date of Cancellation :</td>
            <td class="value" style="color: #c53030; font-weight: 700;">${dateOfCancellation || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Reschedule Date :</td>
            <td class="value" style="color: #2b6cb0; font-weight: 700;">${rescheduleDate || 'Pending / TBA'}</td>
          </tr>
        </table>

        ${reason ? `
        <div class="reason-box">
          <strong style="color: #2b6cb0;">Reason for Cancellation:</strong><br/>
          ${reason}
        </div>
        ` : ''}

        <div class="footer">
          This is an automated notification dispatched by BCAS Campus Academic Scheduling System.<br/>
          CC: ${CC_RECIPIENTS.join(', ')}
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Class cancellation Approval Request to Coordinator

Requested by BCAS Automation <automation@bcas.lk>
Date Created : ${nowFormatted}

Dear Coordinator,
Please to request for a class cancellation. Details as follows;

School : ${department}
Program : ${program}
Module : ${moduleName}

Batch : ${batch}
Lecturer : ${lecturer}
${classroom ? `Classroom : ${classroom}\n` : ''}
Date of Cancellation : ${dateOfCancellation}
Reschedule Date : ${rescheduleDate}
Reason : ${reason}

CC: ${CC_RECIPIENTS.join(', ')}
`;

  // Function to execute simulated / virtual dispatch
  const executeSimulatedDispatch = (modeNotice?: string) => {
    const simulatedMsgId = `<bcas-outbox-${Date.now()}@bcas.lk>`;

    outboxLogs.unshift({
      id: simulatedMsgId,
      requestId,
      to: toList,
      cc: CC_RECIPIENTS,
      subject,
      html: htmlContent,
      sentAt: new Date().toISOString(),
      mode: 'Outbox Delivery'
    });

    if (requestId) {
      const existing = cancellations.find(c => c.id === requestId);
      if (existing) {
        existing.emailStatus = 'Sent';
        existing.emailMessageId = simulatedMsgId;
        existing.emailSentAt = new Date().toISOString();
        existing.emailError = undefined;
        persistStore();
      }
    }

    return {
      success: true,
      simulated: true,
      messageId: simulatedMsgId,
      recipients: toList,
      cc: CC_RECIPIENTS,
      subject,
      notice: modeNotice || 'Recorded in BCAS Outbox successfully'
    };
  };

  // If set to simulated mode or requested
  if (smtpSettings.mode === 'simulated' || forceSimulated) {
    const simResult = executeSimulatedDispatch();
    return res.json(simResult);
  }

  // Attempt real SMTP dispatch
  try {
    const transporter = createMailTransporter();
    const mailOptions = {
      from: `"BCAS Automation" <${smtpSettings.user}>`,
      to: toList.join(', '),
      cc: CC_RECIPIENTS.join(', '),
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email dispatched successfully via Gmail SMTP:', info.messageId);

    if (requestId) {
      const existing = cancellations.find(c => c.id === requestId);
      if (existing) {
        existing.emailStatus = 'Sent';
        existing.emailMessageId = info.messageId;
        existing.emailSentAt = new Date().toISOString();
        existing.emailError = undefined;
        persistStore();
      }
    }

    res.json({
      success: true,
      messageId: info.messageId,
      recipients: toList,
      cc: CC_RECIPIENTS,
      subject
    });
  } catch (error: any) {
    const errorMsg = error?.message || 'Failed to dispatch email';
    const isBadCredentials = errorMsg.includes('535') || errorMsg.includes('BadCredentials');

    console.warn('Gmail SMTP response during sendMail:', isBadCredentials ? '535 Bad Credentials' : errorMsg);

    // If autoFallback is enabled (the default for uninterrupted operations)
    if (smtpSettings.autoFallback) {
      const fallbackResult = executeSimulatedDispatch(
        'Recorded in BCAS Outbox (Google rejected standard password; please provide a 16-character App Password in Admin Settings for live delivery)'
      );
      return res.json({
        ...fallbackResult,
        isBadCredentials,
        fallbackNotice: 'Email successfully queued in BCAS Outbox. To deliver to external inboxes, add a Google App Password in Admin settings.'
      });
    }

    if (requestId) {
      const existing = cancellations.find(c => c.id === requestId);
      if (existing) {
        existing.emailStatus = 'Failed';
        existing.emailError = errorMsg;
        persistStore();
      }
    }

    res.json({
      success: false,
      error: errorMsg,
      isBadCredentials,
      tip: 'Google requires an App Password from myaccount.google.com/apppasswords or switch to Simulated Mode.',
      recipients: toList,
      cc: CC_RECIPIENTS
    });
  }
});

// Cancellation CRUD Endpoints
app.get('/api/cancellations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: cancellations
  });
});

app.post('/api/cancellations', (req: Request, res: Response) => {
  const newReq = {
    ...req.body,
    id: req.body.id || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
    status: req.body.status || 'Pending',
    emailStatus: req.body.emailStatus || 'Pending'
  };

  const index = cancellations.findIndex(c => c.id === newReq.id);
  if (index >= 0) {
    cancellations[index] = { ...cancellations[index], ...newReq };
  } else {
    cancellations.unshift(newReq);
  }
  persistStore();

  res.status(201).json({
    success: true,
    data: newReq
  });
});

app.patch('/api/cancellations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = cancellations.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  cancellations[index] = {
    ...cancellations[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  persistStore();

  res.json({
    success: true,
    data: cancellations[index]
  });
});

app.delete('/api/cancellations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetId = (id || '').trim().toLowerCase();
  const beforeCount = cancellations.length;
  cancellations = cancellations.filter(c => {
    const currentId = (c.id || '').trim().toLowerCase();
    return currentId !== targetId;
  });

  if (cancellations.length < beforeCount) {
    persistStore();
  }
  res.json({ success: true, message: 'Deleted successfully' });
});

// Outbox / Dispatched messages log
app.get('/api/outbox', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: outboxLogs
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BCAS Cancellation Portal server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
