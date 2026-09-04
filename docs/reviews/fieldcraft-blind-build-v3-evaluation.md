# Fieldcraft Blind-Build v3 Independent Evaluation

## Verdict

The measured scene contract materially improved the blind output, but v3 does
not pass parity. All 20 measured heading-geometry rows pass; only the hero passes
the frozen 1% initial-scene pixel threshold. Nineteen initial scenes and all
five captured modal states fail visual difference.

## Candidate binding

- Candidate: `artifacts/fieldcraft-blind-trial-v3/dist/`
- `dist/index.html` SHA-256:
  `449d04ddde46c5502d17db093be2a0696a7a6f829fac6c8898404e27f4693504`
- Reference authority: `docs/reference/fieldcraft-fde/v3/manifest.json`
- Frozen policy: `docs/reference/fieldcraft-fde/v3/policy.json`
- Viewport: 1280 × 720

## Lane results

| Lane | Result | Evidence |
| --- | --- | --- |
| Candidate build | Pass | `npm run build` |
| Structural inventory | Pass | `npm run test:structure` |
| Local HTTP | Pass | `npm run test:http` |
| JavaScript syntax | Pass | `node --check` on app and runtime test |
| Initial-scene heading geometry | Pass, 20/20 | `artifacts/fieldcraft-scene-evaluation-v3/geometry-results.json` |
| Initial-scene visual difference | Fail, 1/20 | `artifacts/fieldcraft-scene-evaluation-v3/visual-results.json` |
| Modal open and initial focus | Pass, 5/5 | Independent in-app-browser state capture |
| Modal visual difference | Fail, 0/5 | `artifacts/fieldcraft-scene-evaluation-v3/modal-visual-results.json` |
| Console warnings/errors | Pass on modal path | No warning or error entries captured |
| Collision and hidden-state matrix | Incomplete | Builder markers exist, but the complete evaluator state matrix did not run |
| Deployment reference states | Blocked | Deployed-URL browser security denial during capture |
| Advanced roadmap reference states | Blocked | Not captured after the same denial |
| Responsive parity | Blocked | No protected, confirmed responsive matrix |

## Initial-scene visual results

The frozen mismatch limit is 1%. The hero passes at 0.693%. The other scenes
range from 4.315% to 12.942% mismatch.

| Scene | Mismatch | Verdict |
| ---: | ---: | --- |
| 0 | 0.693% | Pass |
| 1 | 5.598% | Fail |
| 2 | 5.869% | Fail |
| 3 | 5.428% | Fail |
| 4 | 7.504% | Fail |
| 5 | 4.928% | Fail |
| 6 | 6.513% | Fail |
| 7 | 8.324% | Fail |
| 8 | 4.565% | Fail |
| 9 | 4.315% | Fail |
| 10 | 8.316% | Fail |
| 11 | 6.744% | Fail |
| 12 | 12.942% | Fail |
| 13 | 7.382% | Fail |
| 14 | 6.914% | Fail |
| 15 | 8.981% | Fail |
| 16 | 9.140% | Fail |
| 17 | 9.228% | Fail |
| 18 | 9.846% | Fail |
| 19 | 8.375% | Fail |

## Failure classification

### Implementation compliance success

The candidate implements the measured heading boxes, computed sizes, line
heights, alignment, colors, and no-overflow rule for all 20 scenes. This is a
large improvement over v2 and shows that the machine-readable geometry is
executable by a blind builder.

### Specification incompleteness

The remaining initial-scene differences are primarily specification failures.
The contract fixes heading geometry and names composition types, but it does
not yet measure the internal nodes, rules, paragraph bounds, table columns,
diagram paths, card dimensions, rail spacing, or exact shell typography for
every scene. The Audit candidate, for example, uses the required three-column
composition but its column widths, row density, arrows, artifact proportions,
and bottom-rail treatment remain visibly different.

### Modal specification failure

All modal interactions open with Close focused, but modal image mismatches are
approximately 66.95% to 69.85%. This is not acceptable visual fidelity. The
builder had exact modal copy and behavior but no measured modal panel, backdrop,
typography, spacing, bullet, or close-control geometry. The next contract must
add those values before another blind iteration.

### Unproved lanes

No claim is made for the complete collision/state matrix, timed deployment
parity, advanced roadmap parity, Escape behavior, or responsive parity. The
protected reference capture for the timed and advanced states was denied by the
browser security boundary, and no alternate browser or policy workaround was
used.

## Stop condition

V3 is rejected for parity. Do not tune the frozen mismatch threshold. Improve
the instance contract by measuring internal scene primitives and modal states,
then run a fresh blind candidate. The hero should be preserved as a passing
contract rather than redesigned again.
