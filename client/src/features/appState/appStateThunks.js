import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform, setMenu, setScreen, setHighlights, clearPopup, setTerminal, setTargetsReady, setOligos } from './appStateSlicer';
import { computeIsoformHighlights, computeTargetAreaLocations, calculatePrimerSections} from '../../utilities/Utilities';

export const searchForGeneAsync = createAsyncThunk(
    'appState/searchForGene',
    async (geneName, {dispatch, getState}) => {
      const response = await fetch(`${urlBase}/api/?type=search&gene=${geneName}`);
      const data = await response.json();

      console.log("search data:", data);

      const isoforms = JSON.parse(data.results.isoforms);
      console.log("isoform selections: ", isoforms)

      dispatch(setPopup({
        type: 'question',
        question: 'Choose your operation',
        choices: [
          { label: 'Tag', value: 'tag' },
          { label: 'Delete', value: 'delete' },
        ],
        onSelect: (operationObj) => {
          dispatch(setOperation(operationObj.value));
          dispatch(setPopup({
            type: 'question',
            question: 'Choose your isoform',
            choices: isoforms.map((iso) => ({
              label: iso,
              value: iso,
            })),
            onSelect: (isoformObj) => {
                dispatch(setIsoform(isoformObj));
                dispatch(setMenu(2));
                dispatch(setScreen(2));
                dispatch(fetchSequenceAsync(isoformObj.value)).then(() => {
                    const highlights = computeIsoformHighlights(getState().appState.sequenceData.fullSequence, getState().appState.sequenceData.isoformSequence);
                    dispatch(setHighlights(highlights));
                });
                const operation = getState().appState.operation;
                console.log("operation: ", operation);
                if (operation === "tag") {
                    dispatch(setPopup({
                        type: 'question',
                        question: 'Choose your terminal',
                        choices: [
                            { label: "N Terminal", value: 'n'},
                            { label: "C Terminal", value: 'c'},
                        ],
                        onSelect: (terminalObj) => {
                            dispatch(setTerminal(terminalObj.value));
                            dispatch(clearPopup());
                        }
                    }))
                } else if (operation === "delete") {
                    dispatch(setTerminal('both'))
                    dispatch(clearPopup());
                }
            }
          }));
        },
      }));

      return data;
    }
);

export const fetchSequenceAsync = createAsyncThunk(
    'appState/fetchSequence',
    async (isoform, { dispatch }) => {
    
        const response = await fetch(`${urlBase}/api/?type=isoform&isoform=${isoform}`);
        const data = await response.json();
    
        return {
            isoform: data.isoForm,
            isoformSequence: data.sequence,
            fullSequence: data.upstream + data.sequence + data.downstream,
            strand: data.strand,
            locStart: data.locStart,
            locEnd: data.locEnd,
            locDesc: data.locDesc,
            upstream: data.upstream,
            downstream: data.downstream
        };
    }
);

