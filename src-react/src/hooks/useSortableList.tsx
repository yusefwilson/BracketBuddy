import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { safeApiCall } from '../utils/apiHelpers';

// Shared logic for managing a sortable list of items
export function useSortableList<T extends { id: string }>(
  initialItems: T[],
  persistenceKey?: string
) {
  const [items, setItems] = useState(initialItems);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved order on mount
  useEffect(() => {
    if (!persistenceKey) {
      setIsLoaded(true);
      return;
    }

    const loadOrder = async () => {
      const [savedOrder, error] = await safeApiCall(window.electron.getSavedValue(persistenceKey));

      if (error) {
        console.error('Failed to load item order:', error);
        setItems(initialItems);
        setIsLoaded(true);
        return;
      }

      if (savedOrder && Array.isArray(savedOrder)) {
        // Reorder items based on saved order
        const orderedItems = [...initialItems].sort((a, b) => {
          const indexA = savedOrder.indexOf(a.id);
          const indexB = savedOrder.indexOf(b.id);
          // Items not in saved order go to the end
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        setItems(orderedItems);
      } else {
        setItems(initialItems);
      }

      setIsLoaded(true);
    };

    loadOrder();
  }, [persistenceKey]); // Only run on mount or when persistenceKey changes

  // Update items when initialItems change (e.g., brackets added/removed/modified)
  useEffect(() => {
    if (!isLoaded) return;

    // Create a map of initialItems by id for quick lookup
    const initialItemsMap = new Map(initialItems.map(item => [item.id, item]));

    // Preserve the order of existing items, update their contents, add new items to the end
    const existingIds = new Set(items.map(i => i.id));
    const newItems = initialItems.filter(i => !existingIds.has(i.id));

    // Update existing items with fresh data from initialItems while preserving order
    const updatedItems = items
      .filter(i => initialItemsMap.has(i.id))
      .map(i => initialItemsMap.get(i.id)!);

    setItems([...updatedItems, ...newItems]);
  }, [initialItems, isLoaded]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newItems = await new Promise<T[]>((resolve) => {
        setItems((prev) => {
          const oldIndex = prev.findIndex((i) => i.id === active.id);
          const newIndex = prev.findIndex((i) => i.id === over.id);
          const newOrder = arrayMove(prev, oldIndex, newIndex);
          resolve(newOrder);
          return newOrder;
        });
      });

      // Persist the new order
      if (persistenceKey) {
        const [, error] = await safeApiCall(
          window.electron.saveKeyValue({
            key: persistenceKey,
            value: newItems.map(item => item.id),
          })
        );

        if (error) {
          console.error('Failed to save item order:', error);
        }
      }
    }
  };

  return { items, setItems, handleDragEnd };
}

// Individual sortable wrapper for each item
export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// High-level wrapper for a sortable list, horizontal (default) or vertical
export function SortableList<T extends { id: string }>({ items, onDragEnd, renderItem, className, orientation = 'horizontal' }: {
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure pointer sensor with activation constraints
  // Requires 8px of movement before drag starts, allowing clicks to work
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items} strategy={orientation === 'vertical' ? verticalListSortingStrategy : horizontalListSortingStrategy}>
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : ''} gap-4 ${className || ''}`}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
      {/* Portaled to document.body so `position: fixed` positions relative to the viewport,
          not to whichever backdrop-blur/modal ancestor happens to wrap this list. */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div
              style={{
                cursor: 'grabbing',
              }}
            >
              {renderItem(activeItem)}
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
