import sys
import tempfile
import unittest
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
SRC_ROOT = REPO_ROOT / "src"
sys.path.insert(0, str(SRC_ROOT))

from spectrace.registry import RegistryLoadError, load_registry  # noqa: E402


REGISTRY_PATH = (
    REPO_ROOT / "fixtures/r0-document-local-registry/entity-registry.yaml"
)


class RegistryLoaderTests(unittest.TestCase):
    def test_load_registry_preserves_document_metadata(self):
        registry = load_registry(REGISTRY_PATH)

        self.assertEqual(
            registry.registry_version,
            "spec-trace.r0.document-local-registry.v0",
        )
        self.assertEqual(registry.document.id, "spec-trace.r0.fixture.execution")
        self.assertEqual(
            registry.document.path,
            "fixtures/r0-document-local-registry/execution-spec.md",
        )
        self.assertEqual(registry.document.fixture_family, "r0-document-local-registry")
        self.assertEqual(
            registry.document.source_docs,
            (
                "docs/spec-trace-r0-document-local-entity-registry.md",
                "docs/spec-trace-e0-document-local-entity-registry-execution.md",
            ),
        )

    def test_load_registry_preserves_canonical_ids_separate_from_labels(self):
        registry = load_registry(REGISTRY_PATH)
        entity = registry.entities_by_id["exec.wp.1"]

        self.assertEqual(entity.id, "exec.wp.1")
        self.assertEqual(entity.label, "WP-1")
        self.assertNotEqual(entity.id, entity.label)
        self.assertIs(registry.entities_by_label["WP-1"], entity)

    def test_load_registry_preserves_definitions_and_expected_references(self):
        registry = load_registry(REGISTRY_PATH)
        entity = registry.entities_by_id["exec.wp.1"]

        self.assertEqual(entity.defines.kind, "heading")
        self.assertEqual(
            entity.defines.text,
            "### WP-1: Create fixture family, YAML registry shape, and test scaffolding",
        )
        self.assertEqual(
            entity.expected_references.labels,
            (
                "CON-1",
                "CON-2",
                "CON-3",
                "PKG-1",
                "PKG-4",
                "VAL-1",
                "EVD-1",
                "WP-2",
            ),
        )
        [expected_range] = entity.expected_references.ranges
        self.assertEqual(expected_range.label_family, "CON")
        self.assertEqual(expected_range.start, "CON-1")
        self.assertEqual(expected_range.end, "CON-3")
        self.assertEqual(expected_range.expands_to, ("CON-1", "CON-2", "CON-3"))

    def test_load_registry_preserves_edges_and_external_references(self):
        registry = load_registry(REGISTRY_PATH)

        self.assertIn(
            ("exec.wp.1", "blocks", "exec.wp.2"),
            {(edge.source, edge.relationship, edge.target) for edge in registry.edges},
        )
        self.assertIn(
            ("linear", "BEL-893", "exec.wp.1", "task_of_record"),
            {
                (
                    external_ref.system,
                    external_ref.key,
                    external_ref.related_entity,
                    external_ref.role,
                )
                for external_ref in registry.external_refs
            },
        )

    def test_load_registry_accepts_omitted_external_references(self):
        raw_registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
        raw_registry.pop("externalRefs")

        with tempfile.TemporaryDirectory() as tmp_dir:
            registry_path = Path(tmp_dir) / "registry-without-external-refs.yaml"
            registry_path.write_text(yaml.safe_dump(raw_registry), encoding="utf-8")

            registry = load_registry(registry_path)

        self.assertEqual(registry.external_refs, ())
        self.assertIn("exec.wp.1", registry.entities_by_id)

    def test_load_registry_rejects_duplicate_canonical_ids(self):
        raw_registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
        raw_registry["entities"].append(dict(raw_registry["entities"][0]))

        with tempfile.TemporaryDirectory() as tmp_dir:
            duplicate_path = Path(tmp_dir) / "duplicate-registry.yaml"
            duplicate_path.write_text(yaml.safe_dump(raw_registry), encoding="utf-8")

            with self.assertRaisesRegex(
                RegistryLoadError,
                "entities\\[\\]\\.id contains duplicate value 'exec.con.1'",
            ):
                load_registry(duplicate_path)

    def test_load_registry_rejects_duplicate_labels(self):
        raw_registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
        duplicate_entity = dict(raw_registry["entities"][0])
        duplicate_entity["id"] = "exec.con.99"
        raw_registry["entities"].append(duplicate_entity)

        with tempfile.TemporaryDirectory() as tmp_dir:
            duplicate_path = Path(tmp_dir) / "duplicate-registry.yaml"
            duplicate_path.write_text(yaml.safe_dump(raw_registry), encoding="utf-8")

            with self.assertRaisesRegex(
                RegistryLoadError,
                "entities\\[\\]\\.label contains duplicate value 'CON-1'",
            ):
                load_registry(duplicate_path)


if __name__ == "__main__":
    unittest.main()
