import * as pty from 'node-pty';
import * as os from 'os';
import * as vscode from 'vscode';

const shell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL ?? 'bash');

export class PtyManager {
  private ptys = new Map<string, pty.IPty>();

  constructor(private readonly panel: vscode.WebviewPanel) {}

  spawn(sessionId: string, cols: number, rows: number): void {
    if (this.ptys.has(sessionId)) return;

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? os.homedir(),
      env: process.env as Record<string, string>,
    });

    ptyProcess.onData((data) => {
      this.panel.webview.postMessage({ type: 'ptyData', sessionId, data });
    });

    ptyProcess.onExit(({ exitCode }) => {
      this.ptys.delete(sessionId);
      this.panel.webview.postMessage({ type: 'ptyExit', sessionId, exitCode });
    });

    this.ptys.set(sessionId, ptyProcess);
  }

  write(sessionId: string, data: string): void {
    this.ptys.get(sessionId)?.write(data);
  }

  resize(sessionId: string, cols: number, rows: number): void {
    this.ptys.get(sessionId)?.resize(cols, rows);
  }

  kill(sessionId: string): void {
    this.ptys.get(sessionId)?.kill();
    this.ptys.delete(sessionId);
  }

  killAll(): void {
    this.ptys.forEach((p) => p.kill());
    this.ptys.clear();
  }
}
