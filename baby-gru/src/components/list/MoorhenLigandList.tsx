import React, { useEffect, useState } from "react";
import { Card, Form, Row, Col, DropdownButton, Stack } from "react-bootstrap";
import parse from 'html-react-parser'
import { MenuItem } from "@mui/material";
import { moorhen } from "../../types/moorhen";
import { webGL } from "../../types/mgWebGL";

export const MoorhenLigandList = (props: { 
    setBusy?: React.Dispatch<React.SetStateAction<boolean>>;
    commandCentre: React.RefObject<moorhen.CommandCentre>;
    isDark: boolean; molecule: moorhen.Molecule;
    glRef: React.RefObject<webGL.MGWebGL>; 
}) => {

    const [showState, setShowState] = useState<{ [key: string]: boolean }>({})
    const [ligandList, setLigandList] = useState<{
        svg: string;
        resName: string;
        chainName: string;
        resNum: string;
        modelName: string;
    }[]>(null)

    const getLigandSVG = async (imol: number, compId: string): Promise<string> => {
        const result = await props.commandCentre.current.cootCommand({
            returnType: "string",
            command: 'get_svg_for_residue_type',
            commandArgs: [imol, compId, false, props.isDark],
        }, false) as moorhen.WorkerResponse<string>
        
        const parser = new DOMParser()
        let theText = result.data.result.result
        let doc = parser.parseFromString(theText, "image/svg+xml")
        let xmin = 999
        let ymin = 999
        let xmax = -999
        let ymax = -999
        
        let lines = doc.getElementsByTagName("line")
        for (let l of lines) {
            const x1 = parseFloat(l.getAttribute("x1"))
            const y1 = parseFloat(l.getAttribute("y1"))
            const x2 = parseFloat(l.getAttribute("x2"))
            const y2 = parseFloat(l.getAttribute("y2"))
            if(x1>xmax) xmax = x1
            if(x1<xmin) xmin = x1
            if(y1>ymax) ymax = y1
            if(y1<ymin) ymin = y1
            if(x2>xmax) xmax = x2
            if(x2<xmin) xmin = x2
            if(y2>ymax) ymax = y2
            if(y2<ymin) ymin = y2
        }
        
        let texts = doc.getElementsByTagName("text");
        for (let t of texts) {
            const x = parseFloat(t.getAttribute("x"))
            const y = parseFloat(t.getAttribute("y"))
            if(x>xmax) xmax = x
            if(x<xmin) xmin = x
            if(y>ymax) ymax = y
            if(y<ymin) ymin = y
        }
        
        let polygons = doc.getElementsByTagName("polygon");
        for (let poly of polygons) {
            const points = poly.getAttribute("points").trim().split(" ")
            for (const point of points) {
                const xy = point.split(",")
                const x = parseFloat(xy[0])
                const y = parseFloat(xy[1])
                if(x>xmax) xmax = x
                if(x<xmin) xmin = x
                if(y>ymax) ymax = y
                if(y<ymin) ymin = y
            }
        }

        xmin -= 20
        ymin -= 20
        xmax += 30
        ymax -= ymin - 10
        let svgs = doc.getElementsByTagName("svg")
        const viewBoxStr = xmin+" "+ymin+" "+xmax+" "+ymax
        for (let item of svgs) {
            item.setAttribute("viewBox" , viewBoxStr)
            item.setAttribute("width" , "100%")
            item.setAttribute("height" , "100%")
            theText = item.outerHTML
        }
        
        return theText 
    }

    useEffect(() => {
        async function updateLigandList() {
            props.setBusy(true)
            if (props.molecule.gemmiStructure === null || props.molecule.atomsDirty || props.molecule.ligands === null) {
                await props.molecule.updateAtoms()
            }
            if (props.molecule.gemmiStructure === null || props.molecule.ligands === null) {
                return
            }

            let ligandList: {
                svg: string;
                resName: string;
                chainName: string;
                resNum: string;
                modelName: string;
            }[] = []

            for (const ligand of props.molecule.ligands) {
                const ligandSVG = await getLigandSVG(props.molecule.molNo, ligand.resName)
                ligandList.push({svg: ligandSVG, ...ligand})
            }

            setLigandList(ligandList)
            props.setBusy(false)
        }

        updateLigandList()

    }, [props.molecule.ligands])

    return <>
            {ligandList === null ?
            null
            : ligandList.length > 0 ? 
                <>
                    <Row style={{ height: '100%' }}>
                        <Col style={{paddingLeft: '0.5rem', paddingRight: '0.5rem'}}>
                            {ligandList.map((ligand, index) => {
                                const ligandCid = `/*/${ligand.chainName}/${ligand.resNum}(${ligand.resName})`
                                const keycd = `contact_dots-${ligand.chainName}/${ligand.resNum}(${ligand.resName})`
                                const keyenv = `ligand_environment-${ligand.chainName}/${ligand.resNum}(${ligand.resName})`
                                const keyval = `ligand_validation-${ligand.chainName}/${ligand.resNum}(${ligand.resName})`
                                const keycf = `chemical_features-${ligand.chainName}/${ligand.resNum}(${ligand.resName})`
                                return <Card key={index} style={{marginTop: '0.5rem', marginLeft: '0.2rem', marginRight: '0.2rem'}}>
                                            <Card.Body style={{padding:'0.5rem'}}>
                                                <Stack direction="horizontal" gap={2} style={{alignItems: 'center' }}>
                                                            {ligand.svg ? parse(ligand.svg) : null}
                                                            <DropdownButton
                                                                key="dropDownButton"
                                                                title={`${ligand.chainName}/${ligand.resNum}(${ligand.resName})`}
                                                                variant="outlined"
                                                                >
                                                                <MenuItem onClick={() => {props.molecule.centreOn(`/*/${ligand.chainName}/${ligand.resNum}-${ligand.resNum}/*`)}}>
                                                                    Center on ligand
                                                                </MenuItem>
                                                                <hr></hr>
                                                                <div style={{maxHeight: '9rem', overflowY: 'auto', width:'15rem'}}>
                                                                <Form.Check
                                                                    key={keycd}
                                                                    label={"Contact dots"}
                                                                    type="checkbox"
                                                                    style={{'margin': '0.5rem'}}
                                                                    checked={showState[keycd]}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            props.molecule.show('contact_dots', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keycd] = true
                                                                            setShowState(changedState)
                                                                        }
                                                                        else {
                                                                            props.molecule.hide('contact_dots', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keycd] = false
                                                                            setShowState(changedState)
                                                                        }
                                                                }}/>
                                                                <Form.Check
                                                                    key={keyenv}
                                                                    label={"Environment distances"}
                                                                    type="checkbox"
                                                                    style={{'margin': '0.5rem'}}
                                                                    checked={showState[keyenv]}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            props.molecule.show('ligand_environment', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keyenv] = true
                                                                            setShowState(changedState)
                                                                        }
                                                                        else {
                                                                            props.molecule.hide('ligand_environment', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keyenv] = false
                                                                            setShowState(changedState)
                                                                        }
                                                                }}/>
                                                                <Form.Check
                                                                    key={keycf}
                                                                    label={"Chemical features"}
                                                                    type="checkbox"
                                                                    checked={showState[keycf]}
                                                                    style={{'margin': '0.5rem'}}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            props.molecule.show('chemical_features', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keycf] = true
                                                                            setShowState(changedState)
                                                                        }
                                                                        else {
                                                                            props.molecule.hide('chemical_features', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keycf] = false
                                                                            setShowState(changedState)
                                                                        }
                                                                }}/>
                                                                <Form.Check
                                                                    key={keyval}
                                                                    label={"Validation"}
                                                                    type="checkbox"
                                                                    checked={showState[keyval]}
                                                                    style={{'margin': '0.5rem'}}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            props.molecule.show('ligand_validation', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keyval] = true
                                                                            setShowState(changedState)
                                                                        }
                                                                        else {
                                                                            props.molecule.hide('ligand_validation', ligandCid)
                                                                            const changedState = { ...showState }
                                                                            changedState[keyval] = false
                                                                            setShowState(changedState)
                                                                        }
                                                                }}/>
                                                                </div>
                                                            </DropdownButton>
                                                </Stack>
                                            </Card.Body>
                                        </Card>
                            })}
                        </Col>
                    </Row>
                </>
                :
                <div>
                    <b>No ligands</b>
                </div>
            }
        </>
}

MoorhenLigandList.defaultProps = { setBusy: () => {} }