# LearnLink Design System

This document is the visual source of truth for LearnLink. Read it before creating or substantially changing a component. New UI should feel like part of the same learning workspace, not like a separate feature or product.

When the implementation and this document disagree, preserve the existing design tokens first and update this document only when the visual system is intentionally changing.

## Product character

LearnLink is a classroom workspace for focused collaboration. The interface should feel:

- Calm and clear rather than loud or overly decorative.
- Friendly and lightly playful through illustration, imagery, and small status accents.
- Practical and information-dense without feeling cramped.
- Consistent in both light and dark themes.

The dominant visual language is neutral grayscale with soft surfaces, thin borders, rounded corners, and occasional color for status or imagery. Avoid introducing a new visual language for an individual feature.

## Design foundations

### Color and themes

Colors are defined as HSL CSS variables in app/globals.css and exposed through Tailwind semantic names. Use the semantic names instead of hard-coded colors:

| Semantic role | Light theme | Dark theme | Use |
| --- | --- | --- | --- |
| Background | white | near-black | Page and app canvas |
| Foreground | near-black | near-white | Primary text and icons |
| Card | white | dark gray | Panels, cards, chat surfaces |
| Popover | white | very dark gray | Menus, dialogs, floating content |
| Primary | near-black | near-white | Main actions and selected emphasis |
| Secondary | light gray | dark gray | Secondary actions and supporting surfaces |
| Muted | light gray | dark gray | Quiet backgrounds and skeletons |
| Muted foreground | medium gray | light gray | Metadata, helper text, inactive labels |
| Accent | light gray | dark gray | Hover and selected states |
| Border/input | light gray | dark gray | Dividers, fields, and control boundaries |
| Destructive | red | dark red | Delete, failure, and irreversible actions |
| Ring | near-black | light gray | Keyboard focus indicator |

Key source values from app/globals.css:

- Light background/card/popover: 0 0% 100%.
- Light foreground: 0 0% 3.9%.
- Light primary: 0 0% 9%.
- Light muted/accent: 0 0% 96.1% and 0 0% 94%.
- Light border: 0 0% 75%.
- Dark background: 0 0% 6%.
- Dark card: 0 0% 10%.
- Dark popover: 0 0% 3.9%.
- Dark primary/foreground: 0 0% 98%.
- Dark muted/accent: 0 0% 14.9%.
- Dark border: 0 0% 20%.
- Base radius: 0.5rem.

Preferred Tailwind semantics include:

- bg-background and text-foreground for the page.
- bg-card and text-card-foreground for contained surfaces.
- bg-popover and text-popover-foreground for floating surfaces.
- bg-primary with text-primary-foreground for the main action.
- bg-accent with text-accent-foreground for hover and selection.
- text-muted-foreground for secondary information.
- border-border and border-input for boundaries.
- ring-ring for focus.
- bg-destructive and text-destructive-foreground for destructive states.

The dark theme is the primary visual mode today. Keep light mode functional and readable; do not assume that a new component will only render on the dark background.

Status colors are deliberately limited:

- Live or connected: emerald tones, usually with a low-opacity background, a subtle border, and a compact label or icon.
- Error or destructive: the destructive semantic token.
- Favorites or special media: warm yellow or indigo may be used when the feature already establishes that meaning.

Do not add arbitrary hex colors, gradients, or saturated accents to ordinary controls.

### Typography

The current font stack is:

- Comfortaa as the global product voice and friendly brand surface.
- Geist Sans for the local sans family and dense interface work.
- Geist Mono for codes, identifiers, and technical values.
- Roboto is available for explicit utility use, but should not be introduced casually.

Use the existing Tailwind size hierarchy:

- text-xs: timestamps, badges, helper text, and compact metadata.
- text-sm: controls, labels, descriptions, navigation, and chat content.
- text-base: normal reading content and form input text.
- text-lg: card titles, section labels, and dialog titles.
- text-2xl to text-3xl: page and feature headings.

Use font-semibold or font-bold for hierarchy, not oversized type. Keep headings concise and use line-clamp or truncate where the surrounding layout requires it.

