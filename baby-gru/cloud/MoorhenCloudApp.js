import { useRef, useState, useReducer, useContext, useEffect, useCallback } from 'react'
import { historyReducer, initialHistoryState } from '../src/components/MoorhenHistoryMenu'
import { PreferencesContext } from "../src/utils/MoorhenPreferences"
import { MoorhenContainer } from "../src/components/MoorhenContainer"

const initialMoleculesState = []

const initialMapsState = []

const itemReducer = (oldList, change) => {
    if (change.action === 'Add') {
        return [...oldList, change.item]
    }
    else if (change.action === 'Remove') {
        return oldList.filter(item => item.molNo !== change.item.molNo)
    }
    else if (change.action === 'AddList') {
        return oldList.concat(change.items)
    }
    else if (change.action === 'Empty') {
        return []
    }
}

export const MoorhenCloudApp = (props) => {
    const glRef = useRef(null)
    const timeCapsuleRef = useRef(null)
    const commandCentre = useRef(null)
    const moleculesRef = useRef(null)
    const mapsRef = useRef(null)
    const activeMapRef = useRef(null)
    const consoleDivRef = useRef(null)
    const lastHoveredAtom = useRef(null)
    const prevActiveMoleculeRef = useRef(null)
    const preferences = useContext(PreferencesContext);
    const [activeMap, setActiveMap] = useState(null)
    const [activeMolecule, setActiveMolecule] = useState(null)
    const [hoveredAtom, setHoveredAtom] = useState({ molecule: null, cid: null })
    const [consoleMessage, setConsoleMessage] = useState("")
    const [cursorStyle, setCursorStyle] = useState("default")
    const [busy, setBusy] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [commandHistory, dispatchHistoryReducer] = useReducer(historyReducer, initialHistoryState)
    const [molecules, changeMolecules] = useReducer(itemReducer, initialMoleculesState)
    const [maps, changeMaps] = useReducer(itemReducer, initialMapsState)
    const [backgroundColor, setBackgroundColor] = useState([1, 1, 1, 1])
    const [currentDropdownId, setCurrentDropdownId] = useState(-1)
    const [appTitle, setAppTitle] = useState('Moorhen')
    const [cootInitialized, setCootInitialized] = useState(false)
    const [theme, setTheme] = useState("flatly")
    const [showToast, setShowToast] = useState(false)
    const [toastContent, setToastContent] = useState("")
    const [showColourRulesToast, setShowColourRulesToast] = useState(false)
    
    moleculesRef.current = molecules
    mapsRef.current = maps
    activeMapRef.current = activeMap

    const collectedProps = {
        glRef, timeCapsuleRef, commandCentre, moleculesRef, mapsRef, activeMapRef,
        consoleDivRef, lastHoveredAtom, prevActiveMoleculeRef, preferences, activeMap, 
        setActiveMap, activeMolecule, setActiveMolecule, hoveredAtom, setHoveredAtom,
        consoleMessage, setConsoleMessage, cursorStyle, setCursorStyle, busy, setBusy,
        windowWidth, setWindowWidth, windowHeight, setWindowHeight, commandHistory, 
        dispatchHistoryReducer, molecules, changeMolecules, maps, changeMaps, 
        backgroundColor, setBackgroundColor, currentDropdownId, setCurrentDropdownId,
        appTitle, setAppTitle, cootInitialized, setCootInitialized, theme, setTheme,
        showToast, setShowToast, toastContent, setToastContent, showColourRulesToast,
        setShowColourRulesToast, ...props
    }

    const handleOriginUpdate = useCallback(async (evt) => {
        if (props.viewOnly) {
            await Promise.all(
                maps.map(map => {
                  return map.doCootContour(
                    glRef, ...evt.detail.origin.map(coord => -coord), map.mapRadius, map.contourLevel
                  )     
                })
            )
        }
    }, [props.viewOnly, maps, glRef])
    
    const handleRadiusChangeCallback = useCallback(async (evt) => {
        if (props.viewOnly) {
            await Promise.all(
                maps.map(map => {
                  const newRadius = map.mapRadius + parseInt(evt.detail.factor)
                  map.mapRadius = newRadius
                  return map.doCootContour(
                    glRef, ...glRef.current.origin.map(coord => -coord), newRadius, map.contourLevel
                  )     
                })
            )      
        }
    }, [props.viewOnly, maps, glRef])
    
    const handleWheelContourLevelCallback = useCallback(async (evt) => {
        if(props.viewOnly) {
            await Promise.all(
                maps.map(map => {
                  const newLevel = evt.detail.factor > 1 ? map.contourLevel + 0.1 : map.contourLevel - 0.1
                  map.contourLevel = newLevel
                  return map.doCootContour(
                    glRef, ...glRef.current.origin.map(coord => -coord), map.mapRadius, newLevel
                  )     
                })
            )
        }
    }, [props.viewOnly, maps, glRef])
    
    useEffect(() => {
        document.addEventListener("originUpdate", handleOriginUpdate)
        return () => {
            document.removeEventListener("originUpdate", handleOriginUpdate)
        }
    }, [handleOriginUpdate])

    useEffect(() => {
        document.addEventListener("mapRadiusChanged", handleRadiusChangeCallback)
        return () => {
            document.removeEventListener("mapRadiusChanged", handleRadiusChangeCallback)
        }
    }, [handleOriginUpdate])

    useEffect(() => {
        document.addEventListener("wheelContourLevelChanged", handleWheelContourLevelCallback)
        return () => {
            document.removeEventListener("wheelContourLevelChanged", handleWheelContourLevelCallback)
        }
    }, [handleOriginUpdate])

    useEffect(() => {
        if (props.viewOnly && maps.length > 0) {
            maps.map(map => {
                map.doCootContour(
                    glRef, ...glRef.current.origin.map(coord => -coord), 13.0, 0.8
              )
            })
        }
    }, [maps])


    return <MoorhenContainer {...collectedProps}/>
}
