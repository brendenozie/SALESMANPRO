async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.url && t.url.includes('/site/ghuba'));

  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

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

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Check window.__NEXT_DATA__ or any errors stored on window
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      return JSON.stringify({
        hasWindowErrors: window.__next_error__ || null,
        nextData: window.__NEXT_DATA__ ? {
          page: window.__NEXT_DATA__.page,
          buildId: window.__NEXT_DATA__.buildId,
        } : null,
        scriptsCount: document.scripts.length,
        failedScripts: Array.from(document.scripts).filter(s => !s.loaded && s.src).map(s => s.src),
        bodySnippet: document.body.innerHTML.slice(0, 1000)
      });
    })()`,
    returnByValue: true
  });

  console.log('CLIENT DIAGNOSTICS:', evalRes.result.value);
  ws.close();
}

main().catch(console.error);
