# Firebase Setup for IMED

This document explains how to set up Firebase for the IMED application.

## Features

- Firestore for data storage
- Email authentication integration
- Real-time data synchronization

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

### 2. Add a Web App

1. In your Firebase project, click the gear icon ⚙️ and select "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web platform (</> icon)
4. Register your app with a nickname (e.g., "IMED Web App")
5. Copy the Firebase configuration

### 3. Update Configuration

Replace the configuration in `src/lib/firebase/config.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (remember to add security rules for production)
4. Select a location for your database

### 5. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable Email/Password authentication
4. Configure authentication settings as needed

### 6. Set Up Security Rules

For development, you can use these permissive rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, implement proper security rules based on your requirements.

### 7. Initialize Data (Optional)

Run the seed script to populate initial data:

```bash
node scripts/seed-firebase.js
```

## Project Structure

The Firebase integration includes:

- `src/lib/firebase/config.ts` - Firebase configuration
- `src/lib/firebase/firestore.ts` - Firestore helper functions
- `src/lib/firebase/auth.ts` - Authentication utilities

## Authentication Flow

The application uses NextAuth.js for session management and Firebase for user data storage.

- User signs in with email/password via NextAuth
- User data is stored in Firestore for additional profile information
- Session management is handled by NextAuth

## Environment Variables

Add these to your `.env.local` file:

```env
# Firebase configuration (optional if hardcoded in config.ts)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Check your Firestore security rules
   - Ensure authentication is properly configured

2. **Configuration Errors**
   - Verify all Firebase config values are correct
   - Check that the Firebase project is active

3. **Authentication Issues**
   - Ensure Email/Password authentication is enabled
   - Check NextAuth configuration in `src/lib/auth.ts`

## Production Considerations

1. **Security Rules**: Implement proper Firestore security rules
2. **API Keys**: Restrict API keys in Google Cloud Console
3. **Authentication**: Set up proper email verification and password reset flows
4. **Monitoring**: Enable Firebase Performance Monitoring and Analytics

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [NextAuth.js Documentation](https://next-auth.js.org/) 