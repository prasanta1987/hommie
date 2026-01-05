# Project Blueprint: IoT Device Dashboard

## 1. Overview

This project is a web-based dashboard for monitoring and managing IoT devices. It connects to a Firebase Realtime Database to display a list of registered device boards, their current status, and the data feeds they are reporting. The application is built with Next.js and utilizes modern, server-centric features for a robust and interactive user experience.

## 2. Implemented Features & Design

This section documents the current state of the application, detailing the features and design patterns that have been implemented.

### 2.1. Core Architecture & Data Flow

- **Framework**: Next.js with the App Router.
- **Authentication**: User identity is managed by Firebase Authentication. Data is fetched on a per-user basis (`/users/{uid}`).
- **Database**: Firebase Realtime Database is used for storing all board and feed data.
- **Data Fetching**: The `useObjectVal` hook from `react-firebase-hooks/database` is used in the main `LandingPage` component to listen for real-time data updates.
- **Data Normalization**: The application correctly handles cases where the database returns either a single board object or a collection of board objects, ensuring a consistent rendering path.

### 2.2. UI Components & Layout

- **`LandingPage.tsx` (Main View)**
  - Acts as the main container and state manager for the application.
  - Fetches all board data for the logged-in user.
  - Manages which board dropdown is currently open, implementing the "lifting state up" pattern to ensure only one dropdown is visible at a time.
  - Renders boards in a horizontal, wrapping flex container (`d-flex flex-row flex-wrap`).

- **`Boards.tsx` (Presentational Component)**
  - A reusable component responsible for displaying a single board.
  - Receives all its data and state (`boardData`, `isOpen`, `onToggle`) as props from `LandingPage.tsx`.
  - **Layout**: Designed to be compact and efficient for a single-line display.
  - **Dropdown Menu**: The dropdown for viewing device feeds is implemented as a floating **overlay**. It appears directly below its parent board without disrupting the layout of other boards. This is achieved with `position: relative` on the parent and `position: absolute` on the dropdown content.

### 2.3. Data Mutation & Interactivity

- **Editing Board Names**: Users can edit the name of a board directly from the UI.
- **Edit Modal**: Clicking the "edit" icon opens a modal pre-filled with the board's current name.

- **Server-Side Updates via Server Actions**:
  - A **Next.js Server Action** (`updateBoardName` in `src/app/actions.ts`) is used to handle the database update.
  - This approach is secure, as the database logic runs exclusively on the server.
  - The form submission does not require creating a separate API route.

- **Form State Management (`useActionState`)**:
  - The edit form's entire lifecycle is managed by the `useActionState` hook.
  - It provides seamless handling of:
    - **Pending States**: The "Save Changes" button is disabled and shows a spinner while the action is executing.
    - **Validation**: The Server Action uses `zod` to validate the new name. If validation fails (e.g., name is too short), the error is displayed directly below the form field.
    - **Success Feedback**: Upon a successful update, the modal automatically closes, and the UI is instantly updated with the new name thanks to `revalidatePath('/')` in the Server Action.
