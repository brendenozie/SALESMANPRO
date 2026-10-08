async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9223/json/list');
  const tabs = await tabsRes.json();
  const ghubaTab = tabs.find(t => t.id === '1591') || tabs.find(t => t.url && t.url.includes('/site/ghuba'));
  if (!ghubaTab) {
    console.log('No tab found');
    return;
  }

  const ws = new WebSocket(ghubaTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        return {
          title: document.title,
          readyState: document.readyState,
          bodyChildrenCount: document.body ? document.body.children.length : 0,
          bodyTagNames: document.body ? Array.from(document.body.children).map(c => c.tagName + '.' + c.className + '#' + c.id) : [],
          htmlLength: document.documentElement.outerHTML.length,
          htmlSnippet: document.documentElement.outerHTML.slice(0, 1000)
        };
      })()`,
      returnByValue: true
    }
  }));

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.id === 1) {
      console.log('EVAL RESULT:', JSON.stringify(data.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    }
  };

  setTimeout(() => {
    console.log('Timeout waiting for eval');
    process.exit(1);
  }, 4000);
}

main().catch(console.error);
