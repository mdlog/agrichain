# 📸 Screenshots & UI Guide

## Landing Page

### Hero Section
- **Headline**: "🌾 AgriChain Finance"
- **Subheadline**: "Platform Pembiayaan Pertanian Terdesentralisasi"
- **CTA Buttons**: "Saya Petani" & "Saya Investor"
- **Background**: Gradient primary-600 to primary-800

### Stats Section
- 4 stat cards in a row
- Shows: Transaction cost, Finality, Max loan, Return rate

### Features Section
- 6 feature cards in 3x2 grid
- Icons: Sprout, TrendingUp, Shield, Zap, Users, Globe
- Each card has icon, title, and description

### How It Works
- 6 numbered steps
- Vertical timeline layout
- Clear process flow from tokenization to withdrawal

### CTA Section
- Primary-600 background
- "Siap Memulai?" headline
- Two CTA buttons

## Marketplace Page

### Header
- Title: "Loan Marketplace"
- Description text
- Search bar with icon
- Filter buttons: All, Active, Funded

### Loan Cards
- Grid layout (3 columns on desktop)
- Each card shows:
  - Crop type with emoji
  - Loan ID
  - Status badge
  - Amount, Interest, Duration
  - Progress bar
  - Farmer address
  - "View Details" button

## Farmer Dashboard

### Tabs
- "Create Loan" (Plus icon)
- "My Loans" (List icon)

### Create Loan Form (Step 1)
- Crop type dropdown
- Expected yield input
- Estimated value input
- Harvest date picker
- "Next" button

### Create Loan Form (Step 2)
- Harvest token summary (gray box)
- Loan amount input (with max calculation)
- Interest rate input
- Duration input
- Loan summary (primary-50 box)
- "Back" and "Submit" buttons

### My Loans
- List of loan cards
- Shows: Crop, Status, Requested, Funded
- Progress bar
- Empty state if no loans

## Investor Dashboard

### Stats Cards
- 4 cards in a row
- Total Invested, Total Returns, Active Investments, Avg Duration
- Icons and change indicators

### Tabs
- "My Portfolio"
- "Available Loans"

### Portfolio View
- Investment cards with:
  - Crop type and status
  - Farmer address
  - Invested, Expected Return, Interest, Days Left
  - "View Details" button
- Empty state with "Browse Loans" CTA

### Available Loans View
- Similar to marketplace
- Shows funding progress
- "Invest Now" button

## About Page

### Hero
- Gradient background
- Mission statement

### Mission Section
- Target icon
- 2 cards: For Farmers & For Investors

### Problem & Solution
- 3 problem items with ❌ icon
- 1 solution item with ✅ icon (primary-50 background)

### Why Hedera
- 3 cards: Fast & Cheap, Secure, Sustainable
- Icons: Zap, Shield, Globe

### Impact Goals
- 4 stat cards
- 1M farmers, $1B loans, 50% reduction, 100K hectares

### Team Section
- Users icon
- "Built for Hackathon" text
- GitHub and Docs buttons

## Common UI Elements

### Navbar
- Logo: 🌾 AgriChain
- Links: Home, Marketplace, Farmer, Investor, About
- Wallet button (shows address when connected)
- Mobile hamburger menu

### Footer
- 4 columns: About, Quick Links, Resources, Connect
- Social icons: GitHub, Twitter, Email
- Copyright text

### Buttons
- **Primary**: Green background, white text
- **Secondary**: White background, green border and text
- Hover effects on all buttons

### Cards
- White background
- Rounded corners (xl)
- Shadow (md)
- Padding (6)
- Border (gray-200)

### Inputs
- Full width
- Padding (4)
- Border (gray-300)
- Rounded (lg)
- Focus ring (primary-500)

### Status Badges
- Rounded full
- Small text
- Colors:
  - Pending: Yellow
  - Funded: Blue
  - Repaid: Green
  - Defaulted: Red

## Color Scheme

### Primary (Green)
- Main: #16a34a (primary-600)
- Light: #dcfce7 (primary-100)
- Dark: #15803d (primary-700)

### Background
- Page: #f9fafb (gray-50)
- Card: #ffffff (white)
- Hover: #f3f4f6 (gray-100)

### Text
- Primary: #111827 (gray-900)
- Secondary: #6b7280 (gray-600)
- Muted: #9ca3af (gray-500)

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layouts
- Stacked navigation
- Full-width cards
- Hamburger menu

### Tablet (768px - 1024px)
- 2 column grids
- Condensed navigation
- Medium cards

### Desktop (> 1024px)
- 3-4 column grids
- Full navigation
- Optimal spacing

## Icons

All icons from Lucide React:
- Sprout, TrendingUp, Shield, Zap, Users, Globe
- Search, Filter, DollarSign, Clock
- Plus, List, Wallet, Menu, X
- Target, Github, Twitter, Mail

## Typography

### Font Family
- Inter (Google Fonts)

### Sizes
- Heading 1: 5xl (48px)
- Heading 2: 4xl (36px)
- Heading 3: 2xl (24px)
- Body: base (16px)
- Small: sm (14px)
- Tiny: xs (12px)

### Weights
- Bold: 700
- Semibold: 600
- Medium: 500
- Regular: 400

## Animations

### Loading Spinner
```css
animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600
```

### Transitions
- All buttons: `transition-colors duration-200`
- Cards: `transition-shadow`
- Hover effects: Smooth color changes

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Color contrast WCAG AA compliant
