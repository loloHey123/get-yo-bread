# Get Yo Bread — Design Spec

## Overview

A physical-to-digital web app that turns the daily work grind into a rewarding ritual. Users clock in/out by tapping their phone to an NFC-enabled clay bread toy on their desk. The app tracks earnings based on hourly rate and rewards them every Friday with a curated bakery recommendation near their location.

**Core philosophy:** Tactile, playful, bread-pun-filled. This is NOT a productivity tool or finance app. It's a self-motivation toy that makes corporate work feel a little sweeter.

## Tech Stack

- **Frontend:** Next.js (React) on Vercel
- **Backend/DB:** Supabase (Postgres + Auth + Realtime)
- **Auth:** Supabase Magic Link (email-based, persistent session)
- **Bakery Lookup:** Provider-agnostic interface (Google Places, Yelp, or Foursquare — plugged in later, mock data for dev)
- **Animations:** Framer Motion (celebrations, dough rising)
- **Drag & Drop:** dnd-kit (bread shelf ranking)
- **Hosting:** Vercel (free tier)
- **Admin Pipeline:** Separate cron job (Python or Supabase Edge Function)

## User Flows

### Flow 1: First Tap (Onboarding)

1. User buys clay bread toy (separate e-commerce concern, out of scope)
2. NFC tag inside bread is pre-programmed with URL: `getyobread.com/tap/{BREAD_UID}`
3. User taps phone to bread
4. Phone opens URL in browser
5. Server checks `BREAD_UID` — not linked to any account
6. **Setup flow:**
   - Enter email address
   - Receive magic link, click to verify
   - Set hourly rate
   - Set expected hours per week (for baguette progress — e.g., 40)
   - Set location (zip code or address — used for bakery recommendations)
   - Set bakery preferences (curated checklist: croissants, cookies, cakes, bread, pastries, donuts, etc.)
   - Set allergies (checkboxes for common allergens + free text for others)
7. Bread is now linked to this account
8. **Persistent session cookie set** — user never has to log in again on this device
9. Show "You're all set! Tap your bread to start earning." with a fun animation

### Flow 2: Clock In

1. User taps phone to bread
2. Phone opens `getyobread.com/tap/{BREAD_UID}`
3. Server looks up `BREAD_UID` → finds linked user
4. Checks persistent session cookie → user is authenticated (no login needed)
5. User is NOT currently clocked in
6. Server records clock-in timestamp
7. **Screen shows:**
   - "Let's get this bread." (or rotating bread pun)
   - Current time
   - Baguette progress bar for the week so far
   - If user keeps tab open: **dough rising animation** with live earnings ticker

### Flow 3: Clock Out (Non-Friday)

1. User taps phone to bread
2. Same URL opens, same auth check
3. User IS currently clocked in
4. Server records clock-out timestamp, calculates session earnings
5. **Screen shows:**
   - "Another day, another loaf." (or rotating bread pun)
   - Session duration and earnings
   - Updated weekly baguette progress (longer than before)
   - Running weekly total

### Flow 4: Friday Clock Out (THE BIG ONE)

1. Same tap/auth flow as regular clock out
2. Server detects: it's Friday AND this is a clock-out
3. **Celebration screen:**
   - Big animated confetti / particle effects
   - Haptic feedback on phone (via Vibration API)
   - Bright, warm, bakery-themed colors
   - **Weekly earnings displayed BIG:** "You made $1,247.50 this week!"
   - The weekly baguette is now at full length — glorious
   - Bread pun: "You're on a roll!" / "That's a lot of dough!" (rotating)
