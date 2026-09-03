const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Fieldcraft contract error: ${label} must be an object`);
  return value;
};
const array = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`Fieldcraft contract error: ${label} must be an array`);
  return value;
};
const number = (value, label) => {
  if (!Number.isFinite(value)) throw new Error(`Fieldcraft contract error: ${label} must be a finite number`);
  return value;
};
const string = (value, label) => {
  if (typeof value !== "string" || value.length === 0) throw new Error(`Fieldcraft contract error: ${label} must be a non-empty string`);
  return value;
};
const exactKeys = (value, allowed, label) => {
  const extras = Object.keys(value).filter((key) => !allowed.includes(key));
  if (extras.length > 0) throw new Error(`Fieldcraft contract error: ${label} has unknown keys: ${extras.join(", ")}`);
  return value;
};
export function parseFieldcraftJson(text, label = "JSON") {
  try { return JSON.parse(text); }
  catch (error) { throw new Error(`Fieldcraft contract error: ${label} is invalid JSON: ${error.message}`); }
}
export function parseSceneContract(value) {
  const contract = exactKeys(object(value, "scene contract"), ["schemaVersion","viewport","sectionHeight","colors","tolerances","requiredVisualMatrix","requiredStates","scenes"], "scene contract");
  number(contract.schemaVersion, "scene contract.schemaVersion");
  const viewport = object(contract.viewport, "scene contract.viewport");
  number(viewport.width, "scene contract.viewport.width"); number(viewport.height, "scene contract.viewport.height");
  object(contract.colors, "scene contract.colors"); object(contract.tolerances, "scene contract.tolerances");
  object(contract.requiredVisualMatrix, "scene contract.requiredVisualMatrix");
  array(contract.requiredStates, "scene contract.requiredStates").forEach((entry, index) => string(entry, `scene contract.requiredStates[${index}]`));
  array(contract.scenes, "scene contract.scenes").forEach((scene, index) => {
    object(scene, `scene contract.scenes[${index}]`); number(scene.index, `scene contract.scenes[${index}].index`);
    string(scene.name, `scene contract.scenes[${index}].name`); object(scene.heading, `scene contract.scenes[${index}].heading`);
  });
  return contract;
}
export function parseInternalRegionContract(value) {
  const contract = object(value, "internal-region contract");
  number(contract.schemaVersion, "internal-region contract.schemaVersion"); object(contract.viewport, "internal-region contract.viewport");
  object(contract.modalShell, "internal-region contract.modalShell"); array(contract.modalVariants, "internal-region contract.modalVariants");
  array(contract.scenes, "internal-region contract.scenes").forEach((scene, index) => {
    object(scene, `internal-region contract.scenes[${index}]`); number(scene.index, `internal-region contract.scenes[${index}].index`);
    object(scene.regions, `internal-region contract.scenes[${index}].regions`); array(scene.collisionPairs, `internal-region contract.scenes[${index}].collisionPairs`);
  });
  return contract;
}
export function parseEvaluationPolicy(value) {
  const policy = exactKeys(object(value, "evaluation policy"), ["schemaVersion","authority","viewport","captureConditions","pixelMismatchLimit","pixelmatchThreshold","geometryTolerances","requiredLanes","admissionRule","builderMayRead","builderMayChangeThresholds","capturedStates","blockedStates"], "evaluation policy");
  number(policy.schemaVersion, "evaluation policy.schemaVersion"); string(policy.authority, "evaluation policy.authority");
  object(policy.viewport, "evaluation policy.viewport"); object(policy.captureConditions, "evaluation policy.captureConditions");
  number(policy.pixelMismatchLimit, "evaluation policy.pixelMismatchLimit"); number(policy.pixelmatchThreshold, "evaluation policy.pixelmatchThreshold");
  array(policy.requiredLanes, "evaluation policy.requiredLanes").forEach((lane, index) => string(lane, `evaluation policy.requiredLanes[${index}]`));
  if (policy.builderMayRead !== false || policy.builderMayChangeThresholds !== false) throw new Error("Fieldcraft contract error: evaluation policy must keep builder access and threshold changes disabled");
  object(policy.capturedStates, "evaluation policy.capturedStates"); object(policy.blockedStates, "evaluation policy.blockedStates");
  return policy;
}
export function parseReferenceManifest(value) {
  const manifest = exactKeys(object(value, "reference manifest"), ["schemaVersion","generatedAt","authority","policySha256","captureCount","captures","claimsBoundary"], "reference manifest");
  number(manifest.schemaVersion, "reference manifest.schemaVersion"); string(manifest.authority, "reference manifest.authority");
  string(manifest.policySha256, "reference manifest.policySha256"); number(manifest.captureCount, "reference manifest.captureCount");
  array(manifest.captures, "reference manifest.captures").forEach((capture, index) => {
    object(capture, `reference manifest.captures[${index}]`); string(capture.path, `reference manifest.captures[${index}].path`);
    string(capture.sha256, `reference manifest.captures[${index}].sha256`); number(capture.bytes, `reference manifest.captures[${index}].bytes`);
  });
  if (manifest.captureCount !== manifest.captures.length) throw new Error("Fieldcraft contract error: reference manifest captureCount does not match captures");
  return manifest;
}

export function assertReferenceBinding(policyDigest, policy, manifest) {
  if (manifest.policySha256 !== policyDigest || manifest.authority !== policy.authority) {
    throw new Error("Fieldcraft reference manifest is not bound to the sealed evaluation policy");
  }
}

export function requiredEvidencePasses(requiredLanes, laneEvidence, stateCoverage) {
  return requiredLanes.every((lane) => laneEvidence[lane] === "pass") &&
    Object.values(stateCoverage).every((state) => state.status === "pass");
}
