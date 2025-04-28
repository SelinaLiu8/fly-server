import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';
import { setPopup, setOperation, setIsoform } from './appStateSlicer';

export const searchForGeneAsync = createAsyncThunk(
    'appState/searchForGene',
    async (geneName, {dispatch}) => {
      const response = await fetch(`${urlBase}/api/?type=search&gene=${geneName}`);
      const data = await response.json();

      console.log("search data:", data);

      const isoforms = JSON.parse(data.results.isoforms);

      dispatch(setPopup({
        question: 'Choose your operation',
        choices: [
          { label: 'Tag', value: 'tag' },
          { label: 'Delete', value: 'delete' },
        ],
        onSelect: (operation) => {
          dispatch(setOperation(operation.value));
          dispatch(setPopup({
            question: 'Choose your isoform',
            choices: isoforms.map((isoform) => ({
              label: isoform,
              value: isoform,
            })),
            onSelect: (isoform) => dispatch(setIsoform(isoform)),
          }));
        },
      }));

      return data;
    }
);