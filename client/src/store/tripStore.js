import { create } from 'zustand'
import { tripsApi, daysApi, placesApi, assignmentsApi, packingApi, tagsApi, categoriesApi, budgetApi, filesApi, reservationsApi, dayNotesApi } from '../api/client'

export const useTripStore = create((set, get) => ({
  trip: null,
  days: [],
  places: [],
  assignments: {},    // { [dayId]: [assignment objects] }
  dayNotes: {},       // { [dayId]: [note objects] }
  packingItems: [],
  tags: [],
  categories: [],
  budgetItems: [],
  files: [],
  reservations: [],
  selectedDayId: null,
  isLoading: false,
  error: null,

  setSelectedDay: (dayId) => set({ selectedDayId: dayId }),

  // Load everything for a trip
  loadTrip: async (tripId) => {
    set({ isLoading: true, error: null })
    try {
      const [tripData, daysData, placesData, packingData, tagsData, categoriesData] = await Promise.all([
        tripsApi.get(tripId),
        daysApi.list(tripId),
        placesApi.list(tripId),
        packingApi.list(tripId),
        tagsApi.list(),
        categoriesApi.list(),
      ])

      const assignmentsMap = {}
      const dayNotesMap = {}
      for (const day of daysData.days) {
        assignmentsMap[String(day.id)] = day.assignments || []
        dayNotesMap[String(day.id)] = day.notes_items || []
      }

      set({
        trip: tripData.trip,
        days: daysData.days,
        places: placesData.places,
        assignments: assignmentsMap,
        dayNotes: dayNotesMap,
        packingItems: packingData.items,
        tags: tagsData.tags,
        categories: categoriesData.categories,
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false, error: err.message })
      throw err
    }
  },

  // Refresh just the places
  refreshPlaces: async (tripId) => {
    try {
      const data = await placesApi.list(tripId)
      set({ places: data.places })
    } catch (err) {
      console.error('Failed to refresh places:', err)
    }
  },

  // Places
  addPlace: async (tripId, placeData) => {
    try {
      const data = await placesApi.create(tripId, placeData)
      set(state => ({ places: [data.place, ...state.places] }))
      return data.place
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Hinzufügen des Ortes')
    }
  },

  updatePlace: async (tripId, placeId, placeData) => {
    try {
      const data = await placesApi.update(tripId, placeId, placeData)
      set(state => ({
        places: state.places.map(p => p.id === placeId ? data.place : p),
        assignments: Object.fromEntries(
          Object.entries(state.assignments).map(([dayId, items]) => [
            dayId,
            items.map(a => a.place?.id === placeId ? { ...a, place: data.place } : a)
          ])
        ),
      }))
      return data.place
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren des Ortes')
    }
  },

  deletePlace: async (tripId, placeId) => {
    try {
      await placesApi.delete(tripId, placeId)
      set(state => ({
        places: state.places.filter(p => p.id !== placeId),
        assignments: Object.fromEntries(
          Object.entries(state.assignments).map(([dayId, items]) => [
            dayId,
            items.filter(a => a.place?.id !== placeId)
          ])
        ),
      }))
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen des Ortes')
    }
  },

  // Assignments
  assignPlaceToDay: async (tripId, dayId, placeId, position) => {
    const state = get()
    const place = state.places.find(p => p.id === parseInt(placeId))
    if (!place) return

    // Check if already assigned
    const existing = (state.assignments[String(dayId)] || []).find(a => a.place?.id === parseInt(placeId))
    if (existing) return

    const tempId = Date.now() * -1
    const current = [...(state.assignments[String(dayId)] || [])]
    const insertIdx = position != null ? position : current.length
    const tempAssignment = {
      id: tempId,
      day_id: parseInt(dayId),
      order_index: insertIdx,
      notes: null,
      place,
    }

    current.splice(insertIdx, 0, tempAssignment)
    set(state => ({
      assignments: {
        ...state.assignments,
        [String(dayId)]: current,
      }
    }))

    try {
      const data = await assignmentsApi.create(tripId, dayId, { place_id: placeId })
      const newAssignment = position != null
        ? { ...data.assignment, order_index: insertIdx }
        : data.assignment
      set(state => ({
        assignments: {
          ...state.assignments,
          [String(dayId)]: state.assignments[String(dayId)].map(
            a => a.id === tempId ? newAssignment : a
          ),
        }
      }))
      // Reihenfolge am Server aktualisieren
      if (position != null) {
        const updated = get().assignments[String(dayId)] || []
        const orderedIds = updated.map(a => a.id)
        try { await assignmentsApi.reorder(tripId, dayId, orderedIds) } catch {}
      }
      return data.assignment
    } catch (err) {
      set(state => ({
        assignments: {
          ...state.assignments,
          [String(dayId)]: state.assignments[String(dayId)].filter(a => a.id !== tempId),
        }
      }))
      throw new Error(err.response?.data?.error || 'Fehler beim Zuweisen des Ortes')
    }
  },

  removeAssignment: async (tripId, dayId, assignmentId) => {
    const prevAssignments = get().assignments

    set(state => ({
      assignments: {
        ...state.assignments,
        [String(dayId)]: state.assignments[String(dayId)].filter(a => a.id !== assignmentId),
      }
    }))

    try {
      await assignmentsApi.delete(tripId, dayId, assignmentId)
    } catch (err) {
      set({ assignments: prevAssignments })
      throw new Error(err.response?.data?.error || 'Fehler beim Entfernen der Zuweisung')
    }
  },

  reorderAssignments: async (tripId, dayId, orderedIds) => {
    const prevAssignments = get().assignments
    const dayItems = get().assignments[String(dayId)] || []
    const reordered = orderedIds.map((id, idx) => {
      const item = dayItems.find(a => a.id === id)
      return item ? { ...item, order_index: idx } : null
    }).filter(Boolean)

    set(state => ({
      assignments: {
        ...state.assignments,
        [String(dayId)]: reordered,
      }
    }))

    try {
      await assignmentsApi.reorder(tripId, dayId, orderedIds)
    } catch (err) {
      set({ assignments: prevAssignments })
      throw new Error(err.response?.data?.error || 'Fehler beim Neuanordnen')
    }
  },

  moveAssignment: async (tripId, assignmentId, fromDayId, toDayId, toOrderIndex = null) => {
    const state = get()
    const prevAssignments = state.assignments
    const assignment = (state.assignments[String(fromDayId)] || []).find(a => a.id === assignmentId)
    if (!assignment) return

    const toItems = (state.assignments[String(toDayId)] || []).slice().sort((a, b) => a.order_index - b.order_index)
    const insertAt = toOrderIndex !== null ? toOrderIndex : toItems.length

    // Build new order for target day with item inserted at correct position
    const newToItems = [...toItems]
    newToItems.splice(insertAt, 0, { ...assignment, day_id: parseInt(toDayId) })
    newToItems.forEach((a, i) => { a.order_index = i })

    set(s => ({
      assignments: {
        ...s.assignments,
        [String(fromDayId)]: s.assignments[String(fromDayId)].filter(a => a.id !== assignmentId),
        [String(toDayId)]: newToItems,
      }
    }))

    try {
      await assignmentsApi.move(tripId, assignmentId, toDayId, insertAt)
      if (newToItems.length > 1) {
        await assignmentsApi.reorder(tripId, toDayId, newToItems.map(a => a.id))
      }
    } catch (err) {
      set({ assignments: prevAssignments })
      throw new Error(err.response?.data?.error || 'Fehler beim Verschieben der Zuweisung')
    }
  },

  moveDayNote: async (tripId, fromDayId, toDayId, noteId, sort_order = 9999) => {
    const state = get()
    const note = (state.dayNotes[String(fromDayId)] || []).find(n => n.id === noteId)
    if (!note) return

    // Optimistic: remove from old day
    set(s => ({
      dayNotes: {
        ...s.dayNotes,
        [String(fromDayId)]: (s.dayNotes[String(fromDayId)] || []).filter(n => n.id !== noteId),
      }
    }))

    try {
      await dayNotesApi.delete(tripId, fromDayId, noteId)
      const result = await dayNotesApi.create(tripId, toDayId, {
        text: note.text, time: note.time, icon: note.icon, sort_order,
      })
      set(s => ({
        dayNotes: {
          ...s.dayNotes,
          [String(toDayId)]: [...(s.dayNotes[String(toDayId)] || []), result.note],
        }
      }))
    } catch (err) {
      // Rollback
      set(s => ({
        dayNotes: {
          ...s.dayNotes,
          [String(fromDayId)]: [...(s.dayNotes[String(fromDayId)] || []), note],
        }
      }))
      throw new Error(err.response?.data?.error || 'Fehler beim Verschieben der Notiz')
    }
  },

  setAssignments: (assignments) => {
    set({ assignments })
  },

  // Packing
  addPackingItem: async (tripId, data) => {
    try {
      const result = await packingApi.create(tripId, data)
      set(state => ({ packingItems: [...state.packingItems, result.item] }))
      return result.item
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Hinzufügen des Artikels')
    }
  },

  updatePackingItem: async (tripId, id, data) => {
    try {
      const result = await packingApi.update(tripId, id, data)
      set(state => ({
        packingItems: state.packingItems.map(item => item.id === id ? result.item : item)
      }))
      return result.item
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren des Artikels')
    }
  },

  deletePackingItem: async (tripId, id) => {
    const prev = get().packingItems
    set(state => ({ packingItems: state.packingItems.filter(item => item.id !== id) }))
    try {
      await packingApi.delete(tripId, id)
    } catch (err) {
      set({ packingItems: prev })
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen des Artikels')
    }
  },

  togglePackingItem: async (tripId, id, checked) => {
    set(state => ({
      packingItems: state.packingItems.map(item =>
        item.id === id ? { ...item, checked: checked ? 1 : 0 } : item
      )
    }))
    try {
      await packingApi.update(tripId, id, { checked })
    } catch (err) {
      set(state => ({
        packingItems: state.packingItems.map(item =>
          item.id === id ? { ...item, checked: checked ? 0 : 1 } : item
        )
      }))
    }
  },

  // Days
  updateDayNotes: async (tripId, dayId, notes) => {
    try {
      await daysApi.update(tripId, dayId, { notes })
      set(state => ({
        days: state.days.map(d => d.id === parseInt(dayId) ? { ...d, notes } : d)
      }))
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren der Notizen')
    }
  },

  updateDayTitle: async (tripId, dayId, title) => {
    try {
      await daysApi.update(tripId, dayId, { title })
      set(state => ({
        days: state.days.map(d => d.id === parseInt(dayId) ? { ...d, title } : d)
      }))
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren des Tagesnamens')
    }
  },

  // Tags and categories
  addTag: async (data) => {
    try {
      const result = await tagsApi.create(data)
      set(state => ({ tags: [...state.tags, result.tag] }))
      return result.tag
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Erstellen des Tags')
    }
  },

  addCategory: async (data) => {
    try {
      const result = await categoriesApi.create(data)
      set(state => ({ categories: [...state.categories, result.category] }))
      return result.category
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Erstellen der Kategorie')
    }
  },

  // Update trip
  updateTrip: async (tripId, data) => {
    try {
      const result = await tripsApi.update(tripId, data)
      set({ trip: result.trip })
      const daysData = await daysApi.list(tripId)
      const assignmentsMap = {}
      const dayNotesMap = {}
      for (const day of daysData.days) {
        assignmentsMap[String(day.id)] = day.assignments || []
        dayNotesMap[String(day.id)] = day.notes_items || []
      }
      set({ days: daysData.days, assignments: assignmentsMap, dayNotes: dayNotesMap })
      return result.trip
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren der Reise')
    }
  },

  // Budget
  loadBudgetItems: async (tripId) => {
    try {
      const data = await budgetApi.list(tripId)
      set({ budgetItems: data.items })
    } catch (err) {
      console.error('Failed to load budget items:', err)
    }
  },

  addBudgetItem: async (tripId, data) => {
    try {
      const result = await budgetApi.create(tripId, data)
      set(state => ({ budgetItems: [...state.budgetItems, result.item] }))
      return result.item
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Hinzufügen des Budget-Eintrags')
    }
  },

  updateBudgetItem: async (tripId, id, data) => {
    try {
      const result = await budgetApi.update(tripId, id, data)
      set(state => ({
        budgetItems: state.budgetItems.map(item => item.id === id ? result.item : item)
      }))
      return result.item
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren des Budget-Eintrags')
    }
  },

  deleteBudgetItem: async (tripId, id) => {
    const prev = get().budgetItems
    set(state => ({ budgetItems: state.budgetItems.filter(item => item.id !== id) }))
    try {
      await budgetApi.delete(tripId, id)
    } catch (err) {
      set({ budgetItems: prev })
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen des Budget-Eintrags')
    }
  },

  // Files
  loadFiles: async (tripId) => {
    try {
      const data = await filesApi.list(tripId)
      set({ files: data.files })
    } catch (err) {
      console.error('Failed to load files:', err)
    }
  },

  addFile: async (tripId, formData) => {
    try {
      const data = await filesApi.upload(tripId, formData)
      set(state => ({ files: [data.file, ...state.files] }))
      return data.file
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Hochladen der Datei')
    }
  },

  deleteFile: async (tripId, id) => {
    try {
      await filesApi.delete(tripId, id)
      set(state => ({ files: state.files.filter(f => f.id !== id) }))
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen der Datei')
    }
  },

  // Reservations
  loadReservations: async (tripId) => {
    try {
      const data = await reservationsApi.list(tripId)
      set({ reservations: data.reservations })
    } catch (err) {
      console.error('Failed to load reservations:', err)
    }
  },

  addReservation: async (tripId, data) => {
    try {
      const result = await reservationsApi.create(tripId, data)
      set(state => ({ reservations: [result.reservation, ...state.reservations] }))
      return result.reservation
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Erstellen der Reservierung')
    }
  },

  updateReservation: async (tripId, id, data) => {
    try {
      const result = await reservationsApi.update(tripId, id, data)
      set(state => ({
        reservations: state.reservations.map(r => r.id === id ? result.reservation : r)
      }))
      return result.reservation
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren der Reservierung')
    }
  },

  toggleReservationStatus: async (tripId, id) => {
    const prev = get().reservations
    const current = prev.find(r => r.id === id)
    if (!current) return
    const newStatus = current.status === 'confirmed' ? 'pending' : 'confirmed'
    set(state => ({
      reservations: state.reservations.map(r => r.id === id ? { ...r, status: newStatus } : r)
    }))
    try {
      await reservationsApi.update(tripId, id, { status: newStatus })
    } catch {
      set({ reservations: prev })
    }
  },

  deleteReservation: async (tripId, id) => {
    try {
      await reservationsApi.delete(tripId, id)
      set(state => ({ reservations: state.reservations.filter(r => r.id !== id) }))
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen der Reservierung')
    }
  },

  // Day Notes
  addDayNote: async (tripId, dayId, data) => {
    try {
      const result = await dayNotesApi.create(tripId, dayId, data)
      set(state => ({
        dayNotes: {
          ...state.dayNotes,
          [String(dayId)]: [...(state.dayNotes[String(dayId)] || []), result.note],
        }
      }))
      return result.note
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Hinzufügen der Notiz')
    }
  },

  updateDayNote: async (tripId, dayId, id, data) => {
    try {
      const result = await dayNotesApi.update(tripId, dayId, id, data)
      set(state => ({
        dayNotes: {
          ...state.dayNotes,
          [String(dayId)]: (state.dayNotes[String(dayId)] || []).map(n => n.id === id ? result.note : n),
        }
      }))
      return result.note
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Fehler beim Aktualisieren der Notiz')
    }
  },

  deleteDayNote: async (tripId, dayId, id) => {
    const prev = get().dayNotes
    set(state => ({
      dayNotes: {
        ...state.dayNotes,
        [String(dayId)]: (state.dayNotes[String(dayId)] || []).filter(n => n.id !== id),
      }
    }))
    try {
      await dayNotesApi.delete(tripId, dayId, id)
    } catch (err) {
      set({ dayNotes: prev })
      throw new Error(err.response?.data?.error || 'Fehler beim Löschen der Notiz')
    }
  },
}))
