---
description: Run the full software-factory pipeline for a feature, pausing at the two human gates.
---

You are orchestrating the software factory for this request:

$ARGUMENTS

Follow this sequence exactly. Do not skip steps. Do NOT write or edit any application code until I have approved BOTH the story and the brief.

1. Use the **codebase-researcher** subagent to investigate. Show me its report.
2. Use the **story-writer** subagent to produce the user story from the request plus the research. Show me the story, then STOP and ask: "Approve this story? (reply 'approved' to continue)". Do not proceed until I reply with approval. If I ask for changes, revise via the story-writer and ask again.
3. Once the story is approved, use the **spec-writer** subagent to produce the technical brief. Show me the brief, then STOP and ask: "Approve this brief? (reply 'approved' to continue)". Do not proceed until I reply with approval.
4. Once the brief is approved, use the **backend-builder** subagent for the backend half. Show me its handoff summary.
5. Use the **frontend-builder** subagent for the frontend half, passing it the backend's handoff summary.
6. Use the **test-verifier** subagent to write and run acceptance tests against the approved story. Show me the pass/fail report. If anything failed, route it back to the correct builder, then re-verify.
7. Use the **implementation-validator** subagent for a final read-only review. Show me its findings grouped by severity.

At the end, summarise: what was built, the acceptance-test result, and any Critical or Important findings still open.
