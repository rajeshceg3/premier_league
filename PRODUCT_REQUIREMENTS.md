# Product Requirements Document: Premier League Player Loan Management

## 1. Introduction

This document outlines the product requirements for the Premier League Player Loan Management application. The system facilitates the management of football player loans between Premier League clubs, involving club managers, player agents, and league administrators.

## 2. Goals

*   To provide a centralized platform for managing player loan agreements.
*   To streamline the process of initiating, tracking, and finalizing loan deals.
*   To ensure data integrity and security for all user information and transaction details.
*   To offer clear visibility into player availability and loan statuses.

## 3. User Roles and Personas

*   **League Administrator:** Manages overall system settings, club accounts, and has oversight of all loan activities. Can resolve disputes or override transactions if necessary.
*   **Club Manager:** Represents a Premier League club. Can list players available for loan, search for players to loan, initiate loan requests, negotiate terms, and approve/reject loan offers.
*   **Player Agent:** Represents players. Can manage player profiles, express interest in loan opportunities on behalf of their players, and participate in negotiations.
*   **(Implicit) System User/Registered User:** Basic user who can register and login, forming the foundation for the roles above. The exact capabilities before being assigned a specific role (Admin, Manager, Agent) need further clarification.

## 4. Functional Requirements

### 4.1 User Management (Based on `routes/auth.js`, `models/user.js`)
*   FR1.1: Users shall be able to register for a new account with a unique email and password.
*   FR1.2: Registered users shall be able to log in using their credentials.
*   FR1.3: The system should provide a mechanism for password hashing and secure storage.
*   FR1.4: Authenticated users shall receive a token (e.g., JWT) for accessing protected routes.
*   FR1.5: (Assumption) Different user roles (Admin, Club Manager, Agent) will have different levels of access and capabilities.

### 4.2 Player Management (Based on `routes/players.js`, `models/player.js`)
*   FR2.1: Authorized users (e.g., Club Managers, Agents) shall be able to create and update player profiles. Player profiles should include details such as name, age, position, current club, contract details, and loan availability status.
*   FR2.2: Users shall be able to view a list of players.
*   FR2.3: Users shall be able to search and filter players based on various criteria (e.g., position, availability, club).
*   FR2.4: (Assumption) Only authorized users can modify or delete player records.

### 4.3 Team (Club) Management (Based on `routes/teams.js`, `models/team.js`)
*   FR3.1: League Administrators shall be able to create and manage club profiles (e.g., club name, contact information).
*   FR3.2: Club Managers shall be associated with their respective clubs.
*   FR3.3: Users shall be able to view a list of clubs in the league.
*   FR3.4: Users shall be able to view details of a specific club, including its roster (potentially linking to Player Management).

### 4.4 Agent Management (Based on `routes/agents.js`, `models/agent.js`)
*   FR4.1: League Administrators shall be able to approve and manage agent accounts.
*   FR4.2: Player Agents shall be able to register and manage their profiles.
*   FR4.3: Agents should be able to link their profiles with the players they represent.
*   FR4.4: Users shall be able to view a list of registered agents.

### 4.5 Loan Management (Based on `routes/loans.js`, `models/loan.js`)
*   FR5.1: Authorized users (Club Managers, Agents) shall be able to initiate a loan request for a player.
*   FR5.2: A loan request should include details such as player ID, loaning club, borrowing club, proposed loan start and end dates, loan fees, wage contribution split, and any specific clauses.
*   FR5.3: The system shall allow for negotiation of loan terms between involved parties.
*   FR5.4: Involved parties shall be able to approve or reject a loan agreement.
*   FR5.5: The system shall track the status of each loan (e.g., pending, active, completed, terminated).
*   FR5.6: Users shall be able to view current and historical loan deals relevant to their role/club.

### 4.6 Loan Returns Management (Based on `routes/returns.js`)
*   FR6.1: The system shall handle the process of a player returning to their parent club after a loan spell.
*   FR6.2: (Assumption) This might involve updating the player's status and potentially financial reconciliation. The exact functionality of "returns" needs to be clarified from the codebase.

## 5. API Endpoints Overview (Inferred from `routes/`)

*   **Authentication (`/api/auth`):**
    *   `POST /api/auth/register` (Assumed): User registration.
    *   `POST /api/auth/login` (Assumed): User login.
*   **Players (`/api/players`):**
    *   `GET /api/players`: List all players.
    *   `GET /api/players/:id`: Get a specific player.
    *   `POST /api/players`: Create a new player.
    *   `PUT /api/players/:id`: Update a player.
    *   `DELETE /api/players/:id`: Delete a player.
*   **Teams (`/api/teams`):**
    *   `GET /api/teams`: List all teams.
    *   `GET /api/teams/:id`: Get a specific team.
    *   `POST /api/teams`: Create a new team.
    *   `PUT /api/teams/:id`: Update a team.
    *   `DELETE /api/teams/:id`: Delete a team.
*   **Agents (`/api/agents`):**
    *   `GET /api/agents`: List all agents.
    *   `GET /api/agents/:id`: Get a specific agent.
    *   `POST /api/agents`: Create a new agent.
    *   `PUT /api/agents/:id`: Update an agent.
    *   `DELETE /api/agents/:id`: Delete an agent.
*   **Loans (`/api/loans`):**
    *   `GET /api/loans`: List all loans.
    *   `GET /api/loans/:id`: Get a specific loan.
    *   `POST /api/loans`: Create a new loan.
    *   `PUT /api/loans/:id`: Update a loan.
    *   `DELETE /api/loans/:id`: Delete a loan.
*   **Returns (`/api/returns`):**
    *   (Endpoint structure to be determined by inspecting `routes/returns.js`) - Likely involves POST or PUT to signify a return.

## 6. Non-Functional Requirements

*   **NFR1: Security:**
    *   All sensitive data, especially user credentials, must be encrypted (e.g., passwords hashed).
    *   API endpoints must be protected, requiring authentication for access where appropriate.
    *   Input validation should be implemented on all incoming data to prevent common vulnerabilities (e.g., XSS, SQL injection - though with an ORM like Mongoose, SQLi is less direct but validation is still key).
*   **NFR2: Scalability:** The application should be designed to handle a growing number of users and transactions. (Specific metrics TBD)
*   **NFR3: Usability:** The API should be well-documented and easy for client applications to integrate with.
*   **NFR4: Maintainability:** Code should be well-structured, commented, and follow consistent coding standards.

## 7. Future Considerations (Out of Scope for Initial MVP)

*   Real-time notifications for loan status changes.
*   Advanced reporting and analytics.
*   Integration with external football data providers.
*   Mobile application client.
