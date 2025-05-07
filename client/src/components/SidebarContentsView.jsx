import React from 'react'
import { useSelector } from 'react-redux';
import TargetList from './sidebar_contents/TargetList';
import HomologyList from './sidebar_contents/HomologyList';
import '../styles/SidebarContents.css'

const SidebarContents = () => {
    const activeMenu = useSelector((state) => state.appState.menu);
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);
    const targetsReady = useSelector((state) => state.appState.targetsReady);

    console.log("targetReady", targetsReady);

    return (
        <div className='sidebar-container'>
            {activeMenu === 2 && targetsReady && <TargetList />}
            {activeMenu === 3 && targetsReady && <HomologyList />}
        </div>
    )
};

export default SidebarContents