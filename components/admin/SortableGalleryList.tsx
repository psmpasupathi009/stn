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

function SortableRow({
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
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-200 hover:bg-gray-50 ${isDragging ? 'opacity-60 bg-white shadow-lg z-10' : ''}`}
    >
      <td className="py-2 px-3 w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 rounded text-gray-400 hover:text-neutral-600 hover:bg-gray-100"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="py-2 px-3">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          {item.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-7 h-7 text-amber-500" />
            </div>
          ) : item.url ? (
            <Image src={item.url} alt={item.caption || 'Gallery'} fill className="object-cover" unoptimized sizes="56px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-gray-400" />
            </div>
          )}
        </div>
      </td>
      <td className="py-2 px-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'video' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-800'}`}>
          {item.type}
        </span>
      </td>
      <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate">{item.caption || '—'}</td>
      <td className="py-2 px-3 text-right">
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 font-semibold text-gray-700 w-12"><span className="sr-only">Reorder</span></th>
                <th className="py-3 px-3 font-semibold text-gray-700">Preview</th>
                <th className="py-3 px-3 font-semibold text-gray-700">Type</th>
                <th className="py-3 px-3 font-semibold text-gray-700">Caption</th>
                <th className="py-3 px-3 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <SortableRow key={item.id} item={item} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  )
}
