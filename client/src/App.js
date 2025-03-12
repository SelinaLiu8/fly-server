import React, { useState, useEffect, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

// Styles
import './styles/App.css';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Screen components
import LandingScreen from './components/screens/LandingScreen';
import SearchScreen from './components/screens/SearchScreen';
import SequenceViewScreen from './components/screens/SequenceViewScreen';
import CustomDataScreen from './components/screens/CustomDataScreen';

// UI components
import Popup from './components/ui/Popup';
import FontSizeMenu from './components/ui/FontSizeMenu';

// Hooks and utilities
import useSequence from './hooks/useSequence';
import { reverseComplement } from './utils/sequenceUtils';
import * as api from './services/api';
import * as fileUtils from './utils/fileUtils';

// Assets
import loading from './assets/loading.png';

const App = () => {
  // State for UI
  const [menu, setMenu] = useState(null);
  const [screen, setScreen] = useState(1);
  const [hamburger, setHamburger] = useState(false);
  const [themeColor, setThemeColor] = useState(false);
  const [fontSize, setFontSize] = useState(23);
  const [fontMenu, setFontMenu] = useState(false);
  const [popup, setPopup] = useState({ show: false });
  const [plasmidTemplate, setPlasmidTemplate] = useState(null);

  // State for gene data
  const [geneName, setGeneName] = useState('');
  const [isoForm, setIsoForm] = useState('');
  const [isoForms, setIsoForms] = useState([]);
  const [isoFormStrand, setIsoFormStrand] = useState(null);
  const [operation, setOperation] = useState(null);
  const [terminal, setTerminal] = useState(null);
  const [targets, setTargets] = useState(null);
  const [selectedNTarget, setSelectedNTarget] = useState(null);
  const [selectedCTarget, setSelectedCTarget] = useState(null);
  const [primers, setPrimers] = useState(null);
  const [selectedArms, setSelectedArms] = useState({});
  const [selectedPrimer, setSelectedPrimer] = useState({});
  const [oligos, setOligos] = useState(null);
  const [currentPam, setCurrentPam] = useState(null);
  const [mutatePam, setMutatePam] = useState(false);

  // Use the sequence hook
  const {
    sequence,
    setSequence,
    highlights,
    setHighlights,
    currentHighlight,
    setCurrentHighlight,
    highlightString,
    clearHighlight,
    saveCurrentHighlight,
    changeCurrentHighlight
  } = useSequence();

  // UI handlers
  const changeMenus = useCallback((e) => {
    const menuValue = parseInt(e.target.dataset.menu);
    
    if (menuValue === 1) {
      window.location.reload();
      return;
    }
    
    setMenu(prevMenu => menuValue === prevMenu ? null : menuValue);
  }, []);

  const changeScreens = useCallback((e) => {
    const screenValue = e.target.dataset.screen;
    const screenInt = parseInt(screenValue) || screenValue;
    
    let newMenu = null;
    if (screenInt === 1) {
      newMenu = 1;
    }
    
    setScreen(screenInt);
    setHamburger(false);
    setMenu(newMenu);
    
    if (screenInt === 3) {
      setMutatePam(false);
    }
  }, []);

  const toggleHamburgerMenu = useCallback(() => {
    setHamburger(prev => !prev);
  }, []);

  const toggleThemeColor = useCallback(() => {
    setThemeColor(prev => !prev);
  }, []);

  const toggleFontMenu = useCallback(() => {
    setFontMenu(prev => !prev);
  }, []);

  const changeFontSize = useCallback((e) => {
    setFontSize(parseInt(e.target.value));
  }, []);

  const closePopup = useCallback(() => {
    setPopup({ show: false });
  }, []);

  // File operations
  const saveDesign = useCallback(() => {
    const design = JSON.stringify({
      geneName,
      isoForm,
      isoFormStrand,
      sequence,
      highlights,
      operation,
      terminal,
      targets,
      selectedNTarget,
      selectedCTarget,
      primers,
      selectedArms,
      oligos,
      currentPam
    });
    
    const filename = `${geneName}.txt`;
    const blob = new Blob([design], {
      type: "text/plain;charset=utf-8"
    });
    
    saveAs(blob, filename);
    setHamburger(false);
  }, [
    geneName, isoForm, isoFormStrand, sequence, highlights, 
    operation, terminal, targets, selectedNTarget, selectedCTarget, 
    primers, selectedArms, oligos, currentPam
  ]);

  const openDesign = useCallback((e) => {
    const reader = new FileReader();
    
    setPopup({
      show: true,
      message: <h2>Uploading File</h2>,
      image: loading,
      stayOpen: true,
    });
    
    reader.onloadend = (res) => {
      try {
        const newState = JSON.parse(res.target.result);
        
        // Update all the state values
        setGeneName(newState.geneName || '');
        setIsoForm(newState.isoForm || '');
        setIsoFormStrand(newState.isoFormStrand || null);
        setSequence(newState.sequence || '');
        setHighlights(newState.highlights || {});
        setOperation(newState.operation || null);
        setTerminal(newState.terminal || null);
        setTargets(newState.targets || null);
        setSelectedNTarget(newState.selectedNTarget || null);
        setSelectedCTarget(newState.selectedCTarget || null);
        setPrimers(newState.primers || null);
        setSelectedArms(newState.selectedArms || {});
        setOligos(newState.oligos || null);
        setCurrentPam(newState.currentPam || null);
        
        // Set UI state
        setScreen(newState.screen || 2);
        setMenu(newState.menu || 2);
        setPopup({ show: false });
        setHamburger(false);
      } catch (error) {
        console.error('Error parsing design file:', error);
        setPopup({
          show: true,
          message: <h2>Error loading file. Please try again.</h2>,
          stayOpen: false,
        });
      }
    };
    
    if (e.target.files && e.target.files.length > 0) {
      reader.readAsText(e.target.files[0]);
    }
  }, [setSequence, setHighlights]);

  // API handlers
  const searchForGene = useCallback(async (e) => {
    e.preventDefault();
    
    const geneName = e.target.elements.geneName.value;
    
    setPopup({
      show: true,
      message: <h2>Searching For Gene</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      const geneInfo = await api.searchForGene(geneName);
      
      if (!geneInfo) {
        setPopup({
          show: true,
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
        setPopup({
          show: true,
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
      
      const parsedIsoForms = JSON.parse(geneInfo.results.isoforms);
      
      if (parsedIsoForms.length) {
        setIsoForms(parsedIsoForms);
        setGeneName(geneInfo.results.name);
        setPopup({
          show: true,
          message: renderOperationForm(),
          image: null,
        });
        setScreen(1);
      }
    } catch (error) {
      console.error('Error searching for gene:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, []);

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
    return (
      <div className="isoform-form">
        <h2>Choose Your IsoForm</h2>
        <p className="warning-message">This step takes a few seconds, please only click the button once.</p>
        <form onSubmit={pickIsoForm}>
          <select name="isoform">
            {isoForms.map((isoForm) => (
              <option value={isoForm} key={isoForm}>
                {isoForm}
              </option>
            ))}
          </select>
          <input className="btn" type="submit" value="Search" />
        </form>
      </div>
    );
  }, [isoForms]);

  const pickDeleteOrTag = useCallback((e) => {
    e.preventDefault();
    const selectedOperation = e.target.elements.operation.value;
    
    setOperation(selectedOperation);
    
    setPopup({
      show: true,
      message: renderIsoForm(),
      image: null,
    });
  }, [renderIsoForm]);

  const createPopupForm = useCallback(() => {
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
  }, []);

  const makeIsoFormHighlights = useCallback(() => {
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
      setPopup({ show: false });
      
      // Proceed with delete operation
      handleDeleteOperation(newHighlights);
    } else {
      const popupForm = createPopupForm();
      setHighlights(newHighlights);
      setScreen(2);
      setPopup({
        show: true,
        message: popupForm,
        image: null,
        stayOpen: true,
      });
    }
  }, [sequence, operation, createPopupForm, setHighlights]);

  const pickIsoForm = useCallback(async (e) => {
    e.preventDefault();
    const selectedIsoForm = e.target.elements.isoform.value;
    
    if (selectedIsoForm === isoForm) {
      makeIsoFormHighlights();
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
      
      const popupForm = operation === 'delete'
        ? { show: false }
        : {
            show: true,
            message: createPopupForm(),
            image: null,
            stayOpen: true,
          };
      
      // Set state first, then handle delete
      setIsoForm(geneInfo.isoForm);
      setSequence(fullSequence);
      setIsoFormStrand(strand);
      setHighlights(newHighlights);
      setPopup(popupForm);
      setScreen(2);
      
      if (operation === 'delete') {
        handleDeleteOperation(newHighlights);
      }
    } catch (error) {
      console.error('Error fetching isoform:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while fetching the isoform. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [isoForm, makeIsoFormHighlights, operation, createPopupForm, setSequence, setHighlights]);

  const handleDeleteOperation = useCallback((currentHighlights) => {
    if (!currentHighlights || !currentHighlights.start || !currentHighlights.stop) {
      console.error("Highlights not properly set for delete operation.");
      return;
    }
    
    const nLocation = currentHighlights.start.location;
    const cLocation = currentHighlights.stop.location;
    
    const nTargetGenes = sequence.substring(nLocation - 50, nLocation + 50);
    const cTargetGenes = sequence.substring(cLocation - 50, cLocation + 50);
    
    setPopup({
      show: true,
      message: (
        <div>
          <h2>Finding Potential Targets.<br /> This may take some time.</h2>
        </div>
      ),
      image: loading,
      stayOpen: true,
    });
    
    processDeleteTargetSearch(nTargetGenes, cTargetGenes);
  }, [sequence]);

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
      
      setPopup({
        show: true,
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
      
      setPopup({ show: false });
      setTargets(updatedTargets);
      setMenu(2);
    } catch (error) {
      console.error('Error processing delete target search:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching for targets. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, []);

  const chooseTerminal = useCallback((e, terminalInput = null) => {
    e.preventDefault();
    
    const selectedTerminal = terminalInput || e.target.tag.value;
    const location = selectedTerminal === 'n' ? highlights.start.location : highlights.stop.location;
    
    const targetGenes = sequence.substring(location - 50, location + 50);
    
    setPopup({
      show: true,
      message: (
        <div>
          <h2>Finding Potential Targets.<br /> This may take some time.</h2>
        </div>
      ),
      image: loading,
      stayOpen: true,
    });
    
    setTerminal(selectedTerminal);
    
    processTagTargetSearch(targetGenes);
  }, [highlights, sequence]);

  const processTagTargetSearch = useCallback(async (targetGenes) => {
    try {
      const response = await api.searchForTargets(targetGenes);
      const efficiencyString = response.results.map((target) => target.distal + target.proximal);
      
      setPopup({
        show: true,
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
      
      setPopup({ show: false });
      setTargets(updatedTargets);
      setMenu(2);
      
      if (terminal === "n" || terminal === "c") {
        scrollToTerminal(terminal);
      }
    } catch (error) {
      console.error('Error processing tag target search:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while searching for targets. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [terminal]);

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

  const pickCutSite = useCallback((target) => {
    saveCurrentHighlight('rgb(255, 255, 97)');
    
    setTargets([target]);
    setMenu(3);
    setScreen(3);
    
    // to set the primers
    if (!primers || Object.keys(primers).length === 0) {
      getPrimers();
    }
  }, [primers, saveCurrentHighlight]);

  const pickDeleteCutSite = useCallback((target) => {
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
      setScreen(3);
      
      if (!primers || Object.keys(primers).length === 0) {
        getDeletePrimers();
      }
    }
  }, [selectedNTarget, selectedCTarget, saveCurrentHighlight]);

  const getPrimers = useCallback(async () => {
    const targetLocation = terminal === 'n' ? highlights.start.location : highlights.stop.location;
    
    setPopup({
      show: true,
      message: <h2>Retrieving Homology Arm Primers</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      const primerData = await api.getPrimers(targetLocation, sequence);
      
      setPrimers(primerData);
      setMenu(3);
      setPopup({ show: false });
      
      if (terminal === 'c') {
        const screen = document.getElementsByClassName('screen-3')[0];
        if (screen) {
          const scrollTop = screen.scrollHeight;
          screen.scrollTo({
            top: scrollTop - (window.innerHeight / 2),
            behavior: 'smooth'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching primers:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while retrieving primers. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [terminal, highlights, sequence]);

  const getDeletePrimers = useCallback(async () => {
    if (!highlights || !highlights.start || !highlights.stop) {
      console.error("Highlights not properly set for delete primers.");
      return;
    }
    
    setPopup({
      show: true,
      message: <h2>Retrieving Homology Arm Primers</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      const primerData = await api.getDeletePrimers(
        highlights.start.location,
        highlights.stop.location,
        sequence
      );
      
      setPrimers(primerData);
      setMenu(3);
      setPopup({ show: false });
    } catch (error) {
      console.error('Error fetching delete primers:', error);
      setPopup({
        show: true,
        message: (
          <div className="popup-error">
            <h2>An error occurred while retrieving primers. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [highlights, sequence]);

  const mutatePamHandler = useCallback((e) => {
    e.preventDefault();
    const newPam = e.target.elements.newPam.value;
    
    setCurrentPam(newPam);
    setMenu(4);
    setScreen(4);
    setMutatePam(false);
    
    if (!primers || Object.keys(primers).length === 0) {
      getPrimers();
    }
  }, [primers, getPrimers]);

  const selectHomologyArm = useCallback((selection, arm) => {
    const currentArms = { ...selectedArms };
    currentArms[arm] = selection;
    
    saveCurrentHighlight('rgba(86, 64, 155,0.3)', arm);
    
    setSelectedArms(currentArms);
    setCurrentHighlight(null);
    
    const totalSelected = Object.keys(currentArms);
    if (totalSelected.length === 4) {
      // GET OLIGO INFO
      setPopup({
        show: true,
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      fetchOligoInformation();
    }
  }, [selectedArms, saveCurrentHighlight]);

  const selectDeleteHomologyArm = useCallback((selection, arm, terminal) => {
    const currentArms = { ...selectedArms };
    const terminalKey = `${arm}_${terminal}`;
    currentArms[terminalKey] = selection;
    
    saveCurrentHighlight("rgba(86, 64, 155,0.3)", terminalKey);
    
    setSelectedArms(currentArms);
    setCurrentHighlight(null);
    
    const totalSelected = Object.keys(currentArms);
    if (totalSelected.length === 8) { // Expecting 4 arms × 2 terminals = 8
      fetchOligoInformation();
    }
  }, [selectedArms, saveCurrentHighlight]);

  const selectPrimer = useCallback((primer, arm) => {
    setSelectedPrimer(prev => ({
      ...prev,
      [arm]: primer,
    }));
  }, []);

  const fetchOligoInformation = useCallback(async () => {
    if (operation === "delete") {
      if (!selectedNTarget || !selectedCTarget) {
        console.error("Both selectedNTarget and selectedCTarget are required for fetching oligos.");
        return;
      }
      
      setPopup({
        show: true,
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      try {
        // Fetch oligos for N target
        const nOligos = await api.getOligos(
          selectedNTarget.distal + selectedNTarget.proximal + selectedNTarget.pam
        );
        
        // Fetch oligos for C target
        const cOligos = await api.getOligos(
          selectedCTarget.distal + selectedCTarget.proximal + selectedCTarget.pam
        );
        
        setOligos({
          N: nOligos,
          C: cOligos
        });
        setPopup({ show: false });
        setMenu(4);
      } catch (error) {
        console.error('Error fetching oligos:', error);
        setPopup({
          show: true,
          message: (
            <div className="popup-error">
              <h2>An error occurred while retrieving oligo information. Please try again later.</h2>
            </div>
          ),
          image: null,
        });
      }
    } else {
      if (!targets || targets.length === 0) {
        console.error("No targets available for fetching oligos.");
        return;
      }
      
      setPopup({
        show: true,
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      try {
        const oligoData = await api.getOligos(
          targets[0].distal + targets[0].proximal + targets[0].pam
        );
        
        if (!oligoData.sense) {
          setMenu(4);
          setPopup({ show: false });
          return;
        }
        
        setOligos(oligoData);
        setMenu(4);
        setPopup({ show: false });
      } catch (error) {
        console.error('Error fetching oligos:', error);
        setPopup({
          show: true,
          message: (
            <div className="popup-error">
              <h2>An error occurred while retrieving oligo information. Please try again later.</h2>
            </div>
          ),
          image: null,
        });
      }
    }
  }, [operation, selectedNTarget, selectedCTarget, targets]);

  // Custom data handling
  const addCustomData = useCallback((e) => {
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
      chooseTerminal({ preventDefault: () => {} }, geneTerminal);
    }
  }, [setSequence, setHighlights, chooseTerminal]);

  const selectStartCodon = useCallback((e) => {
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
  }, [highlights, setHighlights]);

  const selectStopCodon = useCallback((e) => {
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
  }, [highlights, setHighlights]);

  // Download handlers
  const viewFinishedDesign = useCallback(() => {
    if (!targets || targets.length === 0 || !selectedArms) {
      console.error("Missing required data for viewing design");
      return;
    }
    
    const targetKeys = Object.keys(targets[0]);
    const targetHTML = targetKeys.map((prop) => (
      <div key={prop}><b>{prop}:</b> {targets[0][prop]}</div>
    ));

    const primerKeys = Object.keys(selectedArms);
    
    const primerNameMap = {
      hom5: `${terminal.toUpperCase()} forward homology arm primer`,
      hom3: `${terminal.toUpperCase()} reverse homology arm primer`,
      seq5: `${terminal.toUpperCase()} forward sequencing primer`,
      seq3: `${terminal.toUpperCase()} reverse sequencing primer`,
    };

    const primerHTML = primerKeys.map((key) => {
      const primerSingle = selectedArms[key];
      
      // Extract base name (e.g., "hom5", "seq3") by removing terminal suffix
      const baseKey = key.replace(`_${terminal.toUpperCase()}`, "");

      return (
        <div key={key}>
          <div className=""><b>{primerNameMap[baseKey] || key}</b></div>
          <div className="">
            <div>{primerSingle[7]}</div>
            <div><div>Tm: {primerSingle[3]}</div></div>
            <div><div>GC%: {primerSingle[4]}</div></div>
            <div><div>Any (Self Complementarity): {primerSingle[5]}</div></div>
            <div><div>3' (Self Complementarity): {primerSingle[6]}</div></div>
          </div>
          <br/>
        </div>
      );
    });

    const handlePrint = () => {
      const printContents = document.getElementById("printableArea").innerHTML;
      const printWindow = window.open('', '_blank');

      // Write the printable content to the new tab
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              /* Add any styling here to ensure it looks correct when printed */
              body {
                font-family: sans-serif;
                margin: 20px;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
  
      // Close the document to finish loading content in the new tab
      printWindow.document.close();
  
      // Wait for the new window to finish loading, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();  // Automatically close the tab after printing
      };
    };

    const message = (
      <div id='printableArea'>
        <h2>Design Info</h2>
        <div><h3>Target Info</h3>{targetHTML}</div>
        <div>
          <h3>Homology Info</h3>
          {primerHTML}
        </div>
        <div>
          <h3>Oligo Info</h3>
          <div><b>Sense: </b>{oligos.sense}</div>
          <div><b>Antisense: </b>{oligos.antisense}</div>
        </div>
        <button onClick={handlePrint}>Print</button>
      </div>
    );

    setPopup({
      show: true,
      message: message,
      image: null,
      stayOpen: false,
    });
  }, [targets, selectedArms, terminal, oligos]);

  const viewDeleteFinishedDesign = useCallback(() => {
    if (!targets || targets.length === 0 || !selectedArms || !selectedNTarget || !selectedCTarget) {
      console.error("Missing required data for viewing delete design");
      return;
    }
    
    const targetKeys = Object.keys(targets[0]).filter(
      (key) => !["terminalType", "distal", "proximal", "pam"].includes(key)
    );
    
    const targetHTML = targetKeys.map((prop) => (
      <div key={`target-${prop}`}><b>{prop}:</b> {targets[0][prop]}</div>
    ));

    const generatePrimerHTML = (terminalType, primers) => {
      const primerKeys = Object.keys(primers)
        .filter(key => key.endsWith(`_${terminalType}`));
      
      const primerNameMap = {
        hom5: `${terminalType} forward homology arm primer`,
        hom3: `${terminalType} reverse homology arm primer`,
        seq5: `${terminalType} forward sequencing primer`,
        seq3: `${terminalType} reverse sequencing primer`,
      };
      
      return primerKeys.map((key) => {
        const primerSingle = selectedArms[key];
        
        // Extract base name (e.g., "hom5", "seq3")
        const baseKey = key.replace(`_${terminalType}`, "");
        
        return (
          <div key={`${terminalType}-${key}`}>
            <div><b>{primerNameMap[baseKey] || key}</b></div>
            <div>
              <div>{primerSingle[7]}</div>
              <div><div>Tm: {primerSingle[3]}</div></div>
              <div><div>GC%: {primerSingle[4]}</div></div>
              <div><div>Any (Self Complementarity): {primerSingle[5]}</div></div>
              <div><div>3' (Self Complementarity): {primerSingle[6]}</div></div>
            </div><br />
          </div>
        );
      });
    };
    
    // Generate HTML for N-terminal and C-terminal primers
    const NprimerHTML = generatePrimerHTML('N', selectedArms);
    const CprimerHTML = generatePrimerHTML('C', selectedArms);
    
    const cutSitesHTML = (
      <div>
        <div>
          <h4>N Terminal</h4>
          <div><b>Distal:</b> {selectedNTarget.distal || "Not Available"}</div>
          <div><b>Proximal:</b> {selectedNTarget.proximal || "Not Available"}</div>
          <div><b>PAM:</b> {selectedNTarget.pam || "Not Available"}</div>
        </div>
        <div>
          <h4>C Terminal</h4>
          <div><b>Distal:</b> {selectedCTarget.distal || "Not Available"}</div>
          <div><b>Proximal:</b> {selectedCTarget.proximal || "Not Available"}</div>
          <div><b>PAM:</b> {selectedCTarget.pam || "Not Available"}</div>
        </div>
      </div>
    );

    const handlePrint = () => {
      const printContents = document.getElementById("printableArea").innerHTML;
      const printWindow = window.open('', '_blank');

      // Write the printable content to the new tab
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              /* Add any styling here to ensure it looks correct when printed */
              body {
                font-family: sans-serif;
                margin: 20px;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
  
      // Close the document to finish loading content in the new tab
      printWindow.document.close();
  
      // Wait for the new window to finish loading, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();  // Automatically close the tab after printing
      };
    };

    const message = (
      <div id='printableArea'>
        <h2>Design Info</h2>
        <div><h3>Target Info</h3>
          {targetHTML}
        </div>
        <div>
          <h3>Cut Sites</h3>
          {cutSitesHTML}
        </div>
        <div>
          <h3>Homology Info</h3>
          <div>
            <h4>N-Terminal Primers</h4>
            {NprimerHTML}
          </div>
          <div>
            <h4>C-Terminal Primers</h4>
            {CprimerHTML}
          </div>
        </div>
        <div>
          <h3>Oligo Info</h3>
          <div>
            <h4>N Terminal</h4>
            <div><b>Sense: </b>{oligos.N.sense}</div>
            <div><b>Antisense: </b>{oligos.N.antisense}</div>
          </div>
          <div>
            <h4>C Terminal</h4>
            <div><b>Sense: </b>{oligos.C.sense}</div>
            <div><b>Antisense: </b>{oligos.C.antisense}</div>
          </div>
        </div>
        <button onClick={handlePrint}>Print</button>
      </div>
    );

    setPopup({
      show: true,
      message: message,
      image: null,
      stayOpen: false,
    });
  }, [targets, selectedArms, selectedNTarget, selectedCTarget, oligos]);

  const changePlasmidTemplate = useCallback((e) => {
    setPlasmidTemplate(e.target.value);
  }, []);

  const downloadApeFile = useCallback(() => {
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
  }, [geneName, sequence, highlights, targets, currentPam, isoFormStrand]);

  const downloadDeleteApeFile = useCallback(() => {
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
  }, [geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam]);

  const downloadGuideRna = useCallback(() => {
    if (!geneName || !oligos) {
      console.error("Missing required data for downloading guide RNA");
      return;
    }
    
    fileUtils.downloadGuideRna(geneName, oligos);
  }, [geneName, oligos]);

  const downloadDeleteGuideRna = useCallback(() => {
    if (!geneName || !oligos || !oligos.N || !oligos.C) {
      console.error("Missing required data for downloading delete guide RNA");
      return;
    }
    
    fileUtils.downloadDeleteGuideRna(geneName, oligos);
  }, [geneName, oligos]);

  const downloadPlasmidTemplate = useCallback(() => {
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
  }, [plasmidTemplate, geneName, sequence, targets, highlights, terminal, currentPam]);

  const downloadDeletePlasmidTemplate = useCallback(() => {
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
  }, [plasmidTemplate, geneName, sequence, highlights]);

  return (
    <div className={`App ${themeColor ? 'dark' : 'light'}`}>
      <Header
        themeColor={themeColor}
        onThemeChange={toggleThemeColor}
        onScreenChange={changeScreens}
        onOpenDesign={openDesign}
        onSaveDesign={saveDesign}
        onFontMenuToggle={toggleFontMenu}
        hamburger={hamburger}
        toggleHamburgerMenu={toggleHamburgerMenu}
      />
      
      <div className={`body ${themeColor ? 'dark' : 'light'}`}>
        <Sidebar
          activeMenu={menu}
          screen={screen}
          onMenuChange={changeMenus}
          onScreenChange={changeScreens}
          targets={targets}
          currentHighlightLocation={currentHighlight ? currentHighlight.location : null}
          onPickCutSite={pickCutSite}
          onPickDeleteCutSite={pickDeleteCutSite}
          onHighlightString={highlightString}
          onClearHighlight={clearHighlight}
          operation={operation}
          primers={primers}
          terminal={terminal}
          selectedArms={selectedArms}
          onSelectHomologyArm={selectHomologyArm}
          onSelectDeleteHomologyArm={selectDeleteHomologyArm}
          selectedPrimer={selectedPrimer}
          onSelectPrimer={selectPrimer}
          geneName={geneName}
          oligos={oligos}
          onViewFinishedDesign={viewFinishedDesign}
          onViewDeleteFinishedDesign={viewDeleteFinishedDesign}
          onDownloadApeFile={downloadApeFile}
          onDownloadDeleteApeFile={downloadDeleteApeFile}
          onDownloadGuideRna={downloadGuideRna}
          onDownloadDeleteGuideRna={downloadDeleteGuideRna}
          onChangePlasmidTemplate={changePlasmidTemplate}
          onDownloadPlasmidTemplate={downloadPlasmidTemplate}
          onDownloadDeletePlasmidTemplate={downloadDeletePlasmidTemplate}
        />
        
        <div className={`main ${themeColor ? 'dark' : 'light'}`}>
          {screen === 0 && (
            <LandingScreen onScreenChange={changeScreens} />
          )}
          
          {screen === 1 && (
            <SearchScreen onSearchForGene={searchForGene} />
          )}
          
          {screen === 'custom' && (
            <CustomDataScreen onAddCustomData={addCustomData} />
          )}
          
          
          <SequenceViewScreen
            screen={screen}
            geneName={geneName}
            isoForm={isoForm}
            isoFormStrand={isoFormStrand}
            sequence={sequence}
            highlights={highlights}
            currentHighlight={currentHighlight}
            fontSize={fontSize}
            onSelectStartCodon={selectStartCodon}
            onSelectStopCodon={selectStopCodon}
          />
        </div>
      </div>
      
      <Footer />
      
      <FontSizeMenu
        isOpen={fontMenu}
        fontSize={fontSize}
        onFontSizeChange={changeFontSize}
        onClose={toggleFontMenu}
      />
      
      <Popup
        popup={popup}
        onClose={closePopup}
      />
    </div>
  );
};

export default App;
