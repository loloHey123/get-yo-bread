# Get Yo Bread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app where users clock in/out by tapping an NFC bread toy, track weekly earnings, and receive a curated bakery recommendation every Friday.

**Architecture:** Next.js app with Supabase backend. The NFC tap opens a dynamic route `/tap/[breadId]` which handles the entire clock in/out toggle server-side. Separate pages for Bread Shelf and Bread Board. Friday clock-out triggers a celebration screen with bakery recommendation. All animations via Framer Motion.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (Postgres + Auth), Framer Motion, dnd-kit, Tailwind CSS, Vitest + React Testing Library

---

## File Structure

```
get-yo-bread/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout, Supabase provider, fonts
│   │   ├── page.tsx                      # Landing/marketing page
│   │   ├── tap/[breadId]/
│   │   │   └── page.tsx                  # Core NFC tap handler page
│   │   ├── onboarding/[breadId]/
│   │   │   └── page.tsx                  # New user setup flow
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Main dashboard (clocked-in/out state)
│   │   ├── shelf/
│   │   │   └── page.tsx                  # Bread Shelf (drag-and-drop ranking)
│   │   ├── board/
│   │   │   └── page.tsx                  # Bread Board (lifetime stats)
│   │   ├── share/[recommendationId]/
│   │   │   └── page.tsx                  # Public shareable recommendation page
│   │   └── api/
│   │       ├── tap/[breadId]/route.ts    # POST: clock in/out toggle
│   │       ├── onboarding/route.ts       # POST: complete onboarding
│   │       ├── shelf/route.ts            # PUT: update shelf positions
│   │       ├── shelf/[id]/route.ts       # PATCH: mark tried, update position
│   │       └── recommendation/route.ts   # GET: fetch Friday recommendation
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Supabase client
│   │   │   └── middleware.ts             # Auth session refresh middleware
│   │   ├── bakery/
│   │   │   ├── provider.ts              # BakeryProvider interface
│   │   │   └── mock-provider.ts         # Mock bakery data for dev
│   │   ├── bread-puns.ts                # Rotating bread puns by context
│   │   ├── earnings.ts                  # Earnings calculation helpers
│   │   └── types.ts                     # Shared TypeScript types
│   ├── components/
│   │   ├── onboarding/
│   │   │   ├── email-step.tsx           # Email input + magic link
│   │   │   ├── rate-step.tsx            # Hourly rate + expected hours
│   │   │   ├── location-step.tsx        # Location input
│   │   │   ├── preferences-step.tsx     # Bakery prefs + allergies
│   │   │   └── complete-step.tsx        # Success animation
│   │   ├── clock/
│   │   │   ├── clock-in-screen.tsx      # Clock in confirmation + dough rising
│   │   │   ├── clock-out-screen.tsx     # Clock out summary
│   │   │   └── dough-rising.tsx         # Animated dough + live ticker
│   │   ├── friday/
│   │   │   ├── celebration-screen.tsx   # Full Friday celebration
│   │   │   ├── confetti.tsx             # Confetti particle animation
│   │   │   ├── recommendation-card.tsx  # Bakery item card
│   │   │   └── share-button.tsx         # Web Share API + fallback
│   │   ├── baguette-progress.tsx        # Weekly baguette visualization
│   │   ├── bread-shelf.tsx              # Drag-and-drop shelf
│   │   ├── bread-card.tsx               # Individual bread item card
│   │   └── nav.tsx                      # App navigation
│   └── styles/
│       └── globals.css                  # Tailwind + bakery color palette
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # All tables
├── __tests__/
│   ├── lib/
│   │   ├── earnings.test.ts             # Earnings calc tests
│   │   ├── bread-puns.test.ts           # Puns rotation tests
│   │   └── bakery/
│   │       └── mock-provider.test.ts    # Mock provider tests
│   ├── api/
│   │   ├── tap.test.ts                  # Tap endpoint tests
│   │   ├── onboarding.test.ts           # Onboarding endpoint tests
│   │   ├── shelf.test.ts               # Shelf endpoint tests
│   │   └── recommendation.test.ts       # Recommendation logic tests
│   └── components/
│       ├── baguette-progress.test.tsx   # Baguette rendering tests
│       ├── dough-rising.test.tsx        # Dough animation tests
│       ├── bread-shelf.test.tsx         # Shelf drag-and-drop tests
│       └── celebration-screen.test.tsx  # Friday celebration tests
├── public/
│   └── placeholder-bread.svg            # Placeholder bread asset
├── .env.local.example                   # Required env vars
├── tailwind.config.ts
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Scaffolding & Supabase Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `vitest.config.ts`
- Create: `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/styles/globals.css`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "/Users/lauragao/Documents/Mac Docs 2/get-yo-bread"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: Project scaffolded with Next.js 14, App Router, TypeScript, Tailwind.

- [ ] **Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 4: Add test script to package.json**

Add to `scripts` in `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create env example file**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 6: Create Supabase browser client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 7: Create Supabase server client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 8: Create Supabase middleware for session refresh**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}
```

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 9: Create Supabase migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Users profile (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  hourly_rate decimal not null default 0,
  expected_hours_per_week decimal not null default 40,
  location text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own data"
  on public.users for insert
  with check (auth.uid() = id);

-- Physical NFC bread toys
create table public.breads (
  id uuid default gen_random_uuid() primary key,
  nfc_uid text unique not null,
  user_id uuid references public.users(id) on delete set null,
  linked_at timestamptz
);

alter table public.breads enable row level security;

create policy "Anyone can read breads to check link status"
  on public.breads for select
  using (true);

create policy "Authenticated users can claim unlinked breads"
  on public.breads for update
  using (auth.uid() is not null);

create policy "Allow insert for bread registration"
  on public.breads for insert
  with check (true);

-- Time entries
create table public.time_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  earnings decimal
);

alter table public.time_entries enable row level security;

create policy "Users can read own time entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

-- Preferences
create table public.preferences (
  user_id uuid references public.users(id) on delete cascade primary key,
  bakery_prefs text[] not null default '{}',
  allergies text[] not null default '{}'
);

alter table public.preferences enable row level security;

create policy "Users can read own preferences"
  on public.preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on public.preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.preferences for update
  using (auth.uid() = user_id);

-- Curated bakery items (admin-managed)
create table public.curated_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  image_url text,
  tags text[] not null default '{}',
  allergens text[] not null default '{}',
  seasonal boolean not null default false,
  active boolean not null default true
);

alter table public.curated_items enable row level security;

create policy "Anyone can read active curated items"
  on public.curated_items for select
  using (active = true);

-- Recommendations (what users received)
create table public.recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  item_id uuid references public.curated_items(id) on delete cascade not null,
  week_of date not null,
  tried boolean not null default false,
  shelf_position integer,
  created_at timestamptz not null default now(),
  unique(user_id, week_of)
);

alter table public.recommendations enable row level security;

create policy "Users can read own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can update own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);

create policy "System can insert recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

-- Seed some curated items for development
insert into public.curated_items (name, description, image_url, tags, allergens, seasonal) values
  ('Chocolate Babka', 'A rich, swirled chocolate bread that''s part cake, part heaven. The ultimate Friday treat.', '/placeholder-bread.svg', '{"pastry","chocolate","bread"}', '{"gluten","dairy"}', false),
  ('Almond Croissant', 'Flaky, buttery, with a frangipane filling that makes Monday mornings worth it.', '/placeholder-bread.svg', '{"pastry","croissant","nuts"}', '{"gluten","dairy","nuts"}', false),
  ('Sourdough Loaf', 'Crusty outside, tangy inside. The bread that started a pandemic hobby.', '/placeholder-bread.svg', '{"bread","sourdough"}', '{"gluten"}', false),
  ('Kouign-Amann', 'A Breton pastry that''s basically caramelized butter in bread form. You deserve this.', '/placeholder-bread.svg', '{"pastry","caramel"}', '{"gluten","dairy"}', false),
  ('Cinnamon Roll', 'Soft, gooey, dripping with icing. The hug you earned this week.', '/placeholder-bread.svg', '{"pastry","cinnamon","sweet"}', '{"gluten","dairy"}', false),
  ('Pain au Chocolat', 'Two bars of dark chocolate wrapped in buttery puff pastry. Simple. Perfect.', '/placeholder-bread.svg', '{"pastry","chocolate","croissant"}', '{"gluten","dairy"}', false),
  ('Focaccia', 'Dimpled, olive-oiled, herb-topped flatbread. Savory Friday energy.', '/placeholder-bread.svg', '{"bread","savory","herbs"}', '{"gluten"}', false),
  ('Matcha Mochi Donut', 'Chewy, earthy, coated in glaze. A modern classic.', '/placeholder-bread.svg', '{"donut","matcha","sweet"}', '{"gluten","dairy"}', false),
  ('Cardamom Bun', 'Swedish-style, fragrant with cardamom, knotted with love.', '/placeholder-bread.svg', '{"pastry","cardamom","sweet"}', '{"gluten","dairy"}', false),
  ('Everything Bagel', 'Garlic, onion, sesame, poppy, salt. Everything you need to end the week.', '/placeholder-bread.svg', '{"bread","bagel","savory"}', '{"gluten","sesame"}', false),
  ('Pumpkin Spice Scone', 'Fall in pastry form. Warm spices, tender crumb.', '/placeholder-bread.svg', '{"pastry","pumpkin","sweet"}', '{"gluten","dairy"}', true),
  ('Hot Cross Buns', 'Spiced, fruited, glazed. A spring tradition in bread form.', '/placeholder-bread.svg', '{"bread","sweet","spiced"}', '{"gluten","dairy"}', true);
```

