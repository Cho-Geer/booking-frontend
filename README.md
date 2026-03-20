# CRM Booking Platform Frontend

Frontend application for the CRM-style booking platform.

Built with **Next.js**, **React**, and **TypeScript**, this project provides a modern dashboard interface for managing bookings and users.

---

# Overview

This project is the frontend client for the CRM Booking Platform.

It communicates with the backend API built with **NestJS** and provides a user-friendly interface for managing bookings.

Main features include:

- User authentication (SMS verification code login)
- Booking management (create, update, cancel, view)
- Admin dashboard for managing users, services, and bookings
- Time slot management
- Email/SMS notifications
- Form validation
- API integration
- Responsive UI with dark/light theme support

---

# Features

- JWT + Refresh Token based authentication (stored in HttpOnly Cookies)
- CSRF token protection
- Booking management dashboard
- Form validation with React Hook Form and Zod
- API integration with NestJS backend
- State management using Redux Toolkit
- Server data fetching using React Query
- Responsive UI built with Ant Design
- Dark/Light theme support
- Role-based access control (USER/ADMIN)

# Tech Stack

Framework

- Next.js 15 (Pages Router)
- React 19
- TypeScript

State Management

- Redux Toolkit
- React Query (TanStack Query)

UI

- Ant Design 6
- Tailwind CSS
- Framer Motion (animations)

Form Handling

- React Hook Form
- Zod validation

Authentication

- JWT + Refresh Token (HttpOnly Cookies)
- CSRF Token protection

Testing

- Jest
- React Testing Library

---

# System Architecture

```
Browser
   │
   ▼
Next.js Frontend (Pages Router)
   │
   ▼
REST API (NestJS Backend) - /v1 prefix
   │
   ▼
PostgreSQL Database
   │
   ▼
Redis Cache
```

The frontend communicates with the backend through RESTful APIs with automatic token refresh.

---

# Project Structure

```
src
├── app/              # Next.js app router (reserved for future migration)
├── pages/            # Next.js pages router (current routing)
│   ├── index.tsx     # Home page (redirects based on auth status)
│   ├── login.tsx     # Login page
│   ├── register.tsx  # Register page
│   ├── bookings.tsx  # Booking page (main booking interface)
│   ├── my-bookings.tsx # My bookings page
│   └── admin/        # Admin pages
│       └── bookings.tsx # Admin booking management
├── components/       # Reusable UI components
│   ├── atoms/        # Base components (Button, Input, Modal, etc.)
│   ├── molecules/    # Composite components (Forms, DateSelector, etc.)
│   ├── organisms/    # Feature modules (BookingPage, AdminBookingList, etc.)
│   ├── pages/        # Page-level components
│   ├── templates/    # Layout templates
│   ├── hoc/          # Higher-order components (withAuth, withAdmin)
│   └── wrappers/     # Wrapper components
├── contexts/         # React contexts (UIContext, BookingContext)
├── hooks/            # Custom React hooks
├── services/         # API service layer
│   ├── api.ts        # Axios instance with interceptors
│   ├── bookingApi.ts # Booking API
│   ├── serviceApi.ts # Service API
│   ├── userApi.ts    # User API
│   └── notificationApi.ts # Notification API
├── store/            # Redux store and slices
│   ├── bookingSlice.ts # Booking state management
│   ├── userSlice.ts   # User state management
│   ├── serviceSlice.ts # Service state management
│   └── index.ts       # Store configuration
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── styles/           # Global styles
```

The project follows an atomic design structure to improve maintainability and scalability.

---

# Core Features

## Authentication

- Login / Logout (SMS verification code)
- JWT + Refresh Token authentication (HttpOnly Cookies)
- CSRF token protection on mutations
- Automatic token refresh on 401
- Protected routes (withAuth HOC)
- Role-based access control (USER/ADMIN)
- Account status handling (active/inactive/blocked)

---

## Booking Management

Users can:

- Create bookings (select date, time slot, service)
- Update bookings (change date, time, service, customer info)
- Cancel bookings
- View booking history
- View available time slots
- Automatic conflict detection (backend validation)

Booking statuses: PENDING → CONFIRMED → COMPLETED or CANCELLED

---

## Time Slot Management

- View available time slots by date
- Time slot availability status
- Service duration handling
- Automatic status update when booking/cancel

---

## Admin Dashboard

Provides admin users with:

- Manage all bookings across users
- User management (enable/disable accounts)
- Service management (create, update, toggle active status)
- Booking statistics
- Notification management (broadcast messages)

---

# Page Routes

| Route | Description |
|-------|-------------|
| `/` | Home page (redirects to login or booking page based on auth) |
| `/login` | Login page with SMS verification |
| `/register` | User registration page |
| `/bookings` | Main booking interface (requires auth) |
| `/my-bookings` | User's booking list (requires auth) |
| `/admin/bookings` | Admin booking management (requires ADMIN role) |

---

# API Integration

The frontend communicates with backend APIs at `/v1` prefix.

Example API calls:

```
POST /v1/auth/send-verification-code
POST /v1/auth/verify-code
POST /v1/auth/refresh
GET  /v1/bookings
GET  /v1/bookings/available-slots?date=YYYY-MM-DD
POST /v1/bookings
PATCH /v1/bookings/:id
PATCH /v1/bookings/:id/cancel
GET  /v1/services
GET  /v1/notifications
```

API Features:

- Axios instance with automatic token refresh
- CSRF token injection on mutations
- HttpOnly cookies for token storage
- Role change detection (ADMIN → USER or USER → ADMIN)
- Account status handling (active/inactive/blocked)

---

# Running the Project

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at http://localhost:3000

## Installation

Install dependencies

```
npm install
```

## Development

Start development server

```
npm run dev
```

Open http://localhost:3000 in browser

## Production

Build production version

```
npm run build
```

Start production server

```
npm start
```

## Code Quality

Run linter

```
npm run lint
```

Fix linting errors

```
npm run lint:fix
```

Run type check

```
npm run check
```

---

# Testing

Run tests

```
npm run test
```

Run tests in watch mode

```
npm run test:watch
```

Run tests with coverage

```
npm run test:coverage
```

Testing tools:

- Jest
- React Testing Library

---

# Environment Variables

Create `.env.local` in project root:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

---

# Future Improvements

Possible enhancements:

- Migration to Next.js App Router
- Server-side rendering optimization
- Server-side caching
- Advanced analytics dashboard
- Mobile app (React Native)

---

# Related Project

Backend repository:

https://github.com/Cho-Geer/booking-backend

---

# Author

Zixi Tao  
Senior Software Engineer  
14+ years experience building enterprise systems

GitHub  
https://github.com/Cho-Geer
