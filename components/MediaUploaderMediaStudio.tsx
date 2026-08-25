"use client";

import {
  useCallback,
  useState,
} from "react";

import type {
  MediaAsset,
  MediaType,
} from "@/lib/media/contracts";

import { AIMediaStudio } from "./AIMediaStudio";

interface MediaUploaderProps {
  value?: MediaAsset[];

  onChange?: (
    media: MediaAsset[]
  ) => void;

  tenantId?: string;

  multiple?: boolean;

  accept?: string;
}

export function MediaUploader({
  value = [],
  onChange,
  tenantId,
  multiple = true,
  accept = "image/*,video/*,.pdf,.epub,.mobi",
}: MediaUploaderProps) {
  const [media, setMedia] =
    useState<MediaAsset[]>(value);

  const [showAI, setShowAI] =
    useState(false);

  const updateMedia = useCallback(
    (next: MediaAsset[]) => {
      setMedia(next);
      onChange?.(next);
    },
    [onChange]
  );

  async function uploadFiles(
    files: File[]
  ) {
    for (const file of files) {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      if (tenantId) {
        formData.append(
          "tenantId",
          tenantId
        );
      }

      const response =
        await fetch(
          "/api/media/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      if (!response.ok) {
        throw new Error(
          "Media upload failed"
        );
      }

      const data =
        await response.json();

      updateMedia([
        ...media,
        data.media,
      ]);
    }
  }

  function handleFiles(
    files: FileList | null
  ) {
    if (!files) return;

    const selected =
      Array.from(files);

    uploadFiles(
      multiple
        ? selected
        : selected.slice(0, 1)
    ).catch(console.error);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center hover:border-indigo-500">
            <input
              type="file"
              hidden
              multiple={multiple}
              accept={accept}
              onChange={(event) =>
                handleFiles(
                  event.target.files
                )
              }
            />

            <div className="font-medium">
              Upload Media
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Images, videos or books
            </div>
          </label>

          <button
            type="button"
            onClick={() =>
              setShowAI(true)
            }
            className="rounded-2xl border p-8 text-center hover:bg-indigo-50"
          >
            <div className="font-medium">
              ✨ Create with AI
            </div>

            <div className="mt-1 text-sm text-gray-500">
              Generate or transform media
            </div>
          </button>
        </div>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onAI={() =>
                setShowAI(true)
              }
            />
          ))}
        </div>
      )}

      {showAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <AIMediaStudio
            onJobCreated={() => {
              setShowAI(false);
            }}
            onClose={() =>
              setShowAI(false)
            }
          />
        </div>
      )}
    </div>
  );
}

function MediaCard({
  media,
  onAI,
}: {
  media: MediaAsset;
  onAI: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {media.url &&
      media.type === "IMAGE" ? (
        <img
          src={media.url}
          alt={
            media.metadata?.altText ||
            media.originalName ||
            "Media"
          }
          className="h-40 w-full object-cover"
        />
      ) : media.url &&
        media.type === "VIDEO" ? (
        <video
          src={media.url}
          controls
          className="h-40 w-full bg-black object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center">
          {media.originalName}
        </div>
      )}

      <div className="p-3">
        <div className="truncate text-sm font-medium">
          {media.metadata?.title ||
            media.originalName}
        </div>

        <button
          type="button"
          onClick={onAI}
          className="mt-2 text-xs font-medium text-indigo-600"
        >
          ✨ AI Edit
        </button>
      </div>
    </div>
  );
}