import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));

  if (!ghubaTab) {
    console.error('No Ghuba tab found:', tabs.map(t => ({ id: t.id, url: t.url, title: t.title })));
    process.exit(1);
  }

  console.log(`Connecting to phone Chrome tab ${ghubaTab.id} (${ghubaTab.url})...`);
  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  console.log('Connected to phone Chrome via CDP!');

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // 1. Evaluate page info
  const info = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      title: document.title,
      url: window.location.href,
      readyState: document.readyState,
      bodyChildren: document.body ? document.body.children.length : 0,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      sections: Array.from(document.querySelectorAll('[data-editor-section], section, main > *')).map(el => ({
        id: el.id,
        tag: el.tagName,
        rect: { top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height }
      }))
    })`,
    returnByValue: true
  });

  const parsed = JSON.parse(info.result.value);
  console.log('Page Diagnostic:', JSON.stringify(parsed, null, 2));

  // 2. Capture screenshot via CDP
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/phone_cdp_shot.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved phone screenshot to scripts/phone_cdp_shot.png');

  ws.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
