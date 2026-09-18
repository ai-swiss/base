# 10 · Manual acceptance probes

> **For maintainers.** Live-model evidence for the installed release surface, kept distinct from deterministic gates and process evaluation.
>
> Owns: FR-PROBE-*

## 1. Boundary

A model probe answers one question: does a real coding harness, launched in a clean user-shaped
folder, follow the entry point and observable BASE workflow? It complements rather than extends
`@ai-swiss/base-eval`. The eval package runs a declared process through BASE's controlled broker
harness; a probe launches an explicitly selected external harness against a packed installation.

The command is deliberately outside the public `base` CLI. It is maintainer tooling, invoked as
`npm run probes`. It never runs from `check`, `check:release`, CI or a timer. Without `--yes` it
only prints the selected work, timeout, evidence location, harness, model, effort and maximum spend
when the harness can enforce one. An actual run requires those decisions explicitly.

## 2. Reproducible subject

One run atomically reserves `.temp/probes/<UTC>_<suite>_<revision>/`; simultaneous runs that land in
the same millisecond receive an ordinal suffix. An existing recording is never reused. The runner
packs the current checkout, records the archive's SHA-256 and installs that archive into the run
directory. A scenario therefore observes the publishable package, not imports from the contributor
checkout. MCP scenarios similarly build, pack and install `@ai-swiss/base-mcp`. A scenario that
needs optional rendered documentation declares the `docs-site` companion explicitly; only those
selections pack and install `@ai-swiss/base-docs-site`. Other suites pay none of those companion
costs.

Each attempt receives a fresh root under the operating system's temporary directory, outside the
contributor repository and its parent git context. Its final state is copied back into the dated
evidence directory before the disposable root is removed. An `example` setup copies its named
example from the installed core. An `init` setup invokes the installed `base` executable. A
`package` setup copies the complete installed core, which represents a person pointed at the
repository. A setup may add new input files, such as an approved brief or a recorded friction, but
those paths cannot escape the root, replace packaged material, or enter `.git` and `node_modules`.
`BASE_CONFIG_HOME` points inside the disposable attempt so machine configuration cannot supply a
framework path or other BASE setting.

The selected harness still uses the operator's authentication. Its unrelated user settings do not
enter the run. The Claude Code adapter runs in restricted mode, refuses unrelated MCP servers and
creates no resumable session. The Codex adapter ignores user configuration, runs ephemerally
without approval prompts and injects only the BASE MCP server when required. `read-only` scenarios
receive only file readers or the three BASE MCP readers. `base-read` additionally permits the
public `base discover` and `base open` commands, so a local factual question can prove
section-level retrieval without general shell access. A scenario that must create reviewed
artifacts declares `workspace-write`. Claude Code then receives file tools and a closed list of BASE
validation, build, review and mediated-write commands. A blocking pre-tool hook rejects every other
shell command, shell composition and escaping path before permission handling. Codex receives its
workspace sandbox with network and multi-agent execution disabled. MCP scenarios stay read-only.
`web-read` exposes only the harness's public web reader and is reserved for post-publication
qualification.
When an initialized root's generated fallback points into the installed framework, Claude Code may
read that exact package directory through `--add-dir`; the contributor checkout stays outside its
readable surface.
The runner selects the matching entry point at initialization: `CLAUDE.md` for Claude Code,
`AGENTS.md` for Codex.

## 3. Contracts and evidence

Suites and scenarios are committed because they are the non-regression contract. Results are
ignored because they contain local paths, model text and potentially sensitive debugging evidence.
Their schemas are closed: a misspelled expectation fails before spending money instead of silently
weakening a probe.

Expectations inspect normalized events:

- `tool_call`, optionally by exact name or suffix;
- `file_read`, by path suffix or regular expression;
- `command`, by contained text or regular expression, with successful completion when the workflow
  depends on the result rather than the attempt;
- `final_answer`, by contained text, regular expression, exact question-mark count or a maximum
  Unicode-character count when proportionate depth is itself part of the contract;
- `file_added`, `file_modified` and `file_removed`, from before/after content hashes;
- `file_content`, for changed UTF-8 files up to 512 KiB, so a contract can verify the artifact
  itself without mistaking its path for its contents; binary and larger files remain hash-proven;
- `web_read`, normalized from the selected harness's public web reader;
- a minimum occurrence count when a synthesis must open more than one source;
- ordered sequences of those events.

Every expectation is either required or forbidden. The raw harness JSONL remains beside the
normalized stream, so a maintainer can challenge the verdict.

