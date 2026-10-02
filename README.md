# Student Wellbeing & Support Hub

A responsive, Firebase-powered Progressive Web Application for students to book counselling sessions, record daily mood check-ins, log self-care activities, read wellbeing resources, manage their profiles, and receive browser notifications.

## Live application

**Hosted URL:** https://test-7c710.web.app/

> The deployed frontend uses Firebase Hosting. The Express notification API must also be deployed to a secure HTTPS endpoint and configured in the frontend environment.

## Project overview

The application was developed for **COMP50075 Web Development** using the following core stack:

- React with Vite
- Tailwind CSS v4
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Messaging
- Firebase Hosting
- Express and Firebase Admin SDK for the protected push-notification API
- ImgBB for profile-image uploads
- Progressive Web App features through `manifest.json` and a service worker

### Main features

- Student registration, login, logout, and session restoration
- Role-aware access for students, counsellors, and administrators
- Counsellor directory with search and filters
- Counselling appointment Create, Read, Update, and Delete operations
- Real-time Firestore synchronisation
- Daily mood tracking
- Self-care activity logging and deletion
- Wellbeing articles and resources
- Profile editing and profile-image upload
- Mobile-first responsive layouts
- Light and dark themes
- Installable PWA
- Offline application shell and Firestore cache
- Firebase Cloud Messaging notifications
- Protected Express API for administrator push notifications

## Prerequisites

Install the following before starting:

- Node.js 20 LTS or later
- npm 10 or later
- Git
- A Firebase project
- Firebase CLI
- An ImgBB account and API key, if profile-image upload is required

Check the installed versions:

```bash
node --version
npm --version
git --version
firebase --version
```

Install the Firebase CLI if it is not already available:

```bash
npm install --global firebase-tools
```

## Clone and install

```bash
git clone https://github.com/TSCSOftware/wellbeing-hub.git
cd student-wellbeing-hub
npm install
```

Public repository: https://github.com/TSCSOftware/wellbeing-hub

## Frontend environment configuration

Create a `.env` file in the project root. Do not commit this file.

```bash
cp .env.example .env
```

If `.env.example` is not present, create `.env` manually:

```env
# Firebase Web App configuration
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_web_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Cloud Messaging Web Push certificate
VITE_FIREBASE_VAPID_KEY=your_public_vapid_key

# Profile-image upload
VITE_IMGBB_API_KEY=your_imgbb_api_key

# HTTPS URL of the Express notification API
VITE_PUSH_API_URL=https://your-api-domain.example.com/api/send-push
```

### Important Vite environment rule

Only variables beginning with `VITE_` are exposed to browser code. Never place a Firebase Admin service-account private key, server token, database password, or other privileged secret in a `VITE_` variable.

Firebase web configuration identifies the Firebase project, but access must still be protected using Firebase Authentication, Firestore Security Rules, Storage Rules, App Check where appropriate, and server-side role verification.

## Create the Firebase project

1. Open the Firebase Console.
2. Create or select a Firebase project.
3. Add a Web App to the project.
4. Copy the Web App configuration into the frontend `.env` file.
5. Enable Firebase Authentication.
6. Create a Cloud Firestore database.
7. Enable Cloud Messaging.
8. Generate a Web Push certificate and copy the public VAPID key.
9. Enable Firebase Hosting.

### Authentication

In **Firebase Console > Authentication > Sign-in method**, enable:

- Email/Password

The application creates a Firestore profile after registration. Public registration should create student accounts only. Counsellor and administrator roles should be assigned securely by an existing administrator or a trusted server-side process.

## Firestore data structure

The application uses collections similar to the following:

```text
users/{uid}
users/{uid}/bookings/{bookingId}
users/{uid}/activities/{activityId}
users/{uid}/moods/{yyyy-mm-dd}
users/{uid}/notificationTokens/{tokenId}

counsellors/{counsellorId}
blogs/{blogId}
appointments/{appointmentId}
messages/{messageId}
```

Typical responsibilities are:

- `users/{uid}`: profile, role, course information, preferences, and profile-image URL
- `bookings`: private student appointment records
- `activities`: student self-care logs
- `moods`: one mood record per date
- `notificationTokens`: Firebase Cloud Messaging browser tokens
- `counsellors`: practitioner profiles and availability slots
- `blogs`: wellbeing resources published by authorised staff
- `appointments`: staff-facing appointment records
- `messages`: contact-form submissions

## Firestore Security Rules

Client-side route protection is not a security boundary. Deploy Firestore Security Rules that verify `request.auth.uid` and the authenticated user's role.

The repository should include a `firestore.rules` file and, when composite queries are used, a `firestore.indexes.json` file.

Deploy them with:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Test the rules with the Firebase Emulator Suite before production deployment:

```bash
firebase emulators:start
```

At minimum, verify that:

- Anonymous users cannot read private student data.
- A student can access only their own private subcollections.
- A student cannot assign themselves an administrator or counsellor role.
- Counsellors can access only the appointment data required for their work.
- Only authorised staff can create or modify counsellor and blog records.
- Only administrators can send system-wide notifications.

