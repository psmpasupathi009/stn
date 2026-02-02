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
import { GripVertical, Trash2, ImageIcon, Video } from 'lucide-react'

export interface GalleryItem {
  id: string
  url: string
  type: string
  caption?: string
  order: number
}

function SortableItem({
  item,
  onDelete,
}: {
  item: GalleryItem
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-60 shadow-lg z-10 ring-2 ring-emerald-200' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
        {item.type === 'video' ? (
          <Video className="w-10 h-10 text-emerald-500" />
        ) : item.url ? (
          <Image
            src={item.url}
            alt={item.caption || 'Gallery'}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <ImageIcon className="w-10 h-10 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          item.type === 'video' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {item.type}
        </span>
        {item.caption && (
          <p className="text-sm text-gray-600 truncate mt-2">{item.caption}</p>
        )}
        {!item.caption && <p className="text-sm text-gray-400 mt-2 italic">No caption</p>}
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        aria-label="Delete"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
}

export default function SortableGalleryList({
  items,
  onReorder,
  onDelete,
}: {
  items: GalleryItem[]
  onReorder: (orderedIds: string[]) => void
  onDelete: (id: string) => void
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
    onReorder(newOrder.map((i) => i.id))
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
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
