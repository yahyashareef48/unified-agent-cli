import { ALL_AGENTS } from '../../shared/agents';

const AGENT_META = ALL_AGENTS.reduce<Record<string, { name: string; icon: string; color: string }>>(
  (acc, a) => { acc[a.id] = { name: a.name, icon: a.icon, color: a.color }; return acc; },
  {}
);

export function getSessionViewHtml(): string {
  return `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/css/xterm.css" />
    <script src="https://cdn.jsdelivr.net/npm/@xterm/xterm@5/lib/xterm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10/lib/addon-fit.js"></script>

    <div class="session-view" id="sessionView">

      <!-- Top bar -->
      <div class="session-view__topbar" id="sessionViewTopbar">
        <div class="session-view__badge" id="sessionViewBadge"></div>

        <div class="session-view__title">
          <div class="session-view__name"  id="sessionViewName"></div>
          <div class="session-view__agent" id="sessionViewAgent"></div>
        </div>
      </div>

      <!-- Terminal container — xterm mounts here -->
      <div class="session-view__body">
        <div id="sessionViewTerminal" class="session-view__xterm"></div>
      </div>

    </div>

    <script>
      (function () {
        var AGENTS = ${JSON.stringify(AGENT_META)};

        // sessionId -> { term, fitAddon }
        var terminals = {};
        var activeSessionId = null;

        function getOrCreateTerminal(sessionId) {
          if (terminals[sessionId]) return terminals[sessionId];

          var term = new Terminal({
            fontSize: 13,
            fontFamily: 'var(--vscode-editor-font-family, monospace)',
            theme: {
              background: 'transparent',
              foreground: getComputedStyle(document.body).getPropertyValue('--vscode-terminal-foreground') || '#cccccc',
              cursor: getComputedStyle(document.body).getPropertyValue('--vscode-terminalCursor-foreground') || '#ffffff',
            },
            allowTransparency: true,
            cursorBlink: true,
          });

          var fitAddon = new FitAddon.FitAddon();
          term.loadAddon(fitAddon);

          // Each session gets its own hidden div inside the terminal container.
          var container = document.createElement('div');
          container.style.cssText = 'position:absolute;inset:0;display:none;';
          container.dataset.sessionId = sessionId;
          document.getElementById('sessionViewTerminal').appendChild(container);

          term.open(container);
          fitAddon.fit();

          term.onData(function(data) {
            vscode.postMessage({ type: 'ptyInput', payload: { sessionId: sessionId, data: data } });
          });

          var ro = new ResizeObserver(function() {
            if (activeSessionId !== sessionId) return;
            fitAddon.fit();
            vscode.postMessage({
              type: 'ptyResize',
              payload: { sessionId: sessionId, cols: term.cols, rows: term.rows },
            });
          });
          ro.observe(document.getElementById('sessionViewTerminal'));

          terminals[sessionId] = { term: term, fitAddon: fitAddon, container: container, ro: ro };

          // Ask the host to spawn the pty.
          vscode.postMessage({
            type: 'ptySpawn',
            payload: { sessionId: sessionId, cols: term.cols, rows: term.rows },
          });

          return terminals[sessionId];
        }

        function showSession(sessionId) {
          // Hide all terminal containers.
          Object.keys(terminals).forEach(function(id) {
            terminals[id].container.style.display = 'none';
          });

          activeSessionId = sessionId;
          var entry = getOrCreateTerminal(sessionId);
          entry.container.style.display = 'block';
          entry.fitAddon.fit();
          entry.term.focus();
        }

        // Route pty output from the extension host to the right terminal.
        window.__onPtyData = function(sessionId, data) {
          var entry = terminals[sessionId];
          if (entry) entry.term.write(data);
        };

        window.__onPtyExit = function(sessionId) {
          var entry = terminals[sessionId];
          if (!entry) return;
          entry.term.writeln('\\r\\n[Process exited]');
        };

        /* Called by the sidebar when the user picks a session. */
        window.__openSession = function (session) {
          var agent = AGENTS[session.agentId] || { name: session.agentId, icon: '', color: 'rgba(255,255,255,0.4)' };

          var badge = document.getElementById('sessionViewBadge');
          badge.innerHTML = agent.icon;
          badge.style.setProperty('--session-color', agent.color);

          document.getElementById('sessionViewName').textContent  = session.name;
          document.getElementById('sessionViewAgent').textContent = agent.name;

          document.querySelector('.terminal').classList.add('terminal--split');
          document.getElementById('terminalLeft').style.display = 'flex';

          showSession(session.id);
        };

        window.__openCreator = function () {
          document.querySelector('.terminal').classList.remove('terminal--split');
        };

        // msg is the raw event.data: { type, sessionId, data? }
        window.__dispatchPtyMessage = function(type, msg) {
          if (type === 'ptyData')  window.__onPtyData(msg.sessionId, msg.data);
          if (type === 'ptyExit')  window.__onPtyExit(msg.sessionId);
        };

      })();
    </script>
  `;
}
