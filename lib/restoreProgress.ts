// lib/restoreProgress.ts

const restoreProgress: Record<string, any> = {};

export function setProgress(id: string, data: any) {
  restoreProgress[id] = data;
}

export function getProgress(id: string) {
  return restoreProgress[id];
}