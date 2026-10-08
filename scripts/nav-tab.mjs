async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const t = tabs.find(x => x.id === '1591');
  if (!t) return console.log('No 1591 tab');

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

  console.log('Navigating tab 1591 to http://localhost:3000/site/ghuba ...');
  await send('Page.navigate', { url: 'http://localhost:3000/site/ghuba' });
  console.log('Navigated!');
  ws.close();
}

main().catch(console.error);
