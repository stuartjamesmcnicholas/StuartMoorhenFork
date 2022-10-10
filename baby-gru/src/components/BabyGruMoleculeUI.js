import { useEffect, Fragment, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { doDownload } from '../BabyGruUtils';
import { Download } from 'react-bootstrap-icons';

export const BabyGruMoleculeUI = (props) => {
    const [showState, setShowState] = useState({})

    useEffect(() => {
        const initialState = {}
        Object.keys(props.molecule.displayObjects).forEach(key => {
            initialState[key] = props.molecule.displayObjects[key].length > 0
                && props.molecule.displayObjects[key][0].visible
        })
        setShowState(initialState)
    }, [
        props.molecule.displayObjects.bonds.length,
        props.molecule.displayObjects.sticks.length,
        props.molecule.displayObjects.ribbons.length
    ])

    return <Card className="px-2" key={props.molecule.coordMolNo}>
        <Card.Header>
            <div class="row justify-content-between">
                <div class="col-6">
                    {`Mol ${props.molecule.coordMolNo}:${props.molecule.name}`}
                </div>
                <div class="col-2">
                    <Button size="sm"
                        onClick={() => {
                            props.molecule.getAtoms()
                                .then(reply => {
                                    doDownload([reply.data.result.pdbData], `${props.molecule.name}`)
                                })
                        }}>
                        <Download size={12} />
                    </Button>
                </div>
            </div>
        </Card.Header>
        <Card.Body>
            {
                Object.keys(props.molecule.displayObjects).map(key => {
                    return <Form.Check
                        inline
                        label={`${key}`}
                        name={key}
                        type="checkbox"
                        checked={showState[key]}
                        onChange={(e) => {
                            if (e.target.checked) {
                                props.molecule.show(key, props.glRef)
                                const changedState = { ...showState }
                                changedState[key] = true
                                setShowState(changedState)
                            }
                            else {
                                props.molecule.hide(key, props.glRef)
                                const changedState = { ...showState }
                                changedState[key] = false
                                setShowState(changedState)
                            }
                        }}
                    />
                })
            }
        </Card.Body>
    </Card >
}

export const BabyGruMolecules = (props) => {
    useEffect(() => {
    }, [])

    return <Fragment>
        <Row><Col><div style={{ height: "1rem" }} /></Col></Row>
        {
            props.molecules.map(molecule => <BabyGruMoleculeUI key={molecule.coordMolNo}
                molecule={molecule}
                glRef={props.glRef}>
            </BabyGruMoleculeUI>
            )
        }
    </Fragment>
}
