# AI Integration Options and Activation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Identify every AI-powered feature in Givebettr/Postiz, map the provider and configuration requirements for each, compare vendor options including OpenRouter scenarios, and define the safest activation plan so in-app assistants, agents, media generation, and external AI integrations all work reliably.

**Architecture:** Postiz currently has two distinct AI surfaces: **native in-app AI** implemented directly in the app code, and **external AI clients** that can drive Postiz through MCP, CLI, or Public API. Native in-app AI is currently coupled to specific providers in code. OpenRouter is best treated as a separate external-agent lane first, with native in-app OpenRouter support as an optional engineering track.

**Tech Stack:** Postiz monorepo (Next.js frontend, NestJS backend, shared libraries), OpenAI SDK, Mastra/CopilotKit, LangChain, FAL, ElevenLabs, Transloadit, Kie.ai, Chatbase, AgentMedia, MCP, Public API, CLI.

---

## Grounded source set

### Docs reviewed
- `https://docs.postiz.com/configuration/reference`
- `https://docs.postiz.com/public-api/oauth`
- `https://docs.postiz.com/installation/development`
- `https://docs.postiz.com/developer-guide`
- `https://docs.postiz.com/mcp/introduction`
- `https://docs.postiz.com/cli/introduction`
- `https://docs.postiz.com/public-api/introduction`
- OpenRouter docs:
  - `https://openrouter.ai/docs/quickstart`
  - `https://openrouter.ai/docs/guides/community/openai-sdk`
  - `https://openrouter.ai/docs/guides/overview/multimodal/image-generation`
  - `https://openrouter.ai/docs/guides/overview/multimodal/overview`

### Code reviewed
- `apps/backend/src/api/routes/copilot.controller.ts`
- `apps/backend/src/api/routes/public.controller.ts`
- `apps/backend/src/api/routes/users.controller.ts`
- `apps/backend/src/api/routes/posts.controller.ts`
- `apps/frontend/src/components/new-launch/manage.modal.tsx`
- `apps/frontend/src/components/agents/agent.chat.tsx`
- `apps/frontend/src/components/layout/agent.media.modal.tsx`
- `apps/frontend/src/components/layout/chatbase.component.tsx`
- `apps/frontend/src/components/launches/ai.video.tsx`
- `apps/frontend/src/components/launches/polonto/polonto.picture.generation.tsx`
- `libraries/nestjs-libraries/src/chat/load.tools.service.ts`
- `libraries/nestjs-libraries/src/openai/openai.service.ts`
- `libraries/nestjs-libraries/src/openai/fal.service.ts`
- `libraries/nestjs-libraries/src/database/prisma/media/media.service.ts`
- `libraries/nestjs-libraries/src/videos/images-slides/images.slides.ts`
- `libraries/nestjs-libraries/src/videos/veo3/veo3.ts`
- `libraries/nestjs-libraries/src/agent/agent.graph.service.ts`
- `libraries/nestjs-libraries/src/agent/agent.graph.insert.service.ts`
- `.env.example`

### Live production env snapshot reviewed
Verified two live sources:
- config file: `/opt/postiz/live/postiz.env`
- running container env: `docker inspect postiz`