## Run the frontend locally

Start the Vite development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The preview server normally runs at `http://localhost:4173` unless another port is selected.

## Express notification API

The Express API uses the Firebase Admin SDK to send Firebase Cloud Messaging notifications. It must run only on a trusted server. Never place Firebase Admin credentials in the React application or commit a service-account JSON file.

### API installation

The API source is inside `api/`, but it uses the root project dependencies and must be started from the repository root. Install the frontend and API dependencies with:

```bash
npm install
npm install express dotenv
```

The API requires these runtime packages:

```bash
express
dotenv
firebase-admin
```

Start the notification server from the repository root:

```bash
node api/index.js
```

The server listens on `0.0.0.0:3030`.

Available local endpoints:

```text
GET  http://localhost:3030/health
POST http://localhost:3030/api/send-push
OPTIONS http://localhost:3030/api/send-push
```

### API environment variables

Create `.env` in the repository root for local development. `api/index.js` loads this file using the current working directory:

```env
APP_ORIGIN=http://localhost:5173

# Use one JSON service-account object. Keep this value in a secret manager in production.
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id", "private_key_id":"...", "private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n", "client_email":"firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"}
```

Alternatively, for local development only, place the service-account file at the repository root as `service-account.json`. The API falls back to that file when `FIREBASE_SERVICE_ACCOUNT` is not set. Never commit either credential source.

For the deployed API, set `APP_ORIGIN` to:

```env
APP_ORIGIN=https://test-7c710.web.app
```

The frontend separately needs this value in the root `.env` file:

```js
VITE_PUSH_API_URL=http://localhost:3030/api/send-push
```

For production, replace it with the deployed HTTPS API URL. Do not print service-account credentials or Firebase ID tokens in logs.

### API implementation behavior

`api/index.js` provides JSON parsing, malformed-JSON handling, a health endpoint, CORS preflight handling, the protected push route, JSON 404 responses, and safe 500 responses. The push handler in `api/send-push.js`:

1. Requires an `Authorization: Bearer <Firebase ID token>` header.
2. Verifies the token with Firebase Admin SDK.
3. Reads `users/{uid}` and requires `role: "admin"`.
4. Validates 1 to 500 target users and message length limits.
5. Reads registered FCM tokens from the selected user profiles.
6. Sends the multicast notification and removes invalid tokens.

Run the API locally in one terminal:

```bash
node api/index.js
```

In another terminal, check that it is healthy:

```bash
curl http://localhost:3030/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "firebase-push-server"
}
```

The current handler allows all origins with `Access-Control-Allow-Origin: *`. Restrict this to the deployed frontend origin before production if the API is hosted publicly.

### API authentication and authorisation

The notification endpoint should require a Firebase ID token:

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

The server should:

1. Reject requests without a bearer token.
2. Verify the token with `firebase-admin`.
3. Read the caller's profile or trusted custom claims.
4. Confirm that the caller has the `admin` role.
5. Validate the notification title, message, target, and allowed URL.
6. Send the notification through Firebase Cloud Messaging.
7. Return a safe response without exposing tokens or credentials.

Do not rely only on a hidden button or React route guard. Server-side role verification is mandatory.

### Example health check

If the API provides a health route:

```bash
curl http://localhost:3030/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### Test the protected notification endpoint

Use an authenticated administrator session in the application, or send a verified Firebase ID token:

```bash
curl --request POST http://localhost:3030/api/send-push \
  --header "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "title": "Wellbeing Hub",
    "body": "Your appointment has been updated.",
    "url": "/dashboard/bookings"
  }'
```

The exact request body must match the implementation in `api/index.js` or `api/send-push.js`.

## Deploy the Express API

The API may be hosted on Cloud Run, Firebase Functions, Render, Railway, or another Node.js HTTPS service. Cloud Run or Firebase Functions is recommended when Firebase Admin is already in use.

Production requirements:

- HTTPS only
- No committed service-account JSON file
- Credentials stored in the platform's secret manager
- CORS restricted to `https://test-7c710.web.app`
- Firebase ID-token verification
- Administrator role verification
- Request-size limits and input validation
- Safe error messages
- Logging that excludes personal data and notification tokens

After deployment, update the frontend `.env`:

```env
VITE_PUSH_API_URL=https://your-deployed-api.example.com/api/send-push
```

Then rebuild and redeploy the frontend.

## Firebase Hosting deployment

Authenticate the Firebase CLI:

```bash
firebase login
```

Select the Firebase project:

```bash
firebase use test-7c710
```

If the project alias is not configured:

```bash
firebase use --add
```

Build the application:

```bash
npm run build
```

Deploy Hosting:

```bash
firebase deploy --only hosting
```

Deploy Hosting, Firestore rules, and indexes together:

