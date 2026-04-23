# AirFns Softwares Ltd — Replit Build Prompt (v2)

---

## PROJECT OVERVIEW

Build the official website for **AirFns Softwares Ltd**, a hybrid UK-registered technology company building AI-powered digital systems. The site must feel world-class. Not like a typical agency site, not like a template. Think: the visual precision of Linear.app, the quiet authority of Vercel.com, and the intentionality of a company that knows exactly what it is building and why.

This is the company's primary digital presence. It must communicate credibility, technical depth and forward-thinking energy simultaneously.

---

## TECH STACK (STRICT — DO NOT DEVIATE)

Split into two separate Replit repositories.

### Frontend — deploy on Render as Static Site
- **Framework:** React 18 with TypeScript (TSX)
- **Build tool:** Vite
- **Styling:** Tailwind CSS with a custom theme config
- **Animations:** Framer Motion for page transitions and scroll reveals
- **Routing:** React Router v6 (client-side, hash or history mode)
- **HTTP client:** Axios for API calls to backend
- **Output:** `/dist` folder, deployable as static site on Render
- **TypeScript config:** strict mode on

### Backend — deploy on Render as Node.js Web Service
- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Language:** JavaScript (CommonJS)
- **Email:** Resend (`resend` npm package) — for clean, reliable transactional email delivery
- **AI:** Google Gemini API via `@google/generative-ai`
- **CORS:** Configured to only allow `FRONTEND_URL` from .env
- **Environment variables via `.env`:**
  - `GEMINI_API_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` (e.g. hello@airfnssoftwares.com)
  - `FRONTEND_URL`
  - `PORT` (default 3001)
- **Routes:**
  - `POST /api/contact` — name, email, subject, message — sends via Resend
  - `POST /api/ai-enhance` — raw message text — returns Gemini-enhanced version
  - `GET /api/health` — returns `{ status: "ok" }`

---

## BRAND IDENTITY

- **Company name:** AirFns Softwares Ltd
- **Tagline:** "We Build Systems That Think"
- **Sub-tagline:** "AI-powered digital infrastructure for a world that moves fast"
- **Logo:** Provided as `airfns-logo.png` — place in `/public/assets/`. The logo has a distinctive red dot on the letter "i" in AirFns. This red dot is the brand accent. Do not use green as an accent colour anywhere on this site — that colour belongs to Carbioo AI, a separate product.

### Colour Palette
```
Background:       #0A0A0A   (near black)
Surface:          #111111   (card backgrounds)
Surface elevated: #161616   (hover states, modals)
Border subtle:    #1F1F1F
Border visible:   #2A2A2A
Text primary:     #F9FAFB   (almost white)
Text secondary:   #9CA3AF   (muted gray)
Text tertiary:    #6B7280   (very muted)
Accent red:       #E53E3E   (matches the red dot on the AirFns logo i)
Accent red soft:  #FCA5A5   (lighter red for tags, badges)
Accent red glow:  rgba(229, 62, 62, 0.15)  (for subtle glow effects)
White pure:       #FFFFFF
```

No green anywhere on this site. Red is the only accent colour. Use it sparingly and intentionally — CTAs, hover states on interactive elements, active nav indicators, the AI enhance button, success states, and the logo dot reference only.

### Typography
- **Headings:** `Inter` (Google Fonts) — weight 700 and 800
- **Body:** `Inter` — weight 400 and 500
- **Monospace / tags:** `JetBrains Mono` (Google Fonts) — for tech tags, code references, small labels
- **Font sizes:** Follow a clear type scale — do not use arbitrary sizes

### Aesthetic Direction
Dark-first. Minimal. Futuristic without being cold. Every section should feel considered. Intentional negative space. Subtle red glow on key interactive elements only. No cheap gradients. No stock imagery. No icons from icon packs unless they are simple SVG inline icons.

---

## SITE STRUCTURE

Single-page app with smooth scroll navigation and React Router for any dedicated routes.

