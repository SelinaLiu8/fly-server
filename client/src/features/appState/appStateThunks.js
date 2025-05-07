import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform, setMenu, setScreen, setHighlights, clearPopup, setTerminal, setTargetsReady } from './appStateSlicer';
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
                            dispatch(searchForTargetsAsync());
                            dispatch(clearPopup());
                        }
                    }))
                } else if (operation === "delete") {
                    dispatch(setTerminal('both'))
                    dispatch(searchForTargetsAsync());
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
            const fetchN = fetch(`${urlBase}/api?type=targetSearch&targetArea=${NtargetArea}`);
            const fetchC = fetch(`${urlBase}/api?type=targetSearch&targetArea=${CtargetArea}`);
    
            const [responseN, responseC] = await Promise.all([fetchN, fetchC]);
    
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
    async (_, { dispatch, getState }) => {
        try {
            const state = getState().appState;
            const terminal = state.terminal;
            const highlights = state.highlights;
            const sequence = state.sequenceData.fullSequence;

            const organizedTargets = {};

            if (terminal === 'n' || terminal === 'c') {
                primerSectionAreas = calculatePrimerSections(sequence, terminal, highlights);
                primerSectionsString = Buffer.from(JSON.stringify(primerSectionAreas)).toString('base64');
                const response = await fetch(`$s{urlBase}/api/?type=primers&primerSections=${primerSectionsString}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
            } else if (terminal === 'both') {

            } else {
                throw new Error(`Invalid terminal value: ${terminal}`);
            }
        } catch (error) {
            console.error('Error searching for targets:', error);
            return rejectWithValue(error.message);
        }
    }
  );
  