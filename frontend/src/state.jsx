import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

const initial = {
  imageFile: null,
  imagePreview: null,
  diagnosis: null,
  userLocation: { lat: 37.4979, lng: 127.0276 },
  store: null,
  tire: null,
  method: null,
  visitDate: '',
  order: null,
  service: null,
}

export function AppProvider({ children }) {
  const [state, setState] = useState(initial)
  const value = useMemo(
    () => ({
      state,
      setState,
      patch: (partial) => setState((prev) => ({ ...prev, ...partial })),
      resetService: () =>
        setState((prev) => ({
          ...prev,
          store: null,
          tire: null,
          method: null,
          visitDate: '',
          order: null,
          service: null,
        })),
    }),
    [state],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
