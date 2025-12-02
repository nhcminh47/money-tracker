# Money Tracker

A personal, mobile-first money tracking Progressive Web Application (PWA) built with Next.js. Track expenses, income, and transfers across multiple accounts with offline-first functionality.

## Features

- **Offline-First**: Full functionality without internet connection using Service Workers and IndexedDB
- **PWA**: Install to home screen on iOS, Android, and desktop for native-like experience
- **Multi-Account**: Track multiple bank accounts, cash, cards, and wallets
- **Categories**: Organize transactions with customizable categories
- **Sync**: Optional cloud sync across devices (Supabase/Firebase)
- **Encrypted Backups**: Export and backup data with passphrase encryption
- **Mobile-First**: Optimized for mobile devices with responsive design

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React 18
- **Styling**: TailwindCSS
- **Database**: IndexedDB (via Dexie.js)
- **PWA**: next-pwa, Service Worker, Web App Manifest
- **Backend**: Supabase or Firebase (optional, for sync)
- **Deployment**: Vercel/Netlify/Cloudflare Pages
- **Testing**: Jest, Playwright, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/money-tracker.git
cd money-tracker

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run start
```

### Deploy

Deploy to Vercel, Netlify, or any static hosting platform:

```bash
# Deploy to Vercel
vercel

# Or deploy to Netlify
netlify deploy --prod
```

## Documentation

- [High-Level Design (HLD)](./docs/HLD.md) - Architecture overview
- [Low-Level Design (LLD)](./docs/LLD.md) - Implementation details
- [Phase 1 Backlog](./docs/BACKLOG-PHASE1.md) - Development tasks
- [Phase 2 Backlog](./docs/BACKLOG-PHASE2.md) - UAT and launch tasks

## Project Structure

```
money-tracker/
├── app/                   # Next.js App Router pages
├── components/            # React components
├── lib/                   # Utilities, database, services
│   ├── db/               # Dexie schemas and models
│   ├── services/         # Sync, auth, backup services
│   └── utils/            # Helper functions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
└── docs/                 # Documentation
```

## Roadmap

### Phase 1: Core PWA (Current)
- [x] Project setup
- [ ] Accounts & transactions CRUD
- [ ] PWA manifest and Service Worker
- [ ] Offline functionality
- [ ] Dashboard and reports
- [ ] Cloud sync (optional)
- [ ] Encrypted backups

### Phase 2: Launch
- [ ] UAT and beta testing
- [ ] Production deployment
- [ ] Monitoring and analytics

### Phase 3: Enhancements (Future)
- [ ] AI-powered categorization
- [ ] Receipt OCR
- [ ] Spending insights
- [ ] Budget recommendations
- [ ] Native mobile apps (if needed)

## Contributing

This is a personal project, but suggestions and feedback are welcome! Open an issue to discuss improvements.

## License

MIT License - see LICENSE file for details

## Privacy

This app stores all data locally on your device by default. Optional cloud sync requires user consent. No analytics or tracking by default.