- [ ] **Step 10: Set up Tailwind with bakery color palette**

Update `src/styles/globals.css` (replace default content):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-crust: #8B4513;
  --color-golden: #F4A460;
  --color-cream: #FFF8DC;
  --color-warm-white: #FFFAF0;
  --color-butter: #FFD700;
  --color-dough: #F5DEB3;
  --color-chocolate: #3E2723;
  --color-jam: #C62828;
}

body {
  background-color: var(--color-warm-white);
  color: var(--color-chocolate);
  font-family: system-ui, -apple-system, sans-serif;
}
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crust: "#8B4513",
        golden: "#F4A460",
        cream: "#FFF8DC",
        "warm-white": "#FFFAF0",
        butter: "#FFD700",
        dough: "#F5DEB3",
        chocolate: "#3E2723",
        jam: "#C62828",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 11: Create placeholder bread SVG**

Create `public/placeholder-bread.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <ellipse cx="100" cy="120" rx="70" ry="50" fill="#F4A460"/>
  <ellipse cx="100" cy="115" rx="65" ry="45" fill="#DEB887"/>
  <path d="M45 110 Q60 80 100 75 Q140 80 155 110" fill="#D2A679"/>
  <line x1="70" y1="95" x2="75" y2="115" stroke="#C4956A" stroke-width="2" stroke-linecap="round"/>
  <line x1="100" y1="90" x2="100" y2="112" stroke="#C4956A" stroke-width="2" stroke-linecap="round"/>
  <line x1="130" y1="95" x2="125" y2="115" stroke="#C4956A" stroke-width="2" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 12: Create root layout**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Get Yo Bread",
  description: "Tap in. Earn your dough. Treat yourself.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-white text-chocolate">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 13: Create landing page placeholder**

Replace `src/app/page.tsx`:
```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold text-crust mb-4">
        Get Yo Bread
      </h1>
      <p className="text-xl text-golden mb-8">
        Tap in. Earn your dough. Treat yourself.
      </p>
      <p className="text-lg text-chocolate/60">
        Tap your bread to get started.
      </p>
    </main>
  );
}
```

- [ ] **Step 14: Run the dev server to verify scaffolding**

```bash
npm run dev
```

Expected: App starts on localhost:3000, shows landing page with "Get Yo Bread" heading.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Supabase, Tailwind, and bakery theme"
```

---

## Task 2: Shared Types & Utility Functions

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/earnings.ts`
- Create: `src/lib/bread-puns.ts`
- Create: `__tests__/lib/earnings.test.ts`
- Create: `__tests__/lib/bread-puns.test.ts`

- [ ] **Step 1: Write failing test for earnings calculations**

Create `__tests__/lib/earnings.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  calculateSessionEarnings,
  calculateWeeklyEarnings,
  getWeekStart,
  getBaguetteProgress,
} from "@/lib/earnings";

describe("calculateSessionEarnings", () => {
  it("calculates earnings for a simple session", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T17:00:00Z");
    const hourlyRate = 50;
    // 8 hours * $50 = $400
    expect(calculateSessionEarnings(clockIn, clockOut, hourlyRate)).toBe(400);
  });

  it("handles partial hours", () => {
    const clockIn = new Date("2026-03-30T09:00:00Z");
    const clockOut = new Date("2026-03-30T09:30:00Z");
    const hourlyRate = 60;
    // 0.5 hours * $60 = $30
    expect(calculateSessionEarnings(clockIn, clockOut, hourlyRate)).toBe(30);
  });

  it("returns 0 for same clock in and out", () => {
    const time = new Date("2026-03-30T09:00:00Z");
    expect(calculateSessionEarnings(time, time, 50)).toBe(0);
  });
});

describe("calculateWeeklyEarnings", () => {
  it("sums earnings from multiple time entries", () => {
    const entries = [
      { earnings: 400 },
      { earnings: 350 },
      { earnings: 400 },
    ];
    expect(calculateWeeklyEarnings(entries)).toBe(1150);
  });

  it("returns 0 for empty entries", () => {
    expect(calculateWeeklyEarnings([])).toBe(0);
  });
});

describe("getWeekStart", () => {
  it("returns Monday 00:00 for a Wednesday", () => {
    const wednesday = new Date("2026-04-01T14:30:00Z"); // Wednesday
    const weekStart = getWeekStart(wednesday);
    expect(weekStart.getUTCDay()).toBe(1); // Monday
    expect(weekStart.getUTCHours()).toBe(0);
    expect(weekStart.getUTCMinutes()).toBe(0);
  });

  it("returns same day for a Monday", () => {
    const monday = new Date("2026-03-30T10:00:00Z"); // Monday
    const weekStart = getWeekStart(monday);
    expect(weekStart.toISOString().split("T")[0]).toBe("2026-03-30");
  });
});

