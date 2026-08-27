"use client";

import { useState } from "react";

import type {
  MediaAIAction,
  MediaAsset,
} from "@/lib/media/contracts";

interface AIMediaStudioProps {
  media?: MediaAsset;

  onJobCreated?: (jobId: string) => void;

  onClose?: () => void;
}

const actions: {
  id: MediaAIAction;
  label: string;
  description: string;
}[] = [
  {
    id: "GENERATE_IMAGE",
    label: "Generate Image",
    description:
      "Create a new image from a description.",
  },
  {
    id: "EDIT_IMAGE",
    label: "Edit Image",
    description:
      "Modify an existing image.",
  },
  {
    id: "ENHANCE_IMAGE",
    label: "Enhance",
    description:
      "Improve quality, lighting and clarity.",
  },
  {
    id: "REMOVE_BACKGROUND",
    label: "Remove Background",
    description:
      "Automatically isolate the subject.",
  },
  {
    id: "REPLACE_BACKGROUND",
    label: "Replace Background",
    description:
      "Create a new background while preserving the subject.",
  },
  {
    id: "UPSCALE_IMAGE",
    label: "Upscale",
    description:
      "Increase image resolution.",
  },
  {
    id: "GENERATE_PRODUCT_IMAGE",
    label: "Product Photo",
    description:
      "Create a professional marketplace product image.",
  },
  {
    id: "GENERATE_THUMBNAIL",
    label: "Thumbnail",
    description:
      "Generate an optimized thumbnail.",
  },
];

export function AIMediaStudio({
  media,
  onJobCreated,
  onClose,
}: AIMediaStudioProps) {
  const [action, setAction] =
    useState<MediaAIAction>(
      media
        ? "EDIT_IMAGE"
        : "GENERATE_IMAGE"
    );

  const [prompt, setPrompt] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function execute() {
    setLoading(true);

    try {
      const response = await fetch(
        "/api/media/ai",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            mediaId: media?.id,

            action,

            config: {
              action,

              prompt,

              preserveSubject:
                action ===
                "REPLACE_BACKGROUND",
            },
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create AI job"
        );
      }

      onJobCreated?.(data.job.id);

      onClose?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">
          AI Media Studio
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Create or transform your media.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setAction(item.id)
              }
              className={`rounded-xl border p-4 text-left transition ${
                action === item.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">
                {item.label}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                {item.description}
              </div>
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(event) =>
            setPrompt(event.target.value)
          }
          placeholder={
            action ===
            "GENERATE_IMAGE"
              ? "Describe the image you want..."
              : "Describe the changes you want..."
          }
          className="min-h-32 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2 text-sm"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={execute}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Starting..."
              : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}