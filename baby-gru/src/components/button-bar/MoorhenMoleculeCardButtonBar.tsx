import { useState, useMemo, Fragment, useRef } from "react";
import { Button, DropdownButton } from "react-bootstrap";
import { convertViewtoPx } from '../../utils/MoorhenUtils';
import { MenuItem } from "@mui/material";
import { UndoOutlined, RedoOutlined, CenterFocusWeakOutlined, ExpandMoreOutlined, ExpandLessOutlined, VisibilityOffOutlined, VisibilityOutlined, DownloadOutlined, Settings } from '@mui/icons-material';
import { MoorhenDeleteDisplayObjectMenuItem } from "../menu-item/MoorhenDeleteDisplayObjectMenuItem"
import { MoorhenRenameDisplayObjectMenuItem } from "../menu-item/MoorhenRenameDisplayObjectMenuItem"
import { clickedResidueType } from "../card/MoorhenMoleculeCard";
import { moorhen } from "../../types/moorhen";
import { webGL } from "../../types/mgWebGL";
import { useSelector } from "react-redux";

type MoorhenMoleculeCardButtonBarPropsType = {
    handleCentering: () => void;
    handleCopyFragment: () => void;
    handleDownload: () => Promise<void>;
    handleRedo: () => Promise<void>;
    handleUndo: () => Promise<void>;
    handleVisibility: () => void;
    molecule: moorhen.Molecule;
    glRef: React.RefObject<webGL.MGWebGL>;
    sideBarWidth: number;
    isVisible: boolean;
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
    clickedResidue: clickedResidueType;
    selectedResidues: [number, number];
    currentDropdownMolNo: number
    setCurrentDropdownMolNo: React.Dispatch<React.SetStateAction<number>>
}

export const MoorhenMoleculeCardButtonBar = (props: MoorhenMoleculeCardButtonBarPropsType) => {
    const dropdownCardButtonRef = useRef<HTMLDivElement>()
    const [popoverIsShown, setPopoverIsShown] = useState<boolean>(false)
    const [currentName, setCurrentName] = useState<string>(props.molecule.name);
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)
    const makeBackups = useSelector((state: moorhen.State) => state.backupSettings.makeBackups)

    useMemo(() => {
        if (currentName === "") {
            return
        }
        props.molecule.name = currentName

    }, [currentName]);


    const actionButtons: { [key: number]: { label: string; compressed: () => JSX.Element; expanded: null | (() => JSX.Element); } } = {
        1: {
            label: props.isVisible ? "Hide molecule" : "Show molecule",
            compressed: () => { return (<MenuItem key={1} onClick={props.handleVisibility}>{props.isVisible ? "Hide molecule" : "Show molecule"}</MenuItem>) },
            expanded: () => {
                return (<Button key={1} size="sm" variant="outlined" onClick={props.handleVisibility}>
                    {props.isVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                </Button>)
            }
        },
        2: {
            label: "Undo last action",
            compressed: () => { return (<MenuItem key={2} onClick={props.handleUndo} disabled={!makeBackups}>Undo last action</MenuItem>) },
            expanded: () => {
                return (<Button key={2} size="sm" variant="outlined" style={{borderWidth: makeBackups ? '' : '0px'}} onClick={props.handleUndo} disabled={!makeBackups}>
                    <UndoOutlined />
                </Button>)
            }
        },
        3: {
            label: "Redo previous action",
            compressed: () => { return (<MenuItem key={3} onClick={props.handleRedo} disabled={!makeBackups}>Redo previous action</MenuItem>) },
            expanded: () => {
                return (<Button key={3} size="sm" variant="outlined" style={{borderWidth: makeBackups ? '': '0px'}} onClick={props.handleRedo} disabled={!makeBackups}>
                    <RedoOutlined />
                </Button>)
            }
        },
        4: {
            label: "Center on molecule",
            compressed: () => { return (<MenuItem key={4} onClick={props.handleCentering}>Center on molecule</MenuItem>) },
            expanded: () => {
                return (<Button key={4} size="sm" variant="outlined" onClick={props.handleCentering}>
                    <CenterFocusWeakOutlined />
                </Button>)
            }
        },
        5: {
            label: "Download Molecule",
            compressed: () => { return (<MenuItem key={5} onClick={props.handleDownload}>Download molecule</MenuItem>) },
            expanded: () => {
                return (<Button key={5} size="sm" variant="outlined" onClick={props.handleDownload}>
                    <DownloadOutlined />
                </Button>)
            }
        },
        6: {
            label: 'Rename molecule',
            compressed: () => { return (<MoorhenRenameDisplayObjectMenuItem key={6} setPopoverIsShown={setPopoverIsShown} setCurrentName={setCurrentName} item={props.molecule} />) },
            expanded: null
        },
    }

    const maximumAllowedWidth = props.sideBarWidth * 0.55
    let currentlyUsedWidth = 0
    let expandedButtons: JSX.Element[] = []
    let compressedButtons: JSX.Element[] = []

    Object.keys(actionButtons).forEach(key => {
        if (actionButtons[key].expanded === null) {
            compressedButtons.push(actionButtons[key].compressed())
        } else {
            currentlyUsedWidth += 60
            if (currentlyUsedWidth < maximumAllowedWidth) {
                expandedButtons.push(actionButtons[key].expanded())
            } else {
                compressedButtons.push(actionButtons[key].compressed())
            }
        }
    })

    compressedButtons.push(
        <MoorhenDeleteDisplayObjectMenuItem 
            key="deleteDisplayObjectMenuItem"
            setPopoverIsShown={setPopoverIsShown} 
            glRef={props.glRef} 
            item={props.molecule} />
    )

    return <Fragment>
        {expandedButtons}
        <DropdownButton
            ref={dropdownCardButtonRef}
            key="dropDownButton"
            title={<Settings />}
            size="sm"
            variant="outlined"
            autoClose={popoverIsShown ? false : 'outside'}
            show={props.currentDropdownMolNo === props.molecule.molNo}
            onToggle={() => { props.molecule.molNo !== props.currentDropdownMolNo ? props.setCurrentDropdownMolNo(props.molecule.molNo) : props.setCurrentDropdownMolNo(-1) }}
            >
                <div style={{maxHeight: convertViewtoPx(50, height) * 0.5, overflowY: 'auto'}}>
                    {compressedButtons}
                </div>
            </DropdownButton>
        <Button key="expandButton"
            size="sm" variant="outlined"
            onClick={() => {
                props.setIsCollapsed(!props.isCollapsed)
            }}>
            {props.isCollapsed ? < ExpandMoreOutlined /> : <ExpandLessOutlined />}
        </Button>
    </Fragment>

}
