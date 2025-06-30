import { create } from 'zustand'

interface SearchState {
  searchInput: string
  setSearchInput: (input: string) => void
}

export const useSearch = create<SearchState>((set) => ({
  searchInput: '',
  setSearchInput: (input) => set({ searchInput: input })
}))
