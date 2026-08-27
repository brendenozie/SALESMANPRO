export class MediaAIError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "MediaAIError";
  }
}

export class ProviderNotAvailableError extends MediaAIError {
  constructor(action: string) {
    super(
      `No AI provider available for action: ${action}`,
      "PROVIDER_UNAVAILABLE",
    );
  }
}
