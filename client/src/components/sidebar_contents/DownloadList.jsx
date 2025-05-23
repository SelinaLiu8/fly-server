import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPopup } from '../../features/appState/appStateSlicer'
import '../../styles/SidebarContents.css'

const DownloadList = () => {
    const dispatch = useDispatch()

    const plasmidOptions = [["N terminal SSPB and mCherry tag","N terminal EGFP and SSPB","C terminal mCherry and SSPB tag","C terminal EGFP and SSPB"]]

    const handleViewData = () => {
        dispatch(setPopup({
            type: 'print',
            stayOpen: true
        }))
    };

    return (
        <div className="sidebar-content">
            <h3 className='sidebar-title'>Download Options</h3>
            <div className="download-header">
                <button className="btn" onClick={handleViewData}>View All Data</button>
            </div>
            <div className="download-section">
                <label className="download-label">Genomic Template</label>
                <button className="btn">Download</button>
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