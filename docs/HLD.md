# High-Level Design (HLD) — Money Tracker

## Purpose
This document describes the high-level architecture for a personal, mobile-first money tracker Progressive Web Application (PWA) built with Next.js. The app is offline-first, stores data locally (IndexedDB via Dexie), and optionally syncs to a cloud backend (Supabase/Firebase) on demand. It prioritizes web standards, installability, and free-tier services. Native mobile apps (iOS/Android) may be considered in future phases.

## Goals
- Mobile-first PWA experience that works across all platforms (iOS, Android, Desktop) via browser.
- Installable to home screen with native-like experience (fullscreen, app icons, splash screens).
- Offline-first: full app functionality without network connectivity using Service Workers and IndexedDB.
- Simple sync to cloud with conflict resolution and encrypted backups.
- Small, maintainable codebase using web technologies (TypeScript + React + Next.js).
- Minimal cost: use free tiers (GitHub Actions, Vercel/Netlify, Supabase/Firebase free tiers).
- Progressively enhanced: works in any modern browser, enhanced features for PWA installations.

## Major Components

- Web Frontend (PWA)
  - Built with TypeScript and Next.js 14+ (App Router). TailwindCSS for styling.
  - Pages: Dashboard, Accounts, Transactions, Categories, Reports, Settings, Backup/Restore, Import/Export.
  - Local persistence layer using Dexie (IndexedDB) with a synchronization module.
  - Service Worker for offline caching, background sync, and push notifications.
  - Web App Manifest for installability (home screen icons, splash screens, theme colors).
  - Static export (`output: 'export'`) for full offline capability and edge deployment.

- PWA Capabilities
  - Offline-first: Service Worker caches all app assets and API responses.
  - Installable: Web App Manifest enables "Add to Home Screen" on mobile and desktop.
  - Background Sync: Queue sync requests when offline, execute when connection restored.
  - Push Notifications: Web Push API for transaction reminders and sync notifications (user opt-in).
  - Storage: IndexedDB (Dexie) for data, Cache API for assets.
  - Security: HTTPS required for PWA features, secure token storage in IndexedDB with encryption.

- Sync Backend (Optional)
  - Supabase or Firebase (free tier) to store user data and enable multi-device sync.
  - Auth via Supabase Auth / Firebase Auth (magic link or email/password).
  - RESTful or RPC endpoints to accept change sets from clients.
  - CORS configured for web app domain.

- CI/CD & Hosting
  - GitHub Actions for building, testing, and deployment (free for public and limited minutes for private).
  - Host on Vercel/Netlify/Cloudflare Pages (free tiers with automatic HTTPS and global CDN).
  - Deploy static site with Service Worker for offline support.
  - Domain: Custom domain or free subdomain (e.g., money-tracker.vercel.app).

- AI Features (Optional)
  - Smart categorization: auto-categorize transactions using local ML models or cloud APIs.
  - Receipt OCR: extract transaction details from photos using Tesseract.js (client-side) or Google Vision API (free tier).
  - Spending insights: generate natural language summaries using LLMs (OpenAI/Gemini free tiers).
  - Budget recommendations: suggest budgets based on spending patterns.
  - Natural language input: "Spent $50 on groceries" → create transaction.

## Data Flow

1. User creates/updates transactions on device.
2. Changes are written locally to IndexedDB with a change-log entry and a version vector.
3. On network available, sync service sends change-set to backend; backend responds with resolved updates.
4. Client applies server results and updates local vector-clock/state.
5. Periodic encrypted backups can be uploaded to user's cloud storage via OAuth.

## Update Strategy
- PWA updates: Service Worker automatically downloads new versions in background.
- Update flow:
  1. User visits app → Service Worker checks for new version
  2. New version downloaded in background while user continues working
  3. Prompt user to refresh when ready ("New version available - Refresh now?")
  4. User refreshes → new version activates instantly
- No app store approval needed - deploy updates instantly via hosting platform.
- Versioning: Use semantic versioning (MAJOR.MINOR.PATCH) displayed in Settings page.
- Cache invalidation: Service Worker detects manifest changes and updates cache.

## Security Considerations
- HTTPS required: PWA features (Service Workers, geolocation, notifications) only work over HTTPS.
- Token storage: Store JWT tokens in IndexedDB with encryption (using Web Crypto API), not localStorage (vulnerable to XSS).
- Do not store raw passwords - use auth provider's secure flows.
- Encrypt backups with a user-provided passphrase before uploading (AES-GCM via Web Crypto API).
- Content Security Policy (CSP): Configure strict CSP headers to prevent XSS attacks.
- Input sanitization: Use DOMPurify for user-generated content (transaction notes, account names).
- Subresource Integrity (SRI): Use SRI hashes for external scripts/styles.
- IndexedDB security: Data is sandboxed per-origin; consider encryption for sensitive fields.
- Cross-origin isolation: Configure CORP/COEP headers if using SharedArrayBuffer or high-precision timers.
- Regular security audits: Use npm audit, Snyk, or OWASP dependency scanning.

## Non-Functional Requirements
- Offline reliability: app must allow CRUD operations offline.
- Low resource usage: minimize background CPU / memory usage on mobile.
- Privacy-first: no analytics by default; any analytics must be opt-in.

## Future Scaling
- Phase 2: Native mobile apps using Capacitor or React Native if native features required (biometric auth, advanced camera, etc.).
- Phase 3: Replace optional backend with custom Postgres API when higher scale or advanced features needed.
- Desktop: PWA installs natively on Windows/Mac/Linux via Chrome/Edge. Consider Tauri/Electron only if OS-level integration required.
- Multi-tenant: Add organization/family accounts with role-based access control.
- Advanced offline: Implement CRDT-based sync for better conflict resolution at scale.
