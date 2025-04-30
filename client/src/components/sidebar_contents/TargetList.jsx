import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedTargets, setMenu, setCurrentHighlight, clearCurrentHighlight, setHighlights} from '../../features/appState/appStateSlicer'
import '../../styles/SidebarContents.css'
import '../../styles/Sequence.css'

const TargetList = () => {    
    const dispatch = useDispatch();
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);

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
          location: target.location || 0,
          length: target.distal.length + target.proximal.length,
          color: '#f5d76e',
        }));
    };

    const handleLeave = () => {
        dispatch(clearCurrentHighlights());
    };

    const handleSelect = (target, terminal) => {
        dispatch(setSelectedTarget({ terminal, target }));
        selectedTargets = useSelector((state) => state.appState.selectedTargets);
    };

    const renderTargetItem = (target) => {
        console.log('single target', target);
        return (
          <div>
            <div className="target-sequence">
              <span className="target-distal">{target.distal}</span>
              <span className="target-proximal">{target.proximal}</span>
            </div>
            <div className="target-details">
              <div>Efficiency: {target.score || 'N/A'}</div>
              <div>Strand: {target.strand || 'N/A'}</div>
              <div>Offset: {target.offset || 'N/A'}</div>
            </div>
          </div>
        );
    };

    return (
        <div className="sidebar-content">
          <h3>Pick Cut Site</h3>
            {targetList.n.length > 0 && (
                <div className="terminal-section">
                    { operation === 'delete' && <h4>N Terminal Targets</h4>}
                    <div className="target-list-items">
                    {targetList.n.map((target, i) => renderTargetItem(target))}
                    </div>
                </div>
            )}
            {targetList.c.length > 0 && (
                <div className="terminal-section">
                    { operation === 'delete' && <h4>C Terminal Targets</h4>}
                    <div className="target-list-items">
                    {targetList.c.map((target, i) => renderTargetItem(target))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TargetList