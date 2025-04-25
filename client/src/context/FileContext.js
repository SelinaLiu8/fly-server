import React, { createContext, useContext, useCallback } from 'react';
import * as fileUtils from '../utils/fileUtils';
import { useTarget } from './TargetContext';
import { useGene } from './GeneContext';
import { usePrimer } from './PrimerContext';

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

  // Import necessary contexts
  const { selectedNTarget: contextSelectedNTarget, selectedCTarget: contextSelectedCTarget, currentPam: contextCurrentPam } = useTarget();
  const { geneName: contextGeneName, plasmidTemplate: contextPlasmidTemplate } = useGene();
  const { oligos: contextOligos } = usePrimer();

  const downloadDeleteApeFile = useCallback((geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam) => {
    // Add detailed console logs to identify what's missing
    console.log("downloadDeleteApeFile DETAILED DEBUG:", {
      geneName: geneName,
      contextGeneName: contextGeneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : [],
      selectedNTarget: selectedNTarget,
      contextSelectedNTarget: contextSelectedNTarget,
      selectedCTarget: selectedCTarget,
      contextSelectedCTarget: contextSelectedCTarget,
      currentPam: currentPam,
      contextCurrentPam: contextCurrentPam
    });
    
    // Use parameters or fall back to context values
    const finalGeneName = geneName || contextGeneName;
    const finalSequence = sequence;
    const finalHighlights = highlights;
    const finalSelectedNTarget = selectedNTarget || contextSelectedNTarget;
    const finalSelectedCTarget = selectedCTarget || contextSelectedCTarget;
    const finalCurrentPam = currentPam || contextCurrentPam;
    
    console.log("Using values:", {
      usingGeneName: finalGeneName ? (geneName ? "parameters" : "context") : "neither",
      usingSequence: finalSequence ? "parameters" : "neither",
      usingHighlights: finalHighlights ? "parameters" : "neither",
      usingSelectedNTarget: finalSelectedNTarget ? (selectedNTarget ? "parameters" : "context") : "neither",
      usingSelectedCTarget: finalSelectedCTarget ? (selectedCTarget ? "parameters" : "context") : "neither",
      usingCurrentPam: finalCurrentPam ? (currentPam ? "parameters" : "context") : "neither"
    });
    
    if (!finalGeneName || !finalSequence || !finalHighlights || !finalSelectedNTarget || !finalSelectedCTarget) {
      console.error("Missing required data for downloading delete APE file");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!finalGeneName) missingParams.push("geneName");
      if (!finalSequence) missingParams.push("sequence");
      if (!finalHighlights) missingParams.push("highlights");
      if (!finalSelectedNTarget) missingParams.push("selectedNTarget");
      if (!finalSelectedCTarget) missingParams.push("selectedCTarget");
      
      console.error("Missing parameters:", missingParams.join(", "));
      return;
    }
    
    fileUtils.downloadDeleteApeFile(
      finalGeneName,
      finalSequence,
      finalHighlights,
      finalSelectedNTarget,
      finalSelectedCTarget,
      finalCurrentPam
    );
  }, [contextGeneName, contextSelectedNTarget, contextSelectedCTarget, contextCurrentPam]);

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
      contextGeneName: contextGeneName,
      oligos: oligos,
      contextOligos: contextOligos,
      hasOligosN: oligos ? !!oligos.N : false,
      hasContextOligosN: contextOligos ? !!contextOligos.N : false,
      hasOligosC: oligos ? !!oligos.C : false,
      hasContextOligosC: contextOligos ? !!contextOligos.C : false
    });
    
    // Use parameters or fall back to context values
    const finalGeneName = geneName || contextGeneName;
    const finalOligos = oligos || contextOligos;
    
    console.log("Using values:", {
      usingGeneName: finalGeneName ? (geneName ? "parameters" : "context") : "neither",
      usingOligos: finalOligos ? (oligos ? "parameters" : "context") : "neither"
    });
    
    if (!finalGeneName || !finalOligos || !finalOligos.N || !finalOligos.C) {
      console.error("Missing required data for downloading delete guide RNA");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!finalGeneName) missingParams.push("geneName");
      if (!finalOligos) missingParams.push("oligos");
      else {
        if (!finalOligos.N) missingParams.push("oligos.N");
        if (!finalOligos.C) missingParams.push("oligos.C");
      }
      
      console.error("Missing parameters:", missingParams.join(", "));
      return;
    }
    
    fileUtils.downloadDeleteGuideRna(finalGeneName, finalOligos);
  }, [contextGeneName, contextOligos]);

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
      contextPlasmidTemplate: contextPlasmidTemplate,
      geneName: geneName,
      contextGeneName: contextGeneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : []
    });
    
    // Use parameters or fall back to context values
    const finalPlasmidTemplate = plasmidTemplate || contextPlasmidTemplate;
    const finalGeneName = geneName || contextGeneName;
    const finalSequence = sequence;
    const finalHighlights = highlights;
    
    console.log("Using values:", {
      usingPlasmidTemplate: finalPlasmidTemplate ? (plasmidTemplate ? "parameters" : "context") : "neither",
      usingGeneName: finalGeneName ? (geneName ? "parameters" : "context") : "neither",
      usingSequence: finalSequence ? "parameters" : "neither",
      usingHighlights: finalHighlights ? "parameters" : "neither"
    });
    
    if (!finalPlasmidTemplate || !finalGeneName || !finalSequence || !finalHighlights) {
      console.error("Missing required data for downloading delete plasmid template");
      
      // Log exactly which parameters are missing
      const missingParams = [];
      if (!finalPlasmidTemplate) missingParams.push("plasmidTemplate");
      if (!finalGeneName) missingParams.push("geneName");
      if (!finalSequence) missingParams.push("sequence");
      if (!finalHighlights) missingParams.push("highlights");
      
      console.error("Missing parameters:", missingParams.join(", "));
      return;
    }
    
    fileUtils.downloadDeletePlasmidTemplate(
      finalPlasmidTemplate,
      finalGeneName,
      finalSequence,
      finalHighlights
    );
  }, [contextPlasmidTemplate, contextGeneName]);

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
