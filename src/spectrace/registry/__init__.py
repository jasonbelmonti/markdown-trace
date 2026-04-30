"""Registry loading interface for SpecTrace."""

from spectrace.registry.loader import load_registry
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

__all__ = [
    "Definition",
    "EntityRegistry",
    "ExpectedRange",
    "ExpectedReferences",
    "ExternalReference",
    "RegistryDocument",
    "RegistryEdge",
    "RegistryEntity",
    "RegistryLoadError",
    "load_registry",
]
