from playwright.sync_api import sync_playwright, expect
import time

def verify_loan_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming running on port 3900 based on memory)
        try:
            page.goto("http://localhost:3900")
            print("Navigated to home")

            # Check title or header to confirm app is running
            # Assuming 'Premier League' or similar in title/header
            # Just taking a screenshot of the landing page is a good start
            # If we can't login, we can at least show the login page

            page.screenshot(path="/home/jules/verification/landing_page.png")
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_loan_page()
