import React, { useState, useRef } from 'react';

const UploadPopUpScreen = () => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

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

  const handleUpload = () => {
    if (file) {
      alert(`Uploading: ${file.name}`);
      // Upload logic here
    } else {
      alert('No file selected');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="popup-wrapper">
      <div className="popup">
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

        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
};

export default UploadPopUpScreen;
