import React from 'react';

const SearchScreen = ({ onSearchForGene }) => {
  return (
    <div className="screen screen-1">
      <div className="search-content">
        <h2>Search for a Gene</h2>
        <p>Enter a gene name or Flybase ID to search for a gene</p>
        
        <form onSubmit={onSearchForGene}>
          <div className="search-input-container">
            <input
              type="text"
              name="geneName"
              placeholder="Gene name or Flybase ID"
              required
            />
            <button type="submit" className="search-button btn">
              Search
            </button>
          </div>
        </form>
        
        <div className="search-examples">
          <p>Examples: Notch, N, FBgn0004647</p>
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
