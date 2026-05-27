import { ALL_AGENTS } from '../shared/agents';

// Build a lookup table that the webview JS can use at runtime.
const AGENT_META = ALL_AGENTS.reduce<Record<string, { name: string; icon: string; color: string }>>(
  (acc, a) => {
    acc[a.id] = { name: a.name, icon: a.icon, color: a.color };
    return acc;
  },
  {}
);

export function getSidebarHtml(wordmarkUri: string): string {
  return `
    <div class="sidebar" id="sidebar">

      <!-- Header -->
      <div class="sidebar__header">
        <img class="sidebar__wordmark" src="${wordmarkUri}" alt="Unified Agent CLI" />
      </div>

      <!-- Session list -->
      <div class="sidebar__sessions" id="sidebarSessions">
        <!-- session cards injected here by JS -->
      </div>

      <!-- New session footer button -->
      <div class="sidebar__footer">
        <button class="sidebar__new-btn" id="sidebarNewBtn" title="New session">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span>New session</span>
        </button>
      </div>

      <style>
        /* ── Layout ──────────────────────────────────────────────────────── */
        .sidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .sidebar__header {
          display: flex;
          align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
          flex-shrink: 0;
        }

        .sidebar__wordmark {
          display: block;
          width: 100%;
          height: auto;
          max-height: 36px;
          object-fit: contain;
          object-position: left center;
        }

        /* ── Session list ────────────────────────────────────────────────── */
        .sidebar__sessions {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 8px 4px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .sidebar__sessions::-webkit-scrollbar { width: 4px; }
        .sidebar__sessions::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        /* ── Empty state ─────────────────────────────────────────────────── */
        .sidebar__empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 24px 12px;
          text-align: center;
          pointer-events: none;
        }

        .sidebar__empty-icon {
          opacity: 0.18;
          width: 28px;
          height: 28px;
        }

        .sidebar__empty-text {
          font-size: 11px;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.35));
          line-height: 1.5;
        }

        /* ── Session card ────────────────────────────────────────────────── */
        .session-card {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px 7px 9px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.12s, border-color 0.12s;
          position: relative;
          min-width: 0;
          --agent-color: rgba(255,255,255,0.5);
        }

        .session-card:hover {
          background: color-mix(in srgb, var(--agent-color) 8%, var(--vscode-sideBar-background, #1e1e2e));
          border-color: color-mix(in srgb, var(--agent-color) 25%, transparent);
        }

        .session-card--active {
          background: color-mix(in srgb, var(--agent-color) 12%, var(--vscode-sideBar-background, #1e1e2e));
          border-color: color-mix(in srgb, var(--agent-color) 40%, transparent);
        }

        .session-card--active::before {
          top: 10%;
          bottom: 10%;
          opacity: 1;
        }

        .session-card:hover .session-card__actions {
          opacity: 1;
          pointer-events: auto;
        }

        /* Agent color accent bar */
        .session-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 2px;
          border-radius: 2px;
          background: var(--agent-color);
          opacity: 0.7;
          transition: opacity 0.12s, top 0.12s, bottom 0.12s;
        }

        .session-card:hover::before {
          top: 12%;
          bottom: 12%;
          opacity: 1;
        }

        /* Agent icon badge */
        .session-card__badge {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: color-mix(in srgb, var(--agent-color) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--agent-color) 28%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--agent-color);
          overflow: hidden;
        }

        .session-card__badge svg {
          width: 14px;
          height: 14px;
        }

        /* Text body */
        .session-card__body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .session-card__name {
          font-size: 12px;
          font-weight: 500;
          color: var(--vscode-editor-foreground);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .session-card__meta {
          font-size: 10px;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.38));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Status dot */
        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          background: rgba(255,255,255,0.2);
        }
        .status-dot--idle    { background: rgba(255,255,255,0.25); }
        .status-dot--running { background: #4ec94e; box-shadow: 0 0 4px #4ec94e88; }
        .status-dot--waiting { background: #f5a623; }
        .status-dot--stopped { background: rgba(255,255,255,0.12); }

        /* Action buttons (edit / delete) */
        .session-card__actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.12s;
        }

        .session-card__action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 5px;
          border: none;
          background: transparent;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.45));
          cursor: pointer;
          padding: 0;
          transition: background 0.1s, color 0.1s;
          outline: none;
        }

        .session-card__action:focus-visible {
          outline: 2px solid var(--vscode-focusBorder);
          outline-offset: 1px;
        }

        .session-card__action:hover {
          background: rgba(255,255,255,0.08);
          color: var(--vscode-editor-foreground);
        }

        .session-card__action--delete:hover {
          background: rgba(248,81,73,0.14);
          color: #f85149;
        }

        /* ── Inline rename input ─────────────────────────────────────────── */
        .session-card--renaming .session-card__body { display: none; }
        .session-card--renaming .session-card__actions { display: none; }

        .session-card__rename-wrap {
          display: none;
          flex: 1;
          min-width: 0;
        }

        .session-card--renaming .session-card__rename-wrap {
          display: flex;
        }

        .session-card__rename-input {
          width: 100%;
          background: var(--vscode-input-background, rgba(255,255,255,0.06));
          border: 1px solid var(--vscode-focusBorder, rgba(255,255,255,0.4));
          border-radius: 5px;
          color: var(--vscode-input-foreground, #fff);
          font-size: 12px;
          font-family: var(--vscode-font-family);
          padding: 3px 7px;
          outline: none;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--vscode-focusBorder, #fff) 15%, transparent);
        }

        /* ── Footer button ───────────────────────────────────────────────── */
        .sidebar__footer {
          flex-shrink: 0;
          padding: 6px 8px 8px;
          border-top: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
        }

        .sidebar__new-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 6px 10px;
          border-radius: 7px;
          border: 1px dashed var(--vscode-panel-border, rgba(255,255,255,0.14));
          background: transparent;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.4));
          font-size: 11px;
          font-weight: 500;
          font-family: var(--vscode-font-family);
          cursor: pointer;
          transition: border-color 0.13s, color 0.13s, background 0.13s;
          outline: none;
        }

        .sidebar__new-btn:focus-visible {
          outline: 2px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }

        .sidebar__new-btn:hover {
          border-color: var(--vscode-focusBorder, rgba(255,255,255,0.35));
          color: var(--vscode-editor-foreground);
          background: rgba(255,255,255,0.04);
        }
      </style>

      <script>
        (function () {
          /* ── agent metadata injected at build time ────────────────────── */
          var AGENTS = ${JSON.stringify(AGENT_META)};

          var listEl = document.getElementById('sidebarSessions');
          var activeSessionId = null;

          /* ── helpers ─────────────────────────────────────────────────── */
          function statusLabel(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);
          }

          function buildCard(session) {
            var agent = AGENTS[session.agentId] || { name: session.agentId, icon: '', color: 'rgba(255,255,255,0.4)' };

            var card = document.createElement('div');
            card.className = 'session-card';
            card.dataset.sessionId = session.id;
            card.style.setProperty('--agent-color', agent.color);

            card.innerHTML =
              '<div class="session-card__badge">' + agent.icon + '</div>' +
              '<div class="session-card__body">' +
                '<div class="session-card__name">' + escHtml(session.name) + '</div>' +
                '<div class="session-card__meta">' +
                  '<span class="status-dot status-dot--' + session.status + '"></span>' +
                  '<span>' + agent.name + ' &middot; ' + statusLabel(session.status) + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="session-card__rename-wrap">' +
                '<input class="session-card__rename-input" type="text" maxlength="64" />' +
              '</div>' +
              '<div class="session-card__actions">' +
                '<button class="session-card__action session-card__action--edit" title="Rename" data-action="edit">' +
                  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</button>' +
                '<button class="session-card__action session-card__action--delete" title="Delete" data-action="delete">' +
                  '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3H10M4.5 3V2H7.5V3M5 5.5V9M7 5.5V9M2.5 3L3 10H9L9.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '</button>' +
              '</div>';

            /* ── edit action ──────────────────────────────────────────── */
            card.querySelector('[data-action="edit"]').addEventListener('click', function (e) {
              e.stopPropagation();
              startRename(card, session);
            });

            /* ── delete action ────────────────────────────────────────── */
            card.querySelector('[data-action="delete"]').addEventListener('click', function (e) {
              e.stopPropagation();
              if (typeof window.__deleteSession === 'function') {
                window.__deleteSession(session.id);
              }
            });

            /* ── open session on card click ───────────────────────────── */
            card.addEventListener('click', function () {
              if (card.classList.contains('session-card--renaming')) return;
              setActiveCard(session.id);
              if (typeof window.__openSession === 'function') {
                window.__openSession(session);
              }
            });

            /* ── rename input ─────────────────────────────────────────── */
            var renameInput = card.querySelector('.session-card__rename-input');
            renameInput.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') commitRename(card, session, renameInput.value);
              if (e.key === 'Escape') cancelRename(card);
            });
            renameInput.addEventListener('blur', function () {
              commitRename(card, session, renameInput.value);
            });

            return card;
          }

          function startRename(card, session) {
            var input = card.querySelector('.session-card__rename-input');
            input.value = session.name;
            card.classList.add('session-card--renaming');
            input.focus();
            input.select();
          }

          function commitRename(card, session, raw) {
            if (!card.classList.contains('session-card--renaming')) return;
            var name = raw.trim();
            card.classList.remove('session-card--renaming');
            if (name && name !== session.name) {
              if (typeof window.__renameSession === 'function') {
                window.__renameSession(session.id, name);
              }
            }
          }

          function cancelRename(card) {
            card.classList.remove('session-card--renaming');
          }

          function escHtml(str) {
            return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
          }

          function setActiveCard(id) {
            activeSessionId = id;
            listEl.querySelectorAll('.session-card').forEach(function (el) {
              el.classList.toggle('session-card--active', el.dataset.sessionId === id);
            });
          }
          window.__setActiveCard = setActiveCard;

          /* ── render ──────────────────────────────────────────────────── */
          function renderSessions(sessions) {
            listEl.innerHTML = '';

            if (!sessions || sessions.length === 0) {
              listEl.innerHTML =
                '<div class="sidebar__empty">' +
                  '<svg class="sidebar__empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>' +
                    '<path d="M8 12H16M12 8V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
                  '</svg>' +
                  '<p class="sidebar__empty-text">No sessions yet.<br/>Pick an agent and create one.</p>' +
                '</div>';
              return;
            }

            sessions.forEach(function (session) {
              listEl.appendChild(buildCard(session));
            });

            if (activeSessionId) setActiveCard(activeSessionId);
          }

          /* ── subscribe to global store ───────────────────────────────── */
          function subscribe() {
            if (typeof window.__onSessionsChange === 'function') {
              window.__onSessionsChange(renderSessions);
              /* Render current snapshot immediately */
              if (window.__sessions) {
                renderSessions(Object.values(window.__sessions));
              }
            } else {
              /* Store not ready yet — retry on next tick */
              setTimeout(subscribe, 0);
            }
          }

          subscribe();

          /* ── footer new-session button ───────────────────────────────── */
          document.getElementById('sidebarNewBtn').addEventListener('click', function () {
            if (typeof window.__openCreator === 'function') window.__openCreator();
          });
        })();
      </script>
    </div>
  `;
}
