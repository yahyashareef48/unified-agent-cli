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

      <style>
        .terminal__agent-grid {
          display: flex;
          flex-wrap: wrap;
          align-content: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          height: 100%;
        }

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


      </style>
    </div>
  `;
}
