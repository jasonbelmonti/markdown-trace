"""YAML loader for the R0 document-local entity registry."""

from __future__ import annotations

from pathlib import Path

import yaml

from spectrace.registry.model import EntityRegistry
from spectrace.registry.schema import parse_registry_data


def load_registry(path: str | Path) -> EntityRegistry:
    """Load a document-local registry from an explicit YAML path."""

    registry_path = Path(path)
    raw_data = yaml.safe_load(registry_path.read_text(encoding="utf-8"))
    return parse_registry_data(raw_data)
