"""Typed records for the R0 document-local entity registry."""

from __future__ import annotations

from dataclasses import dataclass


class RegistryLoadError(ValueError):
    """Raised when a registry file cannot be loaded into R0 records."""


@dataclass(frozen=True)
class Definition:
    kind: str
    text: str


@dataclass(frozen=True)
class ExpectedRange:
    label_family: str
    start: str
    end: str
    expands_to: tuple[str, ...]


@dataclass(frozen=True)
class ExpectedReferences:
    labels: tuple[str, ...] = ()
    ranges: tuple[ExpectedRange, ...] = ()


@dataclass(frozen=True)
class RegistryEntity:
    id: str
    label: str
    type: str
    defines: Definition
    expected_references: ExpectedReferences


@dataclass(frozen=True)
class RegistryEdge:
    source: str
    relationship: str
    target: str


@dataclass(frozen=True)
class ExternalReference:
    system: str
    key: str
    related_entity: str
    role: str


@dataclass(frozen=True)
class RegistryDocument:
    id: str
    title: str
    path: str
    fixture_family: str
    source_docs: tuple[str, ...]


@dataclass(frozen=True)
class EntityRegistry:
    registry_version: str
    document: RegistryDocument
    entities: tuple[RegistryEntity, ...]
    edges: tuple[RegistryEdge, ...]
    external_refs: tuple[ExternalReference, ...]

    @property
    def entities_by_id(self) -> dict[str, RegistryEntity]:
        return {entity.id: entity for entity in self.entities}

    @property
    def entities_by_label(self) -> dict[str, RegistryEntity]:
        return {entity.label: entity for entity in self.entities}
