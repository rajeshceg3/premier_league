import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()

    # Add auth token to local storage to bypass login
    # This is a dummy JWT (Header.Payload.Signature)
    dummy_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ1c2VyMTIzIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTYxNjIzOTAyMn0.signature"

    context.add_init_script(f"""
        localStorage.setItem('token', '{dummy_token}');
    """)

    page = context.new_page()

    # Mock API responses
    # Loans
    page.route("**/api/loans", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[{"_id":"l1","player":"p1","loaningTeam":"t1","borrowingTeam":"t2","agent":"a1","startDate":"2023-01-01T00:00:00.000Z","endDate":"2023-06-01T00:00:00.000Z","status":"Active"}]'
    ))

    # Related Data
    page.route("**/api/players", lambda route: route.fulfill(
        status=200, content_type="application/json", body='[{"_id":"p1","name":"Harry Kane"}]'
    ))
    page.route("**/api/teams", lambda route: route.fulfill(
        status=200, content_type="application/json", body='[{"_id":"t1","name":"Tottenham"},{"_id":"t2","name":"Bayern Munich"}]'
    ))
    page.route("**/api/agents", lambda route: route.fulfill(
        status=200, content_type="application/json", body='[{"_id":"a1","name":"Charlie Kane"}]'
    ))

    try:
        print("Navigating to loans page...")
        page.goto("http://localhost:3000/loans")

        # Wait for the table to appear (verification that we are past login and data loaded)
        print("Waiting for table...")
        page.wait_for_selector("table", timeout=10000)

        # Verify content
        print("Verifying content...")
        content = page.content()
        if "Harry Kane" not in content:
            print("Error: 'Harry Kane' not found in page content.")
        if "Tottenham" not in content:
            print("Error: 'Tottenham' not found in page content.")

        # Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/loans_page.png")
        print("Screenshot saved.")

    except Exception as e:
        print(f"Verification failed: {e}")
        # Take a screenshot of the failure state
        page.screenshot(path="verification/failure.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