Qualities without one legitimate wording, such as an honest boundary, a useful clarifying question
or a plain-language explanation, use a versioned semantic rubric instead of a response regex. After
the deterministic checks pass, a fresh invocation of the selected harness and model receives only
the user's request, the final answer and those criteria. It has no tools. For every criterion it
must return a boolean, a reason and an exact contiguous quote from the answer; the runner rejects a
missing criterion, malformed output or invented quote. This judgement can fail an attempt but can
never turn a failed command, missing source, wrong order or changed file into a pass. Both traces
remain available for review. A fresh judge reduces conversational self-justification; it does not
turn subjective quality into a deterministic guarantee. Repetition and maintainer review remain
part of release acceptance.

## 4. Recording and failure semantics

`run.json` names the revision, dirty state, requested model, explicit budget and timeout, selected
contracts and their complete definitions, OS, architecture, Node, npm and selected harness versions,
then the package hashes. Each
attempt keeps stdout, stderr, normalized events, a result and before/after content hashes with the
added, removed and modified paths. The result extracts cost, usage, session id and model usage when
the harness reports them. `summary.json` is machine-readable; `summary.md` is the short human review.

A scenario setup or invocation failure becomes that attempt's failed `result.json`; later attempts
still run. A failure that prevents the shared runtime from existing marks the top-level run as
`error`. The process exits 0 only when every attempt passes, 1 for scenario failures and 2 for a
configuration, preparation or trace error outside an attempt.

## 5. User journeys under observation

The contracts are written from the person's side of the conversation:

- **A newcomer is pointed at the repository.** The assistant starts from the root README, may inspect
  a concrete example, and explains in plain language what changes for a small team and what BASE
  does not do. The answer must present adoption as starting from work the team already understands,
  with BASE or the AI tool helping to organize an inspectable and improvable shared method, not from
  learning a technical agent format. It must also convey why procedures, knowledge, authoritative
  sources, controls and human decisions have distinct roles. The separate creation journey verifies
  the complete sequence from proposed structure and human approval through use, verification and
  improvement. After publication, the same first-contact question is asked against the immutable
  release URL.
- **A team starts from an approved plan.** The assistant creates one useful workflow, verifies its
  route and produces static HTML that colleagues can review; the agreed brief remains untouched.
- **A working team reports recurring friction.** The assistant reads the operational signals,
  produces an interactive improvement sheet and changes no workflow or business document before
  the team's decisions return.
- **A small business checks a discount.** The assistant reads the customer record and pricing rule,
  answers directly, cites both sources and leaves the commercial interpretation marked for human
  validation.
- **A request falls outside the assistant's role.** The assistant says so without inventing an
  answer and asks one useful follow-up question.
- **A person explicitly asks for a quote.** The request reaches the quote workflow, uses the known
  customer context and asks only for the missing business information.
- **A requested change contradicts the folder.** The assistant names the evidence and waits for
  confirmation; the workspace remains unchanged.
- **A newcomer initializes a folder in French, English, German or Italian.** They ask to import
  existing procedures in ordinary words and receive a short, jargon-free request for the documents.
- **An organization connects through MCP.** The client answers a precise fact, synthesizes a
  question across multiple opened passages and admits when the corpus contains no requested
  procedure. Its answers carry citable section references and use no direct filesystem escape. A
  separate request for a confidential pricing grid must reveal none of its rates.
- **A maintainer chooses a supported harness.** The same scenario contracts run through its native
  entry point and normalize into the same evidence vocabulary.

These journeys cover different organizations without inventing institution-specific examples. A
university procedure, a laboratory protocol and an SME checklist all exercise the same promises:
find the right method, read only useful evidence, remain honest about limits and keep consequential
decisions with a person.

## 6. Shipped suites

`smoke` is the shortest useful confidence check: the quote-demo factual answer with both sources,
honest abstention, and routing from a freshly initialized French root.

`release` adds repository first contact, an ordinary quote request, guided configuration, creation
of an approved team workflow with HTML review, friction intake, evidence-based improvement
planning, ambiguous and forced routing, a source contradiction that must wait for confirmation,
fresh English, German and Italian roots, local section retrieval, precise and cross-source MCP
questions, missing knowledge, and confidential-data withholding through that same public surface.
Repetition is selected by the maintainer; the runner reports attempts individually and never lets
an average hide a failure.

`public` runs only after publication. Its empty local root prevents repository files from answering
by accident; the harness must read the immutable GitHub release URL. This proves the path a person
actually takes when sharing a link, while keeping an external network failure distinct from the
pre-release package verdict.
