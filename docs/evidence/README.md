# Test-consumed evidence

Ten existing payloads remain because tests or fixture commands consume them. They are compatibility data, not current plans or approval records.

| Payload | Consumer |
| --- | --- |
| `generated-design-spec-demo.md` | R0 extractor source fixture |
| `valid-fixture-report.md` | CLI fixture/check |
| `negative-fixture-report.md` | Negative evidence test |
| `determinism-repeat-report.md`, `issue-key-collision-report.md`, `local-safety-report.md` | WP4 evidence tests/builders |
| `r3-baseline-regression-suite-status.md` | Migration regression test |
| `r3-no-write-migration-check-failures.md` | Migration no-write test |
| `r3-r2-fixture-profile-coverage-matrix.md` | Migration coverage test |
| `r3-yaml-compatibility-and-sidecar-byte-stability.md` | Migration compatibility test |

Keep payload bytes aligned with their tests. Their dates, milestone labels, decisions, and old path strings describe historical scenarios and do not authorize new work. Unused reports were deleted; Git baseline `016dd09` retains their history. Start current work at the [documentation map](../README.md).
