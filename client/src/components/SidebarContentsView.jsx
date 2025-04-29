import React from 'react'
import { useSelector } from 'react-redux';
import '../App.css'

const SidebarContents = () => {
    const activeMenu = useSelector((state) => state.appState.menu);
    const targetList = useSelector((state) => state.appState.targetList);
    const operation = useSelector((state) => state.appState.operation);

    return (
        <div>SidebarContents</div>
    )
};

export default SidebarContents