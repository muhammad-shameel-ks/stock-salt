---
name: ui-ux-design
description:
  Apply UI/UX design principles, accessibility standards, and component patterns
  for the Salt Premium Stock Management system. Use when designing interfaces,
  reviewing UI code, creating design systems, or implementing responsive layouts
  with Tailwind CSS.
location: .opencode/skills/ui-ux-design.md
---

# 🎨 UI/UX Design Skill

Comprehensive guide for designing user interfaces and experiences following industry best practices, accessibility standards, and modern design patterns — with specific guidelines for the Salt Premium aesthetic used in the Stock Management module.

## 🎯 When to Use This Skill

- Designing new UI components or pages for Stock Management
- Reviewing existing UI code for usability issues
- Creating or maintaining design systems
- Implementing responsive layouts with Tailwind CSS
- Ensuring accessibility compliance (WCAG)
- Optimizing UI performance
- Conducting user research planning
- Choosing appropriate UI frameworks and patterns
- Implementing Salt Premium "tactile" interactions

---

## 🧂 Salt Premium Design System

Project-specific design system for the Stock Management module featuring a tactile, high-energy, mobile-first aesthetic.

### Design Philosophy

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Tactile First** | Elements should feel like they can be pressed | Use `active:scale-95` on buttons and cards |
| **High Contrast, High Energy** | Deep blacks with vibrant accents | `font-black` text with primary color pops |
| **Whitespace as a Feature** | Don't crowd the screen | Large padding (`p-6`, `p-8`) and wide gaps |
| **Glassmorphism Lite** | Subtle transparency for context | `backdrop-blur-md` and `bg-background/80` |

### Core Layout Patterns

#### The Hub (Management Overview)
Used for dashboards and "choice" screens.

- **Hero Banner**: Large, rounded container (`rounded-[2.5rem]`) with gradient background (`from-primary to-primary/80`). Contains primary "Day Goal" or status.
- **Stats Grid**: Bento-box style cards with subtle background tints (`bg-primary/5`) and no borders.
- **Selection List**: Large interactive cards (`p-5`, `rounded-[2rem]`) with clear icons and "done" states in emerald green.

```jsx
// Hero Banner Example
<div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
  <h1 className="text-3xl font-black tracking-tight">Day Goal: 85%</h1>
  <p className="opacity-80">Target: 500 units</p>
</div>
```

#### Action Mode (Task Focused)
Used for data entry (like Stock Distribution).

- **Sticky Status Header**: Keeps essential context (Outlet Name, Date) visible at all times.
- **Floating Action Footer**: Sticky button at the bottom with `bg-gradient-to-t` overlay for readability.
- **Search Integration**: Prominent, rounded search bars (`rounded-2xl`) to reduce friction.

```jsx
// Sticky Footer with Gradient
<div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4">
  <Button className="w-full rounded-full active:scale-95 transition-transform">
    Save Distribution
  </Button>
</div>
```

### Visual Primitives

#### Colors & Gradients

| Type | Utility Class | Usage |
|------|---------------|-------|
| **Primary** | `bg-primary`, `text-primary` | Main actions, branding |
| **Success** | `bg-emerald-500`, `text-emerald-600` | Completed status, confirmed actions |
| **Accent Hint** | `bg-primary/5` | Card backgrounds, hover states |
| **Gradient** | `bg-gradient-to-br from-primary via-primary/90 to-primary/80` | Performance banners |

#### Border Radii

| Radius | Value | Usage |
|--------|-------|-------|
| **Super Rounded** | `rounded-[2.5rem]` | Banners, special containers |
| **Standard Card** | `rounded-[2rem]` | Main interactive items |
| **Control/Input** | `rounded-2xl` | Search bars, smaller cards |
| **Interactive** | `rounded-full` | Buttons, counters |

#### Typography

```css
/* Headings */
text-3xl font-black tracking-tight

/* Subheaders - Uppercase with wide tracking */
tracking-[0.2em] font-black uppercase

/* Labels - Small, intense */
text-[10px] font-black uppercase opacity-60 tracking-widest

/* Numbers - Tabular for alignment */
tabular-nums
```

### Components

#### The Stock Counter (Interactive Entry)

For mobile-first quantity management:

