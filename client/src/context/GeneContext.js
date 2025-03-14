import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as api from '../services/api';
import { useUI } from './UIContext';

// Create the context
const GeneContext = createContext();

// Create a provider component
export const GeneProvider = ({ children }) => {
  const { showPopup, setScreen, setMenu } = useUI();
  
  // State for gene data
  const [geneName, setGeneName] = useState('');
  const [isoForm, setIsoForm] = useState('');
  const [isoForms, setIsoForms] = useState([]);
  const [isoFormStrand, setIsoFormStrand] = useState(null);
  const [operation, setOperation] = useState(null);
  const [terminal, setTerminal] = useState(null);
  const [plasmidTemplate, setPlasmidTemplate] = useState(null);

  // Loading image
  const loading = require('../assets/loading.png');

  // File operations
  const saveDesign = useCallback((designData) => {
    const design = JSON.stringify(designData);
    
    const filename = `${geneName}.txt`;
    const blob = new Blob([design], {
      type: "text/plain;charset=utf-8"
    });
    
    saveAs(blob, filename);
  }, [geneName]);

  const openDesign = useCallback((e, setStateCallback) => {
    const reader = new FileReader();
    
    showPopup({
      message: <h2>Uploading File</h2>,
      image: loading,
      stayOpen: true,
    });
    
    reader.onloadend = (res) => {
      try {
        const newState = JSON.parse(res.target.result);
        
        // Call the callback with the loaded state
        setStateCallback(newState);
        
      } catch (error) {
        console.error('Error parsing design file:', error);
        showPopup({
          message: <h2>Error loading file. Please try again.</h2>,
          stayOpen: false,
        });
      }
    };
    
    if (e.target.files && e.target.files.length > 0) {
      reader.readAsText(e.target.files[0]);
    }
  }, [showPopup, loading]);

  // API handlers
  const searchForGene = useCallback(async (e) => {
    e.preventDefault();
    
    const geneNameInput = e.target.elements.geneName.value;
    
    showPopup({
      message: <h2>Searching For Gene</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      const geneInfo = await api.searchForGene(geneNameInput);
      
      if (!geneInfo) {
        showPopup({
          message: (
            <div className="popup-error">
              <h2>We're experiencing technical issues. Please try again later.</h2>
            </div>
          ),
          image: null,
        });
        setScreen(1);
        return;
      }
      
      if (!geneInfo.results.isoforms) {
        showPopup({
          message: (
            <div className="popup-error">
              <h2>We could not find any results. Please try again with the Fly Base ID or a different search term.</h2>
            </div>
          ),
          image: null,
        });
        setScreen(1);
        return;
      }
      
      console.log("Isoforms from API:", geneInfo.results.isoforms);
      
      // Check if isoforms is already an array or a JSON string
      let parsedIsoForms;
      try {
        parsedIsoForms = typeof geneInfo.results.isoforms === 'string' 
          ? JSON.parse(geneInfo.results.isoforms) 
          : geneInfo.results.isoforms;
      } catch (error) {
        console.error("Error parsing isoforms:", error);
        parsedIsoForms = [];
      }
      
      console.log("Parsed isoforms:", parsedIsoForms);
      
      if (parsedIsoForms && parsedIsoForms.length) {
        setIsoForms(parsedIsoForms);
        setGeneName(geneInfo.results.name);
        showPopup({
          message: renderOperationForm(),
          image: null,
        });
        setScreen(1);
      }
    } catch (error) {
      console.error('Error searching for gene:', error);
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [showPopup, setScreen, loading]);

  const renderOperationForm = useCallback(() => {
    return (
      <div className="isoform-form">
        <h2>Choose Your Operation</h2>
        <form onSubmit={pickDeleteOrTag}>
          <select name="operation">
            <option value="tag">Tag</option>
            <option value="delete">Delete</option>
          </select>
          <input className="btn" type="submit" value="Proceed" />
        </form>
      </div>
    );
  }, []);

  const renderIsoForm = useCallback(() => {
    console.log("Rendering isoform selection with isoForms:", isoForms);
    
    return (
      <div className="isoform-form">
        <h2>Choose Your IsoForm</h2>
        <p className="warning-message">This step takes a few seconds, please only click the button once.</p>
        <form onSubmit={pickIsoForm}>
          <select name="isoform">
            {Array.isArray(isoForms) && isoForms.length > 0 ? (
              isoForms.map((isoForm) => (
                <option value={isoForm} key={isoForm}>
                  {isoForm}
                </option>
              ))
            ) : (
              <option value="">No isoforms available</option>
            )}
          </select>
          <input className="btn" type="submit" value="Search" />
        </form>
      </div>
    );
  }, [isoForms]);

  const pickDeleteOrTag = useCallback((e) => {
    e.preventDefault();
    const selectedOperation = e.target.elements.operation.value;
    
    console.log("Operation selected:", selectedOperation);
    
    // Set the operation state
    setOperation(selectedOperation);
    
    // Show isoform selection popup
    showPopup({
      message: renderIsoForm(),
      image: null,
      stayOpen: true,
    });
  }, [renderIsoForm, showPopup]);
  
  // Update popup content when isoForms changes and we're in the middle of the operation flow
  useEffect(() => {
    if (operation && isoForms.length > 0) {
      console.log("Updating popup with latest isoform selection");
      showPopup({
        message: renderIsoForm(),
        image: null,
        stayOpen: true,
      });
    }
  }, [isoForms, operation, renderIsoForm, showPopup]);

  const createPopupForm = useCallback(() => {
    // This form should only be shown for tag operations, not delete operations
    if (operation === 'delete') {
      console.warn("createPopupForm called for delete operation, which should not happen");
      return null;
    }
    
    return (
      <div className="isoform-form">
        <h2>Choose Your Tag</h2>
        <form onSubmit={chooseTerminal}>
          <select name="tag">
            <option value="n">N Terminal</option>
            <option value="c">C Terminal</option>
          </select>
          <input className="btn" type="submit" value="Search" />
        </form>
      </div>
    );
  }, [operation]);

  const pickIsoForm = useCallback(async (e) => {
    e.preventDefault();
    const selectedIsoForm = e.target.elements.isoform.value;
    
    if (selectedIsoForm === isoForm) {
      // We can't call makeIsoFormHighlights here since we don't have setHighlights and handleDeleteOperation
      // This case should be handled differently or these functions should be accessed from context
      return;
    }
    
    try {
      const geneInfo = await api.getIsoform(selectedIsoForm);
      
      const strand = geneInfo.strand;
      const startIndex = 2000;
      const stopIndex = geneInfo.sequence.length + 2000 - 3;
      
      const newHighlights = {
        start: {
          location: startIndex,
          length: 3,
          color: '#93E593',
        },
        stop: {
          location: stopIndex,
          length: 3,
          color: '#FF668E',
        },
      };
      
      const fullSequence = geneInfo.upstream + geneInfo.sequence + geneInfo.downstream;
      
      // Set state
      setIsoForm(geneInfo.isoForm);
      setIsoFormStrand(strand);
      setScreen(2);
      
      // For delete operation, don't show terminal selection popup
      if (operation === 'delete') {
        showPopup({
          message: (
            <div>
              <h2>Finding Potential Targets.<br /> This may take some time.</h2>
            </div>
          ),
          image: loading,
          stayOpen: true,
        });
      } else {
        // For tag operation, show terminal selection popup
        showPopup({
          message: createPopupForm(),
          image: null,
          stayOpen: true,
        });
      }
      
      // Emit a custom event with the data that other components can listen for
      const customEvent = new CustomEvent('isoformSelected', {
        detail: {
          sequence: fullSequence,
          highlights: newHighlights,
          operation: operation,
          isDelete: operation === 'delete'
        }
      });
      document.dispatchEvent(customEvent);
    } catch (error) {
      console.error('Error fetching isoform:', error);
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while fetching the isoform. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [isoForm, operation, createPopupForm, showPopup, setScreen, loading]);

  const makeIsoFormHighlights = useCallback((sequence, setHighlights, handleDeleteOperation) => {
    const startSequence = sequence.substr(0, 9);
    const stopSequence = sequence.substr(sequence.length - 10, 10);
    
    const startIndex = sequence.indexOf(startSequence);
    const stopIndex = sequence.indexOf(stopSequence) + 7;
    
    const newHighlights = {
      start: {
        location: startIndex,
        length: 3,
        color: '#93E593',
      },
      stop: {
        location: stopIndex,
        length: 3,
        color: '#FF668E',
      },
    };
    
    if (operation === 'delete') {
      // Skip terminal selection for delete operation
      setHighlights(newHighlights);
      setScreen(2);
      showPopup({ show: false });
      
      // Proceed with delete operation
      handleDeleteOperation(newHighlights);
    } else {
      const popupForm = createPopupForm();
      setHighlights(newHighlights);
      setScreen(2);
      showPopup({
        message: popupForm,
        image: null,
        stayOpen: true,
      });
    }
  }, [operation, createPopupForm, showPopup, setScreen]);

  const chooseTerminal = useCallback((e, terminalInput = null) => {
    e.preventDefault();
    
    const selectedTerminal = terminalInput || e.target.tag.value;
    setTerminal(selectedTerminal);
    
    // Show loading popup
    showPopup({
      message: (
        <div>
          <h2>Finding Potential Targets.<br /> This may take some time.</h2>
        </div>
      ),
      image: loading,
      stayOpen: true,
    });
    
    // Emit a custom event to trigger target search
    const customEvent = new CustomEvent('terminalSelected', {
      detail: {
        terminal: selectedTerminal,
        operation: operation
      }
    });
    document.dispatchEvent(customEvent);
  }, [operation, showPopup, loading]);

  // Add custom data handling
  const addCustomData = useCallback((e, setSequence, setHighlights, chooseTerminalCallback) => {
    e.preventDefault();
    
    const name = e.target.elements.geneName.value;
    const customIsoForm = e.target.elements.geneIsoform.value;
    const geneData = e.target.elements.geneData.value.replace(" ", "").replace(/[\W_]+/g, "").toUpperCase();
    const geneTerminal = e.target.elements.geneTerminal.value;
    
    let newHighlights = {};
    
    if (e.target.elements.startCodon.value && e.target.elements.startCodon.value !== '') {
      newHighlights['start'] = {
        location: parseInt(e.target.elements.startCodon.value),
        length: 3,
        color: '#93E593',
      };
    } else {
      // Find potential start codons
      let potentialStarts = [];
      let startIndexOccurence = geneData.indexOf('ATG', 0);
      
      while (startIndexOccurence >= 0) {
        potentialStarts.push(startIndexOccurence);
        startIndexOccurence = geneData.indexOf('ATG', startIndexOccurence + 1);
      }
      
      potentialStarts.forEach((location, i) => {
        newHighlights[`potentialStart-${i}`] = {
          location,
          length: 3,
          color: '#93E593',
        };
      });
    }
    
    if (e.target.elements.stopCodon.value && e.target.elements.stopCodon.value !== '') {
      newHighlights['stop'] = {
        location: parseInt(e.target.elements.stopCodon.value),
        length: 3,
        color: '#FF668E',
      };
    } else {
      // Find potential stop codons
      const stopCodons = ['TAG', 'TAA', 'TGA'];
      let potentialStops = [];
      
      stopCodons.forEach(codon => {
        let stopIndex = geneData.indexOf(codon, 0);
        while (stopIndex >= 0) {
          potentialStops.push(stopIndex);
          stopIndex = geneData.indexOf(codon, stopIndex + 1);
        }
      });
      
      potentialStops.forEach((location, i) => {
        newHighlights[`potentialStop-${i}`] = {
          location,
          length: 3,
          color: '#FF668E',
        };
      });
    }
    
    let newScreen = 'custom-2';
    let newMenu = null;
    
    if (
      (e.target.elements.startCodon.value && e.target.elements.startCodon.value !== '') &&
      (e.target.elements.stopCodon.value && e.target.elements.stopCodon.value !== '')
    ) {
      newScreen = 3;
      newMenu = 3;
    }
    
    setGeneName(name);
    setIsoForm(customIsoForm);
    setSequence(geneData);
    setTerminal(geneTerminal);
    setScreen(newScreen);
    setHighlights(newHighlights);
    
    // If we have start and stop codons, proceed to terminal selection
    if (newScreen === 3) {
      chooseTerminalCallback({ preventDefault: () => {} }, geneTerminal);
    }
  }, [setScreen]);

  const selectStartCodon = useCallback((e, highlights, setHighlights) => {
    e.preventDefault();
    
    const location = e.target.getAttribute('data-highlight-location');
    const highlightKeys = Object.keys(highlights);
    
    let newHighlights = {
      start: {
        location: parseInt(location),
        length: 3,
        color: '#93E593',
      }
    };
    
    // Keep stop codon if it exists, otherwise keep potential stop codons
    if (!highlights.stop) {
      highlightKeys.forEach(key => {
        if (key.includes('potentialStop')) {
          newHighlights[key] = highlights[key];
        }
      });
    } else {
      newHighlights['stop'] = highlights.stop;
    }
    
    setHighlights(newHighlights);
  }, []);

  const selectStopCodon = useCallback((e, highlights, setHighlights) => {
    e.preventDefault();
    
    const location = e.target.getAttribute('data-highlight-location');
    const highlightKeys = Object.keys(highlights);
    
    let newHighlights = {
      stop: {
        location: parseInt(location),
        length: 3,
        color: '#FF668E',
      }
    };
    
    // Keep start codon if it exists, otherwise keep potential start codons
    if (!highlights.start) {
      highlightKeys.forEach(key => {
        if (key.includes('potentialStart')) {
          newHighlights[key] = highlights[key];
        }
      });
    } else {
      newHighlights['start'] = highlights.start;
    }
    
    setHighlights(newHighlights);
  }, []);

  const changePlasmidTemplate = useCallback((e) => {
    setPlasmidTemplate(e.target.value);
  }, []);

  return (
    <GeneContext.Provider
      value={{
        geneName,
        setGeneName,
        isoForm,
        setIsoForm,
        isoForms,
        setIsoForms,
        isoFormStrand,
        setIsoFormStrand,
        operation,
        setOperation,
        terminal,
        setTerminal,
        plasmidTemplate,
        setPlasmidTemplate,
        saveDesign,
        openDesign,
        searchForGene,
        renderOperationForm,
        renderIsoForm,
        pickDeleteOrTag,
        createPopupForm,
        pickIsoForm,
        makeIsoFormHighlights,
        chooseTerminal,
        addCustomData,
        selectStartCodon,
        selectStopCodon,
        changePlasmidTemplate
      }}
    >
      {children}
    </GeneContext.Provider>
  );
};

// Create a custom hook to use the context
export const useGene = () => {
  const context = useContext(GeneContext);
  if (context === undefined) {
    throw new Error('useGene must be used within a GeneProvider');
  }
  return context;
};
