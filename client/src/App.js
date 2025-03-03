import React, { Fragment } from 'react';
import './App.css';
import logo from './assets/head_logo.png';
import sidebar1 from './assets/search.png';
import sidebar2 from './assets/cutcite.png';
import sidebar3 from './assets/homology.png';
import documentIcon from './assets/download.png';
import landing1 from './assets/logo-1.png'; 
import hamburger from './assets/hamburger-menu.png';
import loading from './assets/loading.png';
import manualPDF from './assets/CrisprBuildr1.0_manual.pdf';
import { saveAs } from 'file-saver';
import { Buffer } from 'buffer';

const urlBase = 'http://142.93.118.6'; //'http://localhost:8080'; 
export default class App extends React.Component  {
  constructor(props) {
    super(props);
    this.state = {
      // Informational & API related
      menu:null,
      screen:1,
      hamburger:false,
      themeColor:false,
      highlights:[],
      currentHighlight: null,
      fontSize:23,
      fontMenu:false,
      geneInfo:null,
      isoFormStrand:null,
      operation:null,
      popup:{
        show:false,
        message:null,
        image:null
      },
      currentPam:null,
      selectedPrimer: [],
    }
    // API
    this.changeMenus = this.changeMenus.bind(this);
    this.highlight = this.highlight.bind(this);
    this.saveCurrentHighlight = this.saveCurrentHighlight.bind(this);
  }

