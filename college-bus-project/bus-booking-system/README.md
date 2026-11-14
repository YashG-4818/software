<div align="center">

# 🚌 OmniBus

### A calmer way to plan, book, and follow your next bus trip.

Search routes, choose seats, manage bookings, and keep up with trip activity—all in one responsive bus-travel experience.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2d3748?logo=prisma)

</div>

---

## ✨ What you can do

| 🧳 Passenger | 🚍 Driver | 🧭 Admin |
| --- | --- | --- |
| Search routes, compare available trips, select seats, and view a booking receipt. | Open a role-based dashboard to manage trip activity and passenger boarding. | Review fleet activity, search users, update statuses, and add users. |

### A little more

- **Live route view** — follow an animated Connaught Place–North Campus journey with landmark, speed, and ETA updates.
- **Trip management** — view trip status and activity from the tracking pages.
- **Flexible checkout** — choose UPI, card, net banking, or wallet in a familiar checkout layout.
- **Responsive interface** — use the booking and management screens on desktop or mobile.

> **About live tracking:** The included city route and fleet records are local mock data for the browser experience. No real GPS feed is required.

## 🧰 Built with

- [Next.js](https://nextjs.org/) 16 · [React](https://react.dev/) 19 · [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) · [Lucide](https://lucide.dev/)
- [Prisma](https://www.prisma.io/) with SQLite · [NextAuth.js](https://next-auth.js.org/)
- [Leaflet](https://leafletjs.com/) / [React Leaflet](https://react-leaflet.js.org/) for maps
- Locally confirmed checkout with no external payment service

## 🚀 Get started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
git clone <repository-url>
cd bus-booking-system
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`.

Set a private, randomly generated `NEXTAUTH_SECRET` in `.env.local`. For example:

```bash
openssl rand -base64 32
```

Initialize the local database and start the app:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 🔐 Accounts and modules

Create an account at `/register` and sign in at `/login`. Registration supports Passenger, Driver, and Admin roles. The app uses a local SQLite database at `prisma/dev.db`.

The home page includes quick links to the passenger, driver, and admin areas. In development, the `?demo=true` links let you preview the Driver and Admin screens; production access remains role-protected.

## 💳 Checkout

The checkout presents UPI, cards, net banking, and wallet options for the booking flow. Confirming creates a locally confirmed ticket; the UPI QR is decorative and cannot be scanned to pay. **No payment provider is contacted and no money is collected.**

## 🗺️ Local route data

The sample route and fleet users are maintained together in [`src/data/mockData.ts`](src/data/mockData.ts). The tracking page animates through the route locally, and the admin fleet view uses the same sample records for its initial state.

## 🧪 Useful commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Serve the production build
```

## 📁 Project map

```text
src/
├── app/                 # Pages, route handlers, and role-based modules
│   ├── admin/           # Fleet management
│   ├── api/             # Authentication, booking, tracking, and payment APIs
│   ├── driver/          # Driver dashboard
│   ├── payment/         # Checkout
│   └── track/           # Trip tracking and map
├── components/          # Shared UI and map components
├── data/                # Shared local route and fleet data
└── lib/                 # Authentication, database, and trip helpers
prisma/
└── schema.prisma        # SQLite data model
```

---

<div align="center">

Made for smoother journeys. 🚌

</div>
