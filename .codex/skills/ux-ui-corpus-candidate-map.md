# UX/UI Corpus Skill Candidate Map

Purpose: map the KnowledgeOS UX/UI design corpus to brainwav local skill candidates for future knowledge capsules and skill improvements.

Corpus source: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/

Primary wiki route: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/index.md

Review lens: ui-ux-creative-coding. Use the corpus to improve focused UI polish, motion purpose, accessibility, reduced-motion parity, source-backed critique, and browser-verifiable behavior. Do not turn this into greenfield brand advice or generic aesthetic expansion.

## Extraction Guardrails

Use these before editing any skill from this map:

- Every source used for skill improvement should first be parsed for knowledge, patterns, heuristics, tests, evals, or workflow improvements.
- Prefer parsed artifacts from the KnowledgeOS corpus wiki over raw source custody.
- If a source has not been parsed, either parse it first or mark it queued/blocked; do not use it as silent authority.
- Start with 2-3 focused skill surfaces, not the whole skill tree.
- Scope one user flow or component class and up to 3 interaction clusters.
- Classify every motion or polish candidate as feedback, transition, guidance, delight, or decorative noise.
- Preserve existing primitives, tokens, animation helpers, and repo validation contracts.
- Add reduced-motion and keyboard/focus checks to any motion capsule.
- Prefer still-valid, source-backed context; discard duplicated, stale, unsafe, superseded, or low-signal text.
- Do not claim book-derived knowledge unless a bounded extraction artifact exists. Current PDF records are metadata/source inventory unless separately extracted.
- Any PDF held as a source should be parsed and distilled into markdown capsules, or recorded as extraction-blocked with exact failed command evidence.
- Cite local source paths and line anchors for extracted claims. Broad source names are routing hints, not evidence.

Parsed corpus control surfaces:

- ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/extraction-policy.md
- ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/extraction-ledger.md
- ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/pdf-capsules/index.md

## Verified Source Anchors

These anchors were checked against local corpus files and are safer extraction starting points than broad summaries:

- Tool/capability: A Brief Rant defines tools as amplifying human capabilities at web/worrydream-com-abriefrantonthefutureofinteractiondesign/1-abriefrantonthefutureofinteractiondesign.md:36.
- Tactile feedback: A Brief Rant discusses object feedback and touch at web/worrydream-com-abriefrantonthefutureofinteractiondesign/1-abriefrantonthefutureofinteractiondesign.md:84-86.
- Glass limitation: A Brief Rant critiques Pictures Under Glass at web/worrydream-com-abriefrantonthefutureofinteractiondesign/1-abriefrantonthefutureofinteractiondesign.md:94-102.
- Screen flux: What Screens Want names flux at web/frankchimero-com-blog-2013-what-screens-want/1-blog-2013-what-screens-want.md:259.
- Medium flux: What Screens Want describes assistive/descriptive animation at web/frankchimero-com-blog-2013-what-screens-want/1-blog-2013-what-screens-want.md:297-303.
- Interstitial craft: What Screens Want says designers craft behavior between fixed states at web/frankchimero-com-blog-2013-what-screens-want/1-blog-2013-what-screens-want.md:329.
- Transformation vocabulary: What Screens Want calls for a language of transformation at web/frankchimero-com-blog-2013-what-screens-want/1-blog-2013-what-screens-want.md:337.
- Learnable programming environment goals: Learnable Programming says the environment should let learners read vocabulary, follow flow, see state, and create by reacting at web/worrydream-com-learnableprogramming/1-learnableprogramming.md:46-50.
- Explain-in-context: Learnable Programming says the environment should make meaning transparent and explain in context at web/worrydream-com-learnableprogramming/1-learnableprogramming.md:148-151.
- Visible/tangible flow: Learnable Programming says program flow must be visible and tangible at web/worrydream-com-learnableprogramming/1-learnableprogramming.md:173-175.
- Immediate creator connection: Inventing on Principle transcript repeats creators need an immediate connection at videos/NGYGl_xxfXA/NGYGl_xxfXA.en-orig.transcript.txt:56-58 and :99-100.
- Beauty and attention: The Power of Beauty says beauty draws people into complex content at web/www-doc-cc-articles-power-of-beauty/1-articles-power-of-beauty.md:75-79.
- Beauty and emotion: The Power of Beauty frames beauty as emotional connection at web/www-doc-cc-articles-power-of-beauty/1-articles-power-of-beauty.md:91-99.
- Beauty and significance: The Power of Beauty frames beauty as culturally significant at web/www-doc-cc-articles-power-of-beauty/1-articles-power-of-beauty.md:111-123.
- Quality-fit caution: What The Best Looks Like is about fit-for-context quality judgment, not a pure visual-design reference. Use web/www-kuril-in-blog-what-the-best-looks-like/1-blog-what-the-best-looks-like.md:50-52 and :219-221 to support context-specific quality calibration.
- Visual style vocabulary: design-styles/SKILL.md documents 50 aesthetics with principles, visual characteristics, color palettes, typography, feelings, and prompt keywords at repos/design-styles/SKILL.md:3-17 and :215.

