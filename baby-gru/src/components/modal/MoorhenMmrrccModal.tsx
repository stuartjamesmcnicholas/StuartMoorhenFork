import { MoorhenDraggableModalBase } from "./MoorhenDraggableModalBase"
import { moorhen } from "../../types/moorhen";
import { useRef } from "react";
import { Row } from "react-bootstrap";
import { MoorhenMMRRCCPlot } from "../validation-tools/MoorhenMMRRCCPlot"
import { convertRemToPx, convertViewtoPx} from '../../utils/MoorhenUtils';
import { useSelector } from "react-redux";

interface MoorhenValidationModalProps extends moorhen.CollectedProps {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MoorhenMmrrccModal = (props: MoorhenValidationModalProps) => {        
    const resizeNodeRef = useRef<HTMLDivElement>();
      
    const width = useSelector((state: moorhen.State) => state.sceneSettings.width)
    const height = useSelector((state: moorhen.State) => state.sceneSettings.height)

    const collectedProps = {
        sideBarWidth: convertViewtoPx(35, width), dropdownId: 1, busy: false, chartId: 'mmrrcc-chart',
        accordionDropdownId: 1, setAccordionDropdownId: (arg0) => {}, showSideBar: true, ...props
    }

    return <MoorhenDraggableModalBase
                modalId="mmrrcc-modal"
                left={width / 6}
                top={height / 3}
                show={props.show}
                setShow={props.setShow}
                defaultHeight={convertViewtoPx(70, height)}
                defaultWidth={convertViewtoPx(37, width)}
                minHeight={convertViewtoPx(30, height)}
                minWidth={convertRemToPx(37)}
                maxHeight={convertViewtoPx(90, height)}
                maxWidth={convertViewtoPx(80, width)}
                enforceMaxBodyDimensions={false}
                overflowY='hidden'
                overflowX='auto'
                headerTitle='MMRRCC Plot'
                footer={null}
                resizeNodeRef={resizeNodeRef}
                body={
                    <div style={{height: '100%'}} >
                        <Row className={"big-validation-tool-container-row"}>
                            <MoorhenMMRRCCPlot {...collectedProps}/>
                        </Row>
                    </div>
                }
            />
}

