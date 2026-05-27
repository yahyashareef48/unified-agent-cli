import { ALL_AGENTS } from '../../shared/agents';

// Lookup so the view can render the agent badge inline.
const AGENT_META = ALL_AGENTS.reduce<Record<string, { name: string; icon: string; color: string }>>(
  (acc, a) => { acc[a.id] = { name: a.name, icon: a.icon, color: a.color }; return acc; },
  {}
);

export function getSessionViewHtml(): string {
  return `
    <div class="session-view" id="sessionView">

      <!-- Top bar -->
      <div class="session-view__topbar" id="sessionViewTopbar">
        <div class="session-view__badge" id="sessionViewBadge"></div>

        <div class="session-view__title">
          <div class="session-view__name"  id="sessionViewName"></div>
          <div class="session-view__agent" id="sessionViewAgent"></div>
        </div>
      </div>

      <!-- Body placeholder -->
      <div class="session-view__body">
        <div class="session-view__placeholder">
          <div class="session-view__placeholder-label" id="sessionViewLabel"></div>
        </div>
      </div>

    </div>

    <script>
      (function () {
        var AGENTS = ${JSON.stringify(AGENT_META)};

        /* Called by the sidebar / plus button to open a session or the creator. */
        window.__openSession = function (session) {
          var agent = AGENTS[session.agentId] || { name: session.agentId, icon: '', color: 'rgba(255,255,255,0.4)' };

          /* Populate top bar */
          var badge = document.getElementById('sessionViewBadge');
          badge.innerHTML = agent.icon;
          badge.style.setProperty('--session-color', agent.color);

          document.getElementById('sessionViewName').textContent  = session.name;
          document.getElementById('sessionViewAgent').textContent = agent.name;

          /* Placeholder label */
          document.getElementById('sessionViewLabel').textContent = agent.name + ' — ' + session.name;

          /* Switch layout */
          document.querySelector('.terminal').classList.add('terminal--split');
          document.getElementById('terminalLeft').style.display = 'flex';
        };

        window.__openCreator = function () {
          document.querySelector('.terminal').classList.remove('terminal--split');
        };

      })();
    </script>
  `;
}
