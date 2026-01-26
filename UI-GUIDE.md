# Salt & Stock UI Design Guide

This guide outlines the "Salt Premium" aesthetic used in the Stock Management module. The goal is to provide a tactile, high-energy, and mobile-first experience that feels professional yet modern.

## 1. Design Philosophy
- **Tactile First**: Elements should feel like they can be pressed. Use `active:scale-95` on buttons and cards.
- **High Contrast, High Energy**: Use deep blacks (`font-black`) paired with vibrant primary accents and soft background tints.
- **Whitespace as a Feature**: Don't crowd the screen. Use large padding (`p-6`, `p-8`) and wide gaps.
- **Glassmorphism Lite**: Use `backdrop-blur-md` and `bg-background/80` for sticky headers to maintain context.

## 2. Core Layout Patterns

### A. The Hub (Management Overview)
Used for dashboards and "choice" screens.
- **Hero Banner**: A large, rounded container (`rounded-[2.5rem]`) with a gradient background (`from-primary to-primary/80`). Contains the primary "Day Goal" or status.
- **Stats Grid**: Bento-box style cards with subtle background tints (`bg-primary/5`) and no borders.
- **Selection List**: Large interactive cards (`p-5`, `rounded-[2rem]`) with clear icons and "done" states in emerald green.

### B. Action Mode (Task Focused)
Used for data entry (like Stock Distribution).
- **Sticky Status Header**: Keeps essential context (Outlet Name, Date) visible at all times.
- **Floating Action Footer**: A sticky button at the bottom of the screen with a `bg-gradient-to-t` overlay to ensure readability.
- **Search Integration**: Prominent, rounded search bars (`rounded-2xl`) to reduce friction.

## 3. Visual Primitives

### Colors & Gradients
| Type | Utility Class | Usage |
| :--- | :--- | :--- |
| **Primary** | `bg-primary`, `text-primary` | Main actions, branding. |
| **Success** | `bg-emerald-500`, `text-emerald-600` | Completed status, confirmed actions. |
| **Accent Hint** | `bg-primary/5` | Card backgrounds, hover states. |
| **Gradient** | `bg-gradient-to-br from-primary via-primary/90 to-primary/80` | Performance banners. |

### Border Radii
- **Super Rounded**: `rounded-[2.5rem]` (Banners, special containers).
- **Standard Card**: `rounded-[2rem]` (Main interactive items).
- **Control/Input**: `rounded-2xl` (Search bars, smaller cards).
- **Interactive**: `rounded-full` (Buttons, counters).

### Typography
- **Headings**: `text-3xl font-black tracking-tight`. Always use uppercase for subheaders with wide tracking: `tracking-[0.2em] font-black`.
- **Labels**: `text-[10px] font-black uppercase opacity-60` for descriptive labels (e.g., "UNIT", "CATEGORY").
- **Numbers**: Use `tabular-nums` for quantities to prevent jitter during updates.

## 4. Components

### The Stock Counter (Interactive Entry)
For mobile-first quantity management:
- **Buttons**: Circular, outlined, with `active:scale-95`.
- **Input**: Bold, centered, with unit labels (`unit`) positioned absolutely to the right.

### Value Badges
- Use `Badge` with `variant="outline"` but customize with `bg-primary/5 border-primary/20`. 

## 5. Premium Form & Modal Design

For data entry and editing (e.g., `MenuForm`):

- **The Shell**: Use `rounded-[2rem]` for the dialog container to maintain the "super rounded" aesthetic.
- **Dynamic Headers**: Headings should use `font-black italic uppercase tracking-tighter`. Descriptions should be lighter but clear.
- **Field Grouping**: Use grid layouts (`grid-cols-2`) to group related inputs (e.g., Price & Local Name) to reduce vertical scrolling.
- **Micro-Layout Labels**: Labels should be small but intense: `text-[10px] font-black uppercase opacity-60 tracking-widest`.
- **Tactile Data Entry**:
    - **Inputs**: `rounded-2xl`, `bg-muted/30`, and `border-none`. Use `shadow-inner` for a "pressed into the surface" look.
    - **Toggles/Checkboxes**: Group in a dedicated container with `bg-muted/30` and `border-2 border-dashed`.
- **Button Synergy**:
    - **Cancel**: Use a `ghost` or `outline` variant with `rounded-xl` for a softer feel.
    - **Primary Action**: A high-contrast, `rounded-full` button with a subtle shadow (`shadow-primary/20`) and `active:scale-95`.

## 6. Responsive Strategy
- **Mobile (< 640px)**:
    - Sticky footers are mandatory.
    - Lists should be single column.
    - Large touch targets (min 44px height).
- **Big Screen (> 1024px)**:
    - Use `max-w-screen-xl` for page containers.
    - Hub lists can transition to a grid (`grid-cols-2` or `grid-cols-3`).
    - Sidebars should be `variant="inset"` to create a "window within a window" effect.

## 6. Micro-Interactions
- **Entrance Animation**: Use `animate-in fade-in slide-in-from-bottom-2 duration-300` for list items.
- **Button Feedback**: Always include a subtle scale or color shift.
- **Progress Bars**: Ensure they use `transition-all duration-1000` to "fill up" smoothly when the page loads.
