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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { GripVertical, ImageIcon } from 'lucide-react'

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
}: {
  hero: HeroItem
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-4 items-center p-3 bg-white border rounded-lg ${
        isDragging ? 'opacity-50 shadow-lg z-10' : 'border-gray-200'
      } ${hero.isActive ? 'ring-2 ring-green-400' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="relative w-24 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
        {hero.image ? (
          <Image src={hero.image} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{hero.buttonLink}</p>
        <p className="text-xs text-gray-500">{hero.buttonText || 'Shop Now'}</p>
      </div>
    </div>
  )
}

export default function SortableHeroList({
  items,
  onReorder,
  renderCardActions,
}: {
  items: HeroItem[]
  onReorder: (orderedItems: HeroItem[]) => void
  renderCardActions: (hero: HeroItem) => React.ReactNode
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
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((hero) => (
            <div key={hero.id} className="flex gap-2 items-center">
              <div className="flex-1 min-w-0">
                <SortableHeroCard
                  hero={hero}
                  onEdit={() => {}}
                  onToggle={() => {}}
                  onDelete={() => {}}
                />
              </div>
              {renderCardActions(hero)}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
