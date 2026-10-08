import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.id === '1590' || (t.url && t.url.includes('/site/ghuba')));

  console.log('Connecting to tab:', ghubaTab.id, ghubaTab.url);
  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === curId) {
        ws.removeEventListener('message', handler);
        if (d.error) reject(d.error);
        else resolve(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: m, params: p }));
  });

  // Reload page
  console.log('Triggering Page.reload...');
  await send('Page.reload');

  // Wait 6 seconds for page compilation & hydration
  console.log('Waiting 6s for reload & hydration...');
  await new Promise(r => setTimeout(r, 6000));

  // Check state
  const evalRes = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      readyState: document.readyState,
      title: document.title,
      hasError: !!document.querySelector('nextjs-portal'),
      mainHeight: document.querySelector('main')?.scrollHeight || document.body?.scrollHeight,
      sections: Array.from(document.querySelectorAll('[data-editor-section], section, div[id^="section-"]')).map(el => ({
        id: el.id,
        tag: el.tagName,
        top: Math.round(el.getBoundingClientRect().top),
        height: Math.round(el.getBoundingClientRect().height)
      })),
      textSample: document.body?.innerText?.slice(0, 150)
    })`,
    returnByValue: true
  });
  console.log('Page State:', JSON.parse(evalRes.result.value));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/phone_cdp_shot.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scripts/phone_cdp_shot.png');

  ws.close();
}

main().catch(console.error);
