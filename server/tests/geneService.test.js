const { getGene } = require('../src/services/geneService')
const db = require('../src/db/db')

jest.mock('../src/db/db', () => ({
    query: jest.fn(),
  }));
  
  describe('getGene', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return gene data when searching by FBgnID', async () => {
      const mockGene = { FBgnID: 'FBgn12345', GeneName: 'GeneX'};
      db.query.mockResolvedValue([[mockGene]]);
  
      const result = await getGene('FBgn12345');
  
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM GeneInfo WHERE FBgnID = ?",
        ['FBgn12345']
      );
      expect(result).toEqual({
        FBgnID: 'FBgn12345',
        GeneName: 'GeneX',
      });
    });
  
    it('should return gene data when searching by gene name', async () => {
      const mockGene = { FBgnID: 'FBgn67890', GeneName: 'GeneY'};
      db.query.mockResolvedValue([[mockGene]]);
  
      const result = await getGene('GeneY');
  
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM GeneInfo WHERE GeneName = ?",
        ['GeneY']
      );
      expect(result).toEqual({
        FBgnID: 'FBgn67890',
        GeneName: 'GeneY',
      });
    });
  
    it('should return null if no gene is found', async () => {
      db.query.mockResolvedValue([[]]);
  
      const result = await getGene('FBgn00000');
  
      expect(result).toBeNull();
    });
});
  