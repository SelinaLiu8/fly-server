const flybaseService = require('../services/flybaseService');

async function getGene(req, res, next) {
    try {
      const geneName = req.params.name;
      const geneData = await flybaseService.searchForGene(geneName);
      res.json(geneData);
    } catch (err) {
      next(err); // passes error to errorHandler
    }
}