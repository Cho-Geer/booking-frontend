# CRM Booking Platform Frontend

Frontend application for the CRM-style booking platform.

Built with **Next.js**, **React**, and **TypeScript**, this project provides a modern dashboard interface for managing bookings and users.

---

# Overview

This project is the frontend client for the CRM Booking Platform.

It communicates with the backend API built with **NestJS** and provides a user-friendly interface for managing bookings.

Main features include:

- User authentication
- Booking management
- Dashboard interface
- Form validation
- API integration
- Responsive UI

---

# Features

- JWT based authentication
- Booking management dashboard
- Form validation with React Hook Form and Zod
- API integration with NestJS backend
- State management using Redux Toolkit
- Server data fetching using React Query
- Responsive UI built with Ant Design

# Tech Stack

Framework

- Next.js
- React
- TypeScript

State Management

- Redux Toolkit
- React Query (TanStack Query)

UI

- Ant Design

Form Handling

- React Hook Form
- Zod validation

Testing

- Jest
- React Testing Library

---

# System Architecture

```
Browser
   │
   ▼
Next.js Frontend
   │
   ▼
REST API (NestJS Backend)
   │
   ▼
PostgreSQL Database
   │
   ▼
Redis Cache
```

The frontend communicates with the backend through RESTful APIs.

---

# Project Structure

```
src
├── app              # Next.js app router pages
├── components       # Reusable UI components
├── features         # Redux slices and feature modules
├── hooks            # Custom React hooks
├── services         # API service layer
├── utils            # Utility functions
└── styles           # Global styles
```

The project follows a modular structure to improve maintainability and scalability.

---

# Core Features

## Authentication

- Login / Logout
- JWT authentication
- Protected routes

---

## Booking Management

Users can:

- Create bookings
- Update bookings
- Cancel bookings
- View booking history

---

## Dashboard

Provides overview of:

- Upcoming bookings
- Booking statistics
- User activity

---

# API Integration

The frontend communicates with backend APIs.

Example API calls:

```
POST /auth/login
GET /bookings
POST /bookings
PUT /bookings/:id
```

---

# Running the Project

Install dependencies

```
npm install
```

Start development server

```
npm run dev
```

Build production version

```
npm run build
```

---

# Testing

Run tests

```
npm run test
```

Testing tools:

- Jest
- React Testing Library

---

# Future Improvements

Possible enhancements:

- Server-side caching
- Role-based UI
- Dark mode
- Advanced analytics dashboard

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
