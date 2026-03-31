"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BreadCard } from "./bread-card";
import type { Recommendation, CuratedItem } from "@/lib/types";

type RecWithItem = Recommendation & { item: CuratedItem };

interface BreadShelfProps {
  recommendations: RecWithItem[];
  onReorder: (orderedIds: string[]) => void;
  onMarkTried: (id: string) => void;
}

function SortableBreadCard({
  recommendation,
  onMarkTried,
}: {
  recommendation: RecWithItem;
  onMarkTried: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recommendation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BreadCard
        recommendation={recommendation}
        onMarkTried={onMarkTried}
        isDragging={isDragging}
      />
    </div>
  );
}

export function BreadShelf({
  recommendations: initialRecs,
  onReorder,
  onMarkTried,
}: BreadShelfProps) {
  const [items, setItems] = useState(initialRecs);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(current, oldIndex, newIndex);
      onReorder(newOrder.map((i) => i.id));
      return newOrder;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((rec) => (
            <SortableBreadCard
              key={rec.id}
              recommendation={rec}
              onMarkTried={onMarkTried}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
