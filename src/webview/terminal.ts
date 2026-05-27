import { ALL_AGENTS } from '../shared/agents';

export function getTerminalHtml(): string {
  const agentCards = ALL_AGENTS.map((agent) => `
    <button
      class="agent-card agent-card--detecting"
      id="agent-${agent.id}"
      data-agent-id="${agent.id}"
      style="--agent-color: ${agent.color}"
    >
      <span class="agent-card__icon">${agent.icon}</span>
      <span class="agent-card__tooltip">${agent.name}</span>
    </button>
  `).join('');

  return `
    <div class="terminal">
      <div class="terminal__agent-grid" id="agentGrid">
        ${agentCards}
      </div>

      <div class="session-creator" id="sessionCreator">
        <div class="session-creator__inner">
          <div class="session-creator__agent-row" id="sessionAgentRow">
            <span class="session-creator__label">Agent</span>
            <div class="session-creator__agent-chips" id="sessionAgentChips">
              ${ALL_AGENTS.map((agent) => `
                <button
                  class="agent-chip agent-chip--detecting"
                  id="chip-${agent.id}"
                  data-agent-id="${agent.id}"
                  style="--agent-color: ${agent.color}"
                  disabled
                >
                  <span class="agent-chip__icon">${agent.icon}</span>
                  <span class="agent-chip__name">${agent.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="session-creator__input-row">
            <div class="session-creator__field">
              <input
                id="sessionNameInput"
                class="session-creator__input"
                type="text"
                placeholder="Session name…"
                maxlength="64"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <button class="session-creator__btn" id="createSessionBtn" disabled>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
              </svg>
              <span>New Session</span>
            </button>
          </div>

          <p class="session-creator__hint" id="sessionHint">Select an agent to continue</p>
        </div>
      </div>

      <style>
        .terminal {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .terminal__agent-grid {
          display: flex;
          flex-wrap: wrap;
          align-content: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          flex: 1;
        }

        /* ── Agent cards ─────────────────────────────────────────────────── */

        .agent-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 80px;
          height: 80px;
          border-radius: 14px;
          border: 1px solid transparent;
          background: var(--vscode-editor-background);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, opacity 0.2s, transform 0.1s;
          overflow: visible;
          outline: none;
        }

        .agent-card:focus-visible {
          outline: 2px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }

        .agent-card--available {
          border-color: color-mix(in srgb, var(--agent-color) 35%, transparent);
        }

        .agent-card--available:hover {
          background: color-mix(in srgb, var(--agent-color) 10%, var(--vscode-editor-background));
          border-color: color-mix(in srgb, var(--agent-color) 65%, transparent);
          transform: translateY(-2px);
        }

        .agent-card--unavailable {
          opacity: 0.35;
          cursor: not-allowed;
          border-color: var(--vscode-panel-border, rgba(255,255,255,0.06));
          filter: grayscale(1);
        }

        .agent-card--detecting {
          border-color: var(--vscode-panel-border, rgba(255,255,255,0.06));
          pointer-events: none;
        }

        .agent-card--detecting::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 13px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.05) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        .agent-card--detecting .agent-card__icon {
          opacity: 0.25;
        }

        .agent-card__icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vscode-disabledForeground, #888);
          transition: color 0.2s;
        }

        .agent-card__icon svg {
          width: 46px;
          height: 46px;
        }

        .agent-card--available .agent-card__icon {
          color: var(--agent-color);
        }

        .agent-card__tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          white-space: nowrap;
          background: rgba(24, 24, 24, 0.95);
          color: rgba(255,255,255,0.88);
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 5px;
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.12s, transform 0.12s;
          z-index: 10;
        }

        .agent-card:hover .agent-card__tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* ── Session creator ─────────────────────────────────────────────── */

        .session-creator {
          flex-shrink: 0;
          padding: 0 14px 14px;
        }

        .session-creator__inner {
          background: color-mix(in srgb, var(--vscode-editor-background) 60%, transparent);
          border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
          border-radius: 12px;
          padding: 12px 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          backdrop-filter: blur(8px);
        }

        /* Agent chips row */

        .session-creator__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.4));
          flex-shrink: 0;
        }

        .session-creator__agent-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .session-creator__agent-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .agent-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px 4px 6px;
          border-radius: 20px;
          border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.1));
          background: transparent;
          color: var(--vscode-editor-foreground);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.13s, background 0.13s, opacity 0.15s;
          outline: none;
        }

        .agent-chip:focus-visible {
          outline: 2px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }

        .agent-chip--detecting {
          opacity: 0.35;
          pointer-events: none;
        }

        .agent-chip--unavailable {
          opacity: 0.28;
          cursor: not-allowed;
          pointer-events: none;
          filter: grayscale(1);
        }

        .agent-chip--available {
          border-color: color-mix(in srgb, var(--agent-color) 30%, transparent);
          color: var(--vscode-editor-foreground);
        }

        .agent-chip--available:hover {
          background: color-mix(in srgb, var(--agent-color) 12%, transparent);
          border-color: color-mix(in srgb, var(--agent-color) 55%, transparent);
        }

        .agent-chip--selected {
          background: color-mix(in srgb, var(--agent-color) 18%, transparent) !important;
          border-color: var(--agent-color) !important;
          color: var(--agent-color) !important;
        }

        .agent-chip__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .agent-chip__icon svg {
          width: 16px;
          height: 16px;
        }

        /* Input row */

        .session-creator__input-row {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }

        .session-creator__field {
          flex: 1;
          position: relative;
        }

        .session-creator__input {
          width: 100%;
          height: 34px;
          padding: 0 12px;
          background: var(--vscode-input-background, rgba(255,255,255,0.05));
          border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
          border-radius: 8px;
          color: var(--vscode-input-foreground, #fff);
          font-size: 12px;
          font-family: var(--vscode-font-family);
          outline: none;
          transition: border-color 0.13s, box-shadow 0.13s;
        }

        .session-creator__input::placeholder {
          color: var(--vscode-input-placeholderForeground, rgba(255,255,255,0.3));
        }

        .session-creator__input:focus {
          border-color: var(--vscode-focusBorder, rgba(255,255,255,0.4));
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--vscode-focusBorder, #fff) 15%, transparent);
        }

        .session-creator__input:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .session-creator__btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: var(--vscode-button-background, #0e7a0d);
          color: var(--vscode-button-foreground, #fff);
          font-size: 12px;
          font-weight: 600;
          font-family: var(--vscode-font-family);
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.13s, opacity 0.13s, transform 0.1s;
          outline: none;
          flex-shrink: 0;
        }

        .session-creator__btn:focus-visible {
          outline: 2px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }

        .session-creator__btn:not(:disabled):hover {
          background: var(--vscode-button-hoverBackground, #1a9e19);
          transform: translateY(-1px);
        }

        .session-creator__btn:not(:disabled):active {
          transform: translateY(0);
        }

        .session-creator__btn:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        /* Hint text */

        .session-creator__hint {
          font-size: 10.5px;
          color: var(--vscode-descriptionForeground, rgba(255,255,255,0.35));
          line-height: 1.4;
          min-height: 15px;
          transition: color 0.15s;
        }

        .session-creator__hint--error {
          color: var(--vscode-inputValidation-errorForeground, #f48771) !important;
        }

        .session-creator__hint--success {
          color: #4ec94e !important;
        }
      </style>

      <script>
        (function () {
          /* ── state ───────────────────────────────────────────────────── */
          let selectedAgentId = null;

          const nameInput   = document.getElementById('sessionNameInput');
          const createBtn   = document.getElementById('createSessionBtn');
          const hintEl      = document.getElementById('sessionHint');

          /* ── helpers ─────────────────────────────────────────────────── */
          function setHint(msg, type) {
            hintEl.textContent = msg;
            hintEl.className = 'session-creator__hint' + (type ? ' session-creator__hint--' + type : '');
          }

          function syncCreateBtn() {
            const hasAgent = !!selectedAgentId;
            const hasName  = nameInput.value.trim().length > 0;
            nameInput.disabled = !hasAgent;
            createBtn.disabled = !(hasAgent && hasName);
          }

          /* ── chip selection ──────────────────────────────────────────── */
          document.getElementById('sessionAgentChips').addEventListener('click', function (e) {
            const chip = e.target.closest('.agent-chip--available');
            if (!chip) return;

            const agentId = chip.dataset.agentId;
            if (selectedAgentId === agentId) {
              /* deselect */
              chip.classList.remove('agent-chip--selected');
              selectedAgentId = null;
              setHint('Select an agent to continue');
            } else {
              document.querySelectorAll('.agent-chip--selected').forEach(function (c) {
                c.classList.remove('agent-chip--selected');
              });
              chip.classList.add('agent-chip--selected');
              selectedAgentId = agentId;
              const agentName = chip.querySelector('.agent-chip__name').textContent;
              setHint('Agent: ' + agentName + ' — now give your session a name');
            }
            syncCreateBtn();
          });

          /* ── name input ──────────────────────────────────────────────── */
          nameInput.addEventListener('input', function () {
            syncCreateBtn();
            if (nameInput.value.trim().length > 0) {
              setHint('');
            } else if (selectedAgentId) {
              const chip = document.querySelector('.agent-chip--selected');
              const agentName = chip ? chip.querySelector('.agent-chip__name').textContent : '';
              setHint('Agent: ' + agentName + ' — now give your session a name');
            }
          });

          nameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !createBtn.disabled) createBtn.click();
          });

          /* ── create ──────────────────────────────────────────────────── */
          createBtn.addEventListener('click', function () {
            const name = nameInput.value.trim();
            if (!name || !selectedAgentId) return;

            /* Dispatch to global store (defined in extension.ts panel script) */
            if (typeof window.__addSession === 'function') {
              window.__addSession(name, selectedAgentId);
            }

            /* Reset */
            nameInput.value = '';
            document.querySelectorAll('.agent-chip--selected').forEach(function (c) {
              c.classList.remove('agent-chip--selected');
            });
            selectedAgentId = null;
            syncCreateBtn();
            setHint('Session created!', 'success');
            setTimeout(function () { setHint('Select an agent to continue'); }, 2200);
          });

          /* ── sync chip state when availability arrives ───────────────── */
          window.__applyChipAvailability = function (results) {
            results.forEach(function (r) {
              const chip = document.getElementById('chip-' + r.agentId);
              if (!chip) return;
              chip.classList.remove('agent-chip--detecting');
              chip.disabled = !r.available;
              chip.classList.add(r.available ? 'agent-chip--available' : 'agent-chip--unavailable');
            });
          };

          syncCreateBtn();
        })();
      </script>
    </div>
  `;
}
