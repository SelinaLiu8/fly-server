import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { saveAs } from 'file-saver';
import { setPopup } from '../../features/appState/appStateSlicer'
import { generateFeatureBlock, formatGene, generateGuideFile, generatePlasmidFile } from '../../utilities/Utilities'
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

    const [plasmidTemplate, setPlasmidTemplate] = useState('');
    
    const tagOptions = [
        { label: 'N terminal SSPB and mCherry tag', value: 'N terminal SSPB and mCherry tag' },
        { label: 'N terminal EGFP and SSPB', value: 'N terminal EGFP and SSPB' },
        { label: 'C terminal mCherry and SSPB tag', value: 'C terminal mCherry and SSPB tag' },
        { label: 'C terminal EGFP and SSPB', value: 'C terminal EGFP and SSPB' },
    ];
    
    const deleteOptions = [
        { label: 'pHD-dsRed-attP-X', value: 'pHD-dsRed-attP-X' },
        { label: 'pHD-DsRed-X', value: 'pHD-DsRed-X' },
    ];
    
    // Compute dropdown options based on operation + terminal
    const dropdownOptions = useMemo(() => {
        if (operation === 'delete') return deleteOptions;
    
        return tagOptions.filter(({ label }) =>
          terminal === 'n'
            ? label.toLowerCase().startsWith('n')
            : label.toLowerCase().startsWith('c')
        );
    }, [operation, terminal]);

    const handleViewData = () => {
      dispatch(setPopup({
        type: 'print',
        stayOpen: true
      }))
    };

    const handleUploadTemplate = () => {
      dispatch(setPopup({
        type: 'upload',
        stayOpen: true
      }))
    }

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

    const handlePlasmidDownload = async () => {
        try {
          if (!plasmidTemplate || !sequence?.isoform || !selectedTargets) return;
      
          let target, pam;
      
          if (operation === 'tag') {
            const tagData = selectedTargets[terminal];
            target = tagData?.targetSequence;
            pam = tagData?.pam;
          } else if (operation === 'delete') {
            const nData = selectedTargets.n;
            const cData = selectedTargets.c;
      
            // For delete, you could concatenate both sequences or just pass one — depends on how generatePlasmidFile is set up
            target = (nData.targetSequence) + (cData.targetSequence);
            pam = (nData.pam) + (cData.pam);
          }
      
          if (!target || !pam) {
            console.warn('Missing target or PAM information.');
            return;
          }
      
          const { blob, filename } = await generatePlasmidFile({
            templateName: plasmidTemplate,
            geneName: sequence.isoform,
            sequence: sequence.fullSequence,
            highlights,
            terminal,
            target,
            pam,
            isDelete: operation === 'delete',
            strand: sequence.strand
          });
      
          saveAs(blob, filename);
        } catch (err) {
          console.error('Plasmid download failed:', err);
        }
    };     

    return (
        <div className="sidebar-content">
            <h3 className='sidebar-title'>Download Options</h3>
            <div className="target-list">
              <div className="download-section">
                  <label className="download-label">View All Data</label>
                  <button className="download-btn" onClick={handleViewData}>Open</button>
              </div>
              <div className="download-section">
                  <label className="download-label">Genomic Template</label>
                  <button className="download-btn" onClick={handleApeDownload}>Download</button>
              </div>
          
              <div className="download-section">
                  <label className="download-label">Guide RNA Vector</label>
                  <button className="download-btn" onClick={handleGuideDownload}>Download</button>
              </div>
          
              <div className="download-section">
                  <label className="download-label">Plasmid Template</label>
                  <select
                      className='download-dropdown'
                      value={plasmidTemplate}
                      onChange={(e) => setPlasmidTemplate(e.target.value)}>
                      <option value="">Select a template…</option>
                      {dropdownOptions.map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                      ))}
                  </select>
                  <button className="download-btn" onClick={handlePlasmidDownload}>Download</button>
              </div>
              <div className="download-section">
                  <label className="download-label">Upload Your Template</label>
                  <button className="download-btn" onClick={handleUploadTemplate}>Upload</button>
              </div>
            </div>
        </div>
    )
}

export default DownloadList