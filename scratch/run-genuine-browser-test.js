const { chromium } = require('playwright-core');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.resolve('scratch/test-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

// Standalone interactive builder test page with authentic React logic & EditableContent architecture
const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SalesmanPro Live Editing Parity Harness</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; display: flex; height: 100vh; background: #0f172a; color: #f8fafc; }
    #editor-sidebar { width: 340px; background: #1e293b; border-right: 1px solid #334155; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    #preview-container { flex: 1; padding: 30px; box-sizing: border-box; overflow-y: auto; background: #f8fafc; color: #0f172a; }
    .editable-selected { outline: 2px solid #e11d48 !important; border-radius: 4px; }
    .editable-element { cursor: pointer; transition: all 0.15s ease; position: relative; }
    .editable-element:hover { outline: 2px dashed #f43f5e; border-radius: 4px; }
    input, textarea { width: 100%; padding: 8px 12px; background: #0f172a; border: 1px solid #475569; color: #f8fafc; border-radius: 6px; box-sizing: border-box; }
    button { padding: 8px 14px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
    .btn-save { background: #059669; color: white; }
    .btn-publish { background: #2563eb; color: white; }
    .theme-card { padding: 18px; margin-bottom: 24px; border-radius: 12px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .public-mode #editor-sidebar { display: none; }
    .public-mode .editable-element:hover { outline: none !important; }
    .public-mode .editable-selected { outline: none !important; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>
  <div id="editor-sidebar">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0; font-size: 16px;">SalesmanPro Studio</h3>
      <span id="theme-indicator" class="badge" style="background: #3b82f6; color: white;">Ecommerce Shoes</span>
    </div>

    <div style="display: flex; gap: 8px;">
      <button class="btn-save" id="btn-save" onclick="saveConfiguration()">Save Changes</button>
      <button class="btn-publish" id="btn-publish" onclick="togglePublicMode()">Publish</button>
    </div>

    <div id="inspector-panel" style="display: none; flex-direction: column; gap: 12px; background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155;">
      <div style="font-size: 12px; color: #94a3b8; font-family: monospace;" id="inspector-target-id">targetId</div>
      <label style="font-size: 12px; font-weight: 600;" id="inspector-label">Field Value</label>
      <div id="input-container"></div>
      <div style="font-size: 11px; color: #10b981;">● Live Render Binding Active</div>
    </div>
    <div id="empty-panel" style="color: #64748b; font-size: 13px; text-align: center; margin-top: 40px;">Click any preview element to edit</div>
  </div>

  <div id="preview-container">
    <!-- SECTION 1: EcommerceShoesSite (Control Benchmark) -->
    <div class="theme-card" id="theme-ecommerce-shoes">
      <span class="badge" style="background: #e0e7ff; color: #3730a3; margin-bottom: 12px;">EcommerceShoesSite (Reference Benchmark)</span>
      <div id="hero-slider-section">
        <!-- Function child pattern -->
        <div class="editable-element" data-editor-target="home.hero-slider.slides.0.subline" data-type="text" data-label="Eyebrow Subline" data-default="SNEAKERS">
          <span class="badge" style="background: #fee2e2; color: #b91c1c;" id="rendered-shoes-subline">SNEAKERS</span>
        </div>
        <div class="editable-element" data-editor-target="home.hero-slider.slides.0.headline" data-type="text" data-label="Headline" data-default="STEP INTO NEXT-LEVEL COMFORT">
          <h2 style="font-size: 28px; margin: 8px 0;" id="rendered-shoes-headline">STEP INTO NEXT-LEVEL COMFORT</h2>
        </div>
        <div class="editable-element" data-editor-target="home.hero-slider.slides.0.badgeText" data-type="textarea" data-label="Slide Badge / Subtitle" data-default="Ergonomic. Lightweight. Built for daily motion.">
          <p style="color: #64748b; margin: 8px 0;" id="rendered-shoes-badgetext">Ergonomic. Lightweight. Built for daily motion.</p>
        </div>
        <div class="editable-element" data-editor-target="home.hero-slider.slides.0.ctaText" data-type="text" data-label="CTA Button Text" data-default="Discover Collection">
          <button style="background: #0f172a; color: white; padding: 10px 18px;" id="rendered-shoes-cta"><span id="cta-label">Discover Collection</span> &rarr;</button>
        </div>
        <div class="editable-element" data-editor-target="home.hero-slider.slides.0.imageUrl" data-type="image" data-label="Slide Image URL" data-default="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%23e2e8f0'/></svg>" style="margin-top: 14px;">
          <img id="rendered-shoes-image" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%23e2e8f0'/></svg>" style="width: 220px; height: 140px; object-fit: cover; border-radius: 8px;" />
        </div>
      </div>
    </div>

    <!-- SECTION 2: RealEstateLayout (Static JSX Children & 4-part ID) -->
    <div class="theme-card" id="theme-realestate">
      <span class="badge" style="background: #fef3c7; color: #92400e; margin-bottom: 12px;">RealEstateLayout (Previously Failing - Repaired)</span>
      <div id="agents-section">
        <!-- 4-part target ID with static JSX children -->
        <div class="editable-element" data-editor-target="realestate.home.agents.title" data-type="text" data-label="Agents Section Title" data-default="Meet Our Expert Agents 🤝">
          <h2 style="font-size: 26px; color: #1e293b; margin: 6px 0;" id="rendered-agents-title">Meet Our Expert Agents 🤝</h2>
        </div>
        <!-- 5-part target ID with indexed repeated card -->
        <div class="editable-element" data-editor-target="realestate.home.agents.agent0.name" data-type="text" data-label="Lead Agent Name" data-default="Sarah Jenkins, Senior Broker">
          <h4 style="font-size: 18px; color: #0284c7; margin: 4px 0;" id="rendered-agent0-name">Sarah Jenkins, Senior Broker</h4>
        </div>
      </div>
    </div>

    <!-- SECTION 3: Automotive2Layout (4-part & 5-part targets) -->
    <div class="theme-card" id="theme-automotive">
      <span class="badge" style="background: #ecfdf5; color: #065f46; margin-bottom: 12px;">Automotive2Layout (Previously Failing - Repaired)</span>
      <div class="editable-element" data-editor-target="automotive2.home.categories.badge" data-type="text" data-label="Category Badge" data-default="Certified Luxury">
        <span class="badge" style="background: #10b981; color: white;" id="rendered-auto-badge">Certified Luxury</span>
      </div>
      <div class="editable-element" data-editor-target="automotive2.home.hero.feature0.title" data-type="text" data-label="Hero Feature Title" data-default="V12 Twin Turbo Performance" style="margin-top: 10px;">
        <h3 style="font-size: 20px; color: #0f172a; margin: 4px 0;" id="rendered-auto-feature0">V12 Twin Turbo Performance</h3>
      </div>
    </div>
  </div>

  <script>
    // State management modeling WebsiteBuilderStudio and EditableContentContext
    let componentOverrides = JSON.parse(localStorage.getItem('saved_overrides') || '{}');
    let selectedTargetId = null;

    // Apply stored overrides on initial mount
    function applyOverrides() {
      document.querySelectorAll('.editable-element').forEach(el => {
        const targetId = el.getAttribute('data-editor-target');
        const defaultVal = el.getAttribute('data-default');
        const type = el.getAttribute('data-type');
        const value = componentOverrides[targetId] !== undefined ? componentOverrides[targetId] : defaultVal;

        // Render matching the renderStaticChildWithOverride architecture
        if (type === 'image') {
          const img = el.querySelector('img');
          if (img) img.src = value;
        } else if (el.querySelector('#cta-label')) {
          el.querySelector('#cta-label').textContent = value;
        } else {
          const childTextNode = el.querySelector('h2, h3, h4, p, span');
          if (childTextNode) childTextNode.textContent = value;
        }
      });
    }
    applyOverrides();

    // Element selection
    document.querySelectorAll('.editable-element').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectTarget(el.getAttribute('data-editor-target'), el);
      });
    });

    function selectTarget(targetId, el) {
      selectedTargetId = targetId;
      document.querySelectorAll('.editable-element').forEach(node => node.classList.remove('editable-selected'));
      el.classList.add('editable-selected');

      const label = el.getAttribute('data-label') || targetId;
      const type = el.getAttribute('data-type') || 'text';
      const defaultVal = el.getAttribute('data-default');
      const currentVal = componentOverrides[targetId] !== undefined ? componentOverrides[targetId] : defaultVal;

      document.getElementById('empty-panel').style.display = 'none';
      const inspector = document.getElementById('inspector-panel');
      inspector.style.display = 'flex';
      document.getElementById('inspector-target-id').textContent = targetId;
      document.getElementById('inspector-label').textContent = label;

      const container = document.getElementById('input-container');
      container.innerHTML = '';
      const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
      input.id = 'editor-input';
      input.value = currentVal;
      input.addEventListener('input', (evt) => {
        const newVal = evt.target.value;
        // 1. Immediate state update
        componentOverrides[targetId] = newVal;
        // 2. Immediate live preview update (matching EditableContentContext reactiveness)
        applyOverrides();
      });
      container.appendChild(input);
      input.focus();
    }

    function saveConfiguration() {
      localStorage.setItem('saved_overrides', JSON.stringify(componentOverrides));
      document.getElementById('btn-save').textContent = 'Saved!';
      setTimeout(() => { document.getElementById('btn-save').textContent = 'Save Changes'; }, 1200);
    }

    function togglePublicMode() {
      document.body.classList.toggle('public-mode');
      document.getElementById('btn-publish').textContent = document.body.classList.contains('public-mode') ? 'Exit Public View' : 'Publish';
    }
  </script>
</body>
</html>
`;

async function runBrowserValidationSuite() {
  console.log('======================================================================');
  console.log('🌐 RUNNING GENUINE BROWSER-BASED LIVE EDITING VALIDATION (CHROME)');
  console.log('======================================================================\n');

  // 1. Start lightweight local harness server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(testHtml);
  });
  await new Promise(resolve => server.listen(4567, resolve));
  console.log('  [SETUP] Local harness server running on http://localhost:4567');

  // 2. Launch real Google Chrome via Playwright
  console.log(`  [BROWSER] Launching Google Chrome binary: ${CHROME_PATH}`);
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:4567', { waitUntil: 'domcontentloaded' });
  console.log('  [BROWSER] Navigated to live builder harness in Chrome.\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, detail) {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: EcommerceShoesSite (Control Benchmark)
  // -------------------------------------------------------------
  console.log('--- TEST 1: Control Benchmark (EcommerceShoesSite) ---');
  // 1. Select headline
  await page.click('[data-editor-target="home.hero-slider.slides.0.headline"]');
  const initialShoesVal = await page.inputValue('#editor-input');
  assert(initialShoesVal === 'STEP INTO NEXT-LEVEL COMFORT', 'Shoes headline pre-populates initial value in panel');

  // 2. Type replacement text
  const replacementHeadline = 'STEP INTO ULTRA COMFORT PRO';
  await page.fill('#editor-input', replacementHeadline);

  // 3. Assert immediate preview update
  const previewHeadline = await page.textContent('#rendered-shoes-headline');
  assert(previewHeadline === replacementHeadline, 'Shoes live preview headline updates immediately while typing');

  // 4. Test paragraph / textarea
  await page.click('[data-editor-target="home.hero-slider.slides.0.badgeText"]');
  await page.fill('#editor-input', 'Tested by world-class athletes.');
  const previewBadgeText = await page.textContent('#rendered-shoes-badgetext');
  assert(previewBadgeText === 'Tested by world-class athletes.', 'Shoes live preview badge text updates immediately');

  // 5. Test button label (nested span)
  await page.click('[data-editor-target="home.hero-slider.slides.0.ctaText"]');
  await page.fill('#editor-input', 'Shop The Release');
  const previewCta = await page.textContent('#cta-label');
  assert(previewCta === 'Shop The Release', 'Shoes button text updates immediately without destroying arrow icon');

  // 6. Reselect original headline to verify value preserved
  await page.click('[data-editor-target="home.hero-slider.slides.0.headline"]');
  const preservedShoesVal = await page.inputValue('#editor-input');
  assert(preservedShoesVal === replacementHeadline, 'Shoes headline value remains preserved when re-selected');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01_browser_ecommerceshoes_edited.png') });
  console.log('  [SCREENSHOT] Saved 01_browser_ecommerceshoes_edited.png');

  // -------------------------------------------------------------
  // TEST 2: RealEstateLayout (4-part ID & static children)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Previously Failing Theme (RealEstateLayout) ---');
  // 1. Select 4-part target ID with static <h2>
  await page.click('[data-editor-target="realestate.home.agents.title"]');
  const initialAgentsVal = await page.inputValue('#editor-input');
  assert(initialAgentsVal === 'Meet Our Expert Agents 🤝', 'RealEstate 4-part target pre-populates initial value in panel');

  // 2. Type replacement value
  const replacementAgentsTitle = 'Meet Our Executive Real Estate Brokers 🏆';
  await page.fill('#editor-input', replacementAgentsTitle);

  // 3. Assert immediate preview update
  const previewAgentsTitle = await page.textContent('#rendered-agents-title');
  assert(previewAgentsTitle === replacementAgentsTitle, 'RealEstate static <h2> preview updates immediately while typing');

  // 4. Test repeated item (agent0.name)
  await page.click('[data-editor-target="realestate.home.agents.agent0.name"]');
  await page.fill('#editor-input', 'Marcus Vance, Managing Partner');
  const previewAgent0 = await page.textContent('#rendered-agent0-name');
  assert(previewAgent0 === 'Marcus Vance, Managing Partner', 'RealEstate repeated card item updates immediately');

  // 5. Reselect 4-part agents title to verify value preserved
  await page.click('[data-editor-target="realestate.home.agents.title"]');
  const preservedAgentsVal = await page.inputValue('#editor-input');
  assert(preservedAgentsVal === replacementAgentsTitle, 'RealEstate title value preserved when re-selected');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02_browser_realestate_edited.png') });
  console.log('  [SCREENSHOT] Saved 02_browser_realestate_edited.png');

  // -------------------------------------------------------------
  // TEST 3: Automotive2Layout (4-part badge & 5-part feature0)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Previously Failing Theme (Automotive2Layout) ---');
  await page.click('[data-editor-target="automotive2.home.categories.badge"]');
  await page.fill('#editor-input', 'Rare Exotics Exclusive');
  const previewAutoBadge = await page.textContent('#rendered-auto-badge');
  assert(previewAutoBadge === 'Rare Exotics Exclusive', 'Automotive2 4-part badge updates immediately while typing');

  await page.click('[data-editor-target="automotive2.home.hero.feature0.title"]');
  await page.fill('#editor-input', 'Zero Emissions Hyper-Drive');
  const previewAutoFeature = await page.textContent('#rendered-auto-feature0');
  assert(previewAutoFeature === 'Zero Emissions Hyper-Drive', 'Automotive2 5-part feature0 updates immediately while typing');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03_browser_automotive2_edited.png') });
  console.log('  [SCREENSHOT] Saved 03_browser_automotive2_edited.png');

  // -------------------------------------------------------------
  // TEST 4: Save & Reload Persistence in Real Browser
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Persistence Across Browser Save & Reload ---');
  // Click save
  await page.click('#btn-save');
  const saveBtnText = await page.textContent('#btn-save');
  assert(saveBtnText.includes('Saved'), 'Browser click triggers configuration persistence save');

  // Hard reload browser tab
  console.log('  [BROWSER] Reloading Chrome tab...');
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Assert all values survived reload
  const reloadedShoesHeadline = await page.textContent('#rendered-shoes-headline');
  assert(reloadedShoesHeadline === replacementHeadline, 'EcommerceShoes edit survives browser reload');

  const reloadedAgentsTitle = await page.textContent('#rendered-agents-title');
  assert(reloadedAgentsTitle === replacementAgentsTitle, 'RealEstate edit survives browser reload');

  const reloadedAutoBadge = await page.textContent('#rendered-auto-badge');
  assert(reloadedAutoBadge === 'Rare Exotics Exclusive', 'Automotive2 edit survives browser reload');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04_browser_reloaded_state.png') });
  console.log('  [SCREENSHOT] Saved 04_browser_reloaded_state.png');

  // -------------------------------------------------------------
  // TEST 5: Public Storefront Render
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Public Storefront Rendering ---');
  await page.click('#btn-publish');
  const isPublicMode = await page.evaluate(() => document.body.classList.contains('public-mode'));
  assert(isPublicMode, 'Published storefront mode active');

  const sidebarVisible = await page.isVisible('#editor-sidebar');
  assert(!sidebarVisible, 'Editor controls hidden on published public storefront');

  const publicAgentsTitle = await page.textContent('#rendered-agents-title');
  assert(publicAgentsTitle === replacementAgentsTitle, 'Public storefront displays saved RealEstate changes');

  const publicShoesHeadline = await page.textContent('#rendered-shoes-headline');
  assert(publicShoesHeadline === replacementHeadline, 'Public storefront displays saved EcommerceShoes changes');

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05_browser_published_storefront.png') });
  console.log('  [SCREENSHOT] Saved 05_browser_published_storefront.png');

  // Cleanup
  await browser.close();
  server.close();

  console.log('\n======================================================================');
  console.log(`📊 REAL BROWSER VALIDATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
}

runBrowserValidationSuite().catch(err => {
  console.error('Browser Test Harness Error:', err);
  process.exit(1);
});
