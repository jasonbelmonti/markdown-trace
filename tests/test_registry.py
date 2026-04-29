import re
import unittest
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = REPO_ROOT / "fixtures/r0-document-local-registry/entity-registry.yaml"
DOCUMENT_PATH = REPO_ROOT / "fixtures/r0-document-local-registry/execution-spec.md"
VARIANTS_PATH = REPO_ROOT / "tests/fixtures/registry-variants.yaml"


class RegistryFixtureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = yaml.safe_load(REGISTRY_PATH.read_text(encoding="utf-8"))
        cls.document_text = DOCUMENT_PATH.read_text(encoding="utf-8")
        cls.variants = yaml.safe_load(VARIANTS_PATH.read_text(encoding="utf-8"))

    def test_registry_points_at_existing_fixture_document(self):
        document = self.registry["document"]

        self.assertEqual(
            document["path"],
            "fixtures/r0-document-local-registry/execution-spec.md",
        )
        self.assertTrue((REPO_ROOT / document["path"]).is_file())
        self.assertEqual(document["fixtureFamily"], "r0-document-local-registry")

    def test_val_1_registry_shape_separates_identity_label_type_and_definitions(self):
        entities = self.registry["entities"]

        self.assertIsInstance(self.registry["document"], dict)
        self.assertIsInstance(entities, list)
        self.assertIsInstance(self.registry["edges"], list)
        self.assertIsInstance(self.registry["externalRefs"], list)

        for entity in entities:
            with self.subTest(entity=entity["id"]):
                self.assertRegex(entity["id"], r"^[a-z]+(?:\.[a-z0-9]+)+$")
                self.assertRegex(entity["label"], r"^[A-Z]+-\d+$")
                self.assertNotEqual(entity["id"], entity["label"])
                self.assertRegex(entity["type"], r"^[a-z]+(?:_[a-z]+)*$")
                self.assertEqual(entity["defines"]["kind"], "heading")
                self.assertIn(entity["defines"]["text"], self.document_text)

    def test_declared_edges_use_canonical_ids_and_resolve_to_registered_entities(self):
        canonical_ids = {entity["id"] for entity in self.registry["entities"]}

        for edge in self.registry["edges"]:
            with self.subTest(edge=edge):
                self.assertIn(edge["from"], canonical_ids)
                self.assertIn(edge["to"], canonical_ids)
                self.assertRegex(edge["relationship"], r"^[a-z]+(?:_[a-z]+)*$")
                self.assertNotRegex(edge["from"], r"^[A-Z]+-\d+$")
                self.assertNotRegex(edge["to"], r"^[A-Z]+-\d+$")

    def test_external_refs_are_separate_from_document_entities(self):
        entity_labels = {entity["label"] for entity in self.registry["entities"]}
        canonical_ids = {entity["id"] for entity in self.registry["entities"]}
        issue_key_pattern = re.compile(r"\b[A-Z]+-\d+\b")

        for external_ref in self.registry["externalRefs"]:
            with self.subTest(external_ref=external_ref):
                self.assertIn(external_ref["relatedEntity"], canonical_ids)
                self.assertNotIn(external_ref["key"], entity_labels)
                self.assertIn("system", external_ref)
                self.assertIn("role", external_ref)

        issue_like_tokens = set(issue_key_pattern.findall(self.document_text))
        self.assertIn("BEL-858", issue_like_tokens)
        self.assertNotIn("BEL-858", entity_labels)

    def test_variant_inventory_covers_required_negative_categories(self):
        expected_categories = {
            "missing-registered-definition",
            "duplicate-canonical-id",
            "duplicate-label",
            "missing-reference",
            "missing-edge-target",
            "incomplete-bounded-range",
        }
        actual_categories = {
            variant["category"] for variant in self.variants["variants"]
        }

        self.assertEqual(
            self.variants["baseDocument"],
            "fixtures/r0-document-local-registry/execution-spec.md",
        )
        self.assertEqual(
            self.variants["baseRegistry"],
            "fixtures/r0-document-local-registry/entity-registry.yaml",
        )
        self.assertLessEqual(expected_categories, actual_categories)

    def test_variant_inventory_declares_expected_findings_and_mutations(self):
        for variant in self.variants["variants"]:
            with self.subTest(variant=variant["name"]):
                self.assertIn("expectedFinding", variant)
                self.assertIn("sourceRequirement", variant)
                self.assertIn("mutation", variant)
                self.assertIn("target", variant["mutation"])
                self.assertIn("operation", variant["mutation"])


if __name__ == "__main__":
    unittest.main()