Current verified state:
- `OPENAI_API_KEY` exists but is **empty** in both the file and the running container
- the running `postiz` container does **not** currently expose `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `XAI_API_KEY`, `MISTRAL_API_KEY`, `DEEPSEEK_API_KEY`, `ELEVENSLABS_API_KEY`, `TAVILY_API_KEY`, `KIEAI_API_KEY`, `FAL_KEY`, `TRANSLOADIT_AUTH`, `TRANSLOADIT_SECRET`, `CHATBASE_TOKEN`, `AGENT_API_KEY`, or `AGENT_MEDIA_SSO_KEY`

Interpretation:
- the AI/provider keys I previously treated as present are **not actually in the active live configuration**
- as of this verification pass, the live app should be treated as **unconfigured for in-app AI** until your real keys are loaded from your secret source

---

## Hard truths before choosing a stack

1. **Postiz is configured by env vars and requires restarts after changes.**
2. **MCP/CLI/Public API do not require Postiz itself to run your model provider.** They let an external AI client drive Postiz.
3. **Native in-app AI features are currently provider-coupled in code.** Most of the text/chat/image features are hardwired to OpenAI SDK usage and fixed model names.
4. **The current live app is not actually wired to working in-app AI credentials yet.** The active container only shows an empty `OPENAI_API_KEY` and no other AI/provider envs.
5. **Before choosing an architecture, first load your real keys from your secret source into the correct env slots for each gadget.**
6. **The docs + `.env.example` do not fully enumerate the AI vendor env surface used by the current code.** The repo code relies on additional keys like `FAL_KEY`, `ELEVENSLABS_API_KEY`, `TRANSLOADIT_*`, `KIEAI_API_KEY`, `AGENT_MEDIA_SSO_KEY`, `CHATBASE_TOKEN`, and `AGENT_API_KEY`.

---

## Feature inventory: what actually requires AI/provider configuration

| Feature | User-facing surface | Current provider path in code | Required env/config | Current live state |
|---|---|---|---|---|
| Composer assistant | Bottom-right helper while editing a post | OpenAI via CopilotKit `OpenAIAdapter(model: gpt-4.1)` | `OPENAI_API_KEY` | **Not configured** — active container has `OPENAI_API_KEY` empty |
| `/agents` workspace | Full agent UI at `/agents` | OpenAI + Mastra agent (`openai('gpt-5.2')`) | `OPENAI_API_KEY` + org AI entitlement | **Not configured** — `OPENAI_API_KEY` empty, entitlement still to be checked after keys are loaded |
| Native AI image generation | “AI Img” / image generation UI | OpenAI image API (`chatgpt-image-latest`) | `OPENAI_API_KEY` | **Not configured** — `OPENAI_API_KEY` empty |
| Post generation / rewrite / split / prompt creation | Post generator + text helper paths | OpenAI chat models (`gpt-4.1`, `gpt-4o-2024-08-06`) + optional Tavily research | `OPENAI_API_KEY`, optional `TAVILY_API_KEY` | **Not configured** for core text generation; optional research also **not configured** |
| Native AI video: `image-text-slides` | In-app video generator option | OpenAI + FAL + ElevenLabs + Transloadit | `OPENAI_API_KEY`, `FAL_KEY`, `ELEVENSLABS_API_KEY`, `TRANSLOADIT_AUTH`, `TRANSLOADIT_SECRET` | **Not configured** — every required key is absent/empty |
| Native AI video: `veo3` | In-app video generator option | Kie.ai Veo 3 endpoint | `KIEAI_API_KEY` | **Not configured** — `KIEAI_API_KEY` absent |
| AgentMedia handoff | Modal -> external UGC product | AgentMedia SSO | `AGENT_MEDIA_SSO_KEY` | **Not configured** — SSO key absent |
| Public `/public/agent` ingestion | External automation hook | OpenAI categorization/classification | `AGENT_API_KEY`, `OPENAI_API_KEY` | **Not configured** — both required envs absent/empty |
| Chatbase support AI | Support/chat widget | Chatbase token-based embed | `CHATBASE_TOKEN` | **Not configured** — token absent |
| MCP | External AI client control plane | User-supplied model outside Postiz | Postiz API key or OAuth token; no model key required by Postiz for MCP itself | Available independently of in-app AI keys |
| CLI | External automation shell | User/client side | `POSTIZ_API_URL` + API key or OAuth login | Available independently of in-app AI keys |
| Public API + OAuth apps | External automation/app integrations | User/client side | Postiz API key or OAuth app config | Available independently of in-app AI keys |

### Verified live key status (current production)

| Env key | Gadget(s) it affects | Verified live state |
|---|---|---|
| `OPENAI_API_KEY` | composer assistant, `/agents`, native image generation, text helpers, public agent | **Present but empty** |
| `TAVILY_API_KEY` | optional research augmentation | **Absent** |
| `KIEAI_API_KEY` | native `veo3` video generation | **Absent** |
| `FAL_KEY` | slideshow video image generation | **Absent** |
| `ELEVENSLABS_API_KEY` | slideshow video voice generation | **Absent** |
| `TRANSLOADIT_AUTH` | slideshow video assembly | **Absent** |
| `TRANSLOADIT_SECRET` | slideshow video assembly | **Absent** |
| `CHATBASE_TOKEN` | Chatbase support widget | **Absent** |
| `AGENT_API_KEY` | `/public/agent` ingestion | **Absent** |
| `AGENT_MEDIA_SSO_KEY` | AgentMedia handoff | **Absent** |
| `OPENROUTER_API_KEY` | no current native in-app path; future external-agent or custom path | **Absent from live app config** |
| `ANTHROPIC_API_KEY` / `GROQ_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` / `XAI_API_KEY` / `MISTRAL_API_KEY` / `DEEPSEEK_API_KEY` | no current native in-app path in this codebase | **Absent from live app config** |

This means the current AI envs are not "mystery working keys" already deployed behind the scenes. The live app should be treated as needing a fresh, explicit rollout of **your** provider keys.

---

## Provider options by feature

## 1) Composer assistant

### Current provider options in code
- **OpenAI only**

### Why
- `apps/backend/src/api/routes/copilot.controller.ts` uses `OpenAIAdapter`
- model is hardcoded to `gpt-4.1`
- no provider switch or base URL override exists in current code

### Pros
- Lowest implementation risk
- Fits the current code with no provider-abstraction rewrite
- No code changes needed once your real key is loaded

### Cons
- No multi-provider failover
- No routing by cost/latency
- No OpenRouter/Anthropic/Groq option without code changes

### Recommendation
- **Short-term:** keep **OpenAI** for the composer assistant.
- **OpenRouter scenario:** only pursue for this feature if you explicitly want to engineer provider abstraction into the app.

---

## 2) `/agents` workspace

### Current provider options in code
- **OpenAI only**

### Why
- `libraries/nestjs-libraries/src/chat/load.tools.service.ts` creates the Mastra agent with `openai('gpt-5.2')`
- `/copilot/agent` still uses `OpenAIAdapter(model: 'gpt-4.1')`

### Pros
- Already integrated with CopilotKit + Mastra stack
- Strong capability for tool use and scheduling workflows

### Cons
- Current implementation is provider-coupled in two layers
- Harder than the composer assistant to swap because both the transport/runtime layer and Mastra agent layer assume OpenAI

### Recommendation
- **Short-term:** keep **OpenAI**.
- **Medium-term optional engineering track:** abstract the runtime/model selection so this can target OpenRouter or another provider.

---

## 3) Native AI image generation

### Current provider options in code
- **OpenAI only**

### Why
- `libraries/nestjs-libraries/src/openai/openai.service.ts` calls `openai.images.generate` with `chatgpt-image-latest`
- image prompt expansion also uses OpenAI chat models

### Pros
- Single-vendor simplicity
- Fits the current code path once your real key is installed
- Lowest engineering effort

### Cons
- No model marketplace/fallbacks
- Locked to OpenAI image API shape

### Recommendation
- **Short-term:** keep **OpenAI** for native in-app image generation.
- **Optional future:** add an image-provider abstraction if you want OpenRouter image models or direct FAL image generation in-app.

---

## 4) Post generation / rewrite / research helpers

### Current provider options in code
- **OpenAI** for text generation/reformatting
- **Optional Tavily** for web research augmentation

### Why
- `agent.graph.service.ts`, `agent.graph.insert.service.ts`, and `openai.service.ts` all rely on OpenAI models
- Tavily is only used as an optional search tool when `TAVILY_API_KEY` exists

### Pros
- Good quality text generation
- Tavily can improve research freshness

### Cons
- Tavily adds another vendor dependency
- OpenAI-only model path again blocks provider flexibility

### Recommendation
- **Short-term:** keep **OpenAI + Tavily**.
- If cost becomes an issue, this is one of the best candidates for an **OpenRouter-first engineering migration**, because text/chat is the easiest current surface to move behind an OpenAI-compatible base URL.

---

## 5) Native AI video: `image-text-slides`

### Current provider options in code
This is a **multi-vendor pipeline**, not a single-provider feature:
- **OpenAI**: break prompt into slide plan / prompt text
- **FAL**: generate slide images (`ideogram/v2` path in current code)
- **ElevenLabs**: generate voice audio
- **Transloadit**: stitch video + subtitles

### Pros
- Modular pipeline
- Potentially cheaper than premium cinematic video generators
- Good for templated explainer/slideshow content

### Cons
- Highest operational complexity
- Four external dependencies for one feature
- More failure points, more rate-limit surfaces, more billing surfaces
- Currently disabled in production because none of its required keys are loaded yet

### Recommendation
- **Only enable if you specifically want slideshow-style videos.**
- If enabled, document it as a brittle multi-vendor path and add explicit health checks.

---

## 6) Native AI video: `veo3`

### Current provider options in code
- **Kie.ai only** in current implementation

### Why
- `libraries/nestjs-libraries/src/videos/veo3/veo3.ts` directly calls Kie.ai Veo endpoints

### Pros
- Simpler than the slideshow pipeline
- Single provider for a premium video path
- Lower operational complexity than the multi-vendor slideshow stack

### Cons
- Vendor lock-in
- Async generation latency
- Premium-generation cost profile

### Recommendation
- **Use this as the primary native in-app video feature** if the goal is a simpler supportable stack.
- Keep `image-text-slides` as optional only if it serves a specific content need.

---

## 7) AgentMedia handoff

### Current provider options in code
- **AgentMedia only**

### Why
- `apps/frontend/src/components/layout/agent.media.modal.tsx` explicitly describes it as a separate product with separate pricing
- backend requires `AGENT_MEDIA_SSO_KEY`

### Pros
- Productized UGC/video workflow
- Separate account/pricing can isolate billing from core app

### Cons
- Not part of native Postiz credits
- Separate vendor/account to manage
- Currently disabled because SSO key is missing

### Recommendation
- Treat AgentMedia as an **optional adjacent product**, not a core dependency for the main app AI stack.

---

## 8) Chatbase support AI

### Current provider options in code
- **Chatbase only**

### Pros
- Separate from core content-generation stack
- Optional support AI lane if you intentionally supply a token

### Cons
- Separate support AI vendor to manage
- Not the same as the composer assistant or `/agents`

### Recommendation
- Keep if support/chat value is real.
- Do not confuse it with the app's native creation assistants.

---

## 9) MCP / CLI / Public API / OAuth apps

### Current provider options
- **Any external model provider you choose outside Postiz**
- This is where **OpenRouter** shines immediately

### Why
- Postiz MCP docs explicitly say Postiz does **not** need an OpenAI key for MCP itself
- the AI client supplies the model
- CLI and Public API are just automation/control surfaces

### Pros
- No app code changes required
- Best path for OpenRouter experimentation
- Lets you use many models/providers without destabilizing native Postiz UI

### Cons
- Separate from the in-app assistant/agent UX
- You must build or run the external client/orchestrator yourself

### Recommendation
- **Best immediate OpenRouter scenario:** use **OpenRouter + MCP/Public API** for external agents and advanced automations.

---

## OpenRouter evaluation by scenario

## Scenario A — Native in-app AI only (no app code changes)

### What it means
Keep Postiz UI-native AI features on their current providers.

### Recommended stack
- Composer assistant: OpenAI
- `/agents`: OpenAI
- Image generation: OpenAI
- Text/research helpers: OpenAI + Tavily
- Video: Kie.ai as primary, slideshow pipeline optional
- AgentMedia: optional, separate product
- Chatbase: optional support AI

### Pros
- Lowest implementation risk
- Fastest to stabilize
- Aligns with current code

### Cons
- No OpenRouter benefit inside native UI
- Mixed vendor surface for video/support

### Recommendation
- **This should be the baseline activation plan.**

---

## Scenario B — OpenRouter for external agents, native UI unchanged

### What it means
Use OpenRouter for your own external AI clients while Postiz native UI keeps its current providers.

### Where OpenRouter fits immediately
- custom automations using **MCP**
- custom automations using **Public API**
- custom scripts via **CLI**
- future custom internal agents outside the Postiz UI

### Pros
- Immediate access to many models
- Low risk to production UI
- Great for trying text, vision, image, and video-capable models without rewriting Postiz first
- OpenRouter is OpenAI-compatible for many text/chat use cases

### Cons
- In-app Postiz assistant/agent still remain on OpenAI
- Native image/video tools still use their own vendors

### Price/performance recommendation
- **Best overall recommendation if you want OpenRouter now.**
- Use OpenRouter for external agent workflows first, while keeping native UI stable.

---

## Scenario C — Engineer OpenRouter into Postiz-native text/chat surfaces

### What it means
Modify Postiz so the composer assistant, `/agents`, and text-generation services can use OpenRouter instead of direct OpenAI.

### Feasibility
- **Text/chat surfaces:** feasible, because OpenRouter documents OpenAI SDK compatibility via `baseURL: https://openrouter.ai/api/v1`
- **Image generation:** possible, but not drop-in identical in current code because OpenRouter exposes a dedicated images API that would need explicit integration work
- **Video generation:** not a drop-in fit for the current native video stack; OpenRouter would be a new implementation, not a simple env swap

