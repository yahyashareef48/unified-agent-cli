export interface AgentAvailabilityCheck {
  command: string;
  args: string[];
  /** Exit code 0 = available. If omitted, any non-throw = available. */
  expectedExitCode?: number;
}

export interface Agent {
  id: string;
  name: string;
  command: string;
  args?: string[];
  icon: string;
  color: string;
  loadingPattern: RegExp;
  waitingPatterns: RegExp[];
  availabilityCheck: AgentAvailabilityCheck;
}

export interface AgentAvailability {
  agentId: string;
  available: boolean;
}
