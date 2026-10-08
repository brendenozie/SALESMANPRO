import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));

  if (!ghubaTab) {
    console.error('No Ghuba tab found');
    process.exit(1);
  }

  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  let id = 1;
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

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    const curId = id++;
    return new Promise((resolve, reject) => {
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  console.log('Navigating to http://127.0.0.1:3000/site/ghuba ...');
  // Use location.href reload via evaluate
  await send('Runtime.evaluate', { expression: 'window.location.href = "http://127.0.0.1:3000/site/ghuba"' });

  // Close and re-open connection after 3 seconds
  ws.close();

  await new Promise(r => setTimeout(r, 4000));

  // Reconnect
  const tabsRes2 = await fetch('http://127.0.0.1:9223/json/list');
  const tabs2 = await tabsRes2.json();
  const ghubaTab2 = tabs2.find(t => t.url && t.url.includes('/site/ghuba'));
  
  const ws2 = new WebSocket(ghubaTab2.webSocketDebuggerUrl);
  await new Promise(r => ws2.onopen = r);
  let id2 = 1;
  const pending2 = new Map();
  ws2.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending2.has(msg.id)) {
      const { resolve, reject } = pending2.get(msg.id);
      pending2.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send2(method, params = {}) {
    const curId = id2++;
    return new Promise((resolve, reject) => {
      pending2.set(curId, { resolve, reject });
      ws2.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  const status = await send2('Runtime.evaluate', {
    expression: `JSON.stringify({
      readyState: document.readyState,
      hasErrorOverlay: !!document.querySelector('nextjs-portal'),
      title: document.title,
      scrollHeight: document.documentElement.scrollHeight,
      sections: Array.from(document.querySelectorAll('[data-editor-section], section')).map(s => ({
        id: s.id,
        tag: s.tagName,
        top: Math.round(s.getBoundingClientRect().top),
        height: Math.round(s.getBoundingClientRect().height)
      }))
    })`,
    returnByValue: true
  });
  console.log('STATUS:', JSON.parse(status.result.value));

  const shot = await send2('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/phone_cdp_shot.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scripts/phone_cdp_shot.png');

  ws2.close();
}

main().catch(console.error);