```jsx
<div className="flex items-center gap-3">
  <Button 
    variant="outline" 
    size="icon"
    className="rounded-full active:scale-95 transition-transform"
  >
    <Minus className="h-4 w-4" />
  </Button>
  
  <div className="relative">
    <Input 
      className="text-center font-bold tabular-nums w-20 rounded-2xl" 
      value={quantity}
    />
    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60">
      unit
    </span>
  </div>
  
  <Button 
    variant="outline" 
    size="icon"
    className="rounded-full active:scale-95 transition-transform"
  >
    <Plus className="h-4 w-4" />
  </Button>
</div>
```

#### Value Badges

```jsx
<Badge 
  variant="outline" 
  className="bg-primary/5 border-primary/20"
>
  {value}
</Badge>
```

### Premium Form & Modal Design

For data entry and editing (e.g., `MenuForm`):

#### The Shell

```jsx
<DialogContent className="rounded-[2rem] max-w-lg">
  {/* Dialog content */}
</DialogContent>
```

#### Dynamic Headers

```jsx
<DialogHeader>
  <DialogTitle className="font-black italic uppercase tracking-tighter">
    Add New Item
  </DialogTitle>
  <DialogDescription className="text-muted-foreground">
    Configure the menu item details below.
  </DialogDescription>
</DialogHeader>
```

#### Field Grouping

```jsx
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">
      Price
    </Label>
    <Input className="rounded-2xl bg-muted/30 border-none shadow-inner" />
  </div>
  <div className="space-y-2">
    <Label className="text-[10px] font-black uppercase opacity-60 tracking-widest">
      Local Name
    </Label>
    <Input className="rounded-2xl bg-muted/30 border-none shadow-inner" />
  </div>
</div>
```

#### Tactile Data Entry

```jsx
{/* Pressed-in input look */}
<Input 
  className="rounded-2xl bg-muted/30 border-none shadow-inner focus:ring-2 focus:ring-primary/20"
/>

{/* Toggle/Checkbox Container */}
<div className="bg-muted/30 border-2 border-dashed rounded-2xl p-4">
  {/* Checkbox group */}
</div>
```

#### Button Synergy

```jsx
<div className="flex gap-3">
  <Button variant="ghost" className="rounded-xl flex-1">
    Cancel
  </Button>
  <Button className="rounded-full flex-1 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
    Save Changes
  </Button>
</div>
```

### Responsive Strategy

#### Mobile (< 640px)

```css
/* Sticky footers mandatory */
.sticky-footer {
  @apply sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-8 pb-4;
}

/* Single column lists */
.list-container {
  @apply flex flex-col gap-3;
}

/* Large touch targets */
.touch-target {
  @apply min-h-[44px];
}
```

#### Big Screen (> 1024px)

```css
/* Container limits */
.page-container {
  @apply max-w-screen-xl mx-auto;
}

/* Hub list to grid */
.hub-grid {
  @apply grid grid-cols-2 lg:grid-cols-3 gap-4;
}

/* Inset sidebar effect */
.sidebar-inset {
  @apply variant-inset; /* shadcn/ui sidebar variant */
}
```

### Micro-Interactions

#### Entrance Animation

```jsx
// List item entrance
<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
  {/* Content */}
</div>
```

#### Button Feedback

```css
/* Always include subtle scale or color shift */
.btn-interactive {
  @apply active:scale-95 transition-all duration-150;
}

/* Hover elevation */
.btn-elevate {
  @apply hover:shadow-lg hover:-translate-y-0.5 transition-all;
}
```

#### Progress Bars

```jsx
<Progress 
  value={progress} 
  className="transition-all duration-1000 ease-out"
/>
```

---

## 📐 Core UI/UX Principles

### 1. Visual Hierarchy

Guide user attention through intentional design:

```
Priority Levels:
├── Primary (H1, main CTA, key metrics) - Highest contrast, largest size
├── Secondary (H2, secondary actions) - Medium contrast
├── Tertiary (H3, supporting text) - Lower contrast
└── Quaternary (metadata, captions) - Lowest contrast
```

**Implementation Guidelines:**
- Use size, color, and spacing to establish hierarchy
- Limit primary actions to 1-2 per screen
- Maintain consistent heading levels (H1 → H2 → H3)
- Apply the F-pattern or Z-pattern for content layout

