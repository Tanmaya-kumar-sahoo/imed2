# IMED - AI-Powered Medicine Recommendation System

IMED is a comprehensive web application that provides intelligent medicine recommendations based on user symptoms. The system combines a reliable medical database with optional AI enhancement for personalized healthcare guidance.

## 🚀 Key Features

### 🎤 Voice Assistant (NEW!)
- **Speech-to-Text Input**: Use voice commands to fill all form fields
- **Multi-field Support**: Voice input for symptoms, age, gender, medical conditions, and severity
- **Smart Recognition**: Automatically converts spoken words to appropriate field values
- **Browser Compatible**: Works with modern browsers supporting Web Speech API

### 🤖 Enhanced AI Accuracy (NEW!)
- **Advanced Symptom Analysis**: Improved pattern recognition with weighted scoring system
- **Comprehensive Medical Database**: 15+ common conditions with detailed medicine recommendations
- **Emergency Detection**: Real-time identification of serious medical conditions
- **Hybrid Intelligence**: Combines database reliability with AI personalization

### 👨‍💼 Admin System (NEW!)
- **Role-Based Access**: Admin privileges for specific email addresses
- **AI Customization**: Configure OpenAI models, temperature, and prompt templates
- **Medicine Database Management**: Admin panel for system configuration
- **User Management**: Enhanced profile system with role indicators

### 🏥 Medical Features
- **Smart Condition Matching**: Advanced algorithm matches symptoms to medical conditions
- **Prescription Awareness**: Clear indication of which medicines require prescriptions
- **Doctor Visit Guidance**: Intelligent recommendations for when to seek medical care
- **Emergency Warnings**: Immediate alerts for serious medical conditions

### 🔐 Authentication & Security
- **NextAuth Integration**: Secure authentication with credentials provider
- **Firebase Integration**: User data management and storage
- **Guest Access**: Limited functionality for non-registered users
- **Session Management**: Persistent user sessions with role-based permissions

## 🛠 Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with Firebase
- **Database**: Firebase Firestore
- **AI Integration**: OpenAI API with LangChain
- **Voice Recognition**: Web Speech API
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- OpenAI API key (optional, for AI features)
- Modern browser with Speech API support (for voice features)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd imed
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key
```

### 3. Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication with Email/Password
4. Copy configuration to `.env.local`

### 4. Admin Configuration
Update `src/lib/auth.ts` to add admin email addresses:
```typescript
const ADMIN_EMAILS = [
  "your-admin-email@example.com",
  "another-admin@example.com"
];
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## 🎮 Usage Guide

### For Users

#### Basic Medicine Recommendations
1. Navigate to the home page
2. Enter your symptoms in the form
3. Optionally provide age, gender, and medical conditions
4. Click "Get Recommendations" to receive guidance

#### Using Voice Assistant
1. Click the microphone icon next to any form field
2. Speak clearly when prompted
3. The system will automatically fill the field with your speech
4. Supported commands:
   - **Symptoms**: "I have a headache and fever"
   - **Age**: "I am 25 years old" or "twenty five"
   - **Gender**: "male", "female", or "other"
   - **Conditions**: "I have diabetes and high blood pressure"
   - **Severity**: "normal" or "severe"

#### Emergency Situations
- The system automatically detects emergency keywords
- Emergency conditions trigger immediate hospital contact recommendations
- AI features are disabled for emergency conditions to ensure reliable guidance

### For Admins

#### Accessing Admin Panel
1. Sign in with an admin email address
2. Navigate to `/admin` or click "Admin Panel" in the user menu
3. Configure AI settings and system parameters

#### AI Customization
- **Model Selection**: Choose OpenAI model (gpt-3.5-turbo, gpt-4, etc.)
- **Temperature**: Control AI response creativity (0.0-1.0)
- **Max Tokens**: Set response length limits
- **Prompt Templates**: Customize AI behavior with placeholders:
  - `{{symptoms}}` - User's symptoms
  - `{{age}}` - User's age
  - `{{gender}}` - User's gender
  - `{{preExistingConditions}}` - Medical conditions
  - `{{severity}}` - Symptom severity

## 🏗 Architecture

### Database Schema
```
users/
  {uid}/
    - email: string
    - displayName: string
    - role: "admin" | "user" | "guest"
    - medicalProfile: object
    
    recommendations/
      {recommendationId}/
        - symptoms: string
        - condition: string
        - medicines: array
        - timestamp: date
```

### API Routes
- `POST /api/medicine` - Get medicine recommendations
- `GET|POST /api/auth/[...nextauth]` - Authentication endpoints

### Voice Recognition Flow
```
User Speech → Web Speech API → Text Processing → Form Field Update → Success Notification
```

### AI Processing Pipeline
```
Symptoms Input → Emergency Check → Database Matching → AI Enhancement → Formatted Response
```

## 🔧 Configuration

### Medicine Database
The system includes a comprehensive database of common conditions:
- Cold, Flu, Headache, Migraine
- Stomach issues, Allergies, UTI
- Back pain, Anxiety, Insomnia
- Emergency conditions (Heart attack, Stroke, etc.)

### Symptom Matching Algorithm
- **Weighted Scoring**: Multi-word patterns receive higher scores
- **Emergency Priority**: Emergency conditions get 10x score multiplier
- **Contextual Analysis**: Symptom combinations boost condition scores
- **Fallback Support**: Unknown conditions route to AI processing

### Voice Recognition Settings
- **Language**: English (US) - `en-US`
- **Continuous**: False (single phrase recognition)
- **Interim Results**: False (final results only)
- **Browser Support**: Chrome, Safari, Edge (latest versions)

## 🛡 Security Features

- **Input Validation**: Prevents injection attacks and validates medical terms
- **Emergency Detection**: Real-time scanning for serious medical conditions
- **Role-Based Access**: Admin-only routes and features
- **Session Security**: Secure JWT tokens with NextAuth
- **Data Privacy**: Firebase security rules protect user data

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=production-secret-key
# Add all Firebase and OpenAI variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠ Medical Disclaimer

IMED provides general health information and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns. In case of emergency, contact your local emergency services immediately.

## 🆘 Support

For technical support or feature requests:
- Create an issue on GitHub
- Email: support@imed-app.com
- Documentation: https://docs.imed-app.com

---

**Built with ❤️ for better healthcare accessibility**