export const searchForTargetsAsync = createAsyncThunk(
    'appState/searchForTargets',
    async (_, { dispatch, getState, rejectWithValue }) => {
      try {
        console.log("searchForTargetsAsync got called")
        const state = getState().appState;
        const highlights = state.highlights;
        const terminal = state.terminal;
        const sequence = state.sequenceData.fullSequence;

        console.log("sequence in target:", sequence);

        const organizedTargets = { n: [], c: [] };
  
        if (terminal === 'n' || terminal === 'c') {
            const targetArea = computeTargetAreaLocations(sequence, terminal, highlights);
            console.log("targetfetch url:", `${urlBase}/api?type=targetSearch&targetArea=${targetArea}`);
            const response = await fetch(`${urlBase}/api?type=targetSearch&targetArea=${targetArea}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const parsedTargets = (data.results || []).map((target, index) => ({
                label: target.label || `Target ${index + 1}`, // fallback just in case
                offtarget: parseInt(target.offtarget, 10),    // convert to integer
                distal: target.distal,
                proximal: target.proximal,
                pam: target.pam,
                strand: target.strand,
                targetSequence: `${target.distal}${target.proximal}`
            }));
            organizedTargets[terminal] = parsedTargets;
        } else if (terminal === 'both') {
            const NtargetArea = computeTargetAreaLocations(sequence, 'n', highlights);
            const CtargetArea = computeTargetAreaLocations(sequence, 'c', highlights);
    
            const [responseN, responseC] = await Promise.all([
                fetch(`${urlBase}/api?type=targetSearch&targetArea=${NtargetArea}`),
                fetch(`${urlBase}/api?type=targetSearch&targetArea=${CtargetArea}`)
            ]);
    
            if (!responseN.ok || !responseC.ok) {
                throw new Error(`HTTP error fetching both terminals`);
            }
    
            const dataN = await responseN.json();
            const dataC = await responseC.json();

            const parsedTargetsN = (dataN.results || []).map((target, index) => ({
                label: target.label || `Target ${index + 1}`, // fallback just in case
                offtarget: parseInt(target.offtarget, 10),    // convert to integer
                distal: target.distal,
                proximal: target.proximal,
                pam: target.pam,
                strand: target.strand,
                targetSequence: `${target.distal}${target.proximal}`
            }));

            const parsedTargetsC = (dataC.results || []).map((target, index) => ({
                label: target.label || `Target ${index + 1}`, // fallback just in case
                offtarget: parseInt(target.offtarget, 10),    // convert to integer
                distal: target.distal,
                proximal: target.proximal,
                pam: target.pam,
                strand: target.strand,
                targetSequence: `${target.distal}${target.proximal}`
            }));
    
            organizedTargets.n = parsedTargetsN;
            organizedTargets.c = parsedTargetsC;
        } else {
            throw new Error(`Invalid terminal value: ${terminal}`);
        }

        // console.log("targets: ", organizedTargets);

        const allTargetSequences = [
            ...organizedTargets.n.map(t => t.targetSequence),
            ...organizedTargets.c.map(t => t.targetSequence)
        ];
    
        const efficiencyData = await dispatch(getTargetEfficiencyAsync(allTargetSequences)).unwrap();
    
        console.log("Efficiency Data:", efficiencyData);

        organizedTargets.n = organizedTargets.n.map(target => ({
            ...target,
            score: efficiencyData[target.targetSequence] || null
        }));
    
        organizedTargets.c = organizedTargets.c.map(target => ({
            ...target,
            score: efficiencyData[target.targetSequence] || null
        }));

        console.log("targets after efficiency score: ", organizedTargets);
        return organizedTargets;
      } catch (error) {
        console.error('Error searching for targets:', error);
        return rejectWithValue(error.message);
      }
    }
);

export const getTargetEfficiencyAsync = createAsyncThunk(
    'appState/getTargetEfficiency',
    async (targetSequences, { rejectWithValue }) => {
      try {
        const response = await fetch(`${urlBase}/api?type=targetEfficiency&targets=${encodeURIComponent(targetSequences.join('\n'))}`);
        console.log("score URL:", `${urlBase}/api?type=targetEfficiency&targets=${encodeURIComponent(targetSequences.join('\n'))}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error getting target efficiency:', error);
        return rejectWithValue(error.message);
      }
    }
);

export const searchForHomologyArms = createAsyncThunk(
    'appState/searchForHomologyArms',
    async (_, { dispatch, getState, rejectWithValue }) => {
      try {
        const state = getState().appState;
        const terminal = state.terminal;
        const highlights = state.highlights;
        const sequence = state.sequenceData.fullSequence;
  
        const organizedPrimers = { n: {}, c: {} };
  
        const fetchHomologyData = async (term) => {
          const primerSectionAreas = calculatePrimerSections(sequence, term, highlights);
          const primerSectionsString = btoa(JSON.stringify(primerSectionAreas));
          const response = await fetch(`${urlBase}/api/?type=primers&primerSections=${primerSectionsString}`);
  
          console.log("homology url:", `${urlBase}/api/?type=primers&primerSections=${primerSectionsString}`);
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          console.log("homology data:", data);
          return data;
        };
  
        if (terminal === 'n' || terminal === 'c') {
          const data = await fetchHomologyData(terminal);
          organizedPrimers[terminal] = data;
        } else if (terminal === 'both') {
          const [dataN, dataC] = await Promise.all([
            fetchHomologyData('n'),
            fetchHomologyData('c')
          ]);
          organizedPrimers.n = dataN;
          organizedPrimers.c = dataC;
        } else {
          throw new Error(`Invalid terminal value: ${terminal}`);
        }
        
        console.log("organized primerlist:",organizedPrimers);
        return organizedPrimers;
      } catch (error) {
        console.error('Error searching for homology arms:', error);
        return rejectWithValue(error.message);
      }
    }
);  

export const retrieveOligoInfo = createAsyncThunk(
    'appState/retrieveOligoInfo',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState().appState;
            const selectedTargets = state.selectedTargets;
            const terminal = state.terminal;
    
            const oligoResults = {};
    
            if (terminal === 'n' || terminal === 'c') {
            const target = selectedTargets[terminal];
            const urlTargetString = target.targetSequence + target.pam;
            const response = await fetch(`${urlBase}/api/?type=oligos&target=${urlTargetString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            oligoResults[terminal] = {
                sense: data.sense,
                antisense: data.antisense
            };
            } else if (terminal === 'both') {
            for (const t of ['n', 'c']) {
                const target = selectedTargets[t];
                const urlTargetString = target.targetSequence + target.pam;
                const response = await fetch(`${urlBase}/api/?type=oligos&target=${urlTargetString}`);
                if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                oligoResults[t] = {
                sense: data.sense,
                antisense: data.antisense
                };
            }
            }
    
            return oligoResults; // structure: { n: {sense, antisense}, c: {sense, antisense} }
        } catch (error) {
            console.error('Error retrieving oligo infos:', error);
            return rejectWithValue(error.message);
        }
    }
);