describe("getBaguetteProgress", () => {
  it("returns 0 for no earnings", () => {
    expect(getBaguetteProgress(0, 50, 40)).toBe(0);
  });

  it("returns 1 for full week earnings", () => {
    // 40 hours * $50 = $2000
    expect(getBaguetteProgress(2000, 50, 40)).toBe(1);
  });

  it("returns 0.5 for half week", () => {
    expect(getBaguetteProgress(1000, 50, 40)).toBe(0.5);
  });

  it("can exceed 1 for overtime", () => {
    expect(getBaguetteProgress(3000, 50, 40)).toBe(1.5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- __tests__/lib/earnings.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create shared types**

Create `src/lib/types.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  hourly_rate: number;
  expected_hours_per_week: number;
  location: string | null;
  created_at: string;
}

export interface Bread {
  id: string;
  nfc_uid: string;
  user_id: string | null;
  linked_at: string | null;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  earnings: number | null;
}

export interface Preferences {
  user_id: string;
  bakery_prefs: string[];
  allergies: string[];
}

export interface CuratedItem {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  tags: string[];
  allergens: string[];
  seasonal: boolean;
  active: boolean;
}

export interface Recommendation {
  id: string;
  user_id: string;
  item_id: string;
  week_of: string;
  tried: boolean;
  shelf_position: number | null;
  created_at: string;
  item?: CuratedItem;
}

export interface Bakery {
  name: string;
  address: string;
  rating?: number;
  distance?: string;
  url?: string;
  photoUrl?: string;
}

export type ClockState = "clocked_in" | "clocked_out";
```

- [ ] **Step 4: Implement earnings calculations**

Create `src/lib/earnings.ts`:
```typescript
export function calculateSessionEarnings(
  clockIn: Date,
  clockOut: Date,
  hourlyRate: number
): number {
  const ms = clockOut.getTime() - clockIn.getTime();
  const hours = ms / (1000 * 60 * 60);
  return Math.round(hours * hourlyRate * 100) / 100;
}

export function calculateWeeklyEarnings(
  entries: { earnings: number | null }[]
): number {
  return entries.reduce((sum, entry) => sum + (entry.earnings ?? 0), 0);
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  // Monday = 1, Sunday = 0 → shift Sunday to 7
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getBaguetteProgress(
  weeklyEarnings: number,
  hourlyRate: number,
  expectedHoursPerWeek: number
): number {
  const expectedWeeklyEarnings = hourlyRate * expectedHoursPerWeek;
  if (expectedWeeklyEarnings === 0) return 0;
  return Math.round((weeklyEarnings / expectedWeeklyEarnings) * 100) / 100;
}

export function formatEarnings(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateLiveEarnings(
  clockInTime: Date,
  hourlyRate: number
): number {
  const now = new Date();
  return calculateSessionEarnings(clockInTime, now, hourlyRate);
}
```

- [ ] **Step 5: Run earnings tests**

```bash
npm test -- __tests__/lib/earnings.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Write failing test for bread puns**

Create `__tests__/lib/bread-puns.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { getRandomPun, PunContext } from "@/lib/bread-puns";

describe("getRandomPun", () => {
  it("returns a string for clock_in context", () => {
    const pun = getRandomPun("clock_in");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for clock_out context", () => {
    const pun = getRandomPun("clock_out");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for friday context", () => {
    const pun = getRandomPun("friday");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for error context", () => {
    const pun = getRandomPun("error");
    expect(typeof pun).toBe("string");
    expect(pun.length).toBeGreaterThan(0);
  });

  it("returns a string for milestone context", () => {
    const pun = getRandomPun("milestone");
    expect(typeof pun).toBe("string");
  });
});
```

- [ ] **Step 7: Run pun tests to verify they fail**

```bash
npm test -- __tests__/lib/bread-puns.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement bread puns**

Create `src/lib/bread-puns.ts`:
```typescript
export type PunContext =
  | "clock_in"
  | "clock_out"
  | "friday"
  | "error"
  | "milestone"
  | "empty_shelf";

const puns: Record<PunContext, string[]> = {
  clock_in: [
    "Let's get this bread.",
    "Time to make some dough.",
    "Rise and grind.",
    "Let's roll.",
    "The daily bread begins.",
  ],
  clock_out: [
    "Another day, another loaf.",
    "You've earned your crust today.",
    "That's a wrap... like a tortilla.",
    "Time to loaf around.",
    "Dough well done.",
  ],
  friday: [
    "You're on a roll!",
    "That's a lot of dough!",
    "You really earned your crust this week.",
    "Bread winner of the week!",
    "The yeast you deserve.",
  ],
  error: [
    "Something went a-rye.",
    "We're in a bit of a jam.",
    "That's not what we kneaded.",
    "Looks like we're toast.",
    "Crumbs. Something broke.",
  ],
  milestone: [
    "You're making serious dough.",
    "Proof that hard work rises to the top.",
    "You're the greatest thing since sliced bread.",
    "That's one well-baked achievement.",
  ],
  empty_shelf: [
    "Your shelf is empty. Time to get baking!",
    "No loaves yet. Keep grinding!",
    "This shelf is ready to rise.",
  ],
};

export function getRandomPun(context: PunContext): string {
  const options = puns[context];
  return options[Math.floor(Math.random() * options.length)];
}

export function getAllPuns(context: PunContext): string[] {
  return puns[context];
}
```

- [ ] **Step 9: Run pun tests**

```bash
npm test -- __tests__/lib/bread-puns.test.ts
```

Expected: All PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/types.ts src/lib/earnings.ts src/lib/bread-puns.ts __tests__/lib/earnings.test.ts __tests__/lib/bread-puns.test.ts
git commit -m "feat: add shared types, earnings calculations, and bread puns"
```

---

## Task 3: Bakery Provider (Mock)

**Files:**
- Create: `src/lib/bakery/provider.ts`
- Create: `src/lib/bakery/mock-provider.ts`
- Create: `__tests__/lib/bakery/mock-provider.test.ts`

- [ ] **Step 1: Write failing test for mock bakery provider**

Create `__tests__/lib/bakery/mock-provider.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { MockBakeryProvider } from "@/lib/bakery/mock-provider";

describe("MockBakeryProvider", () => {
  const provider = new MockBakeryProvider();

  it("returns bakeries for any location", async () => {
    const bakeries = await provider.findNearby("90210");
    expect(bakeries.length).toBeGreaterThan(0);
  });

  it("returns bakeries with required fields", async () => {
    const bakeries = await provider.findNearby("10001");
    bakeries.forEach((bakery) => {
      expect(bakery.name).toBeDefined();
      expect(bakery.address).toBeDefined();
    });
  });

  it("returns at most 5 bakeries by default", async () => {
    const bakeries = await provider.findNearby("10001");
    expect(bakeries.length).toBeLessThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/lib/bakery/mock-provider.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create bakery provider interface**

Create `src/lib/bakery/provider.ts`:
```typescript
import type { Bakery } from "@/lib/types";

export interface BakeryProvider {
  findNearby(location: string, limit?: number): Promise<Bakery[]>;
}
```

- [ ] **Step 4: Create mock bakery provider**

Create `src/lib/bakery/mock-provider.ts`:
```typescript
import type { Bakery } from "@/lib/types";
import type { BakeryProvider } from "./provider";

const mockBakeries: Bakery[] = [
  {
    name: "Golden Crust Bakery",
    address: "123 Main St",
    rating: 4.8,
    distance: "0.3 mi",
    url: "https://example.com/golden-crust",
  },
  {
    name: "Rise & Shine Bread Co.",
    address: "456 Oak Ave",
    rating: 4.6,
    distance: "0.7 mi",
    url: "https://example.com/rise-and-shine",
  },
  {
    name: "The Flour Shop",
    address: "789 Elm St",
    rating: 4.9,
    distance: "1.1 mi",
    url: "https://example.com/flour-shop",
  },
  {
    name: "Crumb & Co.",
    address: "321 Pine Rd",
    rating: 4.5,
    distance: "1.4 mi",
    url: "https://example.com/crumb-co",
  },
  {
    name: "Knead To Know Bakery",
    address: "654 Maple Ln",
    rating: 4.7,
    distance: "1.8 mi",
    url: "https://example.com/knead-to-know",
  },
  {
    name: "Upper Crust Patisserie",
    address: "987 Cedar Blvd",
    rating: 4.4,
    distance: "2.2 mi",
  },
  {
    name: "Sourdough & Sons",
    address: "147 Birch Way",
    rating: 4.3,
    distance: "2.5 mi",
  },
  {
    name: "The Rolling Pin",
    address: "258 Walnut Dr",
    rating: 4.6,
    distance: "2.8 mi",
  },
  {
    name: "Baguette About It",
    address: "369 Cherry Ct",
    rating: 4.8,
    distance: "3.1 mi",
  },
  {
    name: "Loaf & Found",
    address: "480 Willow St",
    rating: 4.2,
    distance: "3.5 mi",
  },
];

export class MockBakeryProvider implements BakeryProvider {
  async findNearby(location: string, limit: number = 5): Promise<Bakery[]> {
    // Simulate async API call
    return mockBakeries.slice(0, limit);
  }
}
```

- [ ] **Step 5: Run tests**

```bash
npm test -- __tests__/lib/bakery/mock-provider.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/bakery/ __tests__/lib/bakery/
git commit -m "feat: add bakery provider interface with mock implementation"
```

---

## Task 4: Tap API Endpoint (Clock In/Out Toggle)

**Files:**
- Create: `src/app/api/tap/[breadId]/route.ts`
- Create: `__tests__/api/tap.test.ts`

- [ ] **Step 1: Write failing test for tap endpoint logic**

Create `__tests__/api/tap.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  determineTapAction,
  type TapContext,
  type TapResult,
} from "@/app/api/tap/[breadId]/route";

describe("determineTapAction", () => {
  it("returns 'onboarding' when bread is not linked", () => {
    const context: TapContext = {
      bread: { id: "1", nfc_uid: "ABC", user_id: null, linked_at: null },
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("onboarding");
  });

  it("returns 'reauth' when bread is linked but no user session", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: null,
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("reauth");
  });

  it("returns 'clock_in' when user is clocked out", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: null,
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("clock_in");
  });

  it("returns 'clock_out' when user is clocked in", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: {
        id: "entry-1",
        user_id: "user-1",
        clock_in: "2026-03-30T09:00:00Z",
        clock_out: null,
        earnings: null,
      },
    };
    const result = determineTapAction(context);
    expect(result.action).toBe("clock_out");
  });

  it("returns 'friday_clock_out' when clocking out on Friday", () => {
    const context: TapContext = {
      bread: {
        id: "1",
        nfc_uid: "ABC",
        user_id: "user-1",
        linked_at: "2026-01-01",
      },
      user: {
        id: "user-1",
        email: "test@test.com",
        hourly_rate: 50,
        expected_hours_per_week: 40,
        location: "90210",
        created_at: "2026-01-01",
      },
      openEntry: {
        id: "entry-1",
        user_id: "user-1",
        clock_in: "2026-04-03T09:00:00Z", // Friday
        clock_out: null,
        earnings: null,
      },
    };
    // Mock current date to Friday
    const result = determineTapAction(context, new Date("2026-04-03T17:00:00Z"));
    expect(result.action).toBe("friday_clock_out");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/api/tap.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement tap endpoint**

Create `src/app/api/tap/[breadId]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateSessionEarnings } from "@/lib/earnings";
import type { User, Bread, TimeEntry } from "@/lib/types";

export interface TapContext {
  bread: Bread | null;
  user: User | null;
  openEntry: TimeEntry | null;
}

export type TapAction =
  | "onboarding"
  | "reauth"
  | "clock_in"
  | "clock_out"
  | "friday_clock_out"
  | "not_found";

export interface TapResult {
  action: TapAction;
  data?: Record<string, unknown>;
}

export function determineTapAction(
  context: TapContext,
  now: Date = new Date()
): TapResult {
  const { bread, user, openEntry } = context;

  if (!bread) {
    return { action: "not_found" };
  }

  if (!bread.user_id) {
    return { action: "onboarding", data: { breadId: bread.id } };
  }

  if (!user) {
    return { action: "reauth", data: { breadId: bread.id } };
  }

  if (!openEntry) {
    return { action: "clock_in" };
  }

  const isFriday = now.getDay() === 5;
  if (isFriday) {
    return { action: "friday_clock_out", data: { entryId: openEntry.id } };
  }

  return { action: "clock_out", data: { entryId: openEntry.id } };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ breadId: string }> }
) {
  const { breadId } = await params;
  const supabase = await createClient();

  // Look up bread by NFC UID
  const { data: bread } = await supabase
    .from("breads")
    .select("*")
    .eq("nfc_uid", breadId)
    .single();

  if (!bread) {
    // First time this NFC UID is seen — create the bread record and go to onboarding
    const { data: newBread, error } = await supabase
      .from("breads")
      .insert({ nfc_uid: breadId })
      .select()
      .single();

    if (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}`, request.url)
    );
  }

  if (!bread.user_id) {
    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}`, request.url)
    );
  }

  // Check auth
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    // Session expired — need re-auth
    return NextResponse.redirect(
      new URL(`/onboarding/${breadId}?reauth=true`, request.url)
    );
  }

  // Get user profile
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  // Check for open time entry
  const { data: openEntry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", authUser.id)
    .is("clock_out", null)
    .single();

  const tapResult = determineTapAction(
    { bread, user, openEntry },
    new Date()
  );

  if (tapResult.action === "clock_in") {
    // Create new time entry
    await supabase.from("time_entries").insert({
      user_id: authUser.id,
      clock_in: new Date().toISOString(),
    });

    return NextResponse.redirect(
      new URL(`/dashboard?state=clocked_in`, request.url)
    );
  }

  if (
    tapResult.action === "clock_out" ||
    tapResult.action === "friday_clock_out"
  ) {
    const clockOut = new Date();
    const earnings = calculateSessionEarnings(
      new Date(openEntry!.clock_in),
      clockOut,
      user!.hourly_rate
    );

    await supabase
      .from("time_entries")
      .update({
        clock_out: clockOut.toISOString(),
        earnings,
      })
      .eq("id", openEntry!.id);

    const isFriday = tapResult.action === "friday_clock_out";
    return NextResponse.redirect(
      new URL(
        `/dashboard?state=clocked_out${isFriday ? "&friday=true" : ""}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- __tests__/api/tap.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/tap/ __tests__/api/tap.test.ts
git commit -m "feat: add NFC tap endpoint with clock in/out toggle logic"
```

---

## Task 5: Onboarding Flow

**Files:**
- Create: `src/app/onboarding/[breadId]/page.tsx`
- Create: `src/components/onboarding/email-step.tsx`
- Create: `src/components/onboarding/rate-step.tsx`
- Create: `src/components/onboarding/location-step.tsx`
- Create: `src/components/onboarding/preferences-step.tsx`
- Create: `src/components/onboarding/complete-step.tsx`
- Create: `src/app/api/onboarding/route.ts`
- Create: `__tests__/api/onboarding.test.ts`

- [ ] **Step 1: Write failing test for onboarding API**

Create `__tests__/api/onboarding.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { validateOnboardingData, type OnboardingData } from "@/app/api/onboarding/route";

describe("validateOnboardingData", () => {
  it("accepts valid data", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: 50,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: ["croissants", "bread"],
      allergies: ["nuts"],
    };
    expect(validateOnboardingData(data)).toEqual({ valid: true });
  });

  it("rejects missing breadId", () => {
    const data = {
      hourlyRate: 50,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    } as unknown as OnboardingData;
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects zero hourly rate", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: 0,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    };
    expect(validateOnboardingData(data).valid).toBe(false);
  });

  it("rejects negative hourly rate", () => {
    const data: OnboardingData = {
      breadId: "ABC123",
      hourlyRate: -10,
      expectedHoursPerWeek: 40,
      location: "90210",
      bakeryPrefs: [],
      allergies: [],
    };
    expect(validateOnboardingData(data).valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/api/onboarding.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Create onboarding API endpoint**

Create `src/app/api/onboarding/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingData {
  breadId: string;
  hourlyRate: number;
  expectedHoursPerWeek: number;
  location: string;
  bakeryPrefs: string[];
  allergies: string[];
}

export function validateOnboardingData(
  data: OnboardingData
): { valid: true } | { valid: false; error: string } {
  if (!data.breadId) {
    return { valid: false, error: "Bread ID is required" };
  }
  if (!data.hourlyRate || data.hourlyRate <= 0) {
    return { valid: false, error: "Hourly rate must be positive" };
  }
  if (!data.expectedHoursPerWeek || data.expectedHoursPerWeek <= 0) {
    return { valid: false, error: "Expected hours must be positive" };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body: OnboardingData = await request.json();

  const validation = validateOnboardingData(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Create user profile
  const { error: userError } = await supabase.from("users").insert({
    id: authUser.id,
    email: authUser.email,
    hourly_rate: body.hourlyRate,
    expected_hours_per_week: body.expectedHoursPerWeek,
    location: body.location,
  });

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Save preferences
  await supabase.from("preferences").insert({
    user_id: authUser.id,
    bakery_prefs: body.bakeryPrefs,
    allergies: body.allergies,
  });

  // Link bread to user
  await supabase
    .from("breads")
    .update({ user_id: authUser.id, linked_at: new Date().toISOString() })
    .eq("nfc_uid", body.breadId);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- __tests__/api/onboarding.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Create onboarding step components**

Create `src/components/onboarding/email-step.tsx`:
```typescript
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface EmailStepProps {
  onComplete: () => void;
}

export function EmailStep({ onComplete }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href,
      },
    });

    setLoading(false);
    if (!error) {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-crust">Check your email!</h2>
        <p className="text-chocolate/70">
          We sent a magic link to <strong>{email}</strong>.
          Click it to continue setting up your bread.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">Welcome to Get Yo Bread!</h2>
        <p className="text-chocolate/70">Enter your email to get started.</p>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </button>
    </form>
  );
}
```

Create `src/components/onboarding/rate-step.tsx`:
```typescript
"use client";

import { useState } from "react";

interface RateStepProps {
  onComplete: (hourlyRate: number, expectedHours: number) => void;
}

export function RateStep({ onComplete }: RateStepProps) {
  const [hourlyRate, setHourlyRate] = useState("");
  const [expectedHours, setExpectedHours] = useState("40");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(parseFloat(hourlyRate), parseFloat(expectedHours));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">How much dough do you make?</h2>
        <p className="text-chocolate/70">This is just for you. We never share it.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-chocolate/70 mb-1">
            Hourly rate ($)
          </label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="50.00"
            min="0.01"
            step="0.01"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-chocolate/70 mb-1">
            Expected hours per week
          </label>
          <input
            type="number"
            value={expectedHours}
            onChange={(e) => setExpectedHours(e.target.value)}
            placeholder="40"
            min="1"
            max="168"
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Next
      </button>
    </form>
  );
}
```

Create `src/components/onboarding/location-step.tsx`:
```typescript
"use client";

import { useState } from "react";

interface LocationStepProps {
  onComplete: (location: string) => void;
}

export function LocationStep({ onComplete }: LocationStepProps) {
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(location);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">Where do you loaf around?</h2>
        <p className="text-chocolate/70">
          We'll use this to find bakeries near you for your Friday treat.
        </p>
      </div>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Zip code or address"
        required
        className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none text-lg"
      />
      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Next
      </button>
    </form>
  );
}
```

Create `src/components/onboarding/preferences-step.tsx`:
```typescript
"use client";

import { useState } from "react";

interface PreferencesStepProps {
  onComplete: (prefs: string[], allergies: string[]) => void;
}

const BAKERY_OPTIONS = [
  "Croissants",
  "Cookies",
  "Cakes",
  "Bread",
  "Pastries",
  "Donuts",
  "Bagels",
  "Muffins",
  "Scones",
  "Pies",
];

const ALLERGY_OPTIONS = [
  "Gluten",
  "Dairy",
  "Nuts",
  "Eggs",
  "Soy",
  "Sesame",
];

export function PreferencesStep({ onComplete }: PreferencesStepProps) {
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");

  function togglePref(pref: string) {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  function toggleAllergy(allergy: string) {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allergies = customAllergy
      ? [...selectedAllergies, ...customAllergy.split(",").map((a) => a.trim())]
      : selectedAllergies;
    onComplete(
      selectedPrefs.map((p) => p.toLowerCase()),
      allergies.map((a) => a.toLowerCase())
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-crust">What's your taste?</h2>
        <p className="text-chocolate/70">Pick your favorites. We'll match your Friday treats.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-chocolate/70 mb-2">
          I love... (pick as many as you want)
        </label>
        <div className="flex flex-wrap gap-2">
          {BAKERY_OPTIONS.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => togglePref(pref)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPrefs.includes(pref)
                  ? "bg-crust text-cream"
                  : "bg-cream border-2 border-golden/30 text-chocolate"
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-chocolate/70 mb-2">
          Allergies (so we don't recommend anything harmful)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {ALLERGY_OPTIONS.map((allergy) => (
            <button
              key={allergy}
              type="button"
              onClick={() => toggleAllergy(allergy)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedAllergies.includes(allergy)
                  ? "bg-jam text-cream"
                  : "bg-cream border-2 border-golden/30 text-chocolate"
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          placeholder="Other allergies (comma separated)"
          className="w-full px-4 py-3 rounded-xl border-2 border-golden/30 bg-cream focus:border-golden focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-crust text-cream font-bold text-lg hover:bg-crust/90 transition-colors"
      >
        Let's get this bread!
      </button>
    </form>
  );
}
```

Create `src/components/onboarding/complete-step.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";

export function CompleteStep() {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="text-8xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        🍞
      </motion.div>
      <h2 className="text-3xl font-bold text-crust">You're all set!</h2>
      <p className="text-xl text-chocolate/70">
        Tap your bread to start earning.
      </p>
      <p className="text-golden font-medium">Rise and grind.</p>
    </motion.div>
  );
}
```

- [ ] **Step 6: Create onboarding page**

Create `src/app/onboarding/[breadId]/page.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmailStep } from "@/components/onboarding/email-step";
import { RateStep } from "@/components/onboarding/rate-step";
import { LocationStep } from "@/components/onboarding/location-step";
import { PreferencesStep } from "@/components/onboarding/preferences-step";
import { CompleteStep } from "@/components/onboarding/complete-step";

type Step = "email" | "rate" | "location" | "preferences" | "complete";

export default function OnboardingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const breadId = params.breadId as string;
  const isReauth = searchParams.get("reauth") === "true";
  const supabase = createClient();

  const [step, setStep] = useState<Step>("email");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [expectedHours, setExpectedHours] = useState(40);
  const [location, setLocation] = useState("");

  // Check if user is already authed (magic link callback)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        if (isReauth) {
          // Already have account, just needed to re-auth
          router.push(`/tap/${breadId}`);
        } else {
          setStep("rate");
        }
      }
    });
  }, [supabase, breadId, isReauth, router]);

  async function handleRateComplete(rate: number, hours: number) {
    setHourlyRate(rate);
    setExpectedHours(hours);
    setStep("location");
  }

  async function handleLocationComplete(loc: string) {
    setLocation(loc);
    setStep("preferences");
  }

  async function handlePreferencesComplete(
    prefs: string[],
    allergies: string[]
  ) {
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breadId,
        hourlyRate,
        expectedHoursPerWeek: expectedHours,
        location,
        bakeryPrefs: prefs,
        allergies,
      }),
    });

    if (response.ok) {
      setStep("complete");
      // Redirect to tap URL after showing success
      setTimeout(() => router.push(`/tap/${breadId}`), 3000);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step === "email" && <EmailStep onComplete={() => setStep("rate")} />}
        {step === "rate" && <RateStep onComplete={handleRateComplete} />}
        {step === "location" && (
          <LocationStep onComplete={handleLocationComplete} />
        )}
        {step === "preferences" && (
          <PreferencesStep onComplete={handlePreferencesComplete} />
        )}
        {step === "complete" && <CompleteStep />}
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/app/onboarding/ src/components/onboarding/ src/app/api/onboarding/ __tests__/api/onboarding.test.ts
git commit -m "feat: add onboarding flow with magic link auth, rate, location, preferences"
```

---

## Task 6: Dashboard & Clock In/Out Screens

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/clock/clock-in-screen.tsx`
- Create: `src/components/clock/clock-out-screen.tsx`
- Create: `src/components/clock/dough-rising.tsx`
- Create: `src/components/baguette-progress.tsx`
- Create: `src/components/nav.tsx`
- Create: `__tests__/components/baguette-progress.test.tsx`
- Create: `__tests__/components/dough-rising.test.tsx`

- [ ] **Step 1: Write failing test for baguette progress**

Create `__tests__/components/baguette-progress.test.tsx`:
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaguetteProgress } from "@/components/baguette-progress";

describe("BaguetteProgress", () => {
  it("renders with 0 progress", () => {
    render(<BaguetteProgress progress={0} weeklyEarnings={0} />);
    expect(screen.getByText("$0.00")).toBeDefined();
  });

  it("renders with partial progress", () => {
    render(<BaguetteProgress progress={0.5} weeklyEarnings={1000} />);
    expect(screen.getByText("$1,000.00")).toBeDefined();
  });

  it("renders with full progress", () => {
    render(<BaguetteProgress progress={1} weeklyEarnings={2000} />);
    expect(screen.getByText("$2,000.00")).toBeDefined();
  });

  it("handles overtime (progress > 1)", () => {
    render(<BaguetteProgress progress={1.5} weeklyEarnings={3000} />);
    expect(screen.getByText("$3,000.00")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/components/baguette-progress.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement baguette progress component**

Create `src/components/baguette-progress.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";
import { formatEarnings } from "@/lib/earnings";

interface BaguetteProgressProps {
  progress: number; // 0 to 1+, where 1 = full week
  weeklyEarnings: number;
}

export function BaguetteProgress({
  progress,
  weeklyEarnings,
}: BaguetteProgressProps) {
  // Baguette width: min 60px (dinner roll) to max based on container
  // Progress > 1 makes it comically long (overflow with scroll)
  const widthPercent = Math.min(progress * 100, 150);
  const isOvertime = progress > 1;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-chocolate/60">
          This week
        </span>
        <span className="text-lg font-bold text-crust">
          {formatEarnings(weeklyEarnings)}
        </span>
      </div>
      <div className="relative h-16 bg-cream rounded-2xl overflow-hidden border-2 border-golden/20">
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center"
          initial={{ width: "5%" }}
          animate={{ width: `${Math.max(widthPercent, 5)}%` }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
        >
          <div
            className={`h-10 w-full mx-2 rounded-full ${
              isOvertime
                ? "bg-gradient-to-r from-golden via-butter to-golden"
                : "bg-gradient-to-r from-crust to-golden"
            }`}
            style={{
              borderRadius: "9999px",
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </motion.div>
      </div>
      {isOvertime && (
        <p className="text-sm text-butter font-medium text-center">
          Overtime! That baguette is getting long!
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run baguette test**

```bash
npm test -- __tests__/components/baguette-progress.test.tsx
```

Expected: All PASS.

- [ ] **Step 5: Write failing test for dough rising**

Create `__tests__/components/dough-rising.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DoughRising } from "@/components/clock/dough-rising";

describe("DoughRising", () => {
  it("renders with current earnings", () => {
    const clockInTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    render(<DoughRising clockInTime={clockInTime} hourlyRate={50} />);
    // Should show some earnings amount (formatted as $XX.XX)
    const earningsEl = screen.getByTestId("live-earnings");
    expect(earningsEl).toBeDefined();
  });

  it("displays the dough animation container", () => {
    const clockInTime = new Date();
    render(<DoughRising clockInTime={clockInTime} hourlyRate={50} />);
    expect(screen.getByTestId("dough-container")).toBeDefined();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- __tests__/components/dough-rising.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement dough rising component**

Create `src/components/clock/dough-rising.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { calculateLiveEarnings, formatEarnings } from "@/lib/earnings";

interface DoughRisingProps {
  clockInTime: Date;
  hourlyRate: number;
}

export function DoughRising({ clockInTime, hourlyRate }: DoughRisingProps) {
  const [earnings, setEarnings] = useState(
    calculateLiveEarnings(clockInTime, hourlyRate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings(calculateLiveEarnings(clockInTime, hourlyRate));
    }, 1000);
    return () => clearInterval(interval);
  }, [clockInTime, hourlyRate]);

  // Dough scale based on hours worked (grows over 8 hours)
  const hoursWorked =
    (Date.now() - clockInTime.getTime()) / (1000 * 60 * 60);
  const scale = Math.min(1 + hoursWorked * 0.1, 2);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div
        data-testid="dough-container"
        className="relative w-48 h-48 flex items-center justify-center"
      >
        <motion.div
          className="bg-dough rounded-full shadow-lg"
          animate={{
            scale: [scale, scale * 1.02, scale],
            borderRadius: ["50%", "48%", "50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: 120,
            height: 100,
            background:
              "radial-gradient(ellipse at 40% 40%, #F5DEB3, #DEB887)",
          }}
        />
      </div>
      <div className="text-center">
        <p
          data-testid="live-earnings"
          className="text-4xl font-bold text-crust tabular-nums"
        >
          {formatEarnings(earnings)}
        </p>
        <p className="text-sm text-chocolate/50 mt-1">and rising...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run dough rising test**

```bash
npm test -- __tests__/components/dough-rising.test.tsx
```

Expected: All PASS.

- [ ] **Step 9: Implement clock in/out screen components**

Create `src/components/clock/clock-in-screen.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";
import { DoughRising } from "./dough-rising";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";

interface ClockInScreenProps {
  clockInTime: Date;
  hourlyRate: number;
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function ClockInScreen({
  clockInTime,
  hourlyRate,
  weeklyEarnings,
  baguetteProgress,
}: ClockInScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      <div>
        <h1 className="text-3xl font-bold text-crust">
          {getRandomPun("clock_in")}
        </h1>
        <p className="text-chocolate/60 mt-2">
          Clocked in at{" "}
          {clockInTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <DoughRising clockInTime={clockInTime} hourlyRate={hourlyRate} />

      <BaguetteProgress
        progress={baguetteProgress}
        weeklyEarnings={weeklyEarnings}
      />
    </motion.div>
  );
}
```

Create `src/components/clock/clock-out-screen.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";
import { formatEarnings } from "@/lib/earnings";

interface ClockOutScreenProps {
  sessionEarnings: number;
  sessionDuration: string;
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function ClockOutScreen({
  sessionEarnings,
  sessionDuration,
  weeklyEarnings,
  baguetteProgress,
}: ClockOutScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-center"
    >
      <div>
        <h1 className="text-3xl font-bold text-crust">
          {getRandomPun("clock_out")}
        </h1>
      </div>

      <div className="bg-cream rounded-2xl p-6 border-2 border-golden/20">
        <p className="text-sm text-chocolate/60">Today's session</p>
        <p className="text-4xl font-bold text-crust mt-1">
          {formatEarnings(sessionEarnings)}
        </p>
        <p className="text-sm text-chocolate/50 mt-1">{sessionDuration}</p>
      </div>

      <BaguetteProgress
        progress={baguetteProgress}
        weeklyEarnings={weeklyEarnings}
      />
    </motion.div>
  );
}
```

- [ ] **Step 10: Implement nav component**

Create `src/components/nav.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🍞" },
  { href: "/shelf", label: "Shelf", icon: "🗄️" },
  { href: "/board", label: "Board", icon: "📊" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-warm-white border-t-2 border-golden/20 px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? "text-crust" : "text-chocolate/40"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 11: Implement dashboard page**

Create `src/app/dashboard/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClockInScreen } from "@/components/clock/clock-in-screen";
import { ClockOutScreen } from "@/components/clock/clock-out-screen";
import { Nav } from "@/components/nav";
import {
  calculateWeeklyEarnings,
  getBaguetteProgress,
  getWeekStart,
} from "@/lib/earnings";
import type { User, TimeEntry } from "@/lib/types";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const clockState = searchParams.get("state") || "clocked_out";
  const isFriday = searchParams.get("friday") === "true";

  const [user, setUser] = useState<User | null>(null);
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [latestEntry, setLatestEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const weekStart = getWeekStart(new Date()).toISOString();

      const { data: entries } = await supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", authUser.id)
        .gte("clock_in", weekStart)
        .order("clock_in", { ascending: false });

      setUser(userData);
      setWeekEntries(entries || []);
      setLatestEntry(entries?.[0] || null);
      setLoading(false);
    }

    loadData();
  }, [supabase]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-golden text-xl">Loading your dough...</p>
      </main>
    );
  }

  const weeklyEarnings = calculateWeeklyEarnings(
    weekEntries.filter((e) => e.earnings != null)
  );
  const baguetteProgress = getBaguetteProgress(
    weeklyEarnings,
    user.hourly_rate,
    user.expected_hours_per_week
  );

  // If Friday redirect came in, redirect to the celebration page
  if (isFriday) {
    // Dynamic import handled in Task 7
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pb-24">
      <div className="w-full max-w-md">
        {clockState === "clocked_in" && latestEntry && (
          <ClockInScreen
            clockInTime={new Date(latestEntry.clock_in)}
            hourlyRate={user.hourly_rate}
            weeklyEarnings={weeklyEarnings}
            baguetteProgress={baguetteProgress}
          />
        )}

        {clockState === "clocked_out" && latestEntry && (
          <ClockOutScreen
            sessionEarnings={latestEntry.earnings || 0}
            sessionDuration={formatDuration(
              latestEntry.clock_in,
              latestEntry.clock_out
            )}
            weeklyEarnings={weeklyEarnings}
            baguetteProgress={baguetteProgress}
          />
        )}

        {clockState === "clocked_out" && !latestEntry && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-crust">
              Ready to rise and grind?
            </h1>
            <p className="text-chocolate/60">Tap your bread to clock in.</p>
          </div>
        )}
      </div>
      <Nav />
    </main>
  );
}

function formatDuration(
  clockIn: string,
  clockOut: string | null
): string {
  if (!clockOut) return "";
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}
```

- [ ] **Step 12: Run all tests**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 13: Commit**

```bash
git add src/app/dashboard/ src/components/clock/ src/components/baguette-progress.tsx src/components/nav.tsx __tests__/components/
git commit -m "feat: add dashboard with clock in/out screens, dough rising, baguette progress"
```

---

## Task 7: Friday Celebration & Recommendation

**Files:**
- Create: `src/components/friday/celebration-screen.tsx`
- Create: `src/components/friday/confetti.tsx`
- Create: `src/components/friday/recommendation-card.tsx`
- Create: `src/components/friday/share-button.tsx`
- Create: `src/app/api/recommendation/route.ts`
- Create: `__tests__/api/recommendation.test.ts`
- Create: `__tests__/components/celebration-screen.test.tsx`

- [ ] **Step 1: Write failing test for recommendation logic**

Create `__tests__/api/recommendation.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  pickRecommendation,
  type RecommendationContext,
} from "@/app/api/recommendation/route";

describe("pickRecommendation", () => {
  const items = [
    {
      id: "1",
      name: "Chocolate Babka",
      description: "Rich chocolate bread",
      image_url: null,
      tags: ["pastry", "chocolate"],
      allergens: ["gluten", "dairy"],
      seasonal: false,
      active: true,
    },
    {
      id: "2",
      name: "Almond Croissant",
      description: "Flaky almond pastry",
      image_url: null,
      tags: ["pastry", "croissant", "nuts"],
      allergens: ["gluten", "dairy", "nuts"],
      seasonal: false,
      active: true,
    },
    {
      id: "3",
      name: "Sourdough Loaf",
      description: "Tangy bread",
      image_url: null,
      tags: ["bread", "sourdough"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  ];

  it("picks an item matching user preferences", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.tags).toContain("pastry");
  });

  it("excludes items with user allergens", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: ["nuts"],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.name).not.toBe("Almond Croissant");
  });

  it("excludes previously recommended items", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry", "bread"],
      allergies: [],
      pastItemIds: ["1", "2"],
    };
    const result = pickRecommendation(context);
    expect(result).toBeDefined();
    expect(result!.id).toBe("3");
  });

  it("returns null when no items match", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["pastry"],
      allergies: ["gluten"], // all items have gluten
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    expect(result).toBeNull();
  });

  it("falls back to any unshown item when no prefs match", () => {
    const context: RecommendationContext = {
      items,
      prefs: ["donut"], // no donuts in items
      allergies: [],
      pastItemIds: [],
    };
    const result = pickRecommendation(context);
    // Should still return something since we fall back
    expect(result).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/api/recommendation.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement recommendation endpoint**

Create `src/app/api/recommendation/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CuratedItem } from "@/lib/types";
import { MockBakeryProvider } from "@/lib/bakery/mock-provider";

export interface RecommendationContext {
  items: CuratedItem[];
  prefs: string[];
  allergies: string[];
  pastItemIds: string[];
}

export function pickRecommendation(
  context: RecommendationContext
): CuratedItem | null {
  const { items, prefs, allergies, pastItemIds } = context;

  // Filter out past recommendations and items with allergens
  const safeItems = items.filter(
    (item) =>
      !pastItemIds.includes(item.id) &&
      !item.allergens.some((a) => allergies.includes(a))
  );

  if (safeItems.length === 0) return null;

  // Prefer items that match user preferences
  const prefMatches = safeItems.filter((item) =>
    item.tags.some((tag) => prefs.includes(tag))
  );

  const pool = prefMatches.length > 0 ? prefMatches : safeItems;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get user preferences
  const { data: prefs } = await supabase
    .from("preferences")
    .select("*")
    .eq("user_id", authUser.id)
    .single();

  // Get all active curated items
  const { data: items } = await supabase
    .from("curated_items")
    .select("*")
    .eq("active", true);

  // Get past recommendation item IDs
  const { data: pastRecs } = await supabase
    .from("recommendations")
    .select("item_id")
    .eq("user_id", authUser.id);

  const pastItemIds = (pastRecs || []).map((r) => r.item_id);

  const picked = pickRecommendation({
    items: items || [],
    prefs: prefs?.bakery_prefs || [],
    allergies: prefs?.allergies || [],
    pastItemIds,
  });

  if (!picked) {
    return NextResponse.json(
      { error: "No recommendations available" },
      { status: 404 }
    );
  }

  // Save the recommendation
  const today = new Date().toISOString().split("T")[0];
  await supabase.from("recommendations").insert({
    user_id: authUser.id,
    item_id: picked.id,
    week_of: today,
  });

  // Get nearby bakeries
  const { data: user } = await supabase
    .from("users")
    .select("location")
    .eq("id", authUser.id)
    .single();

  const bakeryProvider = new MockBakeryProvider();
  const bakeries = await bakeryProvider.findNearby(user?.location || "", 3);

  return NextResponse.json({
    item: picked,
    bakeries,
  });
}
```

- [ ] **Step 4: Run recommendation tests**

```bash
npm test -- __tests__/api/recommendation.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Implement confetti component**

Create `src/components/friday/confetti.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const COLORS = ["#F4A460", "#FFD700", "#8B4513", "#FFF8DC", "#DEB887", "#C62828"];

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: window?.innerHeight + 20 || 800,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: p.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Implement recommendation card**

Create `src/components/friday/recommendation-card.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";
import type { CuratedItem, Bakery } from "@/lib/types";
import Image from "next/image";

interface RecommendationCardProps {
  item: CuratedItem;
  bakeries: Bakery[];
}

export function RecommendationCard({
  item,
  bakeries,
}: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, type: "spring", duration: 0.8 }}
      className="bg-cream rounded-2xl p-6 border-2 border-golden/30 shadow-lg space-y-4"
    >
      <p className="text-sm font-medium text-golden text-center">
        This week's treat
      </p>

      <div className="flex flex-col items-center space-y-3">
        <div className="w-24 h-24 rounded-xl bg-dough/50 flex items-center justify-center overflow-hidden">
          <Image
            src={item.image_url || "/placeholder-bread.svg"}
            alt={item.name}
            width={80}
            height={80}
          />
        </div>
        <h3 className="text-2xl font-bold text-crust">{item.name}</h3>
        <p className="text-chocolate/70 text-center text-sm">
          {item.description}
        </p>
      </div>

      {bakeries.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-chocolate/50 uppercase">
            Bakeries near you
          </p>
          {bakeries.map((bakery) => (
            <div
              key={bakery.name}
              className="flex justify-between items-center py-2 border-b border-golden/10 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-chocolate">
                  {bakery.name}
                </p>
                <p className="text-xs text-chocolate/50">{bakery.address}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-golden">{bakery.distance}</p>
                {bakery.rating && (
                  <p className="text-xs text-chocolate/50">
                    {bakery.rating} ★
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 7: Implement share button**

Create `src/components/friday/share-button.tsx`:
```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CuratedItem } from "@/lib/types";

interface ShareButtonProps {
  item: CuratedItem;
  recommendationId: string;
}

export function ShareButton({ item, recommendationId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${recommendationId}`;
  const shareText = `I earned my bread this week! This Friday's treat: ${item.name}. Let's celebrate Friday together! 🍞`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Get Yo Bread — Friday Treat",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Trigger haptic feedback
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(50);
  }

  return (
    <motion.button
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      className="w-full py-4 rounded-xl bg-crust text-cream font-bold text-lg shadow-lg hover:bg-crust/90 transition-colors"
    >
      {copied ? "Link copied!" : "Share the treat! 🎉"}
    </motion.button>
  );
}
```

- [ ] **Step 8: Implement celebration screen**

Create `src/components/friday/celebration-screen.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Confetti } from "./confetti";
import { RecommendationCard } from "./recommendation-card";
import { ShareButton } from "./share-button";
import { BaguetteProgress } from "@/components/baguette-progress";
import { getRandomPun } from "@/lib/bread-puns";
import { formatEarnings } from "@/lib/earnings";
import type { CuratedItem, Bakery } from "@/lib/types";

interface CelebrationScreenProps {
  weeklyEarnings: number;
  baguetteProgress: number;
}

export function CelebrationScreen({
  weeklyEarnings,
  baguetteProgress,
}: CelebrationScreenProps) {
  const [recommendation, setRecommendation] = useState<{
    item: CuratedItem;
    bakeries: Bakery[];
    id?: string;
  } | null>(null);

  useEffect(() => {
    // Trigger haptic feedback on celebration
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    async function loadRecommendation() {
      const response = await fetch("/api/recommendation");
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    }

    loadRecommendation();
  }, []);

  return (
    <div className="space-y-8">
      <Confetti />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-crust">
          {getRandomPun("friday")}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-cream rounded-2xl p-8 border-2 border-butter/50 shadow-lg text-center"
      >
        <p className="text-sm text-chocolate/60">This week you made</p>
        <p className="text-5xl font-bold text-crust mt-2">
          {formatEarnings(weeklyEarnings)}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <BaguetteProgress
          progress={baguetteProgress}
          weeklyEarnings={weeklyEarnings}
        />
      </motion.div>

      {recommendation && (
        <>
          <RecommendationCard
            item={recommendation.item}
            bakeries={recommendation.bakeries}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <ShareButton
              item={recommendation.item}
              recommendationId={recommendation.id || ""}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Write celebration screen test**

Create `__tests__/components/celebration-screen.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CelebrationScreen } from "@/components/friday/celebration-screen";

// Mock fetch for recommendation API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        item: {
          id: "1",
          name: "Chocolate Babka",
          description: "Rich chocolate bread",
          image_url: null,
          tags: ["pastry"],
          allergens: ["gluten"],
          seasonal: false,
          active: true,
        },
        bakeries: [
          { name: "Test Bakery", address: "123 Main St", distance: "0.3 mi" },
        ],
      }),
  })
) as unknown as typeof fetch;

// Mock navigator.vibrate
Object.defineProperty(navigator, "vibrate", {
  value: vi.fn(),
  writable: true,
});

describe("CelebrationScreen", () => {
  it("renders weekly earnings", () => {
    render(
      <CelebrationScreen weeklyEarnings={1247.5} baguetteProgress={1} />
    );
    expect(screen.getByText("$1,247.50")).toBeDefined();
  });

  it("renders the celebration heading", () => {
    render(
      <CelebrationScreen weeklyEarnings={1000} baguetteProgress={0.8} />
    );
    // Should render one of the Friday puns — just check heading exists
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeDefined();
  });
});
```

- [ ] **Step 10: Run all tests**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 11: Update dashboard to handle Friday**

Update `src/app/dashboard/page.tsx` — replace the `if (isFriday)` block:

Find:
```typescript
  if (isFriday) {
    // Dynamic import handled in Task 7
    return null;
  }
```

Replace with:
```typescript
  if (isFriday) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 pb-24">
        <div className="w-full max-w-md">
          <CelebrationScreen
            weeklyEarnings={weeklyEarnings}
            baguetteProgress={baguetteProgress}
          />
        </div>
        <Nav />
      </main>
    );
  }
```

Add import at top of file:
```typescript
import { CelebrationScreen } from "@/components/friday/celebration-screen";
```

- [ ] **Step 12: Commit**

```bash
git add src/components/friday/ src/app/api/recommendation/ src/app/dashboard/ __tests__/api/recommendation.test.ts __tests__/components/celebration-screen.test.tsx
git commit -m "feat: add Friday celebration with confetti, recommendation, haptics, and sharing"
```

---

## Task 8: Shareable Recommendation Page

**Files:**
- Create: `src/app/share/[recommendationId]/page.tsx`

- [ ] **Step 1: Create the public share page**

Create `src/app/share/[recommendationId]/page.tsx`:
```typescript
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Metadata } from "next";

