import React from 'react';
import TargetList from '../ui/TargetList';
import HomologyList from '../ui/HomologyList';
import DownloadOptions from '../ui/DownloadOptions';

const SidebarContent = ({
  activeMenu,
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
    <div className="sidebar-content">
      {activeMenu === 2 && targets && targets.length > 0 && (
        <div className="sidebar-panel">
          <h3 className="panel-title">Cut Site</h3>
          <TargetList 
            targets={targets}
            currentHighlightLocation={currentHighlightLocation}
            onPickCutSite={onPickCutSite}
            onPickDeleteCutSite={onPickDeleteCutSite}
            onHighlightString={onHighlightString}
            onClearHighlight={onClearHighlight}
            operation={operation}
          />
        </div>
      )}
      
      {activeMenu === 3 && (
        <div className="sidebar-panel">
          <h3 className="panel-title">Homology</h3>
          <div className="homology-list">
            {console.log('SidebarContent - activeMenu:', activeMenu, 'primers:', primers, 'operation:', operation)}
            {primers ? (
              <HomologyList 
                primers={primers}
                terminal={terminal}
                selectedArms={selectedArms}
                onSelectHomologyArm={onSelectHomologyArm}
                onSelectDeleteHomologyArm={onSelectDeleteHomologyArm}
                onHighlightString={onHighlightString}
                onClearHighlight={onClearHighlight}
                operation={operation}
                targets={targets}
              />
            ) : (
              <div className="homology-list-empty">No primers available. Please select a cut site first.</div>
            )}
          </div>
        </div>
      )}
      
      {activeMenu === 4 && (
        <div className="sidebar-panel">
          <h3 className="panel-title">Download</h3>
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
        </div>
      )}
    </div>
  );
};

export default SidebarContent;
