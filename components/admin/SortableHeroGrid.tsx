'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export interface HeroItem {
  id: string
  buttonText: string
  buttonLink: string
  image?: string
  order: number
  isActive: boolean
}

function SortableHeroCard({
  hero,
  children,
}: {
  hero: HeroItem
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: hero.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50 z-10' : ''}>
      <div className="relative group">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-2 bg-white/90 rounded-lg shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-gray-600" />
        </div>
        {children}
      </div>
    </div>
  )
}

export default function SortableHeroGrid<T extends HeroItem>({
  items,
  onReorder,
  renderCard,
}: {
  items: T[]
  onReorder: (orderedItems: T[]) => void
  renderCard: (hero: T) => React.ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newOrder = arrayMove(items, oldIndex, newIndex)
    onReorder(newOrder)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((hero) => (
            <SortableHeroCard key={hero.id} hero={hero}>
              {renderCard(hero)}
            </SortableHeroCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
