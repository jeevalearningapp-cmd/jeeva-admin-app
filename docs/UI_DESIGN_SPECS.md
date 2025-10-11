# 🎨 Jeeva Learning - UI Design Specifications

## 📋 Document Overview

This document provides comprehensive UI/UX design specifications for the Jeeva Learning mobile app, based on the Figma design system. Use this as the single source of truth for all visual design implementations.

**Figma Design:** [Jeeva App Prototype](https://www.figma.com/proto/dOT7f0j582Wo6hdqNn4x8D/Jeeva-app)  
**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Platform:** iOS & Android (React Native/Expo)

---

## 🎨 Design System Foundation

### Design Principles

**1. Clarity**
- Clean, minimal interfaces with focus on content
- Clear visual hierarchy
- Consistent spacing and alignment
- Readable typography at all sizes

**2. Efficiency**
- Quick access to key features
- Minimal steps to complete tasks
- Smart defaults and suggestions
- Progressive disclosure of complexity

**3. Delight**
- Smooth animations and transitions
- Micro-interactions for feedback
- Gamification elements (achievements, streaks)
- Celebratory moments for milestones

**4. Accessibility**
- High contrast for readability
- Touch targets minimum 44x44pt
- Screen reader support
- Font scaling support

---

## 🎨 Color Palette

### Primary Colors

**Primary Blue**
```
Primary/500 (Main):     #007AFF
Primary/400 (Light):    #3395FF
Primary/600 (Dark):     #0062CC
Primary/700 (Darker):   #004C99
```

**Usage:**
- Primary CTAs (buttons, links)
- Active states
- Progress indicators
- App branding elements

---

### Secondary Colors

**Secondary Indigo**
```
Secondary/500 (Main):   #181C32
Secondary/400:          #2C3145
Secondary/600:          #0F1219
```

**Usage:**
- Text headers
- Dark backgrounds
- Navigation bars
- Card backgrounds (dark mode)

---

### Neutral Colors

**Grays**
```
Gray/900 (Darkest):     #1A1A1A
Gray/800:               #2D2D2D
Gray/700:               #404040
Gray/600:               #525252
Gray/500:               #737373
Gray/400:               #A3A3A3
Gray/300:               #D4D4D4
Gray/200:               #E5E5E5
Gray/100:               #F5F5F5
Gray/50 (Lightest):     #FAFAFA
```

**Usage:**
- Text (900, 800, 700)
- Borders (300, 200)
- Backgrounds (100, 50)
- Disabled states (400, 500)

---

### Semantic Colors

**Success (Green)**
```
Success/500:            #10B981
Success/100:            #D1FAE5
```

**Error (Red)**
```
Error/500:              #EF4444
Error/100:              #FEE2E2
```

**Warning (Amber)**
```
Warning/500:            #F59E0B
Warning/100:            #FEF3C7
```

**Info (Blue)**
```
Info/500:               #3B82F6
Info/100:               #DBEAFE
```

**Usage:**
- Success: Correct answers, completions, achievements
- Error: Wrong answers, errors, deletions
- Warning: Streak alerts, subscription expiring
- Info: Tips, information panels

---

### Gradient Colors

**Primary Gradient**
```
Linear Gradient:
  Start: #007AFF
  End:   #3395FF
  Angle: 135deg
```

**Usage:**
- Premium badges
- Achievement cards
- Special buttons
- Background overlays

---

## 📝 Typography

### Font Family

**Primary Font:** Inter (System Alternative: San Francisco / Roboto)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Download:** [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

---

### Text Styles

**Display (Hero Text)**
```
Font Size: 32-40pt
Line Height: 1.2
Weight: Bold (700)
Usage: Onboarding screens, empty states
```

**Heading 1**
```
Font Size: 28pt
Line Height: 1.3
Weight: Bold (700)
Usage: Page titles, main headers
```

**Heading 2**
```
Font Size: 24pt
Line Height: 1.3
Weight: Semibold (600)
Usage: Section headers, card titles
```

**Heading 3**
```
Font Size: 20pt
Line Height: 1.4
Weight: Semibold (600)
Usage: Subsection headers
```

**Body Large**
```
Font Size: 18pt
Line Height: 1.5
Weight: Regular (400)
Usage: Lesson content, important text
```

**Body (Default)**
```
Font Size: 16pt
Line Height: 1.5
Weight: Regular (400)
Usage: General content, descriptions
```

**Body Small**
```
Font Size: 14pt
Line Height: 1.5
Weight: Regular (400)
Usage: Supporting text, captions
```

**Caption**
```
Font Size: 12pt
Line Height: 1.4
Weight: Medium (500)
Usage: Labels, metadata, timestamps
```

**Overline (Uppercase)**
```
Font Size: 10pt
Line Height: 1.6
Weight: Bold (700)
Letter Spacing: 1.5px
Transform: Uppercase
Usage: Category labels, tags
```

---

### Text Colors

**Light Mode:**
- Primary Text: Gray/900 (#1A1A1A)
- Secondary Text: Gray/600 (#525252)
- Tertiary Text: Gray/500 (#737373)
- Disabled Text: Gray/400 (#A3A3A3)

**Dark Mode:**
- Primary Text: Gray/50 (#FAFAFA)
- Secondary Text: Gray/300 (#D4D4D4)
- Tertiary Text: Gray/400 (#A3A3A3)
- Disabled Text: Gray/600 (#525252)

---

## 📏 Spacing & Layout

### Spacing Scale

**Base Unit:** 4pt

```
XXS:  4pt   (1 unit)
XS:   8pt   (2 units)
SM:   12pt  (3 units)
MD:   16pt  (4 units)
LG:   24pt  (6 units)
XL:   32pt  (8 units)
2XL:  40pt  (10 units)
3XL:  48pt  (12 units)
4XL:  64pt  (16 units)
```

**Usage Guide:**
- XS (8pt): Icon padding, badge padding
- SM (12pt): Button padding, chip padding
- MD (16pt): Card padding, screen padding
- LG (24pt): Section spacing, modal padding
- XL (32pt): Screen margins, header spacing
- 2XL (40pt): Large section dividers
- 3XL (48pt): Bottom navigation height
- 4XL (64pt): Empty state spacing

---

### Grid System

**Screen Margins:**
- Mobile: 16pt (MD)
- Tablet: 24pt (LG)

**Column Gap:**
- Default: 16pt (MD)

**Card Spacing:**
- Between Cards: 12pt (SM)
- Card Internal Padding: 16pt (MD)

---

### Border Radius

```
None:       0pt
Small:      4pt   (Chips, badges)
Medium:     8pt   (Buttons, inputs, cards)
Large:      12pt  (Modals, dialogs)
XLarge:     16pt  (Bottom sheets)
Round:      999pt (Avatar, icon buttons)
```

---

## 🎛️ Components

### Buttons

#### Primary Button
```
Background: Primary/500 (#007AFF)
Text: White (#FFFFFF)
Font: Body/Semibold (16pt/600)
Height: 48pt
Padding: 12pt 24pt
Border Radius: 8pt
Shadow: 0px 2px 8px rgba(0, 122, 255, 0.3)

States:
- Hover: Primary/400
- Active: Primary/600
- Disabled: Gray/300 (bg), Gray/500 (text)
```

#### Secondary Button
```
Background: Transparent
Border: 1.5pt solid Primary/500
Text: Primary/500
Font: Body/Semibold (16pt/600)
Height: 48pt
Padding: 12pt 24pt
Border Radius: 8pt

States:
- Hover: Primary/50 (bg)
- Active: Primary/100 (bg)
- Disabled: Gray/300 (border & text)
```

#### Text Button
```
Background: Transparent
Text: Primary/500
Font: Body/Semibold (16pt/600)
Height: 40pt
Padding: 8pt 16pt

States:
- Hover: Primary/50 (bg)
- Active: Primary/100 (bg)
```

#### Icon Button
```
Size: 40x40pt
Border Radius: 999pt (Round)
Icon Size: 20x20pt
Background: Transparent

States:
- Hover: Gray/100 (bg)
- Active: Gray/200 (bg)
```

---

### Input Fields

#### Text Input
```
Height: 48pt
Padding: 12pt 16pt
Border: 1pt solid Gray/300
Border Radius: 8pt
Font: Body (16pt/400)
Placeholder: Gray/500

States:
- Focus: Border Primary/500, Shadow 0px 0px 0px 3pt Primary/100
- Error: Border Error/500, Shadow 0px 0px 0px 3pt Error/100
- Disabled: Background Gray/100, Text Gray/500
```

#### Search Input
```
Height: 44pt
Padding: 8pt 16pt 8pt 44pt (space for icon)
Icon: 20x20pt, Gray/500, Left 12pt
Border Radius: 12pt
Background: Gray/100
Font: Body (16pt/400)

States:
- Focus: Background White, Border 1pt Primary/500
```

---

### Cards

#### Content Card (Module/Topic/Lesson)
```
Background: White
Border: 1pt solid Gray/200
Border Radius: 12pt
Padding: 16pt
Shadow: 0px 2px 8px rgba(0, 0, 0, 0.08)

Components:
- Thumbnail: 80x80pt, Border Radius 8pt
- Title: Heading 3 (20pt/600)
- Description: Body Small (14pt/400), 2 lines max
- Metadata: Caption (12pt/500), Gray/600
- Arrow Icon: 20x20pt, Gray/400

States:
- Hover/Press: Shadow 0px 4px 12px rgba(0, 0, 0, 0.12)
```

#### Progress Card
```
Background: Gradient (Primary/500 to Primary/400)
Border Radius: 16pt
Padding: 20pt
Text: White

Components:
- Title: Heading 2 (24pt/600)
- Stat Value: Display (40pt/700)
- Stat Label: Caption (12pt/500)
- Icon: 32x32pt
```

#### Stats Card
```
Background: White
Border: 1pt solid Gray/200
Border Radius: 12pt
Padding: 16pt
Flex Direction: Row

Components:
- Icon: 40x40pt, Background Primary/100, Icon Primary/500
- Value: Heading 2 (24pt/600)
- Label: Body Small (14pt/400), Gray/600
```

---

### Bottom Navigation

```
Height: 64pt (+ safe area)
Background: White
Border Top: 1pt solid Gray/200
Padding: 8pt 0pt

Tab Item:
- Icon: 24x24pt
- Label: Caption (11pt/500)
- Active Color: Primary/500
- Inactive Color: Gray/500
- Badge: 16x16pt, Background Error/500, Text White
```

---

### Progress Indicators

#### Progress Bar
```
Height: 6pt
Background: Gray/200
Fill: Primary/500
Border Radius: 3pt (round)

Animated:
- Determinate: Width transition 0.3s ease
- Indeterminate: Moving gradient
```

#### Circular Progress
```
Size: 40x40pt
Stroke Width: 4pt
Track Color: Gray/200
Fill Color: Primary/500

With Percentage:
- Center Text: Body/Semibold (16pt/600)
```

#### Streak Counter
```
Icon: 🔥 Fire emoji or custom icon
Count: Heading 2 (24pt/600)
Label: Caption (12pt/500)
Background: Gradient (Warning/500 to Error/500)
Border Radius: 12pt
Padding: 12pt 16pt
```

---

### Badges & Chips

#### Badge
```
Height: 20pt
Padding: 2pt 8pt
Border Radius: 10pt (round)
Font: Caption (11pt/700)

Variants:
- Success: Background Success/100, Text Success/500
- Error: Background Error/100, Text Error/500
- Warning: Background Warning/100, Text Warning/500
- Info: Background Info/100, Text Info/500
- Neutral: Background Gray/200, Text Gray/700
```

#### Chip (Tag)
```
Height: 28pt
Padding: 4pt 12pt
Border Radius: 14pt (round)
Font: Body Small (14pt/500)
Background: Gray/100
Text: Gray/800

With Close Icon:
- Icon: 16x16pt, Right 4pt
- Tap Area: 24x24pt
```

---

### Modals & Dialogs

#### Bottom Sheet
```
Background: White
Border Radius: 24pt 24pt 0pt 0pt
Max Height: 90vh
Padding: 24pt

Components:
- Handle: 32pt wide, 4pt tall, Gray/300, Centered top
- Title: Heading 2 (24pt/600)
- Content: Scrollable with padding
- Actions: Sticky bottom, 16pt from content
```

#### Alert Dialog
```
Width: 90vw (max 400pt)
Background: White
Border Radius: 16pt
Padding: 24pt
Shadow: 0px 8px 24px rgba(0, 0, 0, 0.15)

Components:
- Icon: 48x48pt (optional), Primary/500
- Title: Heading 2 (24pt/600)
- Message: Body (16pt/400), Gray/600
- Actions: Row, 12pt gap
```

---

### Lists

#### List Item
```
Height: 64pt (min)
Padding: 12pt 16pt
Border Bottom: 1pt solid Gray/200

Components:
- Leading Icon/Avatar: 40x40pt
- Title: Body (16pt/500)
- Subtitle: Body Small (14pt/400), Gray/600
- Trailing: Icon/Badge/Toggle

States:
- Hover: Background Gray/50
- Active: Background Gray/100
```

#### Section Header
```
Height: 40pt
Padding: 8pt 16pt
Background: Gray/50
Font: Overline (10pt/700), Gray/700
Letter Spacing: 1.5px
Transform: Uppercase
```

---

### Empty States

```
Padding: 48pt 24pt
Text Align: Center

Components:
- Illustration: 120x120pt, Centered
- Title: Heading 2 (24pt/600), Gray/900
- Message: Body (16pt/400), Gray/600
- Action Button: Primary Button
- Spacing: 24pt between elements
```

---

### Loading States

#### Skeleton Loader
```
Background: Gray/200
Shimmer: Linear gradient moving left to right
  - Start: rgba(255, 255, 255, 0)
  - Middle: rgba(255, 255, 255, 0.4)
  - End: rgba(255, 255, 255, 0)
Border Radius: Match component (4-12pt)
Animation: 1.5s infinite
```

#### Spinner
```
Size: 24x24pt (small), 40x40pt (medium), 64x64pt (large)
Color: Primary/500
Stroke Width: 3pt
Animation: Rotate 1s infinite linear
```

---

## 🎬 Animations & Transitions

### Duration & Easing

**Duration:**
```
Fast:     150ms   (Micro-interactions)
Normal:   250ms   (Default transitions)
Slow:     400ms   (Complex animations)
XSlow:    600ms   (Page transitions)
```

**Easing Functions:**
```
Ease Out:     cubic-bezier(0.0, 0.0, 0.2, 1)    // Decelerating
Ease In:      cubic-bezier(0.4, 0.0, 1, 1)      // Accelerating  
Ease In Out:  cubic-bezier(0.4, 0.0, 0.2, 1)    // Standard
Spring:       cubic-bezier(0.68, -0.55, 0.27, 1.55)  // Bouncy
```

---

### Common Animations

**1. Button Press**
```
Scale: 0.95
Duration: 150ms
Easing: Ease In Out
```

**2. Card Tap**
```
Scale: 0.98
Shadow: Reduce by 50%
Duration: 200ms
Easing: Ease Out
```

**3. Page Transition**
```
Slide In: translateX(100%)
Fade In: opacity 0 → 1
Duration: 300ms
Easing: Ease Out
```

**4. Modal/Bottom Sheet**
```
Slide Up: translateY(100%)
Backdrop Fade: opacity 0 → 0.5
Duration: 400ms
Easing: Ease Out
```

**5. Success Animation**
```
Scale: 0 → 1 → 1.1 → 1
Rotate: 0 → 360deg
Duration: 600ms
Easing: Spring
```

**6. Loading Skeleton**
```
Shimmer: translateX(-100%) → translateX(100%)
Duration: 1500ms
Easing: Linear
Infinite: true
```

---

### Micro-interactions

**1. Checkbox Check**
```
Scale: 0 → 1.2 → 1
Duration: 250ms
Easing: Spring
```

**2. Toggle Switch**
```
Slide: translateX(0) → translateX(24pt)
Background: Gray/300 → Primary/500
Duration: 200ms
Easing: Ease In Out
```

**3. Progress Fill**
```
Width: Current → Target
Duration: 300ms
Easing: Ease Out
```

**4. Achievement Unlock**
```
- Bounce in: Scale 0 → 1.2 → 0.9 → 1
- Confetti: Particle system
- Duration: 800ms
- Sound: Optional celebratory sound
```

---

## 📱 Screen Layouts

### Dashboard (Home)

**Layout:**
```
Header (Fixed Top):
  - Height: 56pt + safe area
  - User Avatar: 36x36pt, Right 16pt
  - Greeting: "Hello, [Name]" - Heading 2
  - Notification Icon: Top Right

Stats Section:
  - 2x2 Grid, 12pt gap
  - Cards: Lessons, Streak, Time, Score

Continue Learning:
  - Section Header: "Continue Learning"
  - Horizontal Scroll
  - Card: 280pt wide

Recommended:
  - Section Header: "Recommended for You"
  - Vertical List
```

---

### Lesson Viewer

**Layout:**
```
Header (Sticky):
  - Back Button: Left
  - Progress: Center (3/10)
  - Bookmark: Right

Content Area:
  - Padding: 16pt
  - Rich Text/Video/Audio
  - Scrollable

Footer (Sticky Bottom):
  - Mark Complete Button
  - Next Lesson Button
  - Spacing: 12pt between
```

---

### Practice Session

**Layout:**
```
Header:
  - Question Number: "3 of 10"
  - Score: "Score: 75%"
  - Timer (optional)

Question Card:
  - Question Text
  - Image (if any)
  - Options (vertical list)

Footer:
  - Submit/Next Button
  - Explanation Panel (conditional)
```

---

### Profile

**Layout:**
```
Header:
  - Cover Image (optional)
  - Avatar: 80x80pt, Centered
  - Name: Heading 2
  - Role/Plan: Caption

Stats Row:
  - 3 columns: Lessons, Streak, Score
  - Centered

Menu List:
  - Edit Profile
  - Settings
  - Subscription
  - Help & Support
  - Sign Out
```

---

## 🌗 Dark Mode

### Color Adjustments

**Backgrounds:**
- Surface: #1A1A1A
- Card: #2D2D2D
- Modal: #404040

**Text:**
- Primary: #FAFAFA
- Secondary: #D4D4D4
- Tertiary: #A3A3A3

**Borders:**
- Gray/700 (#404040)

**Shadows:**
- Use highlights instead:
  - 0px 1px 0px rgba(255, 255, 255, 0.1)

**Primary Colors:**
- Slightly lighter for better contrast
- Primary/400 (#3395FF) instead of Primary/500

---

## 📐 Responsive Design

### Breakpoints

```
Mobile:     < 768pt
Tablet:     768pt - 1024pt
Desktop:    > 1024pt (web only)
```

### Adaptations

**Tablet (Landscape):**
- 2-column layout for content lists
- Side panel for details
- Larger touch targets (48pt min)

**Large Screens:**
- Max width: 1200pt
- Center content
- Increase side margins

---

## ♿ Accessibility

### Touch Targets
- Minimum: 44x44pt
- Recommended: 48x48pt
- Spacing: 8pt minimum between targets

### Color Contrast
- WCAG AA Standard: 4.5:1 (normal text)
- WCAG AA Standard: 3:1 (large text)
- All text meets minimum contrast

### Focus States
```
Outline: 3pt solid Primary/500
Outline Offset: 2pt
```

### Text Scaling
- Support Dynamic Type (iOS)
- Support Font Scaling (Android)
- Maximum scale: 200%
- Minimum scale: 100%

---

## 🎯 Interactive States

### Hover (Tablets/Web)
- Background opacity: +10%
- Shadow elevation: +2pt
- Transition: 150ms ease out

### Active/Pressed
- Scale: 0.95-0.98
- Background opacity: +20%
- Transition: 100ms ease in

### Focus (Keyboard)
- Outline: 3pt Primary/500
- Outline offset: 2pt
- Background: +5% opacity

### Disabled
- Opacity: 0.4
- Cursor: not-allowed (web)
- Remove all interactions

---

## 🖼️ Iconography

### Icon Set
**Library:** Material Icons / SF Symbols / Custom

**Sizes:**
- Small: 16x16pt
- Medium: 20x20pt (default)
- Large: 24x24pt
- XLarge: 32x32pt

**Stroke Width:** 1.5pt (outline icons)

**Common Icons:**
- Home: house
- Learn: book
- Practice: pencil
- Profile: person
- Search: magnifyingglass
- Bookmark: bookmark
- Complete: checkmark.circle
- Lock: lock
- Settings: gear

---

## 📸 Imagery

### Aspect Ratios
- Module Thumbnail: 16:9
- Lesson Cover: 3:2
- Avatar: 1:1 (square)
- Banner: 21:9

### Image Specs
- Format: WebP (fallback: JPEG/PNG)
- Quality: 85%
- Max Width: 1200pt
- Compression: Enabled

---

## 🎨 Illustration Style

### Guidelines
- Flat design, minimal gradients
- Primary color palette
- Rounded, friendly shapes
- Simple, clean lines
- Consistent perspective
- Purposeful use of white space

### Usage
- Empty states
- Onboarding screens
- Error pages
- Achievement badges
- Feature highlights

---

## 📋 Design Checklist

### Before Development
- [ ] All screens designed in Figma
- [ ] Components documented
- [ ] Spacing verified (4pt grid)
- [ ] Colors use design tokens
- [ ] Typography follows scale
- [ ] Dark mode variants created
- [ ] Responsive layouts defined
- [ ] Animations specified
- [ ] Accessibility checked

### During Development
- [ ] Match Figma designs pixel-perfect
- [ ] Use design system components
- [ ] Implement animations
- [ ] Test dark mode
- [ ] Test on multiple devices
- [ ] Verify touch targets
- [ ] Test with screen readers
- [ ] Check color contrast

---

## 🔗 Design Resources

### Figma File
- **Main Design:** [Jeeva App Prototype](https://www.figma.com/proto/dOT7f0j582Wo6hdqNn4x8D/Jeeva-app)
- **Component Library:** [Export from Figma]
- **Icon Library:** Material Icons / SF Symbols

### Assets Export
- Export 1x, 2x, 3x for mobile
- SVG for icons
- WebP for images
- Use asset naming convention: `[component]_[variant]_[state]@[scale]`

### Design Tokens (JSON)
```json
{
  "colors": {
    "primary": {
      "500": "#007AFF",
      "400": "#3395FF"
    }
  },
  "spacing": {
    "xs": "8pt",
    "md": "16pt"
  },
  "typography": {
    "heading1": {
      "fontSize": "28pt",
      "fontWeight": "700"
    }
  }
}
```

---

## 🎨 Implementation Notes

### React Native / Expo

**1. Use StyleSheet:**
```typescript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary[500],
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 24,
  }
})
```

**2. Theme Provider:**
```typescript
const theme = {
  colors,
  spacing,
  typography,
  borderRadius
}

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

**3. Responsive Units:**
```typescript
import { Dimensions, PixelRatio } from 'react-native'

const { width, height } = Dimensions.get('window')
const scale = width / 375 // Base on iPhone X width

const normalize = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale))
}
```

---

## 🔗 Related Documentation

- [Mobile App Overview](./MOBILE_APP_OVERVIEW.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Authentication Flow](./AUTHENTICATION_FLOW.md)
- [Feature Specifications](./FEATURE_SPECIFICATIONS.md)

---

## 📝 Notes

**Important:** This document serves as a template. Please update the specific values (colors, fonts, spacing) based on your actual Figma design. Export design tokens from Figma for exact specifications.

---

**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Design by:** Jeeva EdTech Design Team  
**Developer:** vollstek@gmail.com
