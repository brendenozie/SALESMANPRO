"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaAIActionRouter = void 0;
class MediaAIActionRouter {
    providers = [];
    register(provider) {
        this.providers.push(provider);
    }
    resolveProvider(action) {
        const provider = this.providers.find((item) => item.supports(action));
        if (!provider) {
            throw new Error(`No AI provider supports action: ${action}`);
        }
        return provider;
    }
    async execute(action, config, context) {
        const provider = this.resolveProvider(action);
        return provider.execute(action, config, context);
    }
}
exports.MediaAIActionRouter = MediaAIActionRouter;
