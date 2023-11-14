import { createSlice } from '@reduxjs/toolkit'
import { moorhen } from '../types/moorhen'

export const generalStatesSlice = createSlice({
  name: 'generalStates',
  initialState: {
    devMode: null,
    userPreferencesMounted: false,
    appTitle: 'Moorhen',
    cootInitialized: false,
    notificationContent: null,
    activeMap: null,
    theme: 'flatly',
    viewOnly: false,
    residueSelection: { molecule: null, first: null, second: null, cid: null } as moorhen.ResidueSelection,
  },
  reducers: {
    setTheme: (state, action: {payload: string, type: string}) => {
      return {...state, theme: action.payload}
    },
    setNotificationContent: (state, action: {payload: JSX.Element, type: string}) => {
      return {...state, notificationContent: action.payload}
    },
    setViewOnly: (state, action: {payload: boolean, type: string}) => {
      return {...state, viewOnly: action.payload}
    },
    setActiveMap: (state, action: {payload: moorhen.Map, type: string}) => {
      return {...state, activeMap: action.payload}
    },
    setCootInitialized: (state, action: {payload: boolean, type: string}) => {
      return {...state, cootInitialized: action.payload}
    },
    setAppTittle: (state, action: {payload: string, type: string}) => {
      return {...state, appTitle: action.payload}
    },
    setUserPreferencesMounted: (state, action: {payload: boolean, type: string}) => {
      return {...state, userPreferencesMounted: action.payload}
    },
    setDevMode: (state, action: {payload: boolean, type: string}) => {
        return {...state, devMode: action.payload}
    },
    clearResidueSelection: (state) => {
      return {...state, residueSelection: { molecule: null, first: null, second: null, cid: null }}
    },
    setResidueSelection: (state, action: {payload: moorhen.ResidueSelection, type: string}) => {
      return {...state, residueSelection: action.payload}
    },
    setMoleculeResidueSelection: (state, action: {payload: moorhen.Molecule, type: string}) => {
      const newResidueSelection = {...state.residueSelection, molecule: action.payload}
      return {...state, residueSelection: newResidueSelection}
    },
    setStopResidueSelection: (state, action: {payload: string, type: string}) => {
      const newResidueSelection = {...state.residueSelection, stop: action.payload}
      return {...state, residueSelection: newResidueSelection}
    },
    setStartResidueSelection: (state, action: {payload: string, type: string}) => {
      const newResidueSelection = {...state.residueSelection, start: action.payload}
      return {...state, residueSelection: newResidueSelection}
    },
    setCidResidueSelection: (state, action: {payload: string, type: string}) => {
      const newResidueSelection = {...state.residueSelection, cid: action.payload}
      return {...state, residueSelection: newResidueSelection}
    }
}})

export const {
  setNotificationContent, setActiveMap, setViewOnly, setTheme,
  setAppTittle, setUserPreferencesMounted, setDevMode, setCootInitialized, 
  setStopResidueSelection, setStartResidueSelection, clearResidueSelection,
  setMoleculeResidueSelection, setResidueSelection, setCidResidueSelection
} = generalStatesSlice.actions

export default generalStatesSlice.reducer