### Navigation (sticky)
- Logo left — `airfns-logo.png`
- Links right: Work, Products, About, Contact
- On scroll past hero: nav background transitions from transparent to `#0A0A0A` with a subtle bottom border `#1F1F1F`
- Mobile: hamburger icon, full-screen slide-in menu with staggered link entrance
- Active link: red underline indicator

---

### Section 1 — Hero

- Full viewport height (`100vh`)
- Vertically and horizontally centred content
- Headline animates in word-by-word using Framer Motion on mount:
  `"We Build Systems That Think"`
  — large, bold, white, commanding. H1. No decoration.
- Sub-headline fades in 400ms after headline completes:
  `"AirFns Softwares Ltd builds AI-powered platforms and digital infrastructure for organisations that want to move faster, smarter, and further."`
- Two buttons fade in 200ms after sub-headline:
  - Primary: `"See Our Work"` — solid red background, white text, scrolls to Work section
  - Secondary: `"Get In Touch"` — transparent, white border, white text, scrolls to Contact
- Background: a very subtle animated grid of thin lines (`#1F1F1F`) with a slow red glow pulse emanating from the centre — think of it as a heartbeat, not a fireworks show. CSS only, no canvas, no heavy libraries.
- No hero image. Typography is the hero.

---

### Section 2 — What We Do

- Headline: `"We don't just write code. We architect solutions."`
- Three capability cards in a responsive grid (3 col desktop, 1 col mobile):

  **AI Integration**
  Icon: a simple brain or circuit SVG inline
  "We embed intelligence directly into your products. From recommendation engines to decision-support systems that change how organisations operate."

  **Platform Engineering**
  Icon: layers or stack SVG
  "Full-stack digital platforms built to handle real users, real data and real scale. We build for longevity, not just launch day."

  **Carbon and Climate Tech**
  Icon: leaf or signal SVG
  "Building the data infrastructure that helps industries track, report and reduce their environmental impact. This is where technology meets responsibility."

- Card style: `#111111` background, `#1F1F1F` border, subtle red border glow on hover, slight lift transform on hover (translate Y -4px), 300ms ease

---

### Section 3 — Why AirFns

- Two-column layout: left side has four bold statement blocks, right side has a paragraph
- Left blocks animate in staggered on scroll (Framer Motion, InView):
  - `"UK Registered"` — Internationally credible, locally committed
  - `"Hybrid Team"` — Nigeria and UK presence, global outlook
  - `"AI-Native"` — Intelligence is not a feature. It is the foundation.
  - `"0 to Deployed"` — Fast from idea to live system, without cutting corners
- Right paragraph: "AirFns Softwares Ltd is not a typical agency. We are builders. A hybrid team operating across Nigeria and the United Kingdom, building systems at the intersection of artificial intelligence, regulatory technology and human experience. Every product we ship is designed to last."
- Each left block has a small red dot or red left-border as a visual anchor

---

### Section 4 — Our Work and Products

This section has two clear tabs or a two-part smooth layout. Label it simply: **"Work"** for client projects, **"Products"** for things we own and build ourselves.

Use a tab switcher at the top of the section — two pills: `Work` and `Products`. The active tab has a red indicator. Switching is animated (Framer Motion layout animation, no jarring jump).

#### Tab: Work (Client Projects)

These are platforms AirFns Softwares has built for or in partnership with others. Cards are clean, dark, minimal.

Each card contains:
- Project name (bold, white)
- One-line description (muted gray)
- Tech tags in `JetBrains Mono` small caps (e.g. `Health Tech`, `Web Platform`)
- A `"Visit"` button — outlined, white, opens URL in new tab
- A dark visual area at top of card (just the project name rendered large and faded as a visual texture — no screenshots needed)

**Projects:**

1. **MyWellbeingToday**
   Description: "A digital wellbeing platform connecting people to mental health resources and daily support tools."
   URL: https://mywellbeingtoday.com
   Tags: `Health Tech` `Web Platform` `UX`

2. **GlobalHealth.works**
   Description: "A global health information system designed to surface healthcare resources and insights across regions."
   URL: https://globalhealth.works
   Tags: `Health` `Information Systems` `Global`

Grid: 2 columns desktop, 1 column mobile.

#### Tab: Products (Our Own)

