// The colony's rules, as one pure module: newColony, step and play; the derivations every screen
// reads; the save. The story engine (packages/engine) is joined to it in Phase 2 (docs/DESIGN.md).
export * from './numbers';
export * from './types';
export * from './derive';
export { newColony, step, play, standsNow, type PlayOptions } from './turn';
export { toSave, fromSave, SAVE_VERSION, SAVE_FORMAT, type ColonySave } from './save';
