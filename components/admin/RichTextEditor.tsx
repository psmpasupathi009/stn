'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

// Formatting + alignment (left, center, right) + structure
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link'],
  [{ align: '' }, { align: 'center' }, { align: 'right' }],
  ['clean'],
]

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content...',
  className = '',
  minHeight = '120px',
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  )

  const formats = useMemo(
    () => [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'color', 'background',
      'list', 'indent',
      'link', 'align',
    ],
    []
  )

  return (
    <div className={className} style={{ minHeight }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="rounded-md border border-gray-300 bg-white [&_.ql-container]:min-h-[120px] sm:[&_.ql-container]:min-h-[140px] md:[&_.ql-container]:min-h-[160px] [&_.ql-editor]:min-h-[120px] sm:[&_.ql-editor]:min-h-[140px] md:[&_.ql-editor]:min-h-[160px] [&_.ql-editor]:text-sm sm:[&_.ql-editor]:text-base"
      />
    </div>
  )
}
