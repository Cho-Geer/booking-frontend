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

- `.env.development.example`
- `.env.production.example`

Create `.env.development` in the project root with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_INSTANCE_NAME=dev
```

This keeps local frontend requests aligned with the backend contract at `http://localhost:3001/v1`.

**Environment Variable Standardization**

The frontend and backend use standardized environment variables for consistency:

| Variable | Purpose | Default Value |
|----------|---------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time updates | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | Instance identifier for multi-tenant setups | `dev` |

**CI/CD Integration**
The frontend CI workflow (`frontend-ci.yml`) uses the same environment variable values as the backend CI, ensuring consistent testing across repositories. The E2E tests verify the full integration flow between frontend and backend services.

## Frontend Development Environment Configuration

### Configuration Files

The frontend now uses template-based configuration for local development:

1. **Template File**: `.env.development.example`
   - Contains all frontend environment variables with detailed comments
   - Safe to commit to version control
   - Includes API endpoint guidance for different environments (local, Docker, production)

2. **Personal Configuration**: `.env.development`
   - Created by copying from the template
   - Contains your actual development values
   - **Never commit this file** (it's in `.gitignore`)

3. **Initialization Script**: `scripts/init-local-env.sh`
   - Automates the configuration setup process
   - Provides interactive guidance and environment selection
   - Supports backup of existing configurations

### Quick Setup

```bash
# 1. Run the initialization script
./scripts/init-local-env.sh

# 2. The script will create .env.development from the template
#    You can adjust API endpoints based on your development environment

# 3. Start development server
npm run dev
```

### Environment-Specific Configuration

The frontend configuration supports different development environments:

| Environment | NEXT_PUBLIC_API_URL | NEXT_PUBLIC_WS_URL | Description |
|-------------|---------------------|-------------------|-------------|
| Local Development | `http://localhost:3001/v1` | `ws://localhost:3001/ws` | Backend and frontend running locally |
| Docker Compose | `http://booking-backend:3001/v1` | `ws://booking-backend:3001/ws` | Both services in Docker containers |
| Production | `https://api.yourdomain.com/v1` | `wss://api.yourdomain.com/ws` | Live production environment |

### Configuration Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for real-time updates | `ws://localhost:3001/ws` |
| `NEXT_PUBLIC_INSTANCE_NAME` | Instance identifier | `dev` |

### Security Notes

- Frontend environment variables are exposed in the browser
- **Never** put sensitive information (API keys, passwords) in frontend configuration
- All sensitive operations should be performed through backend APIs
- Use HTTPS/WSS in production environments

### Troubleshooting

- **Missing configuration**: Run `./scripts/init-local-env.sh` to create it
- **Permission denied**: Make the script executable: `chmod +x scripts/init-local-env.sh`
- **Template not found**: Ensure `.env.development.example` exists in project root
- **API connection issues**: Verify backend is running and accessible

## Local Development

**Development with Rewrite Configuration (Recommended)**

For local development, the frontend is configured to use Next.js rewrite rules that proxy API requests to the backend. This approach:

1. **Eliminates CORS issues** - All requests go through the same origin (`localhost:3000`)
2. **Simplifies environment configuration** - No need to configure CORS on the backend
3. **Matches production routing** - Similar to how a reverse proxy would work in production

The rewrite configuration in `next.config.ts` automatically routes `/v1/*` requests to `http://localhost:3001/v1/*`. This means you can use relative URLs (`/v1/health`) in your frontend code without worrying about cross-origin requests.

**Alternative: Direct API calls**
If you need to make direct API calls (e.g., testing with curl or Postman), you can access the backend directly at `http://localhost:3001/v1/*`. However, for normal development, the rewrite approach is recommended.

**Note on Multi-Instance Scripts**: The repository contains historical multi-instance deployment scripts (`start-frontend-instances.sh`) that were used for previous deployment strategies. These scripts are maintained for historical reference but are not part of the primary development or deployment workflow. New development should use the single-instance approach with rewrite configuration.

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

## Cross-Repository E2E Testing

The frontend CI includes a cross-repository E2E testing workflow that:

1. **Checks out both repositories** - Frontend and backend are cloned in the same CI runner
2. **Sets up standardized infrastructure** - Uses PostgreSQL 16 and Redis 7-alpine (same versions as backend CI)
3. **Executes full integration tests** - Tests the three main user flows:
   - User login with verification code
   - Querying available time slots for future dates
   - Creating bookings from the booking page

**E2E Test Flow:**
1. Backend services start with database migrations and seeding
2. Frontend builds and starts
3. Health checks verify both services are ready (`/v1/health` endpoint)
4. Playwright tests execute user scenarios

This ensures that changes in either repository don't break the integrated booking flow.

## Related Backend

This frontend is designed to work with the backend in the sibling `booking-backend` project.
