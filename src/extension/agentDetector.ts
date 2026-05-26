import { execFile } from 'child_process';
import { Agent, AgentAvailability } from '../shared/types';

function probeAgent(agent: Agent): Promise<AgentAvailability> {
  return new Promise((resolve) => {
    const { command, args, expectedExitCode = 0 } = agent.availabilityCheck;

    const child = execFile(
      command,
      args,
      // shell:true lets the OS resolve the binary the same way a terminal would,
      // which matters on Windows where tools installed via npm/scoop/winget may
      // only be on the shell PATH, not the raw process PATH.
      { timeout: 5000, windowsHide: true, shell: true },
      (error) => {
        // execFile error.code is the numeric exit code when the process exits non-zero.
        // When the binary isn't found at all, error.code is 'ENOENT'.
        if (!error) {
          resolve({ agentId: agent.id, available: expectedExitCode === 0 });
          return;
        }

        const exitCode = typeof error.code === 'number' ? error.code : null;
        resolve({
          agentId: agent.id,
          available: exitCode !== null && exitCode === expectedExitCode,
        });
      }
    );

    // Detach so the probe doesn't keep the Node event loop alive.
    child.unref();
  });
}

/**
 * Runs all availability probes concurrently in the background.
 * Returns a Promise that resolves once every probe has settled —
 * individual probe failures never reject the whole batch.
 */
export function detectAgents(agents: Agent[]): Promise<AgentAvailability[]> {
  return Promise.all(agents.map(probeAgent));
}
