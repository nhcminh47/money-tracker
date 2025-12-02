# Backlog Phase 1 — Development

This backlog covers all development work to build the MVP and optional features for the money tracker app.

## Epic 0 — Project Setup & Infrastructure
Feature: Initialize codebase and development environment
- User Story 0.1: As a developer, I want a scaffolded project so I can start building features.
  - Tasks:
    - Initialize Git repository with `.gitignore` for Node, IDE files, and build artifacts.
    - Create Next.js 14+ project with TypeScript: `npx create-next-app@latest --typescript --tailwind --app`.
    - Configure Next.js for static export: set `output: 'export'` in `next.config.js`.
    - Enable Turbopack for faster dev builds: update dev script to `next dev --turbo`.
    - Add ESLint and Prettier for code quality and formatting.
    - Create initial folder structure: `app/`, `components/`, `lib/db/`, `lib/services/`, `lib/utils/`.
    - Add `README.md` with project description, tech stack, and setup instructions.

- User Story 0.2: As a developer, I want PWA capabilities configured so users can install the app.
  - Tasks:
    - Install next-pwa plugin: `npm install next-pwa`.
    - Configure next-pwa in `next.config.js` with static export settings.
    - Create Web App Manifest at `public/manifest.json` with app metadata, icons, theme colors.
    - Generate app icons in multiple sizes (72x72 to 512x512) and add to `public/icons/`.
    - Add manifest link and meta tags to root layout (`app/layout.tsx`).
    - Verify Next.js config has `output: 'export'` and `images.unoptimized: true` for static export.
    - Test PWA installation on Chrome DevTools and mobile devices.

- User Story 0.3: As a developer, I want local development tools configured.
  - Tasks:
    - Add dev scripts to `package.json`: `dev` (with `--turbo` flag), `build`, `start`, `lint`, `format`.
    - Configure VS Code settings and recommended extensions (ESLint, Prettier, Tailwind IntelliSense).
    - Add TypeScript path aliases in `tsconfig.json` (e.g., `@/` for root directory).
    - Create `.env.example` file for environment variables (API URLs, feature flags).

- User Story 0.4: As a developer, I want version control and collaboration tools set up.
  - Tasks:
    - Create `.gitignore` with Node modules, build artifacts, IDE files, OS files.
    - Add commit hooks with Husky for pre-commit linting (optional but recommended).
    - Create GitHub repository and push initial commit.
    - Add branch protection rules and PR template (optional for solo project).

Priority: Critical (must complete before other epics)

## Epic 1 — Core Data & Offline
Feature: Local data model and offline CRUD
- User Story 1.1: As a user, I want to create accounts so I can track money sources.
  - Tasks:
    - Create Dexie schema for `accounts` table.
    - Implement `Account` model methods (create, read, update, delete).
    - Add unit tests for `Account` model.

- User Story 1.2: As a user, I want to add transactions so I can record expenses and income.
  - Tasks:
    - Create Dexie schema for `transactions` table with indexes.
    - Implement `Transaction` model methods and `ChangeLog` entry creation.
    - Add UI form for creating/editing transactions (mobile-first layout).
    - Add unit tests for transactions and changelog behaviour.

- User Story 1.3: As a user, I want to categorize transactions.
  - Tasks:
    - Create `categories` table and seed default categories.
    - Implement category CRUD and assign UI.

- User Story 1.4: As a user, I want to transfer money between accounts.
  - Tasks:
    - Add `toAccountId` field to Transaction model for Transfer type.
    - Implement Transfer transaction creation (debit from source, credit to destination).
    - Add UI form for Transfer with account selection.
    - Update account balance calculation to handle transfers.