### 2. Consistency

Maintain uniformity across the interface:

| Aspect | Guideline |
|--------|-----------|
| **Spacing** | Use 4px or 8px grid system |
| **Typography** | Limit to 2-3 font families, 5-7 sizes |
| **Colors** | Define semantic color tokens |
| **Components** | Reuse patterns, don't reinvent |
| **Interactions** | Consistent hover, focus, active states |

### 3. Feedback & Responsiveness

Every user action needs a response:

```javascript
// Interaction Feedback States
const states = {
  default: 'Base appearance',
  hover: 'Cursor change + subtle elevation/color shift',
  focus: 'Visible outline (2-3px) for keyboard users',
  active: 'Pressed/depressed appearance',
  disabled: 'Reduced opacity + no pointer events',
  loading: 'Spinner/skeleton + disabled state'
};
```

### 4. Error Prevention & Recovery

- Validate input in real-time when possible
- Provide clear, actionable error messages
- Offer undo functionality for destructive actions
- Use confirmation dialogs for irreversible actions
- Preserve user input on form errors

---

## ♿ Accessibility Guidelines (WCAG 2.1 AA)

### Perceivable

| Requirement | Implementation |
|-------------|----------------|
| **Text Alternatives** | `alt` text for images, `aria-label` for icons |
| **Captions** | Provide for video content |
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Text Resizing** | Support up to 200% without loss of content |
| **Images of Text** | Avoid; use actual text with CSS styling |

### Operable

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Access** | All functionality via keyboard |
| **Focus Order** | Logical tab order matching visual flow |
| **Focus Visible** | Never remove outline without replacement |
| **Skip Links** | Provide "Skip to main content" link |
| **No Timing** | Avoid time limits or allow extensions |
| **No Seizures** | No content flashing >3 times/second |

### Understandable

| Requirement | Implementation |
|-------------|----------------|
| **Language** | Set `lang` attribute on HTML |
| **Consistent Navigation** | Same order across pages |
| **Consistent Identification** | Same function = same label |
| **Error Identification** | Clearly describe form errors |
| **Error Suggestions** | Provide correction guidance |
| **Error Prevention** | Confirmations for important actions |

### Robust

| Requirement | Implementation |
|-------------|----------------|
| **Valid HTML** | Pass W3C validation |
| **Name, Role, Value** | Proper ARIA attributes |
| **Status Messages** | Use `aria-live` regions |

### Quick Accessibility Checklist

```markdown
- [ ] All images have alt text (or alt="" for decorative)
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Focus states visible on all interactive elements
- [ ] Form labels associated with inputs (for/id or aria-labelledby)
- [ ] Error messages linked to inputs (aria-describedby)
- [ ] Skip navigation link present
- [ ] Page has proper heading hierarchy
- [ ] Interactive elements accessible via keyboard
- [ ] ARIA landmarks used (main, nav, header, footer)
- [ ] No content relies solely on color to convey meaning
```

---

## 📱 Responsive Design Considerations

### Breakpoint Strategy

```css
/* Mobile-First Approach */
:root {
  --bp-sm: 640px;   /* Small devices */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Laptops */
  --bp-xl: 1280px;  /* Desktops */
  --bp-2xl: 1536px; /* Large screens */
}

/* Usage */
.element {
  /* Mobile styles (default) */
  
  @media (min-width: 640px) {
    /* Small up */
  }
  
  @media (min-width: 768px) {
    /* Medium up */
  }
  
  @media (min-width: 1024px) {
    /* Large up */
  }
}
```

### Responsive Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Fluid Grid** | Layout structure | CSS Grid with `fr` units |
| **Flexible Images** | Media content | `max-width: 100%; height: auto` |
| **Breakpoint Layout** | Major restructuring | Different layouts per breakpoint |
| **Off-Canvas** | Mobile navigation | Slide-in menus |
| **Progressive Disclosure** | Content prioritization | Show/hide based on space |
| **Responsive Typography** | Text scaling | `clamp()` function |

### Touch Target Guidelines