### Pros
- Provider flexibility inside the app
- central model routing and fallback options
- better cost tuning for text workflows

### Cons
- Requires real engineering work and testing
- more abstraction complexity
- image/video still need separate design decisions

### Recommendation
- Do this **only after** the baseline native stack is stable.
- Prioritize **text/chat** first if you pursue it.

---

## Vendor pros/cons and recommendations

| Vendor / service | Best use in current system | Pros | Cons | Recommendation |
|---|---|---|---|---|
| OpenAI | Native assistant, agents, text generation, native image generation | Already integrated, lowest risk, strong quality | Cost, vendor lock-in, no multi-provider routing | **Primary native provider** |
| OpenRouter | External MCP/API/CLI agents now; optional future native text/chat abstraction | Huge model choice, routing, fallbacks, competitive pricing, multimodal support | Not wired into native Postiz today; image/video need engineering choices | **Best external-agent provider** |
| Tavily | Optional research augmentation | Better fresh web context | Extra vendor/billing | Keep only where research quality matters |
| FAL | Image generation inside slideshow video pipeline | Specialized media infra | Extra vendor dependency; currently missing | Enable only if slideshow videos matter |
| ElevenLabs | Voice generation for slideshow video pipeline | Strong voice quality | Separate cost/vendor | Keep only if slideshow videos enabled |
| Transloadit | Media assembly/subtitles for slideshow pipeline | Mature media pipeline | Extra vendor dependency | Keep only if slideshow videos enabled |
| Kie.ai | Native Veo3 video generation | Simpler single-vendor premium video path | Vendor lock-in, premium cost | **Primary native video path** |
| AgentMedia | External UGC/video workflow | Productized separate workflow | Separate account/billing, SSO dependency | Optional adjacent product |
| Chatbase | Support AI widget | Separate support experience | Separate vendor, easy to confuse with native assistant | Optional, keep separate in docs and UX |

