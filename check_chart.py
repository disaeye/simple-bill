from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('http://localhost:15300')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='d:/workspace/git/simple-bill/trend_chart.png', full_page=True)
    browser.close()
    print("Screenshot saved to trend_chart.png")