Text should be sentence case by default. Uppercase labels are reserved for compact status or section labels and should use tracking-wider or tracking-[0.2em] sparingly.

### Shape, borders, and elevation

The base radius is 0.5rem:

- rounded-sm: small menu items and compact controls.
- rounded-md: buttons, inputs, textareas, menus, dialogs, and ordinary panels.
- rounded-lg: larger dialogs, prominent controls, and floating surfaces.
- rounded-xl: class cards, feature panels, live-session shells, and empty-state imagery.
- rounded-full: avatars, status pills, circular icon buttons, and presence indicators.

Use a one-pixel border for separation. Prefer border-border or border-input and let the theme control the actual color.

Use elevation with restraint:

- shadow-sm for inputs, small controls, and subtle separation.
- shadow-md or shadow-lg for cards and menus.
- shadow-2xl only for prominent live or hero surfaces.

Translucent surfaces are part of the existing chrome:

- bg-card/75 with backdrop-blur-md for the sticky navigation and floating menus.
- bg-card/40 for the sidebar layer.
- Keep text and borders fully legible over translucency.

## Layout and responsive behavior

The root layout is a full-height flex workspace with a desktop sidebar, a sticky 56px navigation bar, and a flexible main content area. Preserve that relationship when adding pages.

Current layout conventions:

- App shell: min-h-screen, full-width flex layout.
- Navigation: sticky top-0, h-14, z-50, horizontal padding around 1.5rem.
- Sidebar: 14rem expanded, 3rem icon-only, 18rem on mobile.
- Main content: small outer padding, then a feature-specific max-width or flexible area.
- Home grid: max-w-7xl with responsive one-to-four column layout.
- Class cards: approximately 300px wide with a fixed visual rhythm.
- Class workspace: channel rail, flexible chat, and members rail on desktop; hide or switch panels on smaller screens.
- Live room: full available viewport height with a compact header and an expanding media region.

Use the standard Tailwind spacing scale. Existing UI favors p-2 and p-3 for compact shells, p-4 and p-6 for readable panels, and gap-2 through gap-5 for component relationships.

Responsive rules:

- Design mobile behavior deliberately; do not merely shrink desktop layouts.
- Use stacked layouts and panel visibility changes for class chat and member views.
- Keep primary actions full-width inside narrow dialogs and mobile panels.
- Preserve minimum touch targets around 40px for buttons and icon controls.
- Use overflow-y-auto for content regions that can grow, while keeping headers and actions visible.
- Avoid putting essential information only in hover states.

## Component patterns

### Use the existing primitives

Compose from components/ui before creating a new primitive. The project uses shadcn New York styling, Radix behavior, class-variance-authority variants, and Lucide icons.

Use:

- Button for all actions and links that look like actions.
- Input and Textarea for fields.
- Dialog for focused workflows and confirmations.
- DropdownMenu for compact action lists.
- Popover for contextual pickers and upload controls.
- Toast for transient success and error feedback.
- Skeleton or Spinner for loading states.
- Sidebar primitives for app navigation.

Do not replace accessible Radix primitives with clickable divs.

### Buttons

The established button variants are:

- default: primary action.
- outline: secondary action with a visible boundary.
- secondary: supporting action.
- ghost: low-emphasis toolbar action.
- destructive: irreversible or dangerous action.
- link: inline navigation.

The default control height is 40px; small controls are 36px and icon controls are 40px square. Keep the existing focus-visible ring, disabled opacity, and transition behavior.

Every icon-only button needs an accessible label. Every button inside a form must declare its intended type explicitly.

### Forms and dialogs

Pair each field with a visible label. Use the existing react-hook-form and Zod pattern for validation. Keep validation close to the field, and use a destructive toast only for a broader operation failure.

Dialogs should use:

- DialogHeader, DialogTitle, and DialogDescription.
- A short form body with consistent vertical gaps.
- DialogFooter for actions.
- A clear cancel/close affordance.
- A constrained width such as max-w-[400px] for small workflows.
- max-h-screen and overflow-y-auto when content can exceed mobile height.

