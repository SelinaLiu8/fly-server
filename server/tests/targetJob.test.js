const { computeStartStopCodons, searchForTargets } = require('../src/utils/targetHandler');
const { chromium } = require('playwright');

jest.mock('playwright'); // Mock Playwright for searchForTargets

describe('computeStartStopCodons', () => {
  test('should return correct start and stop indices', () => {
    const fullSequence = 'AAAATGCCCTTTGGGAAATAG';
    const isoformSequence = 'ATGCCCTTTGGGAAA';
    
    const result = computeStartStopCodons(fullSequence, isoformSequence);
    
    expect(result).toEqual({
        startIndex: 3,
        stopIndex: 8
    });
  });

  test('should return null if sequences are missing', () => {
    expect(computeStartStopCodons(null, 'ATG')).toBeNull();
    expect(computeStartStopCodons('AAA', null)).toBeNull();
  });

  test('should return null if sequences not found', () => {
    const fullSequence = 'AAAAGGG';
    const isoformSequence = 'TTT';
    expect(computeStartStopCodons(fullSequence, isoformSequence)).toBeNull();
  });
});

describe('searchForTargets', () => {
  let mockPage, mockBrowser, mockContext;

  beforeEach(() => {
    mockPage = {
      goto: jest.fn(),
      selectOption: jest.fn(),
      fill: jest.fn(),
      click: jest.fn(),
      waitForSelector: jest.fn(),
      $$eval: jest.fn(),
    };
    mockContext = { newPage: jest.fn(() => mockPage) };
    mockBrowser = { newContext: jest.fn(() => mockContext), close: jest.fn() };
    chromium.launch.mockResolvedValue(mockBrowser);
  });

  test('should scrape and return formatted results', async () => {
    const targetArea = 'ATGCCCTTTGGGAAATTTCCCGGGAAATGCCCTTTAAGGCCGGAATTCCGGAAATTTCCCGGGAAATGCCCTTT';

    // Mock Playwright page.$$eval responses
    mockPage.$$eval
      .mockResolvedValueOnce(['isoform1', 'isoform2']) // isoForms
      .mockResolvedValueOnce(['Exact', '1 mismatch']) // offTargets
      .mockResolvedValueOnce(['D1', 'D2']) // distals
      .mockResolvedValueOnce(['P1', 'P2']) // proximals
      .mockResolvedValueOnce(['PAM1', 'PAM2']) // pams
      .mockResolvedValueOnce(['+', '-']) // strands
      .mockResolvedValueOnce(['Label1', 'Label2']); // labels

    const result = await searchForTargets(targetArea);

    expect(result.results).toEqual([
      { offtarget: null, distal: 'D1', proximal: 'P1', pam: 'PAM1', strand: '+', label: 'Label1' },
      { offtarget: '1', distal: 'D2', proximal: 'P2', pam: 'PAM2', strand: '-', label: 'Label2' },
    ]);

    expect(result.targets).toBe(encodeURIComponent('P1D1\nP2D2'));
  });

  test('should catch errors and return undefined', async () => {
    chromium.launch.mockRejectedValueOnce(new Error('Launch failed'));
    const result = await searchForTargets('ATGCCCTTTGGG');
    expect(result).toBeUndefined();
  });
});
