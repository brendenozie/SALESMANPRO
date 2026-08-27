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

interface GalleryItem {
  id: string;
  imageUrl: string;
}

function SortableMedia({ item }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded border cursor-grab bg-white"
    >
      {item.mediaType === "VIDEO" ? (
        <video src={item.imageUrl} className="h-40 w-full object-cover" muted />
      ) : (
        <img src={item.imageUrl} className="h-40 w-full object-cover" />
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
  const [images, setImages] = useState(items);
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex(i => i.id === active.id);
    const newIndex = images.findIndex(i => i.id === over.id);

    const newOrder = arrayMove(images, oldIndex, newIndex);
    setImages(newOrder); // Optimistic UI

    await fetch("/api/admin/galleries-items/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        galleryId,
        orderedIds: newOrder.map(i => i.id),
      }),
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={images.map(i => i.id)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(item => (
            <SortableMedia key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}