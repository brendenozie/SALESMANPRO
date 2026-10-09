"use strict";
/**
 * lib/pdf-editor/model/types.ts
 *
 * Canonical, isomorphic (server + browser) editable PDF document model.
 *
 * COORDINATE SYSTEM (canonical for the whole module):
 *   - Origin: top-left of the page's MediaBox
 *   - X grows right, Y grows down
 *   - Unit: PDF points (1/72 inch)
 *   - Geometry is expressed in the UNROTATED page space. Page /Rotate is a
 *     separate discrete property (0 | 90 | 180 | 270).
 * Conversion to/from PDF user space (bottom-left origin) happens only at the
 * engine boundary (lib/pdf-editor/engine/*).
 */
Object.defineProperty(exports, "__esModule", { value: true });
