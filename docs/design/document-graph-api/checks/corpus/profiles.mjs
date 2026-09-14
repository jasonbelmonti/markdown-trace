import assert from 'node:assert/strict';
import { profileInput } from '../../examples/profile.ts';

export function checkProfiles(profiles) {
  assert.deepEqual(Object.keys(profiles).sort(), ['changed', 'empty', 'example', 'forbidden', 'language']);
  assert.deepEqual(profiles.example, profileInput, 'Example profile drift');
  for (const [name, profile] of Object.entries(profiles)) {
    assert.equal(profile.schemaVersion, 'markdown-trace.document-profile.v1');
    assert.equal(profile.interpretation.language, profileInput.interpretation.language);
    if (name !== 'changed') assert.deepEqual(profile.interpretation, profileInput.interpretation);
  }
  assert.deepEqual(profiles.forbidden, { ...profileInput, validation: { ...profileInput.validation, allowedRelations: [], rules: [] } });
  assert.deepEqual(profiles.empty, { ...profileInput, validation: { ...profileInput.validation, minEntities: 0, rules: [] } });
  assert.deepEqual(profiles.changed.interpretation.entityKinds, [
    { name: 'requirement', prefixes: ['REQ', 'WP'] }, { name: 'validation', prefixes: ['VAL'] },
  ]);
  assert.deepEqual(profiles.changed.validation, { minEntities: 0, allowedRelations: [], rules: [] });
  assert.deepEqual(profiles.language.validation, { minEntities: 0, allowedRelations: ['references', 'implements', 'verifies', 'custom-edge'].map(kind => ({
    kind, from: ['requirement', 'work', 'validation'], to: ['requirement', 'work', 'validation'],
  })), rules: [] });
}
