# AI Key Cheat Sheet

**Purpose:** Plain-English map of which API key unlocks which Givebettr/Postiz AI gadget, written for operators who need to wire the live app without re-reading source code.

**Scope:** Native in-app AI surfaces, support AI, AgentMedia handoff, and the public agent ingestion route.

**Current live status:** As of the latest verification pass, the production app does **not** have working in-app AI keys loaded. `OPENAI_API_KEY` exists but is empty; the other AI/provider keys below are absent from the running container.

---

## ELI5 summary

Think of each key as a different power cord.

- `OPENAI_API_KEY` = the **main brain cord**
- `TAVILY_API_KEY` = the **internet research cord**
- `KIEAI_API_KEY` = the **native video cord**
- `FAL_KEY` = the **slideshow image cord**
- `ELEVENSLABS_API_KEY` = the **slideshow voice cord**
- `TRANSLOADIT_AUTH` + `TRANSLOADIT_SECRET` = the **video assembly cords**
- `CHATBASE_TOKEN` = the **support chatbot cord**
- `AGENT_API_KEY` = the **external agent-ingestion cord**
- `AGENT_MEDIA_SSO_KEY` = the **bridge-pass cord** to AgentMedia

---

## Key-by-key cheat sheet

### `OPENAI_API_KEY`
**ELI5:** The main brain cord.

**Unlocks:**
- composer assistant popup
- `/agents`
- native AI image generation
- post writing / rewriting / splitting / prompt creation
- public `/public/agent` ingestion logic (together with `AGENT_API_KEY`)

**Without it:**
Most of the built-in AI stays asleep.

**Priority:**
Highest. This is the first key to roll out.

---

### `TAVILY_API_KEY`
**ELI5:** The internet research cord.

**Unlocks:**
- optional web research augmentation for post generation
- fresher, more current-context writing

**Without it:**
The AI can still write, but mostly from your prompt, model knowledge, and app context.

**Priority:**
Optional. Add only if fresh/current research matters now.

---

### `KIEAI_API_KEY`
**ELI5:** The native video cord.

**Unlocks:**
- native `veo3` video generation inside Postiz

**Without it:**
The simpler native in-app video path will not work.

**Priority:**
Optional but high-value if native video matters.

---

### `FAL_KEY`
**ELI5:** The slideshow image cord.

**Unlocks:**
- image generation step inside the `image-text-slides` video pipeline

**Without it:**
That slideshow-style video path breaks.

**Priority:**
Optional. Only needed if slideshow/explainer videos are a product requirement.

---

### `ELEVENSLABS_API_KEY`
**ELI5:** The slideshow voice cord.

**Unlocks:**
- AI narration / voice generation for the `image-text-slides` video pipeline

**Without it:**
The slideshow pipeline cannot produce the voice component it expects.

**Priority:**
Optional. Only needed with the slideshow pipeline.

---

### `TRANSLOADIT_AUTH`
### `TRANSLOADIT_SECRET`
**ELI5:** The video assembly cords.

**Unlocks:**
- stitching slideshow images, audio, subtitles, and timing into a final rendered video

**Without them:**
The slideshow parts may exist, but they cannot be cleanly assembled into the final video.

**Priority:**
Optional. Only needed with the slideshow pipeline.

---

### `CHATBASE_TOKEN`
**ELI5:** The support chatbot cord.

**Unlocks:**
- Chatbase support widget

**Without it:**
The support/chat widget will not work.

**Important note:**
This is **not** the same thing as the composer assistant or `/agents`.

**Priority:**
Optional. Only add if you want the support widget live.

---

### `AGENT_API_KEY`
**ELI5:** The external dropbox cord.

**Unlocks:**
- public `/public/agent` ingestion route for external machine-to-machine workflows

**Without it:**
That special external automation route stays off.

**Priority:**
Optional. Not needed for normal in-app clicking.

---

### `AGENT_MEDIA_SSO_KEY`
**ELI5:** The bridge-pass cord to AgentMedia.

**Unlocks:**
- automatic handoff/login from Postiz to AgentMedia

**Without it:**
Postiz cannot smoothly pass the user into AgentMedia.

**Priority:**
Optional and later. Keep off unless you intentionally want the hosted AgentMedia handoff.

---

## Minimum useful starter set

If the goal is to wake up in-app AI with the least complexity, start with:

1. `OPENAI_API_KEY`
2. optionally `KIEAI_API_KEY` if native video matters now
3. optionally `TAVILY_API_KEY` if fresh web research matters now

Leave the slideshow stack and AgentMedia keys off until there is a concrete product reason to enable them.

---

## Plain-English rollout order

### Phase 1 — Wake up the main brain
Add:
- `OPENAI_API_KEY`

Then verify:
- composer assistant works
- `/agents` works
- native AI image generation works
- text helpers work

### Phase 2 — Add fresh web research only if needed
Add:
- `TAVILY_API_KEY`

Then verify:
- research-backed post generation can use fresh web context

### Phase 3 — Add native in-app video if wanted
Add:
- `KIEAI_API_KEY`

Then verify:
- `veo3` appears in video options and can generate successfully

### Phase 4 — Add the complex slideshow stack only if truly needed
Add:
- `FAL_KEY`
- `ELEVENSLABS_API_KEY`
- `TRANSLOADIT_AUTH`
- `TRANSLOADIT_SECRET`

Then verify:
- the `image-text-slides` pipeline completes end-to-end

### Phase 5 — Add support AI only if you want the support widget
Add:
- `CHATBASE_TOKEN`

Then verify:
- the Chatbase support widget loads correctly

### Phase 6 — Add external ingestion only if you need machine-to-machine workflows
Add:
- `AGENT_API_KEY`

Then verify:
- `/public/agent` accepts the expected requests

### Phase 7 — Add AgentMedia only if intentionally chosen
Add:
- `AGENT_MEDIA_SSO_KEY`

Then verify:
- the hosted AgentMedia handoff opens with valid SSO context

---

## Secret-handling guidance

Preferred secret-supply path:
- Bitwarden Secrets Manager machine account secrets, or
- approved local Bitwarden wrapper flow

Avoid:
- committing secrets into the repo
- leaving plaintext secrets in docs
- assuming a key is active just because it exists in a file; always verify the running container env too

---

## Related docs
- `docs/givebettr/plans/ai-integration-options-and-activation-plan-2026-06-27.md`
