export interface Agent {
  id: string;
  name: string;
  command: string;
  args?: string[];
  icon: string;
  color: string;
  loadingPattern: RegExp; // present = running, gone = completed
  waitingPatterns: RegExp[]; // TBD
}
