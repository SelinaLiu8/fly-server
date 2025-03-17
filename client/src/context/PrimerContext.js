import React, { createContext, useState, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { useUI } from './UIContext';
import { useGene } from './GeneContext';

// Create the context
const PrimerContext = createContext();

// Create a provider component
export const PrimerProvider = ({ children }) => {
  const { showPopup, setMenu } = useUI();
  const { terminal } = useGene();
  
  // State for primer data
  const [primers, setPrimers] = useState(null);
  const [selectedArms, setSelectedArms] = useState({});
  const [selectedPrimer, setSelectedPrimer] = useState({});
  const [oligos, setOligos] = useState(null);

  // Loading image
  const loading = require('../assets/loading.png');

  const getPrimers = useCallback(async (targetLocation, sequence) => {
    showPopup({
      message: <h2>Retrieving Homology Arm Primers</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      console.log('Fetching primers with targetLocation:', targetLocation, 'and sequence length:', sequence?.length);
      const primerData = await api.getPrimers(targetLocation, sequence);
      console.log('Received primer data:', primerData);
      
      setPrimers(primerData);
      setMenu(3);
      showPopup({ show: false });
      
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
      setPrimers(null); // Reset primers on error
      setMenu(3); // Still switch to the homology tab to show the error message
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while retrieving primers. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [terminal, showPopup, setMenu, loading]);

  const getDeletePrimers = useCallback(async (highlights, sequence) => {
    if (!highlights || !highlights.start || !highlights.stop) {
      console.error("Highlights not properly set for delete primers.");
      setPrimers(null);
      setMenu(3); // Still switch to the homology tab to show the error message
      showPopup({
        message: (
          <div className="popup-error">
            <h2>Start and stop codons must be selected before retrieving primers.</h2>
          </div>
        ),
        image: null,
      });
      return;
    }
    
    showPopup({
      message: <h2>Retrieving Homology Arm Primers</h2>,
      image: loading,
      stayOpen: true,
    });
    
    try {
      console.log('Fetching delete primers with start:', highlights.start.location, 'stop:', highlights.stop.location, 'and sequence length:', sequence?.length);
      const primerData = await api.getDeletePrimers(
        highlights.start.location,
        highlights.stop.location,
        sequence
      );
      console.log('Received delete primer data:', primerData);
      
      setPrimers(primerData);
      setMenu(3);
      showPopup({ show: false });
    } catch (error) {
      console.error('Error fetching delete primers:', error);
      setPrimers(null); // Reset primers on error
      setMenu(3); // Still switch to the homology tab to show the error message
      showPopup({
        message: (
          <div className="popup-error">
            <h2>An error occurred while retrieving primers. Please try again later.</h2>
          </div>
        ),
        image: null,
      });
    }
  }, [showPopup, setMenu, loading]);

  const selectHomologyArm = useCallback((selection, arm, saveCurrentHighlight, targets) => {
    const currentArms = { ...selectedArms };
    currentArms[arm] = selection;
    
    saveCurrentHighlight('rgba(86, 64, 155,0.3)', arm);
    
    setSelectedArms(currentArms);
    
    const totalSelected = Object.keys(currentArms);
    if (totalSelected.length === 4) {
      // GET OLIGO INFO
      showPopup({
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      // Create a timeout to ensure we don't get stuck
      setTimeout(() => {
        // If we're still showing the popup after 30 seconds, proceed to download options
        showPopup({ show: false });
        setMenu(4);
      }, 30000);
      
      // Call getOligos directly instead of using fetchOligoInformation
      if (targets && targets.length > 0) {
        const target = targets[0];
        const targetSequence = target.distal + target.proximal + target.pam;
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Oligo retrieval timed out')), 30000); // 30 second timeout
        });
        
        // Fetch oligos with timeout
        Promise.race([api.getOligos(targetSequence), timeoutPromise])
          .then(oligoData => {
            setOligos(oligoData);
            showPopup({ show: false });
            setMenu(4);
          })
          .catch(error => {
            console.error('Error fetching oligos:', error);
            // Proceed to download options even if oligo retrieval fails
            setOligos(null);
            setMenu(4);
            showPopup({ show: false });
          });
      } else {
        console.error("No targets available for fetching oligos");
        setMenu(4);
      }
    }
  }, [selectedArms, setMenu, showPopup, loading]);

  const selectDeleteHomologyArm = useCallback((selection, arm, terminal, saveCurrentHighlight, selectedNTarget, selectedCTarget) => {
    const currentArms = { ...selectedArms };
    const terminalKey = `${arm}_${terminal}`;
    currentArms[terminalKey] = selection;
    
    saveCurrentHighlight("rgba(86, 64, 155,0.3)", terminalKey);
    
    setSelectedArms(currentArms);
    
    const totalSelected = Object.keys(currentArms);
    if (totalSelected.length === 8) { // Expecting 4 arms × 2 terminals = 8
      // GET OLIGO INFO
      showPopup({
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      // Create a timeout to ensure we don't get stuck
      setTimeout(() => {
        // If we're still showing the popup after 30 seconds, proceed to download options
        showPopup({ show: false });
        setMenu(4);
      }, 30000);
      
      // Call getOligos directly instead of using fetchOligoInformation
      if (selectedNTarget && selectedCTarget) {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Oligo retrieval timed out')), 30000); // 30 second timeout
        });
        
        // Fetch oligos for N target with timeout
        const nTargetSequence = selectedNTarget.distal + selectedNTarget.proximal + selectedNTarget.pam;
        const cTargetSequence = selectedCTarget.distal + selectedCTarget.proximal + selectedCTarget.pam;
        
        // Fetch oligos for N and C targets
        Promise.all([
          Promise.race([api.getOligos(nTargetSequence), timeoutPromise]),
          Promise.race([api.getOligos(cTargetSequence), timeoutPromise])
        ])
          .then(([nOligos, cOligos]) => {
            setOligos({
              N: nOligos,
              C: cOligos
            });
            showPopup({ show: false });
            setMenu(4);
          })
          .catch(error => {
            console.error('Error fetching oligos:', error);
            // Proceed to download options even if oligo retrieval fails
            setOligos(null);
            setMenu(4);
            showPopup({ show: false });
          });
      } else {
        console.error("Both selectedNTarget and selectedCTarget are required for fetching oligos.");
        setMenu(4);
      }
    }
  }, [selectedArms, setMenu, showPopup, loading]);

  const selectPrimer = useCallback((primer, arm) => {
    setSelectedPrimer(prev => ({
      ...prev,
      [arm]: primer,
    }));
  }, []);

  const fetchOligoInformation = useCallback(async (operation, selectedNTarget, selectedCTarget, targets) => {
    if (operation === "delete") {
      if (!selectedNTarget || !selectedCTarget) {
        console.error("Both selectedNTarget and selectedCTarget are required for fetching oligos.");
        return;
      }
      
      showPopup({
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Oligo retrieval timed out')), 30000); // 30 second timeout
      });
      
      try {
        // Fetch oligos for N target with timeout
        const nOligosPromise = api.getOligos(
          selectedNTarget.distal + selectedNTarget.proximal + selectedNTarget.pam
        );
        
        // Race between the fetch and the timeout
        const nOligos = await Promise.race([nOligosPromise, timeoutPromise]);
        
        // Fetch oligos for C target with timeout
        const cOligosPromise = api.getOligos(
          selectedCTarget.distal + selectedCTarget.proximal + selectedCTarget.pam
        );
        
        const cOligos = await Promise.race([cOligosPromise, timeoutPromise]);
        
        setOligos({
          N: nOligos,
          C: cOligos
        });
        showPopup({ show: false });
        setMenu(4);
      } catch (error) {
        console.error('Error fetching oligos:', error);
        // Proceed to download options even if oligo retrieval fails
        setOligos(null);
        setMenu(4);
        showPopup({ show: false });
      }
    } else {
      if (!targets || targets.length === 0) {
        console.error("No targets available for fetching oligos.");
        return;
      }
      
      showPopup({
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Oligo retrieval timed out')), 30000); // 30 second timeout
      });
      
      try {
        // Race between the fetch and the timeout
        const oligoPromise = api.getOligos(
          targets[0].distal + targets[0].proximal + targets[0].pam
        );
        
        const oligoData = await Promise.race([oligoPromise, timeoutPromise]);
        
        setOligos(oligoData);
        setMenu(4);
        showPopup({ show: false });
      } catch (error) {
        console.error('Error fetching oligos:', error);
        // Proceed to download options even if oligo retrieval fails
        setOligos(null);
        setMenu(4);
        showPopup({ show: false });
      }
    }
  }, [showPopup, setMenu, loading]);

  const viewFinishedDesign = useCallback((targets, selectedArms, terminal, oligos) => {
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
        {oligos && (
          <div>
            <h3>Oligo Info</h3>
            <div><b>Sense: </b>{oligos.sense}</div>
            <div><b>Antisense: </b>{oligos.antisense}</div>
          </div>
        )}
        {!oligos && (
          <div>
            <h3>Oligo Info</h3>
            <div>Oligo information could not be retrieved.</div>
          </div>
        )}
        <button onClick={handlePrint}>Print</button>
      </div>
    );

    showPopup({
      message: message,
      image: null,
      stayOpen: false,
    });
  }, [showPopup]);

  const viewDeleteFinishedDesign = useCallback((targets, selectedArms, selectedNTarget, selectedCTarget, oligos) => {
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
        {oligos && (
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
        )}
        {!oligos && (
          <div>
            <h3>Oligo Info</h3>
            <div>Oligo information could not be retrieved.</div>
          </div>
        )}
        <button onClick={handlePrint}>Print</button>
      </div>
    );

    showPopup({
      message: message,
      image: null,
      stayOpen: false,
    });
  }, [showPopup]);

  return (
    <PrimerContext.Provider
      value={{
        primers,
        setPrimers,
        selectedArms,
        setSelectedArms,
        selectedPrimer,
        setSelectedPrimer,
        oligos,
        setOligos,
        getPrimers,
        getDeletePrimers,
        selectHomologyArm,
        selectDeleteHomologyArm,
        selectPrimer,
        fetchOligoInformation,
        viewFinishedDesign,
        viewDeleteFinishedDesign
      }}
    >
      {children}
    </PrimerContext.Provider>
  );
};

// Create a custom hook to use the context
export const usePrimer = () => {
  const context = useContext(PrimerContext);
  if (context === undefined) {
    throw new Error('usePrimer must be used within a PrimerProvider');
  }
  return context;
};