- User Story 1.5: ✅ As a user, I want the new transaction page to work correctly with local data.
  - Tasks:
    - ✅ Fix data loading: switch from Supabase API to IndexedDB services.
    - ✅ Use getAllAccounts() instead of api.getAccounts().
    - ✅ Use getAllCategories() instead of api.getCategories().
    - ✅ Use createTransaction() instead of api.createTransaction().
    - ✅ Fix TypeScript type errors (camelCase properties, capitalized transaction type).
    - ✅ Add full i18n support to new transaction page (10+ translation keys).
    - ✅ Remove debug console.logs.

Priority: High

## Epic 1.5 — Offline Capabilities
Feature: Service Worker and offline-first functionality
- User Story 1.5.1: ✅ As a user, I want the app to work offline without any network connection.
  - Tasks:
    - ✅ Configure Service Worker with next-pwa for asset caching.
    - ✅ Implement Cache-First strategy for static assets (HTML, CSS, JS, images).
    - ✅ Implement Network-First strategy for API calls with cache fallback.
    - ✅ Create offline fallback page (`public/offline.html`).
    - ✅ Add offline indicator in UI (network status badge).
    - Test full offline functionality: add transactions, view accounts, navigate pages.

- User Story 1.5.2: ✅ As a user, I want my data preserved on mobile browsers without eviction.
  - Tasks:
    - ✅ Implement persistent storage API (`navigator.storage.persist()`).
    - ✅ Request persistent storage permission on app initialization.
    - ✅ Create usePersistentStorage hook for client-side execution.
    - ✅ Add StorageManager component to root layout.
    - Test storage persistence on iOS Safari and Android Chrome.

Priority: High

## Epic 2 — Sync & Backup
Feature: Cloud sync and encrypted backups
- User Story 2.1: ✅ As a user, I want my data synced across devices.
  - Tasks:
    - ✅ Implement client change-log structure and storage.
    - ✅ Create Supabase database schema with RLS policies.
    - ✅ Implement client sync worker to push/pull changes.
    - ✅ Implement basic LWW conflict resolution in client.
    - ✅ Add auto-sync on visibility change and online events.
    - ✅ Add manual "Sync Now" button in SyncStatus component.
    - Test multi-device sync flow on real devices.

- User Story 2.2: ✅ As a user, I want to backup my data to cloud storage.
  - Tasks:
    - ✅ Add export-to-JSON feature.
    - ✅ Implement AES-GCM encryption with passphrase.
    - Implement Google Drive / Dropbox upload via OAuth (optional, plugin later).

Priority: Medium

## Epic 3 — PWA Installation & Updates
Feature: Progressive Web App capabilities and automatic updates
- User Story 3.1: ✅ As a user, I want to install the app to my home screen and use it like a native app.
  - Tasks:
    - ✅ Implement Web App Manifest with proper icons, theme, and display mode.
    - ✅ Add install prompt detection and custom "Install App" button in UI.
    - ✅ Handle `beforeinstallprompt` event and track installation state.
    - ✅ Add iOS-specific meta tags for Add to Home Screen experience.
    - ✅ Implement standalone mode detection to show/hide install button.
    - Test installation flow on iOS Safari, Android Chrome, and desktop browsers.

- User Story 3.2: ✅ As a user, I want automatic updates without manual app store downloads.
  - Tasks:
    - ✅ Configure Service Worker update strategy with next-pwa.
    - ✅ Implement update detection: check for new Service Worker on page load.
    - ✅ Show update notification UI: "New version available - Refresh to update".
    - ✅ Implement update activation flow: skip waiting and reload page.
    - ✅ Add version number display in Settings page.
    - ✅ Test update flow: deploy new version and verify auto-update on client.
    - Add update changelog/release notes display (optional).

Priority: High

## Epic 4 — Authentication & Security
Feature: Simple auth and secure storage
- User Story 4.1: ✅ As a user, I want to sign in securely.
  - Tasks:
    - ✅ Integrate Supabase/Firebase auth (magic link or email/password) in client.
    - ✅ Store JWT in encrypted IndexedDB (using Web Crypto API), not localStorage.
    - ✅ Implement auth guard for sync endpoints and protected pages.
    - ✅ Add session persistence and auto-refresh token logic.
    - ✅ Implement secure logout: clear tokens and redirect to login.

