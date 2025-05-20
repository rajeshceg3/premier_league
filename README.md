# Premier League Player Loan Management

## Overview

This application provides a comprehensive platform for managing football player loans within the Premier League. It allows club managers, player agents, and league administrators to streamline the process of initiating, tracking, and finalizing loan agreements. The system is built as a Node.js API with endpoints for managing users, players, teams, agents, and loan transactions.

## Features

*   User Authentication (Registration and Login)
*   Player Profile Management
*   Team Information Management
*   Agent Profile Management
*   Detailed Loan Agreement Management (initiation, negotiation, approval)
*   Tracking of Loan Statuses and History
*   Management of Player Returns Post-Loan

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended - check current `.nvmrc` or project `package.json` engines section, if available. Otherwise, a recent LTS like 18.x or 20.x is a good start)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [Git](https://git-scm.com/)
*   (Optional, but recommended) [MongoDB](https://www.mongodb.com/try/download/community) installed locally or access to a MongoDB Atlas instance, as this project likely uses MongoDB given the Mongoose-like models.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd premier-league-app # Or your project's root directory name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configuration:**
    The application uses a configuration system that loads settings from `config/default.json`. You can override these settings for different environments (e.g., development, production) using environment variables or a `config/custom-environment-variables.json` file.

    *   **Create `config/custom-environment-variables.json` (if it doesn't exist) or set environment variables for your setup.**
    *   A key configuration you'll likely need to set is the MongoDB connection string and JWT private key. For example, in `config/custom-environment-variables.json`:
        ```json
        {
          "db": "YOUR_MONGODB_CONNECTION_STRING",
          "jwtPrivateKey": "YOUR_SECURE_JWT_PRIVATE_KEY"
        }
        ```
    *   Alternatively, set them as environment variables:
        ```bash
        export db="YOUR_MONGODB_CONNECTION_STRING"
        export jwtPrivateKey="YOUR_SECURE_JWT_PRIVATE_KEY"
        ```
    *   Refer to `config/default.json` to see what configuration options are available and need to be set. **Important:** Do not commit sensitive keys directly into `config/default.json`.

### Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    (This assumes a `start` script is defined in `package.json`, which usually runs `node index.js` or similar). If not, you might run `node index.js` directly.

    The application should now be running on the port specified in your configuration (e.g., `http://localhost:3000`).

### Running Tests

To run the automated tests:
```bash
npm test
```
(This assumes a `test` script is defined in `package.json`).

## API Endpoints

The application provides the following RESTful API endpoints. For detailed request/response formats, please refer to the [Product Requirements Document](PRODUCT_REQUIREMENTS.md) or the route handler files in the `routes/` directory.

*   **Authentication (`/api/auth`):**
    *   `POST /register` (or similar): User registration.
    *   `POST /login` (or similar): User login.
*   **Players (`/api/players`):**
    *   `GET /`: List all players.
    *   `GET /:id`: Get a specific player.
    *   `POST /`: Create a new player (Requires authentication/authorization).
    *   `PUT /:id`: Update a player (Requires authentication/authorization).
    *   `DELETE /:id`: Delete a player (Requires authentication/authorization).
*   **Teams (`/api/teams`):**
    *   `GET /`: List all teams.
    *   `GET /:id`: Get a specific team.
    *   `POST /`: Create a new team (Requires authentication/authorization).
    *   `PUT /:id`: Update a team (Requires authentication/authorization).
    *   `DELETE /:id`: Delete a team (Requires authentication/authorization).
*   **Agents (`/api/agents`):**
    *   `GET /`: List all agents.
    *   `GET /:id`: Get a specific agent.
    *   `POST /`: Create a new agent (Requires authentication/authorization).
    *   `PUT /:id`: Update an agent (Requires authentication/authorization).
    *   `DELETE /:id`: Delete an agent (Requires authentication/authorization).
*   **Loans (`/api/loans`):**
    *   `GET /`: List all loans (Access may vary by user role).
    *   `GET /:id`: Get a specific loan.
    *   `POST /`: Create a new loan (Requires authentication/authorization).
    *   `PUT /:id`: Update a loan (Requires authentication/authorization).
    *   `DELETE /:id`: Delete a loan (Requires authentication/authorization).
*   **Returns (`/api/returns`):**
    *   (Endpoints and methods to be confirmed by checking `routes/returns.js` - e.g., `POST /:loanId/return`).

*(The API endpoint paths `/api/auth`, `/api/players` etc. are common conventions. The exact base path like `/api` should be confirmed from `index.js` or your main app setup file where routes are mounted)*

## CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration. The workflow is defined in `.github/workflows/npm-gulp.yml` (the filename might be updated or a new one created, e.g., `ci.yml`).

*   **Triggers:** The CI pipeline automatically runs on every `push` and `pull_request` to the `main` branch.
*   **Checks Performed:**
    1.  **Code Checkout:** Fetches the latest code from the repository.
    2.  **Node.js Setup:** Sets up the specified Node.js versions (e.g., 18.x, 20.x) for testing compatibility.
    3.  **Dependency Installation:** Efficiently installs project dependencies using `npm ci`.
    4.  **Linting:** The code is checked for style consistency and potential errors using ESLint (`npm run lint`). This helps maintain code quality.
    5.  **Testing:** Automated tests are executed using `npm test` to ensure that new changes don't break existing functionality.

This automated pipeline helps ensure that code merged into the `main` branch is of high quality, passes all defined checks, and the application remains stable.

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request with your changes. Ensure your code adheres to the project's coding standards (once ESLint is set up) and all tests pass.