## Extraction Confidence

- High confidence: extracted web markdown and local transcript text listed in Verified Source Anchors.
- Medium confidence: design-styles repo snapshot. It is structured and local, but relative reference paths in the copied skill may not match its original package layout; cite actual local files.
- OCR repair path available, not yet citable: Design of Everyday Things and Don't Make Me Think can now be rendered through the KnowledgeOS OCR sidecar lane, but they remain source inventory until full sidecars are distilled into markdown capsules with page markers.
- Low confidence until further extraction: Dive Club episode feed metadata. Treat as source inventory, not claim material.
- Not a UX/UI evidence source by itself: generic skill text in brainwav. Use it as a target surface, not as proof that a source claim is true.

## Highest-Value Candidates

### interface-craft

Path: .codex/skills/interface-craft/SKILL.md

Best corpus routes:

- wiki/concepts/interaction-design-principles.md
- wiki/concepts/learnable-programming-and-dynamic-media.md
- wiki/concepts/agent-native-ui-workflows.md
- Bret Victor, A Brief Rant on the Future of Interaction Design
- Frank Chimero, What Screens Want
- Inventing on Principle transcript

Capsule opportunities:

- Add a feedback-loop review question to the design critique sub-skill: what changed, where is feedback visible, and does the user know the next action?
- Add a screen-native flux checklist for transitions and state changes, grounded in What Screens Want lines 259, 297-303, and 329.
- Add a learnable-interface check: visible state, visible cause/effect, inspectable result, and context explanation.
- Improve Storyboard Animation with a source-backed rule that every animation must explain a state change, reduce uncertainty, or be removed as decorative noise.
- Add reduced-motion parity to every animation capsule: the motion may become opacity/color/instant state change, but the feedback still has to exist.

Extraction QA:

- Do not import broad Awwwards or brand-generation rules here.
- Check design-critique.md, storyboard-animation.md, and dialkit.md before editing so improvements land in the right sub-skill.
- Any proposed motion capsule needs a browser-verifiable behavior check when applied to code.

### emil-design-eng

Path: .codex/skills/emil-design-eng/SKILL.md

Best corpus routes:

- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/interaction-design-principles.md
- Wilson Miner, When We Build transcript
- DOC, The Power of Beauty

Capsule opportunities:

- Extend taste is trained with a practice loop: collect references, identify mechanisms, rebuild one detail, compare before/after.
- Add beauty-as-leverage framing tied to attention, comprehension, trust, and emotion using The Power of Beauty lines 75-99.
- Add a what capability does this tool amplify prompt before component polish using A Brief Rant line 36.
- Add a source-bound warning that beauty is not decoration; it must help attention, understanding, emotional connection, or cultural memory.

### review-animations

Path: .codex/skills/review-animations/SKILL.md

Best corpus routes:

- wiki/concepts/interaction-design-principles.md
- wiki/concepts/learnable-programming-and-dynamic-media.md
- Frank Chimero, What Screens Want
- Bret Victor, A Brief Rant on the Future of Interaction Design

Capsule opportunities:

- Add a flux purpose finding class: motion should clarify transformation, not merely add decoration.
- Add a feedback loop approval criterion: the animation makes the result of an action more legible.
- Add a hidden state remains hidden finding when animation obscures rather than explains state.
- Add ui-ux-creative-coding parity: any review finding about motion should also mention reduced-motion, keyboard/focus behavior, and whether browser evidence is required.

Extraction QA:

- Keep this skill narrow. It reviews animation and motion only.
- Do not let taste, brand, or full-redesign capsules leak into this skill unless they are tied to motion purpose.

