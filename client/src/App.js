import React, { useEffect } from 'react';

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

// Context hooks
import { useUI } from './context/UIContext';
import { useGene } from './context/GeneContext';
import { useTarget } from './context/TargetContext';
import { usePrimer } from './context/PrimerContext';
import { useFile } from './context/FileContext';
import useSequence from './hooks/useSequence';

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
    mutatePam,
    currentPam,
    handleDeleteOperation,
    pickCutSite,
    pickDeleteCutSite,
    mutatePamHandler
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
        handleDeleteOperation(highlights, sequence);
      }
    };
    
    // Add event listener
    document.addEventListener('isoformSelected', handleIsoformSelected);
    
    // Clean up
    return () => {
      document.removeEventListener('isoformSelected', handleIsoformSelected);
    };
  }, [setSequence, setHighlights, handleDeleteOperation]);

  // Handle view finished design based on operation
  const handleViewFinishedDesign = () => {
    if (operation === 'delete') {
      viewDeleteFinishedDesign(targets, selectedArms, selectedNTarget, selectedCTarget, oligos);
    } else {
      viewFinishedDesign(targets, selectedArms, terminal, oligos);
    }
  };

  // Handle download APE file based on operation
  const handleDownloadApeFile = () => {
    if (operation === 'delete') {
      downloadDeleteApeFile(geneName, sequence, highlights, selectedNTarget, selectedCTarget, currentPam);
    } else {
      downloadApeFile(geneName, sequence, highlights, targets, currentPam, isoFormStrand);
    }
  };

  // Handle download guide RNA based on operation
  const handleDownloadGuideRna = () => {
    if (operation === 'delete') {
      downloadDeleteGuideRna(geneName, oligos);
    } else {
      downloadGuideRna(geneName, oligos);
    }
  };

  // Handle download plasmid template based on operation
  const handleDownloadPlasmidTemplate = () => {
    if (operation === 'delete') {
      downloadDeletePlasmidTemplate(plasmidTemplate, geneName, sequence, highlights);
    } else {
      downloadPlasmidTemplate(plasmidTemplate, geneName, sequence, targets, highlights, terminal, currentPam);
    }
  };

  // Handle select homology arm based on operation
  const handleSelectHomologyArm = (selection, arm) => {
    if (operation === 'delete') {
      selectDeleteHomologyArm(selection, arm, terminal, saveCurrentHighlight);
    } else {
      selectHomologyArm(selection, arm, saveCurrentHighlight);
    }
  };

  // Handle pick cut site based on operation
  const handlePickCutSite = (target) => {
    if (operation === 'delete') {
      pickDeleteCutSite(target, saveCurrentHighlight);
    } else {
      pickCutSite(target, saveCurrentHighlight);
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
          targets={targets}
          currentHighlightLocation={currentHighlight ? currentHighlight.location : null}
          onPickCutSite={handlePickCutSite}
          onHighlightString={highlightString}
          onClearHighlight={clearHighlight}
          operation={operation}
          primers={primers}
          terminal={terminal}
          selectedArms={selectedArms}
          onSelectHomologyArm={handleSelectHomologyArm}
          selectedPrimer={selectedPrimer}
          onSelectPrimer={selectPrimer}
          geneName={geneName}
          oligos={oligos}
          onViewFinishedDesign={handleViewFinishedDesign}
          onDownloadApeFile={handleDownloadApeFile}
          onDownloadGuideRna={handleDownloadGuideRna}
          onChangePlasmidTemplate={changePlasmidTemplate}
          onDownloadPlasmidTemplate={handleDownloadPlasmidTemplate}
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
