import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedTargets, setMenu, setCurrentHighlights, clearCurrentHighlights, setHighlights} from '../../features/appState/appStateSlicer'
import { searchForHomologyArms } from '../../features/appState/appStateThunks'
import { getReverseComplement } from '../../utilities/Utilities'
import '../../styles/SidebarContents.css'
import '../../styles/Sequence.css'

const TargetList = () => {    
    const dispatch = useDispatch();
    const menu = useSelector((state) => state.appState.menu)
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);
    const sequence = useSelector((state) => state.appState.sequenceData.fullSequence)
    const strand = useSelector((state) => state.appState.sequenceData.strand)
    const selectedTargets = useSelector((state) => state.appState.selectedTargets);
    const highlights = useSelector((state) => state.appState.highlights);

    useEffect(() => {

        if (operation === "tag") {
          if (selectedTargets.n || selectedTargets.c) {
            console.log("went in to tag selected targets");
            dispatch(setMenu(3));
            dispatch(searchForHomologyArms());
          }
        }
      
        if (operation === "delete") {
          if (selectedTargets.n && selectedTargets.c) {
            dispatch(setMenu(3));
            dispatch(searchForHomologyArms());
          }
        }
    }, [selectedTargets]);

    const nullHighlightData = {
        location: -1,
        length: 0,
        color: '#f5d76e',
    };
    
    const handleHover = (target) => {
        console.log("target in hover", target)
        let targetSequence = target.targetSequence;
        if (target.strand != strand) {
            targetSequence = getReverseComplement(targetSequence);
        }
        const location = sequence.indexOf(targetSequence);
        const highlightData = {
            location: location,
            length: target.targetSequence.length,
            color: '#f5d76e',
        };
        dispatch(setHighlights({ _hover: highlightData }));
    };
    
    const handleLeave = () => {
        dispatch(setHighlights({ _hover: nullHighlightData }));
    };
    

    const handleSelect = (target, terminal) => {
        console.log("target in handleSelect:", target);
    
        // Clear hover highlight before click logic
        dispatch(setHighlights({ _hover: nullHighlightData }));
    
        // Use nextTick to ensure hover isn't interrupting click
        setTimeout(() => {
            let targetSequence = target.targetSequence; 
            if (target.strand != strand) {
                targetSequence = getReverseComplement(targetSequence);
            }
    
            dispatch(setSelectedTargets({ [terminal]: target }));
            const location = sequence.indexOf(targetSequence);
            const key = `${terminal}-cutsite`;
            const highlightData = {
                location: location,
                length: targetSequence.length,
                color: '#FFB6C1',
            };
            dispatch(setHighlights({ [key]: highlightData }));
            console.log("selected targets:", selectedTargets);
        }, 0); // Let click finish before applying changes
    };    

    const renderTargetItem = (target, terminal) => {
        const isSelected = selectedTargets?.[terminal]?.distal === target.distal &&
        selectedTargets?.[terminal]?.proximal === target.proximal;

        return (
          <div 
            className={`target-list-item ${isSelected ? 'selected-target' : ''}`}
            onMouseEnter={() => handleHover(target)}
            onMouseLeave={handleLeave}
            onClick={() => handleSelect(target, terminal)}>
            <div className="target-sequence">
              <span className="target-distal">{target.distal}</span>
              <span className="target-proximal">{target.proximal}</span>
            </div>
            <div className="target-details">
              <div>Efficiency: {target.score}</div>
              <div>Strand: {target.strand}</div>
              <div>Off Targets: {target.offtarget}</div>
              <div>Score: {target.score}</div>
            </div>
          </div>
        );
    };

    return (
        <div className="sidebar-content">
          <h3 className="sidebar-title">Pick Cut Site</h3>
          <div className="target-list">
            {targetList.n.length > 0 && (
              <div className="target-section">
                {operation === 'delete' && (
                  <h5 className="terminal-title">N Terminal Targets</h5>
                )}
                {targetList.n.map((target, i) => renderTargetItem(target, 'n'))}
              </div>
            )}
            {targetList.c.length > 0 && (
              <div className="target-section">
                {operation === 'delete' && (
                  <h5 className="terminal-title">C Terminal Targets</h5>
                )}
                {targetList.c.map((target, i) => renderTargetItem(target, 'c'))}
              </div>
            )}
          </div>
        </div>
      );      
}

export default TargetList