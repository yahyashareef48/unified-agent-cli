import * as vscode from 'vscode';
import { getSidebarHtml } from './webview/sidebar';
import { getTerminalHtml } from './webview/terminal';
import { detectAgents } from './extension/agentDetector';
import { ALL_AGENTS } from './shared/agents';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('unified-agent-cli.open', () => {
    const mediaRoot = vscode.Uri.joinPath(context.extensionUri, 'media');
    const panel = vscode.window.createWebviewPanel(
      'unifiedAgentCli',
      'Unified Agent CLI',
      vscode.ViewColumn.One,
      { enableScripts: true, localResourceRoots: [mediaRoot] }
    );

    panel.iconPath = {
      light: vscode.Uri.joinPath(mediaRoot, 'logo.png'),
      dark: vscode.Uri.joinPath(mediaRoot, 'logo.png'),
    };

    const wordmarkUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'logo-wordmark.svg'));
    panel.webview.html = getPanelHtml(wordmarkUri.toString());

    // Run probes in the background; push results into the webview when ready.
    detectAgents(ALL_AGENTS).then((results) => {
      if (panel.visible) {
        panel.webview.postMessage({ type: 'agentAvailability', payload: results });
      }
    });
  });

  context.subscriptions.push(disposable);
}

function getPanelHtml(wordmarkUri: string): string {
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
      width: 20%;
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
  ${getSidebarHtml(wordmarkUri)}
  <div class="resizer" id="resizer"><div class="resizer-handle"></div></div>
  ${getTerminalHtml()}

  <script>
    const vscode = acquireVsCodeApi();

    /**
     * Global agent availability store.
     * Key: agentId, Value: boolean | null (null = still detecting).
     * Any part of the UI can read window.__agentAvailability[agentId].
     */
    window.__agentAvailability = {};

    /**
     * Called once the extension host finishes probing.
     * Updates the store, then patches every matching agent card in the DOM.
     */
    window.__applyAgentAvailability = function(results) {
      results.forEach(({ agentId, available }) => {
        window.__agentAvailability[agentId] = available;

        const card = document.getElementById('agent-' + agentId);
        if (!card) return;

        card.classList.remove('agent-card--detecting');
        card.classList.add(available ? 'agent-card--available' : 'agent-card--unavailable');

        if (!available) {
          const name = card.querySelector('.agent-card__name')?.textContent?.trim();
          if (name) card.setAttribute('title', name + ' — not installed');
        }
      });

      // Also update the session-creator chips.
      if (typeof window.__applyChipAvailability === 'function') {
        window.__applyChipAvailability(results);
      }
    };

    /**
     * Global session store (mirrors src/shared/sessionStore.ts for the webview).
     * Key: session id, Value: session object.
     */
    window.__sessions = {};
    window.__sessionListeners = [];

    window.__addSession = function(name, agentId) {
      const id = String(Date.now());
      const session = { id, name, agentId, status: 'idle' };
      window.__sessions[id] = session;
      window.__sessionListeners.forEach(function(fn) { fn(Object.values(window.__sessions)); });
      vscode.postMessage({ type: 'sessionAdded', payload: session });
    };

    window.__deleteSession = function(id) {
      delete window.__sessions[id];
      window.__sessionListeners.forEach(function(fn) { fn(Object.values(window.__sessions)); });
      vscode.postMessage({ type: 'sessionDeleted', payload: { id } });
    };

    window.__renameSession = function(id, name) {
      if (!window.__sessions[id]) return;
      window.__sessions[id] = Object.assign({}, window.__sessions[id], { name: name });
      window.__sessionListeners.forEach(function(fn) { fn(Object.values(window.__sessions)); });
      vscode.postMessage({ type: 'sessionRenamed', payload: { id, name } });
    };

    window.__onSessionsChange = function(listener) {
      window.__sessionListeners.push(listener);
      return function() {
        window.__sessionListeners = window.__sessionListeners.filter(function(fn) { return fn !== listener; });
      };
    };

    // Receive messages from the extension host.
    window.addEventListener('message', (event) => {
      const { type, payload } = event.data;
      if (type === 'agentAvailability') {
        window.__applyAgentAvailability(payload);
      }
    });

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
