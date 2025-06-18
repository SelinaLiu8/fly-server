import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { saveAs } from 'file-saver';
import { setPopup } from '../../features/appState/appStateSlicer'
import { generateFeatureBlock, formatGene, generateGuideFile } from '../../utilities/Utilities'
import '../../styles/SidebarContents.css'

const DownloadList = () => {
    const dispatch = useDispatch()

    const gene = useSelector((state) => state.appState.gene);
    const sequence = useSelector((state) => state.appState.sequenceData);
    const highlights = useSelector((state) => state.appState.highlights);
    const operation = useSelector((state) => state.appState.operation);
    const oligos = useSelector((state) => state.appState.oligos);
    const terminal = useSelector((state) => state.appState.terminal);
    const selectedTargets = useSelector((state) => state.appState.selectedTargets);
    const selectedPrimers = useSelector((state) => state.appState.selectedPrimers);

    console.log(sequence)

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
            generateFeatureBlock(highlights, selectedTargets, selectedPrimers)
          ]);
      
          const date = new Date();
          const formattedDate = `${date.getDate()}-${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()]}-${date.getFullYear()}`;

          console.log("features", features)
          console.log("gene", gene)
      
          const apeContent = emptyApe
            .replace('*FEATURES*', features)
            .replace('*name*', sequence.isoform || 'Gene')
            .replace('*length*', sequence.fullSequence.length)
            .replace('*date*', formattedDate)
            .replace('*GENE*', formatGene(sequence.fullSequence));

          console.log("ape content", apeContent);
      
          const blob = new Blob([apeContent], { type: 'text/plain;charset=utf-8' });
          saveAs(blob, `${sequence.isoform || 'gene'}.ape`);
        } catch (error) {
          console.error('Download failed:', error);
        }
    };

    const handleGuideDownload = async () => {
        try {
            if (operation === 'tag') {
                const sense = oligos[terminal].sense;
                console.log("oligos in handle guide download", oligos[terminal].sense);
                await generateGuideFile(sense, sequence.isoform, `rna-tag-${operation.toUpperCase()}`);
            } else if (operation === 'delete') {
                await generateGuideFile(oligos.n.sense, sequence.isoform, 'rna-delete-N');
                await generateGuideFile(oligos.c.sense, sequence.isoform, 'rna-delete-C');
            }
        } catch (error) {
            console.error('Guide RNA download failed:', error);
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
                <button className="btn" onClick={handleGuideDownload}>Download</button>
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