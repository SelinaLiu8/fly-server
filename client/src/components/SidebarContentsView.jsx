import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { searchForTargetsAsync } from '../features/appState/appStateThunks';
import TargetList from './sidebar_contents/TargetList';
import HomologyList from './sidebar_contents/HomologyList';
import DownloadList from './sidebar_contents/DownloadList';
import '../styles/SidebarContents.css'

const SidebarContents = () => {
    const dispatch = useDispatch();
    const activeMenu = useSelector((state) => state.appState.menu);
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);
    const targetsReady = useSelector((state) => state.appState.targetsReady);
    const sequence = useSelector((state) => state.appState.sequenceData);
    const terminal = useSelector((state) => state.appState.terminal)

    useEffect(() => {
        if (sequence && terminal && !targetsReady) {
          dispatch(searchForTargetsAsync());
        }
    }, [sequence, terminal, targetsReady, dispatch]);
    

    console.log("targetReady", targetsReady);

    return (
        <div className='sidebar-container'>
            {activeMenu === 2 && targetsReady && <TargetList />}
            {activeMenu === 3 && <HomologyList />}
            {activeMenu === 4 && <DownloadList />}
        </div>
    )
};

export default SidebarContents