interface SharePageProps {
  params: Promise<{ recommendationId: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { recommendationId } = await params;
  const supabase = await createClient();

  const { data: rec } = await supabase
    .from("recommendations")
    .select("*, item:curated_items(*)")
    .eq("id", recommendationId)
    .single();

  if (!rec?.item) {
    return { title: "Get Yo Bread" };
  }

  return {
    title: `${rec.item.name} — Get Yo Bread`,
    description: `This week's Friday treat: ${rec.item.name}. ${rec.item.description}`,
    openGraph: {
      title: `${rec.item.name} — Get Yo Bread`,
      description: `I earned my bread this week! This Friday's treat: ${rec.item.name}`,
      images: [rec.item.image_url || "/placeholder-bread.svg"],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { recommendationId } = await params;
  const supabase = await createClient();

  const { data: rec } = await supabase
    .from("recommendations")
    .select("*, item:curated_items(*)")
    .eq("id", recommendationId)
    .single();

  if (!rec?.item) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-chocolate/60">Something went a-rye. Recommendation not found.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-warm-white to-cream">
      <div className="w-full max-w-md text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-crust">Get Yo Bread</h1>
          <p className="text-golden mt-1">Friday Treat</p>
        </div>

        <div className="bg-warm-white rounded-2xl p-8 border-2 border-golden/30 shadow-lg space-y-4">
          <div className="w-24 h-24 mx-auto rounded-xl bg-dough/50 flex items-center justify-center overflow-hidden">
            <Image
              src={rec.item.image_url || "/placeholder-bread.svg"}
              alt={rec.item.name}
              width={80}
              height={80}
            />
          </div>
          <h2 className="text-2xl font-bold text-crust">{rec.item.name}</h2>
          <p className="text-chocolate/70">{rec.item.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-crust">
            Let's celebrate Friday together! 🍞
          </p>
          <p className="text-sm text-chocolate/50">
            Want your own Friday bread recommendations?
          </p>
          <a
            href="/"
            className="inline-block mt-2 px-6 py-3 rounded-xl bg-crust text-cream font-bold hover:bg-crust/90 transition-colors"
          >
            Get Yo Bread
          </a>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/share/
git commit -m "feat: add public shareable recommendation page with OG meta tags"
```

---

## Task 9: Bread Shelf (Drag-and-Drop Ranking)

**Files:**
- Create: `src/app/shelf/page.tsx`
- Create: `src/components/bread-shelf.tsx`
- Create: `src/components/bread-card.tsx`
- Create: `src/app/api/shelf/route.ts`
- Create: `src/app/api/shelf/[id]/route.ts`
- Create: `__tests__/api/shelf.test.ts`
- Create: `__tests__/components/bread-shelf.test.tsx`

- [ ] **Step 1: Write failing test for shelf API**

Create `__tests__/api/shelf.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { reorderPositions } from "@/app/api/shelf/route";

describe("reorderPositions", () => {
  it("assigns sequential positions from top to bottom", () => {
    const ids = ["rec-3", "rec-1", "rec-2"];
    const result = reorderPositions(ids);
    expect(result).toEqual([
      { id: "rec-3", shelf_position: 1 },
      { id: "rec-1", shelf_position: 2 },
      { id: "rec-2", shelf_position: 3 },
    ]);
  });

  it("handles single item", () => {
    const result = reorderPositions(["rec-1"]);
    expect(result).toEqual([{ id: "rec-1", shelf_position: 1 }]);
  });

  it("handles empty array", () => {
    const result = reorderPositions([]);
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- __tests__/api/shelf.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement shelf API endpoints**

Create `src/app/api/shelf/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function reorderPositions(
  ids: string[]
): { id: string; shelf_position: number }[] {
  return ids.map((id, index) => ({
    id,
    shelf_position: index + 1,
  }));
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { orderedIds }: { orderedIds: string[] } = await request.json();
  const updates = reorderPositions(orderedIds);

  for (const update of updates) {
    await supabase
      .from("recommendations")
      .update({ shelf_position: update.shelf_position })
      .eq("id", update.id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
```

Create `src/app/api/shelf/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase
    .from("recommendations")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Run shelf tests**

```bash
npm test -- __tests__/api/shelf.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Implement bread card component**

Create `src/components/bread-card.tsx`:
```typescript
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Recommendation, CuratedItem } from "@/lib/types";

interface BreadCardProps {
  recommendation: Recommendation & { item: CuratedItem };
  onMarkTried: (id: string) => void;
  isDragging?: boolean;
}

export function BreadCard({
  recommendation,
  onMarkTried,
  isDragging,
}: BreadCardProps) {
  const { item } = recommendation;
  const isTried = recommendation.tried;

  return (
    <motion.div
      layout
      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
        isDragging
          ? "border-butter shadow-lg bg-cream scale-105"
          : isTried
          ? "border-golden/30 bg-cream"
          : "border-golden/10 bg-cream/50 opacity-70"
      }`}
    >
      <div className="w-14 h-14 rounded-lg bg-dough/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <Image
          src={item.image_url || "/placeholder-bread.svg"}
          alt={item.name}
          width={48}
          height={48}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-crust truncate">{item.name}</h3>
        <p className="text-xs text-chocolate/50 truncate">{item.description}</p>
        <p className="text-xs text-golden mt-1">
          {recommendation.week_of}
        </p>
      </div>

      <div className="flex-shrink-0">
        {!isTried ? (
          <button
            onClick={() => onMarkTried(recommendation.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-golden/20 text-crust hover:bg-golden/40 transition-colors"
          >
            Tried it!
          </button>
        ) : (
          <span className="text-sm">✓</span>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 6: Implement bread shelf component**

Create `src/components/bread-shelf.tsx`:
```typescript
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BreadCard } from "./bread-card";
import type { Recommendation, CuratedItem } from "@/lib/types";

type RecWithItem = Recommendation & { item: CuratedItem };

interface BreadShelfProps {
  recommendations: RecWithItem[];
  onReorder: (orderedIds: string[]) => void;
  onMarkTried: (id: string) => void;
}

function SortableBreadCard({
  recommendation,
  onMarkTried,
}: {
  recommendation: RecWithItem;
  onMarkTried: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recommendation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BreadCard
        recommendation={recommendation}
        onMarkTried={onMarkTried}
        isDragging={isDragging}
      />
    </div>
  );
}

export function BreadShelf({
  recommendations: initialRecs,
  onReorder,
  onMarkTried,
}: BreadShelfProps) {
  const [items, setItems] = useState(initialRecs);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(current, oldIndex, newIndex);
      onReorder(newOrder.map((i) => i.id));
      return newOrder;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((rec) => (
            <SortableBreadCard
              key={rec.id}
              recommendation={rec}
              onMarkTried={onMarkTried}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 7: Implement shelf page**

Create `src/app/shelf/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BreadShelf } from "@/components/bread-shelf";
import { Nav } from "@/components/nav";
import { getRandomPun } from "@/lib/bread-puns";
import type { Recommendation, CuratedItem } from "@/lib/types";

type RecWithItem = Recommendation & { item: CuratedItem };

export default function ShelfPage() {
  const [recommendations, setRecommendations] = useState<RecWithItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadShelf() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("recommendations")
        .select("*, item:curated_items(*)")
        .eq("user_id", user.id)
        .order("shelf_position", { ascending: true, nullsFirst: false });

      setRecommendations((data as RecWithItem[]) || []);
      setLoading(false);
    }

    loadShelf();
  }, [supabase]);

  async function handleReorder(orderedIds: string[]) {
    await fetch("/api/shelf", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
  }

  async function handleMarkTried(id: string) {
    await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tried: true }),
    });

    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, tried: true } : r))
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-golden text-xl">Loading your shelf...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-crust">Bread Shelf</h1>
          <p className="text-chocolate/60 mt-1">
            Drag to rank your favorites. Top shelf = top tier.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🗄️</p>
            <p className="text-chocolate/60">
              {getRandomPun("empty_shelf")}
            </p>
          </div>
        ) : (
          <BreadShelf
            recommendations={recommendations}
            onReorder={handleReorder}
            onMarkTried={handleMarkTried}
          />
        )}
      </div>
      <Nav />
    </main>
  );
}
```

- [ ] **Step 8: Write shelf component test**

Create `__tests__/components/bread-shelf.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreadShelf } from "@/components/bread-shelf";