  // UI
  changeMenus(e) {
    let menu = parseInt(e.target.dataset.menu); 
    console.log(menu);
    if (menu == 1) {
      window.location.reload();
    }
    if(menu===this.state.menu){
      menu = null;
    }
    this.setState({menu:menu},()=>{
      //console.log(this.state);
    });
  }
  changeScreens(e) {
    let screen = e.target.dataset.screen;  
    console.log("Screen: ", screen);
    let menu = null;
    if(screen==1){
      menu=1;
    }
    this.setState({screen:parseInt(screen)||screen,hamburger:false,menu:menu},()=>{
      console.log(this.state);
      if(screen==3){
        this.setState({mutatePam:false});
      }
    });
  }
  openMenu(e) {
    let screen = e.target.dataset.screen;  
    //console.log(screen);
    this.setState({hamburger:!this.state.hamburger});
  }
  changeThemeColor(e) {
    this.setState({themeColor:!this.state.themeColor});
  }
  closePopup(e) {
    this.setState({popup:{show:false}});
  }
  highlight(e,data){
    let highlight = parseInt(e.target.dataset.value);
    console.log(highlight);
    this.setState({highlight:highlight},()=>{
      console.log(this.state);
    });
  }
  fontMenu(e) {
    this.setState({fontMenu:!this.state.fontMenu});
  }
  changeFontSize(e){
    let size = parseInt(e.target.value);
    this.setState({fontSize:size},()=>{
      //console.log(this.state);
    });
  }
  saveDesign() {
    const design = JSON.stringify(this.state);
    var filename = this.state.geneName+".txt";
    var blob = new Blob([design], {
     type: "text/plain;charset=utf-8"
    });
    saveAs(blob, filename);
    this.setState({hamburger:false});
  }
  openDesign(e) {
    const reader = new FileReader();
    this.setState({popup:{
      show:true,
      message:<h2>Uploading File</h2>,
      image:loading,
      stayOpen:true,
    }},()=>{
      reader.onloadend = (res) => {
        let newState = JSON.parse(res.target.result);
        newState['popup'] = null;
        newState['hamburger'] = false;
        this.setState(newState,()=>{
          console.log(this.state);
        });
      };
      if(e.target.value.length) {
        reader.readAsText(e.target.files[0]);
      }
    });

  }
  viewFinishedDesign() {
    let targetKeys = Object.keys(this.state.targets[0]);
    let targetHTML = targetKeys.map((prop) => {
        return <div><b>{prop}:</b> {this.state.targets[0][prop]}</div>;
    });

    let primerKeys = Object.keys(this.state.primers);
    console.log('primer keys', primerKeys);

    const terminal = this.state.terminal.toUpperCase();

    // Mapping for primer names based on terminal type
    const primerNameMap = {
        hom5: `${terminal} forward homology arm primer`,
        hom3: `${terminal} reverse homology arm primer`,
        seq5: `${terminal} forward sequencing primer`,
        seq3: `${terminal} reverse sequencing primer`,
    };

    let primerHTML = primerKeys.map((key) => {
        let primerOptions = this.state.primers[key];
        console.log('this primer', primerOptions);

        // Extract base name (e.g., "hom5", "seq3") by removing terminal suffix
        const baseKey = key.replace(`_${terminal}`, "");

        if (this.state.selectedArms && this.state.selectedArms[key]) {
            let primerSingle = this.state.selectedArms[key];
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
        } else {
            return (
                <div key={key}>
                    <div className=""><b>{primerNameMap[baseKey] || key}</b></div>
                    {primerOptions.map((primerSingle, index) => (
                        <div className="" key={index}>
                            <div>{primerSingle[7]}</div>
                            <div><div>Tm: {primerSingle[3]}</div></div>
                            <div><div>GC%: {primerSingle[4]}</div></div>
                            <div><div>Any (Self Complementarity): {primerSingle[5]}</div></div>
                            <div><div>3' (Self Complementarity): {primerSingle[6]}</div></div>
                        </div>
                    ))}
                    <br/>
                </div>
            );
        }
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

    let message = <div id='printableArea'>
      <h2>Design Info</h2>
      <div><h3>Target Info</h3>{targetHTML}</div>
      <div><h3>Homology Info</h3>
        {primerHTML}
      </div>
      <div>
        <h3>Oligo Info</h3>
        <div><b>Sense: </b>{this.state.oligos.sense}</div>
        <div><b>Antisense: </b>{this.state.oligos.antisense}</div>
      </div>
      <button onClick={handlePrint}>Print</button>
    </div>;

    this.setState({popup:{
      show:true,
      message:message,
      image:null,
      stayOpen:false,
    }});
  }

  viewDeleteFinishedDesign() {
    const targetKeys = Object.keys(this.state.targets[0]).filter(
      (key) => !["terminalType", "distal", "proximal", "pam"].includes(key)
    );    
    console.log("target keys: ", targetKeys)
    const targetHTML = targetKeys.map((prop) => (
        <div key={`target-${prop}`}><b>{prop}:</b> {this.state.targets[0][prop]}</div>
    ));

    const generatePrimerHTML = (terminalType, primers) => {
      console.log("delete final design primers: ", primers);
      const primerKeys = Object.keys(primers);
  
      const primerNameMap = {
          hom5: `${terminalType} forward homology arm primer`,
          hom3: `${terminalType} reverse homology arm primer`,
          seq5: `${terminalType} forward sequencing primer`,
          seq3: `${terminalType} reverse sequencing primer`,
      };
  
      return primerKeys.map((key) => {
          const primerSingle = this.state.selectedArms[key];
          console.log("primer single: ", primerSingle);
  
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
  
  const NprimersFiltered = Object.keys(this.state.selectedArms)
  .filter(key => key.endsWith('_N')) // Filter for keys ending with '_N'
  .reduce((obj, key) => {
      obj[key] = this.state.selectedArms[key];
      return obj;
  }, {});

  const CprimersFiltered = Object.keys(this.state.selectedArms)
  .filter(key => key.endsWith('_C')) // Filter for keys ending with '_C'
  .reduce((obj, key) => {
      obj[key] = this.state.selectedArms[key];
      return obj;
  }, {});
  
  // Generate HTML for N-terminal and C-terminal primers
  const NprimerHTML = generatePrimerHTML('N', NprimersFiltered);
  const CprimerHTML = generatePrimerHTML('C', CprimersFiltered);
  

    const cutSitesHTML = (
      <div>
        <div>
          <h4>N Terminal</h4>
          <div><b>Distal:</b> {this.state.selectedNTarget.distal || "Not Available"}</div>
          <div><b>Proximal:</b> {this.state.selectedNTarget.proximal || "Not Available"}</div>
          <div><b>PAM:</b> {this.state.selectedNTarget.pam || "Not Available"}</div>
        </div>
          <div>
            <h4>C Terminal</h4>
            <div><b>Distal:</b> {this.state.selectedCTarget.distal || "Not Available"}</div>
            <div><b>Proximal:</b> {this.state.selectedCTarget.proximal || "Not Available"}</div>
            <div><b>PAM:</b> {this.state.selectedCTarget.pam || "Not Available"}</div>
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
                  <div><b>Sense: </b>{this.state.oligos.N.sense}</div>
                  <div><b>Antisense: </b>{this.state.oligos.N.antisense}</div>
                </div>
                <div>
                  <h4>C Terminal</h4>
                  <div><b>Sense: </b>{this.state.oligos.C.sense}</div>
                  <div><b>Antisense: </b>{this.state.oligos.C.antisense}</div>
                </div>
            </div>
            <button onClick={handlePrint}>Print</button>
        </div>
    );

    this.setState({
        popup: {
            show: true,
            message: message,
            image: null,
            stayOpen: false,
        },
    });
}

bugReportForm() {
  const container = document.getElementById("bug-report-container");

  if (!document.getElementById("JotFormIFrame-250567387390163")) {
    container.innerHTML = `
      <iframe
        id="JotFormIFrame-250567387390163"
        title="Bug Tracker"
        allow="geolocation; microphone; camera; fullscreen"
        src="https://form.jotform.com/250567387390163"
        frameborder="0"
        style="min-width:100%;max-width:100%;height:539px;border:none;"
        scrolling="yes"
      ></iframe>
      <script src='https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'></script>
      <script>
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-250567387390163']", "https://form.jotform.com/");
      </script>
    `;
  }
}

userManual() {
  window.open(manualPDF, '_blank');
}
  
saveCurrentHighlight(color, name) {
  const { currentHighlight, highlights } = this.state;

  if (!currentHighlight) {
    console.error("No current highlight to save.");
    return;
  }

  // Assign color and name to the current highlight
  const newHighlight = {
    ...currentHighlight,
    color: color || currentHighlight.color,
    name: name || currentHighlight.name // Use the provided name or the current highlight's name
  };

  // Merge the new highlight into the existing highlights
  this.setState({
    highlights: {
      ...highlights,
      [name || currentHighlight.name]: newHighlight, // Use the provided name or the current highlight's name as the key
    },
  }, () => {
    console.log("Updated highlights:", this.state.highlights);
  });
}

changeCurrentHighlight(i){
  let currentHighlight = this.state.currentHighlight;
  currentHighlight.location = i;
  this.setState({currentHighlight:currentHighlight});
}

  stringLocation(string = null, type) {
    if (!type) {
      return this.state.sequence.indexOf(string);
    }
    let location = this.state.sequence.indexOf(string);
    console.log('location', location);
    let length = string.length;
  
    if (location == -1) {
      let revString = this.revComp(string);
      console.log('rev', revString);
      location = this.state.sequence.indexOf(revString);
    }
    return location;
  }
  
  highlightString(string, color = null, type = null) {
    console.log('string: ', string, ' color: ', color);
    let location = this.stringLocation(string, type);
    console.log(location);
    if (location == -1) {
      location = this.stringLocation(this.revComp(string), type);
    }
    if (location == -1) {
      location = 0;
    }
    let length = string.length;
    if (!color) {
      color = 'rgb(255, 255, 97)';
    }
    this.setState({
      currentHighlight: {
        location: location,
        length: length,
        color: color,
        name: type || string
      }
    });
  }

  clearHighlight(){
   //console.log('mouseleave');
   this.setState({currentHighlight:null});
  }
  revComp(dna) {
    let revComp = [];
    for(let i=0;i<dna.length;i++){
      if(dna[i]==='A'){revComp.push('T')} 
      else if(dna[i]==='C') {revComp.push('G')} 
      else if(dna[i]==='G') {revComp.push('C')}
      else if(dna[i]==='T') {revComp.push('A')}
      else if(dna[i]==='a') {revComp.push('t')} 
      else if(dna[i]==='c') {revComp.push('g')}
      else if(dna[i]==='g') {revComp.push('c')}
      else if(dna[i]==='t') {revComp.push('a')}
    }
    return revComp.reverse().join('');
  }


  /* API CALLS */

  searchForGene(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  
    let url = urlBase + '/api/?type=search&gene=' + e.target.elements.geneName.value;
    this.setState(
      {
        popup: {
          show: true,
          message: <h2>Searching For Gene</h2>,
          image: loading,
          stayOpen: true,
        },
      },
      () => {
        fetch(url)
          .then((res) => res.json())
          .then((geneInfo) => {
            console.log('response', geneInfo);
            let currentState = this.state;
  
            if (!geneInfo) {
              let error = (
                <div className="popup-error">
                  <h2>We're experiencing technical issues. Please try again later.</h2>
                </div>
              );
              currentState.popup = {
                show: true,
                message: error,
                image: null,
              };
              currentState.screen = 1;
  
              this.setState(currentState);
            } else if (!geneInfo.results.isoforms) {
              let error = (
                <div className="popup-error">
                  <h2>We could not find any results. Please try again with the Fly Base ID or a different search term.</h2>
                </div>
              );
              currentState.popup = {
                show: true,
                message: error,
                image: null,
              };
              currentState.screen = 1;
  
              this.setState(currentState);
            } else {
              let isoForms = JSON.parse(geneInfo.results.isoforms);
              if (isoForms.length) {
                currentState.isoForms = isoForms; // Save isoForms in state
                currentState.popup = {
                  show: true,
                  message: this.renderOperationForm(),
                  image: null,
                };
                currentState.geneName = geneInfo.results.name;
                currentState.showIsoForm = false; // State for toggling views
                currentState.screen = 1;
                this.setState(currentState);
              }
            }
          });
      }
    );
  }
  
  // Render Operation Form
  renderOperationForm() {
    return (
      <div className="isoform-form">
        <h2>Choose Your Operation</h2>
        <form onSubmit={this.pickDeleteOrTag.bind(this)}>
          <select name="operation">
            <option value="tag">Tag</option>
            <option value="delete">Delete</option>
          </select>
          <input className="btn" type="submit" value="Proceed" />
        </form>
      </div>
    );
  }
  
  // Render IsoForm Selection
  renderIsoForm() {
    return (
      <div className="isoform-form">
        <h2>Choose Your IsoForm</h2>
        <p className="warning-message">This step takes a few seconds, please only click the button once.</p>
        <form onSubmit={this.pickIsoForm.bind(this)}>
          <select name="isoform">
            {this.state.isoForms.map((isoForm) => (
              <option value={isoForm} key={isoForm}>
                {isoForm}
              </option>
            ))}
          </select>
          <input className="btn" type="submit" value="Search" />
        </form>
      </div>
    );
  }
  
  pickDeleteOrTag(e) {
    e.preventDefault();
    let operation = e.target.elements.operation.value;
    console.log('Selected Operation:', operation);

    if (operation === "tag") {
      this.setState({
        operation: "tag"
      });

    } else if (operation === "delete") {
      this.setState({
        operation: "delete"
      });
    }

    console.log(operation)

    this.setState({
      popup: {
        show: true,
        message: this.renderIsoForm(), // Transition to isoform selection
        image: null,
      },
      showIsoForm: true,
    });
  }  
  
  createPopupForm() {
    return (
      <div className="isoform-form">
        <h2>Choose Your Tag</h2>
        <form onSubmit={this.chooseTerminal.bind(this)}>
          <select name="tag">
            <option value="n">N Terminal</option>
            <option value="c">C Terminal</option>
          </select>
          <input className="btn" type="submit" value="Search" />
        </form>
      </div>
    );
  }
  
  makeIsoFormHighlights() {
    const startSequence = this.state.isoFormSequence.substr(0, 9);
    const stopSequence = this.state.isoFormSequence.substr(
      this.state.isoFormSequence.length - 10,
      this.state.isoFormSequence.length
    );
    console.log("Stop Sequence: ", stopSequence);
    const startIndex = this.state.sequence.indexOf(startSequence);
    const stopIndex = this.state.sequence.indexOf(stopSequence) + 7;
  
    const highlights = {
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
  
    if (this.state.operation === 'delete') {
      // Skip terminal selection for delete operation
      this.setState({
        screen: 2,
        highlights: highlights,
        popup: { show: false },
      });

      console.log("Highlights:", this.state.highlights);
    } else {
      const popupForm = this.createPopupForm();
      this.setState({
        screen: 2,
        highlights: highlights,
        popup: {
          show: true,
          message: popupForm,
          image: null,
          stayOpen: true,
        },
      });
    }
  }
  
  pickIsoForm(e) {
    e.preventDefault();
    const isoForm = e.target.isoform.value;
  
    if (isoForm === this.state.isoForm) {
      this.makeIsoFormHighlights();
      console.log("it went in here!");
    } else {
      console.log("isoForm: ", isoForm);
      const url = `${urlBase}/api/?type=isoform&isoform=${isoForm}`;
  
      fetch(url)
        .then((res) => res.json())
        .then((geneInfo) => {
          const strand = geneInfo.strand;
          const startIndex = 2000;
          const stopIndex =
            geneInfo.sequence.length + 2000 - 3;//+(strand === '-' ? -3 : 0);
  
          const highlights = {
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
          
          console.log("geneInfo.sequence: ", geneInfo.sequence);
          console.log("Setting highlights: ", highlights);
  
          const popupForm = this.createPopupForm();
          const newPopupState =
            this.state.operation === 'delete'
              ? { show: false }
              : {
                  show: true,
                  message: popupForm,
                  image: null,
                  stayOpen: true,
                };
  
          // Set state first, then handle delete
          this.setState(
            {
              isoForm: geneInfo.isoForm,
              isoFormSequence:
                geneInfo.upstream + geneInfo.sequence + geneInfo.downstream,
              sequence: geneInfo.upstream + geneInfo.sequence + geneInfo.downstream,
              isoFormStrand: strand,
              highlights: highlights,
              popup: newPopupState,
              screen: 2,
            },
            () => {
              if (this.state.operation === 'delete') {
                this.handleDeleteOperation();
              }
            }
          );
        });
    }
  }
   

  pickCutSite(target){
    this.saveCurrentHighlight('rgb(255, 255, 97)');
    this.setState({
      targets:[target],
      menu:3,
      screen:3,
    });
    // to set the primers
    if(!this.state.primers||!this.state.primers.length==0){
      this.getPrimers();
      console.log("primer has been set")
    }
  }

  pickDeleteCutSite(target) {
    const { terminalType } = target;
    let newHighlights = this.state.highlights;
    if (terminalType === "N") {
      this.saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_N");
      // I want to add the this.state.currentHighlight to the rest of the highlight in the setstate
      this.setState({ selectedNTarget: target});
      console.log("selected N:", this.state.selectedNTarget)
    } else if (terminalType === "C") {
      this.saveCurrentHighlight('rgb(255, 255, 97)', "cutsite_C");
      this.setState({ selectedCTarget: target,}, () => {
        console.log("selected C:", this.state.selectedCTarget)
        const { selectedNTarget, selectedCTarget } = this.state;
        
        if (selectedNTarget && selectedCTarget) {
          this.setState(
            {
              targets: [selectedNTarget, selectedCTarget],
              menu: 3,
              screen: 3,
            },
            () => {
              if (!this.state.primers || this.state.primers.length === 0) {
                this.getDeletePrimers();
                console.log("Primer has been set");
              }
            }
          );
        }
      });
    }
  }
  
  chooseOperation(e){
    if(e){
      e.preventDefault();
    }
    if(e.response == "delete") {
      console.log("delete function");
    }
  }

  // Terminal

  chooseTerminal(e, terminalInput = null) {
    e.preventDefault();
  
    const { highlights, sequence } = this.state;
    console.log("Highlights: ", highlights);
    const terminal = terminalInput || e.target.tag.value;
    const location = terminal === 'n' ? highlights.start.location : highlights.stop.location;
  
    const targetGenes = sequence.substring(location - 50, location + 50);
  
    this.setState(
      {
        popup: {
          show: true,
          message: (
            <div>
              <h2>Finding Potential Targets.<br /> This may take some time.</h2>
            </div>
          ),
          image: loading,
          stayOpen: true,
        },
        terminal,
      },
      () => this.processTagTargetSearch(targetGenes)
    );
  }
  
  // This is for the isoForm, not cut site
  handleDeleteOperation() {
    const { highlights, sequence } = this.state;
    console.log("Highlights: ", highlights);
    if (!highlights || !highlights.start || !highlights.stop) {
      console.error("Highlights not properly set for delete operation.");
      return; // Return early if highlights are missing
    }
    
    // For delete operation, process both N and C terminals
    const nLocation = highlights.start.location;
    const cLocation = highlights.stop.location;
  
    const nTargetGenes = sequence.substring(nLocation - 50, nLocation + 50);
    const cTargetGenes = sequence.substring(cLocation - 50, cLocation + 50);
  
    // Combine target areas for delete operation
    const combinedTargetGenes = `${nTargetGenes},${cTargetGenes}`;
  
    this.setState(
      {
        popup: {
          show: true,
          message: (
            <div>
              <h2>Finding Potential Targets.<br /> This may take some time.</h2>
            </div>
          ),
          image: loading,
          stayOpen: true,
        },
      },
      () => this.processDeleteTargetSearch(nTargetGenes, cTargetGenes)
    );
  }
  
  processDeleteTargetSearch(nGene, cGene) {
    const nUrl = `${urlBase}/api/?type=targetSearch&targetArea=${nGene}`;
    const cUrl = `${urlBase}/api/?type=targetSearch&targetArea=${cGene}`;
  
    // Fetch the N-terminal and C-terminal target data separately
    Promise.all([fetch(nUrl), fetch(cUrl)])
      .then((responses) => Promise.all(responses.map((res) => res.json())))
      .then(([nResponse, cResponse]) => {
        const nEfficiencyString = nResponse.results.map(
          (target) => target.distal + target.proximal
        );
        const cEfficiencyString = cResponse.results.map(
          (target) => target.distal + target.proximal
        );
  
        this.setState(
          {
            popup: {
              show: true,
              message: <h2>Checking Target Efficiency</h2>,
              image: loading,
              stayOpen: true,
            },
            targets: [...nResponse.results, ...cResponse.results],
          },
          () => {
            // Now fetch target efficiency for both N and C terminal targets
            const nEfficiencyUrl = `${urlBase}/api/?type=targetEfficiency&targets=${encodeURIComponent(
              nEfficiencyString.join('\n')
            )}`;
            const cEfficiencyUrl = `${urlBase}/api/?type=targetEfficiency&targets=${encodeURIComponent(
              cEfficiencyString.join('\n')
            )}`;
  
            Promise.all([fetch(nEfficiencyUrl), fetch(cEfficiencyUrl)])
              .then((efficiencyResponses) =>
                Promise.all(efficiencyResponses.map((res) => res.json()))
              )
              .then(([nEfficiencyResponse, cEfficiencyResponse]) => {
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

                console.log("updated targets: ", updatedTargets);
  
                this.setState(
                  {
                    popup: { show: false },
                    targets: updatedTargets,
                    menu: 2,
                  }
                );
              });
          }
        );
      });
  }

  processTagTargetSearch(targetGenes) {
    const url = `${urlBase}/api/?type=targetSearch&targetArea=${targetGenes}`;
  
    fetch(url)
      .then((res) => res.json())
      .then((response) => {
        const efficiencyString = response.results.map((target) => target.distal + target.proximal);
  
        this.setState(
          {
            popup: {
              show: true,
              message: <h2>Checking Target Efficiency</h2>,
              image: loading,
              stayOpen: true,
            },
            targets: response.results,
          },
          () => {
            const efficiencyUrl = `${urlBase}/api/?type=targetEfficiency&targets=${encodeURIComponent(
              efficiencyString.join('\n')
            )}`;
  
            fetch(efficiencyUrl)
              .then((res) => res.json())
              .then((efficiencyResponse) => {
                const targets = this.state.targets.map((target) => {
                  const gene = target.distal + target.proximal;
                  return { ...target, score: efficiencyResponse[gene] };
                });
  
                this.setState(
                  {
                    popup: { show: false },
                    targets,
                    menu: 2,
                  },
                  () => {
                    if (this.state.operation == "tag") {
                      this.scrollToTerminal(this.state.terminal);
                    }
                  }
                );
              });
          }
        );
      });
  }

  scrollToTerminal(terminal) {
    const windowHeight = window.innerHeight;
    let scrollTop;
  
    if (terminal === 'n') {
      const startElement = document.getElementsByClassName('start')[0];
      scrollTop = startElement.getBoundingClientRect().top;
    } else {
      const screen2 = document.getElementsByClassName('screen-2')[0];
      scrollTop = screen2.scrollHeight; // Scroll to the bottom
    }
  
    console.log('scroll top:', scrollTop, windowHeight);
  
    document.getElementsByClassName('screen-2')[0].scrollTo({
      top: scrollTop - windowHeight / 2,
      behavior: 'smooth',
    });
  }
  
  searchForTargets(){
    console.log('searching for target');
    //console.log(this.state.currentHighlight);
    let targetArea = this.state.currentHighlight.location;
    let targetGenes = this.state.sequence.substr(targetArea-50,100);
    console.log(targetArea); 
    //console.log(targetGenes);
    let url = urlBase+'/api/?type=targetSearch&targetArea='+targetGenes;

    this.setState({popup:{
      show:true,
      message:<h2>Finding Potential Targets</h2>,
      image:loading,
      stayOpen:true,
      }
    },function(){
      fetch(url).then((res) =>{return res.json()}).then((response)=>{
        //console.log(response);
        let efficiencyString = response.results.map((target)=>{
          return target.distal+target.proximal;
        });
        //console.log(encodeURIComponent(efficiencyString.join(',')));
        this.setState({popup:{
          show:true,
          message:<h2>Checking Target Efficiency</h2>,
          image:loading,
          stayOpen:true,
          },
          targets:response.results
        },function(){
          let url = urlBase+'/api/?type=targetEfficiency&targets='+encodeURIComponent(efficiencyString.join('\n'));
          fetch(url).then((res)=>{return res.json()}).then((response)=>{
            //console.log(response);
            //console.log('got response');
            let targets = [];
            for(let i=0;i<this.state.targets.length;i++){
              let target = this.state.targets[i];
              let gene = target.distal+target.proximal;
              //console.log('target',target);
              target.score = response[gene];
              targets.push(target);
            }
            //console.log(targets);
            this.setState({popup:{
              show:false,
              message:<h2>Checking Target Efficiency</h2>,
              image:loading,
              stayOpen:true,
              },
              targets:targets
            },function(){
              //console.log('added score');
              //console.log(this.state);
            });
          });
        });
      });
    });
    
  }
  getPrimers() {

    const targetSearch = this.state.terminal=='n'?this.state.highlights.start.location:this.state.highlights.stop.location;
    console.log('target search area',targetSearch);
    const primerSections = {
      "5' Homology":this.state.sequence.slice(targetSearch-1200, targetSearch-1000),
      "5' Sequence":this.state.sequence.slice(targetSearch-600, targetSearch-400),
      "3' Sequence":this.state.sequence.slice(targetSearch+400, targetSearch+600),
      "3' Homology":this.state.sequence.slice(targetSearch+1000, targetSearch+1200)        
    }
    let primerSectionsString = Buffer.from(JSON.stringify(primerSections)).toString('base64');

    this.setState({
      popup:{
        show:true,
        message:<h2>Retreiving Homology Arm Primers</h2>,
        image:loading,
        stayOpen:true,
        },
    },()=>{
      console.log(urlBase+'/api/?type=primers&primerSections='+primerSectionsString);
      fetch(urlBase+'/api/?type=primers&primerSections='+primerSectionsString).then(res =>{return res.json();}).then((res)=>{
        console.log(res);
        this.setState({primers:res,menu:3,popup:{
          show:false,
          message:<h2>Retreiving Homology Arm Primers</h2>,
          image:loading,
          stayOpen:true,
          },
        },()=>{
          console.log(this.state);
          console.log("terminal: " + this.state.terminal);
          if (this.state.terminal == 'c') {
            const screen = document.getElementsByClassName('screen-3')[0];
            if (screen) {
              const scrollTop = screen.scrollHeight;
              console.log("scrollTop: ", scrollTop);
              screen.scrollTo({
                top: scrollTop - (window.innerHeight / 2),
                behavior: 'smooth'
            });
            } else {
              console.log("screen-3 element not found.");
            }
          }
        });
      })
    });
  }

  getDeletePrimers() {
    console.log("delete primier function");

    let sequence = this.state.sequence;

    const calculatePrimerSections = (targetLocation) => ({
      "5' Homology": sequence.slice(targetLocation - 1200, targetLocation - 1000),
      "5' Sequence": sequence.slice(targetLocation - 600, targetLocation - 400),
      "3' Sequence": sequence.slice(targetLocation + 400, targetLocation + 600),
      "3' Homology": sequence.slice(targetLocation + 1000, targetLocation + 1200),
    });
  
    // Calculate primer sections for both terminals
    const nPrimerSections = calculatePrimerSections(this.state.highlights.start.location);
    const cPrimerSections = calculatePrimerSections(this.state.highlights.stop.location);
  
    const nPrimerSectionsString = Buffer.from(JSON.stringify(nPrimerSections)).toString("base64");
    const cPrimerSectionsString = Buffer.from(JSON.stringify(cPrimerSections)).toString("base64");
  
    this.setState(
      {
        popup: {
          show: true,
          message: <h2>Retrieving Homology Arm Primers</h2>,
          image: loading,
          stayOpen: true,
        },
      },
      () => {
        const nFetchUrl = `${urlBase}/api/?type=primers&primerSections=${nPrimerSectionsString}`;
        const cFetchUrl = `${urlBase}/api/?type=primers&primerSections=${cPrimerSectionsString}`;
  
        Promise.all([fetch(nFetchUrl), fetch(cFetchUrl)])
          .then((responses) => Promise.all(responses.map((res) => res.json())))
          .then(([nPrimers, cPrimers]) => {
            this.setState(
              {
                primers: {
                  N: nPrimers,
                  C: cPrimers,
                },
                menu: 3,
                popup: { show: false },
              },
              () => {
                console.log("N-terminal primers:", nPrimers);
                console.log("C-terminal primers:", cPrimers);
              }
            );
          })
          .catch((err) => {
            console.error("Error fetching primers:", err);
            this.setState({
              popup: {
                show: true,
                message: <h2>Failed to Retrieve Primers</h2>,
                image: null,
                stayOpen: false,
              },
            });
          });
      }
    );
    console.log("primers: " + this.state.primers)
  }

  mutatePam(e){
    e.preventDefault();
    let newPam = e.target.elements.newPam.value;
    //console.log(newPam);
    this.setState({currentPam:newPam,menu:4,screen:4,mutatePam:false},()=>{
      console.log('mutated pam');
      console.log(this.state);
      if(!this.state.primers||!this.state.primers.length==0){
        this.getPrimers();
      }
    });
  }

  selectHomologyArm(selection,arm){
    let currentArms = JSON.parse(JSON.stringify(!this.state.selectedArms?{}:this.state.selectedArms));
    currentArms[arm] = selection;
    this.saveCurrentHighlight('rgba(86, 64, 155,0.3)',arm);

    console.log("Current highlight: ", this.state.currentHighlight)

    this.setState({selectedArms:currentArms},()=>{
      //console.log(this.state);
      this.setState({currentHighlight:null},()=>{
        let totalSelected = Object.keys(this.state.selectedArms);
        if(totalSelected.length&&totalSelected.length==4){
          // GET OLIGO INFO
          console.log('searching');
          console.log(urlBase+'/api/?type=oligos&target='+this.state.targets[0].distal+this.state.targets[0].proximal+this.state.targets[0].pam);
          this.setState({
            popup:{
              show:true,
              message:<h2>Retreiving Oligo Information</h2>,
              image:loading,
              stayOpen:true,
              },
          },()=>{
            fetch(urlBase+'/api/?type=oligos&target='+this.state.targets[0].distal+this.state.targets[0].proximal+this.state.targets[0].pam).then(res =>{return res.json();}).then((res)=>{
              console.log(res);
              if(!res.sense){
                this.setState({
                  menu:4,
                  popup: {
                    show:false,
                  }
                });
              }
              this.setState({
                  menu:4,
                  oligos:res,
                  popup: {
                  show:false,
                }
              });
            });
          });
        }
      });
    });
  }

  selectDeleteHomologyArm(selection, arm, terminal) {
    let currentArms = JSON.parse(JSON.stringify(!this.state.selectedArms ? {} : this.state.selectedArms));
    console.log("Delete function CurrentArm: ", currentArms);
    const terminalKey = `${arm}_${terminal}`;
    currentArms[terminalKey] = selection;
    console.log("Delete function arm: ", arm);
    this.saveCurrentHighlight("rgba(86, 64, 155,0.3)", terminalKey);
  
    this.setState({ selectedArms: currentArms }, () => {
      this.setState({ currentHighlight: null }, () => {
        const totalSelected = Object.keys(this.state.selectedArms);
  
        if (totalSelected.length === 8) { // Expecting 4 arms × 2 terminals = 8
          console.log("Searching");
          this.fetchOligoInformation();
        }
      });
    });
  }

  selectPrimer(primer, arm) {
    this.setState((prevState) => ({
      selectedPrimer: {
        ...prevState.selectedPrimer,  // Keep other selections
        [arm]: primer,  // Update selection for this category
      },
    })); 
    console.log("selectedPrimer Arm: ", arm)
    console.log("selectedPrimer: ", this.state.selectedPrimer)
  }

  fetchOligoInformation() {
    const { selectedNTarget, selectedCTarget, targets } = this.state;
  
    if (!selectedNTarget || !selectedCTarget) {
      console.error("Both selectedNTarget and selectedCTarget are required for fetching oligos.");
      return;
    }
  
    const fetchOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };
  
    // Fetch oligos for N target
    fetch(
      `${urlBase}/api/?type=oligos&target=${selectedNTarget.distal}${selectedNTarget.proximal}${selectedNTarget.pam}`,
      fetchOptions
    )
      .then((res) => res.json())
      .then((res) => {
        this.updateOligoState(res, "N");
      });
  
    // Fetch oligos for C target
    fetch(
      `${urlBase}/api/?type=oligos&target=${selectedCTarget.distal}${selectedCTarget.proximal}${selectedCTarget.pam}`,
      fetchOptions
    )
      .then((res) => res.json())
      .then((res) => {
        this.updateOligoState(res, "C");
      });
  
    // Show popup while fetching
    this.setState({
      popup: {
        show: true,
        message: <h2>Retrieving Oligo Information</h2>,
        image: loading,
        stayOpen: true,
      },
    });
  }
  
  updateOligoState(res, targetType) {
    if (!res.sense) {
      this.setState({
        menu: 4,
        popup: { show: false },
      });
      return;
    }
  
    // Update state based on fetched oligos
    this.setState((prevState) => ({
      oligos: {
        ...prevState.oligos,
        [targetType]: res,
      },
      popup: { show: false },
      menu: 4,
    }));
    console.log("Oligos: ", this.state.oligos)
  }

  // UTILITIES

  downloadApeFile() {
    fetch(window.location.origin+'/fly_templates/empty_ape.txt').then((res)=>{return res.text();}).then((res)=>{
      const data = res;
      fetch(window.location.origin+'/fly_templates/feature.txt').then((res)=>{return res.text()}).then((res2)=>{
        const feature = res2;
        const newFeature = (loc, name, color) => {
          return feature
          .split('*featureLoc*').join(loc)
          .split('*featureName*').join(name)
          .split('*featureColor*').join(color);
        };
        let gene = this.state.sequence;
        const target = this.state.targets[0].distal.toString()+this.state.targets[0].proximal.toString();
        const targetMatch = gene.toLowerCase().match(target.toLowerCase());
        const revTargetMatch = gene.toLowerCase().match(this.revComp(target.toLowerCase()));
        let targetI;
        if (targetMatch) {
          targetI = targetMatch.index+1;
        } else if (revTargetMatch) {
          targetI = revTargetMatch.index;
        }
        let pamStart = revTargetMatch?targetI-2:targetI+20;
        if(this.state.isoFormStrand=='-'&&targetMatch){
          pamStart = targetI;
        }
        const start = 1+parseInt(this.state.highlights.start.location);
        const stop = 1+parseInt(this.state.highlights.stop.location); 
        gene = !this.state.currentPam?gene:gene.substr(0,pamStart-1)+this.state.currentPam+gene.substr(pamStart+2,gene.length);
        const featureArr = [
          newFeature(start+'..'+(start+2),'Start Codon','#35df29'),
          newFeature(stop+'..'+(stop+2),'Stop Codon','#df2935'),
          newFeature((parseInt(1+this.state.highlights['hom5']['location']))+'..'+(parseInt(1+this.state.highlights['hom5']['location'])+this.state.highlights['hom5']['length']),"5' Homology Arm Primer",'#fdca40'),
          newFeature((parseInt(1+this.state.highlights['hom3']['location']))+'..'+(parseInt(1+this.state.highlights['hom3']['location'])+this.state.highlights['hom3']['length']),"3' Homology Arm Primer",'#fdca40'),
          newFeature((parseInt(1+this.state.highlights['seq5']['location']))+'..'+(parseInt(1+this.state.highlights['seq5']['location'])+this.state.highlights['seq5']['length']),"5' Sequence Primer",'#fdca40'),
          newFeature((parseInt(1+this.state.highlights['seq3']['location']))+'..'+(parseInt(1+this.state.highlights['seq3']['location'])+this.state.highlights['seq3']['length']),"3' Sequence Primer",'#fdca40'),
          newFeature(targetI+'..'+(parseInt(targetI)+20),"Target",'#77d1e1'),
          newFeature(pamStart+'..'+(parseInt(pamStart)+2),"Pam",'#0000FF'),
        ];
        const makeGeneArr = () => {

          let geneArr = [];
          const spaces = (str) => {
            let spaceArr = [];
            for(let i=0;i<9-str.length;i++){
              spaceArr.push('');
            }
            return spaceArr;
          }
          for(let i=0;i<gene.length;){
            if(i%50===0){
              geneArr.push('\n');                  
            }
            if(i===0||i%50===0) {
              const currentNum = (i+1).toString();
              geneArr.push(spaces(i+1).join(' ')+(i+1)+' ');
            }
            if(i+10>gene.length){
              geneArr.push(gene.slice(i,gene.length));
            } else {
              geneArr.push(gene.slice(i,i+10));
            }
            geneArr.push('');
            i=i+10;
          }
          return geneArr.join(' ');
        }
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
        const date = new Date();
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const newData = data
        .split('*FEATURES*').join(featureArr.join(''))
        .split('*name*').join(this.state.geneName)
        .split('*length*').join(this.state.sequence.length)
        .split('*date*').join(day+'-'+month+'-'+year)
        .split('*GENE*').join(makeGeneArr())
        ;
        const design = newData;
        var filename = this.state.geneName+".ape";
        var blob = new Blob([design], {
         type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);     
      });
    });
  }

  downloadDeleteApeFile() {
    fetch(window.location.origin + '/fly_templates/empty_ape.txt')
        .then((res) => res.text()) 
        .then((res) => {
            const data = res;

            fetch(window.location.origin + '/fly_templates/feature.txt')
                .then((res) => res.text())
                .then((res2) => {
                    const featureTemplate = res2;

                    // Utility function to create feature entries
                    const newFeature = (loc, name, color) => {
                        return featureTemplate
                            .split('*featureLoc*').join(loc)
                            .split('*featureName*').join(name)
                            .split('*featureColor*').join(color);
                    };

                    // Generate gene features
                    let gene = this.state.sequence;
                    const nTarget = this.state.selectedNTarget;
                    const cTarget = this.state.selectedCTarget;
                    const nTargetSequence = nTarget.distal + nTarget.proximal;
                    const cTargetSequence = cTarget.distal + cTarget.proximal;

                    // Match targets for N-Terminal
                    const targetMatchN = gene.toLowerCase().match(nTargetSequence.toLowerCase());
                    const revTargetMatchN = gene.toLowerCase().match(this.revComp(nTargetSequence.toLowerCase()));
                    let targetIN = targetMatchN ? targetMatchN.index + 1 : revTargetMatchN.index;

                    // Match targets for C-Terminal
                    const targetMatchC = gene.toLowerCase().match(cTargetSequence.toLowerCase());
                    const revTargetMatchC = gene.toLowerCase().match(this.revComp(cTargetSequence.toLowerCase()));
                    let targetIC = targetMatchC ? targetMatchC.index + 1 : revTargetMatchC.index;

                    // Define PAM positions for N and C
                    const pamStartN = revTargetMatchN ? targetIN - 2 : targetIN + 20;
                    const pamStartC = revTargetMatchC ? targetIC - 2 : targetIC + 20;

                    const start = parseInt(this.state.highlights.start.location) + 1;
                    const stop = parseInt(this.state.highlights.stop.location) + 1;

                    // Insert PAM sequence if needed
                    gene = this.state.currentPam
                        ? gene.substr(0, pamStartN - 1) + this.state.currentPam + gene.substr(pamStartN + 2)
                        : gene;


                    console.log(this.state.highlights)
                    // Generate features for Start, Stop, and Targets
                    const featureArr = [
                        newFeature(`${start}..${start + 2}`, 'Start Codon', '#35df29'),
                        newFeature(`${stop}..${stop + 2}`, 'Stop Codon', '#df2935'),
                        newFeature((parseInt(1+this.state.highlights['hom5_N']['location']))+'..'+(parseInt(1+this.state.highlights['hom5_N']['location'])+this.state.highlights['hom5_N']['length']),"5' N Homology Arm Primer",'#fdca40'),
                        newFeature((parseInt(1+this.state.highlights['hom3_N']['location']))+'..'+(parseInt(1+this.state.highlights['hom3_N']['location'])+this.state.highlights['hom3_N']['length']),"3' N Homology Arm Primer",'#fdca40'),
                        newFeature((parseInt(1+this.state.highlights['seq5_N']['location']))+'..'+(parseInt(1+this.state.highlights['seq5_N']['location'])+this.state.highlights['seq5_N']['length']),"5' N Sequence Primer",'#fdca40'),
                        newFeature((parseInt(1+this.state.highlights['seq3_N']['location']))+'..'+(parseInt(1+this.state.highlights['seq3_N']['location'])+this.state.highlights['seq3_N']['length']),"3' N Sequence Primer",'#fdca40'),
                        newFeature((parseInt(1+this.state.highlights['hom5_C']['location']))+'..'+(parseInt(1+this.state.highlights['hom5_C']['location'])+this.state.highlights['hom5_C']['length']),"5' C Homology Arm Primer",'#d440fd'),
                        newFeature((parseInt(1+this.state.highlights['hom3_C']['location']))+'..'+(parseInt(1+this.state.highlights['hom3_C']['location'])+this.state.highlights['hom3_C']['length']),"3' C Homology Arm Primer",'#d440fd'),
                        newFeature((parseInt(1+this.state.highlights['seq5_C']['location']))+'..'+(parseInt(1+this.state.highlights['seq5_C']['location'])+this.state.highlights['seq5_C']['length']),"5' C Sequence Primer",'#d440fd'),
                        newFeature((parseInt(1+this.state.highlights['seq3_C']['location']))+'..'+(parseInt(1+this.state.highlights['seq3_C']['location'])+this.state.highlights['seq3_C']['length']),"3' C Sequence Primer",'#d440fd'),
                        newFeature(`${targetIN}..${targetIN + 20}`, 'Target N-Terminal', '#77d1e1'),
                        newFeature(`${targetIC}..${targetIC + 20}`, 'Target C-Terminal', '#77d1e1'),
                        newFeature(`${pamStartN}..${pamStartN + 2}`, 'PAM N-Terminal', '#0000FF'),
                        newFeature(`${pamStartC}..${pamStartC + 2}`, 'PAM C-Terminal', '#0000FF')
                    ];

                    // Format the gene sequence
                    const makeGeneArr = () => {
                        let geneArr = [];
                        for (let i = 0; i < gene.length; i += 10) {
                            if (i % 50 === 0) geneArr.push('\n' + (i + 1).toString().padStart(9, ' ') + ' ');
                            geneArr.push(gene.slice(i, i + 10) + ' ');
                        }
                        return geneArr.join('');
                    };

                    // Get current date
                    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                    const date = new Date();
                    const formattedDate = `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;

                    // Finalize APE data
                    const newData = data
                        .split('*FEATURES*').join(featureArr.join(''))
                        .split('*name*').join(this.state.geneName)
                        .split('*length*').join(this.state.sequence.length)
                        .split('*date*').join(formattedDate)
                        .split('*GENE*').join(makeGeneArr());

                    // Create and download the APE file
                    const blob = new Blob([newData], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, `${this.state.geneName}_delete.ape`);
                });
        });
}


  changePlasmidTemplate(e){
    let template = e.target.value;

    this.setState({plasmidTemplate:template},()=>{
      console.log(this.state.plasmidTemplate);
    });
  }
  downloadPlasmidTemplate(e){
    e.preventDefault();
    if(!this.state.plasmidTemplate){return false;}
    
    const url = (window.location.origin+'/plasmid_folder/')+(this.state.plasmidTemplate.split(' ').join('%20'))+'.txt';
    console.log(url);
    fetch(url).then((res)=>{return res.text()}).then((data)=>{
      const preArm1 = data.split('**arm_1_start**')[0];
      let searchSequence = this.state.targets[0].distal+this.state.targets[0].proximal+this.state.targets[0].pam;
      const cutsite = this.state.terminal=='n'?(this.state.highlights.start.location+3):this.state.highlights.stop.location;
      let arm1 = this.state.sequence.slice(cutsite-1000, cutsite);
      const postArm1 = data.split('**arm_1_end**')[1].split('**arm_2_start**')[0];
      let arm2 = this.state.sequence.slice(cutsite, cutsite+1000);
      const postArm2 = data.split('**arm_2_end**')[1];
      console.log(this.state.highlights.start.location);
      
      console.log('terminal',this.state.terminal,cutsite)
      if(this.state.mutatedPam) {
        const strand = this.state.potentialTargets[0].strand;
        const target = strand==='-'?this.revComp(this.state.target):this.state.target;
        let arms = arm1+arm2;
        const targetI = arms.toLowerCase().match(target.toLowerCase());
        if(strand==='-'){
          arms = arms.substr(0,targetI.index)+this.state.currentPam+arms.substr(targetI.index+3,arms.length);
        } else {
          arms = arms.substr(0,targetI.index+target.length-3)+this.state.currentPam+arms.substr(targetI.index+target.length,arms.length);
        }
        arm1 = arms.slice(0,Math.floor(arms.length/2)+1);
        arm2 = arms.slice(Math.floor(arms.length/2),arms.length);
      }
      let replaceArm1 = data.split('**arm_1_start**')[1].split('**arm_1_end**')[0].split('');
      let arm1I = 0;
      let replaceArm2 = data.split('**arm_2_start**')[1].split('**arm_2_end**')[0].split('');
      let arm2I = 0;


      for(let y=0;y<replaceArm1.length;y++) {
        if(replaceArm1[y]===' '||replaceArm1[y]==='\n'||!isNaN(replaceArm1[y])) {
        } else {
          replaceArm1[y] = arm1[arm1I];
          arm1I++;
        }

      }
      for(let y=0;y<replaceArm2.length;y++) {
        if(replaceArm2[y]===' '||replaceArm2[y]==='\n'||!isNaN(replaceArm2[y])) {
        } else {
          replaceArm2[y] = arm2[arm2I];
          arm2I++;
        }
        
      }

      let newData = preArm1 + replaceArm1.join('') + postArm1 + replaceArm2.join('') + postArm2;
      const design = newData;
      var filename = this.state.plasmidTemplate+" for "+this.state.geneName+".ape";
      var blob = new Blob([design], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename);
    });
  }

  downloadDeletePlasmidTemplate(e){
    e.preventDefault();
    if(!this.state.plasmidTemplate){return false;}
    
    const url = (window.location.origin+'/plasmid_folder/')+(this.state.plasmidTemplate.split(' ').join('%20'))+'.txt';
    console.log(url);
    fetch(url).then((res)=>{return res.text()}).then((data)=>{
      const preArm1 = data.split('**arm_1_start**')[0];
      let searchSequence = this.state.targets[0].distal+this.state.targets[0].proximal+this.state.targets[0].pam;
      const Ncutsite = this.state.highlights.start.location+3
      const Ccutsite = this.state.highlights.stop.location;
      let arm1 = this.state.sequence.slice(Ncutsite-1000, Ncutsite);
      const postArm1 = data.split('**arm_1_end**')[1].split('**arm_2_start**')[0];
      let arm2 = this.state.sequence.slice(Ccutsite, Ccutsite+1000);
      const postArm2 = data.split('**arm_2_end**')[1];
      console.log(this.state.highlights.start.location);

      let replaceArm1 = data.split('**arm_1_start**')[1].split('**arm_1_end**')[0].split('');
      let arm1I = 0;
      let replaceArm2 = data.split('**arm_2_start**')[1].split('**arm_2_end**')[0].split('');
      let arm2I = 0;


      for(let y=0;y<replaceArm1.length;y++) {
        if(replaceArm1[y]===' '||replaceArm1[y]==='\n'||!isNaN(replaceArm1[y])) {
          continue;
        } else {
          replaceArm1[y] = arm1[arm1I];
          arm1I++;
        }

      }
      for(let y=0;y<replaceArm2.length;y++) {
        if(replaceArm2[y]===' '||replaceArm2[y]==='\n'||!isNaN(replaceArm2[y])) {
          continue;
        } else {
          replaceArm2[y] = arm2[arm2I];
          arm2I++;
        }
        
      }

      let newData = preArm1 + replaceArm1.join('') + postArm1 + replaceArm2.join('') + postArm2;
      const design = newData;
      var filename = this.state.plasmidTemplate+" for "+this.state.geneName+".ape";
      var blob = new Blob([design], {
        type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename);
    });
  }
  
  downloadGuideRna() {
    const url = window.location.origin + '/templates/pU6.txt';
    console.log("RNA URL: ", url);
  
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then((data) => {
        const newFeature = (start, end, locusTag, label, color) => {
          return `     misc_feature    ${start}..${end}\n` +
                 `                     /locus_tag="${locusTag}"\n` +
                 `                     /label="${label}"\n` +
                 `                     /ApEinfo_label="${label}"\n` +
                 `                     /ApEinfo_fwdcolor="${color}"\n` +
                 `                     /ApEinfo_revcolor="green"\n` +
                 `                     /ApEinfo_graphicformat="arrow_data {{0 1 2 0 0 -1} {} 0}\n` +
                 `                     width 5 offset 0\n`;
        };
  
        // console.log("Data fetched: ", data);
  
        let preSplit = data.split('**injection_start**')[0];
        let postSplit = data.split('**injection_end**')[1];
        let sense = this.state.oligos.sense;

        console.log("Oligos: ", this.state.oligos)
  
        console.log("Pre-split: ", preSplit);
        console.log("Sense: ", sense);
        console.log("Post-split: ", postSplit);

        const u6EndMatch = preSplit.match(/misc_feature\s+(\d+)\.\.(\d+)\n\s+\/locus_tag="u6 promoter"/);
        const u6EndPosition = u6EndMatch ? parseInt(u6EndMatch[2]) : null;
  
        // Get the start and end for the sense feature
        const senseLength = sense.length;
        const senseStart = u6EndPosition + 1; // Adjust this if necessary
        const senseEnd = senseStart + senseLength - 1; 

        console.log("senseStart: ", senseStart)
        console.log("senseEnd: ", senseEnd);
  
        // Create the new feature string for the sense oligo
        const featureString = newFeature(senseStart, senseEnd, 'sense', 'Sense', '#35df29');
  
        // Locate the index of the *FEATURES placeholder
        const featuresIndex = preSplit.indexOf('FEATURES');
        if (featuresIndex !== -1) {
          // Find the end of the FEATURES section
          const endFeaturesIndex = preSplit.indexOf('ORIGIN', featuresIndex);
          if (endFeaturesIndex !== -1) {
            // Append the new feature string before the ORIGIN line
            preSplit = preSplit.substring(0, endFeaturesIndex) + featureString + preSplit.substring(endFeaturesIndex);
          } else {
            console.error("Warning: ORIGIN section not found after FEATURES.");
          }
        } else {
          console.error("Warning: FEATURES section not found in preSplit.");
        }
  
        // Combine preSplit and postSplit
        const design = preSplit + sense + postSplit;
  
        console.log("Final design: ", design);
  
        var filename = "rna-" + this.state.geneName + ".ape";
    
        var blob = new Blob([design], {
          type: "text/plain;charset=utf-8"
        });
        saveAs(blob, filename);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }  

  downloadDeleteGuideRna() {
    const url = window.location.origin + '/templates/pU6.txt';
    console.log("RNA URL: ", url);
  
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then((data) => {
        const newFeature = (start, end, locusTag, label, color) => {
          return `     misc_feature    ${start}..${end}\n` +
                 `                     /locus_tag="${locusTag}"\n` +
                 `                     /label="${label}"\n` +
                 `                     /ApEinfo_label="${label}"\n` +
                 `                     /ApEinfo_fwdcolor="${color}"\n` +
                 `                     /ApEinfo_revcolor="green"\n` +
                 `                     /ApEinfo_graphicformat="arrow_data {{0 1 2 0 0 -1} {} 0}\n` +
                 `                     width 5 offset 0\n`;
        };
  
        const u6EndMatch = data.match(/misc_feature\s+(\d+)\.\.(\d+)\n\s+\/locus_tag="u6 promoter"/);
        const u6EndPosition = u6EndMatch ? parseInt(u6EndMatch[2]) : null;
  
        if (!u6EndPosition) {
          console.error("Could not determine the u6 promoter end position.");
          return;
        }
  
        const generateFile = (oligo, label, fileName) => {
          // Split data for each oligo to avoid overwriting
          const preSplit = data.split('**injection_start**')[0];
          const postSplit = data.split('**injection_end**')[1];
  
          const oligoLength = oligo.sense.length;
          const oligoStart = u6EndPosition + 1;
          const oligoEnd = oligoStart + oligoLength - 1;
  
          console.log(`${label} Start: `, oligoStart);
          console.log(`${label} End: `, oligoEnd);
  
          const featureString = newFeature(oligoStart, oligoEnd, label, label, '#35df29');
  
          // Insert the new feature into the FEATURES section
          let modifiedPreSplit = preSplit;
          const featuresIndex = preSplit.indexOf('FEATURES');
          if (featuresIndex !== -1) {
            const endFeaturesIndex = preSplit.indexOf('ORIGIN', featuresIndex);
            if (endFeaturesIndex !== -1) {
              modifiedPreSplit = preSplit.substring(0, endFeaturesIndex) + featureString + preSplit.substring(endFeaturesIndex);
            } else {
              console.error("Warning: ORIGIN section not found after FEATURES.");
            }
          } else {
            console.error("Warning: FEATURES section not found in preSplit.");
          }
  
          // Combine parts to form the final design
          const design = modifiedPreSplit + oligo.sense + postSplit;
  
          // Trigger the file download
          const blob = new Blob([design], { type: "text/plain;charset=utf-8" });
          saveAs(blob, `${fileName}.ape`);
        };
  
        // Generate files for N and C
        generateFile(this.state.oligos.N, "delete-N", "rna-delete-N");
        generateFile(this.state.oligos.C, "delete-C", "rna-delete-C");
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }
  
  addCustomData(e){
    e.preventDefault();
    console.log(e.target.elements);
    let name = e.target.elements.geneName.value;
    let isoForm = e.target.elements.geneIsoform.value;
    let geneData = e.target.elements.geneData.value.replace(" ","").replace(/[\W_]+/g,"").toUpperCase();
    let geneTerminal = e.target.elements.geneTerminal.value;
    let highlights = {};
    if(e.target.elements.startCodon.value&&e.target.elements.startCodon.value!=''){
      highlights['start'] = {
        location:parseInt(e.target.elements.startCodon.value),
        length:3,
        color:'#93E593',
      };

    } else {
      let potentialStarts = [];
      var startIndexOccurence = geneData.indexOf('ATG', 0);
      while(startIndexOccurence >= 0) {
        potentialStarts.push(startIndexOccurence);
        startIndexOccurence = geneData.indexOf('ATG', startIndexOccurence + 1);  
      }
      console.log('starts',potentialStarts);
      for(let i=0;i<potentialStarts.length;i++){
        highlights['potentialStart-'+i] = {
          location:potentialStarts[i],
          length:3,
          color:'#93E593',
        }
      }
    }
    if(e.target.elements.stopCodon.value&&e.target.elements.stopCodon.value!=''){
      highlights['stop'] = {
        location:parseInt(e.target.elements.stopCodon.value),
        length:3,
        color:'#FF668E',
      };
     
    }else{
      let potentialStops = [];
      let potentialStopsTAA = [];
  
      var stopIndexOccurence = geneData.indexOf('TAG', 0);
      var stopIndexOccurenceTAA = geneData.indexOf('TAA', 0);
  
      while(stopIndexOccurence >= 0) {
        potentialStops.push(stopIndexOccurence);
        stopIndexOccurence = geneData.indexOf('TAG', stopIndexOccurence + 1);
      }
      while(stopIndexOccurenceTAA >= 0) {
        potentialStopsTAA.push(stopIndexOccurenceTAA);
        stopIndexOccurenceTAA = geneData.indexOf('TAA', stopIndexOccurenceTAA + 1);
      }
      let totalStop = potentialStops.length;
      
      console.log('stops',potentialStops);
  
  
      for(let i=0;i<potentialStops.length;i++){
        highlights['potentialStop-'+i] = {
          location:potentialStops[i],
          length:3,
          color:'#FF668E',
        }
      }
      for(let i=0;i<potentialStopsTAA.length;i++){
        highlights['potentialStop-'+(i+totalStop)] = {
          location:potentialStopsTAA[i],
          length:3,
          color:'#FF668E',
        }
      }
    }
    let screen = 'custom-2';
    let menu = null;
    if((e.target.elements.startCodon.value&&e.target.elements.startCodon.value!='')&&(e.target.elements.stopCodon.value&&e.target.elements.stopCodon.value!='')){
      screen = 3;
      menu = 3;
    }
    this.setState({geneName:name,isoForm:isoForm,isoFormSequence:geneData,sequence:geneData,terminal:geneTerminal,screen:screen,highlights:highlights},()=>{
      console.log(this.state);
      this.chooseTerminal(null,geneTerminal);
    })
  }

  selectStartCodon(e) {
    e.preventDefault();
    console.log('start select');
    let location = e.target.getAttribute('data-highlight-location');
    let highlightKeys = Object.keys(this.state.highlights);
    console.log(location);
    let highlights = {
      start:{
        location:parseInt(location),
        length:3,
        color: '#93E593',
      }
    };
    if(!this.state.highlights.stop){
      console.log('no stop selected');
      for(let i=0;i<highlightKeys.length;i++){
        console.log(highlightKeys[i])
        if(highlightKeys[i].includes('potentialStop')){
          
          highlights[highlightKeys[i]] = this.state.highlights[highlightKeys[i]];
          console.log('potential stop',this.state.highlights[highlightKeys[i]]);
        } else {
          console.log('not potential stop');
        }
      }
    } else {
      highlights['stop'] = this.state.highlights.stop;
    }
    console.log(highlights);
    this.setState({highlights:highlights},()=>{
      console.log(this.state.highlights);
    });
  }

  selectStopCodon(e) {
    e.preventDefault();
    console.log('stop select');
    let location = e.target.getAttribute('data-highlight-location');
    let highlightKeys = Object.keys(this.state.highlights);
    let highlights = {
      stop:{
        location:parseInt(location),
        length:3,
        color: '#FF668E',
      }
    };
    if(!this.state.highlights.start){
      console.log('no start selected');
      for(let i=0;i<highlightKeys.length;i++){
        console.log(highlightKeys[i])
        if(highlightKeys[i].includes('potentialStart')){
          
          highlights[highlightKeys[i]] = this.state.highlights[highlightKeys[i]];
          console.log('potential start',this.state.highlights[highlightKeys[i]]);
        } else {
          console.log('not potential start');
        }
      }
    } else {
      highlights['start'] = this.state.highlights.start;
    }
    this.setState({highlights:highlights});
  }

  componentDidUpdate(){
    let options = {
      root: document.querySelector('.screen-4'),
      rootMargin: '0px',
      threshold: 0
    }
    const highlightObserver = (entries)=>{
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let elem = entry.target;
    
          if (entry.intersectionRatio >= 0.75) {
           // console.log('intersecting');
          } else {
          //  console.log('not intersecting');
          }

        }
      });
    }
    let observer = new IntersectionObserver(highlightObserver, options);
    let currentHighlightEl = document.querySelector('.main-highlight');
    if(currentHighlightEl){
      observer.observe(currentHighlightEl);
    }
   // console.log(currentHighlightEl);

  }
  render() {
    //console.log('render')
    const makeHighlights = () => {
      return null;
    }
    const highlightKeys = !this.state.highlights?null:Object.keys(this.state.highlights);
    const currentHighlight = !this.state.currentHighlight?null:this.state.currentHighlight;
    const currentHighlightLocation = !currentHighlight?null:currentHighlight.location;

    const geneInfoPrep = !this.state.sequence
  ? null
  : this.state.sequence.split("").map((letter, i) => {
      let highlightClasses = [];
      let highlightLocation = null;

      // Check if the current letter is within the current highlight
      if (
        this.state.currentHighlight &&
        i >= this.state.currentHighlight.location &&
        i < this.state.currentHighlight.location + this.state.currentHighlight.length
      ) {
        highlightClasses.push("current-highlight");
        highlightClasses.push(this.state.currentHighlight.name);
        highlightLocation = this.state.currentHighlight.location;
      }

      // Check all highlights
      Object.keys(this.state.highlights || {}).forEach((key) => {
        const highlight = this.state.highlights[key];
        const start = highlight.location;
        const stop = start + highlight.length;

        if (i >= start && i < stop) {
          if (!highlightClasses.includes(key)) {
            highlightClasses.push(key);
          }

          if (key.includes("potentialStart")) {
            highlightClasses.push("is-start-select");
          }
          if (key.includes("potentialStop")) {
            highlightClasses.push("is-stop-select");
          }

          highlightLocation = start;
        }
      });

      return (
        <div
          key={i}
          className={`${highlightClasses.join(" ")} single-letter`}
          data-highlight-location={highlightLocation}
          onClick={
            highlightClasses.includes("is-start-select")
              ? this.selectStartCodon.bind(this)
              : highlightClasses.includes("is-stop-select")
              ? this.selectStopCodon.bind(this)
              : null
          }
        >
          {letter}
        </div>
      );
    });
    // cut site list
    let targetList;
    if (this.state.operation == "delete") {
      const nTargetList = [];
      const cTargetList = [];

      // Categorize targets using a for loop
      const targets = this.state.targets || [];
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];

        // Determine the highlight name based on terminalType
        const highlightName = target.terminalType === "N" ? "cutsite_N" : "cutsite_C";

        const targetElement = (
          <div
            key={`target-${target.distal}-${target.proximal}-${target.terminalType}`}
            className={
              "single-target " +
              (!currentHighlightLocation ? "disabled" : currentHighlightLocation)
            }
            onClick={
              !currentHighlightLocation
                ? null
                : this.pickDeleteCutSite.bind(this, target)
            }
            onMouseEnter={this.highlightString.bind(
              this,
              target.distal + target.proximal + target.pam,
              "rgb(255, 255, 97)",
              highlightName // Use "cutsite_N" or "cutsite_C" based on terminalType
            )}
            onMouseLeave={this.clearHighlight.bind(this)}
          >
            <div>{target.distal + target.proximal + target.pam}</div>
            <div>
              <span>Efficiency: </span>
              {!target.score ? "-" : target.score}
            </div>
            <div>
              <span>Strand: </span>
              {target.strand}
            </div>
            <div>
              <span>Off Targets: </span>
              {target.offtarget}
            </div>
          </div>
        );

        // Add to respective lists based on terminalType
        if (target.terminalType === "N") {
          nTargetList.push(targetElement);
        } else if (target.terminalType === "C") {
          cTargetList.push(targetElement);
        }
      }

      // Combine the lists into a single targetList
      targetList = (
        <div>
          <h5>N-terminal Targets</h5>
          {nTargetList.length > 0 ? nTargetList : <p>No N-terminal targets available</p>}

          <h5>C-terminal Targets</h5>
          {cTargetList.length > 0 ? cTargetList : <p>No C-terminal targets available</p>}
        </div>
      );
    }
    else {
      targetList = !this.state.targets?null:this.state.targets.map((target)=>{
        return <div className={"single-target "+(!currentHighlightLocation?'disabled':currentHighlightLocation)} 
        onClick={!currentHighlightLocation?null:this.pickCutSite.bind(this,target)} 
        onMouseEnter={this.highlightString.bind(this,target.distal+target.proximal+target.pam,'rgb(255, 255, 97)','cutsite')} 
        onMouseLeave={this.clearHighlight.bind(this)}>
          <div>{target.distal+target.proximal+target.pam}</div>
          <div><span>Efficiency: </span>{!target.score?'-':target.score}</div>
          <div><span>Strand: </span>{target.strand}</div>
          <div><span>Off Targets: </span>{target.offtarget}</div>
        </div>;
      });
    }

    const HomologyList = () => {
      if (!this.state.primers) {
        return;
      }
    
      let primerKeys;
      if (this.state.operation === "delete") {
        primerKeys = Object.keys(this.state.primers.N);
      } else {
        primerKeys = Object.keys(this.state.primers);
      }
    
      const order = ["hom5", "hom3", "seq5", "seq3"];
      primerKeys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    
      if (this.state.operation === "delete") {
        return (
          <div>
            {["N", "C"].map((terminal) => (
              <div key={terminal} className="primer-section">
                <h3>{terminal}-Terminal</h3>
                {primerKeys.map((key) => {
                  const primers = this.state.primers[terminal][key] || [];
                  let primerLabelName;
                  if (key === "hom5") {
                    primerLabelName = `${terminal} Forward Homology Arm Primer`;
                  } else if (key === "hom3") {
                    primerLabelName = `${terminal} Reverse Homology Arm Primer`;
                  } else if (key === "seq5") {
                    primerLabelName = `${terminal} Forward Sequencing Primer`;
                  } else if (key === "seq3") {
                    primerLabelName = `${terminal} Reverse Sequencing Primer`;
                  } else {
                    primerLabelName = "";
                    console.log("Primer label name didn't get set");
                  }
    
                  return (
                    <div key={key}>
                      <div className="homology-label">{primerLabelName}</div>
                      {primers.map((primerSingle, index) => (
                        <div
                          key={`${terminal}-${key}-${index}`}
                          className={`single-target ${this.state.selectedPrimer[`${terminal}-${key}`] === primerSingle[7] ? "selected" : ""}`}
                          onMouseEnter={this.highlightString.bind(
                            this,
                            primerSingle[7],
                            "rgba(86, 64, 155,0.3)",
                            "homology"
                          )}
                          onMouseDown={() => {
                            this.selectPrimer(primerSingle[7], `${terminal}-${key}`);
                            this.selectDeleteHomologyArm(primerSingle, key, terminal);
                          }}
                          onMouseLeave={this.clearHighlight.bind(this)}
                        >
                          <div>{primerSingle[7]}</div>
                          <div>
                            <div>Tm: </div>
                            <div>{primerSingle[3]}</div>
                          </div>
                          <div>
                            <div>GC%: </div>
                            <div>{primerSingle[4]}</div>
                          </div>
                          <div>
                            <div>Any (Self Complementarity): </div>
                            <div>{primerSingle[5]}</div>
                          </div>
                          <div>
                            <div>3' (Self Complementarity): </div>
                            <div>{primerSingle[6]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      }
    
      return (
        <div>
          {primerKeys.map((key) => {
            const primerOptions = this.state.primers[key];
            let primerLabelName;
            let captializedTerm = `${this.state.terminal.charAt(0).toUpperCase()}${this.state.terminal.slice(1)}`
            if (key === "hom5") {
              primerLabelName = `${captializedTerm} Forward Homology Arm Primer`;
            } else if (key === "hom3") {
              primerLabelName = `${captializedTerm} Reverse Homology Arm Primer`;
            } else if (key === "seq5") {
              primerLabelName = `${captializedTerm} Forward Sequencing Primer`;
            } else if (key === "seq3") {
              primerLabelName = `${captializedTerm} Reverse Sequencing Primer`;
            } else {
              primerLabelName = "";
              console.log("Primer label name didn't get set");
            }
            return (
              <div key={key}>
                <div className="homology-label">{primerLabelName}</div>
                {primerOptions.map((primerSingle, index) => (
                  <div
                    key={index}
                    className={`single-target ${this.state.selectedPrimer[key] === primerSingle[7] ? "selected" : ""}`}
                    onMouseEnter={this.highlightString.bind(
                      this,
                      primerSingle[7],
                      "rgba(86, 64, 155,0.3)",
                      "homology"
                    )}
                    onMouseDown={() => {
                      this.selectPrimer(primerSingle[7], key);
                      this.selectHomologyArm(primerSingle, key);
                    }}
                    onMouseLeave={this.clearHighlight.bind(this)}
                  >
                    <div>{primerSingle[7]}</div>
                    <div>
                      <div>Tm: </div>
                      <div>{primerSingle[3]}</div>
                    </div>
                    <div>
                      <div>GC%: </div>
                      <div>{primerSingle[4]}</div>
                    </div>
                    <div>
                      <div>Any (Self Complementarity): </div>
                      <div>{primerSingle[5]}</div>
                    </div>
                    <div>
                      <div>3' (Self Complementarity): </div>
                      <div>{primerSingle[6]}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    };    

    const popup = () => {
      if(!this.state.popup){
        return null;
      }
      return <div className="popup-wrapper" style={{display:this.state.popup.show?'flex':'none'}}>
       <div className="popup">{this.state.popup.stayOpen?null:<div className="popup-close" onClick={this.closePopup.bind(this)}>X</div>}
      <div className="message">{this.state.popup.message}</div>
      {this.state.popup.image?<img className="blink" src={this.state.popup.image} />:''}</div>
      </div>
    }    
    const downloadOptions = () => {
      let plasmidOptions;
      if (this.state.operation === "delete") {
        plasmidOptions = ["pHD-DsRed-X", "pHD-dsRed-attP-X"]
      } else {
        plasmidOptions = ["N terminal SSPB and mCherry tag","N terminal EGFP and SSPB","C terminal mCherry and SSPB tag","C terminal EGFP and SSPB"];
      }
      let htmlOptions = [];
      htmlOptions.push(<option default>Choose A Template</option>)
      for(let i=0;i<plasmidOptions.length;i++){
        const terminal = this.state.terminal;
        if (this.state.operation === "tag" && plasmidOptions[i].toLowerCase().includes(terminal+' terminal')) {
          htmlOptions.push(<option key={i} value={plasmidOptions[i]}>{plasmidOptions[i]}</option>)
        } 
        if (this.state.operation == "delete") {
          console.log("plasmid Options", plasmidOptions)
          htmlOptions.push(<option key={i} value={plasmidOptions[i]}>{plasmidOptions[i]}</option>)
        }
      }
      
      if (this.state.operation == 'tag') {
        return <div className="download-list">
          <div><button className="btn" onMouseDown={this.viewFinishedDesign.bind(this)}>View All Data</button></div>
          <div className="download-label">Genomic Template</div>
          <div><button className="btn" onMouseDown={this.downloadApeFile.bind(this)}>Download</button></div>
          <div className="download-label">Guide Rna Vector</div>
          <div><button className="btn" onMouseDown={this.downloadGuideRna.bind(this)}>Download</button></div>
          <div className="download-label">Plasmid Template</div>
          <div><select onChange={this.changePlasmidTemplate.bind(this)}>{htmlOptions}</select></div>
          <div><button className="btn" onMouseDown={this.downloadPlasmidTemplate.bind(this)}>Download</button></div>
        </div>;
      } else {
        return <div className="download-list">
        <div><button className="btn" onMouseDown={this.viewDeleteFinishedDesign.bind(this)}>View All Data</button></div>
          <div className="download-label">Genomic Template</div>
          <div><button className="btn" onMouseDown={this.downloadDeleteApeFile.bind(this)}>Download</button></div>
          <div className="download-label">Guide Rna Vector</div>
          <div><button className="btn" onMouseDown={this.downloadDeleteGuideRna.bind(this)}>Download</button></div>
          <div className="download-label">Plasmid Template</div>
          <div><select onChange={this.changePlasmidTemplate.bind(this)}>{htmlOptions}</select></div>
          <div><button className="btn" onMouseDown={this.downloadDeletePlasmidTemplate.bind(this)}>Download</button></div>
      </div>;
      }
    }
    
    const customDataUpload = () => {
      return <div>
        <h2>Enter your custom data below</h2>
        <form onSubmit={this.addCustomData.bind(this)}>
        <label>Name <input type="text" name="geneName" /></label>
        <label>IsoForm<input type="text" name="geneIsoform" /></label>
        <label>Start Codon Index<input type="number" name="startCodon" /></label>
        <label>Stop Codon Index<input type="number" name="stopCodon" /></label>
        <label>Terminal
          <select name="geneTerminal" >
            <option value="n">N terminal</option>
            <option value="c">C terminal</option>
          </select>
        </label>
        <label>Data<textarea name="geneData" /></label>
        <button className='btn'>Submit</button>
        </form>
      </div>
    }
    const customDataTagging = () => {
      return <div>
        
      </div>
    }
    return (
    <div className="App">
      <header className="App-header">     
        <div className="main-logo"><img src={logo} alt="Logo" /></div> 
        <div className="menu"><img src={hamburger} alt="menu-icon" onClick={this.openMenu.bind(this)}/>
          <div className="main-menu" style={{display:(this.state.hamburger===false?'none':'flex'),}}>
            <div className="menu-item" onClick={this.changeScreens.bind(this)} data-screen="1" >New Project</div>
            <div className="menu-item">
              <label className='button' for="upload-file">
                Upload Project
                <input onChange={this.openDesign.bind(this)} id="upload-file" name="upload-file" type='file' style={{display:'none'}}></input>
              </label>
            </div>
            <div className="menu-item" onClick={this.saveDesign.bind(this)} data-screen="0" >Save Project</div>
            <div className="menu-item"  onClick={this.changeThemeColor.bind(this)} ><div className={"theme-color "+(this.state.themeColor===false?'dark':'light')}></div>Switch to {(this.state.themeColor===false?'Dark':'Light')} Theme</div>
            <div className="menu-item" onClick={this.fontMenu.bind(this)} ><div className="font-size"><div className="large">A</div><div className="small">A</div></div> Font Size</div>
            <div className='menu-item' onClick={this.userManual.bind(this)}>User Manual</div>
            <div className='menu-item' onClick={this.bugReportForm.bind(this)}>Bug Report</div>
            <div id="bug-report-container"></div>
          </div>
        </div>
      </header>
      <div className={"body "+(this.state.themeColor===false?'light':'dark')}>
        <div className="sidebar">
            <div className={(this.state.menu==1?'active':'')+' menu-icon'}>
              <div className="menu-image-wrapper"  onClick={this.changeMenus.bind(this)} data-menu="1"><img src={sidebar1} data-menu="1" alt="sidebar1" /></div>
              <label onClick={this.changeScreens.bind(this)} data-screen="1">Search For Gene</label>
            </div>            
            <div className={(this.state.menu==2?'active':'')+' menu-icon'} >
              <div className="menu-image-wrapper" style={{pointerEvents:this.state.screen>1?'':'none'}} onClick={this.changeMenus.bind(this)} data-menu="2" alt="sidebar2"><img src={sidebar2} /></div>
              <label onClick={this.changeScreens.bind(this)} data-screen="2"><div className="arrow-down">&#94;</div>Select Cut Site</label>
              {!targetList?null:<div className="target-list" style={{display:this.state.menu==2?'flex':'none'}}>{targetList}</div>}
            </div>       
            <div className={(this.state.menu==3?'active':'')+' menu-icon'} data-menu="3" >
              <div className="menu-image-wrapper" style={{pointerEvents:this.state.screen>2?'':'none'}} onClick={this.changeMenus.bind(this)} data-menu="3" alt="sidebar4"><img src={sidebar3} alt="sidebar4"/></div>
              <label onClick={this.changeScreens.bind(this)} data-screen="3">Homology Arm Primers</label>
              <div className="target-list homology-list" style={{display:this.state.menu==3?'flex':'none'}}>{HomologyList()}</div>
            </div>

            <div className={(this.state.menu==4?'active':'')+' menu-icon'} data-menu="4" >
              <div className="menu-image-wrapper sidebar-5" style={{pointerEvents:this.state.screen>3?'':'none'}} onClick={this.changeMenus.bind(this)} data-menu="4" alt="sidebar5"><img src={documentIcon} alt="sidebar5"/></div>
              <label onClick={this.changeScreens.bind(this)} data-screen="4">Download Data</label>
              {this.state.menu==4?downloadOptions():null}
            </div>
        </div>
        <div className={"main "+(this.state.themeColor===false?'light':'dark')}>
            <div className="screen screen-0"  style={{display:this.state.screen===0?'flex':'none',}}>
              <div className="landing-icon" onClick={this.changeScreens.bind(this)} data-screen="1"><img src={landing1} alt=""/><div>Search Flybase</div></div>
            </div>
            <div className="screen screen-1"  style={{display:this.state.screen===1?'flex':'none',}}>
              <form className="search-form" onSubmit={this.searchForGene.bind(this)} ><label>Search for a gene</label><input type="text" placeholder='Name/FlyBase ID' name="geneName" /><input className='btn' type="submit" value="Search"/></form>
            </div>
            <div className="screen screen-custom"  style={{display:this.state.screen==='custom'?'flex':'none',}}>
              {customDataUpload()}
            </div>
            <div className="screen screen-custom-2"  style={{display:this.state.screen==='custom-2'?'flex':'none',}}>
              <div className="gene-name">Gene: {this.state.geneName}{!this.state.isoForm?'':' - Isoform: '+this.state.isoForm+' - Strand: '+this.state.isoFormStrand}</div>
              <div className="gene-info-wrapper" style={{fontSize:this.state.fontSize}}>
                <div className="gene-info gene-info-sequence" >{geneInfoPrep}</div>
              </div>
            </div>
            <div className="screen screen-2" style={{display:this.state.screen===2?'flex':'none',}}>
              <div className="gene-name">Gene: {this.state.geneName}{!this.state.isoForm?'':' - Isoform: '+this.state.isoForm+' - Strand: '+this.state.isoFormStrand}</div>
              <div className="gene-info-wrapper" style={{fontSize:this.state.fontSize}}>
              
              <div className="gene-info gene-info-highlights">{makeHighlights()}</div>
                <div className="gene-info gene-info-sequence" >{geneInfoPrep}</div>
              </div>
            </div>
            <div className="screen screen-3" style={{display:this.state.screen===3?'flex':'none',}}>
              <div className="gene-name">Gene: {this.state.geneName}{!this.state.isoForm?'':' - Isoform: '+this.state.isoForm+' - Strand: '+this.state.isoFormStrand}</div>
              <div className="gene-info-wrapper" style={{fontSize:this.state.fontSize}}>
              
              <div className="gene-info gene-info-highlights">{makeHighlights()}</div>
                <div className="gene-info gene-info-sequence" >{geneInfoPrep}</div>
              </div>
            </div>
            <div className="screen screen-4" style={{display:this.state.screen>=4?'flex':'none',}}>
              <div className="gene-name">Gene: {this.state.geneName}{!this.state.isoForm?'':' - Isoform: '+this.state.isoForm+' - Strand: '+this.state.isoFormStrand}</div>
              <div className="gene-info-wrapper" style={{fontSize:this.state.fontSize}}>
                <div className="gene-info gene-info-highlights">{makeHighlights()}</div>
                <div className="gene-info gene-info-sequence" >{geneInfoPrep}</div>
              </div>
            </div>
        </div>
        
      </div>
      <div className="footer">
        <div>Website made by <strong>Sound Development Company</strong> and <strong>Selina Liu</strong></div>
      </div>
      <div className="popups" style={{display:(this.state.fontMenu===true?'flex':'none')}} >      
        <div className="font-size">
          <div className="close" onClick={this.fontMenu.bind(this)}>X</div>
          <h4>Change Font Size</h4>
          <form><input type="number"  value={this.state.fontSize} onChange={this.changeFontSize.bind(this)}/></form>
        </div>
      </div>
      {popup()}
    </div>
    )
  }
}
