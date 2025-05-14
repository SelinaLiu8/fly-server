import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedPrimers, setMenu, setHighlights} from '../../features/appState/appStateSlicer'
import { getReverseComplement } from '../../utilities/Utilities'
import '../../styles/SidebarContents.css'
import '../../styles/Sequence.css'

const HomologyList = () => {
    const dispatch = useDispatch();
    const menu = useSelector((state) => state.appState.menu)
    const primerList = useSelector((state) => state.appState.primerList);
    const operation = useSelector((state) => state.appState.operation);
    const sequence = useSelector((state) => state.appState.sequenceData.fullSequence)
    const selectedPrimers = useSelector((state) => state.appState.selectedPrimers);

    console.log("primerList:", primerList)

    const nullHighlightData = {
        location: -1,
        length: 0,
        color: '#f5d76e',
    };
    
    const renderPrimerItem = (primer, terminal, typeKey) => {
        return (
          <div className="target-list-item"
          onMouseEnter={() => handleHover(primer, terminal, typeKey)}
          onMouseLeave={handleLeave}
          onClick={() => handleSelect(primer, terminal, typeKey)}>
            <div className="target-sequence">
              <span className="target-proximal">{primer[7]}</span>
            </div>
            <div className="target-details">
              <div>Tm: {primer[3]}</div>
              <div>GC%: {primer[4]}</div>
              <div>Any: {primer[5]}</div>
              <div>3′: {primer[6]}</div>
            </div>
          </div>
        );
    };

    const handleHover = (primer, terminal, typeKey) => {
        console.log("Hover data:", primer)
        let primerSequence = primer[7];
        let location = sequence.indexOf(primerSequence);
        if (typeKey === 'hom3' || typeKey === 'seq3') {
            primerSequence = getReverseComplement(primerSequence);
            location = sequence.indexOf(primerSequence);
        }
        const highlightData = {
          location: location,
          length: primerSequence.length,
          color: '#FFB6C1',
        };
        console.log("Hover data:", highlightData)
        dispatch(setHighlights({ _hover: highlightData }));
    };
    
    const handleLeave = () => {
        dispatch(setHighlights({ _hover: nullHighlightData }));
    };

    const handleSelect = (primer, terminal, typeKey) => {
        let primerSequence = primer[7];
        dispatch(setSelectedPrimers({ [terminal]: primer }));
        let location = sequence.indexOf(primerSequence);
        if (typeKey === 'hom3' || typeKey === 'seq3') {
            primerSequence = getReverseComplement(primerSequence);
            location = sequence.indexOf(primerSequence);
        }
        const key = `${terminal}-${typeKey}-homology`;
        const highlightData = {
          location: location,
          length: primerSequence.length,
          color: '#FFB6C1',
        };
        dispatch(setHighlights({ [key]: highlightData }));
      };

    const renderPrimerGroup = (primers, terminal, label, typeKey) => (
        <div>
          <h5>{label}</h5>
          {(primers || []).map((primer, i) =>
            renderPrimerItem(primer, terminal, typeKey)
          )}
        </div>
    );

    return (
        <div className="sidebar-content">
            <h3 className="sidebar-title">Pick Homology Arms</h3>
            <div className='target-container'>
            {primerList.n && Object.keys(primerList.n).length > 0 && (
                <div className="target-container">
                    { operation === 'delete' && <h4>N Terminal Primers</h4>}
                    <div className="target-list">
                        {renderPrimerGroup(primerList.n.hom5, 'n', "N Forward Homology Arm Primer", 'hom5')}
                        {renderPrimerGroup(primerList.n.hom3, 'n', "N Reverse Homology Arm Primer", 'hom3')}
                        {renderPrimerGroup(primerList.n.seq5, 'n', "N Forward Sequencing Primer", 'seq5')}
                        {renderPrimerGroup(primerList.n.seq3, 'n', "N Reverse Sequencing Primer", 'seq3')}
                    </div>
                </div>
            )}
            {primerList.c && Object.keys(primerList.c).length > 0 && (
                <div className="target-container">
                    { operation === 'delete' && <h4>C Terminal Primers</h4>}
                    <div className="target-list">
                        {renderPrimerGroup(primerList.c.hom5, 'c', "C Forward Homology Arm Primer", 'hom5')}
                        {renderPrimerGroup(primerList.c.hom3, 'c', "C Reverse Homology Arm Primer", 'hom3')}
                        {renderPrimerGroup(primerList.c.seq5, 'c', "C Forward Sequencing Primer", 'seq5')}
                        {renderPrimerGroup(primerList.c.seq3, 'c', "C Reverse Sequencing Primer", 'seq3')}
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}

export default HomologyList