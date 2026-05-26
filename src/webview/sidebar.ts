export function getSidebarHtml(wordmarkUri: string): string {
  return `
    <div class="sidebar">
      <div class="sidebar__header">
        <img class="sidebar__wordmark" src="${wordmarkUri}" alt="Unified Agent CLI" />
      </div>

      <style>
        .sidebar__header {
          display: flex;
          align-items: center;
          padding: 8px;
          border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
        }

        .sidebar__wordmark {
          display: block;
          width: 100%;
          height: auto;
          max-height: 36px;
          object-fit: contain;
          object-position: left center;
        }
      </style>
    </div>
  `;
}
