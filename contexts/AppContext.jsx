import { useState, useContext, createContext } from 'react'

const Context = createContext()

export function AppProvider ({ children }) {
  const [state, setState] = useState({
    colors: [],
    palettes: [],
    cookiesLoaded: false,
    selectedPaletteId: '',
    initialColorsUpdated: false,
    // Chat-related state
    chatHistory: [],
    suggestedColors: [],
    useLLM: false,
    llmConfig: {
      endpoint: '',
      apiKey: ''
    }
  })

  const _setState = updater => {
    if (typeof updater === 'function') {
      setState(prevState => ({
        ...prevState,
        ...updater(prevState)
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        ...updater
      }))
    }
  }

  const value = {
    state,
    setState: _setState
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export function useAppContext () {
  return useContext(Context)
}
