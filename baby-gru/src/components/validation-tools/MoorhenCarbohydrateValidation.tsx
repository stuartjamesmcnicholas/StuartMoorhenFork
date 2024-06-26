import { moorhen } from "../../types/moorhen";
import { useSelector } from 'react-redux';
import { privateer } from "../../types/privateer";
import { MoorhenCarbohydrateCard } from "../card/MoorhenCarbohydrateCard";
import { MoorhenValidationListWidgetBase } from "./MoorhenValidationListWidgetBase";

interface Props extends moorhen.CollectedProps {
    dropdownId: number;
    accordionDropdownId: number;
    setAccordionDropdownId: React.Dispatch<React.SetStateAction<number>>;
    sideBarWidth: number;
    showSideBar: boolean;
}

export const MoorhenCarbohydrateValidation = (props: Props) => {

    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList)

    const fetchCardData = async (selectedModel: number): Promise<privateer.ResultsEntry[]> => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)
        if (selectedMolecule) {
            const result = await selectedMolecule.getPrivateerValidation(true)
            return result
        }
    }

    const getCards = (selectedModel: number, selectedMap: number, privateerResults: privateer.ResultsEntry[]): JSX.Element[] => {
        const selectedMolecule = molecules.find(molecule => molecule.molNo === selectedModel)

        if (!selectedMolecule) {
            return []
        }

        return privateerResults.map((carbohydrate) => {
            return <MoorhenCarbohydrateCard key={carbohydrate.id} carbohydrate={carbohydrate} molecule={selectedMolecule}/>
        })
    }

    return <MoorhenValidationListWidgetBase
        sideBarWidth={props.sideBarWidth}
        dropdownId={props.dropdownId}
        accordionDropdownId={props.accordionDropdownId}
        showSideBar={props.showSideBar}
        enableMapSelect={false}
        fetchData={fetchCardData}
        getCards={getCards}
    />

}