```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

The live application is available at:

**https://test-7c710.web.app/**

## PWA setup and verification

PWA files should include:

```text
public/manifest.json
public/firebase-messaging-sw.js
public/icons/
```

Check the following in Chrome DevTools:

1. Open **Application > Manifest** and confirm that the name, icons, start URL, theme colour, and display mode are valid.
2. Open **Application > Service workers** and confirm that the worker is activated and controlling the page.
3. Confirm that an install option is offered on a supported browser.
4. Reload with the network disabled and verify that the cached shell or offline fallback appears.
5. Grant notifications, confirm that a token is stored, and test foreground and background messages.

Service workers and notifications require HTTPS in production. `localhost` is treated as a secure development context by supported browsers.

## Suggested route map

### Public routes

```text
/
/about
/counsellors
/counsellors/:counsellorId
/resources
/resources/:resourceId
/contact
/login
/register
```

### Authenticated student routes

```text
/dashboard
/dashboard/bookings
/dashboard/selfcare
/dashboard/profile
/dashboard/settings
```

### Staff routes

The exact staff paths may vary by implementation. They should be protected by both frontend role guards and backend security rules.

```text
/staff
/staff/appointments
/staff/availability
/staff/resources
/admin
```

## Project structure

```text
student-wellbeing-hub/
├── api/                         # Express and Firebase Admin notification API
│   ├── index.js
│   ├── send-push.js
│   ├── package.json
│   └── .env                     # Local only, never committed
├── public/
│   ├── manifest.json
│   ├── firebase-messaging-sw.js
│   └── icons/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── firebase/
│   ├── hooks/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env                         # Local only, never committed
├── .env.example                 # Variable names only
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── package.json
├── vite.config.js
└── README.md
```

## Environment safety

The following files and values must never be committed:

```gitignore
.env
.env.*
!.env.example
service-account.json
**/service-account*.json
*.pem
*.key
```

If a service-account key has ever been committed or included in an uploaded archive, deleting the current file is not sufficient. Revoke the key in Google Cloud IAM, remove it from the complete Git history, rotate affected credentials, and then force-push the cleaned repository if permitted.

Before publishing, run a secret scanner such as Gitleaks:

```bash
gitleaks detect --source . --verbose
```

## Troubleshooting

### Firebase environment variables are undefined

- Confirm the variable names start with `VITE_`.
- Confirm `.env` is in the frontend project root.
- Restart `npm run dev` after changing `.env`.
- Do not read Vite variables with `process.env`; use `import.meta.env`.

### Firebase authentication fails

- Enable Email/Password authentication.
- Add `localhost` and the hosted domain to Firebase Authentication authorised domains.
- Confirm that the selected Firebase project matches the `.env` values.

### Firestore returns `permission-denied`

- Confirm the user is signed in.
- Check the `users/{uid}` profile and role.
- Review deployed Firestore Security Rules.
- Use the Rules Playground or Emulator Suite to reproduce the request.

### Firestore query requires an index

Use the index-creation link shown in the browser console, or add the required index to `firestore.indexes.json`, then deploy it:

```bash
firebase deploy --only firestore:indexes
```

### Notifications do not work

- Use HTTPS or `localhost`.
- Confirm notification permission is granted.
- Verify the public VAPID key.
- Confirm the service worker is active.
- Check that the FCM token exists in Firestore.
- Confirm the Express API URL is correct.
- Confirm CORS allows the frontend origin.
- Confirm the request includes a valid Firebase ID token.
- Confirm the caller has the administrator role.

### Install button does not appear

The `beforeinstallprompt` event is browser-dependent. Confirm that the manifest has valid icons, the service worker controls the page, the app is served over HTTPS, and the app is not already installed.

### Express private-key parsing error

Store the key with escaped newlines and convert `\\n` to actual newline characters during server initialisation. Prefer a managed secret service instead of a local multiline environment value in production.

## Testing checklist

Before submission, verify and capture evidence for:

### Functional testing

- Create a counselling booking.
- Read bookings through the real-time listener.
- Cancel a booking.
- Delete a cancelled booking.
- Add and delete a self-care activity.
- Create and update a daily mood entry.
- Update a user profile.
- Add and remove a counsellor availability slot.
- Publish a wellbeing resource as authorised staff.
- Submit a contact message.
- Enable notifications and receive a test push.

### Responsive testing

Capture screenshots for:

- Small mobile phone
- Medium mobile phone
- Tablet portrait
- Tablet landscape
- Desktop HD

### Lighthouse testing

Run Lighthouse against the production URL in a clean Incognito profile. Clear site data and test the production build. The assignment target is at least 90 for Performance, Accessibility, Best Practices, and PWA-related checks.

## Available scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Create the production build in dist/
npm run preview   # Preview the production build
```

If linting or automated tests are added, document their scripts here, for example:

```bash
npm run lint
npm run test
npm run test:e2e
```

## Academic integrity and attribution

This project was produced for COMP50075 Web Development. External libraries, tutorials, icons, images, APIs, and generative-AI assistance should be acknowledged in the project report using the referencing style required by the module.

The counsellor profiles, resources, crisis contacts, and other demonstration content are classroom sample data unless explicitly verified as real services. Do not present sample emergency information as an operational support service.


