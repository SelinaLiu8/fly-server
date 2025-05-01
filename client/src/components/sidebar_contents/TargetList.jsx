import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedTarget, setMenu, setCurrentHighlights, clearCurrentHighlights, setHighlights} from '../../features/appState/appStateSlicer'
import '../../styles/SidebarContents.css'
import '../../styles/Sequence.css'

const TargetList = () => {    
    const dispatch = useDispatch();
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);
    const sequence = useSelector((state) => state.appState.sequenceData.fullSequence)

    let totalTargetNum;
    let selectedTargets;

    console.log("target list in jsx", targetList);
    

    if (operation === 'tag') {
        totalTargetNum = 1;
    } else if (operation === 'delete') {
        totalTargetNum = 2;
    }

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
        dispatch(setSelectedTarget({ terminal: { target } }));
        const location = sequence.indexOf(target.targetSequence);
        const key = `${terminal}-cutsite`;
        const highlightData = {
            location: location,
            length: target.targetSequence.length,
            color: '#FFB6C1',
        };
        dispatch(setHighlights({ [key]: highlightData }));
    };

    const renderTargetItem = (target, terminal) => {
        console.log('single target', target);
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