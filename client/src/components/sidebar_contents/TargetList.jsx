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
    const selectedTargets = useSelector((state) => state.appState.selectedTargets);

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
    
    const handleHover = (target) => {
        dispatch(setCurrentHighlights({
            current: {
                location: target.location,
                length: target.targetSequence.length,
                color: '#f5d76e',
            }
        }));
        // console.log("current Highlights", useSelector((state) => state.appState.currentHighlights));
    };

    const handleLeave = () => {
        dispatch(clearCurrentHighlights());
        // console.log("current Highlights", useSelector((state) => state.appState.currentHighlights));s
    };

    const handleSelect = (target, terminal) => {
        console.log("target in handleSelect:", target)
        let targetSequence = target.targetSequence; 
        if (target.strand === '-') {
            targetSequence = getReverseComplement(targetSequence);
        }
        dispatch(setSelectedTargets({ [terminal]: target }));
        const location = sequence.indexOf(targetSequence);
        const key = `${terminal}-cutsite`;
        const highlightData = {
            location: location,
            length: target.targetSequence.length,
            color: '#FFB6C1',
        };
        dispatch(setHighlights({ [key]: highlightData }));
        console.log("selected targets:", selectedTargets);
    };

    const renderTargetItem = (target, terminal) => {
        return (
          <div 
            className='target-list-item'
            onMouseEnter={() => handleHover(target)}
            onMouseLeave={handleLeave()}
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
          <h3 className='sidebar-title'>Pick Cut Site</h3>
            {targetList.n.length > 0 && (
                <div className="target-container">
                    { operation === 'delete' && <h4>N Terminal Targets</h4>}
                    <div className="target-list">
                    {targetList.n.map((target, i) => renderTargetItem(target, 'n'))}
                    </div>
                </div>
            )}
            {targetList.c.length > 0 && (
                <div className="target-list">
                    { operation === 'delete' && <h4>C Terminal Targets</h4>}
                    <div className="target-list-items">
                    {targetList.c.map((target, i) => renderTargetItem(target, 'c'))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TargetList