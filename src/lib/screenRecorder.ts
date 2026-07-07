/**
 * screenRecorder.ts
 *
 * LEGACY: Screen capture via getDisplayMedia has been replaced by
 * canvasVideoRenderer.ts which generates videos programmatically.
 *
 * This file is kept only to avoid breaking any remaining imports.
 * downloadBlob is re-exported from canvasVideoRenderer.
 */

export { downloadBlob } from "./canvasVideoRenderer";