These are products AirFns Softwares is building and owns. This tab should feel slightly more elevated — these are not client work, they are the company's own intellectual output.

Each product card:
- Product name (bold, larger)
- Status badge (pill) — colour-coded: `"In Development"` in muted red, `"Live"` in muted white
- Description (2 to 3 lines)
- Tech tags
- CTA button — `"Learn More"` or `"Coming Soon"` (disabled state, not just greyed out — give it a `cursor-not-allowed` and a tooltip: "Coming soon")
- Optional: the product logo image if provided — render it in the card header area

**Products:**

1. **Carbioo AI** *(Featured — visually elevated, slightly larger card or full-width)*
   Status: `In Development`
   Description: "An AI-powered carbon tracking and reduction platform for the maritime sector. Carbioo AI gives regulators, operators and policymakers the data infrastructure they need to measure, report and reduce emissions in line with international standards."
   Tags: `AI` `Carbon Tech` `Maritime` `RegTech`
   Logo: render `carbioo-logo.png` from `/public/assets/` if the file exists — if not, render the product name large as a visual treatment
   CTA: `"Coming Soon"` — disabled button with tooltip

Grid: products deserve more space — single column or large 2-col cards.

---

### Section 5 — About

- Headline: `"Built different. On purpose."`
- Company story: "AirFns Softwares Ltd was founded with one conviction: that the most important technology problems are the ones most organisations are not yet equipped to solve. We build at the frontier of AI, climate technology and digital infrastructure. Not because it is easy, but because it is where we can create lasting value."
- Two-column layout below:
  - Left: four value cards, each with a red left-border accent:
    - **Transparency** — "We tell you what things really require. No surprises."
    - **Execution** — "We ship. Fast and properly. Not one or the other."
    - **Intelligence** — "AI is not a feature to us. It is a foundation."
    - **Impact** — "We measure success by what changes, not what ships."
  - Right: team note — "We are a lean, hybrid team with roots in Nigeria and a global outlook. We operate across time zones, industries and disciplines — united by the belief that great software changes things." Then a small note: `"Carbioo AI™ — Trademarked in the United Kingdom"`

---

### Section 6 — Contact

Two-panel layout. This section is technically the most important — build it with care.

**Left panel:**
- Headline: `"Let's talk."`
- Warm body copy: "We are always open to the right conversations. Whether you have a project in mind, a problem to solve, or you simply want to understand what we do — reach out. We respond to every message."
- Email shown as a link: `hello@airfnssoftwares.com`
- Subtle separator then: a small note about the AI feature — "Our contact form uses AI to help you communicate clearly. You are always in control."

**Right panel — the contact form:**

Fields:
- Full Name (text input)
- Email Address (email input)
- Subject (text input)
- Message (textarea, minimum 120px height, auto-grows)

**AI Enhancement Flow:**

Below the message textarea, show an `"Enhance with AI"` button — red outlined, with a small sparkle or wand SVG icon. This is the differentiator.

When clicked:
1. Button shows loading state: spinner + `"Enhancing..."`
2. Message text is sent via Axios to backend `POST /api/ai-enhance`
3. Backend sends to Gemini with this exact system prompt:
   > "You are a professional communication assistant. The user wants to contact AirFns Softwares Ltd, a UK-registered AI and technology company. Take their raw message and rewrite it to be clear, professional and well-structured — keeping their original intent and tone fully intact but making it more articulate and effective. Return only the improved message text. No preamble, no explanation, no quotation marks around it."
4. Textarea content is replaced with the enhanced version with a smooth fade transition
5. Three action buttons appear below the textarea in a row:
   - `"Use This"` — red filled, locks in enhanced version, hides the three buttons, re-enables submit
   - `"Regenerate"` — outlined red, runs enhancement again on the original saved message
   - `"Use My Original"` — text button (no border), reverts to what the user typed before enhancing
6. If API call fails: show subtle inline message below textarea in muted red text — `"Could not enhance right now. Your message is ready to send as-is."`
7. Always save the original message before enhancement so revert is always possible

