import { getTerminalStyles }   from './styles';
import { getAgentGridHtml }    from './agentGrid';
import { getSessionCreatorHtml } from './sessionCreator';
import { getSessionViewHtml }  from './sessionView';

export function getTerminalHtml(): string {
  return `
    <div class="terminal" id="terminalPanel">

      <!-- Left pane: agent picker + session creator -->
      <div class="terminal__left" id="terminalLeft">
        ${getAgentGridHtml()}
        ${getSessionCreatorHtml()}
      </div>

      <!-- Right pane: active session -->
      <div class="terminal__right" id="terminalRight">
        ${getSessionViewHtml()}
      </div>

    </div>

    ${getTerminalStyles()}
  `;
}
