import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform, setMenu, setScreen, clearPopup, setTerminals } from './appStateSlicer';

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
                dispatch(fetchSequenceAsync(isoformObj.value));
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
                            dispatch(setTerminals([terminalObj.value]))
                            dispatch(searchForTargetsAsync)
                            dispatch(clearPopup());
                        }
                    }))
                } else if (operation === "delete") {
                    dispatch(setTerminals(['n', 'c']))
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
        
        console.log("sequence data:", data);
    
        return {
            isoform: data.isoForm,
            sequence: data.sequence,
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
    async (geneSequence, { dispatch }) => {
        const response = await fetch(`${urlBase}/api?type=targetSearch&targetArea=${encodeURIComponent(geneSequence)}`);
        const data = await response.json();
        return data;
    }
);

export const getTargetEfficiencyAsync = createAsyncThunk(
    'appState/getTargetEfficiency',
    async (targets, { dispatch }) => {
        const response = await fetch(`${urlBase}/api?type=targetEfficiency&targets=${encodeURIComponent(JSON.stringify(targets))}`);
        const data = await response.json();
        return data;
    }
);