<div align="center">

# 🚌 OmniBus

### Plan your next trip with confidence.

A modern bus-booking experience for passengers, drivers, and fleet administrators.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-111827?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-5a67d8?logo=prisma&logoColor=white)

</div>

---

## ✨ At a glance

OmniBus brings the main parts of a bus journey into one responsive app—from finding a route and selecting a seat to managing trips and viewing a ticket.

| 🧳 Passenger | 🚍 Driver | 🧭 Admin |
| --- | --- | --- |
| Search routes, compare trips, choose seats, and review tickets. | View trip activity and manage passenger boarding. | Monitor fleet users, update statuses, and add users. |

### Highlights

- **Route search** — browse available buses and compare trip details.
- **Seat selection** — choose seats and review the booking before checkout.
- **Trip tracking** — watch a sample journey progress across city landmarks, with speed and ETA updates.
- **Fleet management** — view users, status, and trip activity in the admin area.
- **Responsive UI** — use the booking and management screens on desktop or mobile.

## 🧰 Technology

| Area | Stack |
| --- | --- |
| App | Next.js 16 · React 19 · TypeScript · Tailwind CSS |
| Data & auth | Prisma · SQLite · NextAuth.js |
| Maps & icons | Leaflet · React Leaflet · Lucide |

## 🚀 Get started

### Requirements

- Node.js 20 or newer
- npm

### Install dependencies

From the repository root:

```bash
git clone <repository-url>
cd college-bus-project/bus-booking-system
npm install
cp .env.example .env.local
```

Set `NEXTAUTH_SECRET` in `.env.local` to a private, randomly generated value. For example:

```bash
openssl rand -base64 32
```

Initialize the local database and start the development server:

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Create an account at `/register` or sign in at `/login`.

## 👥 Application areas

- **Passenger** — find a bus, select seats, complete checkout, and view the ticket.
- **Driver** — access trip and passenger management features.
- **Admin** — review fleet users, filter the table, update statuses, and add users.

The home page provides links to the available modules. Development preview links may be used to explore Driver and Admin screens; production access remains role-protected.

## 🗺️ Sample tracking

The live map uses a local sample route between Connaught Place and North Campus, Delhi. Its marker advances through landmarks and updates the telemetry display without requiring a GPS device or backend tracking service.

Shared route and fleet sample data live in [`mockData.ts`](./college-bus-project/bus-booking-system/src/data/mockData.ts).

## 💳 Checkout behavior

The checkout presents UPI, card, net banking, and wallet options in a familiar payment layout. This project confirms a local ticket only:

- The UPI QR is decorative and cannot be used to make a payment.
- No payment provider is contacted.
- No money is collected.

## 🧪 Useful commands

Run these from `college-bus-project/bus-booking-system`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |

## 📁 Project structure

```text
college-bus-project/
└── bus-booking-system/
    ├── prisma/              # SQLite schema
    └── src/
        ├── app/              # Pages, API routes, and role-based areas
        ├── components/       # Shared interface and map components
        ├── data/             # Shared sample route and fleet data
        └── lib/              # Authentication, database, and trip helpers
```

---

<div align="center">

Built for smoother journeys. 🚌

</div>
