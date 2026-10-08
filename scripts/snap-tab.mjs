import fs from 'fs';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const t = tabs.find(x => x.id === '1590');
  if (!t) return console.log('Tab 1590 not found');

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method: m, params: p }));
  });

  const res = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      title: document.title,
      readyState: document.readyState,
      hasErrorPortal: !!document.querySelector('nextjs-portal'),
      portalText: document.querySelector('nextjs-portal')?.shadowRoot?.innerText?.slice(0, 200),
      bodyChildren: document.body?.children?.length,
      mainHeight: document.querySelector('main')?.scrollHeight || document.documentElement.scrollHeight,
      sections: Array.from(document.querySelectorAll('section, [data-editor-section]')).map(s => ({
        id: s.id,
        tag: s.tagName,
        top: Math.round(s.getBoundingClientRect().top),
        height: Math.round(s.getBoundingClientRect().height)
      })),
      textSnippet: document.body?.innerText?.slice(0, 200)
    })`,
    returnByValue: true
  });
  console.log('DOM RES:', JSON.parse(res.result.value));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/phone_cdp_shot.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scripts/phone_cdp_shot.png');

  ws.close();
}

main().catch(console.error);
