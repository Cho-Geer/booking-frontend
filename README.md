# CRM Booking Platform Frontend

Next.js frontend for the CRM booking platform.

This application provides the user and admin interfaces for login, registration, booking management, service browsing, and account state handling. It integrates with the NestJS backend over `/v1` APIs and uses Redux Toolkit for client state management.

Detailed endpoint contract: [docs/api-contract.md](./docs/api-contract.md)

## Tech Stack

- Next.js 15 using the Pages Router
- React 19
- TypeScript
- Redux Toolkit
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Framer Motion
- Jest
- React Testing Library

## Current App Structure

Main folders in `src`:

- `pages/` for route entry points
- `components/` for UI composition
- `services/` for API clients
- `store/` for Redux slices and store setup
- `contexts/` for UI and booking related context
- `hooks/` for shared client hooks
- `types/` for shared TypeScript models
- `utils/` for helper functions

## Implemented Routes

The current page files define these routes:

- `/`
- `/login`
- `/register`
- `/bookings`
- `/admin/bookings`
- `/account-disabled`

Notes:

- `/` renders the login page for unauthenticated users and redirects authenticated users into the app.
- `/bookings` is protected.
- `/admin/bookings` is the current admin entry page.
- Middleware also contains logic for `/my-bookings`, but there is no page file for that route in the current codebase.

## Runtime Features

- Login and registration flows
- JWT and refresh-token based auth using HttpOnly cookies
- CSRF token forwarding on mutating requests
- Auth aware route protection
- Role based admin routing behavior
- Booking creation and update UI
- Service and slot fetching through API clients
- Admin booking management page
- Account disabled / role changed handling
- Global Redux store for app state
- UI notifications through app state and UI context

## API Integration

API requests are sent through [src/services/api.ts](./src/services/api.ts).

The backend API runs locally at:

```text
http://localhost:3001
```

Current default API base URL:

```text
http://localhost:3001/v1
```

`next.config.ts` also rewrites `/v1/:path*` to `http://localhost:3001/v1/:path*` during development, so local frontend work stays aligned with the same `/v1` contract used by the backend README.

### Main Contract For This Branch

The frontend should treat these backend endpoints as the main booking flow contract:

- `/v1/bookings/all`
- `/v1/time-slots/available-slots`
- `/v1/bookings/by-date` when date-based booking views need it

Important rules:

- The frontend uses `/bookings/all` as the shared endpoint for both regular users and admins.
- Filtering regular users down to their own bookings is the backend's responsibility.
- `/bookings/me` is not assumed in this branch and should not be used as a contract dependency.

### Example API Usage In Current Code

- `GET /v1/bookings/all`
  Main booking list endpoint used by the current booking API client.

- `GET /v1/bookings/by-date?date=YYYY-MM-DD`
  Used for date-specific booking lookups.

- `GET /v1/time-slots/available-slots?date=YYYY-MM-DD`
  Used for slot availability queries.

Frontend service modules currently include:

- `adminApi.ts`
- `bookingApi.ts`
- `notificationApi.ts`
- `serviceApi.ts`
- `slotTimeApi.ts`
- `systemApi.ts`
- `userApi.ts`

These files represent the frontend client layer. Some endpoints referenced there may depend on backend work that is not currently wired in the backend app, so treat them as the frontend contract rather than guaranteed live backend coverage.

## State Management

The app currently sets up these Redux slices in [src/store/index.ts](./src/store/index.ts):

- `user`
- `booking`
- `service`
- `slotTime`
- `notification`
- `admin`

The app is wrapped with Redux `Provider` and `UIProvider` in [src/pages/_app.tsx](./src/pages/_app.tsx).

## Forms and Validation

The codebase actively uses:

- `react-hook-form`
- `zod`

Examples include:

- `src/components/molecules/LoginForm.tsx`
- `src/components/molecules/RegisterForm.tsx`
- `src/components/molecules/BookingCreateModal.tsx`
- `src/components/molecules/BookingUpdateModal.tsx`

## Styling

The current implementation uses:

- Tailwind CSS utilities
- Custom components under `src/components`
- Framer Motion for some animated UI behavior

Although `antd` and `@tanstack/react-query` are present in dependencies, they are not part of the main documented runtime flow here because the current codebase does not clearly use them in the primary app wiring.

## Environment

Example env files are included:

- `.env.example`
- `.env.production.example`

Create `.env.local` in the project root with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_INSTANCE_NAME=local
```

This keeps local frontend requests aligned with the backend contract at `http://localhost:3001/v1`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

The Next.js app runs locally at `http://localhost:3000` and talks to the backend API at `http://localhost:3001`.

Then open:

```text
http://localhost:3000
```

## Build and Start

Build:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Quality and Tests

Lint:

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```

Type check:

```bash
npm run check
```

Run tests:

```bash
npm run test
```

Run coverage:

```bash
npm run test:coverage
```

## Related Backend

This frontend is designed to work with the backend in the sibling `booking-backend` project.
