import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
let firebaseAdminInitialized = false;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'smile-and-dental-clinic',
    });
    firebaseAdminInitialized = true;
    console.log('[FCM Server] Firebase Admin successfully initialized for:', serviceAccount.project_id);
  } catch (err) {
    console.error('[FCM Server] Failed to initialize Firebase Admin:', err.message);
  }
} else {
  console.warn('[FCM Server] Warning: serviceAccountKey.json not found at', serviceAccountPath);
}

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hijuwwovpsrrvugppjxn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: Send Multicast or Multi-Device Push with Invalid Token Cleanup
async function sendPushToTokens(tokens, payload, role = 'user') {
  if (!tokens || tokens.length === 0) {
    console.log(`[FCM Server] No tokens registered for role: ${role}`);
    return { successCount: 0, failureCount: 0 };
  }

  if (!firebaseAdminInitialized) {
    console.warn('[FCM Server] Firebase Admin not initialized, skipping push.');
    return { successCount: 0, failureCount: 0, error: 'Firebase Admin not initialized' };
  }

  const results = [];

  for (const token of tokens) {
    try {
      const message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          url: payload.target_url || '/',
          ...(payload.data || {}),
        },
        webpush: {
          notification: {
            icon: '/assets/favicon.jpg',
            badge: '/assets/favicon.jpg',
          },
          fcmOptions: {
            link: payload.target_url || '/',
          },
        },
      };

      const response = await admin.messaging().send(message);
      results.push({ token, status: 'success', response });
    } catch (error) {
      console.error(`[FCM Server] Error sending to token ${token.substring(0, 10)}...:`, error.code || error.message);
      results.push({ token, status: 'error', error: error.code || error.message });

      // If token is invalid or unregistered, deactivate only this specific token
      if (
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token'
      ) {
        console.log(`[FCM Server] Deactivating invalid token: ${token.substring(0, 10)}...`);
        await supabase
          .from('notification_devices')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('fcm_token', token);
      }
    }
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  const failureCount = results.filter((r) => r.status === 'error').length;
  console.log(`[FCM Server] Dispatched notifications to ${tokens.length} devices (${successCount} succeeded, ${failureCount} failed)`);
  return { successCount, failureCount, results };
}