---

## Recommended target architecture

## Recommended default stack

### Core native in-app AI
- **OpenAI** for:
  - composer assistant
  - `/agents`
  - post generation / text transformations
  - native image generation
- **Tavily** for optional research augmentation
- **Kie.ai** for primary native video generation

### Optional extras
- **Chatbase** for support AI
- **AgentMedia** for separate UGC workflow
- **FAL + ElevenLabs + Transloadit** only if slideshow videos are a product priority

### External advanced automation lane
- **OpenRouter + Postiz MCP/Public API/CLI**

This gives you:
- a stable native app stack
- a flexible external AI stack
- no forced rewrite before you learn what users actually want

---

## Current production gaps to close first

1. **Load your real provider keys into the live app.**
   - the active container currently has no working in-app AI credentials
   - use your secret source (preferably Bitwarden Secrets Manager / local Bitwarden access, not chat-pasted secrets)
2. **Document the hidden AI env surface.**
   - `.env.example` currently does not fully describe the AI dependency set used by the code
3. **Configure each gadget intentionally rather than assuming one key enables all of AI.**
   - OpenAI powers: composer assistant, `/agents`, native image generation, text helpers, public agent
   - Tavily powers: optional web research augmentation
   - Kie.ai powers: native `veo3`
   - FAL + ElevenLabs + Transloadit power: `image-text-slides`
   - Chatbase powers: support widget
   - AgentMedia SSO powers: AgentMedia handoff only
