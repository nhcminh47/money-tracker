# UI Design System - Money Tracker

## Design Philosophy
- **Minimalist & Clean**: Focus on content, reduce visual noise
- **Professional**: Suitable for financial tracking with trustworthy aesthetics
- **Accessible**: WCAG 2.1 AA compliant, readable, high contrast
- **Mobile-First**: Optimized for touch interactions and small screens

## Color Palette

### Primary Colors
```css
--primary-50: #f0f9ff;
--primary-100: #e0f2fe;
--primary-500: #0ea5e9;  /* Main brand color - Sky Blue */
--primary-600: #0284c7;
--primary-700: #0369a1;
--primary-900: #0c4a6e;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Semantic Colors
```css
--success: #10b981;  /* Green for income, positive actions */
--danger: #ef4444;   /* Red for expenses, deletions */
--warning: #f59e0b;  /* Orange for alerts */
--info: #3b82f6;     /* Blue for information */
```

### Dark Mode
```css
--dark-bg: #0f172a;       /* Slate-900 */
--dark-surface: #1e293b;  /* Slate-800 */
--dark-border: #334155;   /* Slate-700 */
```

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
```

### Type Scale
- **Heading 1**: 2rem (32px), font-weight: 700
- **Heading 2**: 1.5rem (24px), font-weight: 600
- **Heading 3**: 1.25rem (20px), font-weight: 600
- **Body Large**: 1rem (16px), font-weight: 400
- **Body**: 0.875rem (14px), font-weight: 400
- **Caption**: 0.75rem (12px), font-weight: 400

## Spacing System
Use 4px base unit (Tailwind's spacing scale):
- xs: 4px (1)
- sm: 8px (2)
- md: 16px (4)
- lg: 24px (6)
- xl: 32px (8)
- 2xl: 48px (12)

## Components

### Buttons

#### Primary Button
```tsx
<button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Action
</button>
```

#### Secondary Button
```tsx
<button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
  Action
</button>
```

#### Ghost Button
```tsx
<button className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
  Action
</button>
```

### Cards
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  {/* Content */}
</div>
```

### Input Fields
```tsx
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>
```

### Stat Cards
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
    Label
  </div>
  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
    Value
  </div>
</div>
```

### Transaction List Item
```tsx
<div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      🍔
    </div>
    <div>
      <div className="font-medium text-gray-900 dark:text-gray-100">Food & Dining</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">Today, 12:30 PM</div>
    </div>
  </div>
  <div className="text-right">
    <div className="font-semibold text-red-600 dark:text-red-400">-$25.00</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">Cash</div>
  </div>
</div>
```

## Icons
- Use emoji for quick prototyping
- Replace with proper icon library (Lucide React, Heroicons) for production
- Size: 20px for inline icons, 24px for standalone

## Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

## Border Radius
- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)
- full: 9999px (circular)

## Animations
```css
/* Transitions - use for interactive elements */
transition: all 200ms ease-in-out;

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Layout Patterns

### Dashboard Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Form Layout
```tsx
<div className="space-y-6 max-w-2xl">
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Label
    </label>
    <input />
  </div>
</div>
```

### List Layout
```tsx
<div className="space-y-1">
  {items.map(item => (
    <div key={item.id} className="...">
      {/* Item */}
    </div>
  ))}
</div>
```

## Responsive Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Accessibility Guidelines
- All interactive elements must be keyboard accessible
- Focus states must be visible (ring-2 ring-primary-500)
- Color contrast ratio ≥ 4.5:1 for text
- Use semantic HTML (button, nav, header, main, etc.)
- Labels for all form inputs
- Alt text for images (if used)

## Don'ts
❌ Avoid heavy gradients on backgrounds
❌ No glass morphism effects (poor accessibility)
❌ Don't use more than 3 colors in a single component
❌ Avoid animations longer than 300ms
❌ No auto-playing animations
❌ Don't rely on color alone to convey information

## Do's
✅ Use consistent spacing
✅ Maintain high contrast
✅ Keep interactions simple and predictable
✅ Use loading states for async operations
✅ Provide clear error messages
✅ Make touch targets at least 44x44px
