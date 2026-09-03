"use strict";
// lib/restoreProgress.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgress = exports.setProgress = void 0;
const restoreProgress = {};
function setProgress(id, data) {
    restoreProgress[id] = data;
}
exports.setProgress = setProgress;
function getProgress(id) {
    return restoreProgress[id];
}
exports.getProgress = getProgress;