### taste-skill

Path: .codex/skills/taste-skill/SKILL.md

Best corpus routes:

- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/design-systems-style-vocabulary.md
- wiki/capsule-selection-map.md
- DOC, The Power of Beauty
- Kurilin, What The Best Looks Like
- design-styles repo snapshot

Capsule opportunities:

- Add a source-backed taste calibration preflight: name the product category, audience, quality reference, and mechanism.
- Add a beauty must serve comprehension, trust, attention, or emotion rule.
- Replace broad anti-slop rules with source-backed selection questions where possible.
- Add a design-styles lookup route for aesthetic choice instead of inventing vague vibe words.
- Add an explicit context-fit warning for What The Best Looks Like: the useful principle is not that one universal best exists, but that best means best for this company, audience, constraints, and moment.
- Add ui-ux-creative-coding scoping: for existing UI polish, choose one screen and up to 3 interaction clusters before applying taste rules.

Extraction QA:

- Separate visual taste from usability, accessibility, and motion. A capsule should state which lane it is improving.
- Avoid copying long anti-slop lists; keep still-valid rules and fold duplicated rules into references.

### redesign-skill

Path: .codex/skills/redesign-skill/SKILL.md

Best corpus routes:

- wiki/capsule-selection-map.md
- wiki/concepts/interaction-design-principles.md
- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/learnable-programming-and-dynamic-media.md

Capsule opportunities:

- Add a redesign diagnosis layer: interaction, learnability, taste, and style are separate failure classes.
- Add a source-backed mechanism requirement for every redesign recommendation.
- Add visible state before extra controls as a redesign move for tools, dashboards, and agent workbenches.
- Add a no-redesign escape hatch: if the task only asks for polish, preserve layout and focus on micro-interactions, focus states, reduced-motion, and browser proof.
- Add extraction classes: source-backed issue, heuristic issue, screenshot-observed issue, and unsupported preference.

### image-to-code-skill

Path: .codex/skills/image-to-code-skill/SKILL.md

Best corpus routes:

- wiki/concepts/design-systems-style-vocabulary.md
- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/agent-native-ui-workflows.md
- design-styles repo snapshot

Capsule opportunities:

- Add an image-analysis checklist for style intent, interaction affordance, feedback, and source-fit.
- Add a do not copy reference aesthetics without product-job alignment rule.
- Add an implementation-readiness check: generated design image must expose typography, spacing, component states, and interaction cues.
- Add reduced-motion and focus-state prompts for image-to-code translation: the image can show visual states, but implementation must preserve keyboard and reduced-motion behavior.
- Add source correctness check: do not infer animation timing, accessibility, or interaction behavior from a still image unless the prompt or implementation evidence supports it.

### imagegen-frontend-web and imagegen-frontend-mobile

Paths:

- .codex/skills/imagegen-frontend-web/SKILL.md
- .codex/skills/imagegen-frontend-mobile/SKILL.md

Best corpus routes:

- wiki/concepts/design-systems-style-vocabulary.md
- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/learnable-programming-and-dynamic-media.md

Capsule opportunities:

- Add a visual direction matrix: product category, audience, desired emotion, usable style families, anti-mismatch rules.
- Add a readable-state requirement for generated app screens: every screen should communicate what changed, what can be acted on, and where feedback appears.
- Add a beauty-purpose check for generated references.
- Add a source-fit check before style generation: style vocabulary should come from design-styles, but interaction and motion behavior should come from Victor/Chimero/Emil-style motion sources.

### brandkit

Path: .codex/skills/brandkit/SKILL.md

Best corpus routes:

- wiki/concepts/design-taste-and-beauty.md
- wiki/concepts/design-systems-style-vocabulary.md
- DOC, The Power of Beauty
- design-styles repo snapshot

Capsule opportunities:

- Add a beauty-and-significance capsule: brand boards should create attention, emotional connection, and cultural memory.
- Add style vocabulary lookup before mood-board generation.
- Add a quality-reference requirement: one board should say what best in category looks like and why.
- Add a brand boundary: brandkit can use beauty and visual vocabulary, but it should not claim UI usability or interaction quality from a static brand board.

## Medium-Value Candidates

### gpt-tasteskill

Path: .codex/skills/gpt-tasteskill/SKILL.md

