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
    // Add detailed console logs to identify what's missing
    console.log("downloadDeleteApeFile DETAILED DEBUG:", {
      geneName: geneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : [],
      selectedNTarget: selectedNTarget,
      selectedCTarget: selectedCTarget,
      currentPam: currentPam
    });
    
    if (!geneName || !sequence || !highlights || !selectedNTarget || !selectedCTarget) {
      console.error("Missing required data for downloading delete APE file");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!geneName) missingParams.push("geneName");
      if (!sequence) missingParams.push("sequence");
      if (!highlights) missingParams.push("highlights");
      if (!selectedNTarget) missingParams.push("selectedNTarget");
      if (!selectedCTarget) missingParams.push("selectedCTarget");
      
      console.error("Missing parameters:", missingParams.join(", "));
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
    // Add detailed console logs to identify what's missing
    console.log("downloadDeleteGuideRna DETAILED DEBUG:", {
      geneName: geneName,
      oligos: oligos,
      hasOligosN: oligos ? !!oligos.N : false,
      hasOligosC: oligos ? !!oligos.C : false,
      oligosNContent: oligos && oligos.N ? oligos.N : null,
      oligosCContent: oligos && oligos.C ? oligos.C : null
    });
    
    if (!geneName || !oligos || !oligos.N || !oligos.C) {
      console.error("Missing required data for downloading delete guide RNA");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!geneName) missingParams.push("geneName");
      if (!oligos) missingParams.push("oligos");
      else {
        if (!oligos.N) missingParams.push("oligos.N");
        if (!oligos.C) missingParams.push("oligos.C");
      }
      
      console.error("Missing parameters:", missingParams.join(", "));
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
    // Add detailed console logs to identify what's missing
    console.log("downloadDeletePlasmidTemplate DETAILED DEBUG:", {
      plasmidTemplate: plasmidTemplate,
      geneName: geneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : []
    });
    
    if (!plasmidTemplate || !geneName || !sequence || !highlights) {
      console.error("Missing required data for downloading delete plasmid template");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!plasmidTemplate) missingParams.push("plasmidTemplate");
      if (!geneName) missingParams.push("geneName");
      if (!sequence) missingParams.push("sequence");
      if (!highlights) missingParams.push("highlights");
      
      console.error("Missing parameters:", missingParams.join(", "));
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