const mockRecs = [
  {
    id: "rec-1",
    user_id: "user-1",
    item_id: "item-1",
    week_of: "2026-03-27",
    tried: true,
    shelf_position: 1,
    created_at: "2026-03-27",
    item: {
      id: "item-1",
      name: "Chocolate Babka",
      description: "Rich chocolate bread",
      image_url: null,
      tags: ["pastry"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  },
  {
    id: "rec-2",
    user_id: "user-1",
    item_id: "item-2",
    week_of: "2026-03-20",
    tried: false,
    shelf_position: 2,
    created_at: "2026-03-20",
    item: {
      id: "item-2",
      name: "Sourdough Loaf",
      description: "Tangy bread",
      image_url: null,
      tags: ["bread"],
      allergens: ["gluten"],
      seasonal: false,
      active: true,
    },
  },
];

describe("BreadShelf", () => {
  it("renders all recommendation cards", () => {
    render(
      <BreadShelf
        recommendations={mockRecs}
        onReorder={vi.fn()}
        onMarkTried={vi.fn()}
      />
    );
    expect(screen.getByText("Chocolate Babka")).toBeDefined();
    expect(screen.getByText("Sourdough Loaf")).toBeDefined();
  });

  it("shows 'Tried it!' button for untried items", () => {
    render(
      <BreadShelf
        recommendations={mockRecs}
        onReorder={vi.fn()}
        onMarkTried={vi.fn()}
      />
    );
    expect(screen.getByText("Tried it!")).toBeDefined();
  });
});
```

- [ ] **Step 9: Run all tests**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 10: Commit**

```bash
git add src/app/shelf/ src/app/api/shelf/ src/components/bread-shelf.tsx src/components/bread-card.tsx __tests__/api/shelf.test.ts __tests__/components/bread-shelf.test.tsx
git commit -m "feat: add bread shelf with drag-and-drop ranking and tried-it tracking"
```

---

## Task 10: Bread Board (Lifetime Stats)

**Files:**
- Create: `src/app/board/page.tsx`

- [ ] **Step 1: Implement bread board page**

Create `src/app/board/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Nav } from "@/components/nav";
import { formatEarnings } from "@/lib/earnings";

interface Stats {
  totalEarnings: number;
  totalHours: number;
  totalTreats: number;
  totalTried: number;
  topBread: string | null;
}

function getBreadTitle(hours: number): { title: string; emoji: string } {
  if (hours >= 1000) return { title: "Master Baker", emoji: "👨‍🍳" };
  if (hours >= 500) return { title: "Golden Crust", emoji: "🥐" };
  if (hours >= 100) return { title: "Rising Starter", emoji: "🍞" };
  return { title: "Fresh Dough", emoji: "🫓" };
}

export default function BoardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all time entries
      const { data: entries } = await supabase
        .from("time_entries")
        .select("earnings, clock_in, clock_out")
        .eq("user_id", user.id)
        .not("clock_out", "is", null);

      // Get recommendations
      const { data: recs } = await supabase
        .from("recommendations")
        .select("*, item:curated_items(name)")
        .eq("user_id", user.id)
        .order("shelf_position", { ascending: true });

      const totalEarnings = (entries || []).reduce(
        (sum, e) => sum + (e.earnings || 0),
        0
      );

      const totalHours = (entries || []).reduce((sum, e) => {
        if (!e.clock_out) return sum;
        const ms =
          new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime();
        return sum + ms / (1000 * 60 * 60);
      }, 0);

      const triedRecs = (recs || []).filter((r) => r.tried);
      const topRec = recs?.[0];

      setStats({
        totalEarnings,
        totalHours: Math.round(totalHours * 10) / 10,
        totalTreats: (recs || []).length,
        totalTried: triedRecs.length,
        topBread: topRec?.item?.name || null,
      });
      setLoading(false);
    }

    loadStats();
  }, [supabase]);

  if (loading || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-golden text-xl">Counting your dough...</p>
      </main>
    );
  }

  const { title, emoji } = getBreadTitle(stats.totalHours);

  return (
    <main className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-crust">Bread Board</h1>
        </div>

        {/* Title Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-golden/20 to-butter/20 rounded-2xl p-6 text-center border-2 border-golden/30"
        >
          <span className="text-5xl">{emoji}</span>
          <h2 className="text-2xl font-bold text-crust mt-2">{title}</h2>
          <p className="text-sm text-chocolate/60">{stats.totalHours} hours</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Earned"
            value={formatEarnings(stats.totalEarnings)}
            delay={0.1}
          />
          <StatCard
            label="Hours Worked"
            value={`${stats.totalHours}h`}
            delay={0.2}
          />
          <StatCard
            label="Treats Unlocked"
            value={String(stats.totalTreats)}
            delay={0.3}
          />
          <StatCard
            label="Treats Tried"
            value={String(stats.totalTried)}
            delay={0.4}
          />
        </div>

        {stats.topBread && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-cream rounded-2xl p-4 border-2 border-golden/20 text-center"
          >
            <p className="text-xs text-chocolate/50 uppercase">
              Top Ranked Bread
            </p>
            <p className="text-lg font-bold text-crust mt-1">
              {stats.topBread}
            </p>
          </motion.div>
        )}
      </div>
      <Nav />
    </main>
  );
}

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-cream rounded-xl p-4 border-2 border-golden/20 text-center"
    >
      <p className="text-xs text-chocolate/50 uppercase">{label}</p>
      <p className="text-xl font-bold text-crust mt-1">{value}</p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/board/
git commit -m "feat: add bread board with lifetime stats and bread-themed milestone titles"
```

---

## Task 11: Final Integration & Polish

**Files:**
- Modify: `src/app/layout.tsx` — add viewport meta for mobile
- Modify: `src/app/page.tsx` — improve landing page
- Verify all routes work end-to-end

- [ ] **Step 1: Update root layout for mobile optimization**

Update `src/app/layout.tsx`:
```typescript
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Get Yo Bread",
  description: "Tap in. Earn your dough. Treat yourself.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFAF0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-warm-white text-chocolate antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update landing page**

Update `src/app/page.tsx`:
```typescript
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="space-y-8 max-w-md">
        <div className="w-24 h-24 mx-auto">
          <Image
            src="/placeholder-bread.svg"
            alt="Get Yo Bread"
            width={96}
            height={96}
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-crust">Get Yo Bread</h1>
          <p className="text-xl text-golden">
            Tap in. Earn your dough. Treat yourself.
          </p>
        </div>

        <div className="space-y-4 text-chocolate/70">
          <p>
            Tap your NFC bread to clock in. Watch your dough rise.
            Every Friday, get a bakery treat recommendation near you.
          </p>
        </div>

        <p className="text-sm text-chocolate/40">
          Tap your bread to get started.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All PASS.

- [ ] **Step 4: Run dev server and verify**

```bash
npm run dev
```

Expected: App starts. Navigate to:
- `/` — Landing page loads
- `/dashboard` — Dashboard page loads (empty state)
- `/shelf` — Shelf page loads (empty state with pun)
- `/board` — Board page loads (Fresh Dough title, zero stats)

- [ ] **Step 5: Run build to check for TypeScript errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: final polish — mobile viewport, landing page, integration verification"
```

---

## Summary

**11 tasks, ~60 steps.** After completing all tasks:

- NFC tap at `/tap/[breadId]` handles the entire clock in/out flow
- First tap triggers onboarding (magic link, rate, location, preferences)
- Clock in shows dough rising animation with live earnings
- Clock out shows session summary with baguette progress
- Friday clock out triggers celebration with confetti, haptics, bakery recommendation, and share button
- Bread Shelf page with drag-and-drop ranking and "tried it" tracking
- Bread Board page with lifetime stats and bread-themed milestone titles
- Public shareable recommendation page with OG meta tags
- Provider-agnostic bakery lookup (mock for dev)
- Full test coverage on business logic
