"""Registry YAML schema parsing for the R0 fixture family."""

from __future__ import annotations

from collections.abc import Callable, Mapping, Sequence
from typing import Any, TypeVar

from spectrace.registry.model import (
    Definition,
    EntityRegistry,
    ExpectedRange,
    ExpectedReferences,
    ExternalReference,
    RegistryDocument,
    RegistryEdge,
    RegistryEntity,
    RegistryLoadError,
)


Record = TypeVar("Record")


def parse_registry_data(raw_data: Any) -> EntityRegistry:
    """Convert parsed YAML data into trusted registry records."""

    data = _require_mapping(raw_data, "registry")
    entities = _parse_required_items(data.get("entities"), "entities", _parse_entity)
    _require_unique([entity.id for entity in entities], "entities[].id")
    _require_unique([entity.label for entity in entities], "entities[].label")

    return EntityRegistry(
        registry_version=_require_text(data.get("registryVersion"), "registryVersion"),
        document=_parse_document(data.get("document")),
        entities=entities,
        edges=_parse_required_items(data.get("edges"), "edges", _parse_edge),
        external_refs=_parse_optional_items(
            data.get("externalRefs"), "externalRefs", _parse_external_ref
        ),
    )


def _parse_document(raw_document: Any) -> RegistryDocument:
    document = _require_mapping(raw_document, "document")
    return RegistryDocument(
        id=_require_text(document.get("id"), "document.id"),
        title=_require_text(document.get("title"), "document.title"),
        path=_require_text(document.get("path"), "document.path"),
        fixture_family=_require_text(
            document.get("fixtureFamily"), "document.fixtureFamily"
        ),
        source_docs=_parse_required_text_items(
            document.get("sourceDocs"), "document.sourceDocs"
        ),
    )


def _parse_entity(raw_entity: Any, field: str) -> RegistryEntity:
    entity = _require_mapping(raw_entity, field)
    return RegistryEntity(
        id=_require_text(entity.get("id"), f"{field}.id"),
        label=_require_text(entity.get("label"), f"{field}.label"),
        type=_require_text(entity.get("type"), f"{field}.type"),
        defines=_parse_definition(entity.get("defines"), f"{field}.defines"),
        expected_references=_parse_expected_references(
            entity.get("expectedReferences"), f"{field}.expectedReferences"
        ),
    )


def _parse_definition(raw_definition: Any, field: str) -> Definition:
    definition = _require_mapping(raw_definition, field)
    return Definition(
        kind=_require_text(definition.get("kind"), f"{field}.kind"),
        text=_require_text(definition.get("text"), f"{field}.text"),
    )


def _parse_expected_references(raw_references: Any, field: str) -> ExpectedReferences:
    if raw_references is None:
        return ExpectedReferences()

    references = _require_mapping(raw_references, field)
    labels = _parse_optional_text_items(references.get("labels"), f"{field}.labels")
    ranges = _parse_optional_items(
        references.get("ranges"), f"{field}.ranges", _parse_expected_range
    )
    return ExpectedReferences(labels=labels, ranges=ranges)


def _parse_expected_range(raw_range: Any, field: str) -> ExpectedRange:
    expected_range = _require_mapping(raw_range, field)
    return ExpectedRange(
        label_family=_require_text(
            expected_range.get("labelFamily"), f"{field}.labelFamily"
        ),
        start=_require_text(expected_range.get("start"), f"{field}.start"),
        end=_require_text(expected_range.get("end"), f"{field}.end"),
        expands_to=_parse_required_text_items(
            expected_range.get("expandsTo"), f"{field}.expandsTo"
        ),
    )


def _parse_edge(raw_edge: Any, field: str) -> RegistryEdge:
    edge = _require_mapping(raw_edge, field)
    return RegistryEdge(
        source=_require_text(edge.get("from"), f"{field}.from"),
        relationship=_require_text(edge.get("relationship"), f"{field}.relationship"),
        target=_require_text(edge.get("to"), f"{field}.to"),
    )


def _parse_external_ref(raw_external_ref: Any, field: str) -> ExternalReference:
    external_ref = _require_mapping(raw_external_ref, field)
    return ExternalReference(
        system=_require_text(external_ref.get("system"), f"{field}.system"),
        key=_require_text(external_ref.get("key"), f"{field}.key"),
        related_entity=_require_text(
            external_ref.get("relatedEntity"), f"{field}.relatedEntity"
        ),
        role=_require_text(external_ref.get("role"), f"{field}.role"),
    )


def _require_mapping(value: Any, field: str) -> Mapping[str, Any]:
    if not isinstance(value, Mapping):
        raise RegistryLoadError(f"{field} must be a mapping")
    return value


def _require_sequence(value: Any, field: str) -> Sequence[Any]:
    if isinstance(value, str) or not isinstance(value, Sequence):
        raise RegistryLoadError(f"{field} must be a list")
    return value


def _require_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise RegistryLoadError(f"{field} must be a non-empty string")
    return value


def _parse_required_items(
    value: Any,
    field: str,
    parser: Callable[[Any, str], Record],
) -> tuple[Record, ...]:
    return _parse_items(_require_sequence(value, field), field, parser)


def _parse_optional_items(
    value: Any,
    field: str,
    parser: Callable[[Any, str], Record],
) -> tuple[Record, ...]:
    if value is None:
        return ()
    return _parse_items(_require_sequence(value, field), field, parser)


def _parse_required_text_items(value: Any, field: str) -> tuple[str, ...]:
    return _parse_text_items(_require_sequence(value, field), field)


def _parse_optional_text_items(value: Any, field: str) -> tuple[str, ...]:
    if value is None:
        return ()
    return _parse_text_items(_require_sequence(value, field), field)


def _parse_items(
    values: Sequence[Any],
    field: str,
    parser: Callable[[Any, str], Record],
) -> tuple[Record, ...]:
    return tuple(
        parser(item, f"{field}[{index}]") for index, item in enumerate(values)
    )


def _parse_text_items(values: Sequence[Any], field: str) -> tuple[str, ...]:
    return tuple(
        _require_text(item, f"{field}[{index}]")
        for index, item in enumerate(values)
    )


def _require_unique(values: Sequence[str], field: str) -> None:
    seen: set[str] = set()
    for value in values:
        if value in seen:
            raise RegistryLoadError(f"{field} contains duplicate value {value!r}")
        seen.add(value)
