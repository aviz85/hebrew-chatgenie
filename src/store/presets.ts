import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomPreset {
  id: string
  label: string
  instruction: string
}

interface PresetsState {
  presets: CustomPreset[]
  selectedPresetId: string
  setSelectedPresetId: (id: string) => void
  addPreset: (preset: CustomPreset) => Promise<void>
  updatePreset: (preset: CustomPreset) => Promise<void>
  deletePreset: (id: string) => Promise<void>
  loadPresets: () => Promise<void>
}

// IndexedDB functions
const openDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("chatbot", 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("presets")) {
        db.createObjectStore("presets", { keyPath: "id" })
      }
    }
  })
}

export const usePresetsStore = create<PresetsState>()(
  persist(
    (set, get) => ({
      presets: [],
      selectedPresetId: 'default',
      
      setSelectedPresetId: (id) => set({ selectedPresetId: id }),
      
      loadPresets: async () => {
        const db = await openDB()
        const transaction = db.transaction("presets", "readonly")
        const store = transaction.objectStore("presets")
        const presets = await new Promise<CustomPreset[]>((resolve, reject) => {
          const request = store.getAll()
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        })
        set({ presets })
      },
      
      addPreset: async (preset) => {
        const db = await openDB()
        const transaction = db.transaction("presets", "readwrite")
        const store = transaction.objectStore("presets")
        await new Promise<void>((resolve, reject) => {
          const request = store.put(preset)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
        set(state => ({ presets: [...state.presets, preset] }))
      },
      
      updatePreset: async (preset) => {
        const db = await openDB()
        const transaction = db.transaction("presets", "readwrite")
        const store = transaction.objectStore("presets")
        await new Promise<void>((resolve, reject) => {
          const request = store.put(preset)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
        set(state => ({
          presets: state.presets.map(p => 
            p.id === preset.id ? preset : p
          )
        }))
      },
      
      deletePreset: async (id) => {
        const db = await openDB()
        const transaction = db.transaction("presets", "readwrite")
        const store = transaction.objectStore("presets")
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(id)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
        set(state => ({
          presets: state.presets.filter(p => p.id !== id),
          selectedPresetId: state.selectedPresetId === id ? 'default' : state.selectedPresetId
        }))
      }
    }),
    {
      name: 'presets-storage',
      partialize: (state) => ({ selectedPresetId: state.selectedPresetId })
    }
  )
) 