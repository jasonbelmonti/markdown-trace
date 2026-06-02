#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

before_state="$(mktemp)"
after_state="$(mktemp)"

cleanup() {
  rm -f "$before_state" "$after_state"
}

trap cleanup EXIT

capture_repository_state() {
  git status --porcelain --untracked-files=normal
  git diff --binary --no-ext-diff
}

capture_repository_state > "$before_state"

if [[ "${CI:-}" == "true" && -s "$before_state" ]]; then
  echo "CI enforcement requires a clean checkout before running checks." >&2
  git status --short --untracked-files=normal >&2
  exit 1
fi

npm run typecheck
npm test
npm run build
npm run validate:fixture
npm run derive:fixture
npm run migration:check

node dist/markdowntrace/cli.js derive-sidecar \
  --document fixtures/r1-link-backed-entity-syntax/minimal-link-backed-execution-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/minimal-type-profile.yaml \
  --check

node dist/markdowntrace/cli.js derive-sidecar \
  --document fixtures/r1-link-backed-entity-syntax/codefactory-link-backed-spec.md \
  --type-profile fixtures/r1-link-backed-entity-syntax/codefactory-type-profile.yaml \
  --check

capture_repository_state > "$after_state"

if ! diff -u "$before_state" "$after_state"; then
  echo "CI enforcement detected repository changes produced by the check sequence." >&2
  git status --short --untracked-files=normal >&2
  git diff --stat >&2
  exit 1
fi