- User Story 4.2: ✅ As a user, I want my backups encrypted with a passphrase.
  - Tasks:
    - ✅ Reuse AES-GCM encryption library.
    - ✅ Add UI to set backup passphrase and validate.

Priority: Medium

## Epic 5 — UX & Reports
Feature: Dashboard and reports
- User Story 5.1: ✅ As a user, I want a dashboard showing balances and recent transactions.
  - Tasks:
    - ✅ Implement dashboard page with account balances and recent list.
    - ✅ Add charts (small) for spending by category.

- User Story 5.2: ✅ As a user, I want to export CSV of transactions.
  - Tasks:
    - ✅ Implement CSV export utility.
    - ✅ Add Export button to reports page.

- User Story 5.3: ✅ As a user, I want to configure app settings (currency, theme, notifications).
  - Tasks:
    - ✅ Create Settings page with form for default currency, theme (light/dark), notification preferences.
    - ✅ Store settings in IndexedDB `meta` table.
    - ✅ Apply theme selection to UI.

- User Story 5.4: ✅ As a new user, I want demo data to explore the app.
  - Tasks:
    - ✅ Implement seed function to create sample accounts, categories, and transactions.
    - ✅ Add "Load Demo Data" button on first launch or in Settings.

- User Story 5.5: ✅ As a mobile user, I want a clean navigation experience without UI overlap.
  - Tasks:
    - ✅ Implement L-shaped sidebar: persistent button tab at left edge that moves with sidebar.
    - ✅ Add mobile header padding (pl-14 md:pl-0) to all pages for hamburger button clearance.
    - ✅ Test sidebar on various mobile screen sizes (320px to 768px).

- User Story 5.6: ✅ As a mobile user, I want easy access to add actions without header clutter.
  - Tasks:
    - ✅ Implement floating action button (FAB) pattern for mobile: 56x56px round button, fixed bottom-right.
    - ✅ Add FABs to all pages with add functionality: Categories, Transactions, Accounts, Budgets.
    - ✅ Hide desktop header buttons on mobile (hidden md:inline-flex).
    - ✅ Use consistent sky-600 background with white icon for all FABs.

- User Story 5.7: ✅ As a mobile user, I want transaction cards that display well on small screens.
  - Tasks:
    - ✅ Change transaction card layout to stack vertically on mobile (flex-col md:flex-row).
    - ✅ Make action buttons wrap on small screens (flex-wrap).
    - ✅ Test responsive layout on various screen sizes.

- User Story 5.8: ✅ As a user, I want a simple way to mark transactions as cleared during creation/editing.
  - Tasks:
    - ✅ Remove cleared toggle button from transaction list (reduces clutter).
    - ✅ Add cleared checkbox to transaction modal (visible during create and edit).
    - ✅ Keep visual badge in transaction cards to show cleared status.
    - ✅ Update transaction edit flow to support cleared checkbox.

Priority: Medium

## Epic 6 — Testing & CI/CD
Feature: Automated CI and tests
- User Story 6.1: ✅ As a developer, I want unit tests for core services.
  - Tasks:
    - ✅ Add Jest testing framework with Next.js support.
    - ✅ Configure fake-indexeddb for IndexedDB mocking.
    - ✅ Add unit tests for account service (10 tests).
    - ✅ Add unit tests for transaction service (9 tests).
    - ✅ Add GitHub Actions workflow for lint/build/test and deployment.
    - ✅ Add Playwright E2E tests for critical flows (create transaction, sync, offline mode).
    - ✅ Add PWA audit tests: Lighthouse CI for PWA score, performance, accessibility.
    - ✅ Test Service Worker updates and caching strategies in CI.

