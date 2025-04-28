import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform, setMenu, setScreen, setHighlights, clearPopup, setTerminals } from './appStateSlicer';
import { computeIsoformHighlights } from '../../components/utilities/highlightUtils';

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
                    console.log("highlights:", highlights);
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
                            dispatch(setTerminals(terminalObj.value));
                            // dispatch(searchForTargetsAsync(terminalObj.value));
                            dispatch(clearPopup());
                        }
                    }))
                } else if (operation === "delete") {
                    dispatch(setTerminals('both'))
                    // dispatch(searchForTargetsAsync('both'));
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
    async (terminal, { dispatch, getState, rejectWithValue }) => {
      try {
        // Have to use stop and start codon to determinal the api calls
        const geneSequence = getState().appState.sequenceData;
        const { sequence } = geneSequence;
        console.log("sequence:", sequence);
        console.log("terminal:", terminal)
  
        const organizedTargets = { n: [], c: [] };
  
        if (terminal === 'n' || terminal === 'c') {
            console.log("Went into the tag target search")
            const response = await fetch(`${urlBase}/api?type=targetSearch&targetArea=${encodeURIComponent(sequence)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("tag target data:", data)
            organizedTargets[terminal] = data.targets || [];
        } else if (terminal === 'both') {
            //Search both terminals
            const fetchN = fetch(`${urlBase}/api?type=targetSearch&targetArea=${encodeURIComponent(sequence)}&terminal=n`);
            const fetchC = fetch(`${urlBase}/api?type=targetSearch&targetArea=${encodeURIComponent(sequence)}&terminal=c`);
    
            const [responseN, responseC] = await Promise.all([fetchN, fetchC]);
    
            if (!responseN.ok || !responseC.ok) {
                throw new Error(`HTTP error fetching both terminals`);
            }
    
            const dataN = await responseN.json();
            const dataC = await responseC.json();
    
            organizedTargets.n = dataN.targets || [];
            organizedTargets.c = dataC.targets || [];
        } else {
            throw new Error(`Invalid terminal value: ${terminal}`);
        }

        console.log("targets: ", organizedTargets);
  
        return organizedTargets;
      } catch (error) {
        console.error('Error searching for targets:', error);
        return rejectWithValue(error.message);
      }
    }
  );

export const getTargetEfficiencyAsync = createAsyncThunk(
    'appState/getTargetEfficiency',
    async (targetList, { dispatch }) => {
        const response = await fetch(`${urlBase}/api?type=targetEfficiency&targets=${encodeURIComponent(JSON.stringify(targets))}`);
        const data = await response.json();
        return data;
    }
);