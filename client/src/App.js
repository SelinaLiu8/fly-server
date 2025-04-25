import React, { useEffect } from 'react';

// Styles
import './styles/App.css';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SidebarContent from './components/layout/SidebarContent';
import Footer from './components/layout/Footer';

// Screen components
import LandingScreen from './components/screens/LandingScreen';
import SearchScreen from './components/screens/SearchScreen';
import SequenceViewScreen from './components/screens/SequenceViewScreen';
import CustomDataScreen from './components/screens/CustomDataScreen';

// UI components
import Popup from './components/ui/Popup';
import FontSizeMenu from './components/ui/FontSizeMenu';

// Context hooks
import { useUI } from './context/UIContext';
import { useGene } from './context/GeneContext';
import { useTarget } from './context/TargetContext';
import { usePrimer } from './context/PrimerContext';
import { useFile } from './context/FileContext';
import useSequence from './hooks/useSequence';

// Assets
import loading from './assets/loading.png';

const App = () => {
  // Get state and handlers from context hooks
  const {
    menu,
    screen,
    hamburger,
    themeColor,
    fontSize,
    fontMenu,
    popup,
    changeMenus,
    changeScreens,
    toggleHamburgerMenu,
    toggleThemeColor,
    toggleFontMenu,
    changeFontSize,
    closePopup,
    showPopup,
    setScreen,
    setMenu
  } = useUI();

  const {
    geneName,
    isoForm,
    isoFormStrand,
    operation,
    terminal,
    plasmidTemplate,
    saveDesign,
    openDesign,
    searchForGene,
    chooseTerminal,
    addCustomData,
    selectStartCodon,
    selectStopCodon,
    changePlasmidTemplate
  } = useGene();

  const {
    targets,
    selectedNTarget,
    selectedCTarget,
    currentPam,
    handleDeleteOperation,
    pickTagCutSite,
    pickDeleteCutSite,
  } = useTarget();

  const {
    primers,
    selectedArms,
    selectedPrimer,
    oligos,
    selectHomologyArm,
    selectDeleteHomologyArm,
    selectPrimer,
    viewFinishedDesign,
    viewDeleteFinishedDesign
  } = usePrimer();

  const {
    downloadApeFile,
    downloadDeleteApeFile,
    downloadGuideRna,
    downloadDeleteGuideRna,
    downloadPlasmidTemplate,
    downloadDeletePlasmidTemplate
  } = useFile();

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

  // Import getPrimers and getDeletePrimers from PrimerContext
  const { getPrimers, getDeletePrimers } = usePrimer();
  
  // Import processTagTargetSearch from TargetContext
  const { processTagTargetSearch } = useTarget();

  // Create a design object for saving
  const designData = {
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
  };

  // Handle saving design with the complete design data
  const handleSaveDesign = () => {
    saveDesign(designData);
    toggleHamburgerMenu();
  };

  // Handle opening design with a callback to update all state
  const handleOpenDesign = (e) => {
    openDesign(e, (newState) => {
      // This callback will be called with the loaded state
      // We would need to update all the relevant state here
      // For now, we'll just log it
      console.log("Design loaded:", newState);
      
      // Set UI state
      setScreen(newState.screen || 2);
      setMenu(newState.menu || 2);
    });
  };
  
  // Listen for the isoformSelected custom event
  useEffect(() => {
    const handleIsoformSelected = (event) => {
      const { sequence, highlights, operation, isDelete } = event.detail;
      
      // Update sequence and highlights
      setSequence(sequence);
      setHighlights(highlights);
      
      // If this is a delete operation, call handleDeleteOperation
      if (isDelete) {
        console.log('Delete operation detected in isoformSelected event');
        
        // Small delay to ensure UI updates before heavy processing
        setTimeout(() => {
          console.log('Calling handleDeleteOperation with highlights:', highlights);
          handleDeleteOperation(highlights, sequence);
        }, 100);
      }
    };
    
    // Add event listener
    document.addEventListener('isoformSelected', handleIsoformSelected);
    
    // Clean up
    return () => {
      document.removeEventListener('isoformSelected', handleIsoformSelected);
    };
  }, [setSequence, setHighlights, handleDeleteOperation, showPopup, loading]);

  // Listen for the deleteTargetsSelected custom event
  useEffect(() => {
    const handleDeleteTargetsSelected = (event) => {
      const { nTarget, cTarget } = event.detail;
      
      console.log("Delete targets automatically selected:", { nTarget, cTarget });
      
      // Make sure highlights has start and stop locations
      if (!highlights || !highlights.start || !highlights.stop) {
        console.error('Missing start or stop highlights for delete primers');
        return;
      }
      
      // Log the highlights to help with debugging
      console.log('Fetching delete primers with highlights:', highlights);
      
      // Fetch delete primers
      getDeletePrimers(highlights, sequence);
    };
    
    // Add event listener
    document.addEventListener('deleteTargetsSelected', handleDeleteTargetsSelected);
    
    // Clean up
    return () => {
      document.removeEventListener('deleteTargetsSelected', handleDeleteTargetsSelected);
    };
  }, [highlights, sequence, getDeletePrimers]);

  // Listen for the terminalSelected custom event
  useEffect(() => {
    const handleTerminalSelected = (event) => {
      const { terminal, operation: eventOperation } = event.detail;
      
      console.log("Terminal selected:", terminal, "Operation:", eventOperation);
      
      // Skip processing for delete operations since they're handled by the isoformSelected event
      if (eventOperation === 'delete') {
        console.log("Skipping terminal selection processing for delete operation");
        return;
      }
      
      // Get the current sequence and highlights from state
      if (sequence && highlights) {
        // Extract the target genes around the start and stop codons
        const startLocation = highlights.start.location;
        const targetGenes = sequence.substring(startLocation - 50, startLocation + 50);
        
        // Small delay to ensure UI updates before heavy processing
        setTimeout(() => {
          // Process tag target search
          processTagTargetSearch(targetGenes);
        }, 100);
      } else {
        console.error("Sequence or highlights not available for terminal selection");
        showPopup({
          message: (
            <div className="popup-error">
              <h2>An error occurred while processing. Please try again.</h2>
            </div>
          ),
          image: null,
        });
      }
    };
    
    // Add event listener
    document.addEventListener('terminalSelected', handleTerminalSelected);
    
    // Clean up
    return () => {
      document.removeEventListener('terminalSelected', handleTerminalSelected);
    };
  }, [sequence, highlights, showPopup, processTagTargetSearch]);

  // Handle view finished design based on operation
  const handleViewFinishedDesign = () => {
    // Add detailed console logs to identify what's happening
    console.log("handleViewFinishedDesign DETAILED DEBUG:", {
      operation: operation,
      targets: targets,
      targetsLength: targets ? targets.length : 0,
      selectedArms: selectedArms,
      selectedArmsKeys: selectedArms ? Object.keys(selectedArms) : [],
      selectedNTarget: selectedNTarget,
      selectedCTarget: selectedCTarget,
      terminal: terminal,
      oligos: oligos
    });
    
    if (operation === 'delete') {
      console.log("Calling viewDeleteFinishedDesign with:", {
        targetsLength: targets ? targets.length : 0,
        selectedArmsCount: selectedArms ? Object.keys(selectedArms).length : 0,
        hasSelectedNTarget: !!selectedNTarget,
        hasSelectedCTarget: !!selectedCTarget,
        hasOligos: !!oligos
      });
      
      // Make sure we're passing all the required parameters
      if (!targets || targets.length === 0) {
        console.error("Missing targets for viewDeleteFinishedDesign");
      }
      if (!selectedArms || Object.keys(selectedArms).length === 0) {
        console.error("Missing selectedArms for viewDeleteFinishedDesign");
      }
      if (!selectedNTarget) {
        console.error("Missing selectedNTarget for viewDeleteFinishedDesign");
      }
      if (!selectedCTarget) {
        console.error("Missing selectedCTarget for viewDeleteFinishedDesign");
      }
      
      viewDeleteFinishedDesign(targets, selectedArms, selectedNTarget, selectedCTarget, oligos);
    } else {
      console.log("Calling viewFinishedDesign with:", {
        targetsLength: targets ? targets.length : 0,
        selectedArmsCount: selectedArms ? Object.keys(selectedArms).length : 0,
        terminal: terminal,
        hasOligos: !!oligos
      });
      viewFinishedDesign(targets, selectedArms, terminal, oligos);
    }
  };

  // Handle download APE file based on operation
  const handleDownloadApeFile = () => {
    // Add detailed console logs to identify what's happening
    console.log("handleDownloadApeFile DETAILED DEBUG:", {
      operation: operation,
      geneName: geneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : [],
      targets: targets,
      targetsLength: targets ? targets.length : 0,
      selectedNTarget: selectedNTarget,
      selectedCTarget: selectedCTarget,
      currentPam: currentPam,
      isoFormStrand: isoFormStrand
    });
    
    if (operation === 'delete') {
      console.log("Calling downloadDeleteApeFile with:", {
        geneName: geneName,
        sequenceLength: sequence ? sequence.length : 0,
        highlightsKeys: highlights ? Object.keys(highlights) : [],
        hasSelectedNTarget: !!selectedNTarget,
        hasSelectedCTarget: !!selectedCTarget,
        currentPam: currentPam
      });
      downloadDeleteApeFile(geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam);
    } else {
      console.log("Calling downloadApeFile with:", {
        geneName: geneName,
        sequenceLength: sequence ? sequence.length : 0,
        highlightsKeys: highlights ? Object.keys(highlights) : [],
        targetsLength: targets ? targets.length : 0,
        currentPam: currentPam,
        isoFormStrand: isoFormStrand
      });
      downloadApeFile(geneName, sequence, highlights, targets, currentPam, isoFormStrand);
    }
  };

  // Handle download guide RNA based on operation
  const handleDownloadGuideRna = () => {
    // Add detailed console logs to identify what's happening
    console.log("handleDownloadGuideRna DETAILED DEBUG:", {
      operation: operation,
      geneName: geneName,
      oligos: oligos,
      hasOligos: !!oligos,
      oligosKeys: oligos ? Object.keys(oligos) : [],
      oligosN: oligos && oligos.N ? oligos.N : null,
      oligosC: oligos && oligos.C ? oligos.C : null
    });
    
    if (operation === 'delete') {
      console.log("Calling downloadDeleteGuideRna with:", {
        geneName: geneName,
        hasOligos: !!oligos,
        hasOligosN: oligos ? !!oligos.N : false,
        hasOligosC: oligos ? !!oligos.C : false
      });
      downloadDeleteGuideRna(geneName, oligos);
    } else {
      console.log("Calling downloadGuideRna with:", {
        geneName: geneName,
        hasOligos: !!oligos
      });
      downloadGuideRna(geneName, oligos);
    }
  };

  // Handle download plasmid template based on operation
  const handleDownloadPlasmidTemplate = () => {
    // Add detailed console logs to identify what's happening
    console.log("handleDownloadPlasmidTemplate DETAILED DEBUG:", {
      operation: operation,
      plasmidTemplate: plasmidTemplate,
      geneName: geneName,
      sequenceLength: sequence ? sequence.length : 0,
      highlights: highlights,
      highlightsKeys: highlights ? Object.keys(highlights) : [],
      targets: targets,
      targetsLength: targets ? targets.length : 0,
      terminal: terminal,
      currentPam: currentPam
    });
    
    if (operation === 'delete') {
      console.log("Calling downloadDeletePlasmidTemplate with:", {
        plasmidTemplate: plasmidTemplate,
        geneName: geneName,
        sequenceLength: sequence ? sequence.length : 0,
        highlightsKeys: highlights ? Object.keys(highlights) : []
      });
      
      // Make sure we're passing all the required parameters
      if (!plasmidTemplate) {
        console.error("Missing plasmidTemplate for downloadDeletePlasmidTemplate");
      }
      if (!geneName) {
        console.error("Missing geneName for downloadDeletePlasmidTemplate");
      }
      if (!sequence) {
        console.error("Missing sequence for downloadDeletePlasmidTemplate");
      }
      if (!highlights) {
        console.error("Missing highlights for downloadDeletePlasmidTemplate");
      }
      
      downloadDeletePlasmidTemplate(plasmidTemplate, geneName, sequence, highlights);
    } else {
      console.log("Calling downloadPlasmidTemplate with:", {
        plasmidTemplate: plasmidTemplate,
        geneName: geneName,
        sequenceLength: sequence ? sequence.length : 0,
        targetsLength: targets ? targets.length : 0,
        highlightsKeys: highlights ? Object.keys(highlights) : [],
        terminal: terminal,
        currentPam: currentPam
      });
      downloadPlasmidTemplate(plasmidTemplate, geneName, sequence, targets, highlights, terminal, currentPam);
    }
  };

  // Handle select homology arm based on operation
  const handleSelectHomologyArm = (selection, arm, terminalType = null) => {
    if (operation === 'delete') {
      // For delete operations, use the terminalType passed from HomologyList
      selectDeleteHomologyArm(selection, arm, terminalType, saveCurrentHighlight, selectedNTarget, selectedCTarget);
    } else {
      selectHomologyArm(selection, arm, saveCurrentHighlight, targets);
    }
  };

  // Handle pick cut site for tag operation
  const handlePickCutSite = (target) => {
    console.log('handlePickCutSite called with target:', target);
    
    // For tag operation, call pickTagCutSite and fetch primers
    pickTagCutSite(target, saveCurrentHighlight);
    
    // Calculate target location - this is typically the position in the sequence
    // where the target is found. We can use the currentHighlight location if available.
    let targetLocation;
    
    // Debug the target object to see what properties are available
    console.log('Target object:', target);
    
    if (currentHighlight && currentHighlight.location) {
      targetLocation = currentHighlight.location;
      console.log('Using currentHighlight.location:', targetLocation);
    } else if (target.location) {
      targetLocation = target.location;
      console.log('Using target.location:', targetLocation);
    } else if (target.offset) {
      // Some targets have an offset property that can be used as location
      targetLocation = parseInt(target.offset, 10);
      console.log('Using target.offset as location:', targetLocation);
    } else {
      // If no location is available, we can try to find the target in the sequence
      // But first make sure we have the necessary properties
      if (!target.distal || !target.proximal) {
        console.error('Target missing distal or proximal properties:', target);
        // Use a default location in the middle of the sequence as fallback
        targetLocation = Math.floor(sequence.length / 2);
        console.log('Using fallback location (middle of sequence):', targetLocation);
      } else {
        const targetSequence = target.distal + target.proximal;
        targetLocation = sequence.indexOf(targetSequence);
        if (targetLocation === -1) {
          console.error('Could not find target in sequence, using fallback location');
          // Use a default location in the middle of the sequence as fallback
          targetLocation = Math.floor(sequence.length / 2);
          console.log('Using fallback location (middle of sequence):', targetLocation);
        } else {
          console.log('Found target in sequence at position:', targetLocation);
        }
      }
    }
    
    // Fetch primers immediately after selecting a target
    console.log('Tag target selected, fetching primers with targetLocation:', targetLocation);
    getPrimers(targetLocation, sequence);
  };
  
  // Handle pick delete cut site for delete operation
  const handlePickDeleteCutSite = (target) => {
    console.log('handlePickDeleteCutSite called with target:', target);
    
    // Call the original pickDeleteCutSite function
    pickDeleteCutSite(target, saveCurrentHighlight);
    
    // Check if both N and C targets are selected after this selection
    const updatedNTarget = target.terminalType === 'N' ? target : selectedNTarget;
    const updatedCTarget = target.terminalType === 'C' ? target : selectedCTarget;
    
    if (updatedNTarget && updatedCTarget) {
      console.log('Both N and C targets selected, fetching delete primers');
      
      // Make sure highlights has start and stop locations
      if (!highlights || !highlights.start || !highlights.stop) {
        console.error('Missing start or stop highlights for delete primers');
        return;
      }
      
      // Log the highlights to help with debugging
      console.log('Fetching delete primers with highlights:', highlights);
      
      getDeletePrimers(highlights, sequence);
    }
  };

  // Handle custom data with sequence hook
  const handleAddCustomData = (e) => {
    addCustomData(e, sequence, highlights, chooseTerminal);
  };

  // Handle select start/stop codon
  const handleSelectStartCodon = (e) => {
    selectStartCodon(e, highlights, setHighlights);
  };

  const handleSelectStopCodon = (e) => {
    selectStopCodon(e, highlights, setHighlights);
  };

  return (
    <div className={`App ${themeColor ? 'dark' : 'light'}`}>
      <Header
        themeColor={themeColor}
        onThemeChange={toggleThemeColor}
        onScreenChange={changeScreens}
        onOpenDesign={handleOpenDesign}
        onSaveDesign={handleSaveDesign}
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
        />
        
        <SidebarContent
          activeMenu={menu}
          targets={targets}
          currentHighlightLocation={currentHighlight ? currentHighlight.location : null}
          onPickCutSite={handlePickCutSite}
          onPickDeleteCutSite={handlePickDeleteCutSite}
          onHighlightString={highlightString}
          onClearHighlight={clearHighlight}
          operation={operation}
          primers={primers}
          terminal={terminal}
          selectedArms={selectedArms}
          onSelectHomologyArm={handleSelectHomologyArm}
          onSelectDeleteHomologyArm={selectDeleteHomologyArm}
          selectedPrimer={selectedPrimer}
          onSelectPrimer={selectPrimer}
          geneName={geneName}
          oligos={oligos}
          onViewFinishedDesign={handleViewFinishedDesign}
          onViewDeleteFinishedDesign={viewDeleteFinishedDesign}
          onDownloadApeFile={handleDownloadApeFile}
          onDownloadDeleteApeFile={downloadDeleteApeFile}
          onDownloadGuideRna={handleDownloadGuideRna}
          onDownloadDeleteGuideRna={downloadDeleteGuideRna}
          onChangePlasmidTemplate={changePlasmidTemplate}
          onDownloadPlasmidTemplate={handleDownloadPlasmidTemplate}
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
            <CustomDataScreen onAddCustomData={handleAddCustomData} />
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
            onSelectStartCodon={handleSelectStartCodon}
            onSelectStopCodon={handleSelectStopCodon}
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
