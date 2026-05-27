import * as vscode from 'vscode';
import { getSidebarHtml } from './webview/sidebar';
import { getTerminalHtml } from './webview/terminal/index';
import { detectAgents } from './extension/agentDetector';
import { ALL_AGENTS } from './shared/agents';
import { PtyManager } from './extension/pty';

export function activate(context: vscode.ExtensionContext) {
  let currentPanel: vscode.WebviewPanel | undefined;

  const disposable = vscode.commands.registerCommand('unified-agent-cli.open', () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
      return;
    }

    const mediaRoot = vscode.Uri.joinPath(context.extensionUri, 'media');
    const panel = vscode.window.createWebviewPanel(
      'unifiedAgentCli',
      'Unified Agent CLI',
      vscode.ViewColumn.One,
      { enableScripts: true, localResourceRoots: [mediaRoot], retainContextWhenHidden: true }
    );

    currentPanel = panel;
    const ptyManager = new PtyManager(panel);
    panel.onDidDispose(() => { ptyManager.killAll(); currentPanel = undefined; }, null, context.subscriptions);

    panel.iconPath = {
      light: vscode.Uri.joinPath(mediaRoot, 'logo.png'),
      dark: vscode.Uri.joinPath(mediaRoot, 'logo.png'),
    };

    const wordmarkUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'logo-wordmark.svg'));
    panel.webview.html = getPanelHtml(wordmarkUri.toString());

    // Handle messages from the webview — sessions are persisted here, webview is just a view.
    panel.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'webviewReady': {
          const sessions: any[] = context.globalState.get('sessions', []);
          panel.webview.postMessage({ type: 'sessionsUpdated', payload: sessions });
          break;
        }
        case 'sessionAdded': {
          const sessions: any[] = context.globalState.get('sessions', []);
          const updated = [...sessions, message.payload];
          context.globalState.update('sessions', updated);
          panel.webview.postMessage({ type: 'sessionsUpdated', payload: updated });
          break;
        }
        case 'sessionDeleted': {
          const sessions: any[] = context.globalState.get('sessions', []);
          const updated = sessions.filter((s: any) => s.id !== message.payload.id);
          context.globalState.update('sessions', updated);
          panel.webview.postMessage({ type: 'sessionsUpdated', payload: updated });
          break;
        }
        case 'sessionRenamed': {
          const sessions: any[] = context.globalState.get('sessions', []);
          const updated = sessions.map((s: any) =>
            s.id === message.payload.id ? { ...s, name: message.payload.name } : s
          );
          context.globalState.update('sessions', updated);
          panel.webview.postMessage({ type: 'sessionsUpdated', payload: updated });
          break;
        }
        case 'ptySpawn': {
          const { sessionId, cols, rows } = message.payload;
          ptyManager.spawn(sessionId, cols, rows);
          break;
        }
        case 'ptyInput': {
          const { sessionId, data } = message.payload;
          ptyManager.write(sessionId, data);
          break;
        }
        case 'ptyResize': {
          const { sessionId, cols, rows } = message.payload;
          ptyManager.resize(sessionId, cols, rows);
          break;
        }
        case 'ptyKill': {
          ptyManager.kill(message.payload.sessionId);
          break;
        }
      }
    }, null, context.subscriptions);

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

    // Session store — read-only cache; host (globalState) is the source of truth.
    window.__sessions = {};
    window.__sessionListeners = [];

    function __applySessionUpdate(sessions) {
      window.__sessions = {};
      sessions.forEach(function(s) { window.__sessions[s.id] = s; });
      window.__sessionListeners.forEach(function(fn) { fn(sessions); });
    }

    window.__addSession = function(name, agentId) {
      const session = { id: String(Date.now()), name: name, agentId: agentId, status: 'idle' };
      vscode.postMessage({ type: 'sessionAdded', payload: session });
      return session;
    };

    window.__deleteSession = function(id) {
      vscode.postMessage({ type: 'sessionDeleted', payload: { id: id } });
    };

    window.__renameSession = function(id, name) {
      vscode.postMessage({ type: 'sessionRenamed', payload: { id: id, name: name } });
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
      } else if (type === 'sessionsUpdated') {
        __applySessionUpdate(payload);
      } else if (type === 'ptyData' || type === 'ptyExit') {
        if (typeof window.__dispatchPtyMessage === 'function') {
          window.__dispatchPtyMessage(type, event.data);
        }
      }
    });

    // Signal host that the webview is ready so it can push persisted sessions.
    vscode.postMessage({ type: 'webviewReady' });

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
