# Kommercia – Your Commercial Department in the Cloud

Kommercia er en enkel, webbaseret CRM‑ og leadgenereringsplatform designet til små virksomheder, iværksættere og solo‑sælgere. Målet er at give dig et komplet overblik over dine salgsleads, automatisk hente nye leads via AI‑baseret web‑søgning og holde styr på din kommunikation med potentielle kunder via Gmail‑overvågning. Platformen er bygget med moderne webteknologier som Next.js 14 (App Router), Supabase, NextAuth, Tailwind CSS og GPT‑4.

## 🚀 Funktioner

### ✅ Login og dashboards

* **Landing page** – En simpel forside med logo, sloganet “Your Commercial Department in the Cloud” og en Google‑login knap.
* **Sikker login** – Autentificering via NextAuth med Google OAuth. Brugere skal logge ind før de kan se deres dashboards.
* **Lead‑dashboard** – Et overskueligt overblik over alle dine leads i både kanban‑ og tabelvisning. Du kan søge, filtrere og sortere, samt tilføje nye leads manuelt eller importere en liste.

### 🌟 AI‑drevet leadgenerering

* Hver uge scanner systemet internettet efter nye, potentielle kunder baseret på dine præferencer og tidligere leads. Dette gøres via OpenAI GPT‑4 kombineret med Serper.dev (web‑search). Ti kvalificerede leads tilføjes automatisk i en særskilt sektion “Nye leads”.

### 📧 Gmail‑overvågning (læsning)

* Kommercia kan læse dine mails (ingen udsendelse) via Gmail API (OAuth2). Systemet matcher e‑mails med eksisterende leads, opdaterer “sidste kontakt” og registrerer, om der er kommet svar. Dermed har du altid et opdateret overblik over kommunikation med hver lead.

### 🧠 Supabase‑database

Data gemmes i Supabase (PostgreSQL + Auth). Tabellen `users` oprettes automatisk via NextAuth, mens `leads`, `lead_sources` og `interactions` kan oprettes manuelt (se `supabase_schema.sql`). Brugere har kun adgang til deres egne leads via row‑level security (RLS).

## 💙️ Teknisk stack

| Element        | Teknologi                             |
|---------------|----------------------------------------|
| Framework     | [Next.js 14](https://nextjs.org/docs) (App Router) |
| Hosting       | [Vercel](https://vercel.com/)           |
| Database      | [Supabase](https://supabase.com/) (Postgres + Auth) |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/) |
| Auth          | [NextAuth.js](https://next-auth.js.org/) med Google OAuth |
| AI integration | [OpenAI GPT‑4](https://openai.com/) + [Serper.dev](https://serper.dev/) |
| E‑mail API    | [Gmail API](https://developers.google.com/gmail/api) (læseadgang) |

## 📂 Projektstruktur

```
kommercia/
│
├‑ app/                  # App Router entrypoints
│  ├‑ layout.tsx         # Global layout & session provider
│  ├‑ page.tsx           # Landing page med login
│  ├‑ dashboard/         # Beskyttet dashboard
│  │  ├‑ page.tsx        # Lead‑kanban og tabelvisning
│  │  ├‑ components/     # UI‑komponenter til dashboardet
│  └‑ api/
│     ├‑ auth/[...nextauth]/route.ts  # NextAuth konfiguration
│     └‑ newLeads/route.ts            # API‑endpoint til AI‑genererede leads
│
├‑ components/           # Fælles komponenter (knapper, formularer, lister m.m.)
├‑ lib/                  # Klienter til Supabase, OpenAI, Serper og Gmail
├‑ supabase_schema.sql   # SQL til oprettelse af tabeller i Supabase
├‑ .env.example          # Eksempel på miljøvariabler
├‑ package.json
├‑ tsconfig.json
├‑ tailwind.config.ts
└‑ README.md
```

## 📟 Supabase‑schema

Filen `supabase_schema.sql` indeholder SQL‑definitioner til tabellerne, som du kan køre via Supabase SQL editor.

```sql
-- Opret tabel til leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  company text,
  status text not null default 'new',
  last_contact_date timestamp,
  next_task_date timestamp,
  warm_category text,
  email text,
  phone text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tabel til kilder for leads (manuelt eller AI)
create table if not exists public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- Tabel til interaktioner (e‑mails, opkald, møder ...)
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads on delete cascade,
  type text not null,
  interaction_date timestamp not null default now(),
  notes text,
  created_at timestamp default now()
);

-- RLS: Sørg for at brugere kun kan se egne leads
alter table public.leads enable row level security;
create policy "Leads are owned" on public.leads
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

```

## 📦 Installation og opsætning

1. **Klon repo** og installer afhængigheder:

   ```bash
   git clone https://github.com/<your-org>/kommercia.git
   cd kommercia
   npm install
   ```

2. **Konfigurer miljøvariabler**: Kopiér `.env.example` til `.env.local` og indsæt dine egne nøgler (Supabase, Google OAuth, OpenAI, Serper, Gmail). Du finder dine Supabase‑nøgler i Supabase‑dashboardet under “Settings → API”. Google‑ og Gmail‑nøgler skal du oprette via Google Cloud Console (OAuth‑skærm og Credentials).

3. **Opret Supabase‑tabeller**: Log ind på [Supabase SQL editor](https://app.supabase.com/), vælg dit projekt og kør SQL‑kode fra `supabase_schema.sql`. Dette opretter tabellerne `leads`, `lead_sources` og `interactions` samt row level security (RLS).

4. **Start udviklingsserver**:

   ```bash
   npm run dev
   ```

   Appen kører på http://localhost:3000.

5. **Deploy til Vercel**: Tilslut dit GitHub‑repo i Vercel, angiv miljøvariabler og deploy. Vercel registrerer automatisk Next.js‑app'en.

## 🤔 AI‑genererede leads

Endpointet `/api/newLeads` (POST) opretter nye leads via GPT‑4 og Serper.dev. Funktionen henter dine eksisterende leads fra Supabase, deducerer et søgeprompt baseret på dine bedste leads (f.eks. branche, størrelse og geografi) og foretager en web‑søgning. Derefter genereres et sæt leads, som lagres i Supabase med status `new`. Du kan tilpasse prompten i `app/api/newLeads/route.ts`.

## 📧 Gmail‑integration

For at overvåge e‑mails anvendes Gmail API. Du skal tildele læseadgang via OAuth2 og gemme `refresh_token` i miljøvariablerne. Funktionen findes i `lib/gmail.ts` og kan automatiseres med en cron‑job (f.eks. Vercel Cron). E‑mails matches mod leads baseret på e‑mailadresse og opdaterer felterne `last_contact_date` og `notes`.

## 🛡️ Licens

Dette projekt er licenseret under MIT‑licensen. Se `LICENSE` for detaljer.
