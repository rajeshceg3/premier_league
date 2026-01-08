# Premier League Player Loan Management System

## Overview

This application is a production-grade platform for managing football player loans within the Premier League. It serves as a mission-critical system for club managers, agents, and administrators to execute and track loan agreements with precision and reliability. The system features a robust Node.js/Express backend and a responsive React frontend.

## Features

-   **Secure Authentication:** JWT-based authentication with bcrypt password hashing.
-   **Role-Based Management:** Distinct capabilities for Admins, Club Managers, and Agents.
-   **Comprehensive Entity Management:** Full CRUD operations for Players, Teams, Agents, and Loans.
-   **Transaction Safety:** Implements Mongoose sessions (transactions) to ensure data integrity during loan processing.
-   **User Watchlist:** Personalized watchlist for tracking players.
-   **Real-time Feedback:** Integrated toast notifications for enhanced user experience.
-   **Production Ready:** Equipped with security headers (`helmet`), compression, logging (`winston`), and centralized error handling.

## Technology Stack

-   **Backend:** Node.js, Express, MongoDB (Mongoose), Winston, Joi.
-   **Frontend:** React, React Router v6, React Toastify, Axios.
-   **Testing:** Jest, Supertest, React Testing Library, MongoDB Memory Server.

## Getting Started

### Prerequisites

-   Node.js (v14+ recommended)
-   MongoDB (Local instance or Atlas connection string)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd premier_league
    ```

2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

### Configuration

The application uses `config/default.json` for configuration.

**Environment Variables:**
You must set the `jwtPrivateKey` environment variable for security in production.
```bash
export jwtPrivateKey="YOUR_SECURE_PRIVATE_KEY"
```

To run in development with default settings, ensure a MongoDB instance is running locally on port 27017 (database: `premier_league_dev`).

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    npm start
    ```
    The server will start on port 3900 (default).

2.  **Start the Frontend Client:**
    Open a new terminal:
    ```bash
    cd client
    npm start
    ```
    The client will run on `http://localhost:3000`.

## Testing

The project employs a rigorous testing strategy covering both backend integration and frontend components.

### Backend Tests
Runs integration tests using `mongodb-memory-server` (no external DB required).
```bash
npm test
```

### Frontend Tests
Runs component and unit tests for the React application.
```bash
cd client
npm test -- --watchAll=false
```

## Security & Production Readiness

-   **Security:** `helmet` is used to set secure HTTP headers. `cors` is configured.
-   **Error Handling:** Centralized error handling middleware catches and logs exceptions.
-   **Logging:** `winston` logs errors to `logfile.log` and handles uncaught exceptions.
-   **Transactions:** Critical operations use MongoDB transactions to ensure atomicity.

## API Endpoints

-   **Auth:** `/api/auth`
-   **Users:** `/api/users`
-   **Players:** `/api/players`
-   **Teams:** `/api/teams`
-   **Agents:** `/api/agents`
-   **Loans:** `/api/loans`
-   **Returns:** `/api/returns`

## CI/CD

The repository is configured for CI/CD workflows to ensure code quality and automated testing on every push.
