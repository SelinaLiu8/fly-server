import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { saveAs } from 'file-saver';
import { generatePlasmidFile } from '../../utilities/Utilities';
import { clearPopup } from '../../features/appState/appStateSlicer';
import '../../App.css'

const UploadPopUpScreen = () => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const sequence = useSelector((state) => state.appState.sequenceData);
  const operation = useSelector((state) => state.appState.operation);
  const highlights = useSelector((state) => state.appState.highlights);
  const terminal = useSelector((state) => state.appState.terminal);
  const selectedTargets = useSelector((state) => state.appState.selectedTargets);
  const dispatch = useDispatch();

  const handleFileSelect = (e) => {
    const uploaded = e.target.files[0];
    setFile(uploaded);

    console.log("Uploaded file:", uploaded);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      console.log("Dropped file:", e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUploadTemplateDownload = async () => {
        try {
            if (!file || !sequence?.isoform || !selectedTargets) return;
        
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
              templateName: null,
              fileName: file,
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
    <div className="popup-wrapper">
      <div className="popup upload-popup">
        <button className='close-btn' onClick={() => dispatch(clearPopup())}>X</button>
        <h4 className="popup-title">Please Upload Your Template Here</h4>

        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>Click or drag a file here to upload</p>
          )}
          <input
            type="file"
            accept=".txt,.csv,.json"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
        </div>

        <button className="upload-btn" onClick={handleUploadTemplateDownload}>Download</button>
      </div>
    </div>
  );
};

export default UploadPopUpScreen;