**Submit flow:**
- Validate: all fields required, email format check
- POST to backend `/api/contact`
- Loading state on submit button: spinner + `"Sending..."`
- On success: form fades out, replaced with a centred success state: a red checkmark icon, `"Message received."`, and below it `"We will be in touch."`
- On error: inline error below submit button — `"Something went wrong. Please email us directly at hello@airfnssoftwares.com"`

All form inputs: dark background `#111111`, border `#2A2A2A`, white text, red border on focus, smooth transition.

---

## FOOTER

- Logo left (`airfns-logo.png`, small)
- Centre: navigation links — Work, Products, About, Contact
- Right: `hello@airfnssoftwares.com`
- Bottom row, full width: `"© 2025 AirFns Softwares Ltd. All rights reserved."` left, `"Carbioo AI™ — Trademarked in the United Kingdom"` right — both in small muted text
- Background: `#0A0A0A`, top border `#1F1F1F`

---

## ANIMATIONS AND INTERACTIONS

- Hero headline: Framer Motion word-by-word reveal on mount (`staggerChildren`)
- All sections: fade-up reveal on scroll using Framer Motion `whileInView` with `once: true`
- Project and product cards: stagger entrance when section enters viewport
- Tab switcher in Work/Products: Framer Motion `AnimatePresence` for smooth content swap
- Nav background: CSS transition on scroll class toggle
- All hover states: 200-300ms ease, nothing jarring
- Form field focus: red border glow transition
- AI button loading: animated spinner (CSS or Framer Motion)
- Success state: fade in with slight upward motion

---

## PERFORMANCE AND STANDARDS

- Fully responsive: 360px, 768px, 1024px, 1280px+ breakpoints
- TypeScript strict mode — no `any` unless absolutely necessary, comment why
- All images have `alt` attributes
- Semantic HTML: `<main>`, `<section>`, `<nav>`, `<article>`, `<footer>`, `<h1>` once per page
- Focus states visible for keyboard users
- Meta tags in `index.html`: title, description, og:title, og:description, og:image
- Favicon: AirFns logo

---

## FILE STRUCTURE

```
/airfns-frontend/
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  /public
    /assets
      airfns-logo.png        ← upload AirFns Softwares logo here
      carbioo-logo.png       ← upload Carbioo AI logo here (used in Products tab)
  /src
    main.tsx
    App.tsx
    index.css
    /components
      Navbar.tsx
      Hero.tsx
      WhatWeDo.tsx
      WhyAirFns.tsx
      WorkAndProducts.tsx    ← contains tab logic
      WorkTab.tsx
      ProductsTab.tsx
      About.tsx
      Contact.tsx
      ContactForm.tsx        ← AI enhancement logic lives here
      Footer.tsx
    /types
      index.ts               ← shared TypeScript interfaces
    /hooks
      useScrollNav.ts        ← handles nav background on scroll
      useInView.ts           ← scroll reveal helper if needed

/airfns-backend/
  index.js
  package.json
  .env.example
  /routes
    contact.js
    aiEnhance.js
```

---

## ASSETS TO UPLOAD

Upload both files into `/airfns-frontend/public/assets/` before starting the build:

1. `airfns-logo.png` — AirFns Softwares logo, transparent background, dark text with red dot on the i
2. `carbioo-logo.png` — Carbioo AI logo, transparent background — used only in the Products tab card

---

## DEPLOYMENT NOTES

**Frontend (Render Static Site):**
- Build command: `npm run build`
- Publish directory: `dist`
- No server-side rendering needed

**Backend (Render Web Service — Node.js):**
- Start command: `node index.js`
- Environment variables to set in Render dashboard:
  - `GEMINI_API_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL` (e.g. hello@airfnssoftwares.com)
  - `FRONTEND_URL` (the Render static site URL — used for CORS)
  - `PORT`

---

## FINAL INSTRUCTION

Build this exactly as specified. Start from a clean Vite React TypeScript project for the frontend — do not use a template that brings its own design system or component library. Start from a clean Express project for the backend. The AI contact enhancement feature is not optional — it is a core part of what makes this site distinctive. The colour system is strict: no green, red accent only, used with restraint. The result must look like it was built by a company that takes quality seriously, because it was.