```
Minimum Touch Target: 44x44 pixels (iOS) / 48x48 dp (Material)
Spacing Between Targets: 8px minimum
Thumb Zone Considerations:
├── Primary actions: Bottom 1/3 of screen
├── Secondary actions: Middle third
└── Tertiary actions: Top third (harder to reach)
```

### Responsive Images

```html
<!-- Art Direction -->
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Description">
</picture>

<!-- Resolution Switching -->
<img 
  srcset="image-320w.jpg 320w,
          image-480w.jpg 480w,
          image-800w.jpg 800w"
  sizes="(max-width: 600px) 320px,
         (max-width: 900px) 480px,
         800px"
  src="image-800w.jpg"
  alt="Description"
>
```

---

## 🎨 Design System Creation

### Token Structure

```
design-tokens/
├── colors.json
├── typography.json
├── spacing.json
├── borders.json
├── shadows.json
├── breakpoints.json
└── animations.json
```

### Color System

```json
{
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "900": "#1e3a8a"
    },
    "semantic": {
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    "neutral": {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "900": "#18181b"
    }
  }
}
```

### Typography Scale

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Font Sizes (using modular scale) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
}
```

### Component Documentation Template

```markdown
## Component: [Name]

### Description
[Brief description of purpose]

### When to Use
- [Use case 1]
- [Use case 2]

### When NOT to Use
- [Alternative case 1]
- [Alternative case 2]

### Anatomy
[Diagram or description of parts]

### Props/API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ... | ... | ... | ... |

### States
- Default
- Hover
- Focus
- Active
- Disabled
- Loading

### Accessibility
- [ARIA attributes]
- [Keyboard interactions]
- [Screen reader announcements]

### Examples
[Code examples]
```

---

## 🔬 User Research & Testing Methods

### Research Methods Matrix

| Method | When to Use | Output | Effort |
|--------|-------------|--------|--------|
| **User Interviews** | Discovery, problem validation | Insights, quotes | Medium |
| **Surveys** | Quantitative validation | Stats, trends | Low |
| **Usability Testing** | Prototype/product validation | Issues, success rates | Medium |
| **A/B Testing** | Design decision validation | Conversion data | High |
| **Analytics Review** | Ongoing optimization | Behavior patterns | Low |
| **Card Sorting** | IA planning | Category structures | Low |
| **Tree Testing** | IA validation | Success rates | Low |
| **Heatmaps** | Layout optimization | Click/scroll patterns | Low |

### Usability Testing Script Template

```markdown
# Usability Test: [Task Name]

## Pre-Test Questions
1. How often do you [relevant activity]?
2. What tools do you currently use for [task]?
3. What frustrates you about current solutions?

## Tasks (Think Aloud Protocol)

### Task 1: [Primary Task]
- Scenario: [Context]
- Success Criteria: [What completion looks like]
- Time Limit: [Optional]

### Task 2: [Secondary Task]
...

## Post-Test Questions
1. What was easiest?
2. What was most difficult?
3. How would you describe this to a colleague?
4. Rate overall ease of use (1-10)

## Observer Notes
- [ ] Completed without help
- [ ] Needed hints
- [ ] Expressed confusion
- [ ] Expressed delight
- [ ] Error made: [description]
```

### Heuristic Evaluation (Nielsen's 10 Heuristics)

1. **Visibility of System Status** - Users know what's happening
2. **Match Between System and Real World** - Familiar language/concepts
3. **User Control and Freedom** - Undo, redo, exit options
4. **Consistency and Standards** - Follow platform conventions
5. **Error Prevention** - Prevent problems before they occur
6. **Recognition Rather Than Recall** - Visible options, not memory
7. **Flexibility and Efficiency of Use** - Shortcuts for experts
8. **Aesthetic and Minimalist Design** - No irrelevant information
9. **Help Users Recognize, Diagnose, Recover from Errors** - Clear error messages
10. **Help and Documentation** - Easy to find, task-focused

---

## ⚛️ UI Framework Conventions

### React Best Practices

```jsx
// Component Structure
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './Component.module.css';

