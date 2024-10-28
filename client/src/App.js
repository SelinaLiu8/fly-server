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
      popup:{
        show:false,
        message:null,
        image:null
      },
      currentPam:null,
      }
    // API
    this.changeMenus = this.changeMenus.bind(this);
    this.highlight = this.highlight.bind(this);
    this.saveCurrentHighlight = this.saveCurrentHighlight.bind(this);
  }

  // UI
  changeMenus(e) {
    let menu = parseInt(e.target.dataset.menu); 
    //console.log(menu);
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
  closeAllMenus(e) {
    //this.setState({menu:null,hamburger:false});
  }
  closePopup(e) {
    this.setState({popup:{show:false}});
  }
  highlight(e,data){
    /*let highlight = parseInt(e.target.dataset.value);
    console.log(highlight);*/
    /*this.setState({highlight:highlight},()=>{
      //console.log(this.state);
    });*/
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
  viewFinishedDesign(){
    let targetKeys = Object.keys(this.state.targets[0]);
    let targetHTML = targetKeys.map((prop)=>{

      return <div><b>{prop}:</b> {this.state.targets[0][prop]}</div>;
    });
    let primerKeys = Object.keys(this.state.primers);
      console.log('primer keys',primerKeys);
      let primerHTML = primerKeys.map((key)=>{
        let primerOptions = this.state.primers[key];
        //console.log('this primer',primerOptions);
        if(this.state.selectedArms&&this.state.selectedArms[key]){
          let primerSingle = this.state.selectedArms[key];
          return <div><div className=""><b>{key}</b></div>
            <div className="" >
            <div >{primerSingle[7]}</div>
            <div ><div>Tm: {primerSingle[3]}</div></div>
            <div ><div>GC%: {primerSingle[4]}</div></div> 
            <div ><div>Any (Self Complementarity): {primerSingle[5]}</div></div>
            <div ><div>3' (Self Complementarity): {primerSingle[6]}</div></div>
          </div><br/></div>;
        } else {
          return <div><div className=""><b>{key}</b></div>{primerOptions.map((primerSingle)=>{
            return <div className="">
            <div >{primerSingle[7]}</div>
            <div ><div>Tm: {primerSingle[3]}</div></div>
            <div ><div>GC%: {primerSingle[4]}</div></div> 
            <div ><div>Any (Self Complementarity): {primerSingle[5]}</div></div>
            <div ><div>3' (Self Complementarity): {primerSingle[6]}</div></div>
          </div>})}<br/></div>;
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
  
  saveCurrentHighlight(color=null,name=null){
    let highlight = JSON.parse(JSON.stringify(this.state.currentHighlight));
    //console.log('highlight',highlight);
    if(color){
      highlight.color = color;
    }
    let highlights = this.state.highlights;
    
    if(name){
      highlights[name] = highlight;
    } else {
      highlights[highlight.name] = highlight;
    }
    //console.log(highlights);
    if(highlight.name=='targetSearch'){
      //console.log('search for targets');
      this.searchForTargets();
    } else {

      this.setState({highlights:highlights},()=>{
       console.log(this.state);
  
      });
    }
  }
  changeCurrentHighlight(i){
    let currentHighlight = this.state.currentHighlight;
    currentHighlight.location = i;
    this.setState({currentHighlight:currentHighlight});
  }
  stringLocation(string=null,type){
    if(!type){
      return this.state.sequence.indexOf(string);
    }
    let location = this.state.sequence.indexOf(string);
    console.log('location',location);
    let length = string.length;
  
    if(location==-1){
      
      let revString = this.revComp(string);
      console.log('rev',revString);
      location = this.state.sequence.indexOf(revString);    
      //location = location+(length/2)-4;
    } else {
     // location = location+(length/2)-1;
    }
    return location;
  }
  highlightString(string,color=null,type=null){
    console.log('string: ',string,' color: ',color);
    //console.log(this.state.sequence);
    let location = this.stringLocation(string,type);
    console.log(location);
    if(location==-1){
      location = this.stringLocation(this.revComp(string),type);
    }
    if(location==-1){
      location = 0;
    }
    let length = string.length;
    if(!color){
      color = 'rgb(255, 255, 97)';
    }
    //console.log('mousenter');
    //console.log(location,length,color);
    this.setState({currentHighlight:{
      location:location,
      length:length,
      color:color,
      name:!type?'cutsite':type
    }
    });
  }
  clearHighlight(){
   //console.log('mouseleave');
   //this.setState({currentHighlight:null});
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
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    //console.log(e.target.elements.geneName.value);
    let url = urlBase+'/api/?type=search&gene='+e.target.elements.geneName.value;
    this.setState({popup:{
      show:true,
      message:<h2>Searching For Gene</h2>,
      image:loading,
      stayOpen:true,
    }}, ()=>{
      fetch(url).then((res) =>{return res.json()}).then((geneInfo)=>{
        console.log('response',geneInfo);
        let currentState = this.state;
        if(!geneInfo){
            let currentState = this.state;
            let error = <div className="popup-error"><h2>We're experiencing technical issues. Please try again later.</h2></div>;
            currentState.popup = {
              show:true,
              message:error,
              image:null
            };
            currentState.screen = 1;

            this.setState(currentState);
        } else if(!geneInfo.results.isoforms){
            let error = <div className="popup-error"><h2>We could not find any results. Please try again with a different search term.</h2></div>;
            currentState.popup = {
              show:true,
              message:error,
              image:null
            };
            currentState.screen = 1;
      
            this.setState(currentState);
        } else {
          let isoForms = JSON.parse(geneInfo.results.isoforms);
          if(isoForms.length) {
            
            let options = <div className="isoform-form">
              <h2>Choose Your IsoForm</h2>
              <p className='warning-message'>This step takes a few seconds, please only click the button once.</p>
              <form onSubmit={this.pickIsoForm.bind(this)}><select name="isoform">{
              isoForms.map(isoForm=>{
                return <option value={isoForm} key={isoForm}>{isoForm}</option>
              })
              }</select><input className='btn' type="submit" value="Search" /></form>
            </div>;
            
            currentState.popup = {
              show:true,
              message:options,
              image:null
            };
            currentState.geneName = geneInfo.results.name;
            currentState.screen = 1;
            this.setState(currentState);
          }
        }
      });
    });
  }
  makeIsoFormHighlights(){
    let startSequence = this.state.isoFormSequence.substr(0,9);
    let stopSequence = this.state.isoFormSequence.substr(this.state.isoFormSequence.length-10,this.state.isoFormSequence.length);
    let startIndex = this.state.sequence.indexOf(startSequence);
    let stopIndex = this.state.sequence.indexOf(stopSequence)+7;
    //console.log(startIndex,startSequence);
    //console.log(stopIndex,stopSequence);
    let highlights = {
      start:{
        location:startIndex,
        length:3,
        color:'#93E593',
      },
      stop:{
        location:stopIndex,
        length:3,
        color:'#FF668E',
      }
    };
    let popupForm = <div className="isoform-form"><h2>Choose Your Tag</h2><form onSubmit={this.chooseTerminal.bind(this)}>
      <select name="tag"><option value="n">N Terminal</option><option value="c">C Terminal</option></select>
      <input className='btn' type="submit" value="Search" />
    </form></div>;
    this.setState({
      screen:2,
      popup:{
        show:false,
      },
      highlights:highlights,
      popup:{
        show:true,
        message:popupForm,
        image:null,
        stayOpen:true,
      }
    });
  }
  pickIsoForm(e){
    e.preventDefault();
    //console.log(e.target.isoform.value);
    let isoForm = e.target.isoform.value;
    //console.log(isoForm,this.state.isoForm);
    //console.log(this.state.isoFormSequence);
    if(isoForm==this.state.isoForm){
      //console.log('same isoForm');
      this.makeIsoFormHighlights();
    } else {
      let url = urlBase+'/api/?type=isoform&isoform='+isoForm;
      fetch(url).then((res) =>{return res.json()}).then((geneInfo)=>{
        //console.log('response',geneInfo);
        let currentState = this.state;
        currentState.isoForm = geneInfo.isoForm;
        currentState.isoFormSequence = geneInfo.upstream+geneInfo.sequence+geneInfo.downstream;
        currentState.sequence = geneInfo.upstream+geneInfo.sequence+geneInfo.downstream;
        currentState.isoFormStrand = geneInfo.strand;
        let strand = geneInfo.strand;
        let startIndex = 2000;
        let stopIndex = geneInfo.sequence.length+2000+(strand=='-'?-3:3);
        let highlights = {
          start:{
            location:startIndex,
            length:3,
            color:'#93E593',
          },
          stop:{
            location:stopIndex,
            length:3,
            color:'#FF668E',
          }
        }
        currentState.highlights = highlights;
        let popupForm = <div className="isoform-form"><h2>Choose Your Tag</h2><form onSubmit={this.chooseTerminal.bind(this)}>
          <select name="tag"><option value="n">N Terminal</option><option value="c">C Terminal</option></select>
          <input className='btn' type="submit" value="Search" />
          </form></div>;
       
        currentState.popup = {
          show:true,
          message:popupForm,
          image:null,
          stayOpen:true,
        };
        currentState.screen = 2;
        /*currentState.currentHighlight = {
          location:null,
          length:100,
          color:'#FCD27E',
          name:'targetSearch'
        }*/
        //console.log(currentState);
        this.setState(currentState,function(){
          //console.log(this.state);
        });
      });
    }
  }
  pickCutSite(target){
    this.saveCurrentHighlight('rgb(255, 255, 97)');
    this.setState({
      targets:[target],
      menu:3,
      screen:3,
      mutatePam:true,
    });
    // to set the primers
    if(!this.state.primers||!this.state.primers.length==0){
      this.getPrimers();
      console.log("primer has been set")
    }
  }
  chooseTerminal(e,terminalInput=null){
    if(e){
      e.preventDefault();
    }
    //console.log(e.target.tag.value);
    let i;
    let terminal = terminalInput||e.target.tag.value;
    if(terminal=='n'){
      i = this.state.highlights.start.location;
    } else if(terminal=='c'){
      i = this.state.highlights.stop.location;
    }
    //console.log('start',i-26,i+26);
    let targetGenes = this.state.sequence.substring(i-50,i+50); 
    //console.log(targetGenes);
    let url = urlBase+'/api/?type=targetSearch&targetArea='+targetGenes;
    //console.log(url);
    this.setState({popup:{
      show:true,
      message:<div><h2>Finding Potential Targets.<br/> This may take some time.</h2></div>,
      image:loading,
      stayOpen:true,
      },
      terminal:terminal
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
            let targets = [];
            for(let i=0;i<this.state.targets.length;i++){
              let target = this.state.targets[i];
              let gene = target.distal+target.proximal;
              //console.log('target',target);
              target.score = response[gene];
              targets.push(target);
            }
            this.setState({popup:{
              show:false,
              },
              targets:targets,
              menu:2,
            },function(){
              let terminal = this.state.terminal;
              let scrollTop;
              let windowHeight = window.innerHeight;
              if(terminal=='n'){
                scrollTop = document.getElementsByClassName('start')[0].getBoundingClientRect().top;

              } else {
                scrollTop = document.getElementsByClassName('stop')[0].getBoundingClientRect().top;
              }
              console.log('scroll top: ',scrollTop,windowHeight);
              document.getElementsByClassName('screen-2')[0].scrollTo({
                top: scrollTop-(windowHeight/2),
                behavior: 'smooth'
              });
            });
          });
        });
      });
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
        });
      })
    });
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
  downloadGuideRna(){
    const url = window.location.origin+'/templates/pU6.txt';
    console.log("RNA url: ", url);
    fetch(url).then((res)=>{return res.text()}).then((data)=>{
      console.log(data);
      let preSplit = data.split('**injection_start**')[0];
      let postSplit = data.split('**injection_end**')[1];
      let sense = this.state.oligos.sense.substring(0,7)+' '+this.state.oligos.sense.substring(7,17)+' '+this.state.oligos.sense.substring(17);
      const design = preSplit+sense+postSplit;
      var filename = "rna-" + this.state.geneName+".ape";
 
      var blob = new Blob([design], {
       type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename); 
    });
    return;
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
      if(!this.state.highlights){
        return null;
      }
      /*for (const highlight of this.state.highlights) {
        let geneInfoHighlights = !this.state.sequence?null:this.state.sequence.split('').map((letter,i)=>{
          return <div className={(highlight.location<i-((highlight.highlightLength-1)/2)||highlight.location>i+((highlight.highlightLength-1)/2)?' ':'highlight ')+' single-letter '} data-value={i} onMouseEnter={this.highlight.bind(this)}>{letter}</div>;
        });
      }*/
      let allHighlights = [];
      let currentHighlight = !this.state.sequence?null:this.state.sequence.split('').map((letter,i)=>{
        if(!this.state.currentHighlight){
          return null;
        }
        let style = {background:'rgba(255,255,255,0)'};
        let classes = '';
        if(i>=(this.state.currentHighlight.location-((this.state.currentHighlight.length-1)/2))&&i<=(this.state.currentHighlight.location+((this.state.currentHighlight.length-1)/2))){
          style = {background:this.state.currentHighlight.color,zIndex:999};
          classes = 'main-highlight';
        }
        return <div style={style} className={classes} data-value={i} >{letter}</div>;
      });
      let highlightKeys = Object.keys(this.state.highlights);
      for(let i=0;i<highlightKeys.length;i++){
        let highlight = this.state.highlights[highlightKeys[i]];
        allHighlights.push(!this.state.sequence?null:<div className="gene-wrapper">{
          this.state.sequence.split('').map((letter,i)=>{
            let style = {background:'rgba(255,255,255,0)'};
            let className = null;
            if(i>=(highlight.location-((highlight.length-1)/2))&&i<=(highlight.location+((highlight.length-1)/2))){
              style = {background:highlight.color};
              
            }
            if(i==highlight.location){
              className = highlightKeys[i];
            }
            return <div style={style} className={highlightKeys[i]} ref={className} data-value={i}  >{letter}</div>;
          })
          }</div>);
      }
      allHighlights.push(<div className="current-highlight">{currentHighlight}</div>);
      return allHighlights;
    }
    const highlightKeys = !this.state.highlights?null:Object.keys(this.state.highlights);
    //console.log(!this.state.currentHighlight?null:this.state.currentHighlight);
    const currentHighlight = !this.state.currentHighlight?null:this.state.currentHighlight;
    const currentHighlightLocation = !currentHighlight?null:currentHighlight.location;
    const geneInfoPrep = !this.state.sequence?null:this.state.sequence.split('').map((letter,i)=>{
    let highlightClasses = [];
    let highlightLocation = null;
      if(currentHighlight&&i>=currentHighlightLocation&&i<currentHighlightLocation+currentHighlight.length){
        highlightClasses.push('current-highlight');
        highlightClasses.push(currentHighlight.name);
        highlightLocation = currentHighlight.location;
      }
     
      let isStartSelect = false;
      let isStopSelect = false;
      if(highlightKeys&&highlightKeys.length>0){
        for(let y=0;y<highlightKeys.length;y++){
          let key = highlightKeys[y];
          let currentHighlight = this.state.highlights[key];
          let start = currentHighlight.location;
          let stop = start+currentHighlight.length;
          if(i>=start&&i<stop){
            if(!highlightClasses.includes(key)){
              highlightClasses.push(key);
            }

            if(key.includes('potentialStart')){
              isStartSelect = true;
            }
            if(key.includes('potentialStop')){
              isStopSelect = true;
            }
            highlightLocation = start;
          }
        }
      }
      
      return <div  className={highlightClasses.join(' ')+' single-letter'} data-highlight-location={highlightLocation} onClick={isStartSelect?this.selectStartCodon.bind(this):isStopSelect?this.selectStopCodon.bind(this):null} >{letter}</div>;
    });
    const targetList = !this.state.targets?null:this.state.targets.map((target)=>{
      return <div className={"single-target "+(!currentHighlightLocation?'disabled':currentHighlightLocation)} onClick={!currentHighlightLocation?null:this.pickCutSite.bind(this,target)} onMouseEnter={this.highlightString.bind(this,target.distal+target.proximal+target.pam,'rgb(255, 255, 97)',null)} onMouseLeave={this.clearHighlight.bind(this)}>
        <div>{target.distal+target.proximal+target.pam}</div>
        <div><span>Efficiency: </span>{!target.score?'-':target.score}</div>
        <div><span>Strand: </span>{target.strand}</div>
        <div><span>Off Targets: </span>{target.offtarget}</div>
      </div>;
    });

    const pamBoxReadingFrames = () => {
      if(!this.state.highlights.cutsite){
        return;
      }
      let start = parseInt(JSON.parse(JSON.stringify(this.state.highlights.start.location)));
      let cutsite = parseInt(this.state.highlights.cutsite.location);
      let string = [];
      let frameI = Math.abs((cutsite - start) % 3)+1;
      let distal = '';
      let proximal = '';
      let pam = '';
      if(this.state.isoFormStrand=='-'){
        distal = this.state.isoFormSequence.substr(cutsite+3+this.state.targets[0].proximal.length,this.state.targets[0].distal.length);
        proximal = this.state.isoFormSequence.substr(cutsite+3,this.state.targets[0].proximal.length);
        pam = this.state.isoFormSequence.substr(cutsite,3);
        console.log('distal',distal);
        console.log('proximal',proximal);
        console.log('pam',pam);
        //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        
        for(let i=0;i<pam.length;i++){
          string.push(<div style={{backgroundColor:'#93E593'}}>{pam[i]}<sub>{frameI}</sub></div>);
          start = start-1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        string.push(<div>{' '}</div>);
        for(let i=0;i<proximal.length;i++){
          string.push(<div>{proximal[i]}<sub>{frameI}</sub></div>);
          start = start-1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        for(let i=0;i<distal.length;i++){
          string.push(<div>{distal[i]}<sub>{frameI}</sub></div>);
          start = start-1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        
        //let string = !this.state.targets?null:this.state.targets[0].distal+this.state.targets[0].proximal+' '+(!this.state.targets?null:this.state.targets[0].pam);
      } else {
        distal = this.state.targets[0].distal.split('');
        proximal = this.state.targets[0].proximal.split('');
        pam = this.state.targets[0].pam.split('');
  
        //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        for(let i=0;i<distal.length;i++){
          string.push(<div>{distal[i]}<sub>{frameI}</sub></div>);
          start = start+1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        for(let i=0;i<this.state.targets[0].proximal.length;i++){
          string.push(<div>{proximal[i]}<sub>{frameI}</sub></div>);
          start = start+1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        string.push(<div>{' '}</div>);
        for(let i=0;i<this.state.targets[0].pam.length;i++){
          string.push(<div style={{backgroundColor:'#93E593'}}>{pam[i]}<sub>{frameI}</sub></div>);
          start = start+1;
          frameI = Math.abs((cutsite - start) % 3)+1;
          //console.log(cutsite,' ',start,Math.abs(cutsite - start)%3,((cutsite - start) % 3),frameI);
        }
        //let string = !this.state.targets?null:this.state.targets[0].distal+this.state.targets[0].proximal+' '+(!this.state.targets?null:this.state.targets[0].pam);
      }
      
      return <div className="pam-string">{string}</div>;
    }

    const pamBox = <div className="pam-wrapper">
       <h3>Amino Acid Chart</h3>
       <div>Target: {pamBoxReadingFrames()}</div>
       <div><form onSubmit={this.mutatePam.bind(this)}><input name="newPam" type="text" /><input type="submit" value="mutate"/></form></div>
       <h4>2nd Letter</h4>
       <div className="amino-table">
        <div><h4>1st<br/>Letter</h4></div>
        <div className="chart">
          <div className="header"><div className="cell">U</div><div className="cell">C</div><div className="cell">A</div><div className="cell">G</div></div>
          <div className="row">
            <div className="cell">U</div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">UUU</div><div className="mutation">UUC</div></div>
                <div className="cell-right">Phe</div>
              </div>
              <div className="cell-box">
                <div><div className="mutation">UUA</div><div className="mutation">UUG</div></div>
                <div className="cell-right">Leu</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">UCU</div><div className="mutation">UCC</div><div className="mutation">UCA</div><div className="mutation">UCG</div></div>
                <div className="cell-right">Ser</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">UAU</div><div className="mutation">UAC</div></div>
                <div className="cell-right">Tyr</div>
              </div>
              <div className="cell-box">
              <div><div className="mutation">UAU</div><div className="mutation">UAC</div></div>
                <div className="cell-right stop">Stop<br/>Stop</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">UGU</div><div className="mutation">UGC</div></div>
                <div className="cell-right">Cys</div>
              </div>
              <div className="cell-box">
              <div><div className="mutation">UGA</div><div className="mutation">UGG</div></div>
                <div className="cell-right stop">Stop<br/>Stop</div>
              </div>
            </div>
            <div className="cell key">
              <div>U</div>
              <div>C</div>
              <div>A</div>
              <div>G</div>
            </div>
          </div>
          <div className="row">
            <div className="cell">C</div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">CUU</div><div className="mutation">CUC</div><div className="mutation">CUA</div><div className="mutation">CUG</div></div>
                <div className="cell-right">Leu</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">CCU</div><div className="mutation">CCC</div><div className="mutation">CCA</div><div className="mutation">CCG</div></div>
                <div className="cell-right">Pro</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">CAU</div><div className="mutation">CAC</div></div>
                <div className="cell-right">His</div>
              </div>
              <div className="cell-box">
                <div><div className="mutation">CAA</div><div className="mutation">CAG</div></div>
                <div className="cell-right">Gln</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">CGU</div><div className="mutation">CGC</div><div className="mutation">CGA</div><div className="mutation">CGG</div></div>
                <div className="cell-right">Arg</div>
              </div>
            </div>
            <div className="cell key">
              <div>U</div>
              <div>C</div>
              <div>A</div>
              <div>G</div>
            </div>
          </div>
          <div className="row">
            <div className="cell">A</div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">AUU</div><div className="mutation">AUC</div><div className="mutation">AUA</div></div>
                <div className="cell-right">lle</div>
              </div>
              <div className="cell-box">
                <div><div className="mutation">AUG</div></div>
                <div className="cell-right met">Met</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">ACU</div><div className="mutation">ACC</div><div className="mutation">ACA</div><div className="mutation">ACG</div></div>
                <div className="cell-right">Thr</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">AAU</div><div className="mutation">AAC</div></div>
                <div className="cell-right">Asn</div>
              </div>
              <div className="cell-box">
              <div><div className="mutation">AAA</div><div className="mutation">AAG</div></div>
                <div className="cell-right">Lys</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">AGU</div><div className="mutation">AGC</div></div>
                <div className="cell-right">Ser</div>
              </div>
              <div className="cell-box">
              <div><div className="mutation">AGA</div><div className="mutation">AGG</div></div>
                <div className="cell-right">Arg</div>
              </div>
            </div>
            <div className="cell key">
              <div>U</div>
              <div>C</div>
              <div>A</div>
              <div>G</div>
            </div>
          </div>
          <div className="row">
            <div className="cell">G</div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">GUU</div><div className="mutation">GUC</div><div className="mutation">GUA</div><div className="mutation">GUG</div></div>
                <div className="cell-right">Val</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">GCU</div><div className="mutation">GCC</div><div className="mutation">GCA</div><div className="mutation">GCG</div></div>
                <div className="cell-right">Ala</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
                <div><div className="mutation">GAU</div><div className="mutation">GAC</div></div>
                <div className="cell-right">Asp</div>
              </div>
              <div className="cell-box">
              <div><div className="mutation">GAA</div><div className="mutation">GAG</div></div>
                <div className="cell-right">Glu</div>
              </div>
            </div>
            <div className="cell">
              <div className="cell-box">
              <div><div className="mutation">GGU</div><div className="mutation">GGC</div><div className="mutation">GGA</div><div className="mutation">GGG</div></div>
                <div className="cell-right">Gly</div>
              </div>
            </div>
            <div className="cell key">
              <div>U</div>
              <div>C</div>
              <div>A</div>
              <div>G</div>
            </div>
          </div>
        </div>
        <div><h4>3rd<br/>Letter</h4></div>
       </div>
    </div>;

    const HomologyList = () => {
      console.log("homology menu: ", this.state.primers);
      if(!this.state.primers){
        return;
      }
      let primerKeys = Object.keys(this.state.primers);
      //console.log('primer keys',primerKeys);
      let primerHTML = primerKeys.map((key)=>{
        let primerOptions = this.state.primers[key];

        console.log("key: ", key)

        let primerLabelName = ""
        if (key == "hom5") {
          primerLabelName = "Homology 5";
        } else if (key == "hom3") {
          primerLabelName = "Homology 3";
        } else if (key == "seq5") {
          primerLabelName = "Sequence 5";
        } else if (key == "seq3") {
          primerLabelName = "Sequence 3";
        } else {
          primerLabelName = "";
          console.log("primer label name didn't get set");
        }
        console.log("Primer Label Name: ", primerLabelName)

        if(this.state.selectedArms&&this.state.selectedArms[key]){
          let primerSingle = this.state.selectedArms[key];

          return <div><div className="homology-label">{primerLabelName}</div>
            <div className="single-target" onMouseDown={this.selectHomologyArm.bind(this,primerSingle,key)} onMouseLeave={this.clearHighlight.bind(this)}>
            <div >{primerSingle[7]}</div>
            <div ><div>Tm: </div><div>{primerSingle[3]}</div></div>
            <div ><div>GC%: </div><div>{primerSingle[4]}</div></div> 
            <div ><div>Any (Self Complementarity): </div><div>{primerSingle[5]}</div></div>
            <div ><div>3' (Self Complementarity): </div><div>{primerSingle[6]}</div></div>
          </div></div>;
        } else {
          return <div><div className="homology-label">{primerLabelName}</div>{primerOptions.map((primerSingle)=>{
            return <div className="single-target" onMouseEnter={this.highlightString.bind(this,primerSingle[7],'rgba(86, 64, 155,0.3)','homology')} onMouseDown={this.selectHomologyArm.bind(this,primerSingle,key)} onMouseLeave={this.clearHighlight.bind(this)}>
            <div >{primerSingle[7]}</div>
            <div ><div>Tm: </div><div>{primerSingle[3]}</div></div>
            <div ><div>GC%: </div><div>{primerSingle[4]}</div></div> 
            <div ><div>Any (Self Complementarity): </div><div>{primerSingle[5]}</div></div>
            <div ><div>3' (Self Complementarity): </div><div>{primerSingle[6]}</div></div>
          </div>})}</div>;
        }
      });
      return <div>{primerHTML}</div>;
    }

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
      const plasmidOptions = ["N terminal SSPB and mCherry tag","N terminal EGFP and SSPB tag with Extended Linker","C terminal mCherry and SSPB tag","C terminal EGFP and SSPB tag with Extended Linker","C terminal EGFP and SSPB tag","C terminal mDendra2 and SSPB tag","C terminal mScarlett and SSPB tag","N terminal EGFP and SSPB tag","N terminal mDendra2 and SSPB tag","N terminal mScarlett and SSPB tag"];
      let htmlOptions = [];
      for(let i=-1;i<plasmidOptions.length;i++){
        if(i===-1){
          htmlOptions.push(<option default>Choose A Template</option>)
        } else {
          const terminal = this.state.terminal;
          console.log(terminal+' terminal',plasmidOptions[i].toLowerCase(),plasmidOptions[i].includes(terminal+' terminal'));
          if(plasmidOptions[i].toLowerCase().includes(terminal+' terminal')){
            htmlOptions.push(<option key={i} value={plasmidOptions[i]}>{plasmidOptions[i]}</option>)
          }
        }
      }
      
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
    <div className="App" onClick={this.closeAllMenus.bind(this)}>
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
            {/* This is for mutate pam, currently not needed */}
            {/* <div className={(this.state.menu==3?'active':'')+' menu-icon'} data-menu="3" >
              <div className="menu-image-wrapper" style={{pointerEvents:this.state.screen>2?'':'none'}} onClick={this.changeMenus.bind(this)} data-menu="3" alt="sidebar3"><img src={sidebar4} alt="sidebar3"/></div>
              <label onClick={this.changeScreens.bind(this)} data-screen="3">Mutate Pam</label>
              {this.state.screen<3?null:<div className="pam-box" style={{display:!this.state.mutatePam?'none':'flex'}}>{pamBox}</div>}
            </div>             */}
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
              <form className="search-form" onSubmit={this.searchForGene.bind(this)} ><label>Search for a gene by name</label><input type="text" name="geneName" /><input type="submit" value="Search"/></form>
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
        <div>Cabernard Lab</div>
        <div>Sound Development Company</div>
        <div>GPL3 License</div>
        <div>API Docs</div>
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
