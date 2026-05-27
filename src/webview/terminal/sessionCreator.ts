import { ALL_AGENTS } from '../../shared/agents';

export function getSessionCreatorHtml(): string {
  const chips = ALL_AGENTS.map((agent) => `
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
  `).join('');

  return `
    <div class="session-creator" id="sessionCreator">
      <div class="session-creator__inner">

        <div class="session-creator__agent-row" id="sessionAgentRow">
          <span class="session-creator__label">Agent</span>
          <div class="session-creator__agent-chips" id="sessionAgentChips">
            ${chips}
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

    <script>
      (function () {
        var selectedAgentId = null;
        var nameInput  = document.getElementById('sessionNameInput');
        var createBtn  = document.getElementById('createSessionBtn');
        var hintEl     = document.getElementById('sessionHint');

        function setHint(msg, type) {
          hintEl.textContent = msg;
          hintEl.className = 'session-creator__hint' + (type ? ' session-creator__hint--' + type : '');
        }

        function syncBtn() {
          var hasAgent = !!selectedAgentId;
          var hasName  = nameInput.value.trim().length > 0;
          nameInput.disabled = !hasAgent;
          createBtn.disabled = !(hasAgent && hasName);
        }

        document.getElementById('sessionAgentChips').addEventListener('click', function (e) {
          var chip = e.target.closest('.agent-chip--available');
          if (!chip) return;
          var agentId = chip.dataset.agentId;
          if (selectedAgentId === agentId) {
            chip.classList.remove('agent-chip--selected');
            selectedAgentId = null;
            setHint('Select an agent to continue');
          } else {
            document.querySelectorAll('.agent-chip--selected').forEach(function (c) {
              c.classList.remove('agent-chip--selected');
            });
            chip.classList.add('agent-chip--selected');
            selectedAgentId = agentId;
            setHint('Agent: ' + chip.querySelector('.agent-chip__name').textContent + ' — give it a name');
          }
          syncBtn();
        });

        nameInput.addEventListener('input', function () {
          syncBtn();
          if (nameInput.value.trim().length > 0) {
            setHint('');
          } else if (selectedAgentId) {
            var chip = document.querySelector('.agent-chip--selected');
            setHint('Agent: ' + (chip ? chip.querySelector('.agent-chip__name').textContent : '') + ' — give it a name');
          }
        });

        nameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !createBtn.disabled) createBtn.click();
        });

        createBtn.addEventListener('click', function () {
          var name = nameInput.value.trim();
          if (!name || !selectedAgentId) return;
          if (typeof window.__addSession === 'function') {
            var session = window.__addSession(name, selectedAgentId);
            if (typeof window.__setActiveCard === 'function') window.__setActiveCard(session.id);
            if (typeof window.__openSession === 'function') window.__openSession(session);
          }
          nameInput.value = '';
          document.querySelectorAll('.agent-chip--selected').forEach(function (c) {
            c.classList.remove('agent-chip--selected');
          });
          selectedAgentId = null;
          syncBtn();
          setHint('Session created!', 'success');
          setTimeout(function () { setHint('Select an agent to continue'); }, 2200);
        });

        window.__applyChipAvailability = function (results) {
          results.forEach(function (r) {
            var chip = document.getElementById('chip-' + r.agentId);
            if (!chip) return;
            chip.classList.remove('agent-chip--detecting');
            chip.disabled = !r.available;
            chip.classList.add(r.available ? 'agent-chip--available' : 'agent-chip--unavailable');
          });
        };

        syncBtn();
      })();
    </script>
  `;
}
