# Backend Refactor Design Document

## Project: CrisprBuildr - New Backend Architecture

**Version:** 1.0  
**Date:** October 20, 2025  
**Author:** Development Team  
**Purpose:** Comprehensive design document for the next developer to complete the backend refactor

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Overview](#current-architecture-overview)
3. [Database Schema](#database-schema)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Data Flow & Processing Pipeline](#data-flow--processing-pipeline)
7. [API Endpoints (Planned)](#api-endpoints-planned)
8. [Services Layer](#services-layer)
9. [Jobs & Background Processing](#jobs--background-processing)
10. [External Dependencies](#external-dependencies)
11. [Incomplete Features](#incomplete-features)
12. [Development Priorities](#development-priorities)
13. [Testing Strategy](#testing-strategy)
14. [Deployment Considerations](#deployment-considerations)
15. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Executive Summary

CrisprBuildr is a bioinformatics tool for designing CRISPR constructs for Drosophila melanogaster (fruit fly) gene editing. The new backend in the `/server` folder is a Node.js/Express application that:

- Ingests gene data from FlyBase
- Processes isoform information and sequences
- Identifies optimal CRISPR guide targets using external tools
- Designs primers for homology-directed repair (HDR)
- Provides a RESTful API for the frontend React application

**Current Status:** ~40% complete. Core data ingestion jobs are functional, but API layer and business logic need completion.

---

## Current Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│  React Client   │
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server │
│   (Port 3000)   │
│                 │
│  ┌───────────┐  │
│  │  Routes   │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼──────┐ │
│  │Controllers│ │
│  └─────┬──────┘ │
│        │        │
│  ┌─────▼──────┐ │
│  │ Services   │ │
│  └─────┬──────┘ │
└────────┼────────┘
         │
         ▼
┌─────────────────┐
│  MySQL Database │
│  (Port 3306)    │
└─────────────────┘

┌──────────────────┐
│ Background Jobs  │
│  - Gene Loader   │
│  - Isoform Load  │
│  - Target Finder │
│  - Primer Design │
└──────────────────┘
```

### Directory Structure

```
server/
├── src/
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   ├── config/
│   │   └── index.js            # Environment config
│   ├── db/
│   │   ├── db.js               # MySQL connection pool
│   │   └── CrisprBuildr.session.sql  # Schema definitions
│   ├── routes/
│   │   ├── index.js            # Route aggregator
│   │   └── api.js              # API routes (minimal)
│   ├── controllers/
│   │   └── controller.js       # Request handlers (mostly stubs)
│   ├── services/
│   │   ├── geneService.js      # Gene business logic
│   │   ├── isoformService.js   # Isoform logic (stub)
│   │   ├── targetService.js    # Target logic (stub)
│   │   └── ingestionService.js # Data ingestion (stub)
│   ├── jobs/
│   │   ├── loadGeneInfo.js     # Loads genes from TSV
│   │   ├── loadIsoFormInfo.js  # Fetches isoforms from FlyBase API
│   │   ├── loadTargetInfo.js   # Identifies CRISPR targets
│   │   └── loadPrimerInfo.js   # Designs primers (incomplete)
│   └── utils/
│       ├── errorHandler.js     # Global error handling
│       ├── targetHandler.js    # Target search via Playwright
│       ├── homologyUtils.js    # Primer design via Playwright
│       └── utils.js            # General utilities
├── tests/                      # Jest unit tests
├── other_tests/                # Manual test scripts
├── checkpoint.json             # Job resume state
├── failed.json                 # Failed job tracking
├── package.json
└── babel.config.js
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│  GeneInfo   │
│─────────────│
│ FBgnID (PK) │─┐
│ GeneName    │ │
└─────────────┘ │
                │
                │ 1:N
                │
         ┌──────▼────────┐
         │ IsoformInfo   │
         │───────────────│
         │ FBppID (PK)   │─┐
         │ FBgnID (FK)   │ │
         │ IsoformName   │ │
         │ GeneSequence  │ │
         │ Strand        │ │
         │ LocStart      │ │
         │ LocEnd        │ │
         │ LocDesc       │ │
         │ UpStreamSeq   │ │
         │ DownStreamSeq │ │
         │ Region        │ │
         └───────────────┘ │
                           │
                           │ 1:N
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    │                      │                      │
┌───▼────────────┐  ┌──────▼──────────┐  ┌───────▼──────┐
│GuideTargetInfo │  │   PrimerInfo    │  │TerminalType  │
│────────────────│  │─────────────────│  │──────────────│
│GuideTargetID(PK│  │ PrimerID (PK)   │  │TerminalTypeID│
│FBppID (FK)     │  │ FBppID (FK)     │  │ TerminalName │
│TerminalTypeID─────│ TerminalTypeID──┼──│ (N/C)        │
│TargetSequence  │  │ HomologyTypeID──┼─►│              │
│OffTarget       │  │ PrimerSequence  │  └──────────────┘
│ Distal         │  │ Tm              │
│ Proximal       │  │ GCPercent       │  ┌──────────────┐
│ Pam            │  │ AnyValue        │  │ HomologyType │
│ Strand         │  │ ThreePrime      │  │──────────────│
│ Label          │  └─────────────────┘  │HomologyTypeID│
│EfficiencyScore │                       │HomologyType  │
└────────────────┘                       └──────────────┘
```

### Table Descriptions

#### **GeneInfo**
Stores basic gene information from FlyBase.

| Column   | Type         | Description                |
|----------|--------------|----------------------------|
| FBgnID   | VARCHAR(50)  | FlyBase gene ID (PK)       |
| GeneName | VARCHAR(255) | Gene symbol/name           |

**Source:** `fb_synonyms_January24.tsv` (FlyBase data dump)

#### **IsoformInfo**
Stores protein isoform data and sequences for each gene.

| Column              | Type         | Description                           |
|---------------------|--------------|---------------------------------------|
| FBppID              | VARCHAR(50)  | FlyBase protein ID (PK)               |
| FBgnID              | VARCHAR(50)  | Parent gene (FK to GeneInfo)          |
| IsoformName         | VARCHAR(255) | Isoform designation (e.g., Hsp70Bc-PA)|
| GeneSequence        | TEXT         | CDS nucleotide sequence               |
| Strand              | CHAR(1)      | + or - strand                         |
| LocStart            | INT          | Genomic start position                |
| LocEnd              | INT          | Genomic end position                  |
| LocDesc             | VARCHAR(255) | Chromosome/scaffold (e.g., "3L")      |
| UpStreamSequence    | TEXT         | 2kb upstream of CDS                   |
| DownStreamSequence  | TEXT         | 2kb downstream of CDS                 |
| Region              | VARCHAR(255) | Always "CDS" currently                |

**Source:** FlyBase REST API (`https://api.flybase.org/api/1.0/sequence`)

#### **TerminalType**
Lookup table for N-terminal vs C-terminal targeting.

| Column         | Type        | Description     |
|----------------|-------------|-----------------|
| TerminalTypeID | INT         | 1=N, 2=C (PK)   |
| TerminalName   | VARCHAR(10) | "N" or "C"      |

#### **GuideTargetInfo**
CRISPR guide RNA target sites identified for each isoform.

| Column          | Type         | Description                              |
|-----------------|--------------|------------------------------------------|
| GuideTargetID   | INT          | Auto-increment PK                        |
| FBppID          | VARCHAR(50)  | Target isoform (FK)                      |
| TerminalTypeID  | INT          | N or C terminal (FK)                     |
| TargetSequence  | TEXT         | 23bp target (distal + proximal + distal) |
| OffTarget       | INT          | Number of off-target hits                |
| Distal          | TEXT         | Distal targeting sequence                |
| Proximal        | TEXT         | Proximal targeting sequence              |
| Pam             | TEXT         | PAM sequence (NGG)                       |
| Strand          | CHAR(1)      | + or - strand                            |
| Label           | VARCHAR(50)  | Target label from web tool               |
| EfficiencyScore | DECIMAL      | Predicted cutting efficiency (TODO)      |

**Source:** Brown University FlyC RISPR Target Finder (`http://targetfinder.flycrispr.neuro.brown.edu/`)

#### **HomologyType**
Lookup table for homology arm types.

| Column         | Type         | Description                    |
|----------------|--------------|--------------------------------|
| HomologyTypeID | VARCHAR(10)  | PK (e.g., "5HOM", "5SEQ")      |
| HomologyType   | VARCHAR(100) | Description                    |

Expected values:
- `5HOM`: 5' Homology arm
- `5SEQ`: 5' Sequence
- `3SEQ`: 3' Sequence  
- `3HOM`: 3' Homology arm

#### **PrimerInfo**
PCR primers designed for each isoform and terminal.

| Column         | Type         | Description                        |
|----------------|--------------|----------------------------------- |
| PrimerID       | INT          | Auto-increment PK                  |
| FBppID         | VARCHAR(50)  | Target isoform (FK)                |
| TerminalTypeID | INT          | N or C terminal (FK)               |
| HomologyTypeID | VARCHAR(10)  | Which homology section (FK)        |
| PrimerSequence | TEXT         | Primer nucleotide sequence         |
| Tm             | DECIMAL(5,2) | Melting temperature (°C)           |
| GCPercent      | DECIMAL(5,2) | GC content percentage              |
| AnyValue       | VARCHAR(50)  | Any-complementarity score          |
| ThreePrime     | VARCHAR(50)  | 3' complementarity score           |

**Source:** Primer3 web interface (`https://primer3.ut.ee/`)

---

## Technology Stack

### Core Technologies

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.1.0
- **Database:** MySQL 8.0+
- **ORM/Query:** mysql2 (connection pool, promise-based)
- **Testing:** Jest 29.7.0 with Babel
- **Automation:** Playwright 1.55.1 (Chromium browser automation)

### Key Dependencies

```json
{
  "dependencies": {
    "cors": "^2.8.5",          // CORS middleware
    "dotenv": "^17.2.2",       // Environment variables
    "express": "^5.1.0",       // Web framework
    "morgan": "^1.10.1",       // HTTP request logger
    "mysql2": "^3.14.4",       // MySQL client
    "node-fetch": "^3.3.2",    // HTTP client for FlyBase API
    "playwright": "^1.55.1",   // Browser automation
    "p-limit": "^3.1.0"        // Concurrency control (used in jobs)
  },
  "devDependencies": {
    "@babel/core": "^7.28.4",
    "@babel/preset-env": "^7.28.3",
    "babel-jest": "^29.7.0",
    "jest": "^29.7.0",
    "nodemon": "^3.1.10"       // Development auto-reload
  }
}
```

### Environment Configuration

File: `server/.env`

```bash
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=crisprbuildr
DB_PORT=3306
```

---

## Project Structure

### Application Entry Points

#### **`src/server.js`**
- Server bootstrap
- Loads Express app
- Starts HTTP listener
- Handles unhandled promise rejections

#### **`src/app.js`**
- Express app configuration
- Middleware setup (CORS, JSON parsing, Morgan logging)
- Database connection validation on startup
- Route mounting
- Global error handler

### Configuration Layer

#### **`src/config/index.js`**
Centralized configuration management using environment variables with sensible defaults.

### Database Layer

#### **`src/db/db.js`**
MySQL connection pool using `mysql2/promise`:
- Connection limit: 10
- Automatic connection management
- Promise-based query interface

### Routes Layer

#### **`src/routes/index.js`**
Main route aggregator. Currently mounts:
- `/api` routes

#### **`src/routes/api.js`**
API endpoint definitions. Currently only has:
- `GET /api/gene/:name` - Fetch gene by name or FBgnID

**TODO:** Add remaining endpoints (see API Endpoints section)

### Controllers Layer

#### **`src/controllers/controller.js`**
Request handlers that:
1. Extract request parameters
2. Call appropriate service methods
3. Return JSON responses
4. Pass errors to error handler middleware

**Current Status:** Only `getGene()` is implemented. Others are stubs.

### Services Layer

Business logic layer that interacts with the database.

#### **`src/services/geneService.js`**
- `getGene(input)`: Fetch gene by name or FBgnID
  - Supports both FBgn IDs and gene symbols
  - Returns gene with FBgnID and GeneName
  - TODO: Attach isoforms

#### **`src/services/isoformService.js`**
Empty stub - needs implementation

#### **`src/services/targetService.js`**
Empty stub - needs implementation

#### **`src/services/ingestionService.js`**
Empty stub - could centralize job logic

### Jobs Layer

Standalone scripts for data ingestion. These are NOT part of the web server - they run separately to populate the database.

#### **`src/jobs/loadGeneInfo.js`**
Loads gene data from TSV file.

**Source:** `fb_synonyms_January24.tsv` (FlyBase gene nomenclature)

**Process:**
1. Reads TSV file (skips 5 header lines)
2. Filters for Drosophila melanogaster genes (FBgn IDs, organism "Dmel")
3. Inserts into `GeneInfo` table
4. Handles duplicates silently

**Run:** `node src/jobs/loadGeneInfo.js`

#### **`src/jobs/loadIsoFormInfo.js`**
Two-phase isoform data collection.

**Phase 1: Load CDS metadata**
- Function: `loadCDS(startFrom)`
- Fetches isoform list from FlyBase API for each gene
- Parses location, strand, coordinates from description
- Inserts into `IsoformInfo` (without sequences initially)

**Phase 2: Update sequences**
- Function: `updateUpAndDownstream(startFrom)`  
- Fetches full sequences (CDS + 2kb flanking) from FlyBase API
- Updates `GeneSequence`, `UpStreamSequence`, `DownStreamSequence`
- Includes checkpoint/resume capability
- Rate limited to 500ms between requests

**Run:**
```bash
# Load all isoform metadata
node src/jobs/loadIsoFormInfo.js

# Or resume from specific gene/isoform
# Edit the file to call loadCDS('FBgn0000123') or updateUpAndDownstream('FBpp0123456')
```

**Key Functions:**
- `getAllGenes()`: Fetch all genes from database
- `getAllIsoforms()`: Fetch all isoforms from database
- `fetchIsoformResponse(geneId)`: Call FlyBase API
- `parseIsoform(result, geneId)`: Extract metadata from API response
- `insertIsoform(isoform)`: Insert/update database
- `updateSingleIsoform(isoform)`: Fetch and store sequences

#### **`src/jobs/loadTargetInfo.js`**
Identifies CRISPR guide targets using web scraping.

**Process:**
1. Get all isoforms with sequences from database
2. For each isoform:
   - Compute start/stop codon locations
   - Extract 100bp windows around start (N-terminal) and stop (C-terminal)
   - Submit to Brown FlyC RISPR Target Finder via Playwright
   - Parse target results
   - Save to `GuideTargetInfo` table
3. Checkpoint progress every N isoforms
4. Track failed isoforms for retry

**Features:**
- Concurrent processing (configurable limit)
- Checkpoint/resume capability (`checkpoint.json`)
- Failed job tracking (`failed.json`)
- Automatic retry of failed jobs

**Run:** `node src/jobs/loadTargetInfo.js`

**Key Functions:**
- `computeStartStopCodons(fullSeq, isoformSeq)`: Find codon positions
- `searchForTargets(targetArea)`: Web scraping via Playwright
- `targetForSingleIsoform(isoform)`: Process one isoform
- `loadGuideTargetInfo()`: Main orchestrator
- `saveCheckpoint(index)`: Save progress
- `loadCheckpoint()`: Resume from checkpoint

#### **`src/jobs/loadPrimerInfo.js`**
Designs PCR primers for homology arms (INCOMPLETE).

**Intended Process:**
1. Get all isoforms from database
2. For each isoform and terminal (N/C):
   - Extract 4 primer regions (5'HOM, 5'SEQ, 3'SEQ, 3'HOM)
   - Submit to Primer3 web tool via Playwright
   - Parse primer results
   - Save to `PrimerInfo` table

**Status:** Skeleton only, needs completion

**TODO:**
- Implement `savePrimer()` function
- Complete `primerForSingleIsoform()` logic
- Add checkpoint/resume functionality
- Error handling and retry logic

### Utils Layer

#### **`src/utils/targetHandler.js`**
Browser automation for target identification.

**Key Functions:**
- `searchForTargets(targetArea)`: 
  - Launches Chromium browser via Playwright
  - Navigates to Brown FlyC RISPR site
  - Submits sequence for analysis
  - Parses result table
  - Returns array of target objects with distal, proximal, PAM, strand, label
  - Handles timeouts and errors gracefully

**Dependencies:** Playwright (Chromium)

#### **`src/utils/homologyUtils.js`**
Browser automation for primer design.

**Key Functions:**
- `searchForPrimers(primerArea)`:
  - Validates 4 required primer sections
  - Calls `processPrimerType()` for each section
  - Returns structured primer data
  
- `processPrimerType(browser, primerSequence, primerType)`:
  - Navigates to Primer3 website
  - Submits sequence
  - Selects appropriate primer side (left/right)
  - Extracts results via `extractPrimerText()` and `parsePrimersFromText()`
  
- `parsePrimersFromText(primersText)`:
  - Regex-based parsing of Primer3 output
  - Extracts primer sequence, Tm, GC%, complementarity scores

**Dependencies:** Playwright (Chromium)

#### **`src/utils/errorHandler.js`**
Global Express error handling middleware (assumed present but not reviewed).

#### **`src/utils/utils.js`**
General utility functions (needs review - possibly duplicates functions in targetHandler.js).

---

## Data Flow & Processing Pipeline

### Overall Data Ingestion Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                     DATA INGESTION FLOW                       │
└──────────────────────────────────────────────────────────────┘

1. Gene Loading (loadGeneInfo.js)
   ┌─────────────────────┐
   │ fb_synonyms.tsv     │
   │ (FlyBase Data Dump) │
   └──────────┬──────────┘
              │
              ▼
   ┌──────────────────────┐
   │  Parse TSV File      │
   │  Filter Dmel genes   │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │   Insert GeneInfo    │
   │   - FBgnID           │
   │   - GeneName         │
   └──────────────────────┘

2. Isoform Loading (loadIsoFormInfo.js)
   ┌──────────────────────┐
   │ FlyBase REST API     │
   │ /sequence/id/{gene}  │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Fetch CDS metadata   │
   │ for each gene        │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Insert IsoformInfo   │
   │ (metadata only)      │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Fetch sequences with │
   │ 2kb flanking regions │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Update IsoformInfo   │
   │ with sequences       │
   └──────────────────────┘

3. Target Finding (loadTargetInfo.js)
   ┌──────────────────────┐
   │ IsoformInfo (with    │
   │ sequences)           │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Compute start/stop   │
   │ codon positions      │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Extract 100bp windows│
   │ around codons        │
   └──────────┬───────────┘
              │
              ▼
   ┌─────────────────────────┐
   │ Brown FlyC RISPR Tool   │
   │ (via Playwright)        │
   │ - N-terminal targets    │
   │ - C-terminal targets    │
   └──────────┬──────────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Parse target results │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │Insert GuideTargetInfo│
   │ - Target sequence    │
   │ - Off-targets        │
   │ - PAM, strand, label │
   └──────────────────────┘

4. Primer Design (loadPrimerInfo.js) - INCOMPLETE
   ┌──────────────────────┐
   │ IsoformInfo +        │
   │ GuideTargetInfo      │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Extract 4 homology   │
   │ regions per terminal │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Primer3 Web Tool     │
   │ (via Playwright)     │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Parse primer results │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Insert PrimerInfo    │
   │ - Sequence           │
   │ - Tm, GC%            │
   │ - Complementarity    │
   └──────────────────────┘
```

### API Request Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ HTTP GET /api/gene/Hsp70
     ▼
┌────────────────┐
│   Express      │
│   Middleware   │
│  (CORS, JSON)  │
└────┬───────────┘
     │
     ▼
┌────────────────┐
│  API Routes    │
│ /api/gene/:name│
└────┬───────────┘
     │
     ▼
┌────────────────┐
│  Controller    │
│  getGene()     │
└────┬───────────┘
     │
     ▼
┌────────────────┐
│  Gene Service  │
│  getGene()     │
└────┬───────────┘
     │ SQL Query
     ▼
┌────────────────┐
│  MySQL DB      │
│  GeneInfo tbl  │
└────┬───────────┘
     │ Result
     ▼
┌────────────────┐
│  Controller    │
│  res.json()    │
└────┬───────────┘
     │
     ▼
┌──────────┐
│  Client  │
│  Receives│
│  JSON    │
└──────────┘
```

---

## API Endpoints (Planned)

### Current Implementation

Only one endpoint is currently functional:

#### **GET /api/gene/:name**
Fetch gene information by name or FBgnID.

**Parameters:**
- `name` (path): Gene symbol (e.g., "Hsp70") or FBgnID (e.g., "FBgn0001234")

**Response:**
```json
{
  "FBgnID": "FBgn0001234",
  "GeneName": "Hsp70"
}
```

**TODO:** Add isoforms array to response

---

### Planned Endpoints

#### **GET /api/gene/:name/isoforms**
Get all isoforms for a gene.

**Response:**
```json
{
  "FBgnID": "FBgn0001234",
  "GeneName": "Hsp70",
  "isoforms": [
    {
      "FBppID": "FBpp0071716",
      "IsoformName": "Hsp70-PA",
      "GeneSequence": "ATGCC...",
      "Strand": "+",
      "LocStart": 1000000,
      "LocEnd": 1005000,
      "LocDesc": "3L"
    }
  ]
}
```

#### **GET /api/isoform/:fbppid**
Get detailed isoform information including sequences.

**Response:**
```json
{
  "FBppID": "FBpp0071716",
  "FBgnID": "FBgn0001234",
  "IsoformName": "Hsp70-PA",
  "GeneSequence": "ATGCC...",
  "Strand": "+",
  "LocStart": 1000000,
  "LocEnd": 1005000,
  "LocDesc": "3L",
  "UpStreamSequence": "ATCG...",
  "DownStreamSequence": "GCTA...",
  "Region": "CDS"
}
```

#### **GET /api/isoform/:fbppid/targets**
Get all CRISPR targets for an isoform.

**Query Parameters:**
- `terminal` (optional): Filter by terminal type ("N" or "C")

**Response:**
```json
{
  "FBppID": "FBpp0071716",
  "targets": {
    "N-terminal": [
      {
        "GuideTargetID": 1,
        "TargetSequence": "ATCGATCGATCGATCGATCGATC",
        "OffTarget": 0,
        "Distal": "ATCGATC",
        "Proximal": "GATCGAT",
        "Pam": "CGG",
        "Strand": "+",
        "Label": "Target 1",
        "EfficiencyScore": null
      }
    ],
    "C-terminal": [
      // Similar structure
    ]
  }
}
```

#### **GET /api/isoform/:fbppid/primers**
Get all primers designed for an isoform.

**Query Parameters:**
- `terminal` (optional): Filter by terminal type ("N" or "C")
- `homologyType` (optional): Filter by homology type ("5HOM", "5SEQ", "3SEQ", "3HOM")

**Response:**
```json
{
  "FBppID": "FBpp0071716",
  "primers": {
    "N-terminal": {
      "5HOM": [
        {
          "PrimerID": 1,
          "PrimerSequence": "ATCGATCGATCG",
          "Tm": 62.5,
          "GCPercent": 50.0,
          "AnyValue": "3.5",
          "ThreePrime": "1.2"
        }
      ],
      "5SEQ": [...],
      "3SEQ": [...],
      "3HOM": [...]
    },
    "C-terminal": {
      // Similar structure
    }
  }
}
```

#### **POST /api/search**
Search for genes by name (fuzzy search).

**Request Body:**
```json
{
  "query": "hsp",
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "FBgnID": "FBgn0001234",
      "GeneName": "Hsp70"
    },
    {
      "FBgnID": "FBgn0005678",
      "GeneName": "Hsp90"
    }
  ]
}
```

---

## Services Layer

### Implementation Status

#### **geneService.js** ✓ Partial
**Implemented:**
- `getGene(input)` - Get gene by name or FBgnID

**TODO:**
- Add `getGeneWithIsoforms(input)` - Return gene with all isoforms
- Add `searchGenes(query, limit)` - Fuzzy search for genes
- Add `getAllGenes(offset, limit)` - Paginated gene list

#### **isoformService.js** ✗ Not Started
**TODO:**
- `getIsoform(fbppid)` - Get isoform details
- `getIsoformsByGene(fbgnid)` - Get all isoforms for a gene
- `getIsoformWithSequences(fbppid)` - Get isoform with full sequences

#### **targetService.js** ✗ Not Started
**TODO:**
- `getTargetsByIsoform(fbppid, terminal)` - Get targets for isoform
- `getTargetById(guideTargetId)` - Get single target
- `updateEfficiencyScore(guideTargetId, score)` - Update efficiency score

#### **primerService.js** ✗ Not Created
**TODO:**
- Create this service
- `getPrimersByIsoform(fbppid, terminal, homologyType)` - Get primers
- `getPrimerById(primerId)` - Get single primer

---

## Jobs & Background Processing

### Execution Order

The jobs should be run in this specific order since each depends on data from the previous:

1. **loadGeneInfo.js** - Populate GeneInfo table
2. **loadIsoFormInfo.js (Phase 1)** - Fetch isoform metadata
3. **loadIsoFormInfo.js (Phase 2)** - Fetch sequences
4. **loadTargetInfo.js** - Identify CRISPR targets
5. **loadPrimerInfo.js** - Design primers (INCOMPLETE)

### Checkpoint System

The job system includes checkpoint/resume functionality:

**Files:**
- `checkpoint.json` - Stores progress (current index)
- `failed.json` - Tracks failed items for retry

**Usage:**
```javascript
// In loadTargetInfo.js
const checkpoint = loadCheckpoint(); // Resume from last position
// ... process items ...
saveCheckpoint(currentIndex); // Save progress
```

### Performance Considerations

- **Concurrency:** Jobs use `p-limit` to control concurrent operations
- **Rate Limiting:** FlyBase API calls are rate-limited (500ms delay)
- **Browser Reuse:** Playwright browsers are reused when possible
- **Batch Processing:** Items are processed in configurable batches

---

## External Dependencies

### FlyBase API

**Base URL:** `https://api.flybase.org/api/1.0`

**Endpoints Used:**
- `/sequence/id/{FBgnID}/CDS` - Get isoform list for gene
- `/sequence/region/dmel/{location}?strand={strand}&padding=2000` - Get sequences with flanking regions

**Rate Limits:** None documented, but we implement 500ms delay between requests

**Authentication:** Not required

**Documentation:** https://flybase.org/api

### Brown University FlyCRISPR Target Finder

**URL:** `http://targetfinder.flycrispr.neuro.brown.edu/`

**Type:** Web-based tool (scraped via Playwright)

**Input:** DNA sequence (up to ~100bp)

**Output:** List of potential CRISPR targets with:
- Target sequence (23bp)
- PAM sequence
- Strand
- Off-target count
- Position label

**Limitations:**
- Not an API - requires browser automation
- Can be slow or unreliable
- May change without notice

### Primer3 Web Interface

**URL:** `https://primer3.ut.ee/`

**Type:** Web-based tool (scraped via Playwright)

**Input:** DNA sequence with primer design parameters

**Output:** Designed primers with:
- Sequence
- Melting temperature (Tm)
- GC content
- Complementarity scores

**Limitations:**
- Not an API - requires browser automation
- Sequence length limits
- May timeout on complex requests

---

## Incomplete Features

### High Priority

1. **Complete loadPrimerInfo.js Job**
   - Implement `savePrimer()` function
   - Complete `primerForSingleIsoform()` logic
   - Add error handling and retry
   - Test end-to-end

2. **Implement Remaining Services**
   - Complete isoformService.js
   - Complete targetService.js
   - Create primerService.js

3. **Implement API Endpoints**
   - Add isoform endpoints
   - Add target endpoints
   - Add primer endpoints
   - Add search endpoint

4. **Efficiency Score Calculation**
   - Research efficiency prediction algorithms
   - Implement scoring logic
   - Update GuideTargetInfo.EfficiencyScore column

### Medium Priority

5. **Error Handling Improvements**
   - Better error messages
   - Logging system (Winston or similar)
   - Error tracking/monitoring

6. **Input Validation**
   - Add request validation middleware (e.g., express-validator)
   - Validate FBgn/FBpp ID formats
   - Sanitize user inputs

7. **Response Pagination**
   - Implement pagination for large result sets
   - Add cursor-based pagination for isoforms

### Low Priority

8. **API Documentation**
   - Generate Swagger/OpenAPI spec
   - Add API documentation endpoint
   - Create developer guide

9. **Performance Optimization**
   - Add database indexing strategy
   - Implement caching (Redis)
   - Optimize complex queries

10. **Testing Coverage**
    - Increase unit test coverage
    - Add integration tests
    - Add end-to-end tests

---

## Development Priorities

### Phase 1: Core API (2-3 weeks)

**Goal:** Make the backend functional for basic use cases

1. Complete isoformService.js
   - Implement all CRUD operations
   - Test with existing database data

2. Add isoform API endpoints
   - GET /api/isoform/:fbppid
   - GET /api/gene/:name/isoforms
   - Test with frontend integration

3. Complete targetService.js
   - Implement target retrieval logic
   - Add filtering by terminal type

4. Add target API endpoints
   - GET /api/isoform/:fbppid/targets
   - Test target display in UI

### Phase 2: Primer System (2-3 weeks)

**Goal:** Complete the primer design pipeline

1. Finish loadPrimerInfo.js job
   - Debug Playwright automation
   - Implement database insertion
   - Run full ingestion test

2. Create primerService.js
   - Implement primer retrieval
   - Add filtering logic

3. Add primer API endpoints
   - GET /api/isoform/:fbppid/primers
   - Test primer display in UI

4. Integrate with frontend
   - Update Redux actions/reducers
   - Add primer UI components

### Phase 3: Enhancement (1-2 weeks)

**Goal:** Improve UX and reliability

1. Add search functionality
   - Implement gene search service
   - Add POST /api/search endpoint
   - Add autocomplete UI

2. Add efficiency scoring
   - Research scoring algorithms
   - Implement calculation
   - Display in UI

3. Error handling improvements
   - Add comprehensive logging
   - Better error responses
   - User-friendly messages

### Phase 4: Testing & Documentation (1 week)

**Goal:** Ensure reliability and maintainability

1. Increase test coverage
   - Unit tests for services
   - Integration tests for API
   - E2E tests for critical paths

2. API documentation
   - Generate OpenAPI spec
   - Add inline documentation
   - Create developer guide

3. Deployment preparation
   - Environment configuration
   - Docker setup
   - CI/CD pipeline

---

## Testing Strategy

### Current Testing Setup

**Framework:** Jest 29.7.0 with Babel transpilation

**Configuration:** `babel.config.js` for ES6+ support

**Test Location:** `/server/tests/` and `/server/other_tests/`

### Existing Tests

1. `tests/db.test.js` - Database connection tests
2. `tests/geneService.test.js` - Gene service tests
3. `tests/server.test.js` - Server integration tests
4. `tests/targetJob.test.js` - Target job tests
5. `other_tests/*` - Manual test scripts

### Test Coverage Goals

| Component | Current | Target |
|-----------|---------|--------|
| Services  | 20%     | 80%    |
| Controllers | 10%   | 70%    |
| Jobs      | 30%     | 60%    |
| Utils     | 40%     | 80%    |

### Testing Approach

#### Unit Tests
Test individual functions in isolation.

**Example:**
```javascript
// tests/geneService.test.js
describe('geneService', () => {
  describe('getGene', () => {
    it('should return gene by FBgnID', async () => {
      const result = await geneService.getGene('FBgn0001234');
      expect(result.FBgnID).toBe('FBgn0001234');
    });
    
    it('should return gene by name', async () => {
      const result = await geneService.getGene('Hsp70');
      expect(result.GeneName).toBe('Hsp70');
    });
  });
});
```

#### Integration Tests
Test API endpoints with real database.

**Example:**
```javascript
// tests/api.test.js
describe('GET /api/gene/:name', () => {
  it('should return gene data', async () => {
    const response = await request(app)
      .get('/api/gene/Hsp70')
      .expect(200);
    
    expect(response.body).toHaveProperty('FBgnID');
    expect(response.body).toHaveProperty('GeneName');
  });
});
```

#### E2E Tests
Test complete workflows (may require separate environment).

**Run Tests:**
```bash
cd server
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch        # Watch mode
```

---

## Deployment Considerations

### Environment Requirements

**Production Server:**
- Node.js 18+ runtime
- MySQL 8.0+ database
- 2GB+ RAM (for Playwright browser automation)
- 20GB+ disk space (database can grow large)

**Database:**
- MySQL with InnoDB engine
- UTF-8mb4 character set
- Sufficient storage for sequences (estimate 10-50GB+)

### Environment Variables

Create `.env` file with production values:

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-mysql-host
DB_USER=your-db-user
DB_PASS=your-secure-password
DB_NAME=crisprbuildr
DB_PORT=3306

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Database Setup

```sql
-- Create database
CREATE DATABASE crisprbuildr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Run schema from CrisprBuildr.session.sql
-- Create tables: GeneInfo, TerminalType, IsoformInfo, GuideTargetInfo, HomologyType, PrimerInfo

-- Create indexes for performance
CREATE INDEX idx_genename ON GeneInfo(GeneName);
CREATE INDEX idx_isoform_gene ON IsoformInfo(FBgnID);
CREATE INDEX idx_target_isoform ON GuideTargetInfo(FBppID);
CREATE INDEX idx_primer_isoform ON PrimerInfo(FBppID);
```

### Deployment Steps

1. **Setup Server**
   ```bash
   # Install Node.js 18+
   # Install MySQL 8.0+
   # Install Playwright dependencies
   npx playwright install-deps chromium
   ```

2. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd server
   npm install
   npm install --production  # For production
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Setup Database**
   ```bash
   # Create database and tables
   mysql -u root -p < src/db/schema.sql
   ```

5. **Run Data Ingestion Jobs (One-time)**
   ```bash
   node src/jobs/loadGeneInfo.js
   node src/jobs/loadIsoFormInfo.js
   node src/jobs/loadTargetInfo.js
   node src/jobs/loadPrimerInfo.js  # When complete
   ```

6. **Start Server**
   ```bash
   npm start  # Production
   # Or with process manager
   pm2 start src/server.js --name crisprbuildr-server
   ```

### Docker Deployment (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

# Install Playwright dependencies
RUN apk add --no-cache chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_USER=crisprbuildr
      - DB_PASS=secure_password
      - DB_NAME=crisprbuildr
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=crisprbuildr
      - MYSQL_USER=crisprbuildr
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

### Monitoring

**Recommended Tools:**
- **PM2** for process management
- **Morgan** for HTTP logging (already integrated)
- **Winston** for application logging (to be added)
- **Prometheus + Grafana** for metrics
- **Sentry** for error tracking

---

## Known Issues & Technical Debt

### Critical Issues

1. **Missing Database Export**
   - No way to share the database link since Google Drive requires authentication
   - **Solution:** Export schema as SQL file, commit to repo

2. **Incomplete Primer Job**
   - `loadPrimerInfo.js` is not functional
   - Missing implementation details
   - **Impact:** Primer features completely unavailable

3. **No API Authentication**
   - All endpoints are public
   - No rate limiting implemented
   - **Risk:** Potential abuse

### High Priority Technical Debt

4. **Duplicated Code**
   - `getAllIsoforms()` appears in multiple files
   - `computeStartStopCodons()` has unclear ownership
   - **Solution:** Consolidate in utils.js

5. **Hard-coded Values**
   - Concurrency limits hard-coded in jobs
   - Timeout values not configurable
   - **Solution:** Move to config file

6. **Limited Error Handling**
   - Many try-catch blocks just log errors
   - No structured error responses
   - **Solution:** Implement error handler middleware properly

7. **No Input Validation**
   - API endpoints don't validate inputs
   - SQL injection risk (mitigated by parameterized queries)
   - **Solution:** Add express-validator

### Medium Priority Technical Debt

8. **Playwright Browser Management**
   - Browsers launched for each request
   - No connection pooling
   - **Impact:** High resource usage, slow performance

9. **No Caching**
   - Every request hits database
   - Repetitive FlyBase API calls
   - **Solution:** Implement Redis caching

10. **Test Coverage Gaps**
    - Many files have no tests
    - Integration tests missing
    - **Impact:** Hard to refactor confidently

11. **Magic Numbers**
    - `2000` (flanking region size)
    - `50` (target window size)
    - `100` (target window size)
    - **Solution:** Define as named constants

### Low Priority Technical Debt

12. **No API Versioning**
    - Endpoints not versioned
    - **Risk:** Breaking changes impact clients

13. **Mixed Async Patterns**
    - Some functions use async/await
    - Some use promises
    - **Solution:** Standardize on async/await

14. **Console.log Debugging**
    - Many console.log statements in code
    - **Solution:** Replace with proper logging

15. **No Database Migrations**
    - Schema changes require manual SQL
    - **Solution:** Implement migration system (Knex.js or similar)

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start               # Start production server
npm test                # Run tests
npm test -- --coverage  # Run tests with coverage

# Jobs (Data Ingestion)
node src/jobs/loadGeneInfo.js
node src/jobs/loadIsoFormInfo.js
node src/jobs/loadTargetInfo.js
node src/jobs/loadPrimerInfo.js

# Database
mysql -u root -p crisprbuildr < src/db/schema.sql  # Import schema
mysqldump -u root -p crisprbuildr > backup.sql     # Backup database
```

### Useful Database Queries

```sql
-- Check data counts
SELECT COUNT(*) FROM GeneInfo;
SELECT COUNT(*) FROM IsoformInfo;
SELECT COUNT(*) FROM GuideTargetInfo;
SELECT COUNT(*) FROM PrimerInfo;

-- Check for incomplete isoforms (no sequences)
SELECT COUNT(*) FROM IsoformInfo 
WHERE GeneSequence IS NULL OR GeneSequence = '';

-- Get isoforms with targets
SELECT i.FBppID, i.IsoformName, COUNT(g.GuideTargetID) as target_count
FROM IsoformInfo i
LEFT JOIN GuideTargetInfo g ON i.FBppID = g.FBppID
GROUP BY i.FBppID, i.IsoformName
ORDER BY target_count DESC
LIMIT 10;

-- Find genes with most isoforms
SELECT g.GeneName, COUNT(i.FBppID) as isoform_count
FROM GeneInfo g
JOIN IsoformInfo i ON g.FBgnID = i.FBgnID
GROUP BY g.GeneName
ORDER BY isoform_count DESC
LIMIT 10;
```

### Resources

**FlyBase:**
- Website: https://flybase.org
- API Docs: https://flybase.org/api
- Gene Nomenclature: https://flybase.org/wiki/FlyBase:Gene_Nomenclature

**CRISPR Design:**
- FlyCRISPR Tool: http://targetfinder.flycrispr.neuro.brown.edu/
- CRISPR Design Guidelines: https://www.addgene.org/crispr/guide/

**Primer Design:**
- Primer3: https://primer3.ut.ee/
- Primer3 Manual: https://primer3.org/manual.html

**Technologies:**
- Express.js: https://expressjs.com/
- MySQL2: https://github.com/sidorares/node-mysql2
- Playwright: https://playwright.dev/
- Jest: https://jestjs.io/

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-20 | Development Team | Initial comprehensive design document |

---

**End of Document**
