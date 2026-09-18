"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { parseDetailedMediaList } from "@/lib/media-normalizer";
import { TrashIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string | null;
  altText?: string | null;
  featured?: boolean;
  order?: number;
  mediaType?: "IMAGE" | "VIDEO" | string;
}

function SortableMedia({
  item,
  onDelete,
  onToggleFeatured,
}: {
  item: GalleryItem;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  // Use media-normalizer logic to accurately detect video formats (.mp4, .webm, /video/upload/, etc.)
  const { videos } = parseDetailedMediaList([item.imageUrl]);
  const isVideo = item.mediaType === "VIDEO" || videos.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Media Element with Drag Handle */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        {isVideo ? (
          <div className="relative h-44 w-full bg-slate-900 flex items-center justify-center">
            <video
              src={item.imageUrl}
              className="h-44 w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              ▶ Video
            </span>
          </div>
        ) : (
          <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900">
            <img
              src={item.imageUrl}
              alt={item.altText || item.caption || "Gallery item"}
              className="h-44 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Action Overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured(item.id, !item.featured);
          }}
          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
            item.featured
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-black/50 text-white hover:bg-black/70"
          }`}
          title={item.featured ? "Remove featured spotlight" : "Spotlight this media"}
        >
          {item.featured ? <StarSolid className="w-3.5 h-3.5" /> : <StarIcon className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this gallery media item?")) {
              onDelete(item.id);
            }
          }}
          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
          title="Delete media"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Caption snippet or alt tag */}
      {(item.caption || item.altText) && (
        <div className="p-2.5 bg-white/95 dark:bg-slate-800/95 border-t border-slate-100 dark:border-slate-700/60 text-[11px] truncate">
          <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{item.caption || item.altText}</p>
        </div>
      )}
    </div>
  );
}

export default function GalleryReorderGrid({
  galleryId,
  items,
}: {
  galleryId: string;
  items: GalleryItem[];
}) {
  const [images, setImages] = useState<GalleryItem[]>(items);
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);

    const newOrder = arrayMove(images, oldIndex, newIndex);
    setImages(newOrder); // Optimistic UI

    try {
      await fetch("/api/admin/galleries-items/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
          orderedIds: newOrder.map((i) => i.id),
        }),
      });
    } catch (e) {
      console.error("Reorder failed:", e);
    }
  };

  const handleDelete = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/admin/galleries-items?id=${id}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured } : item))
    );
    try {
      await fetch(`/api/admin/galleries-items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, featured }),
      });
    } catch (e) {
      console.error("Toggle featured failed:", e);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-sm">No media items in this gallery yet.</p>
        <p className="text-xs text-slate-400 mt-1">Upload images or videos on the left to populate the showcase.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={images.map((i) => i.id)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((item) => (
            <SortableMedia
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}