Use the corpus to reduce over-prescriptive Awwwards defaults. The improvement is not more spectacle; it is better selection. Add source-backed questions before GSAP, bento, or cinematic choices:

- What user job or narrative does this motion explain?
- Does the page need flux, or just clarity?
- Does the visual treatment improve comprehension or only intensity?

### stitch-skill

Path: .codex/skills/stitch-skill/SKILL.md

Good target for converting the corpus into semantic design-system rules:

- atmosphere
- color calibration
- typography
- component behavior
- layout
- motion philosophy
- anti-patterns

The design-styles repo and capsule-selection map are especially useful here.

### minimalist-skill, brutalist-skill, soft-skill

Paths:

- .codex/skills/minimalist-skill/SKILL.md
- .codex/skills/brutalist-skill/SKILL.md
- .codex/skills/soft-skill/SKILL.md

These are aesthetic-specialist skills. Use the corpus mainly to add selection and rejection rules:

- When is this aesthetic appropriate for the user's job?
- What emotion or trust signal does it create?
- What usability risks does it introduce?
- Which style vocabulary terms and constraints should be reused?

## Capsule Backlog

1. Interaction feedback loop capsule.
2. Screen-native flux capsule.
3. Learnable interface visible-state capsule.
4. Beauty as comprehension and trust capsule.
5. Taste calibration practice loop capsule.
6. Visual style selection matrix capsule.
7. Agent-native UI critique rubric capsule.
8. Image-generation reference analysis capsule.
9. Redesign diagnosis classes capsule.
10. Motion purpose and frequency capsule.
11. Reduced-motion parity capsule.
12. Keyboard/focus preservation capsule.
13. Browser-evidence requirement capsule.
14. Source-confidence and line-anchor capsule.

## Updated Suggested Improvement Order

1. interface-craft/design-critique: highest leverage because it can absorb usability, feedback, affordance, learnability, and screen-native critique without becoming a style generator.
2. redesign-skill: move ahead of taste-skill because it needs source-backed diagnosis classes for usability, learnability, visual fit, motion, accessibility, and evidence.
3. review-animations/STANDARDS plus interface-craft/storyboard-animation: keep narrow and apply only under ui-ux-creative-coding scope for existing UI polish, with motion purpose, reduced-motion parity, keyboard/focus preservation, and browser evidence.
4. image-to-code-skill: improve image-analysis limits, interaction-readiness criteria, affordance scan, information-density checks, and style mismatch tests.
5. taste-skill: keep important, but prune and selection-gate it rather than adding more broad anti-pattern lists.
6. brandkit plus imagegen frontend web/mobile: add style vocabulary, beauty-purpose checks, and product-fit constraints after critique/redesign capsules stabilize.
7. stitch-skill plus minimalist/brutalist/soft specialists: add applicability and rejection rules from the style matrix, especially to avoid cinematic motion defaults in utilitarian product UI.
8. gpt-tasteskill and soft-skill: treat as specialist or containment candidates unless the task explicitly calls for cinematic or Awwwards-style marketing surfaces.

## Frontend Owner Routing

Use frontend-design as the front door when the user request is ambiguous. Then route to the narrowest owner:

| Request shape | Primary owner | Source/capsule route | Proof expectation |
| --- | --- | --- | --- |
| UI screenshot or component critique | interface-craft/design-critique | Design of Everyday Things, Don't Make Me Think, Universal Principles, Designing with the Mind in Mind | diagnosis label, mechanism, repair, verification step |
| Broad redesign audit | redesign-skill | UX/UI skill application ratchets plus research/evidence capsules | classify before changing visuals; preserve local primitives |
| Existing UI polish, transitions, hover/focus, micro-interactions | ui-ux-creative-coding plus review-animations/STANDARDS | What Screens Want, Learnable Programming, Inventing on Principle, Design of Everyday Things feedback model | one screen, up to 3 interaction clusters, reduced-motion parity, keyboard/focus preservation, browser evidence |
| Visual direction, brand, image generation, style exploration | taste-skill, brandkit, imagegen, image-to-code | tesslio design-styles, Power of Beauty, What The Best Looks Like, style mismatch tests | product-fit style choice, accessibility risk, rejection case |

Do not route greenfield brand or whole-site art direction to ui-ux-creative-coding. Do not route token-system governance to these skills; use a design-system owner.

