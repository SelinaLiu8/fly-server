import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedPrimers, setMenu, setCurrentHighlights, clearCurrentHighlights, setHighlights} from '../../features/appState/appStateSlicer'
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
    
    const renderPrimerItem = (primer) => {
        return (
          <div className="target-list-item">
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

    const renderPrimerGroup = (primers, terminal, label, typeKey) => (
        <div>
          <h5>{label}</h5>
          {(primers || []).map((primer, i) =>
            renderPrimerItem(primer)
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