import React from 'react';

const CustomDataScreen = ({ onAddCustomData }) => {
  return (
    <div className="screen screen-custom">
      <div className="custom-data-content">
        <h2>Enter Custom Data</h2>
        <p>Enter your own gene sequence and other information</p>
        
        <form onSubmit={onAddCustomData}>
          <div className="form-group">
            <label htmlFor="geneName">Gene Name</label>
            <input
              type="text"
              id="geneName"
              name="geneName"
              placeholder="Gene name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="geneIsoform">Isoform</label>
            <input
              type="text"
              id="geneIsoform"
              name="geneIsoform"
              placeholder="Isoform"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="geneData">Gene Sequence</label>
            <textarea
              id="geneData"
              name="geneData"
              placeholder="Paste your gene sequence here"
              rows="10"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="startCodon">Start Codon Position (optional)</label>
            <input
              type="number"
              id="startCodon"
              name="startCodon"
              placeholder="Start codon position"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stopCodon">Stop Codon Position (optional)</label>
            <input
              type="number"
              id="stopCodon"
              name="stopCodon"
              placeholder="Stop codon position"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="geneTerminal">Terminal</label>
            <select id="geneTerminal" name="geneTerminal">
              <option value="n">N Terminal</option>
              <option value="c">C Terminal</option>
            </select>
          </div>
          
          <button type="submit" className="custom-data-submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomDataScreen;
