"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIImageProvider = void 0;
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai")); // npm install openai
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
class OpenAIImageProvider {
    name = "OpenAI_DALL_E";
    supports(action) {
        return action === client_1.MediaAIAction.GENERATE_IMAGE || action === client_1.MediaAIAction.EDIT_IMAGE;
    }
    async execute(action, config, context) {
        if (action === client_1.MediaAIAction.GENERATE_IMAGE) {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: config.prompt || "A generic placeholder",
                n: 1,
                size: "1024x1024",
            });
            return {
                url: response.data?.[0]?.url,
                mimeType: "image/png",
                provider: this.name,
                model: "dall-e-3",
            };
        }
        throw new Error("Action execution not implemented yet for this provider");
    }
}
exports.OpenAIImageProvider = OpenAIImageProvider;
