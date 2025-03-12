import React from 'react';

const Sidebar = ({
  activeMenu,
  screen,
  onMenuChange,
  onScreenChange,
  targets,
  currentHighlightLocation,
  onPickCutSite,
  onPickDeleteCutSite,
  onHighlightString,
  onClearHighlight,
  operation,
  primers,
  terminal,
  selectedArms,
  onSelectHomologyArm,
  onSelectDeleteHomologyArm,
  selectedPrimer,
  onSelectPrimer,
  geneName,
  oligos,
  onViewFinishedDesign,
  onViewDeleteFinishedDesign,
  onDownloadApeFile,
  onDownloadDeleteApeFile,
  onDownloadGuideRna,
  onDownloadDeleteGuideRna,
  onChangePlasmidTemplate,
  onDownloadPlasmidTemplate,
  onDownloadDeletePlasmidTemplate
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <div 
          className={`sidebar-menu-item ${activeMenu === 1 ? 'active' : ''}`}
          data-menu="1"
          onClick={onMenuChange}
        >
          <img src={require('../../assets/search.png')} alt="Search" />
          <span>Search</span>
        </div>
        
        {screen > 1 && (
          <>
            <div 
              className={`sidebar-menu-item ${activeMenu === 2 ? 'active' : ''}`}
              data-menu="2"
              onClick={onMenuChange}
            >
              <img src={require('../../assets/cutcite.png')} alt="Cut Site" />
              <span>Cut Site</span>
            </div>
            
            <div 
              className={`sidebar-menu-item ${activeMenu === 3 ? 'active' : ''}`}
              data-menu="3"
              onClick={onMenuChange}
            >
              <img src={require('../../assets/homology.png')} alt="Homology" />
              <span>Homology</span>
            </div>
            
            <div 
              className={`sidebar-menu-item ${activeMenu === 4 ? 'active' : ''}`}
              data-menu="4"
              onClick={onMenuChange}
            >
              <img src={require('../../assets/download.png')} alt="Download" />
              <span>Download</span>
            </div>
          </>
        )}
      </div>
      
      <div className="sidebar-content">
        {/* Content for each menu item would go here */}
        {/* This would include TargetList, HomologyList, DownloadOptions, etc. */}
        {/* For brevity, we're not implementing the full content here */}
      </div>
    </div>
  );
};

export default Sidebar;
