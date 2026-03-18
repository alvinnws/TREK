import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Phone, MapPin, Clock, Euro, Edit2, Trash2, Plus, Minus } from 'lucide-react'
import { mapsApi } from '../../api/client'

const RESERVATION_STATUS = {
  none: { label: 'Keine Reservierung', color: 'gray' },
  pending: { label: 'Res. ausstehend', color: 'yellow' },
  confirmed: { label: 'Bestätigt', color: 'green' },
}

export function PlaceDetailPanel({
  place, categories, tags, selectedDayId, dayAssignments,
  onClose, onEdit, onDelete, onAssignToDay, onRemoveAssignment,
}) {
  const [googlePhoto, setGooglePhoto] = useState(null)
  const [photoAttribution, setPhotoAttribution] = useState(null)

  useEffect(() => {
    if (!place?.google_place_id || place?.image_url) {
      setGooglePhoto(null)
      return
    }
    mapsApi.placePhoto(place.google_place_id)
      .then(data => {
        setGooglePhoto(data.photoUrl || null)
        setPhotoAttribution(data.attribution || null)
      })
      .catch(() => setGooglePhoto(null))
  }, [place?.google_place_id, place?.image_url])

  if (!place) return null

  const displayPhoto = place.image_url || googlePhoto
  const category = categories?.find(c => c.id === place.category_id)
  const placeTags = (place.tags || []).map(t =>
    tags?.find(tg => tg.id === (t.id || t)) || t
  ).filter(Boolean)

  const assignmentInDay = selectedDayId
    ? dayAssignments?.find(a => a.place?.id === place.id)
    : null

  const status = RESERVATION_STATUS[place.reservation_status] || RESERVATION_STATUS.none

  return (
    <div className="bg-white">
      {/* Image */}
      {displayPhoto ? (
        <div className="relative">
          <img
            src={displayPhoto}
            alt={place.name}
            className="w-full h-40 object-cover"
            onError={e => { e.target.style.display = 'none' }}
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
          {photoAttribution && !place.image_url && (
            <div className="absolute bottom-1 right-2 text-[10px] text-white/70">
              © {photoAttribution}
            </div>
          )}
        </div>
      ) : (
        <div
          className="h-24 flex items-center justify-center relative"
          style={{ backgroundColor: category?.color ? `${category.color}20` : '#f0f0ff' }}
        >
          <span className="text-4xl">{category?.icon || '📍'}</span>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name + category */}
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug">{place.name}</h3>
          {category && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon} {category.name}
            </span>
          )}
        </div>

        {/* Quick info row */}
        <div className="flex flex-wrap gap-2">
          {place.place_time && (
            <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3" />
              {place.place_time}
            </div>
          )}
          {place.price > 0 && (
            <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              <Euro className="w-3 h-3" />
              {place.price} {place.currency}
            </div>
          )}
        </div>

        {/* Address */}
        {place.address && (
          <div className="flex items-start gap-1.5 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
            <span>{place.address}</span>
          </div>
        )}

        {/* Coordinates */}
        {place.lat && place.lng && (
          <div className="text-xs text-gray-400">
            {Number(place.lat).toFixed(6)}, {Number(place.lng).toFixed(6)}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2">
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-700 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Website
            </a>
          )}
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-1 text-xs text-slate-700 hover:underline"
            >
              <Phone className="w-3 h-3" />
              {place.phone}
            </a>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-xs text-gray-600 leading-relaxed">{place.description}</p>
        )}

        {/* Notes */}
        {place.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-800 leading-relaxed">📝 {place.notes}</p>
          </div>
        )}

        {/* Tags */}
        {placeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {placeTags.map((tag, i) => (
              <span
                key={tag.id || i}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${tag.color || '#6366f1'}20`, color: tag.color || '#6366f1' }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Reservation status */}
        {place.reservation_status && place.reservation_status !== 'none' && (
          <div className={`rounded-lg px-3 py-2 border ${
            place.reservation_status === 'confirmed'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className={`text-xs font-semibold ${
              place.reservation_status === 'confirmed' ? 'text-emerald-700' : 'text-yellow-700'
            }`}>
              {place.reservation_status === 'confirmed' ? '✅' : '⏳'} {status.label}
            </div>
            {place.reservation_datetime && (
              <div className="text-xs text-gray-500 mt-0.5">
                {formatDateTime(place.reservation_datetime)}
              </div>
            )}
            {place.reservation_notes && (
              <p className="text-xs text-gray-600 mt-1">{place.reservation_notes}</p>
            )}
          </div>
        )}

        {/* Day assignment actions */}
        {selectedDayId && (
          <div className="pt-1">
            {assignmentInDay ? (
              <button
                onClick={() => onRemoveAssignment(selectedDayId, assignmentInDay.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Minus className="w-4 h-4" />
                Aus Tag entfernen
              </button>
            ) : (
              <button
                onClick={() => onAssignToDay(place.id)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                Zum Tag hinzufügen
              </button>
            )}
          </div>
        )}

        {/* Edit / Delete */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Bearbeiten
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDateTime(dt) {
  if (!dt) return ''
  try {
    return new Date(dt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return dt
  }
}
