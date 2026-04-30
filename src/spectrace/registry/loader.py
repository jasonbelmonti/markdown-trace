"""YAML loader for the R0 document-local entity registry."""

from __future__ import annotations

from pathlib import Path

import yaml

from spectrace.registry.model import EntityRegistry, RegistryLoadError
from spectrace.registry.schema import parse_registry_data


def load_registry(path: str | Path) -> EntityRegistry:
    """Load a document-local registry from an explicit YAML path."""

    registry_path = Path(path)
    try:
        documents = tuple(
            yaml.safe_load_all(registry_path.read_text(encoding="utf-8"))
        )
    except yaml.YAMLError as error:
        raise RegistryLoadError(
            f"{registry_path} contains invalid YAML"
        ) from error

    if len(documents) != 1:
        raise RegistryLoadError(
            f"{registry_path} must contain exactly one YAML document"
        )

    [raw_data] = documents
    return parse_registry_data(raw_data)
