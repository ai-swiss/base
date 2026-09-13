import { describe, it, expect } from 'vitest';
import { brokerIsAllowed } from '../src/base-core-adapter.js';

describe('brokerIsAllowed — canonical deny policy adherence', () => {
  it('denies by exact target ID', async () => {
    expect(await brokerIsAllowed('blocked-agent', ['blocked-agent'], 'agent')).toBe(false);
    expect(await brokerIsAllowed('other-agent', ['blocked-agent'], 'agent')).toBe(true);
  });

  it('handles typed deny with wildcard prefix (e.g. process:experimental-*)', async () => {
    const deny = ['process:experimental-*'];
    // Process matching the pattern should be denied
    expect(await brokerIsAllowed('experimental-feature', deny, 'process')).toBe(false);
    expect(await brokerIsAllowed('experimental-test-proc', deny, 'process')).toBe(false);
    // Non-matching process should be allowed
    expect(await brokerIsAllowed('stable-feature', deny, 'process')).toBe(true);
    // An agent with same name should NOT be denied by a process-typed rule
    expect(await brokerIsAllowed('experimental-feature', deny, 'agent')).toBe(true);
  });

  it('handles whole-class typed deny (e.g. agent:*)', async () => {
    const deny = ['agent:*'];
    expect(await brokerIsAllowed('any-agent', deny, 'agent')).toBe(false);
    expect(await brokerIsAllowed('any-process', deny, 'process')).toBe(true);
  });

  it('handles untyped wildcard suffix pattern', async () => {
    const deny = ['test-*'];
    expect(await brokerIsAllowed('test-proc', deny, 'process')).toBe(false);
    expect(await brokerIsAllowed('test-agent', deny, 'agent')).toBe(false);
    expect(await brokerIsAllowed('prod-proc', deny, 'process')).toBe(true);
  });
});
