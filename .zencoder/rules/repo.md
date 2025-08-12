---
description: Repository Information Overview
alwaysApply: true
---

# Smart Wall Builder Information

## Summary
Smart Wall Builder is a 3D wall configuration web application that allows users to design and customize wall layouts. It features a React-based frontend with Three.js for 3D rendering and an Express backend for configuration management.

## Structure
- **client/**: React frontend application with 3D visualization components
- **server/**: Express.js backend API for wall configuration management
- **shared/**: Common code shared between client and server
- **netlify/**: Serverless function configuration for Netlify deployment
- **public/**: Static assets including icons and images

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: ES2020 target with React 18
**Build System**: Vite 6.2.2
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.3.1 with React DOM and React Router
- Three.js 0.176.0 with @react-three/fiber and @react-three/drei
- Express 4.18.2 for backend API
- TanStack React Query 5.56.2 for data fetching
- Tailwind CSS 3.4.11 for styling
- Radix UI components for UI elements
- Zod 3.23.8 for schema validation

**Development Dependencies**:
- TypeScript 5.5.3
- Vite 6.2.2 for bundling
- Vitest 3.1.4 for testing
- SWC for fast compilation

## Build & Installation
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run tests
npm test
```

## Deployment
**Netlify**:
- Build command: `npm run build:client`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`
- API routes are proxied through serverless functions

**Vercel**:
- Static build from `dist/spa`
- Client-side routing configured with rewrites

## Testing
**Framework**: Vitest
**Test Location**: Files with `.spec.ts` extension
**Configuration**: Default Vitest configuration
**Run Command**:
```bash
npm test
```