4. **Separate “native AI”, “support AI”, and “external AI clients” in product docs.**
   - users should not confuse Chatbase, AgentMedia, composer assistant, `/agents`, MCP, and Public API
5. **Defer AgentMedia self-host evaluation until the core gadgets are configured.**
   - based on the current evidence, treat “self-host AgentMedia with your own provider keys” as a future evaluation task/hypothesis, not a current assumption

---

## Implementation plan

### Task 1: Create a canonical AI feature inventory doc

**Objective:** Freeze a durable map of every AI surface, provider, env requirement, and current live status.

**Files:**
- Keep/update: `docs/givebettr/plans/ai-integration-options-and-activation-plan-2026-06-27.md`
- Create later if needed: `docs/givebettr/inventories/ai-feature-config-inventory.md`

**Steps:**
1. Copy this plan into a durable canonical location if it is later superseded.
2. Add a small appendix with exact env key names and whether each is documented in `.env.example`.
3. Cross-link from readiness docs if AI activation becomes a launch dependency.

**Verification:**
- A maintainer can answer “what uses which provider?” from docs alone.

---

### Task 2: Normalize env documentation

**Objective:** Make repo docs match the actual AI-related env surface the code uses.

**Files:**
- Modify: `.env.example`
- Modify or create: `docs/givebettr/plans/ai-integration-options-and-activation-plan-2026-06-27.md`
- Optional modify: docs referencing configuration/env setup