4. **Bakery recommendation card:**
   - Curated bakery item (matched to user's preferences, filtered by allergies)
   - Placeholder bread asset image (real assets created later)
   - Item description / why it's great
   - "Nearby bakeries" list (from bakery lookup provider) where they could find something like it
   - **Share button** → generates a shareable card/link
5. **Share card format:**
   - Pretty image card with: item image, item name, "I earned my bread this week!", Get Yo Bread branding
   - Message: "Let's celebrate Friday together!"
   - Shareable via native Web Share API (works on mobile — shares to iMessage, Instagram, WhatsApp, etc.)
   - Fallback: copy link to clipboard

### Flow 5: Bread Shelf

Accessed from the main app navigation (not part of the tap flow).

- **Shows all past bakery recommendations** the user has received
- Each item is a bread/pastry card with placeholder image
- User can mark items as:
  - "Tried it" — they actually went and bought it
  - Score it (simple rating system)
- **Shelf ranking:** Users drag and drop bread cards to arrange them vertically on a virtual shelf
  - Higher placement = better rating
  - This is the primary ranking mechanism (not stars, not numbers — spatial arrangement)
  - Powered by dnd-kit for drag and drop
- Items they haven't tried yet are visually distinct (grayed out, or "still in the oven" treatment)

### Flow 6: Bread Board (Lifetime Stats)

Simple profile/stats page:

- Total earned all-time
- Total hours worked
- Total treats unlocked
- Total treats tried
- Highest-ranked bread on shelf
- Fun bread-themed titles based on milestones:
  - 0-100 hours: "Fresh Dough"
  - 100-500 hours: "Rising Starter"
  - 500-1000 hours: "Golden Crust"
  - 1000+ hours: "Master Baker"

## Data Model

### Tables

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, Supabase auth ID |
| email | text | From magic link auth |
| hourly_rate | decimal | User-set, in their currency |
| expected_hours_per_week | decimal | Used for baguette progress calc (e.g., 40) |
| location | text | Zip code or address |
| created_at | timestamp | |

**breads** (physical NFC bread toys)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| nfc_uid | text | Unique, from NFC tag |
| user_id | uuid | FK → users, nullable (unlinked breads) |
| linked_at | timestamp | When user claimed this bread |

**time_entries**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| clock_in | timestamp | |
| clock_out | timestamp | Nullable (currently clocked in) |
| earnings | decimal | Calculated on clock-out |

**preferences**
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | PK, FK → users |
| bakery_prefs | text[] | Array of preference tags |
| allergies | text[] | Array of allergy tags |

**curated_items** (admin-managed)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g., "Chocolate Babka" |
| description | text | Why it's great |
| image_url | text | Placeholder for now |
| tags | text[] | e.g., ["pastry", "chocolate"] |
| allergens | text[] | e.g., ["nuts", "gluten"] |
| seasonal | boolean | Is this a seasonal item? |
| active | boolean | Currently in rotation? |

**recommendations** (what users received)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| item_id | uuid | FK → curated_items |
| week_of | date | The Friday this was recommended |
| tried | boolean | Did they try it? |
| shelf_position | integer | Ranking on their bread shelf (1 = top of shelf, highest ranked) |
| created_at | timestamp | |

### Key Queries

- **Clock in/out toggle:** Check if user has an open time_entry (clock_out IS NULL). If yes → clock out. If no → clock in.
- **Weekly earnings:** SUM(earnings) from time_entries WHERE user_id = X AND clock_out >= start_of_week
- **Friday recommendation:** SELECT from curated_items WHERE tags overlap with user prefs AND allergens don't overlap with user allergies AND id NOT IN (user's past recommendations). Random pick from remaining.
- **Bread shelf:** SELECT from recommendations WHERE user_id = X ORDER BY shelf_position ASC

## The Baguette Progress Visualization

Not a chart. Not a graph. A baguette.

- Represents weekly earnings progress
- Monday morning: a small dinner roll
- As earnings accumulate through the week, the bread elongates into a baguette
- Full week's expected earnings (hourly_rate * expected_hours) = full magnificent baguette
- If they exceed expected earnings (overtime), the baguette gets comically long
- Animated growth — when you clock out and see the baguette has grown, it should feel satisfying
- This is the ONLY progress visualization. No bar charts, no line graphs, no pie charts.

## Dough Rising Animation

When user is clocked in and keeps the browser tab open:

- A ball of dough visually rises/expands over time
- Live earnings ticker overlaid: "$42.50... $42.51... $42.52..."
- Subtle, mesmerizing, not distracting
- Uses Supabase Realtime or a simple client-side timer based on hourly rate
- If tab is backgrounded and reopened, dough catches up to current earnings

**Implementation note:** The live ticker is purely client-side math (clock_in_time + hourly_rate + current_time). No need for server-sent events for the counter itself. Supabase Realtime is available if we need it for other features later.

## Bread Puns & Copy

Personality is core to this product. Every piece of copy should be bread-themed:

