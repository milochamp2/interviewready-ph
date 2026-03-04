# InterviewReady PH — Claude Code Project Guide

## Project Overview

InterviewReady PH is a Philippine-focused web app for interview preparation. It hooks users via a psychological questionnaire, generates AI-powered role-specific mock interviews, and monetizes through one-time payments via PayMongo.

**Key principles:**
- No login / no accounts — entirely session-based (UUID in URL)
- Tagalog (Taglish) + English language support
- PayMongo for GCash/Maya/Card payments
- 30-day entitlement with 7-day extensions
- Deploy on Vercel

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS with CSS custom properties (dark theme)
- **Database:** PostgreSQL via Prisma ORM
- **AI:** OpenAI GPT-4o-mini (structured JSON output)
- **Payments:** PayMongo Checkout Sessions API
- **Fonts:** Outfit (body) + Fraunces (display headings)
- **Deployment:** Vercel

## Core Funnel Flow

```
Landing (/) → Questionnaire (/q) → Results (/r/[id]) → Mock + Paywall (/m/[id]) → Checkout (/checkout/[id]) → PayMongo → Success (/success)
```

After 30 days: → Expired (/expired/[id]) → Extension/Renewal → PayMongo → Success

## Database Schema (Prisma)

5 tables: sessions, interviews, entitlements, bundle_outputs, email_requests

## Pricing

| Plan | Price | Access |
|------|-------|--------|
| basic_399 | ₱399 | 30-day: 15 Qs, AI scoring, PDF |
| bundle_999 | ₱999 | 30-day: everything + resume + cover letter + practice mode |
| extend_149 | ₱149 | +7 days (max 2 per session) |

## Design System

Dark premium editorial theme. Background: #0B0E14 → #12161F → #181D28. Primary: #FF6D3F.

## Setup

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

## TODOs

1. PDF generation — implement with @react-pdf/renderer
2. Email sending — implement with nodemailer
3. Language context propagation
4. Bundle outputs (resume + cover letter generation)
5. Practice mode for bundle_999
