import assert from 'node:assert/strict';

// Required observations survive even if an editor removes an operation from both indexes.
const focused = {
  'CASE-1': ['analysis-image', 'selection'],
  'CASE-2': ['selection'], 'CASE-2D': ['traverseGraph'], 'CASE-3': ['selection'], 'CASE-3A': ['selection'],
  'CASE-4': ['selection'], 'CASE-6': ['operator', 'version'], 'CASE-7': ['selection'], 'CASE-8': ['validateGraph'],
  'CASE-9': ['selection', 'page:0', 'page:1', 'page:2', 'page:3', 'page:99', 'filter:[]', "filter:['implements']", "filter:['unknown-edge']"],
  'CASE-9D': ['selection'], 'CASE-9N': ['selection'], 'CASE-9C': ['selection', 'no-relations'],
  'CASE-10': ['old-selection', 'extractContext'], 'CASE-11': ['selection', 'extractContext'],
  'CASE-11H': ['selection', 'extractContext', 'fragment-limit', 'byte-limit', 'exact-fit'],
  'CASE-11Z': ['selection', 'extractContext'], 'CASE-11A': ['selection:0', 'context:0'],
  'CASE-11AZ': ['selection:0', 'context:0', 'selection:1', 'context:1'], 'CASE-12': ['limit:0', 'limit:1'],
  'CASE-13': ['analysis-image', 'selection', 'extractContext', 'validation:partial', 'incoming:partial', 'validation:warning', 'incoming:warning'],
  'CASE-14': ['profile-image', 'validateGraph', 'lookupIdentifier', 'extractContext'],
};
export function checkCoverage(record, snapshot) {
  const operations = new Map(record.operations.map(o => [o.id, o]));
  const requireId = id => assert(operations.has(id), `${record.caseId} missing required observation ${id}`);
  for (const id of focused[record.caseId] ?? []) requireId(id);
  if (['CASE-4', 'CASE-7', 'CASE-13', 'CASE-14'].includes(record.caseId)) assert(record.identityAssertions);
  if (record.caseId === 'CASE-14') assert(record.inputMutation);
  if (record.caseId === 'CASE-13') assert.deepEqual(Object.keys(record.injectedStates).sort(), ['partial', 'warning']);
  if (['CASE-6', 'CASE-8', 'CASE-12', 'CASE-14'].includes(record.caseId)) return;
  requireId('validateGraph');
  for (const label of [...snapshot.identifiers.map(i => i.identifier), 'ABSENT-0']) {
    for (const [prefix, operation] of [['lookup', 'lookupIdentifier'], ['incoming', 'findIncoming'], ['outgoing', 'findOutgoing']]) {
      const id = `${prefix}:${label}`; requireId(id);
      assert.equal(operations.get(id).operation, operation); assert.equal(operations.get(id).arguments.identifier, label);
    }
    if (record.caseId.startsWith('LANG-')) {
      requireId(`root:${label}`);
      const i = snapshot.identifiers.find(i => i.identifier === label);
      if (i?.definition.status === 'resolved' && i.entityKind !== null) requireId(`context:${label}`);
    }
  }
}
