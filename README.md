# 🐕 Bauuu Web - Dating App for Dog Owners

A modern dating PWA (Progressive Web App) built with Next.js, designed specifically for dog owners to find love through their four-legged companions.

## 🌟 Features

### Core Functionality
- **Email/Password Authentication** - Secure Firebase Auth integration
- **Profile Setup** - Personal and dog profile creation with photos
- **Discover Screen** - Tinder-style swipe cards with intelligent matching
- **Real-time Chat** - Instant messaging after mutual matches
- **Profile Management** - Edit personal and dog information anytime

### Technical Highlights
- **PWA Ready** - Installable on mobile devices with offline support
- **Mobile-First Design** - Optimized for mobile with responsive layout
- **Real-time Updates** - Firebase Firestore for live data synchronization
- **Smooth Animations** - Framer Motion for fluid swipe gestures
- **TypeScript** - Full type safety throughout the application
- **Italian Content** - Localized for Italian users

## 🔧 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Animations**: Framer Motion
- **PWA**: Native manifest and service worker
- **Deployment**: Ready for Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Auth, Firestore, and Storage enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/moonswolf/bauuu-web.git
   cd bauuu-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Project Structure

```
bauuu-web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── login/              # Authentication pages
│   │   ├── register/           
│   │   ├── setup/              # Profile setup flow
│   │   │   ├── profile/        # User profile setup
│   │   │   └── dog/            # Dog profile setup
│   │   ├── app/                # Main application
│   │   │   ├── discover/       # Swipe cards page
│   │   │   ├── matches/        # Matches list
│   │   │   ├── chat/[matchId]/ # Chat interface
│   │   │   └── profile/        # Profile management
│   │   └── manifest.ts         # PWA manifest
│   ├── components/             # Reusable React components
│   │   ├── SwipeCard.tsx       # Tinder-style swipe card
│   │   ├── BottomNav.tsx       # Mobile navigation
│   │   ├── ProfileModal.tsx    # Profile detail view
│   │   ├── AuthGuard.tsx       # Route protection
│   │   └── ImageUpload.tsx     # Photo upload component
│   ├── lib/                    # Core utilities
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── auth.ts             # Authentication helpers
│   │   ├── firestore.ts        # Database operations
│   │   └── matching.ts         # Match algorithm
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.ts          # Authentication state
│   └── types/                  # TypeScript definitions
└── public/                     # Static assets
    ├── icons/                  # PWA icons
    └── sw.js                   # Service worker
```

## 🎨 Design System

### Colors
- **Primary**: `#7B2EFF` (Purple)
- **Secondary**: `#FF6B6B` (Coral)
- **Accent**: `#FFD700` (Gold)
- **Background**: `#FAFAFA` (Light Gray)

### Key Components
- **SwipeCard**: Animated card with drag gestures and match scoring
- **BottomNav**: Mobile-style navigation with 3 main tabs
- **ProfileModal**: Detailed profile view with image carousel
- **ImageUpload**: Camera/gallery photo upload with Firebase Storage

## 📊 Matching Algorithm

The app uses a sophisticated matching algorithm that considers:

- **Dog Compatibility** (50 points max):
  - Size compatibility (20 points)
  - Energy level match (15 points)
  - Temperament compatibility (15 points)
- **Proximity Score** (25 points max): Distance-based scoring
- **Profile Quality** (15 points max): Shared interests and completion
- **Engagement** (10 points max): Photo quality and bio completeness

## 🔥 Firebase Setup

### Required Collections
- `users/{uid}` - User profiles with personal information
- `dogs/{dogId}` - Dog profiles linked to users
- `swipes/{swiperId_swipedId}` - Swipe records for matching
- `matches/{matchId}` - Mutual matches between users
- `messages/{matchId}/messages/{msgId}` - Chat messages

### Storage Structure
- `users/{uid}/photo_{index}_{timestamp}.jpg` - User photos
- `dogs/{dogId}/photo_{index}_{timestamp}.jpg` - Dog photos

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build
```bash
npm run build
npm start
```

## 🐛 Known Issues

- Icons for PWA need to be added to `/public/icons/` directory
- Some ESLint warnings for `<img>` tags (can be optimized with Next.js Image)
- Viewport/theme color metadata warnings (minor)

## 🤝 Contributing

This project was migrated from React Native and maintains feature parity with the original mobile app. The codebase uses the same Firebase collections and data structure.

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- **Repository**: https://github.com/moonswolf/bauuu-web
- **Original React Native App**: Available in the same workspace
- **Deployment**: Ready for Vercel (not deployed yet)

---

*Trova l'amore attraverso il tuo migliore amico a quattro zampe! 🐾❤️*