function Component({ prop1, prop2, onAction }) {
  // 1. Custom hooks
  const { data, loading } = useCustomHook(prop1);
  
  // 2. State declarations
  const [localState, setLocalState] = useState(initialValue);
  
  // 3. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 4. Event handlers (memoized)
  const handleClick = useCallback(() => {
    onAction?.(data);
  }, [data, onAction]);
  
  // 5. Render logic
  if (loading) return <LoadingSkeleton />;
  if (!data) return <EmptyState />;
  
  // 6. Return JSX
  return (
    <div className={styles.container}>
      {/* Content */}
    </div>
  );
}

Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

Component.defaultProps = {
  prop2: 0
};

export default Component;
```

### Vue Best Practices

```vue
<!-- Component Structure -->
<template>
  <div :class="$styles.container">
    <slot name="header" />
    
    <component 
      :is="dynamicComponent"
      v-bind="componentProps"
      @event="handleEvent"
    />
    
    <slot name="footer" />
  </div>
</template>

<script setup>
// 1. Imports
import { ref, computed, watch, onMounted } from 'vue';
import { useCustomComposable } from '@/composables';

// 2. Props & Emits
const props = defineProps({
  prop1: { type: String, required: true },
  prop2: { type: Number, default: 0 }
});

const emit = defineEmits(['update', 'action']);

// 3. Composables
const { data, loading } = useCustomComposable(props.prop1);

// 4. Reactive state
const localState = ref(initialValue);

// 5. Computed properties
const computedValue = computed(() => {
  return props.prop1 + localState.value;
});

// 6. Watchers
watch(() => props.prop1, (newVal) => {
  // React to prop changes
});

// 7. Lifecycle hooks
onMounted(() => {
  // Setup
});

// 8. Methods
const handleEvent = (payload) => {
  emit('action', payload);
};
</script>

<style module>
.container {
  /* Styles */
}
</style>
```

### Framework Comparison

| Aspect | React | Vue | Angular | Svelte |
|--------|-------|-----|---------|--------|
| **Learning Curve** | Medium | Low | High | Low |
| **Bundle Size** | Medium | Small | Large | Smallest |
| **State Management** | Context/Redux/Zustand | Pinia/Vuex | NgRx/Signals | Stores |
| **Styling** | CSS Modules/Styled | Scoped CSS | Component CSS | Scoped CSS |
| **SSR Support** | Next.js | Nuxt | Universal | SvelteKit |
| **TypeScript** | Excellent | Excellent | Excellent | Good |

---

## 🎨 Color Theory & Typography

### Color Theory Basics

#### Color Harmonies

```
Complementary:     Opposite on color wheel (high contrast)
Analogous:         Adjacent colors (harmonious)
Triadic:           Three evenly spaced (vibrant)
Split-Complementary: Base + two adjacent to complement (balanced)
Tetradic:          Four colors in rectangle (rich)
Monochromatic:     Single hue, varied saturation/lightness (cohesive)
```

#### Color Psychology

| Color | Associations | Common Uses |
|-------|--------------|-------------|
| **Blue** | Trust, stability, calm | Finance, tech, healthcare |
| **Green** | Growth, nature, success | Eco, finance, health |
| **Red** | Urgency, passion, danger | Sales, food, warnings |
| **Yellow** | Optimism, attention, caution | CTAs, warnings, kids |
| **Purple** | Luxury, creativity, wisdom | Beauty, creative, premium |
| **Orange** | Energy, friendliness, fun | CTA, food, entertainment |
| **Black** | Sophistication, power, elegance | Luxury, fashion, tech |
| **White** | Clean, simple, pure | Minimal, healthcare, tech |

#### Accessible Color Combinations

```javascript
// Contrast Ratio Calculator Reference
const contrastRequirements = {
  'AA Normal Text': '4.5:1',
  'AA Large Text': '3:1',      // 18pt+ or 14pt+ bold
  'AAA Normal Text': '7:1',
  'AAA Large Text': '4.5:1',
  'UI Components': '3:1'
};

// Tools: WebAIM Contrast Checker, Stark, Colorable
```

### Typography Fundamentals

#### Font Pairing Strategies

```
Strategy 1: Superfamily (same family, different weights)
  └── Source Sans Pro (UI) + Source Serif Pro (headings)

Strategy 2: Contrast (serif + sans-serif)
  └── Playfair Display (headings) + Lato (body)

Strategy 3: Complementary Sans
  └── Montserrat (headings) + Open Sans (body)

