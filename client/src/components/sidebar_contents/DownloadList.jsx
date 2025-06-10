import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { saveAs } from 'file-saver';
import { setPopup } from '../../features/appState/appStateSlicer'
import { generateFeatureBlock, formatGene } from '../../utilities/Utilities'
import '../../styles/SidebarContents.css'

const DownloadList = () => {
    const dispatch = useDispatch()

    const gene = useSelector((state) => state.appState.gene);
    const sequence = useSelector((state) => state.appState.sequenceData);

    const plasmidOptions = [["N terminal SSPB and mCherry tag","N terminal EGFP and SSPB","C terminal mCherry and SSPB tag","C terminal EGFP and SSPB"]]

    const handleViewData = () => {
        dispatch(setPopup({
            type: 'print',
            stayOpen: true
        }))
    };

    const handleApeDownload = async () => {
        try {
          const [emptyApe, features] = await Promise.all([
            fetch(`${window.location.origin}/fly_templates/empty_ape.txt`).then(res => res.text()),
            generateFeatureBlock(highlights)
          ]);
      
          const date = new Date();
          const formattedDate = `${date.getDate()}-${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()]}-${date.getFullYear()}`;
      
          const apeContent = emptyApe
            .replace('*FEATURES*', features)
            .replace('*name*', gene || 'Gene')
            .replace('*length*', sequence.length)
            .replace('*date*', formattedDate)
            .replace('*GENE*', formatGene(sequence.sequence));
      
          const blob = new Blob([apeContent], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, `${gene || 'gene'}.ape`);
        } catch (error) {
          console.error('Download failed:', error);
        }
    };

    return (
        <div className="sidebar-content">
            <h3 className='sidebar-title'>Download Options</h3>
            <div className="download-header">
                <button className="btn" onClick={handleViewData}>View All Data</button>
            </div>
            <div className="download-section">
                <label className="download-label">Genomic Template</label>
                <button className="btn" onClick={handleApeDownload}>Download</button>
            </div>
        
            <div className="download-section">
                <label className="download-label">Guide RNA Vector</label>
                <button className="btn">Download</button>
            </div>
        
            <div className="download-section">
                <label className="download-label">Plasmid Template</label>
                <select>
                {plasmidOptions.map((option, i) => (
                    <option key={i} value={option.value}>
                    {option.label}
                    </option>
                ))}
                </select>
                <button className="btn">Download</button>
            </div>
        </div>
    )
}

export default DownloadList