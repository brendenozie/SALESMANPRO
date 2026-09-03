"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderNotAvailableError = exports.MediaAIError = void 0;
class MediaAIError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "MediaAIError";
    }
}
exports.MediaAIError = MediaAIError;
class ProviderNotAvailableError extends MediaAIError {
    constructor(action) {
        super(`No AI provider available for action: ${action}`, "PROVIDER_UNAVAILABLE");
    }
}
exports.ProviderNotAvailableError = ProviderNotAvailableError;