- Clock in: "Let's get this bread." / "Time to make some dough." / "Rise and grind."
- Clock out (non-Friday): "Another day, another loaf." / "That's the way the cookie crumbles... wait, wrong bakery item."
- Clock out (Friday): "You're on a roll!" / "That's a lot of dough!" / "You really earned your crust this week."
- Bread Board titles: "Fresh Dough" → "Rising Starter" → "Golden Crust" → "Master Baker"
- Shelf empty state: "Your shelf is empty. Time to get baking!"
- Error states: "Something went a-rye." / "We're in a bit of a jam."

## Celebration Screen (Friday)

This is the emotional climax of the weekly loop. It must feel like a reward.

- **Colors:** Warm, bright — golden yellows, warm oranges, cream whites. Bakery palette.
- **Animations:** Confetti particles, the baguette reaching full size with a satisfying bounce, the bakery rec card sliding in like a gift being presented
- **Haptic feedback:** Use the Vibration API for a satisfying buzz on the phone when the celebration triggers
- **Sound:** Consider a subtle "ding" or celebration sound (optional, respect silent mode)
- **Share button prominent** — this is the moment they're most likely to share

## Shareable Card

Generated when user taps "Share" on the Friday recommendation:

- **Content:**
  - Bakery item placeholder image
  - Item name
  - "I earned my bread this week!"
  - Get Yo Bread branding/logo
  - "Let's celebrate Friday together!"
- **Mechanism:** Web Share API (native share sheet on mobile) with fallback to copy-link-to-clipboard
- **The shared link** could point to a public page showing the recommendation (no earnings data — just the treat). This doubles as marketing for the app.

## Auth & Session Strategy

- **Magic link via Supabase Auth** — user enters email, gets a link, clicks it, done
- **Persistent session:** Supabase session token stored in a long-lived cookie (or localStorage). Default Supabase session lasts 1 week with auto-refresh. We'll configure it for longer (30-90 days).
- **The tap URL flow:**
  1. User taps NFC → browser opens `getyobread.com/tap/{BREAD_UID}`
  2. Server checks if `BREAD_UID` is linked to a user
  3. If not linked → onboarding flow
  4. If linked → check session cookie
  5. If session valid → instant clock in/out (no login)
  6. If session expired → show "Welcome back! Enter your email for a magic link" (one-time re-auth, then back to persistent)
- **No passwords ever.** Magic link only.
- **Multi-device:** If a user taps from a new phone, they'll need to magic-link once on that device. After that, both devices have persistent sessions.

## Bakery Lookup (Provider-Agnostic)

### Interface

```typescript
interface BakeryProvider {
  findNearby(location: string, radius?: number): Promise<Bakery[]>
}

interface Bakery {
  name: string
  address: string
  rating?: number
  distance?: string
  url?: string
  photoUrl?: string
}
```

### Supported Providers (plug in later)

- Google Places API
- Yelp Fusion API
- Foursquare Places API

### For Development

- Mock provider returning fake bakery data
- Seeded with ~10 fake bakeries for testing

## Admin Scraping Pipeline (Separate System)

**Purpose:** Help the app owner (you) keep the curated_items list fresh by surfacing new/seasonal items from bakeries.

**NOT user-facing.** This is an admin tool.

### Components

1. **Bakery website scraper** — fetches bakery websites, extracts menu/item info
2. **Instagram monitor** — checks bakery Instagram accounts for new posts about items (provider-agnostic, could use official API or third-party service like Apify)
3. **LLM extraction** — takes raw scraped content, extracts structured item data (name, description, likely allergens, seasonal flag)
4. **Admin dashboard or simple output** — presents extracted items for manual review and approval before adding to curated_items

### Scheduling

- Runs weekly or monthly via cron
- Could be a Python script, Supabase Edge Function, or GitHub Action

### Spec Details Deferred

This pipeline is a separate project. It doesn't block the core app from shipping. We'll spec it independently when the core app is live.

## Out of Scope (v1)

- Streaks / streak customization
- Social features / leaderboards
- Multiple hourly rates / project tracking
- Native mobile app
- Fraud prevention / tap verification
- E-commerce / bread toy sales
- Push notifications / email notifications
- The admin scraping pipeline (specced separately)
- Real bread asset images (placeholders for now)

## Open Questions (Resolved)

- ~~Web vs. native app?~~ → Web app. NFC opens URL.
- ~~How does Friday rec reach user?~~ → Shown on the website at Friday clock-out. No notifications.
- ~~Fraud prevention?~~ → Not needed. Self-accountability tool.
- ~~Bakery API provider?~~ → Provider-agnostic interface, mock for dev, plug in real provider later.
