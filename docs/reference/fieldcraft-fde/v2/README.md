# Fieldcraft FDE Version 2 Reference

## Verdict

The original Varick page and the deployed Sites copy are an exact
implementation match for the inspected document.

The comparison found identical:

- Page title and document language.
- Complete visible text.
- Both inline stylesheet bodies.
- Both inline script bodies.
- All 20 section IDs, visible-text payloads, and complete section HTML
  subtrees.
- Interactive-element count.
- Embedded Varick icon source.

The only site-level difference is origin resolution for `/favicon.png`. A
`codex-browser-sidebar-comments-root` element observed in one copied-page
capture was injected by the browser tool and is not part of the deployed site.

## Authority

- Original: <https://learn.varickagents.com/fde-in-30-days>
- Copy: <https://fieldcraft-fde-30-days.jscraik.chatgpt.site/clone>
- Sites version: 2
- Source commit: `c6220eca648739a1f643f128fdb01907fa0fc902`
- Archive SHA-256:
  `8c1971868fe6a6e3c37010980ab169cc006bf1fe8fc19d7d43c8eda2c3d3496e`

The machine-readable fingerprints and claims boundary are in
[`manifest.json`](./manifest.json).

## Important limitation

The immutable archive metadata is available, but this reference directory does
not contain the archive itself because the available Sites connector did not
expose an archive-download operation. The manifest identifies that blocked
artifact explicitly.

The current proof establishes source implementation identity. It does not
replace a durable screenshot matrix for independent pixel comparison. Until
that matrix is captured and stored, a later evaluator may claim exact source
identity but must not claim a complete portable pixel-parity proof package.
