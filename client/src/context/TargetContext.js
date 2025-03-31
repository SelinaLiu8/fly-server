import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { useUI } from './UIContext';
import { useGene } from './GeneContext';

// Create the context
const TargetContext = createContext();

// Create a provider component
export const TargetProvider = ({ children }) => {
  const { showPopup, setMenu } = useUI();
  const { terminal } = useGene();
  
  // State for target data
  const [targets, setTargets] = useState(null);
  
  // Debug: Log when targets change
  useEffect(() => {
    console.log('TargetContext: targets changed', {
      hasTargets: targets && targets.length > 0,
      targetsCount: targets ? targets.length : 0
    });
  }, [targets]);
  const [selectedNTarget, setSelectedNTarget] = useState(null);
  const [selectedCTarget, setSelectedCTarget] = useState(null);
  const [mutatePam, setMutatePam] = useState(false);
  const [currentPam, setCurrentPam] = useState(null);

  // Loading image
  const loading = require('../assets/loading.png');

  // Define processDeleteTargetSearch first since it's used in handleDeleteOperation
  const processDeleteTargetSearch = useCallback(async (nGene, cGene) => {
    try {
      // Show searching for target popup immediately
      showPopup({
        message: <h2>Searching for Targets</h2>,
        image: loading,
        stayOpen: true,
      });
      
      // Fetch the N-terminal and C-terminal target data separately
      const [nResponse, cResponse] = await Promise.all([
        api.searchForTargets(nGene),
        api.searchForTargets(cGene)
      ]);
      
      const nEfficiencyString = nResponse.results.map(
        (target) => target.distal + target.proximal
      );
      const cEfficiencyString = cResponse.results.map(
        (target) => target.distal + target.proximal
      );
      
      // Update popup to show checking efficiency
      showPopup({
        message: <h2>Checking Target Efficiency</h2>,
        image: loading,
        stayOpen: true,
      });
      
      setTargets([...nResponse.results, ...cResponse.results]);
      
      // Now fetch target efficiency for both N and C terminal targets
      const [nEfficiencyResponse, cEfficiencyResponse] = await Promise.all([
        api.getTargetEfficiency(nEfficiencyString),
        api.getTargetEfficiency(cEfficiencyString)
      ]);
      
      const updatedNTargets = nResponse.results.map((target) => ({
        ...target,
        score: nEfficiencyResponse[target.distal + target.proximal],
        terminalType: 'N',
      }));
      
      const updatedCTargets = cResponse.results.map((target) => ({
        ...target,
        score: cEfficiencyResponse[target.distal + target.proximal],
        terminalType: 'C',
      }));
      
      const updatedTargets = [...updatedNTargets, ...updatedCTargets];
      
      // Automatically select the best target for each terminal based on score
      const bestNTarget = updatedNTargets.reduce((best, current) => 
        (current.score > (best?.score || 0)) ? current : best, null);
      
      const bestCTarget = updatedCTargets.reduce((best, current) => 
        (current.score > (best?.score || 0)) ? current : best, null);
      
// Always show all targets for manual selection instead of auto-selecting
showPopup({ show: false });
setTargets(updatedTargets);
setMenu(2);

// Don't pre-select any targets, let the user select them manually
console.log('Found targets, waiting for user selection');
setSelectedNTarget(null);
setSelectedCTarget(null);
    } catch (error) {
      console.error('Error processing delete target search:', error);
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching for targets. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [showPopup, setMenu, loading]);

  // Now define handleDeleteOperation which uses processDeleteTargetSearch
  const handleDeleteOperation = useCallback((highlights, sequence) => {
    if (!highlights || !highlights.start || !highlights.stop) {
      console.error("Highlights not properly set for delete operation.");
      return;
    }
    
    const nLocation = highlights.start.location;
    const cLocation = highlights.stop.location;
    
    const nTargetGenes = sequence.substring(nLocation - 50, nLocation + 50);
    const cTargetGenes = sequence.substring(cLocation - 50, cLocation + 50);
    
    // Note: The loading popup is now shown in App.js before this function is called
    // to ensure the UI updates before the heavy processing begins
    
    // Process both N and C terminal targets for delete operation
    processDeleteTargetSearch(nTargetGenes, cTargetGenes);
  }, [processDeleteTargetSearch]);

  const processTagTargetSearch = useCallback(async (targetGenes) => {
    try {
      const response = await api.searchForTargets(targetGenes);
      const efficiencyString = response.results.map((target) => target.distal + target.proximal);
      
      showPopup({
        message: <h2>Checking Target Efficiency</h2>,
        image: loading,
        stayOpen: true,
      });
      
      setTargets(response.results);
      
      const efficiencyResponse = await api.getTargetEfficiency(efficiencyString);
      
      const updatedTargets = response.results.map((target) => {
        const gene = target.distal + target.proximal;
        return { ...target, score: efficiencyResponse[gene] };
      });
      
      showPopup({ show: false });
      setTargets(updatedTargets);
      setMenu(2);
      
      if (terminal === "n" || terminal === "c") {
        scrollToTerminal(terminal);
      }
    } catch (error) {
      console.error('Error processing tag target search:', error);
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching for targets. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [terminal, showPopup, setMenu, loading]);

  const scrollToTerminal = useCallback((terminal) => {
    const windowHeight = window.innerHeight;
    let scrollTop;
    
    if (terminal === 'n') {
      const startElement = document.getElementsByClassName('start')[0];
      if (startElement) {
        scrollTop = startElement.getBoundingClientRect().top;
      }
    } else {
      const screen2 = document.getElementsByClassName('screen-2')[0];
      if (screen2) {
        scrollTop = screen2.scrollHeight; // Scroll to the bottom
      }
    }
    
    if (scrollTop !== undefined) {
      const screen2Element = document.getElementsByClassName('screen-2')[0];
      if (screen2Element) {
        screen2Element.scrollTo({
          top: scrollTop - windowHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  // Get the operation from the GeneContext
  const { operation } = useGene();

  // Combined function for picking cut sites for both tag and delete operations
  const pickCutSite = useCallback((target, saveCurrentHighlight) => {
    console.log('pickCutSite called with target:', target);
    
    // For tag operation, just save the highlight and move to the next menu
    if (operation !== 'delete') {
      saveCurrentHighlight('rgb(255, 255, 97)');
      setTargets([target]);
      setMenu(3);
      console.log('Tag target selected, menu set to 3. Primers should be fetched now.');
      return;
    }
    
    // For delete operation, handle N and C terminal targets separately
    const { terminalType } = target;
    
    // Store the current selected targets
    const currentSelectedNTarget = selectedNTarget;
    const currentSelectedCTarget = selectedCTarget;
    
    console.log('Delete operation - Current selected targets:', { 
      N: currentSelectedNTarget ? currentSelectedNTarget.distal + currentSelectedNTarget.proximal : 'none',
      C: currentSelectedCTarget ? currentSelectedCTarget.distal + currentSelectedCTarget.proximal : 'none'
    });
    
    // Determine which targets will be selected after this operation
    let updatedNTarget = currentSelectedNTarget;
    let updatedCTarget = currentSelectedCTarget;
    
    if (terminalType === "N") {
      // Save the highlight for the N terminal target
      saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_N");
      
      // Update the N target
      updatedNTarget = target;
      
      // Update state
      setSelectedNTarget(target);
      
      console.log('N terminal target selected:', target.distal + target.proximal);
    } else if (terminalType === "C") {
      // Save the highlight for the C terminal target
      saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_C");
      
      // Update the C target
      updatedCTarget = target;
      
      // Update state
      setSelectedCTarget(target);
      
      console.log('C terminal target selected:', target.distal + target.proximal);
    }
    
    // Check if both targets are now selected
    if (updatedNTarget && updatedCTarget) {
      console.log('Both targets now selected, moving to homology arms menu');
      
      // Move to the next menu
      setMenu(3);
      
      // Dispatch a custom event to trigger primer fetching
      const customEvent = new CustomEvent('deleteTargetsSelected', {
        detail: {
          nTarget: updatedNTarget,
          cTarget: updatedCTarget
        }
      });
      document.dispatchEvent(customEvent);
    } else {
      console.log('Waiting for other target to be selected...');
      console.log('Current targets:', {
        N: updatedNTarget ? updatedNTarget.distal + updatedNTarget.proximal : 'none',
        C: updatedCTarget ? updatedCTarget.distal + updatedCTarget.proximal : 'none'
      });
    }
  }, [operation, selectedNTarget, selectedCTarget, targets, setMenu]);

  // Alias for pickCutSite to maintain backward compatibility
  const pickDeleteCutSite = useCallback((target, saveCurrentHighlight) => {
    // Just call pickCutSite with the same arguments
    pickCutSite(target, saveCurrentHighlight);
  }, [pickCutSite]);

  const mutatePamHandler = useCallback((e) => {
    e.preventDefault();
    const newPam = e.target.elements.newPam.value;
    
    setCurrentPam(newPam);
    setMenu(4);
    // setScreen(4); // This will be handled by UIContext
    setMutatePam(false);
  }, [setMenu]);

  return (
    <TargetContext.Provider
      value={{
        targets,
        setTargets,
        selectedNTarget,
        setSelectedNTarget,
        selectedCTarget,
        setSelectedCTarget,
        mutatePam,
        setMutatePam,
        currentPam,
        setCurrentPam,
        handleDeleteOperation,
        processDeleteTargetSearch,
        processTagTargetSearch,
        scrollToTerminal,
        pickCutSite,
        pickDeleteCutSite,
        mutatePamHandler
      }}
    >
      {children}
    </TargetContext.Provider>
  );
};

// Create a custom hook to use the context
export const useTarget = () => {
  const context = useContext(TargetContext);
  if (context === undefined) {
    throw new Error('useTarget must be used within a TargetProvider');
  }
  return context;
};
