import { OverlayTrigger, Stack, Tooltip } from "react-bootstrap"
import { MoorhenNotification } from "./MoorhenNotification"
import { CheckOutlined, CloseOutlined, InfoOutlined } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { moorhen } from "../../types/moorhen"
import { useCallback, useEffect, useRef, useState } from "react"
import { getTooltipShortcutLabel } from '../../utils/MoorhenUtils';
import { setIsRotatingAtoms } from "../../store/generalStatesSlice"
import { webGL } from "../../types/mgWebGL"
import { triggerScoresUpdate } from "../../store/connectedMapsSlice"

export const MoorhenAcceptRejectRotateTranslate = (props: {
    onExit: () => void;
    moleculeRef: React.RefObject<moorhen.Molecule>;
    cidRef: React.RefObject<string>;
    glRef: React.RefObject<webGL.MGWebGL>;
}) => {

    const dispatch = useDispatch()
    const isDark = useSelector((state: moorhen.State) => state.sceneSettings.isDark)
    const shortCuts = useSelector((state: moorhen.State) => state.shortcutSettings.shortCuts)

    const [tips, setTips] = useState<null | JSX.Element>(null)

    const fragmentMoleculeRef = useRef<null | moorhen.Molecule>(null)

    const stopRotateTranslate = useCallback(async (acceptTransform: boolean = false) => {
        props.glRef.current.setActiveMolecule(null)
        if (acceptTransform) {
            const transformedAtoms = fragmentMoleculeRef.current.transformedCachedAtomsAsMovedAtoms()
            await props.moleculeRef.current.updateWithMovedAtoms(transformedAtoms)
            dispatch( triggerScoresUpdate(props.moleculeRef.current.molNo) )
        }
        fragmentMoleculeRef.current.delete(true)
        props.moleculeRef.current.unhideAll()
        dispatch( setIsRotatingAtoms(false) )
    }, [props, props.moleculeRef, fragmentMoleculeRef])

    useEffect(() => {
        if (shortCuts) {
            const shortCut = JSON.parse(shortCuts as string).residue_camera_wiggle
            setTips(<>
                <em>{"Hold <Shift><Alt> to translate"}</em>
                <br></br>
                <em>{`Hold ${getTooltipShortcutLabel(shortCut)} to move view`}</em>
                <br></br>
                <br></br>
            </>
            )
        }
    }, [shortCuts])

    useEffect(() => {
        const startRotateTranslate = async () => {
            if (fragmentMoleculeRef.current || props.glRef.current.activeMolecule) {
                console.warn('There is already an active molecule... Doing nothing.')
                return
            }
            // This is only necessary in development because React.StrictMode mounts components twice
            // @ts-ignore
            fragmentMoleculeRef.current = 1
            /* Copy the component to move into a new molecule */
            const newMolecule = await props.moleculeRef.current.copyFragmentUsingCid(props.cidRef.current, false)
            await newMolecule.updateAtoms()
            /* redraw after delay so that the context menu does not refresh empty */
            setTimeout(async () => {
                props.moleculeRef.current.hideCid(props.cidRef.current)
                await Promise.all(props.moleculeRef.current.representations
                    .filter(item => { return ['CRs', 'CBs', 'CAs', 'ligands', 'gaussian', 'MolecularSurface', 'VdWSurface', 'DishyBases', 'VdwSpheres', 'allHBonds', 'glycoBlocks', 'MetaBalls'].includes(item.style) })
                    .map(representation => {
                        if (representation.buffers.length > 0 && representation.buffers[0].visible) {
                            return newMolecule.addRepresentation(representation.style, representation.cid)
                        } else {
                            return Promise.resolve()
                        }
                    }))
                props.glRef.current.setActiveMolecule(newMolecule)
                fragmentMoleculeRef.current = newMolecule
            }, 1)
        }
    
        startRotateTranslate()
    }, [])

    return  <MoorhenNotification>
                <Stack gap={2} direction='horizontal' style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={
                            <Tooltip id="tip-tooltip" className="moorhen-tooltip">
                                <div>
                                    <em>{"Hold <Shift><Alt> to translate"}</em>
                                    <br></br>
                                    <em>{shortCuts ? `Hold ${getTooltipShortcutLabel(JSON.parse(shortCuts as string).residue_camera_wiggle)} to move view` : null}</em>
                                </div>
                            </Tooltip>
                        }>
                        <InfoOutlined />
                    </OverlayTrigger>
                    <div>
                        <span>Accept changes?</span>
                    </div>
                    <div>
                        <IconButton style={{ padding: 0, color: isDark ? 'white' : 'grey', }} onClick={async () => {
                            await stopRotateTranslate(true)
                            props.onExit()
                        }}>
                            <CheckOutlined />
                        </IconButton>
                        <IconButton style={{ padding: 0, color: isDark ? 'white' : 'grey' }} onClick={async () => {
                            await stopRotateTranslate()
                            props.onExit()
                        }}>
                            <CloseOutlined />
                        </IconButton>
                    </div>
                </Stack>
            </MoorhenNotification>

}