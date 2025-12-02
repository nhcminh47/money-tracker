# Backlog — Money Tracker

This is the master backlog overview. For detailed phase-specific backlogs, see:
- **[Phase 1: Development](./BACKLOG-PHASE1.md)** - Epics 0-7: Project setup, core features, testing, and optional AI features
- **[Phase 2: UAT & Production Launch](./BACKLOG-PHASE2.md)** - Epics 8-9: User acceptance testing, beta testing, and production deployment

## Quick Overview

### Phase 0.5: Design System & UI Components (Epic 0.5)
**Goal:** Establish clean, professional design system and reusable component library

**Key Epic:**
- Epic 0.5: Design System & Component Library (Critical)

**Duration:** 5-8 days

### Phase 1: Development (Epics 0-7)
**Goal:** Build a working MVP with offline-first money tracking, sync, and optional AI features

**Key Epics:**
- Epic 0: Project Setup & Infrastructure (Critical)
- Epic 1: Core Data & Offline (High)
- Epic 2: Sync & Backup (Medium)
- Epic 3: Native Packaging & Updates (High)
- Epic 4: Authentication & Security (Medium)
- Epic 5: UX & Reports (Medium)
- Epic 6: Testing & CI/CD (Low)
- Epic 7: AI-Powered Features (Low, Optional)

**Duration:** 8-10 weeks (Sprints 0-5+)

### Phase 2: UAT & Production Launch (Epics 8-9)
**Goal:** Validate quality, fix critical issues, and launch to app stores

**Key Epics:**
- Epic 8: User Acceptance Testing (Critical)
- Epic 9: Production Launch & Monitoring (Critical)

**Duration:** 3 weeks (UAT Sprint + Launch Sprint)

## Timeline Overview
```
Phase 0.5 → Design system & UI components (5-8 days)
Sprint 0  → Project setup (1 week)
Sprint 1  → Core CRUD + Native scaffolding (2 weeks)
Sprint 2  → UI/UX + Dashboard (2 weeks)
Sprint 3  → Sync + Bundle updates (2 weeks)
Sprint 4  → Testing + CI/CD (1 week)
Sprint 5+ → AI features (optional, ongoing)
───────────────────────────────────────────
UAT       → Staging testing + automation (2 weeks)
Launch    → App store submission (1 week)
Post      → Monitoring + iteration (ongoing)
```

## Success Metrics
- **Phase 1 Exit Criteria:**
  - All Epic 1-5 user stories complete
  - Unit test coverage > 70%
  - E2E tests for critical flows passing
  - Staging deployment successful
  
- **Phase 2 Exit Criteria:**
  - Zero critical bugs
  - Test coverage > 80% for critical paths
  - App store approvals received
  - Crash-free rate > 99.5%

## References
- [High-Level Design (HLD)](./HLD.md)
- [Low-Level Design (LLD)](./LLD.md)
- [UI Design System](./UI-DESIGN-SYSTEM.md)
- [Phase 0.5 Backlog (Design System)](./BACKLOG-PHASE0.md)
- [Phase 1 Backlog (Development)](./BACKLOG-PHASE1.md)
- [Phase 2 Backlog (UAT & Launch)](./BACKLOG-PHASE2.md)

---

## Future Enhancements

### UI/UX Improvements
- [ ] **Expandable transaction cards** - Click to show full details inline instead of modal
- [ ] **Transaction attachments** - Support for receipts/photos
- [ ] **Split transactions** - Single transaction across multiple categories
- [ ] **Recurring transaction templates** - Quick add from saved templates
- [ ] **Bulk operations** - Select multiple transactions for batch edit/delete

### Advanced Features
- [ ] **Transaction detail page** - Dedicated page with full history/audit trail
- [ ] **Transaction search** - Full-text search across all fields
- [ ] **Advanced filters** - Multiple filters, saved filter presets
- [ ] **Export/Import** - CSV/Excel export, bulk import
- [ ] **Multi-currency support** - Handle transactions in different currencies
- [ ] **Transaction tags** - Custom tags for flexible categorization

### Analytics & Reports
- [ ] **Spending trends** - Visual charts showing spending patterns over time
- [ ] **Category insights** - Detailed breakdown per category
- [ ] **Budget vs actual reports** - Compare planned vs actual spending
- [ ] **Net worth tracking** - Track total assets minus liabilities over time
- [ ] **Custom date ranges** - Flexible reporting periods

### Integration
- [ ] **Bank sync** - Automatic transaction import from banks
- [ ] **Receipt OCR** - Extract transaction details from photos
- [ ] **Calendar integration** - Show transactions in calendar view
- [ ] **Reminders** - Payment due date notifications

