import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchForGeneAsync } from '../features/appState/appStateThunks.js'
import {
    setGene,
    setSequnce,
    setOperation,
    setIsoform,
    setScreen,
  } from '../features/appState/appStateSlicer.js';
import '../App.css'

const SearchScreen = () => {

  const gene = useSelector((state) => state.appState.gene);
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.appState.loading);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (gene.trim() !== '') {
      dispatch(searchForGeneAsync(gene));
    }
    console.log("gene", gene)
  };

  return (
    <div className="screen screen-1">
      <div className='search-content'>
        <h2 className='search-title'>Search for a Gene</h2>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="geneName"
            placeholder="Gene name or Flybase ID"
            value={gene}
            onChange={(e) => dispatch(setGene(e.target.value))}
            required
            className="search-input"
          />
          <button
            type="submit"
            className="search-button btn"
            disabled={loading}
          >
            Search
          </button>
        </form>
        <div className="search-examples">
          <p>Examples: Notch, N, FBgn0004647</p>
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