**Env keys to document explicitly:**
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- `FAL_KEY`
- `ELEVENSLABS_API_KEY`
- `TRANSLOADIT_AUTH`
- `TRANSLOADIT_SECRET`
- `KIEAI_API_KEY`
- `AGENT_MEDIA_SSO_KEY`
- `CHATBASE_TOKEN`
- `AGENT_API_KEY`

**Verification:**
- A fresh operator can configure AI features without reading source code.

---

### Task 3: Roll out your real keys across each gadget

**Objective:** Replace the effectively-empty live AI configuration with your real provider credentials, sourced from your secret manager rather than chat.

**Files / runtime:**
- Runtime: `/opt/postiz/live/postiz.env`
- Secret source: Bitwarden Secrets Manager / local Bitwarden access
- Runtime validation: `docker inspect postiz`

**Key mapping by gadget:**
- Composer assistant, `/agents`, native image generation, text helpers, public agent:
  - `OPENAI_API_KEY`
- Optional research augmentation:
  - `TAVILY_API_KEY`
- Native `veo3` video:
  - `KIEAI_API_KEY`
- Slideshow `image-text-slides` video:
  - `FAL_KEY`
  - `ELEVENSLABS_API_KEY`
  - `TRANSLOADIT_AUTH`
  - `TRANSLOADIT_SECRET`
  - plus `OPENAI_API_KEY`
- Chatbase support widget:
  - `CHATBASE_TOKEN`
- Public `/public/agent` ingestion:
  - `AGENT_API_KEY`
- AgentMedia handoff (only if intentionally enabled later):
  - `AGENT_MEDIA_SSO_KEY`

**Steps:**
1. Pull the real secrets from your approved secret source.
2. Write only the keys you want enabled now into `/opt/postiz/live/postiz.env`.
3. Restart the stack.
4. Re-check the running container env, not just the file, to confirm the keys actually reached the live process.

**Verification:**
- `docker inspect postiz` shows the intended keys present and non-empty.
- No secrets are committed to the repo.

---

### Task 4: Stabilize the baseline native AI stack

**Objective:** Bring up the minimum useful in-app AI set with your own keys.

**Files / runtime:**
- Runtime: `/opt/postiz/live/postiz.env`
- Backend: `apps/backend/src/api/routes/copilot.controller.ts`
- Shared services: `libraries/nestjs-libraries/src/openai/openai.service.ts`
- Video: `libraries/nestjs-libraries/src/videos/veo3/veo3.ts`

