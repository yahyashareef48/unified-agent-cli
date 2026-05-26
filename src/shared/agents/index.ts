import { Agent } from '../types';
import claude from './claude';
import codex from './codex';
import antigravity from './antigravity';
import cursor from './cursor';

export const ALL_AGENTS: Agent[] = [claude, codex, antigravity, cursor];

export { claude, codex, antigravity, cursor };