// 1. Endpoint: Register or update device FCM token
app.post('/api/register-device', async (req, res) => {
  try {
    const { fcm_token, role, user_id, device_name, platform } = req.body;

    if (!fcm_token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    const { data, error } = await supabase
      .from('notification_devices')
      .upsert(
        {
          fcm_token,
          role: role || 'patient',
          user_id: user_id || 'anonymous',
          device_name: device_name || 'Browser',
          platform: platform || 'web',
          is_active: true,
          updated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'fcm_token' }
      )
      .select();

    if (error) throw error;
    res.json({ success: true, device: data[0] });
  } catch (err) {
    console.error('[API /register-device] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Endpoint: Patient Books Appointment -> Notify Doctor on ALL active devices
app.post('/api/notify/appointment-booked', async (req, res) => {
  try {
    const { appointment } = req.body;

    if (!appointment) {
      return res.status(400).json({ error: 'Appointment details required' });
    }

    const title = 'New Appointment Request 🦷';
    const body = `New appointment received from ${appointment.patient_name} for ${appointment.treatment_name} on ${appointment.appointment_date} at ${appointment.exact_time}.`;
    const target_url = '/doctor/dashboard';

    // 1. Insert in notifications table for Doctor (idempotent: avoid duplicate insertion)
    const { data: existingDocNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('appointment_id', appointment.id)
      .eq('notification_type', 'appointment_booked')
      .maybeSingle();

    if (!existingDocNotif) {
      const { error: notifError } = await supabase.from('notifications').insert({
        recipient_role: 'doctor',
        recipient_id: 'doctor',
        appointment_id: appointment.id,
        notification_type: 'appointment_booked',
        title,
        body,
        target_url,
        is_read: false,
      });

      if (notifError) console.error('[API /appointment-booked] Notif insert error:', notifError);
    }

    // 2. Query ALL active Doctor devices
    const { data: devices, error: devError } = await supabase
      .from('notification_devices')
      .select('fcm_token')
      .eq('role', 'doctor')
      .eq('is_active', true);

    if (devError) console.error('[API /appointment-booked] Fetch devices error:', devError);

    const tokens = devices?.map((d) => d.fcm_token) || [];

    // 3. Dispatch system push notifications to all doctor devices
    const pushResult = await sendPushToTokens(
      tokens,
      {
        title,
        body,
        target_url,
        data: {
          appointment_id: String(appointment.id || ''),
          patient_name: appointment.patient_name,
        },
      },
      'doctor'
    );

    res.json({ success: true, pushResult });
  } catch (err) {
    console.error('[API /notify/appointment-booked] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. Endpoint: Doctor Updates Status -> Notify Specific Patient
app.post('/api/notify/status-updated', async (req, res) => {
  try {
    const { appointment_id, status, notes } = req.body;

    if (!appointment_id || !status) {
      return res.status(400).json({ error: 'appointment_id and status are required' });
    }

    // 1. Fetch appointment details
    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointment_id)
      .single();

    if (appError || !appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Determine custom notification title and body based on status
    let title = `Appointment ${status}`;
    let body = `Your appointment for ${appointment.treatment_name} on ${appointment.appointment_date} at ${appointment.exact_time} is now ${status}.`;

    if (status === 'Accepted') {
      title = 'Appointment Confirmed! ✅';
      body = `Dr. Ananyo Mandal has accepted your appointment for ${appointment.treatment_name} on ${appointment.appointment_date} at ${appointment.exact_time}.`;
    } else if (status === 'Rejected') {
      title = 'Appointment Update ℹ️';
      body = notes
        ? `Appointment request update: ${notes}`
        : `Your appointment request for ${appointment.appointment_date} could not be confirmed. Tap to reschedule.`;
    } else if (status === 'Completed') {
      title = 'Treatment Completed ✨';
      body = `Thank you for choosing Smile & Dental Clinic. We hope you had a comfortable visit!`;
    }

    const target_url = `/track?token=${appointment.patient_tracking_token}`;

    // 2. Insert notification for Patient (idempotent: avoid duplicate insertion)
    const statusNotifType = `appointment_${status.toLowerCase()}`;
    const { data: existingPatientNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('appointment_id', appointment.id)
      .eq('notification_type', statusNotifType)
      .maybeSingle();

    if (!existingPatientNotif) {
      await supabase.from('notifications').insert({
        recipient_role: 'patient',
        recipient_id: appointment.patient_tracking_token,
        appointment_id: appointment.id,
        notification_type: statusNotifType,
        title,
        body,
        target_url,
        is_read: false,
      });
    }

    // 3. Find patient device tokens
    const { data: patientDevices } = await supabase
      .from('notification_devices')
      .select('fcm_token')
      .eq('user_id', appointment.patient_tracking_token)
      .eq('is_active', true);

    const tokens = patientDevices?.map((d) => d.fcm_token) || [];

    // 4. Send FCM push
    const pushResult = await sendPushToTokens(
      tokens,
      {
        title,
        body,
        target_url,
        data: {
          appointment_id: String(appointment.id),
          status,
        },
      },
      'patient'
    );

    res.json({ success: true, pushResult });
  } catch (err) {
    console.error('[API /notify/status-updated] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper: Authenticate caller identity (Doctor or Patient) for notifications API
async function getCallerIdentity(req) {
  // 1. Doctor verification via Supabase Auth JWT
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          return { role: 'doctor', recipient_id: 'doctor', user };
        }
      } catch (err) {
        console.warn('[Auth] Token check error:', err.message);
      }
    }
  }

  // Doctor verification via Doctor header (when authenticated in local doctor session)
  const doctorRole = req.headers['x-doctor-role'];
  const doctorAuth = req.headers['x-doctor-auth'];
  if (doctorAuth === 'true' && doctorRole === 'doctor') {
    return { role: 'doctor', recipient_id: 'doctor' };
  }

  // 2. Patient verification via Patient Tracking Token
  const patientToken = req.headers['x-patient-token'] || req.query.patient_token || req.body?.patient_token;
  if (patientToken && typeof patientToken === 'string') {
    const trimmed = patientToken.trim().toUpperCase();
    if (trimmed.startsWith('SDC-') || trimmed.length >= 6) {
      const { data: appt, error } = await supabase
        .from('appointments')
        .select('id, patient_tracking_token')
        .eq('patient_tracking_token', trimmed)
        .limit(1)
        .maybeSingle();

      if (!error && appt) {
        return { role: 'patient', recipient_id: trimmed };
      }
    }
  }

  return null;
}

// 5. Endpoint: Delete Single Notification (Strictly Authorised)
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const caller = await getCallerIdentity(req);

    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: valid doctor session or patient tracking token required' });
    }

    // 1. Verify notification ownership
    let checkQuery = supabase.from('notifications').select('id, recipient_role, recipient_id').eq('id', id);
    if (caller.role === 'doctor') {
      checkQuery = checkQuery.eq('recipient_role', 'doctor').neq('recipient_id', 'deleted');
    } else {
      checkQuery = checkQuery.eq('recipient_role', 'patient').eq('recipient_id', caller.recipient_id);
    }

    const { data: existing, error: checkError } = await checkQuery.maybeSingle();
    if (checkError) throw checkError;

    if (!existing) {
      return res.status(404).json({ error: 'Notification not found or access denied for this recipient' });
    }

    // 2. Perform deletion: attempt hard delete and persist soft delete
    await supabase.from('notifications').delete().eq('id', id);
    await supabase.from('notifications').update({ recipient_id: 'deleted', is_read: true }).eq('id', id);

    console.log(`[API DELETE /notifications/:id] Deleted notification ${id} for ${caller.role} (${caller.recipient_id})`);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('[API DELETE /notifications/:id] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. Endpoint: Delete All Notifications for Current Authorised Recipient
app.delete('/api/notifications', async (req, res) => {
  try {
    const caller = await getCallerIdentity(req);

    if (!caller) {
      return res.status(401).json({ error: 'Unauthorized: valid doctor session or patient tracking token required' });
    }

    let delQuery = supabase.from('notifications').delete();
    let updQuery = supabase.from('notifications').update({ recipient_id: 'deleted', is_read: true });

    if (caller.role === 'doctor') {
      delQuery = delQuery.eq('recipient_role', 'doctor').neq('recipient_id', 'deleted');
      updQuery = updQuery.eq('recipient_role', 'doctor').neq('recipient_id', 'deleted');
    } else {
      delQuery = delQuery.eq('recipient_role', 'patient').eq('recipient_id', caller.recipient_id);
      updQuery = updQuery.eq('recipient_role', 'patient').eq('recipient_id', caller.recipient_id);
    }

    await delQuery;
    const { error: updErr } = await updQuery;
    if (updErr) throw updErr;

    console.log(`[API DELETE /notifications] Deleted all notifications for ${caller.role} (${caller.recipient_id})`);
    res.json({ success: true });
  } catch (err) {
    console.error('[API DELETE /notifications] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 7. Test Notification Endpoint
app.post('/api/notify/test', async (req, res) => {
  try {
    const { token, title, body, role } = req.body;

    const notifTitle = title || 'Smile & Dental Clinic Test 🔔';
    const notifBody = body || 'FCM System push notifications are functioning perfectly!';

    if (token) {
      const result = await sendPushToTokens([token], { title: notifTitle, body: notifBody, target_url: '/' });
      return res.json({ success: true, result });
    }

    // Otherwise broadcast to registered test devices for role
    const { data: devices } = await supabase
      .from('notification_devices')
      .select('fcm_token')
      .eq('role', role || 'doctor')
      .eq('is_active', true);

    const tokens = devices?.map((d) => d.fcm_token) || [];
    const result = await sendPushToTokens(tokens, { title: notifTitle, body: notifBody, target_url: '/' });

    res.json({ success: true, recipientCount: tokens.length, result });
  } catch (err) {
    console.error('[API /notify/test] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firebaseAdmin: firebaseAdminInitialized,
    timestamp: new Date().toISOString(),
  });
});

// Serve static frontend in production
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[FCM Server] Smile & Dental Clinic API running on http://localhost:${PORT}`);
});