Strategy 4: Mono Accent
  └── Inter (UI) + Fira Code (code/technical)
```

#### Readability Guidelines

```css
/* Optimal Reading Conditions */
.readable-text {
  /* Line Length */
  max-width: 65ch;  /* 45-75 characters per line */
  
  /* Line Height */
  line-height: 1.5;  /* 1.4-1.6 for body text */
  
  /* Letter Spacing */
  letter-spacing: -0.02em;  /* Slight tightening for headings */
  
  /* Paragraph Spacing */
  margin-bottom: 1em;
  
  /* Text Alignment */
  text-align: left;  /* Avoid justified on web */
}
```

#### Typography Hierarchy Template

```css
/* Heading Scale */
h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 1rem;
}

/* Body Text */
p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Supporting Text */
.small, caption, figcaption {
  font-size: 0.875rem;
  line-height: 1.5;
}
```

---

## 🖱️ Interaction Design Patterns

### Common Patterns

#### Navigation Patterns

| Pattern | Best For | Considerations |
|---------|----------|----------------|
| **Top Nav** | Primary site navigation | Limit to 5-7 items |
| **Side Nav** | Complex apps, many sections | Collapsible for mobile |
| **Tab Nav** | Related content sections | Max 5-7 tabs visible |
| **Mega Menu** | E-commerce, content sites | Organize with categories |
| **Hamburger** | Mobile primary nav | Consider bottom nav alternative |
| **Breadcrumbs** | Deep hierarchies | Show current location |

#### Form Patterns

```markdown
## Single Column Layout
- Stack fields vertically
- Faster completion
- Better mobile experience

## Inline Validation
- Validate on blur or after 300ms pause
- Show success state for positive reinforcement
- Group related errors near field

## Progressive Disclosure
- Show essential fields first
- Reveal additional fields based on selection
- Use accordions for optional sections

## Multi-step Forms
- Show progress indicator
- Allow going back
- Save progress automatically
- Summarize before submission
```

#### Feedback Patterns

| Pattern | Trigger | Duration |
|---------|---------|----------|
| **Toast** | Non-critical notifications | 3-5 seconds |
| **Snackbar** | Action-related feedback | Until dismissed |
| **Modal** | Critical decisions | Until user acts |
| **Inline Error** | Form validation | Until fixed |
| **Loading Spinner** | Short operations (<2s) | Until complete |
| **Skeleton Screen** | Content loading | Until rendered |
| **Progress Bar** | Long operations (>2s) | Until complete |

### Microinteractions

```javascript
// Microinteraction Structure
const microinteraction = {
  trigger: 'user action or system state change',
  rules: 'what happens when triggered',
  feedback: 'visual/auditory/haptic response',
  loops: 'duration and repetition rules'
};

