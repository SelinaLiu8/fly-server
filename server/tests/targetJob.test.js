const { computeStartStopCodons, searchForTargets } = require('../src/utils/targetHandler');
const {
    getAllIsoforms,
    saveTargets,
    targetForSingleIsoform,
    loadGuideTargetInfo,
  } = require('../src/jobs/loadTargetInfo');
const { chromium } = require('playwright');
const db = require('../src/db/db')

jest.mock('../src/db/db', () => ({
    query: jest.fn(),
}));

jest.mock('../src/utils/targetHandler', () => ({
    computeStartStopCodons: jest.fn(),
    searchForTargets: jest.fn(),
}));
  
beforeEach(() => {
    jest.clearAllMocks();
});

describe('Database + Target job helper functions', () => {
    // test('getAllIsoforms should query the IsoformInfo table and return rows', async () => {
    //     db.query.mockResolvedValueOnce([[{ FBppID: 'FBpp001' }, { FBppID: 'FBpp002' }]]);

  
    //     const result = await getAllIsoforms();
    
    //     expect(db.query).toHaveBeenCalledWith('SELECT * FROM IsoformInfo');
    //     expect(result).toEqual(fakeIsoforms);
    // });
  
    test('saveTargets should insert the expected values into the Targets table', async () => {
        db.query.mockResolvedValue();
    
        const results = [
            {
            offtarget: 2,
            distal: 'AAA',
            proximal: 'TTT',
            pam: 'NGG',
            strand: '+',
            label: 'target1',
            },
        ];
  
        await saveTargets('FBpp001', 'n', results);
    
        expect(db.query).toHaveBeenCalledTimes(1);
        const [queryText, params] = db.query.mock.calls[0];
    
        expect(queryText).toMatch(/INSERT INTO Targets/);
        expect(params[0]).toBe('FBpp001');
        expect(params[1]).toBe(1); // TerminalTypeID for 'n'
        expect(params[2]).toBe('AAATTTAAA'); // TargetSequence = distal + proximal + distal
        expect(params[3]).toBe(2);
        expect(params.slice(-5)).toEqual(['AAA', 'TTT', 'NGG', '+', 'target1']);
    });
  
    test('targetForSingleIsoform should call searchForTargets twice and saveTargets twice', async () => {
        const isoform = {
            FBppID: 'FBpp001',
            GeneSequence: 'ATGAAATTTGGG',
            UpStreamSequence: 'AAAAA',
            DownStreamSequence: 'CCCCC',
        };
  
        computeStartStopCodons.mockReturnValue({
            startIndex: 5,
            stopIndex: 10,
        });
  
        searchForTargets.mockResolvedValue({
            results: [
            { distal: 'AAA', proximal: 'TTT', pam: 'NGG', strand: '+', label: 'x' },
            ],
        });
  
        db.query.mockResolvedValue();
    
        await targetForSingleIsoform(isoform);
    
        expect(searchForTargets).toHaveBeenCalledTimes(2);
        expect(db.query).toHaveBeenCalledTimes(2);
    });
  
    test('targetForSingleIsoform should skip if computeStartStopCodons returns null', async () => {
        const isoform = {
            FBppID: 'FBpp001',
            GeneSequence: 'ATGAAATTTGGG',
            UpStreamSequence: 'AAAAA',
            DownStreamSequence: 'CCCCC',
        };
  
        computeStartStopCodons.mockReturnValue(null);
    
        await targetForSingleIsoform(isoform);
    
        expect(searchForTargets).not.toHaveBeenCalled();
        expect(db.query).not.toHaveBeenCalled();
    });
});