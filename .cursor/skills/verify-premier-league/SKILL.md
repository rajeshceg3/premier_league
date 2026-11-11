# Verify premier_league
Premier League Player Loan Management System (express backend + CRA React client).
## Launch
Backend: npm install && npm start. Client: cd client && npm install && npm start.
## Doctor
`python3 .cursor/skills/verify-premier-league/verify.py`
## Drive
Runs the backend jest suites, builds the React client, and renders the built client in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-premier-league/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; e2e suites (playwright/karma) not exercised here.
