// Deterministic synthetic corpus for benchmarks and scale tests. No randomness, so results are
// reproducible: each agent and process carries a unique, searchable token derived from its indices.

export function syntheticResources(agentCount, processesPerAgent) {
  const resources = [];
  for (let a = 0; a < agentCount; a++) {
    const dir = `.ai/agents/domain-${a}`;
    // `d${a}` / `t${a}x${p}` are single opaque tokens (no separators), so a query for one is highly
    // selective — exactly what lets the postings index touch a handful of documents, not the whole set.
    resources.push({
      id: `domain-${a}`,
      type: "agent",
      title: `Domaine ${a}`,
      description: `Agent synthétique du domaine d${a}.`,
      keywords: [`d${a}`],
      path: `${dir}/AGENT.md`,
      use_when: `Quand la demande concerne le domaine d${a}.`,
      metadata: {},
      body: "",
    });
    for (let p = 0; p < processesPerAgent; p++) {
      resources.push({
        id: `process-${a}-${p}`,
        type: "process",
        title: `Process ${a}-${p}`,
        description: `Process synthétique du domaine d${a}.`,
        keywords: [`t${a}x${p}`],
        path: `${dir}/skills/processes/process-${a}-${p}/SKILL.md`,
        use_when: `Quand l'utilisateur demande la tâche t${a}x${p}.`,
        metadata: {},
        body: "",
      });
    }
  }
  return resources;
}

// A minimal `deriveSignals` for the benchmark CLI when @ai-swiss/base is not importable. Tests and
// real builds inject BASE's canonical `deriveRoutingSignals`; this only feeds latency measurements.
export function minimalDeriveSignals(resource) {
  const match = String(resource.path ?? "").match(/(^|.*\/)\.ai\/agents\/([^/]+)\//);
  const agent = match && !match[2].startsWith("_") ? `${match[1]}.ai/agents/${match[2]}` : null;
  return {
    route_text: resource.use_when || resource.description || resource.title || resource.id || "",
    avoid_text: "",
    route_scope: resource.type === "process" ? "process" : "agent",
    agent_path: agent,
    reasons: ["route_text:use_when"],
  };
}
