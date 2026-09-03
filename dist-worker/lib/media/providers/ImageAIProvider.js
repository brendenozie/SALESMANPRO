"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageAIProvider = void 0;
class ImageAIProvider {
    supports(action) {
        return [
            "GENERATE_IMAGE",
            "EDIT_IMAGE",
            "ENHANCE_IMAGE",
            "REMOVE_BACKGROUND",
            "REPLACE_BACKGROUND",
            "UPSCALE_IMAGE",
            "GENERATE_PRODUCT_IMAGE",
            "GENERATE_THUMBNAIL",
        ].includes(action);
    }
    async execute(action, config, context) {
        switch (action) {
            case "GENERATE_IMAGE":
                return this.generate(config);
            case "EDIT_IMAGE":
                return this.edit(config, context);
            case "ENHANCE_IMAGE":
                return this.enhance(config, context);
            case "REMOVE_BACKGROUND":
                return this.removeBackground(config, context);
            case "REPLACE_BACKGROUND":
                return this.replaceBackground(config, context);
            case "UPSCALE_IMAGE":
                return this.upscale(config, context);
            case "GENERATE_PRODUCT_IMAGE":
                return this.generateProductImage(config, context);
            case "GENERATE_THUMBNAIL":
                return this.thumbnail(config, context);
            default:
                throw new Error(`Unsupported image action: ${action}`);
        }
    }
    async generate(config) {
        throw new Error("Connect image generation provider");
    }
    async edit(config, context) {
        throw new Error("Connect image editing provider");
    }
    async enhance(config, context) {
        throw new Error("Connect image enhancement provider");
    }
    async removeBackground(config, context) {
        throw new Error("Connect background removal provider");
    }
    async replaceBackground(config, context) {
        throw new Error("Connect background replacement provider");
    }
    async upscale(config, context) {
        throw new Error("Connect upscaling provider");
    }
    async generateProductImage(config, context) {
        throw new Error("Connect product-image provider");
    }
    async thumbnail(config, context) {
        throw new Error("Connect thumbnail provider");
    }
}
exports.ImageAIProvider = ImageAIProvider;