**Recommended minimum starting set:**
1. `OPENAI_API_KEY`
2. `KIEAI_API_KEY` if you want native video now
3. `TAVILY_API_KEY` only if research augmentation is desired immediately

**Verification:**
- Composer assistant responds.
- `/agents` can send a message.
- Native image generation succeeds.
- Veo3 appears in `/media/video-options` and can generate successfully, if `KIEAI_API_KEY` is supplied.

---

### Task 5: Make a product decision on slideshow video

**Objective:** Choose whether `image-text-slides` is supported or intentionally disabled.

**Files / runtime:**
- Runtime: `/opt/postiz/live/postiz.env`
- Code reference: `libraries/nestjs-libraries/src/videos/images-slides/images.slides.ts`

**Option A — support it with your own keys**
- Add/configure `FAL_KEY`
- Add/configure `ELEVENSLABS_API_KEY`
- Add/configure `TRANSLOADIT_AUTH`
- Add/configure `TRANSLOADIT_SECRET`
- Test the full pipeline

**Option B — intentionally disable it**
- Leave those keys absent
- Document that Veo3 is the supported native video experience

**Recommendation:**
- Prefer **Option B** unless slideshow-style explainers are a confirmed product requirement.

---

### Task 6: Make a product decision on AgentMedia

**Objective:** Decide whether AgentMedia is core or optional.

**Files / runtime:**
- Runtime: `/opt/postiz/live/postiz.env`
- Frontend: `apps/frontend/src/components/layout/agent.media.modal.tsx`
- Backend: `apps/backend/src/api/routes/users.controller.ts`

**Option A — enable the hosted handoff**
- Configure `AGENT_MEDIA_SSO_KEY`
- Verify SSO handoff opens correctly
- Document separate pricing/account expectations

**Option B — keep it optional/off for now**
- Leave it disabled
- Make sure product copy does not imply it is included in the main subscription

**Recommendation:**
- Treat AgentMedia as **optional** until the core in-app gadgets are working with your own keys.

---

### Task 7: Stand up the OpenRouter external-agent lane

**Objective:** Use your OpenRouter account without destabilizing the native app.

**Files / surfaces:**
- Docs: MCP / CLI / Public API guides
- Runtime endpoints:
  - `/mcp`
  - `/public/v1/*`
  - CLI with `POSTIZ_API_URL`

**Steps:**
1. Use Postiz MCP or Public API from an external agent/client that uses OpenRouter.
2. Authenticate via Postiz API key or OAuth app, depending on the client.
3. Choose model/provider routing inside OpenRouter, not inside Postiz.
4. Test scheduling, integration listing, and optional media generation from the external client.

**Verification:**
- An OpenRouter-powered external agent can list integrations and schedule a post through Postiz.

---

### Task 8: Future evaluation — AgentMedia self-host buildout with your own provider keys

**Objective:** Evaluate later whether AgentMedia can be self-hosted in a way that uses your own AI-provider accounts directly, instead of buying hosted `agent-media.ai` credits.

**Status:**
- future research / implementation task
- do **not** block core Postiz gadget rollout on this

**Why this stays later:**
- the current Postiz app can deliver value sooner by wiring your own keys into its native gadgets first
- current public AgentMedia materials emphasize hosted credits and bearer-token access
- you found evidence suggesting the package may bundle provider access at a premium over raw API cost; that hypothesis deserves a dedicated validation pass

**Files / sources to review later:**
- `https://github.com/gitroomhq/agent-media`
- `https://raw.githubusercontent.com/gitroomhq/agent-media/main/skills/make-lip-sync/SKILL.md`
- `https://agent-media.ai/`
- Postiz integration points:
  - `apps/frontend/src/components/layout/agent.media.modal.tsx`
  - `apps/backend/src/api/routes/users.controller.ts`

**Questions to answer later:**
1. Is there a documented full self-host backend path, or only open client/MCP layers?
2. Which providers are hard-coded vs swappable?
3. Can the workflow run entirely on your own provider keys without `agent-media.ai` credits?
4. If yes, what infra/services are required, and how cleanly can Postiz hand off to that self-hosted build?

