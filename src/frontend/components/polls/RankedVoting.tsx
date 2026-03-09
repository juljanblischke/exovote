'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import type { PollOption } from '@/lib/types';

type RankedVotingProps = {
  options: PollOption[];
  ranking: string[];
  onRankingChange: (ranking: string[]) => void;
  disabled?: boolean;
};

export function RankedVoting({ options, ranking, onRankingChange, disabled }: RankedVotingProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newRanking = [...ranking];
      [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
      onRankingChange(newRanking);
    },
    [ranking, onRankingChange],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === ranking.length - 1) return;
      const newRanking = [...ranking];
      [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
      onRankingChange(newRanking);
    },
    [ranking, onRankingChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = ranking.indexOf(active.id as string);
      const newIndex = ranking.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newRanking = [...ranking];
      newRanking.splice(oldIndex, 1);
      newRanking.splice(newIndex, 0, active.id as string);
      onRankingChange(newRanking);
    },
    [ranking, onRankingChange],
  );

  const getOptionText = (optionId: string) => {
    return options.find((o) => o.id === optionId)?.text ?? '';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ranking} strategy={verticalListSortingStrategy}>
        <div className="space-y-2" role="list" aria-label="Ranked options">
          {ranking.map((optionId, index) => (
            <SortableItem
              key={optionId}
              id={optionId}
              index={index}
              text={getOptionText(optionId)}
              isFirst={index === 0}
              isLast={index === ranking.length - 1}
              disabled={disabled}
              onMoveUp={() => moveUp(index)}
              onMoveDown={() => moveDown(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

type SortableItemProps = {
  id: string;
  index: number;
  text: string;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function SortableItem({
  id,
  index,
  text,
  isFirst,
  isLast,
  disabled,
  onMoveUp,
  onMoveDown,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      className={clsx(
        'flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 transition-all duration-200',
        disabled && 'pointer-events-none opacity-60',
        isDragging && 'z-50 shadow-lg opacity-90 border-[var(--primary)]',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-[var(--muted-foreground)] hover:text-[var(--foreground)] active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 shrink-0" />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
        {index + 1}
      </span>
      <span className="flex-1 text-sm font-medium">{text}</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst || disabled}
          className="rounded-lg p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30"
          aria-label="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast || disabled}
          className="rounded-lg p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)] disabled:opacity-30"
          aria-label="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