// Examples:
// - Button press animation (150-300ms)
// - Pull-to-refresh indicator
// - Like button heart animation
// - Toggle switch slide
// - Loading progress animation
```

### Animation Guidelines

```css
/* Timing Functions */
:root {
  --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

/* Duration Guidelines */
.duration-guide {
  /* Instant: 0-100ms - Immediate feedback */
  /* Fast: 100-300ms - UI state changes */
  /* Normal: 300-500ms - Transitions, modals */
  /* Slow: 500ms+ - Complex animations, onboarding */
}

/* Motion Principles */
.motion-principles {
  /* Purposeful: Animation should have meaning */
  /* Performant: Use transform and opacity only */
  /* Accessible: Respect prefers-reduced-motion */
  /* Consistent: Same animation for same action */
}
```

```css
/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## ⚡ UI Performance Optimization

### Performance Budget

```javascript
const performanceBudget = {
  // Load Times
  firstContentfulPaint: '< 1.5s',
  largestContentfulPaint: '< 2.5s',
  timeToInteractive: '< 3.5s',
  cumulativeLayoutShift: '< 0.1',
  firstInputDelay: '< 100ms',
  
  // Asset Sizes
  totalPageSize: '< 500KB',
  javascriptSize: '< 200KB',
  cssSize: '< 50KB',
  imageSize: '< 200KB',
  fontFileSize: '< 50KB',
  
  // Core Web Vitals Targets
  lcp: '< 2.5s',
  fid: '< 100ms',
  cls: '< 0.1'
};
```

### Image Optimization

```html
<!-- Modern Formats with Fallback -->
<picture>
  <source type="image/avif" srcset="image.avif">
  <source type="image/webp" srcset="image.webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>

<!-- Lazy Loading -->
<img src="image.jpg" loading="lazy" decoding="async" alt="...">

<!-- Responsive Images -->
<img 
  srcset="small.jpg 480w, medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 768px, 1200px"
  src="large.jpg"
  alt="..."
>
```

### CSS Optimization

```css
/* Critical CSS - Inline in head */
<style>
  /* Above-the-fold styles only */
  .hero, .nav, .header { ... }
</style>

/* Defer non-critical CSS */
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>

/* CSS Containment */
.component {
  contain: layout style paint;
}

/* Will-change (use sparingly) */
.animated {
  will-change: transform, opacity;
}
```

### JavaScript Optimization

```javascript
// Code Splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Debounce expensive operations
const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);

// Virtualize long lists
import { VirtualList } from 'react-window';

// Use Web Workers for heavy computation
const worker = new Worker('heavy-task.js');

// Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Load content
      observer.unobserve(entry.target);
    }
  });
});
```

### Rendering Optimization

```jsx
// React: Memoization
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// React: useMemo for calculations
const filteredData = useMemo(() => {
  return data.filter(/* expensive filter */);
}, [data, filter]);

// React: useCallback for functions
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Virtual Scrolling for long lists
import { FixedSizeList } from 'react-window';
```

### Performance Checklist

```markdown
## Pre-Load Optimization
- [ ] Minify and compress assets
- [ ] Enable gzip/brotli compression
- [ ] Use CDN for static assets
- [ ] Implement HTTP/2 or HTTP/3
- [ ] Set proper cache headers

## Image Optimization
- [ ] Use modern formats (WebP, AVIF)
- [ ] Implement responsive images
- [ ] Lazy load below-fold images
- [ ] Specify image dimensions (prevent CLS)
- [ ] Use SVG for icons/logos

## Code Optimization
- [ ] Code split by route
- [ ] Tree shake unused code
- [ ] Defer non-critical JavaScript
- [ ] Remove unused CSS
- [ ] Use CSS containment

## Rendering Optimization
- [ ] Implement virtual scrolling
- [ ] Use React.memo appropriately
- [ ] Optimize re-renders
- [ ] Use CSS animations over JS
- [ ] Implement skeleton screens

## Monitoring
- [ ] Set up Core Web Vitals tracking
- [ ] Configure performance budgets
- [ ] Monitor real user metrics (RUM)
- [ ] Set up error tracking
```

---

## 🔄 Workflows

### Workflow 1: New Component Design

```
1. REQUIREMENTS
   ├── Define component purpose
   ├── Identify user needs
   └── List functional requirements

2. RESEARCH
   ├── Review design system tokens
   ├── Check existing components
   └── Gather accessibility requirements

3. DESIGN
   ├── Create wireframe/sketch
   ├── Define states (default, hover, focus, disabled)
   ├── Specify responsive behavior
   └── Document props/API

4. IMPLEMENT
   ├── Set up component structure
   ├── Apply design tokens
   ├── Add accessibility attributes
   ├── Implement responsive styles
   └── Add unit tests

5. REVIEW
   ├── Accessibility audit
   ├── Cross-browser testing
   ├── Performance check
   └── Design review

6. DOCUMENT
   ├── Add to Storybook/docs
   ├── Update design system
   └── Write usage examples
```

### Workflow 2: Accessibility Audit

```
1. AUTOMATED SCAN
   ├── Run axe-core or Lighthouse
   ├── Check color contrast
   └── Validate HTML structure

2. KEYBOARD NAVIGATION
   ├── Tab through all elements
   ├── Verify focus order
   ├── Check focus visibility
   └── Test skip links

3. SCREEN READER TEST
   ├── Test with NVDA/VoiceOver
   ├── Verify ARIA labels
   ├── Check heading structure
   └── Test form announcements

4. VISUAL IMPAIRMENT
   ├── Zoom to 200%
   ├── Check text resizing
   ├── Verify no content loss
   └── Test high contrast mode

5. DOCUMENT & FIX
   ├── List all issues
   ├── Prioritize by severity
   ├── Fix critical issues first
   └── Re-test after fixes
```

### Workflow 3: Responsive Implementation

```
1. CONTENT AUDIT
   ├── List all content elements
   ├── Identify priority content
   └── Determine breakpoints needed

2. MOBILE-FIRST BASE
   ├── Design for smallest screen
   ├── Stack content vertically
   ├── Optimize touch targets
   └── Minimize asset sizes

3. PROGRESSIVE ENHANCEMENT
   ├── Add tablet styles (768px+)
   ├── Add desktop styles (1024px+)
   └── Add large screen styles (1280px+)

4. TEST ACROSS DEVICES
   ├── Browser DevTools
   ├── Real device testing
   ├── Orientation changes
   └── Different pixel densities

5. OPTIMIZE
   ├── Check performance metrics
   ├── Optimize images per breakpoint
   ├── Review touch interactions
   └── Verify accessibility
```

---

## 📋 Quick Reference

### Color Contrast Checker

```javascript
// WCAG Contrast Formula
function getContrastRatio(luminance1, luminance2) {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Minimum Ratios
const MIN_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
  UI_COMPONENTS: 3
};
```

### Spacing Scale Quick Reference

```
--space-1:  4px   (tight spacing)
--space-2:  8px   (default gap)
--space-3:  12px  (section padding)
--space-4:  16px  (component padding)
--space-6:  24px  (section margin)
--space-8:  32px  (page padding)
--space-12: 48px  (large sections)
--space-16: 64px  (page sections)
```

### Font Size Quick Reference

```
12px (0.75rem) - Captions, labels
14px (0.875rem) - Secondary text, inputs
16px (1rem)     - Body text
18px (1.125rem) - Lead paragraphs
20px (1.25rem)  - H4, emphasis
24px (1.5rem)   - H3
30px (1.875rem) - H2
36px (2.25rem)  - H1 (mobile)
48px (3rem)     - H1 (desktop)
```

### Salt Premium Quick Reference

```css
/* Super Rounded */
rounded-[2.5rem]    /* Banners */
rounded-[2rem]      /* Cards */
rounded-2xl         /* Inputs */
rounded-full        /* Buttons */

/* Tactile */
active:scale-95     /* Press effect */
shadow-inner        /* Pressed-in look */

/* Typography */
font-black          /* Heavy headings */
tracking-tight      /* Heading tracking */
tracking-[0.2em]    /* Wide uppercase */
tabular-nums        /* Numbers */

/* Animation */
animate-in fade-in slide-in-from-bottom-2 duration-300
transition-all duration-1000  /* Progress bars */
```

---

## 🛠️ Tools & Resources

### Design Tools
- **Figma** - Collaborative interface design
- **Sketch** - Vector-based UI design
- **Adobe XD** - All-in-one UX/UI tool
- **Penpot** - Open-source design tool

### Accessibility Tools
- **axe DevTools** - Browser extension for a11y testing
- **WAVE** - Web accessibility evaluation
- **Stark** - Contrast checker plugin
- **VoiceOver/NVDA** - Screen readers for testing

### Performance Tools
- **Lighthouse** - Performance auditing
- **WebPageTest** - Detailed performance analysis
- **Chrome DevTools** - Performance profiling
- **Bundle Analyzer** - JavaScript bundle visualization

### Testing Tools
- **BrowserStack** - Cross-browser testing
- **Responsively** - Responsive design testing
- **Hotjar** - Heatmaps and user recordings
- **Optimal Workshop** - Card sorting, tree testing

---

## 📚 Further Reading

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Nielsen Norman Group](https://www.nngroup.com/)
- [Material Design Guidelines](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/)
- [Web.dev - Learn](https://web.dev/learn/)
- [A11y Project](https://www.a11yproject.com/)
- [Refactoring UI](https://www.refactoringui.com/)

---

## 📄 Project Reference

For detailed Salt Premium design specifications specific to this Stock Management module, see:
- **[UI-GUIDE.md](./UI-GUIDE.md)** - Detailed design philosophy, components, and patterns

This skill file combines general UI/UX best practices with the Salt Premium aesthetic for consistent implementation across the project.
