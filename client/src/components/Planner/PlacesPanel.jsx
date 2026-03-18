import React, { useState, useMemo } from 'react'
import DraggablePlaceCard from './DraggablePlaceCard'
import { Search, Plus, Filter, Map, X, SlidersHorizontal } from 'lucide-react'

export default function PlacesPanel({
  places,
  categories,
  tags,
  assignments,
  tripId,
  onAddPlace,
  onEditPlace,
  hasMapKey,
  onSearchMaps,
}) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Get set of assigned place IDs (for any day)
  const assignedPlaceIds = useMemo(() => {
    const ids = new Set()
    Object.values(assignments || {}).forEach(dayAssignments => {
      dayAssignments.forEach(a => {
        if (a.place?.id) ids.add(a.place.id)
      })
    })
    return ids
  }, [assignments])

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      if (search) {
        const q = search.toLowerCase()
        if (!place.name.toLowerCase().includes(q) &&
            !place.address?.toLowerCase().includes(q) &&
            !place.description?.toLowerCase().includes(q)) {
          return false
        }
      }
      if (selectedCategory && place.category_id !== parseInt(selectedCategory)) {
        return false
      }
      if (selectedTags.length > 0) {
        const placeTags = (place.tags || []).map(t => t.id)
        if (!selectedTags.every(tagId => placeTags.includes(tagId))) {
          return false
        }
      }
      return true
    })
  }, [places, search, selectedCategory, selectedTags])

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSelectedTags([])
  }

  const hasActiveFilters = search || selectedCategory || selectedTags.length > 0

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Places
            <span className="ml-1.5 text-xs font-normal text-slate-400">
              ({filteredPlaces.length}{filteredPlaces.length !== places.length ? `/${places.length}` : ''})
            </span>
          </h2>
          <div className="flex gap-1">
            {hasMapKey && (
              <button
                onClick={onSearchMaps}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                title="Search Google Maps"
              >
                <Map className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'text-slate-700 bg-slate-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search places..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-2 space-y-2">
            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
              >
                <option value="">All categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}

            {/* Tag filters */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                      selectedTags.includes(tag.id)
                        ? 'text-white shadow-sm'
                        : 'text-white opacity-50 hover:opacity-80'
                    }`}
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add place button */}
      <div className="px-3 py-2 border-b border-slate-100">
        <button
          onClick={onAddPlace}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Place
        </button>
      </div>

      {/* Places list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scroll-container">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            {places.length === 0 ? (
              <>
                <p className="text-sm font-medium text-slate-600">No places yet</p>
                <p className="text-xs text-slate-400 mt-1">Add places and drag them to days</p>
                <button
                  onClick={onAddPlace}
                  className="mt-3 text-sm text-slate-700 hover:text-slate-900 font-medium"
                >
                  + Add your first place
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-600">No matches found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
              </>
            )}
          </div>
        ) : (
          filteredPlaces.map(place => (
            <DraggablePlaceCard
              key={place.id}
              place={place}
              isAssigned={assignedPlaceIds.has(place.id)}
              onEdit={onEditPlace}
            />
          ))
        )}
      </div>
    </div>
  )
}
