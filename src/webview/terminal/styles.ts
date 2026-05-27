export function getTerminalStyles(): string {
  return `
    <style>
      /* ── Terminal panel shell ──────────────────────────────────────────── */
      .terminal {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 100%;
        overflow: hidden;
      }

      /* Left pane: agent grid + session creator */
      .terminal__left {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
        flex-shrink: 0;
      }

      /* Right pane: slides in over the left pane */
      .terminal__right {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--vscode-terminal-background, var(--vscode-sideBar-background, #1e1e2e));
        transform: translateX(100%);
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .terminal--split .terminal__right {
        transform: translateX(0);
      }

      /* ── Agent grid ────────────────────────────────────────────────────── */
      .terminal__agent-grid {
        display: flex;
        flex-wrap: wrap;
        align-content: center;
        justify-content: center;
        gap: 10px;
        padding: 16px;
        flex: 1;
        overflow: hidden;
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

      .agent-card--detecting .agent-card__icon { opacity: 0.25; }

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

      .agent-card__icon svg { width: 46px; height: 46px; }

      .agent-card--available .agent-card__icon { color: var(--agent-color); }

      .agent-card__tooltip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%) translateY(4px);
        white-space: nowrap;
        background: rgba(24,24,24,0.95);
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

      /* ── Session creator ───────────────────────────────────────────────── */
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

      .agent-chip--detecting { opacity: 0.35; pointer-events: none; }

      .agent-chip--unavailable {
        opacity: 0.28;
        cursor: not-allowed;
        pointer-events: none;
        filter: grayscale(1);
      }

      .agent-chip--available {
        border-color: color-mix(in srgb, var(--agent-color) 30%, transparent);
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

      .agent-chip__icon svg { width: 16px; height: 16px; }

      .session-creator__input-row {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }

      .session-creator__field { flex: 1; position: relative; }

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

      .session-creator__input:disabled { opacity: 0.45; cursor: not-allowed; }

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

      .session-creator__btn:not(:disabled):active { transform: translateY(0); }
      .session-creator__btn:disabled { opacity: 0.38; cursor: not-allowed; }

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

      .session-creator__hint--success { color: #4ec94e !important; }

      /* ── Session view (right pane) ─────────────────────────────────────── */
      .session-view {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .session-view__topbar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
        flex-shrink: 0;
      }

.session-view__badge {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--session-color, rgba(255,255,255,0.3)) 14%, transparent);
        border: 1px solid color-mix(in srgb, var(--session-color, rgba(255,255,255,0.3)) 28%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--session-color, rgba(255,255,255,0.5));
        flex-shrink: 0;
      }

      .session-view__badge svg { width: 13px; height: 13px; }

      .session-view__title {
        flex: 1;
        min-width: 0;
      }

      .session-view__name {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-editor-foreground);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }

      .session-view__agent {
        font-size: 10px;
        color: var(--vscode-descriptionForeground, rgba(255,255,255,0.38));
      }

      .session-view__body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .session-view__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        opacity: 0.22;
        pointer-events: none;
        user-select: none;
      }

      .session-view__placeholder-label {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.01em;
        color: var(--vscode-editor-foreground);
      }
    </style>
  `;
}
