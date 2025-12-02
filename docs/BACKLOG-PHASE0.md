# Backlog Phase 0 - Design System & UI Components

This phase focuses on establishing a clean, professional design system and building reusable UI components before implementing features.

## Epic 0.5 - Design System & Component Library
Priority: High (Foundation for all features)

### User Story 0.5.1: As a developer, I want a design system document so the UI is consistent.
**Tasks:**
- [x] Create UI-DESIGN-SYSTEM.md with color palette, typography, spacing
- [x] Define component patterns (buttons, cards, inputs, lists)
- [x] Document accessibility guidelines
- [x] Specify responsive breakpoints and layouts

**Acceptance Criteria:**
- Design system document exists in /docs
- All common components documented with code examples
- Color palette defined for light/dark modes
- Typography scale and spacing system defined

---

### User Story 0.5.2: As a developer, I want reusable UI components so I can build features faster.
**Tasks:**
- [ ] Create `/components/ui` folder for base components
- [ ] Build Button component (primary, secondary, ghost, danger variants)
- [ ] Build Card component with consistent styling
- [ ] Build Input component (text, number, select, textarea)
- [ ] Build Badge component for tags/categories
- [ ] Build Modal/Dialog component
- [ ] Build Toast notification component
- [ ] Build Loading spinner component
- [ ] Add TypeScript types for all components

**Acceptance Criteria:**
- All components in `/components/ui` folder
- Each component accepts className prop for customization
- Components support light/dark mode
- Components are TypeScript typed
- Components follow design system guidelines

**Files to create:**
```
components/ui/
  ├── Button.tsx
  ├── Card.tsx
  ├── Input.tsx
  ├── Select.tsx
  ├── Badge.tsx
  ├── Modal.tsx
  ├── Toast.tsx
  ├── Spinner.tsx
  └── index.ts (export all)
```

---

### User Story 0.5.3: As a developer, I want a style guide page to preview all components.
**Tasks:**
- [ ] Create `/app/styleguide/page.tsx` route
- [ ] Add navigation link to style guide (dev only)
- [ ] Display all button variants with examples
- [ ] Display all input types with examples
- [ ] Display card variations
- [ ] Display color palette swatches
- [ ] Display typography scale
- [ ] Display spacing examples
- [ ] Add dark mode toggle on style guide page

**Acceptance Criteria:**
- Style guide accessible at `/styleguide`
- All components visible with interactive examples
- Color palette displayed with hex codes
- Typography and spacing visually demonstrated
- Dark mode can be toggled to test components

---

### User Story 0.5.4: As a developer, I want clean global styles without gradients or heavy effects.
**Tasks:**
- [ ] Simplify `app/globals.css` - remove gradients
- [ ] Use solid background colors (gray-50/slate-900)
- [ ] Remove glass morphism effects
- [ ] Simplify animations (fade, slide only)
- [ ] Use subtle shadows (shadow-sm, shadow)
- [ ] Keep transitions under 200ms
- [ ] Ensure high contrast for accessibility

**Acceptance Criteria:**
- No gradient backgrounds
- Clean, flat design with subtle depth
- Fast, subtle animations only
- Passes WCAG AA contrast requirements
- Professional, trustworthy appearance

---

### User Story 0.5.5: As a developer, I want a clean layout component for consistent page structure.
**Tasks:**
- [ ] Create `components/Layout.tsx` with header, main, nav
- [ ] Create `components/Header.tsx` with app title
- [ ] Simplify `components/Navigation.tsx` styling
- [ ] Add `components/PageHeader.tsx` for page titles
- [ ] Create `components/EmptyState.tsx` for empty lists

**Acceptance Criteria:**
- Layout component wraps all pages consistently
- Header is clean and minimal
- Navigation uses simple active states
- Empty states are informative and actionable

---

## Implementation Order

1. **Week 0.1** (1-2 days):
   - Review and finalize UI-DESIGN-SYSTEM.md
   - Set up color variables in globals.css
   - Clean up existing gradients and effects

2. **Week 0.2** (2-3 days):
   - Build base UI components (Button, Card, Input, Badge)
   - Build utility components (Modal, Toast, Spinner)
   - Create index.ts for easy imports

3. **Week 0.3** (1-2 days):
   - Build style guide page
   - Test all components in light/dark mode
   - Document usage examples

4. **Week 0.4** (1 day):
   - Refactor existing pages to use new components
   - Clean up Dashboard, Navigation, Layout
   - Remove old inconsistent styling

**Total Time: 5-8 days**

---

## Success Criteria for Phase 0.5
- [ ] Design system document complete and approved
- [ ] 8+ reusable UI components built
- [ ] Style guide page functional
- [ ] All existing pages refactored to use new components
- [ ] No gradient backgrounds or glass effects
- [ ] Clean, professional appearance
- [ ] WCAG AA accessibility compliance
- [ ] Dark mode working perfectly

---

## Notes
- This phase is critical for maintaining consistency as features are built
- Investing time here will speed up Phases 1-2
- Component library should be framework-agnostic (easy to port to native if needed)
- Keep components simple and composable
- Prioritize accessibility from the start
