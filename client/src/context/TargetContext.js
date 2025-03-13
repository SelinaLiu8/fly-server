import React, { createContext, useState, useContext, useCallback } from 'react';
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
  const [selectedNTarget, setSelectedNTarget] = useState(null);
  const [selectedCTarget, setSelectedCTarget] = useState(null);
  const [mutatePam, setMutatePam] = useState(false);
  const [currentPam, setCurrentPam] = useState(null);

  // Loading image
  const loading = require('../assets/loading.png');

  const handleDeleteOperation = useCallback((highlights, sequence) => {
    if (!highlights || !highlights.start || !highlights.stop) {
      console.error("Highlights not properly set for delete operation.");
      return;
    }
    
    const nLocation = highlights.start.location;
    const cLocation = highlights.stop.location;
    
    const nTargetGenes = sequence.substring(nLocation - 50, nLocation + 50);
    const cTargetGenes = sequence.substring(cLocation - 50, cLocation + 50);
    
    showPopup({
      message: (
        <div>
          <h2>Finding Potential Targets.<br /> This may take some time.</h2>
        </div>
      ),
      image: loading,
      stayOpen: true,
    });
    
    processDeleteTargetSearch(nTargetGenes, cTargetGenes);
  }, [showPopup, loading]);

  const processDeleteTargetSearch = useCallback(async (nGene, cGene) => {
    try {
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
      
      const updatedTargets = [
        ...nResponse.results.map((target) => ({
          ...target,
          score: nEfficiencyResponse[target.distal + target.proximal],
          terminalType: 'N',
        })),
        ...cResponse.results.map((target) => ({
          ...target,
          score: cEfficiencyResponse[target.distal + target.proximal],
          terminalType: 'C',
        })),
      ];
      
      showPopup({ show: false });
      setTargets(updatedTargets);
      setMenu(2);
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

  const pickCutSite = useCallback((target, saveCurrentHighlight) => {
    saveCurrentHighlight('rgb(255, 255, 97)');
    
    setTargets([target]);
    setMenu(3);
    // setScreen(3); // This will be handled by UIContext
  }, [setMenu]);

  const pickDeleteCutSite = useCallback((target, saveCurrentHighlight) => {
    const { terminalType } = target;
    
    if (terminalType === "N") {
      saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_N");
      setSelectedNTarget(target);
    } else if (terminalType === "C") {
      saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_C");
      setSelectedCTarget(target);
    }
    
    // Check if both targets are selected
    if (
      (terminalType === "N" && selectedCTarget) || 
      (terminalType === "C" && selectedNTarget)
    ) {
      const updatedNTarget = terminalType === "N" ? target : selectedNTarget;
      const updatedCTarget = terminalType === "C" ? target : selectedCTarget;
      
      setTargets([updatedNTarget, updatedCTarget]);
      setMenu(3);
      // setScreen(3); // This will be handled by UIContext
    }
  }, [selectedNTarget, selectedCTarget, setMenu]);

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
