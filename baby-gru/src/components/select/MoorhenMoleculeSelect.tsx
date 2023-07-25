import { forwardRef } from "react";
import { Form, FormSelect } from "react-bootstrap";
import { moorhen } from "../../types/moorhen";

type MoorhenMoleculeSelectPropsType = {
    height?: string;
    width?: string;
    margin?: string;
    allowAny?: boolean;
    label?: string;
    molecules: moorhen.Molecule[];
    onChange?: (arg0: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * A molecule selector react component
 * @property {string} [height="4rem"] The height of the selector
 * @property {string} [width="20rem"] The width of the selector
 * @property {string} [label="Molecule"] A text label shown on top of the selector
 * @property {string} [margin="0.5rem"] The margin used to render the selector
 * @property {boolean} [allowAny=false] Indicates whether a "Any molecule" option should be included in the selector (with value -999999)
 * @property {moorhen.Molecule[]} molecules List of molecules displayed in the selector options
 * @property {function} onChange A function that is called when the user changes the selector option
 * @example
 * import { MoorhenMoleculeSelect } from "moorhen";
 * import { useRef } from "react";
 * 
 * const moleculeSelectRef = useRef(null);
 * 
 * const handleModelChange = (evt) => {
 *  const selectedModel = parseInt(evt.target.value)
 *  console.log(`New selected model is ${selectedModel}`)
 * }
 * 
 * return (
 *  <MoorhenMoleculeSelect ref={moleculeSelectRef} width='100%' label='Select a molecule' onChange={handleModelChange} />
 * )
 */
export const MoorhenMoleculeSelect = forwardRef<HTMLSelectElement, MoorhenMoleculeSelectPropsType>((props, selectRef) => {
    return <Form.Group style={{ width: props.width, margin: props.margin, height:props.height }}>
        <Form.Label>{props.label}</Form.Label>
        <FormSelect size="sm" ref={selectRef} defaultValue={-999999} onChange={(evt) => {
            if (props.onChange) {
                props.onChange(evt)
            }
            if (selectRef !== null && typeof selectRef !== 'function') {
                selectRef.current.value = evt.target.value
            }
        }}>
            {props.allowAny && <option value={-999999} key={-999999}>Any molecule</option>}
            {props.molecules.map(molecule => 
                <option value={molecule.molNo} key={molecule.molNo}>{molecule.molNo}: {molecule.name}</option>
            )}
        </FormSelect>
    </Form.Group>
})

MoorhenMoleculeSelect.defaultProps = { height: '4rem', width: '20rem', allowAny: false, label: "Molecule", margin: '0.5rem' }