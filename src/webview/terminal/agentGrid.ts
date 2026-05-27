import { ALL_AGENTS } from '../../shared/agents';

export function getAgentGridHtml(): string {
  const cards = ALL_AGENTS.map((agent) => `
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
    <div class="terminal__agent-grid" id="agentGrid">
      ${cards}
    </div>
  `;
}
