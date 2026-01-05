# Project Blueprint

## Overview

This document outlines the architecture, features, and design of the Next.js application. It serves as a single source of truth for the project's current state.

## Implemented Features

### Firebase Integration

- **Client-Side SDK:** The project is configured to use the Firebase client-side SDK for web applications. Configuration is managed through environment variables in `.env.local` and initialized in `src/app/firebase/config.ts`.
- **Admin SDK:** The Firebase Admin SDK is integrated for server-side operations. It's configured via environment variables in `.env.local` and initialized in `src/app/firebase/adminConfig.ts`.

## Current Plan

- **Task:** Configure Firebase client and admin SDKs.
- **Status:** Complete.
  - Added necessary Firebase configuration to `.idx/mcp.json`.
  - Created `.env.local` with placeholder credentials for both client and admin SDKs.
  - Installed the `firebase-admin` package.
  - Verified the existence and correctness of `src/app/firebase/config.ts` and `src/app/firebase/adminConfig.ts`.
