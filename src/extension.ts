import * as vscode from 'vscode';
import { getSidebarHtml } from './webview/sidebar';
import { getTerminalHtml } from './webview/terminal';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('unified-agent-cli.open', () => {
    const panel = vscode.window.createWebviewPanel(
      'unifiedAgentCli',
      'Unified Agent CLI',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    panel.webview.html = getPanelHtml();
  });

  context.subscriptions.push(disposable);
}

function getPanelHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unified Agent CLI</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      display: flex;
      align-items: stretch;
      height: 100vh;
      padding: 12px;
      gap: 0;
      overflow: hidden;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    .sidebar {
      width: 25%;
      min-width: 120px;
      max-width: 60%;
      height: 100%;
      background: var(--vscode-sideBar-background, #1e1e2e);
      border-radius: 10px;
      border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
      overflow: hidden;
      flex-shrink: 0;
    }

    .resizer {
      width: 12px;
      height: 100%;
      cursor: col-resize;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .resizer-handle {
      width: 3px;
      height: 32px;
      border-radius: 99px;
      background: var(--vscode-panel-border, rgba(255,255,255,0.1));
      transition: background 0.15s, height 0.15s;
    }

    .resizer:hover .resizer-handle,
    .resizer.dragging .resizer-handle {
      background: var(--vscode-focusBorder);
      height: 48px;
    }

    .terminal {
      flex: 1;
      height: 100%;
      background: var(--vscode-terminal-background, var(--vscode-sideBar-background, #1e1e2e));
      border-radius: 10px;
      border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${getSidebarHtml()}
  <div class="resizer" id="resizer"><div class="resizer-handle"></div></div>
  ${getTerminalHtml()}

  <script>
    const resizer = document.getElementById('resizer');
    const sidebar = document.querySelector('.sidebar');
    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      resizer.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const delta = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 120), window.innerWidth * 0.6);
      sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  </script>
</body>
</html>`;
}

export function deactivate() {}
