import { NavDropdown, Form, Button, InputGroup, NavItem, Modal, Table } from "react-bootstrap";
import { BabyGruMolecule } from "./BabyGruMolecule";
import { BabyGruMap } from "./BabyGruMap";
import { useEffect, useState } from "react";
import { cootCommand, doDownload, doDownloadText, readTextFile } from "../BabyGruUtils";


export const BabyGruHistoryMenu = (props) => {
    const [showHistory, setShowHistory] = useState(false)
    const [sessionHistory, setSessionHistory] = useState({ commands: [] })

    useEffect(() => {
        console.log('CommandHistory', props.commandHistory)
        if (props.commandHistory && props.commandHistory.commands) {
            setSessionHistory(props.commandHistory)
        }
    }, [props.commandHistory])

    const executeJournalFiles = (files) => {
        console.log(files)
        for (const source of files) {
            readTextFile(source)
                .then(contents => {
                    const journalStructure = JSON.parse(contents)
                    executeSessionHistory(journalStructure.commands)
                })
        }
    }

    const executeSessionHistory = (commands) => {
        commands.filter(command => command.returnType === "status").reduce(
            (p, nextCommand) => {
                //console.log(`Redrawing ${style}`, $this.atomsDirty)
                return p.then(() => props.commandCentre.current.cootCommand({
                    returnType: nextCommand.returnType,
                    command: nextCommand.command,
                    commandArgs: nextCommand.commandArgs
                })).then(reply => {
                    // If this was a command to read a molecule, then teh corresponding
                    //BabyGruMolecule has to be created
                    if (nextCommand.command === 'shim_read_pdb') {
                        const newMolecule = new BabyGruMolecule(props.commandCentre)
                        newMolecule.coordMolNo = reply.data.result.result
                        newMolecule.cachedAtoms = newMolecule.webMGAtomsFromFileString(
                            nextCommand.commandArgs[0])
                        newMolecule.name = nextCommand.commandArgs[1]
                        newMolecule.centreOn(props.glRef)
                        props.setMolecules([...props.molecules, newMolecule])
                        return newMolecule.fetchIfDirtyAndDraw('CBs', props.glRef, true)
                    }
                    else if (nextCommand.command === 'shim_read_mtz') {
                        const newMap = new BabyGruMap(props.commandCentre)
                        newMap.mapMolNo = reply.data.result.result
                        props.setMaps([...props.maps, newMap])
                        return newMap
                    }
                    return Promise.resolve()
                })
            },
            Promise.resolve()
        ).then(_ => {
            console.log('Done editing', props.glRef.current)
            props.molecules.forEach(molecule => {
                molecule.redraw(props.glRef)
            })
            props.glRef.current.drawScene()
        })
    }

    return <>
        <NavDropdown title="History" id="basic-nav-dropdown">
            <Form.Group style={{ width: '20rem', margin: '0.5rem' }} controlId="showHistory" className="mb-3">
                <Form.Label>Show command history</Form.Label>
                <Form.Control
                    type="button"
                    value="Show"
                    placeholder="Show"
                    aria-label="Session history"
                    onClick={(e) => {
                        setShowHistory(true)
                    }}
                />
            </Form.Group>
            <Form.Group style={{ width: '20rem', margin: '0.5rem' }} controlId="downloadHistory" className="mb-3">
                <Form.Label>Download history as JSON</Form.Label>
                <Form.Control
                    type="button"
                    value="Download"
                    placeholder="Download"
                    aria-label="Download history"
                    onClick={(e) => {
                        const json = JSON.stringify(sessionHistory, null, 2)
                        doDownloadText(json, "BabyGruSession.json")
                    }}
                />
            </Form.Group>

            <Form.Group style={{ width: '20rem', margin: '0.5rem' }} controlId="uploadJournal" className="mb-3">
                <Form.Label>Execute history</Form.Label>
                <Form.Control type="file" accept=".json" multiple={true} onChange={(e) => {
                    executeJournalFiles(e.target.files)
                }} />
            </Form.Group>

        </NavDropdown>
        <Modal size="xl" show={showHistory} onHide={() => { setShowHistory(false) }}>
            <Modal.Header closeButton>
                <Modal.Title>Command history</Modal.Title>
            </Modal.Header>
            <div style={{ height: "40rem", overflow: "auto" }}>
                {sessionHistory.commands.length > 0 && <Table>
                    <thead>
                        <tr>
                            {Object.keys(sessionHistory.commands[0]).filter(key => key !== "result").map(key =>
                                <th align="right">{key}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {sessionHistory.commands.map((row, iRow) => {
                            return <tr key={iRow}>
                                {Object.keys(row).filter(key => key !== "result").map(key => {
                                    let stringRep  = JSON.stringify(row[key], null, 2)
                                    if (stringRep.length > 160){
                                        stringRep = `[TRUNCATED to ${stringRep.substring(0, 160)}]`
                                    }
                                    return <td align="right">{stringRep}</td>
                                }
                                )}
                            </tr>
                        })}
                    </tbody>
                </Table>}
            </div>
            <Modal.Footer><Button onClick={() => {
                executeSessionHistory(sessionHistory.commands)
            }}>Replay</Button></Modal.Footer>
        </Modal>
    </>
}