**Verification:**
- A future evaluation ends with either:
  - a grounded self-host architecture using your keys, or
  - a clear no-go conclusion explaining why hosted AgentMedia credits remain required.

---

### Task 9: Optional engineering spike for native OpenRouter support

**Objective:** Determine whether native Postiz text/chat surfaces should become provider-abstracted.

**Files likely involved:**
- `apps/backend/src/api/routes/copilot.controller.ts`
- `libraries/nestjs-libraries/src/chat/load.tools.service.ts`
- `libraries/nestjs-libraries/src/openai/openai.service.ts`
- possibly new provider-abstraction files under `libraries/nestjs-libraries/src/ai/`

**Suggested spike order:**
1. Add config abstraction for text/chat provider selection.
2. Prove OpenRouter works for one non-critical text surface first.
3. Migrate composer assistant or post-generation helper before `/agents`.
4. Only then consider image API abstraction.

**Recommendation:**
- Do this only after Tasks 1-7 are complete.

---

## Verification matrix

| Feature | Verification command or action | Expected result |
|---|---|---|
| Composer assistant | Open post editor and use assistant popup | AI response appears without provider error |
| `/agents` | Visit `/agents/new` and send prompt | Agent responds and can see channels |
| Native image generation | Use image generation UI | image is generated and inserted/uploaded |
| Veo3 | Open AI video modal and generate `veo3` | generated video returns and saves to media |
| Slideshow video | Generate `image-text-slides` only if enabled | full pipeline completes |
| AgentMedia | Open modal and continue to AgentMedia | SSO handoff opens with authenticated org context |
| Public agent | POST to `/public/agent` with `AGENT_API_KEY` | content is categorized/saved |
| MCP | Connect external AI client to `/mcp` | integration/tool discovery succeeds |
| CLI | `postiz auth:status` / `postiz integrations:list` | auth and listing succeed |
| OAuth app | complete `/oauth/authorize` + `/oauth/token` flow | token works on Public API |

---

## Final recommendation

## Recommended order of operations
1. **Load your real OpenAI key first** so the core text/image gadgets can come alive.
2. **Add `KIEAI_API_KEY` next** if you want native Veo3 video.
3. **Add `TAVILY_API_KEY` only if you want research augmentation now.**
4. **Decide intentionally** whether slideshow video is worth the extra `FAL` + `ElevenLabs` + `Transloadit` vendor stack.
5. **Leave AgentMedia optional for now** and revisit self-host feasibility later.
6. **Use OpenRouter first for external agents over MCP/Public API/CLI.**
7. Only then decide whether native Postiz text/chat should be refactored to support OpenRouter directly.

## Best price/performance recommendation
- **For the app UI today:** the cheapest path to working native AI is to wire in only the keys you actually need, starting with `OPENAI_API_KEY`; do not add extra vendors before the core gadgets are validated.
- **For experimentation, multi-model access, and future automation:** OpenRouter is still the best price/performance layer because it gives you a single gateway to many vendors without changing the native UI first.
- **For native video:** prefer Kie.ai Veo3 as the supported path; enable the FAL/ElevenLabs/Transloadit slideshow stack only if there is confirmed product demand.

---

## Open questions to resolve before implementation

1. Do you want slideshow explainer videos, or should Veo3 be the only supported native video mode?
2. Do you want AgentMedia positioned as a core product feature or an optional upsell/adjacent product?
3. Do you want OpenRouter only for external automation, or do you want to fund an engineering track for native in-app provider abstraction too?
4. Which specific workflows matter most first:
   - in-app composing
   - `/agents`
   - API/MCP automations
   - image generation
   - video generation

---

## Safe default if no further decision is made

If nothing else is changed, the safest supported stack is:
- no in-app AI should be assumed live until your real keys are loaded
- `OPENAI_API_KEY` first for native text/chat/image features
- `TAVILY_API_KEY` only if research augmentation is desired
- `KIEAI_API_KEY` for native video when you are ready
- Chatbase optional for support
- AgentMedia off until intentionally enabled and later evaluated for self-host feasibility
- OpenRouter reserved for external MCP/API/CLI automations
