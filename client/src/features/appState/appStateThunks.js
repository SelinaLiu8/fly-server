import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform, setMenu, setScreen, clearPopup } from './appStateSlicer';

export const searchForGeneAsync = createAsyncThunk(
    'appState/searchForGene',
    async (geneName, {dispatch}) => {
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
        onSelect: (operation) => {
          dispatch(setOperation(operation.value));
          dispatch(setPopup({
            type: 'question',
            question: 'Choose your isoform',
            choices: isoforms.map((iso) => ({
              label: iso,
              value: iso,
            })),
            onSelect: (isoform) => {
                dispatch(setIsoform(isoform));
                dispatch(setMenu(2));
                dispatch(setScreen(2));
                console.log("isoform: ", isoform);
                dispatch(fetchSequenceAsync(isoform.value));
                dispatch(clearPopup());
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

