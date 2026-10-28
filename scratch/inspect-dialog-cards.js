const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('developers.facebook.com')) || context.pages()[0];

  const info = await page.evaluate(async () => {
    // Check if dialog is open
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { hasDialog: false, bodySnippet: document.body.innerText.slice(0, 500) };

    // Find all cards or scrollable list items inside dialog
    const allDivs = Array.from(dialog.querySelectorAll('*'));
    
    // Let's click "Content management" if present to see if it filters
    const contentTab = allDivs.find(el => el.innerText && el.innerText.trim().startsWith('Content management'));
    
    // Find all checkboxes or headings inside the dialog
    const items = [];
    const headings = Array.from(dialog.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"], strong, b'));
    
    // Also find all input[type="checkbox"]
    const checkboxes = Array.from(dialog.querySelectorAll('input[type="checkbox"]')).map(cb => ({
      name: cb.name,
      id: cb.id,
      checked: cb.checked,
      ariaLabel: cb.getAttribute('aria-label'),
      parentText: cb.parentElement ? cb.parentElement.innerText.slice(0, 100) : ''
    }));

    return {
      hasDialog: true,
      dialogText: dialog.innerText,
      checkboxes
    };
  });

  console.log('Dialog Info:');
  console.log('hasDialog:', info.hasDialog);
  console.log('Checkboxes:', JSON.stringify(info.checkboxes, null, 2));
  console.log('DialogText:\n', info.dialogText);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
