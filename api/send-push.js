const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function getApp() {
  if (admin.apps.length) return admin.app();

  const credentials = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : JSON.parse(
        fs.readFileSync(
          path.join(process.cwd(), 'service-account.json'),
          'utf8'
        )
      );

  return admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

module.exports = async function sendPush(req, res) {
  // Allow requests from all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    getApp();

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await admin.auth().verifyIdToken(token);
    const db = admin.firestore();

    const adminDoc = await db.collection('users').doc(user.uid).get();

    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      userIds = [],
      title = '',
      body = '',
      url = '/dashboard',
    } = req.body || {};

    const uniqueUserIds = [
      ...new Set(
        userIds.filter(
          uid => typeof uid === 'string' && uid.trim()
        )
      ),
    ];

    if (!uniqueUserIds.length || uniqueUserIds.length > 500) {
      return res.status(400).json({
        error: 'Select between 1 and 500 users',
      });
    }

    if (!title.trim() || title.trim().length > 120) {
      return res.status(400).json({
        error: 'Title must contain 1 to 120 characters',
      });
    }

    if (!body.trim() || body.trim().length > 500) {
      return res.status(400).json({
        error: 'Message must contain 1 to 500 characters',
      });
    }

    const documents = await db.getAll(
      ...uniqueUserIds.map(uid =>
        db.collection('users').doc(uid)
      )
    );

    const targets = documents
      .map(doc => ({
        ref: doc.ref,
        token: doc.data()?.preferences?.fcmToken,
      }))
      .filter(target => target.token);

    if (!targets.length) {
      return res.json({
        selectedUsers: uniqueUserIds.length,
        targetDevices: 0,
        successCount: 0,
        failureCount: 0,
      });
    }

    const safeUrl = url.startsWith('/') ? url : '/dashboard';

    const message = {
      tokens: targets.map(target => target.token),
      notification: {
        title: title.trim(),
        body: body.trim(),
      },
      data: {
        url: safeUrl,
      },
      webpush: {
        notification: {
          icon: '/logo-192.png',
        },
      },
    };

    if (process.env.APP_ORIGIN) {
      message.webpush.fcmOptions = {
        link: new URL(safeUrl, process.env.APP_ORIGIN).toString(),
      };
    }

    const result = await admin.messaging().sendEachForMulticast(message);

    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
    ];

    const batch = db.batch();
    let cleanupNeeded = false;

    result.responses.forEach((response, index) => {
      if (
        !response.success &&
        invalidCodes.includes(response.error?.code)
      ) {
        batch.update(targets[index].ref, {
          'preferences.fcmToken':
            admin.firestore.FieldValue.delete(),
          'preferences.fcmEnabled': false,
        });

        cleanupNeeded = true;
      }
    });

    if (cleanupNeeded) await batch.commit();

    return res.json({
      selectedUsers: uniqueUserIds.length,
      targetDevices: targets.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  } catch (error) {
    console.error('Push notification error:', error);

    return res.status(
      error.code?.startsWith('auth/') ? 401 : 400
    ).json({
      error: error.message || 'Notification delivery failed',
    });
  }
};