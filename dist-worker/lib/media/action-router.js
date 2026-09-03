"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = exports.MediaAIActionRouter = void 0;
const errors_1 = require("./errors");
class MediaAIActionRouter {
    providers = [];
    register(provider) {
        this.providers.push(provider);
    }
    getProviderForAction(action) {
        // Basic routing: grab the first provider that supports this action
        // In production, you can add cost/speed/availability logic here
        const provider = this.providers.find((p) => p.supports(action));
        if (!provider) {
            throw new errors_1.ProviderNotAvailableError(action);
        }
        return provider;
    }
    async execute(action, config, context) {
        const provider = this.getProviderForAction(action);
        return provider.execute(action, config, context);
    }
}
exports.MediaAIActionRouter = MediaAIActionRouter;
exports.aiRouter = new MediaAIActionRouter();