Do not use a custom backdrop or close behavior when the Dialog primitive already provides it.

### Surfaces and cards

Ordinary surface: bg-card, border, rounded-md, and modest padding.

Feature surface: bg-card or a translucent card layer, border-border, rounded-xl, and a restrained shadow.

Interactive cards should use hover:bg-accent, hover:shadow-lg, and a clear keyboard focus state. Avoid changing layout dimensions on hover.

### Navigation

Use Next Link for internal navigation. Use SidebarMenuButton and the existing sidebar variants for sidebar items. Keep navigation labels short and use Lucide icons at roughly 16px.

The sticky navbar is translucent and sits above page content. New floating UI should respect its z-index and avoid visually competing with the product name, theme toggle, and user actions.

### Icons

Use Lucide as the default icon library. Common sizes:

- size-4 for inline and menu icons.
- size-5 for navigation and compact actions.
- size-6 or larger for empty states and feature emphasis.

Icons should support a text label, not replace important text. Use aria-label or sr-only text for icon-only actions.

### Loading, empty, and error states

Use the same visual grammar as the rest of the app:

- Loading: Skeleton for content-shaped loading and Spinner for a centered operation.
- Empty: educational illustration, short explanatory text, and one or two clear actions.
- Error: destructive text/surface or a destructive toast, with a recovery action when possible.
- Live status: compact emerald indicator and explicit text such as LIVE or Offline.

Do not leave a blank region while data is loading or unavailable.

## Imagery and media

The bundled imagery is abstract and gradient-led, with cool teal, blue, green, and lavender tones plus occasional coral, yellow, or pink accents. The empty-home illustration provides the strongest educational visual cue.

Use imagery as a supporting layer:

- Class banners should preserve their aspect ratio and use object-cover.
- Empty-state illustrations should remain centered and spacious.
- Avatars should be circular and use the existing placeholder when no image exists.
- Do not overlay long text directly on a busy image without a readable surface or gradient.
- Prefer local assets for product-specific illustration and approved remote sources for user/media content.

## Motion and interaction

Motion should clarify state changes, not decorate every element. The existing vocabulary is:

- transition-colors for ordinary hover changes.
- duration-200 for small layout or opacity changes.
- animate-in with fade, zoom, or slide for dialogs and feature surfaces.
- animate-pulse for skeletons and animate-spin for active loading.

Respect reduced-motion preferences when adding custom animations. Keep hover, focus, active, disabled, and loading states visually distinct.

## Accessibility baseline

Every new component should:

- Work with keyboard navigation.
- Have a visible or screen-reader-accessible label.
- Use semantic HTML and real buttons/links.
- Preserve focus-visible styles.
- Maintain readable contrast in both themes.
- Provide an accessible name and description for dialogs.
- Avoid conveying state through color alone.
- Keep touch targets large enough for mobile use.

## New component checklist

Before adding a component:

1. Read this document and identify the correct surface, typography, spacing, and interaction pattern.
2. Reuse a component from components/ui where one exists.
3. Use semantic theme tokens instead of hard-coded colors.
4. Define desktop, mobile, loading, empty, error, disabled, and focus states.
5. Use Lucide for icons and provide accessible labels.
6. Preserve the existing radius and shadow hierarchy.
7. Keep imagery consistent with the abstract, education-focused asset direction.
8. Verify light and dark themes.
9. Check keyboard behavior and narrow-screen overflow.
10. Update this document when introducing a deliberate new token, component variant, or visual pattern.

## Reference implementation areas

Use these files as working examples:

- app/globals.css: theme tokens and global surface rules.
- tailwind.config.ts: semantic colors, font families, and radius mapping.
- app/layout.tsx: application shell, fonts, navigation, and theme providers.
- components/ui/button.tsx: action variants and focus behavior.
- components/ui/dialog.tsx: modal structure and animation.
- components/ui/sidebar.tsx: responsive navigation shell.
- components/NavBar.tsx: translucent sticky navigation.
- components/ChannalList.tsx and components/Chat.tsx: responsive classroom workspace.
- components/FallbackHomepage.tsx: empty-state composition.