## Direct Knowledge Capsules

Use the KnowledgeOS skill-capsule lane before editing brainwav skills:

- Critique: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/skill-capsules/critique-diagnosis-before-styling.md
- Redesign: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/skill-capsules/redesign-audit-routing.md
- Existing UI polish and motion: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/skill-capsules/existing-ui-polish-and-motion-evidence.md
- Image-to-code: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/skill-capsules/image-to-code-interaction-limits.md
- Style, brand, and image generation: ~/dev/knowledge-OS/sources/design/ux-ui-design-corpus-2026-07-04/wiki/skill-capsules/product-fit-style-selection.md

## 2026-07-04 Re-review After Brainwav Skill Read

Recommendations changed: yes, but mostly in priority and routing rather than corpus scope.

- interface-craft remains the top target, with design-critique.md first. The OCR repair lane makes book-derived usability capsules practical, so affordances, signifiers, mappings, feedback, scanability, and self-evidence should land here before style skills.
- redesign-skill moves up because it is the best place to turn raw audit instincts into diagnosis classes with source-backed mechanisms and explicit evidence requirements.
- review-animations moves down. It is already narrow and well-ratcheted, so future edits should be small: motion must explain transformation, preserve feedback under reduced motion, and be browser-verifiable.
- taste-skill should be tightened, not expanded. It needs selection gates, mismatch tests, and style-fit criteria from the design-styles corpus more than another layer of blanket bans.
- brandkit, imagegen, and image-to-code should get style vocabulary and beauty-purpose checks after critique/redesign routes are stable.
- soft-skill and gpt-tasteskill need containment review. Their cinematic and perpetual-motion defaults are useful only for specific expressive surfaces, not as general product UI guidance.

Book-derived capsule routing from the distilled KnowledgeOS PDF capsules:

- Design of Everyday Things -> interface-craft/design-critique and redesign-skill for affordances, signifiers, mapping, constraints, feedback, conceptual models, and error recovery.
- Don't Make Me Think -> interface-craft/design-critique, redesign-skill, and image-to-code-skill for scanability, obvious navigation, visual hierarchy, and the limits of judging interaction from a still image.
- Universal Principles of Design and Designing with the Mind in Mind -> taste-skill, redesign-skill, and image-to-code-skill for perceptual grouping, attention, memory load, error prevention, and recognition-over-recall checks.
- Just Enough Research and About Face -> redesign-skill and interface-craft/design-critique for research fit, persona/goal checks, task modeling, and evidence boundaries.

Do not cite OCR sidecars directly from brainwav skill bodies. First distill them into KnowledgeOS markdown capsules with page markers, then cite the capsule path and page anchor.

## Proof Needed For Future Edits

For skill text edits, use repo-local validation where available:

- Verify touched files exist and references resolve.
- Run the skill quick validator for changed skill directories when applicable.
- Run brainwav repo checks only when edits affect site source, generated assets, or package behavior.
- For any applied UI change, capture browser evidence or Playwright evidence for the affected route/surface when possible.
- For any motion-related capsule, validate reduced-motion behavior and keyboard/focus behavior, or mark those checks blocked with the reason.
- For any source-derived capsule, include a local source path and line anchor; if only metadata exists, label it as a future extraction route.

Do not claim the skills are improved merely because this candidate map exists. This map is a routing artifact for future capsule extraction and skill hardening.

## Review Findings From UI/UX Creative Coding Lens

| Finding | Correction |
| --- | --- |
| Earlier map grouped sources by theme but did not require line anchors. | Added verified local anchors and a rule that source names are routing hints, not evidence. |
| Earlier map treated all source types similarly. | Added confidence levels: extracted markdown/transcripts and OCR-derived PDF capsules are high confidence for capsule use; design-styles is medium repo-snapshot confidence; Dive Club feed metadata remains low until transcript extraction. |
| Motion recommendations lacked reduced-motion and keyboard/focus gates. | Added reduced-motion, keyboard/focus, and browser-evidence requirements to relevant candidate skills. |
| What The Best Looks Like could be misread as visual-taste proof. | Reclassified it as context-specific quality calibration, not a pure UI/visual-design reference. |
| Skill improvements risked becoming full redesign guidance. | Added ui-ux-creative-coding scoping: one screen, up to 3 interaction clusters, preserve existing primitives and tokens. |
