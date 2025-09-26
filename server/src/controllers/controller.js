const geneService = require('../services/geneService');

async function getGene(req, res, next) {
    try {
      const geneName = req.params.name;
      const geneData = await geneService.searchForGene(geneName);
      res.json(geneData);
    } catch (err) {
      next(err);
    }
}

async function getIsoform(req, res, next) {
    try {

    } catch (err) {
        next(err);
    }
}

async function getTargets(req, res, next) {
    try {

    } catch (err) {
        next(err);
    }
}

async function getTargetEfficiencies(req, res, next) {
    try {

    } catch (err) {
        next(err);
    }
}

async function getOligos(req, res, next) {
    try {

    } catch (err) {
        next(err);
    }
}

async function getPrimers(req, res, next) {
    try {

    } catch (err) {
        next(err);
    }
}