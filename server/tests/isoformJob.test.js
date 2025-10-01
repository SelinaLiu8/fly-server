// __tests__/loadIsoFormInfo.test.js
const db = require('../src/db/db');
const {
    getAllGenes,
    fetchIsoformResponse,
    parseIsoform,
    insertIsoform,
    loadCDS,
    updateSingleIsoform
} = require("../src/jobs/loadIsoFormInfo");

jest.mock('../src/db/db', () => ({
  query: jest.fn(),
}));

jest.mock("../src/db/db", () => ({
    query: jest.fn(),
    execute: jest.fn(),
  }));
  
global.fetch = jest.fn();
  
describe("Isoform job functions", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // --- 1. getAllGenes ---
    test("getAllGenes returns rows from DB", async () => {
      db.query.mockResolvedValue([[{ FBgnID: "FBgn0000001" }]]);
      const result = await getAllGenes();
      expect(result).toEqual([{ FBgnID: "FBgn0000001" }]);
      expect(db.query).toHaveBeenCalledWith("SELECT FBgnID FROM GeneInfo");
    });
  
    // --- 2. fetchCDSForGene ---
    test("fetchCDSForGene returns results when API succeeds", async () => {
      const mockResult = [{ id: "FBpp0001", description: "loc=2L:100..200", sequence: "ATGC" }];
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ resultset: { result: mockResult } }),
      });
  
      const results = await fetchIsoformResponse("FBgn0000001");
      expect(results).toEqual(mockResult);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.flybase.org/api/1.0/sequence/id/FBgn0000001/CDS"
      );
    });
  
    test("fetchCDSForGene returns [] when API fails", async () => {
      global.fetch.mockResolvedValue({ ok: false, status: 500 });
      const results = await fetchIsoformResponse("FBgn0000002");
      expect(results).toEqual([]);
    });
  
    // --- 3. parseIsoform ---
    test("parseIsoform extracts fields correctly", () => {
      const result = {
        id: "FBpp0001",
        description: "name=IsoformA; loc=2L:join(100..200)",
        sequence: "ATGC",
      };
      const isoform = parseIsoform(result, "FBgn0000001");
  
      expect(isoform).toMatchObject({
        fbppId: "FBpp0001",
        geneId: "FBgn0000001",
        sequence: "ATGC",
        strand: "+",
        locStart: 100,
        locEnd: 200,
        locDesc: "2L",
        region: "CDS",
      });
    });
  
    // --- 4. saveIsoform ---
    test("saveIsoform executes DB insert", async () => {
      const isoform = {
        fbppId: "FBpp0001",
        geneId: "FBgn0000001",
        sequence: "ATGC",
        strand: "+",
        locStart: 100,
        locEnd: 200,
        locDesc: "2L",
        upStreamSequence: "",
        downStreamSequence: "",
        region: "CDS",
      };
  
      await insertIsoform(isoform);
  
      expect(db.execute).toHaveBeenCalled();
      const [query, values] = db.execute.mock.calls[0];
      expect(values).toContain("FBpp0001");
      expect(values).toContain("FBgn0000001");
    });
  
    // --- 5. loadCDS ---
    test("loadCDS orchestrates fetching and saving", async () => {
      db.query.mockResolvedValue([[{ FBgnID: "FBgn0000001" }]]);
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          resultset: {
            result: [
              { id: "FBpp0001", description: "loc=2L:join(100..200)", sequence: "ATGC" },
            ],
          },
        }),
      });
      db.execute.mockResolvedValue();
  
      await loadCDS();
  
      expect(db.query).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
      expect(db.execute).toHaveBeenCalled();
    });


    // --- 6. updateSingleIsoform ---
    test("updateSingleIsoform updates upstream and downstream sequences", async () => {
        const isoform = {
          FBppID: "FBpp0001",
          LocDesc: "2L",
          LocStart: 100,
          LocEnd: 200,
          strand: "+",
        };
  
        // Fake sequence: long enough to slice
        const fakeSequence = "A".repeat(2000) + "MIDDLE" + "T".repeat(2000);
  
        global.fetch.mockResolvedValue({
          ok: true,
          json: async () => ({ resultset: { result: [{ sequence: fakeSequence }] } }),
        });
  
        await updateSingleIsoform(isoform);
  
        // URL correctness
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("region/dmel/2L:100..200?strand=plus&padding=2000")
        );
  
        // DB update
        expect(db.execute).toHaveBeenCalledWith(
          expect.stringContaining("UPDATE IsoformInfo"),
          [
            fakeSequence.substring(0, 2000), // upstream
            fakeSequence.substring(fakeSequence.length - 2000), // downstream
            "FBpp0001", // isoform id
          ]
        );
    });
  
    test("updateSingleIsoform throws if API fails", async () => {
        const isoform = {
          FBppID: "FBpp0002",
          LocDesc: "3R",
          LocStart: 300,
          LocEnd: 600,
          strand: "-",
        };
  
        global.fetch.mockResolvedValue({ ok: false, status: 500 });
  
        await expect(updateSingleIsoform(isoform)).rejects.toThrow("API failed for FBpp0002");
        expect(db.execute).not.toHaveBeenCalled();
    });
});

  