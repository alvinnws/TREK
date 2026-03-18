import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import AssignedPlaceItem from './AssignedPlaceItem'
import { ChevronDown, ChevronUp, Plus, FileText, Package, DollarSign } from 'lucide-react'

export default function DayColumn({
  day,
  assignments,
  tripId,
  onRemoveAssignment,
  onEditPlace,
  onQuickAdd,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(day.notes || '')
  const [notesEditing, setNotesEditing] = useState(false)

  const { isOver, setNodeRef } = useDroppable({
    id: `day-${day.id}`,
    data: {
      type: 'day',
      dayId: day.id,
    },
  })

  const sortableIds = (assignments || []).map(a => `assignment-${a.id}`)

  const totalCost = (assignments || []).reduce((sum, a) => {
    return sum + (a.place?.price ? Number(a.place.price) : 0)
  }, 0)

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={`
        flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all duration-150
        ${isOver
          ? 'border-slate-400 bg-slate-50 shadow-lg shadow-slate-100'
          : 'border-transparent bg-white shadow-sm'
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          px-3 py-2.5 border-b flex items-center gap-2 rounded-t-xl
          ${isOver ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50'}
        `}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900">Day {day.day_number}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
              {assignments?.length || 0}
            </span>
          </div>
          {day.date && (
            <p className="text-xs text-slate-500 mt-0.5">{formatDate(day.date)}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {totalCost > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <DollarSign className="w-3 h-3" />
              {totalCost.toLocaleString()}
            </span>
          )}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-1 rounded transition-colors ${showNotes ? 'text-slate-700 bg-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            title="Notes"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notes area */}
      {showNotes && (
        <div className="px-3 py-2 border-b border-slate-100 bg-amber-50">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => setNotesEditing(false)}
            onFocus={() => setNotesEditing(true)}
            placeholder="Add notes for this day..."
            rows={2}
            className="w-full text-xs text-slate-600 bg-transparent resize-none focus:outline-none placeholder-amber-400"
          />
          {notesEditing && (
            <div className="flex gap-2 mt-1">
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  // Parent will handle save via onUpdateNotes if passed
                }}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Assignments list */}
      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className={`
            flex-1 p-2 flex flex-col gap-2 min-h-24 transition-colors duration-150
            ${isOver ? 'bg-slate-50' : 'bg-transparent'}
          `}
        >
          {assignments && assignments.length > 0 ? (
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {assignments.map(assignment => (
                <AssignedPlaceItem
                  key={assignment.id}
                  assignment={assignment}
                  dayId={day.id}
                  onRemove={(id) => onRemoveAssignment(day.id, id)}
                  onEdit={onEditPlace}
                />
              ))}
            </SortableContext>
          ) : (
            <div className={`
              flex-1 flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed
              text-xs text-center transition-colors
              ${isOver
                ? 'border-slate-400 bg-slate-100 text-slate-500'
                : 'border-slate-200 text-slate-400'
              }
            `}>
              <Package className="w-8 h-8 mb-2 opacity-50" />
              <p className="font-medium">Drop places here</p>
              <p className="text-[10px] mt-0.5 opacity-70">or drag from the left panel</p>
            </div>
          )}

          {/* Quick add button */}
          <button
            onClick={() => onQuickAdd(day)}
            className="flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 transition-all mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add place
          </button>
        </div>
      )}

      {isCollapsed && (
        <div
          className="px-3 py-2 text-xs text-slate-400 cursor-pointer hover:bg-slate-50"
          onClick={() => setIsCollapsed(false)}
        >
          {assignments?.length || 0} place{(assignments?.length || 0) !== 1 ? 's' : ''} — click to expand
        </div>
      )}
    </div>
  )
}
