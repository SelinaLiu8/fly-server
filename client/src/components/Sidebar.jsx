import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMenu, setScreen } from '../features/appState/appStateSlicer';
import SidebarContents from './SidebarContentsView';

import searchIcon from '../assets/search.png';
import cutSiteIcon from '../assets/cutcite.png';
import homologyIcon from '../assets/homology.png';
import downloadIcon from '../assets/download.png';

import '../App.css'

const Sidebar = () => {
  const dispatch = useDispatch();
  const screen = useSelector((state) => state.appState.screen);
  const activeMenu = useSelector((state) => state.appState.menu);

  const handleMenuClick = (menuNumber) => {
    dispatch(setMenu(menuNumber));
    dispatch(setScreen(menuNumber));
  };

  return (
    <div className="sidebar">
      <div className="sidebar-container">
        <div 
          className={`menu-icon ${activeMenu === 1 ? 'active' : ''}`}
          onClick={() => handleMenuClick(1)}
        >
          <div className="menu-image-wrapper">
            <img src={searchIcon} alt="Search" />
          </div>
          <label>Search</label>
        </div>

        {screen > 1 && (
          <>
            <div 
              className={`menu-icon ${activeMenu === 2 ? 'active' : ''}`}
              onClick={() => handleMenuClick(2)}
            >
              <div className="menu-image-wrapper">
                <img src={cutSiteIcon} alt="Cut Site" />
              </div>
              {/* <label>Cut Site</label> */}
            </div>
            {
              screen === 2 && (
                <SidebarContents />
              )
            }

            <div 
              className={`menu-icon ${activeMenu === 3 ? 'active' : ''}`}
              onClick={() => handleMenuClick(3)}
            >
              <div className="menu-image-wrapper">
                <img src={homologyIcon} alt="Homology" />
              </div>
              {/* <label>Homology</label> */}
            </div>
            {
              screen === 3 && (
                <SidebarContents />
              )
            }

            <div 
              className={`menu-icon ${activeMenu === 4 ? 'active' : ''}`}
              onClick={() => handleMenuClick(4)}
            >
              <div className="menu-image-wrapper">
                <img src={downloadIcon} alt="Download" />
              </div>
              {/* <label>Download</label> */}
            </div>
            {
              screen === 4 && (
                <SidebarContents />
              )
            }
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;