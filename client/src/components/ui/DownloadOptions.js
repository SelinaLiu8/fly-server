import React, { useState } from 'react';

const DownloadOptions = ({
  geneName,
  oligos,
  operation,
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
  const [mutatePam, setMutatePam] = useState(false);

  if (!oligos) {
    return <div className="download-options-empty">No download options available</div>;
  }

  const handleMutatePamToggle = () => {
    setMutatePam(prev => !prev);
  };

  const handleMutatePamSubmit = (e) => {
    e.preventDefault();
    // This would be handled by the parent component
  };

  return (
    <div className="download-options">
      <h3>Download Options</h3>
      
      <div className="download-section">
        <h4>View Design</h4>
        <button 
          className="download-button"
          onClick={operation === 'delete' ? onViewDeleteFinishedDesign : onViewFinishedDesign}
        >
          View Design
        </button>
      </div>
      
      <div className="download-section">
        <h4>APE Files</h4>
        <button 
          className="download-button"
          onClick={operation === 'delete' ? onDownloadDeleteApeFile : onDownloadApeFile}
        >
          Download APE File
        </button>
      </div>
      
      <div className="download-section">
        <h4>Guide RNA</h4>
        <button 
          className="download-button"
          onClick={operation === 'delete' ? onDownloadDeleteGuideRna : onDownloadGuideRna}
        >
          Download Guide RNA
        </button>
      </div>
      
      <div className="download-section">
        <h4>Plasmid Template</h4>
        <div className="plasmid-template-selector">
          <select onChange={onChangePlasmidTemplate}>
            <option value="">Select a plasmid template</option>
            <option value="pHD-DsRed-X">pHD-DsRed-X</option>
            <option value="pHD-dsRed-attP-X">pHD-dsRed-attP-X</option>
            <option value="N terminal EGFP and SSPB">N terminal EGFP and SSPB</option>
            <option value="N terminal EGFP and SSPB tag">N terminal EGFP and SSPB tag</option>
            <option value="N terminal mDendra2 and SSPB tag">N terminal mDendra2 and SSPB tag</option>
            <option value="N terminal mScarlett and SSPB tag">N terminal mScarlett and SSPB tag</option>
            <option value="N terminal SSPB and mCherry tag">N terminal SSPB and mCherry tag</option>
            <option value="C terminal EGFP and SSPB">C terminal EGFP and SSPB</option>
            <option value="C terminal EGFP and SSPB tag">C terminal EGFP and SSPB tag</option>
            <option value="C terminal mCherry and SSPB tag">C terminal mCherry and SSPB tag</option>
            <option value="C terminal mDendra2 and SSPB tag">C terminal mDendra2 and SSPB tag</option>
            <option value="C terminal mScarlett and SSPB tag">C terminal mScarlett and SSPB tag</option>
          </select>
          <button 
            className="download-button"
            onClick={operation === 'delete' ? onDownloadDeletePlasmidTemplate : onDownloadPlasmidTemplate}
          >
            Download Plasmid Template
          </button>
        </div>
      </div>
      
      <div className="download-section">
        <h4>Mutate PAM</h4>
        <button 
          className="download-button"
          onClick={handleMutatePamToggle}
        >
          {mutatePam ? 'Cancel' : 'Mutate PAM'}
        </button>
        
        {mutatePam && (
          <form onSubmit={handleMutatePamSubmit} className="mutate-pam-form">
            <div className="form-group">
              <label htmlFor="newPam">New PAM Sequence</label>
              <input
                type="text"
                id="newPam"
                name="newPam"
                placeholder="Enter new PAM sequence"
                maxLength="3"
                required
              />
            </div>
            <button type="submit" className="mutate-pam-submit">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DownloadOptions;
