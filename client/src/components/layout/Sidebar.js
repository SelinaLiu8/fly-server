import React from 'react';

const Sidebar = ({
  activeMenu,
  screen,
  onMenuChange,
  onScreenChange
}) => {
  return (
    <div className="sidebar">
      <div className="menu-icon-container">
        <div 
          className={`menu-icon ${activeMenu === 1 ? 'active' : ''}`}
          data-menu="1"
          onClick={onMenuChange}
        >
          <div className="menu-image-wrapper">
            <img src={require('../../assets/search.png')} alt="Search" />
          </div>
          <label>Search</label>
        </div>
        
        {screen > 1 && (
          <>
            <div 
              className={`menu-icon ${activeMenu === 2 ? 'active' : ''}`}
              data-menu="2"
              onClick={onMenuChange}
            >
              <div className="menu-image-wrapper">
                <img src={require('../../assets/cutcite.png')} alt="Cut Site" />
              </div>
              <label>Cut Site</label>
            </div>
            
            <div 
              className={`menu-icon ${activeMenu === 3 ? 'active' : ''}`}
              data-menu="3"
              onClick={onMenuChange}
            >
              <div className="menu-image-wrapper">
                <img src={require('../../assets/homology.png')} alt="Homology" />
              </div>
              <label>Homology</label>
            </div>
            
            <div 
              className={`menu-icon ${activeMenu === 4 ? 'active' : ''}`}
              data-menu="4"
              onClick={onMenuChange}
            >
              <div className="menu-image-wrapper">
                <img src={require('../../assets/download.png')} alt="Download" />
              </div>
              <label>Download</label>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
