# Software Factory — a Claude Code agent set

A drop-in set of seven specialised subagents plus an orchestration command that
turns a rough feature idea into reviewed, tested code — refusing to build until
the problem is defined and the design is approved.

## What's in here
```
.claude/
  agents/
    codebase-researcher.md      (read-only)  explores before anything is built
    story-writer.md             (read-only)  defines the user story        → GATE 1
    spec-writer.md              (read-only)  writes the technical brief     → GATE 2
    backend-builder.md          (read/write) backend half only
    frontend-builder.md         (read/write) frontend half only
    test-verifier.md            (read/write) acceptance tests only
    implementation-validator.md (read-only)  independent final review
  commands/
    feature.md                  the /feature pipeline with the two human gates
CLAUDE.md                       standing rules + project specifics to fill in
```

## Install
1. Copy the `.claude/` folder and `CLAUDE.md` into the root of your repo.
2. Open `CLAUDE.md` and fill in the "Project specifics" block (folders, test/lint/
   typecheck commands, stack). The agents read these.
3. Open Claude Code in the repo. Verify the agents loaded with `/agents`.

## Run it
```
/feature add a "remember me" checkbox to the login form
```
The orchestrator runs the researcher, then the story-writer, then **stops** for your
approval. Reply `approved` to continue to the spec, which **stops** again for approval.
Only then do the builders, verifier, and validator run. At the end you get a summary
plus any Critical/Important findings.

You can also invoke any agent on its own, e.g. "use the codebase-researcher to map how
auth works", or "use the implementation-validator to review the current diff".

## How the guarantees actually work (be honest with your director)
- **Read-only is real and tool-enforced.** The researcher, story-writer, spec-writer,
  and validator have no Edit/Write/Bash tools, so they *cannot* modify code. This is the
  load-bearing guarantee: your reviewer literally can't mark its own homework.
- **Backend/frontend separation is instruction-enforced, not path-locked.** The `tools`
  field grants tool *types*, not folders. The builders are told to stay in their lane,
  and each runs in its own context so they don't trip over each other — but vanilla
  config does not physically block a stray write. To hard-lock paths, add a PreToolUse
  hook that rejects edits outside the agent's folder (see "Hardening" below).
- **Orchestration is not automatic.** Claude Code doesn't enforce the 1→7 order by
  itself. The `/feature` command and `CLAUDE.md` are what wire it; the two gates work
  because the command tells the orchestrator to stop and wait for your word.

## Hardening (optional, later)
- **Hard path locks:** add a `PreToolUse` hook on Edit/Write that blocks paths outside
  the active agent's allowed folders.
- **Model pinning:** add `model: opus` (or `sonnet`/`haiku`/`inherit`) to an agent's
  frontmatter to put your strongest model on spec + validation and a cheaper one on the
  mechanical steps.
- **CI gate:** run the validator in CI so its report blocks merge, not just the local run.

## Note
Subagent and slash-command formats have been evolving. If `/agents` shows an error or a
field isn't recognised, check the current format at
https://docs.claude.com/en/docs/claude-code/overview and adjust the frontmatter — the
structure here (one markdown file per agent, `name`/`description`/`tools` frontmatter,
body = system prompt) is the shape to expect.
