# SpecTrace R0 Fixture Execution Spec

## Fixture Purpose

This fixture is a compact execution-spec family for the document-local entity
registry prototype. It is derived from the R0 and E0 source documents and keeps
the registry experiment local, deterministic, and read-only.

The Linear-style issue key BEL-858 appears here as source context. It is not a
SpecTrace document entity unless a registry entry explicitly lists it under
externalRefs.

## Constraints

### CON-1: Single fixture family

The prototype uses one fixture family, one source execution spec, and one
document-local registry. Broken cases are generated mutations of this family.

### CON-2: YAML registry format

The registry source of truth is a sidecar YAML file.

### CON-3: Canonical ID syntax

Canonical entity IDs use dotted lowercase syntax such as exec.wp.1. Display
labels remain human-readable labels such as WP-1.

## Package Boundaries

### PKG-1: Registry model and loader

PKG-1 owns registry schema, canonical IDs, display labels, entity types,
definition expectations, declared edges, external references, and local YAML
load diagnostics.

### PKG-4: Fixture harness and evidence paths

PKG-4 owns fixture inventory, evidence artifact paths, and local operator
inspection support for WP-1.

## Work Packages

### WP-1: Create fixture family, YAML registry shape, and test scaffolding

WP-1 establishes the fixture family and sidecar registry for VAL-1. It depends
on CON-1 through CON-3, uses PKG-1 and PKG-4, produces EVD-1, and blocks WP-2.

### WP-2: Implement first valid end-to-end validation path

WP-2 will consume the WP-1 fixture and registry to prove the valid local path.
It supports VAL-2 and is reviewed at MS-1.

### WP-3: Implement required negative validation categories

WP-3 will apply generated broken variants for duplicate canonical IDs,
duplicate labels, missing registered definitions, missing references, missing
edge targets, and incomplete bounded ranges. It supports VAL-3.

## Milestones

### MS-1: Approve first valid-fixture proof

MS-1 reviews VAL-1 and VAL-2 evidence before expanding into negative validation
breadth.

## Validation Checkpoints

### VAL-1: Registry schema inspection

VAL-1 verifies that the registry separates canonical IDs, display labels,
entity types, definition expectations, edges, and external references.

### VAL-2: Valid fixture proof

VAL-2 will verify that the valid fixture produces a passing report with
registered definitions resolved.

### VAL-3: Negative variant proof

VAL-3 will verify that generated broken variants produce expected finding
categories.

## Evidence

### EVD-1: Registry fixture inventory

EVD-1 captures the fixture family, variant inventory, registry fields, declared
edges, and external references for MS-1 review.

### EVD-2: Valid fixture validation report

EVD-2 will capture the first passing validation report after WP-2 implements
runtime validation.
