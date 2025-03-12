import React from 'react';
import TargetList from '../ui/TargetList';
import HomologyList from '../ui/HomologyList';
import DownloadOptions from '../ui/DownloadOptions';

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
              
              {activeMenu === 2 && targets && targets.length > 0 && (
                <TargetList 
                  targets={targets}
                  currentHighlightLocation={currentHighlightLocation}
                  onPickCutSite={onPickCutSite}
                  onPickDeleteCutSite={onPickDeleteCutSite}
                  onHighlightString={onHighlightString}
                  onClearHighlight={onClearHighlight}
                  operation={operation}
                />
              )}
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
              
              {activeMenu === 3 && primers && (
                <div className="homology-list">
                  <HomologyList 
                    primers={primers}
                    terminal={terminal}
                    selectedArms={selectedArms}
                    onSelectHomologyArm={onSelectHomologyArm}
                    onSelectDeleteHomologyArm={onSelectDeleteHomologyArm}
                    onHighlightString={onHighlightString}
                    onClearHighlight={onClearHighlight}
                    operation={operation}
                  />
                </div>
              )}
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
              
              {activeMenu === 4 && (
                <div className="download-list">
                  <DownloadOptions 
                    geneName={geneName}
                    oligos={oligos}
                    operation={operation}
                    onViewFinishedDesign={onViewFinishedDesign}
                    onViewDeleteFinishedDesign={onViewDeleteFinishedDesign}
                    onDownloadApeFile={onDownloadApeFile}
                    onDownloadDeleteApeFile={onDownloadDeleteApeFile}
                    onDownloadGuideRna={onDownloadGuideRna}
                    onDownloadDeleteGuideRna={onDownloadDeleteGuideRna}
                    onChangePlasmidTemplate={onChangePlasmidTemplate}
                    onDownloadPlasmidTemplate={onDownloadPlasmidTemplate}
                    onDownloadDeletePlasmidTemplate={onDownloadDeletePlasmidTemplate}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
