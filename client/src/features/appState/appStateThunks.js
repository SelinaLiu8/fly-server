import { createAsyncThunk } from '@reduxjs/toolkit';
import { urlBase } from './appConfig';

export const searchForGeneAsync = createAsyncThunk(
    'appState/searchForGene',
    async (geneName) => {
      const response = await fetch(`${urlBase}/api/?type=search&gene=${geneName}`);
      const data = await response.json();
      return data;
    }
);