- User Story 6.2: As a developer, I want code quality and security scanning automated.
  - Tasks:
    - Integrate SonarQube/SonarCloud (free for open source) for static code analysis.
    - Configure quality gates: code coverage > 70%, no critical vulnerabilities, maintainability rating A/B.
    - Add SonarQube scan to GitHub Actions CI pipeline.
    - Fix reported code smells, bugs, and security hotspots.
    - Add dependency scanning with npm audit or Snyk (free tier).

Priority: Low

## Epic 7 — AI-Powered Features (Optional)
Feature: Smart categorization, OCR, and insights
- User Story 7.1: ✅ As a user, I want transactions auto-categorized so I save time.
  - Tasks:
    - ✅ Implement client-side categorization using TensorFlow.js or rule-based matching.
    - ✅ Train model on user's historical transactions (merchant → category).
    - ✅ Add UI to show suggested category with accept/reject buttons.
    - ✅ Store user feedback to improve model accuracy.

- User Story 7.2: ✅ As a user, I want to scan receipts to quickly add transactions.
  - Tasks:
    - ✅ Integrate Tesseract.js for client-side OCR (no Capacitor Camera for web PWA).
    - ✅ Implement OCR using Tesseract.js (client-side).
    - ✅ Extract merchant, date, amount, and line items from receipt image.
    - ✅ Pre-fill transaction form with extracted data for user review.

- User Story 7.3: ✅ As a user, I want to add transactions using natural language.
  - Tasks:
    - ✅ Implement NLP parser using compromise.js.
    - ✅ Add input field: "Spent $20 on lunch at Chipotle".
    - ✅ Extract amount, merchant, and category; create transaction.

- User Story 7.4: ✅ As a user, I want AI-generated spending insights.
  - Tasks:
    - ✅ Implement local analytics: calculate category totals, trends, comparisons.
    - ✅ Generate natural language summaries ("30% increase in dining this month").
    - ✅ Display insights on Dashboard with charts.
    - ✅ Create InsightsDashboard component with 4 sections.
    - ✅ Implement 100% local analytics engine (no external API costs).

- User Story 7.5: ✅ As a user, I want budget recommendations based on my spending.
  - Tasks:
    - ✅ Analyze 3-6 months of transaction history.
    - ✅ Use median/percentile analysis to suggest category budgets.
    - ✅ Display suggested budgets with accept/edit UI.
    - ✅ Add "Use AI Suggestion" button to budget creation modal.
    - ✅ Support bulk budget creation for all categories.

Priority: Low (nice-to-have after core features stable)

---

## Sprint Planning

- Sprint 0 (1 week): Epic 0 complete (project setup, PWA foundation, dev tooling).
- Sprint 1 (2 weeks): Epic 1 (accounts + transactions + categories CRUD) + Epic 3 (PWA manifest, install prompt, Service Worker basics).
- Sprint 2 (2 weeks): Epic 5 (Dashboard, basic UI/UX, settings, demo data) — test PWA on mobile devices for UX feedback.
- Sprint 3 (2 weeks): Epic 2 (sync + backups, mock backend, basic auth) + Epic 3 (Service Worker caching, update notifications).
- Sprint 4 (1 week): Epic 6 (testing + CI/CD setup).
- Sprint 5+ (optional): Epic 7 (AI features) — implement incrementally as post-MVP enhancements.

## Notes
- PWA-first approach: Build for web, deploy instantly, consider native apps only if specific OS features required.
- For a personal project, you can defer some server-side robustness (strong conflict resolution) until multi-user is needed.
- Keep analytics off by default; add opt-in telemetry later.
- Test PWA on real devices early: iOS Safari has different behavior than desktop Chrome.
- Request persistent storage (`navigator.storage.persist()`) to prevent data eviction on iOS.
- AI features (Epic 7) are optional enhancements; implement after MVP is stable and core workflows are validated.
- Start with client-side AI (TensorFlow.js, Tesseract.js) to minimize costs and preserve privacy; add cloud APIs only when needed.
- Native apps (Capacitor/React Native) can be Phase 2 if user demand justifies development effort.
