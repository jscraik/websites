# Diagram Context Pack

Generated: 2026-07-21T18:44:29Z

## Table of Contents

- [How to use this pack](#how-to-use-this-pack)
- [agent](#agent)
- [architecture](#architecture)
- [auth](#auth)
- [c4context](#c4context)
- [class](#class)
- [database](#database)
- [dependency](#dependency)
- [erd](#erd)
- [events](#events)
- [flow](#flow)
- [rag](#rag)
- [security](#security)
- [sequence](#sequence)
- [user](#user)

## How to use this pack

- Start here for compact architecture, dependency, database, and ERD context before opening raw source files.
- Use .diagram/manifest.json to choose a focused Mermaid file when this combined pack is too large.
- For TypeScript implementation detail in this checkout, run `bash scripts/harness-cli.sh source-outline <path> --json` first, then unwrap one symbol with `--symbol <name>`. Downstream repositories can use `harness source-outline <path>`.

## Changed source focus

- These architecture-sensitive paths changed on the current branch and may be compacted out of Mermaid diagrams.
- `package.json`
- `scripts/lib/normalize-mermaid-artifact.cjs`
- `scripts/refresh-diagram-context.sh`
- `src/layouts/BaseLayout.astro`
- `src/pages/demos/skillsbar.astro`

## agent

```mermaid
flowchart TD
  subgraph Orchestration["🎯 Orchestration Layer"]
    jose_parity_runner_50cc4344["🤖 jose-parity-runner"]
    validate_jose_claim_boundary_01082824["🤖 validate-jose-claim-boundary"]
  end
  subgraph ToolLayer["🔧 Tool Layer"]
    jose_parity_cdp_bdcde21d["🔧 jose-parity-cdp"]
  end
  subgraph MemoryLayer["📚 Memory / Vector Layer"]
    normalize_mermaid_artifact_9dba7231[("📚 normalize-mermaid-artifact")]
  end
  classDef agentNode fill:#555,color:#fff
  class jose_parity_runner_50cc4344,validate_jose_claim_boundary_01082824 agentNode
  classDef llmNode fill:#555,color:#fff
  classDef toolNode fill:#555,color:#fff
  class jose_parity_cdp_bdcde21d toolNode
  classDef memNode fill:#555,color:#fff
  class normalize_mermaid_artifact_9dba7231 memNode

```
## architecture

```mermaid
graph TD

```

## auth

```mermaid
flowchart TD
  Note["No authentication components found"]

```

## c4context

```mermaid
C4Context
  title "System Context — brainwav io"
  System(mainSystem, "brainwav io", "The system being documented")
  Person(developer, "Developer / User", "Uses the system")
  Rel(developer, mainSystem, "Uses")
  System_Ext(ext_0, "External Service", "node:fs, node:path, @playwright/test")
  Rel(mainSystem, ext_0, "uses")

```

## class

```mermaid
classDiagram
  note "No classes found"
  class contract_loader_src_lib_contract_loader_ts_12a7d1bf {
    +src/lib/contract/loader.ts
  }
  class contract_validator_src_lib_contract_validator_ts_3254c053 {
    +src/lib/contract/validator.ts
  }
  contract_loader_src_lib_contract_loader_ts_12a7d1bf --> contract_validator_src_lib_contract_validator_ts_3254c053 : validateContract

```

## database

```mermaid
flowchart TD
  Note["No database-focused components found"]

```

## dependency

```mermaid
graph LR
  node_capture_jose_reference_e7b66705_7f5ac43a["capture_jose_reference_e7b66705"]
  node_changed_files_4c0102f6_bfd165bc["changed_files_4c0102f6"]
  node_check_code_quality_debt_cba04f67_104c73f4["check_code_quality_debt_cba04f67"]
  node_check_code_size_9c5efc3a_154124ae["check_code_size_9c5efc3a"]
  node_check_node_engine_217689bf_3e5964b2["check_node_engine_217689bf"]
  node_check_public_api_docs_a9604f1b_f824853c["check_public_api_docs_a9604f1b"]
  node_content_config_a9a9d2e1_05943ac5["content_config_a9a9d2e1"]
  node_jose_parity_cdp_bdcde21d_edb59c81["jose_parity_cdp_bdcde21d"]
  node_jose_parity_runner_50cc4344_e9555b02["jose_parity_runner_50cc4344"]
  node_setup_git_hooks_70750d40_b4ca2cf9["setup_git_hooks_70750d40"]
  node_smoke_pages_9a92b30d_72f6805f["smoke_pages_9a92b30d"]
  node_test_portfolio_helpers_88b404c3_859ed297["test_portfolio_helpers_88b404c3"]
  node_validate_astro_anti_patterns_c2656e62_cf436b7a["validate_astro_anti_patterns_c2656e62"]
  node_validate_coding_policy_29976175_c710e9cd["validate_coding_policy_29976175"]
  node_validate_commit_msg_43b008fe_f9560ef9["validate_commit_msg_43b008fe"]
  node_validate_content_source_boundary_8a6f121b_b79b7423["validate_content_source_boundary_8a6f121b"]
  node_validate_css_policy_1c5ec854_8f6d9474["validate_css_policy_1c5ec854"]
  node_validate_design_system_b8a5f37c_d69ca690["validate_design_system_b8a5f37c"]
  node_validate_html_output_736c5b7a_1b91e628["validate_html_output_736c5b7a"]
  node_validate_jose_claim_boundary_01082824_d7b27144["validate_jose_claim_boundary_01082824"]
  node_validate_js_budget_3d3908ce_dabf96a0["validate_js_budget_3d3908ce"]
  node_validate_no_prototype_slop_ce400ae8_22ea314f["validate_no_prototype_slop_ce400ae8"]
  node_validate_page_surfaces_078ef6b6_3d64ee9f["validate_page_surfaces_078ef6b6"]
  node_validate_portfolio_content_6d36990e_d04a79b1["validate_portfolio_content_6d36990e"]
  node_validate_render_flow_2f64be63_a84870b9["validate_render_flow_2f64be63"]
  ext_playwright_test_4b02302d["@playwright/test"] --> node_capture_jose_reference_e7b66705_7f5ac43a
  ext_playwright_test_4b02302d["@playwright/test"] --> node_jose_parity_cdp_bdcde21d_edb59c81
  ext_playwright_test_4b02302d["@playwright/test"] --> node_jose_parity_runner_50cc4344_e9555b02
  ext_astro_90c9d7bd["astro"] --> node_content_config_a9a9d2e1_05943ac5
  ext_astro_content_2110f121["astro:content"] --> node_content_config_a9a9d2e1_05943ac5
  ext_node_assert_f1a93ba5["node:assert"] --> node_test_portfolio_helpers_88b404c3_859ed297
  ext_node_child_process_f62b7d19["node:child_process"] --> node_changed_files_4c0102f6_bfd165bc
  ext_node_child_process_f62b7d19["node:child_process"] --> node_check_code_quality_debt_cba04f67_104c73f4
  ext_node_child_process_f62b7d19["node:child_process"] --> node_check_node_engine_217689bf_3e5964b2
  ext_node_child_process_f62b7d19["node:child_process"] --> node_check_public_api_docs_a9604f1b_f824853c
  ext_node_child_process_f62b7d19["node:child_process"] --> node_jose_parity_runner_50cc4344_e9555b02
  ext_node_child_process_f62b7d19["node:child_process"] --> node_setup_git_hooks_70750d40_b4ca2cf9
  ext_node_child_process_f62b7d19["node:child_process"] --> node_validate_coding_policy_29976175_c710e9cd
  ext_node_child_process_f62b7d19["node:child_process"] --> node_validate_commit_msg_43b008fe_f9560ef9
  ext_node_crypto_c7dfc512["node:crypto"] --> node_check_code_quality_debt_cba04f67_104c73f4
  ext_node_fs_a15b7d96["node:fs"] --> node_capture_jose_reference_e7b66705_7f5ac43a
  ext_node_fs_a15b7d96["node:fs"] --> node_check_code_quality_debt_cba04f67_104c73f4
  ext_node_fs_a15b7d96["node:fs"] --> node_check_code_size_9c5efc3a_154124ae
  ext_node_fs_a15b7d96["node:fs"] --> node_check_node_engine_217689bf_3e5964b2
  ext_node_fs_a15b7d96["node:fs"] --> node_check_public_api_docs_a9604f1b_f824853c
  ext_node_fs_a15b7d96["node:fs"] --> node_jose_parity_cdp_bdcde21d_edb59c81
  ext_node_fs_a15b7d96["node:fs"] --> node_jose_parity_runner_50cc4344_e9555b02
  ext_node_fs_a15b7d96["node:fs"] --> node_setup_git_hooks_70750d40_b4ca2cf9
  ext_node_fs_a15b7d96["node:fs"] --> node_smoke_pages_9a92b30d_72f6805f
  ext_node_fs_a15b7d96["node:fs"] --> node_test_portfolio_helpers_88b404c3_859ed297
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_astro_anti_patterns_c2656e62_cf436b7a
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_coding_policy_29976175_c710e9cd
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_commit_msg_43b008fe_f9560ef9
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_content_source_boundary_8a6f121b_b79b7423
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_css_policy_1c5ec854_8f6d9474
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_design_system_b8a5f37c_d69ca690
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_html_output_736c5b7a_1b91e628
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_jose_claim_boundary_01082824_d7b27144
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_js_budget_3d3908ce_dabf96a0
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_no_prototype_slop_ce400ae8_22ea314f
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_page_surfaces_078ef6b6_3d64ee9f
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_portfolio_content_6d36990e_d04a79b1
  ext_node_fs_a15b7d96["node:fs"] --> node_validate_render_flow_2f64be63_a84870b9
  ext_node_http_e4ddf53f["node:http"] --> node_validate_render_flow_2f64be63_a84870b9
  ext_node_path_78811c13["node:path"] --> node_capture_jose_reference_e7b66705_7f5ac43a
  ext_node_path_78811c13["node:path"] --> node_check_code_quality_debt_cba04f67_104c73f4
  ext_node_path_78811c13["node:path"] --> node_check_code_size_9c5efc3a_154124ae
  ext_node_path_78811c13["node:path"] --> node_check_node_engine_217689bf_3e5964b2
  ext_node_path_78811c13["node:path"] --> node_check_public_api_docs_a9604f1b_f824853c
  ext_node_path_78811c13["node:path"] --> node_jose_parity_cdp_bdcde21d_edb59c81
  ext_node_path_78811c13["node:path"] --> node_setup_git_hooks_70750d40_b4ca2cf9
  ext_node_path_78811c13["node:path"] --> node_smoke_pages_9a92b30d_72f6805f
  ext_node_path_78811c13["node:path"] --> node_validate_astro_anti_patterns_c2656e62_cf436b7a
  ext_node_path_78811c13["node:path"] --> node_validate_coding_policy_29976175_c710e9cd
  ext_node_path_78811c13["node:path"] --> node_validate_content_source_boundary_8a6f121b_b79b7423
  ext_node_path_78811c13["node:path"] --> node_validate_css_policy_1c5ec854_8f6d9474
  ext_node_path_78811c13["node:path"] --> node_validate_design_system_b8a5f37c_d69ca690
  ext_node_path_78811c13["node:path"] --> node_validate_html_output_736c5b7a_1b91e628
  ext_node_path_78811c13["node:path"] --> node_validate_js_budget_3d3908ce_dabf96a0
  ext_node_path_78811c13["node:path"] --> node_validate_no_prototype_slop_ce400ae8_22ea314f
  ext_node_path_78811c13["node:path"] --> node_validate_portfolio_content_6d36990e_d04a79b1
  ext_node_path_78811c13["node:path"] --> node_validate_render_flow_2f64be63_a84870b9
  ext_node_url_d0cb3ad7["node:url"] --> node_check_node_engine_217689bf_3e5964b2
  ext_node_zlib_bb6e132b["node:zlib"] --> node_validate_js_budget_3d3908ce_dabf96a0
  ext_pixelmatch_09ac8ff1["pixelmatch"] --> node_jose_parity_cdp_bdcde21d_edb59c81
  ext_playwright_7cbdd1eb["playwright"] --> node_validate_render_flow_2f64be63_a84870b9
  ext_pngjs_3cfe9260["pngjs"] --> node_jose_parity_cdp_bdcde21d_edb59c81
  ext_typescript_fb9da861["typescript"] --> node_check_code_quality_debt_cba04f67_104c73f4
  ext_typescript_fb9da861["typescript"] --> node_check_code_size_9c5efc3a_154124ae
  ext_typescript_fb9da861["typescript"] --> node_check_public_api_docs_a9604f1b_f824853c
  style ext_astro_90c9d7bd fill:#f59e0b,color:#fff
  style ext_astro_content_2110f121 fill:#f59e0b,color:#fff
  style ext_node_assert_f1a93ba5 fill:#f59e0b,color:#fff
  style ext_node_child_process_f62b7d19 fill:#f59e0b,color:#fff
  style ext_node_crypto_c7dfc512 fill:#f59e0b,color:#fff
  style ext_node_fs_a15b7d96 fill:#f59e0b,color:#fff
  style ext_node_http_e4ddf53f fill:#f59e0b,color:#fff
  style ext_node_path_78811c13 fill:#f59e0b,color:#fff
  style ext_node_url_d0cb3ad7 fill:#f59e0b,color:#fff
  style ext_node_zlib_bb6e132b fill:#f59e0b,color:#fff
  style ext_pixelmatch_09ac8ff1 fill:#f59e0b,color:#fff
  style ext_playwright_7cbdd1eb fill:#f59e0b,color:#fff
  style ext_playwright_test_4b02302d fill:#f59e0b,color:#fff
  style ext_pngjs_3cfe9260 fill:#f59e0b,color:#fff
  style ext_typescript_fb9da861 fill:#f59e0b,color:#fff

```

## erd

```mermaid
erDiagram
  %% erd extraction: failed_no_schema
  %% schema sources: none
  %% no supported schema sources found (expected schema.prisma or .sql files)

```

## events

```mermaid
flowchart TD
  Note["No event/channels components found"]

```

## flow

```mermaid
flowchart TD
  Start(["Start"])
  capture_jose_reference_e7b66705["capture-jose-reference"]
  Start --> capture_jose_reference_e7b66705
  check_code_quality_debt_cba04f67["check-code-quality-debt"]
  capture_jose_reference_e7b66705 --> check_code_quality_debt_cba04f67
  check_code_size_9c5efc3a["check-code-size"]
  check_code_quality_debt_cba04f67 --> check_code_size_9c5efc3a
  check_node_engine_217689bf["check-node-engine"]
  check_code_size_9c5efc3a --> check_node_engine_217689bf
  check_public_api_docs_a9604f1b["check-public-api-docs"]
  check_node_engine_217689bf --> check_public_api_docs_a9604f1b
  jose_parity_cdp_bdcde21d["jose-parity-cdp"]
  check_public_api_docs_a9604f1b --> jose_parity_cdp_bdcde21d
  jose_parity_runner_50cc4344["jose-parity-runner"]
  jose_parity_cdp_bdcde21d --> jose_parity_runner_50cc4344
  changed_files_4c0102f6["changed-files"]
  jose_parity_runner_50cc4344 --> changed_files_4c0102f6
  End(["End"])
  changed_files_4c0102f6 --> End

```

## rag

```mermaid
flowchart LR
  UserQ(["👤 User Query"])
  Embed["📐 Embedding Model"]
  VecDB[("📚 Vector Store")]
  Retriever["🔍 Retriever"]
  LLMNode["🧠 LLM / Generator"]
  Output(["✅ Response"])
  UserQ -->|query| Embed
  Embed -->|vector| VecDB
  VecDB -->|top-k chunks| Retriever
  Retriever -->|context + query| LLMNode
  LLMNode -->|generated answer| Output
  subgraph DetectedMemory["Detected memory stores"]
    det_detectedmemory_normalize_mermaid_artifact_9dba7231[("normalize-mermaid-artifact")]
  end
  VecDB -. "implemented by" .-> DetectedMemory
  subgraph DetectedTools["Agentic tool calls"]
    det_detectedtools_jose_parity_cdp_bdcde21d["🔧 jose-parity-cdp"]
  end
  LLMNode -->|tool use| DetectedTools
  DetectedTools -->|result| LLMNode
  classDef memNode fill:#555,color:#fff
  class VecDB,Retriever memNode
  classDef llmNode fill:#555,color:#fff
  class LLMNode,Embed llmNode
  classDef toolNode fill:#555,color:#fff
  class det_detectedtools_jose_parity_cdp_bdcde21d toolNode

```

## security

```mermaid
flowchart TD
  Untrusted["Untrusted input"]
  validate_coding_policy_29976175["validate-coding-policy"]
  Untrusted --> validate_coding_policy_29976175
  validate_css_policy_1c5ec854["validate-css-policy"]
  Untrusted --> validate_css_policy_1c5ec854
  setup_git_hooks_70750d40["setup-git-hooks"]
  Untrusted --> setup_git_hooks_70750d40
  classDef securityNode fill:#dc2626,color:#fff
  class validate_coding_policy_29976175,validate_css_policy_1c5ec854,setup_git_hooks_70750d40 securityNode

```

## sequence

```mermaid
sequenceDiagram
  actor capture_jose_reference_e7b66705 as capture-jose-reference
  actor check_public_api_docs_a9604f1b as check-public-api-docs
  participant changed_files_4c0102f6 as changed-files

  check_public_api_docs_a9604f1b->>changed_files_4c0102f6: calls
  changed_files_4c0102f6-->>check_public_api_docs_a9604f1b: response

```

## user

```mermaid
flowchart LR
  User(("User"))
  capture_jose_reference_e7b66705["capture-jose-reference"]
  User --> capture_jose_reference_e7b66705
  check_public_api_docs_a9604f1b["check-public-api-docs"]
  User --> check_public_api_docs_a9604f1b
  jose_parity_cdp_bdcde21d["jose-parity-cdp"]
  User --> jose_parity_cdp_bdcde21d
  smoke_pages_9a92b30d["smoke-pages"]
  User --> smoke_pages_9a92b30d
  validate_coding_policy_29976175["validate-coding-policy"]
  User --> validate_coding_policy_29976175
  validate_content_source_boundary_8a6f121b["validate-content-source-boundary"]
  User --> validate_content_source_boundary_8a6f121b
  validate_css_policy_1c5ec854["validate-css-policy"]
  User --> validate_css_policy_1c5ec854
  validate_design_system_b8a5f37c["validate-design-system"]
  User --> validate_design_system_b8a5f37c
  validate_page_surfaces_078ef6b6["validate-page-surfaces"]
  User --> validate_page_surfaces_078ef6b6
  validate_portfolio_content_6d36990e["validate-portfolio-content"]
  User --> validate_portfolio_content_6d36990e
  check_public_api_docs_a9604f1b --> changed_files_4c0102f6
  check_code_size_9c5efc3a --> changed_files_4c0102f6
  classDef userNode fill:#16a34a,color:#fff
  class capture_jose_reference_e7b66705,check_public_api_docs_a9604f1b,jose_parity_cdp_bdcde21d,smoke_pages_9a92b30d,validate_coding_policy_29976175,validate_content_source_boundary_8a6f121b,validate_css_policy_1c5ec854,validate_design_system_b8a5f37c,validate_page_surfaces_078ef6b6,validate_portfolio_content_6d36990e userNode

```
