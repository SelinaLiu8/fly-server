import React, { createContext, useContext, useCallback } from 'react';
import * as fileUtils from '../utils/fileUtils';

// Create the context
const FileContext = createContext();

// Create a provider component
export const FileProvider = ({ children }) => {
  const downloadApeFile = useCallback((geneName, sequence, highlights, targets, currentPam, isoFormStrand) => {
    if (!geneName || !sequence || !highlights || !targets) {
      console.error("Missing required data for downloading APE file");
      return;
    }
    
    fileUtils.downloadApeFile(
      geneName,
      sequence,
      highlights,
      targets,
      currentPam,
      isoFormStrand
    );
  }, []);

  const downloadDeleteApeFile = useCallback((geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam) => {
    if (!geneName || !sequence || !highlights || !selectedNTarget || !selectedCTarget) {
      console.error("Missing required data for downloading delete APE file");
      return;
    }
    
    fileUtils.downloadDeleteApeFile(
      geneName,
      sequence,
      highlights,
      selectedNTarget,
      selectedCTarget,
      currentPam
    );
  }, []);

  const downloadGuideRna = useCallback((geneName, oligos) => {
    if (!geneName || !oligos) {
      console.error("Missing required data for downloading guide RNA");
      return;
    }
    
    fileUtils.downloadGuideRna(geneName, oligos);
  }, []);

  const downloadDeleteGuideRna = useCallback((geneName, oligos) => {
    if (!geneName || !oligos || !oligos.N || !oligos.C) {
      console.error("Missing required data for downloading delete guide RNA");
      return;
    }
    
    fileUtils.downloadDeleteGuideRna(geneName, oligos);
  }, []);

  const downloadPlasmidTemplate = useCallback((plasmidTemplate, geneName, sequence, targets, highlights, terminal, currentPam) => {
    if (!plasmidTemplate || !geneName || !sequence || !targets || !highlights || !terminal) {
      console.error("Missing required data for downloading plasmid template");
      return;
    }
    
    fileUtils.downloadPlasmidTemplate(
      plasmidTemplate,
      geneName,
      sequence,
      targets,
      highlights,
      terminal,
      currentPam
    );
  }, []);

  const downloadDeletePlasmidTemplate = useCallback((plasmidTemplate, geneName, sequence, highlights) => {
    if (!plasmidTemplate || !geneName || !sequence || !highlights) {
      console.error("Missing required data for downloading delete plasmid template");
      return;
    }
    
    fileUtils.downloadDeletePlasmidTemplate(
      plasmidTemplate,
      geneName,
      sequence,
      highlights
    );
  }, []);

  return (
    <FileContext.Provider
      value={{
        downloadApeFile,
        downloadDeleteApeFile,
        downloadGuideRna,
        downloadDeleteGuideRna,
        downloadPlasmidTemplate,
        downloadDeletePlasmidTemplate
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

// Create a custom hook to use the context
export const useFile = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};
