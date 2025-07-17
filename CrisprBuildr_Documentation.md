# CrisprBuildr Documentation (Updated 2025)

## Table of Contents
1. [System Overview](#system-overview)
2. [Server Setup & Access](#server-setup--access)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [API Endpoints](#api-endpoints)
6. [Database Structure](#database-structure)
7. [External Services Integration](#external-services-integration)
8. [Deployment Guide](#deployment-guide)
9. [Development Setup](#development-setup)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

CrisprBuildr is a web-based application for CRISPR gene editing design and analysis. The system consists of a React frontend with Redux state management and a Node.js/Express backend that integrates with multiple external bioinformatics services.

### Architecture
- **Frontend**: React 18.2.0 with Redux Toolkit for state management
- **Backend**: Node.js 20.x with Express 4.21.2
- **Database**: MySQL 3.13.0 hosted on Digital Ocean
- **Web Scraping**: Puppeteer 10.2.0 for automated data extraction
- **Deployment**: Digital Ocean Droplet

---

## Server Setup & Access

### Digital Ocean Droplet Access
```bash
ssh root@142.93.118.6
```
**Password**: `flyserver123456`

### Database Access
- **Host**: 142.93.118.6
- **Port**: 3306
- **User**: `local` (accessible from any IP address)
- **Password**: `StrongPassw0rd!`
- **Database**: `fly_cache`

### Alternative Database Connection (Root)
- **User**: `root`
- **Password**: `flyserver123456`
- **Database**: `fly_cache`

---

## Frontend Documentation

### Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | Frontend framework |
| Redux Toolkit | 2.7.0 | State management |
| React-Redux | 9.2.0 | React-Redux bindings |
| React-Scripts | 5.0.1 | Build and development tools |
| File-Saver | 2.0.5 | File download functionality |
| Buffer | 6.0.3 | Binary data handling |
| CORS | 2.8.5 | Cross-origin request handling |
| Web-Vitals | 2.1.4 | Performance monitoring |

### Project Structure
```
client/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── App.js                    # Main application component
│   ├── App.css                   # Global styles
│   ├── index.js                  # Application entry point
│   ├── components/               # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── SearchScreen.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── SequenceViewScreen.jsx
│   │   ├── SideBar.jsx
│   │   ├── SidebarContentsView.jsx
│   │   ├── GeneSequence.jsx
│   │   ├── popups/
│   │   │   ├── PrintPopUpScreen.jsx
│   │   │   ├── QuestionPopUpScreen.jsx
│   │   │   └── UploadPopUpScreen.jsx
│   │   └── sidebar_contents/
│   │       ├── TargetList.jsx
│   │       ├── HomologyList.jsx
│   │       └── DownloadList.jsx
│   ├── features/
│   │   └── appState/
│   │       ├── appConfig.js      # API configuration
│   │       ├── appStateSlicer.js # Redux state slice
│   │       └── appStateThunks.js # Async actions
│   ├── redux/
│   │   └── Store.js              # Redux store configuration
│   ├── styles/
│   │   ├── Sequence.css
│   │   └── SidebarContents.css
│   ├── utilities/
│   │   └── Utilities.js
│   └── assets/                   # Static assets
│       ├── CrisprBuildr1.0_manual.pdf
│       ├── head_logo.png
│       └── [other images]
```

### State Management (Redux Toolkit)

The application uses Redux Toolkit for centralized state management:

#### Key State Structure
```javascript
{
  appState: {
    loading: boolean,
    loadingMessage: string,
    screen: number,
    popup: {
      visible: boolean,
      type: string
    },
    gene: object,
    isoform: object,
    // ... other state properties
  }
}
```

#### Main Components

1. **App.js**: Root component managing screen routing and popup display
2. **SearchScreen.jsx**: Gene search interface
3. **SequenceViewScreen.jsx**: Main sequence analysis interface
4. **SideBar.jsx**: Navigation and tool selection
5. **GeneSequence.jsx**: Sequence visualization component

### API Integration

The frontend communicates with the backend through the configured base URL:
```javascript
// client/src/features/appState/appConfig.js
export const urlBase = 'http://142.93.118.6';
```

### Build and Deployment
```bash
# Development
npm start

# Production build
npm run build

# Testing
npm test
```

---

## Backend Documentation

### Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | JavaScript runtime |
| Express | 4.21.2 | Web framework |
| MySQL2 | 3.13.0 | Database driver |
| Puppeteer | 10.2.0 | Web scraping automation |
| Node-Fetch | 2.6.8 | HTTP requests |
| Morgan | 1.10.0 | HTTP request logging |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Cookie-Parser | 1.4.6 | Cookie parsing middleware |
| HTTP-Errors | 2.0.0 | HTTP error handling |
| Dotenv | 16.4.7 | Environment variable management |

### Project Structure
```
fly-server/
├── app.js                    # Express application setup
├── package.json              # Dependencies and scripts
├── .env.js                   # Database configuration
├── routes/
│   └── index.js              # API route definitions
├── api.js                    # Database interaction functions
├── puppeteer.js              # Web scraping functions
├── nightmareTools.js         # Legacy scraping tools
├── bin/
│   └── www                   # Server startup script
├── public/
│   └── build/                # Built React application
└── client/                   # React frontend source
```

### Database Configuration
```javascript
// .env.js
module.exports = {
    dbhost: 'http://142.93.118.6:3306/',
    dbuser: 'root',         
    dbpassword: 'flyserver123456', 
    database: 'fly_cache'
};
```

### Server Startup
```bash
# Start the server
npm start
# or
node ./bin/www
```

---

## API Endpoints

### Base URL
```
http://142.93.118.6/api
```

### Supported Methods
- **GET**: Query parameters in URL
- **POST**: JSON body parameters

### Endpoint Details

#### 1. Gene Search
- **Endpoint**: `/api?type=search&gene=<gene_name_or_id>`
- **Method**: GET
- **Description**: Searches for gene information by name or FlyBase ID
- **Function**: `getIdFromSearch()`
- **Returns**: Gene metadata and available isoforms

**Example**:
```
GET /api?type=search&gene=white
```

#### 2. Isoform Sequence Retrieval
- **Endpoint**: `/api?type=isoform&isoform=<isoform_id>`
- **Method**: GET
- **Description**: Retrieves full sequence data for a specific isoform
- **Function**: `getIsoFormSequence()`
- **Returns**: Complete gene sequence with upstream/downstream regions

**Example**:
```
GET /api?type=isoform&isoform=white-RA
```

#### 3. Target Site Search
- **Endpoint**: `/api?type=targetSearch&targetArea=<gene_sequence>`
- **Method**: GET
- **Description**: Identifies CRISPR target sites within a sequence
- **Function**: `searchForTargets()`
- **Returns**: Array of potential targets with PAM sites and off-target information

**Example**:
```
GET /api?type=targetSearch&targetArea=ATCGATCGATCG...
```

#### 4. Target Efficiency Analysis
- **Endpoint**: `/api?type=targetEfficiency&targets=<target_array>`
- **Method**: GET
- **Description**: Evaluates efficiency scores for CRISPR targets
- **Function**: `checkTargetEfficiency()`
- **Returns**: Efficiency scores for each target sequence

**Example**:
```
GET /api?type=targetEfficiency&targets=["ATCGATCGATCGATCG","GCTAGCTAGCTAGCTA"]
```

#### 5. Oligonucleotide Generation
- **Endpoint**: `/api?type=oligos&target=<target_sequence>`
- **Method**: GET
- **Description**: Generates sense and antisense oligonucleotides
- **Function**: `getOligos()`
- **Returns**: Sense and antisense oligo sequences

**Example**:
```
GET /api?type=oligos&target=ATCGATCGATCGATCG
```

#### 6. Primer Design
- **Endpoint**: `/api?type=primers`
- **Method**: GET/POST
- **Description**: Designs primers for homology arms and sequencing
- **Function**: `getPrimers()`

**GET Example** (Base64 encoded):
```
GET /api?type=primers&primerSections=<base64_encoded_data>
```

**POST Example**:
```json
POST /api
{
  "type": "primers",
  "primerSections": {
    "5' Homology": "ATCGATCG...",
    "3' Homology": "GCTAGCTA...",
    "5' Sequence": "TTAATTAA...",
    "3' Sequence": "CCGGCCGG..."
  }
}
```

#### 7. New Request Handler
- **Endpoint**: `/api?type=new`
- **Method**: GET/POST
- **Description**: Generic handler for new request types
- **Returns**: Echo of request parameters

---

## Database Structure

### Tables

#### 1. `isoforms`
Stores isoform metadata for genes.

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR | FlyBase gene ID (primary key) |
| isoforms | JSON | Array of available isoform names |

#### 2. `gene_info`
Stores detailed gene sequence information.

| Column | Type | Description |
|--------|------|-------------|
| isoForm | VARCHAR | Isoform identifier |
| geneId | VARCHAR | FlyBase gene ID |
| strand | CHAR(1) | DNA strand (+ or -) |
| locStart | INT | Genomic start position |
| locEnd | INT | Genomic end position |
| locDesc | VARCHAR | Chromosomal location description |
| upstream | TEXT | 2kb upstream sequence |
| downstream | TEXT | 2kb downstream sequence |
| sequence | TEXT | Gene coding sequence |
| name | VARCHAR | Gene name |
| url | VARCHAR | FlyBase URL |
| time | BIGINT | Last update timestamp |

### Connection Pool Configuration
```javascript
const pool = mysql.createPool({
    host: "142.93.118.6",
    port: 3306,
    user: "local",
    password: "StrongPassw0rd!",
    database: "fly_cache",
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});
```

---

## External Services Integration

### 1. FlyBase API
- **Base URL**: `https://api.flybase.org/api/1.0/`
- **Purpose**: Gene information and sequence retrieval
- **Endpoints Used**:
  - `/sequence/id/{id}/CDS` - Get coding sequences
  - `/sequence/region/dmel/{location}` - Get genomic regions

### 2. FlyBase Web Interface
- **URL**: `https://flybase.org/`
- **Method**: Web scraping with Puppeteer
- **Purpose**: Gene search and sequence extraction

### 3. TargetFinder (FlyCRISPR)
- **URL**: `http://targetfinder.flycrispr.neuro.brown.edu/`
- **Method**: Web scraping with Puppeteer
- **Purpose**: CRISPR target site identification and oligo generation

### 4. FlyRNAi CRISPR Evaluator
- **URL**: `https://www.flyrnai.org/evaluateCrispr/`
- **Method**: Web scraping with Puppeteer
- **Purpose**: Target efficiency scoring

### 5. Primer3
- **URL**: `https://primer3.ut.ee/`
- **Method**: Web scraping with Puppeteer
- **Purpose**: Primer design for homology arms and sequencing

### 6. Local Data Sources
- **File**: `fb_synonyms_January24.tsv`
- **Purpose**: Gene name and ID synonym lookup
- **Format**: Tab-separated values with FlyBase identifiers

---

## Deployment Guide

### Prerequisites
- Node.js 20.x
- MySQL database
- Digital Ocean droplet or similar server

### Server Setup
1. **Clone Repository**:
   ```bash
   git clone https://github.com/SelinaLiu8/fly-server.git
   cd fly-server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Build Frontend**:
   ```bash
   cd client && npm run build && cd ..
   ```

4. **Configure Environment**:
   Update `.env.js` with database credentials

5. **Start Server**:
   ```bash
   npm start
   ```

### Database Setup
```sql
CREATE DATABASE fly_cache;

CREATE TABLE isoforms (
    id VARCHAR(255) PRIMARY KEY,
    isoforms JSON
);

CREATE TABLE gene_info (
    isoForm VARCHAR(255),
    geneId VARCHAR(255),
    strand CHAR(1),
    locStart INT,
    locEnd INT,
    locDesc VARCHAR(255),
    upstream TEXT,
    downstream TEXT,
    sequence TEXT,
    name VARCHAR(255),
    url VARCHAR(500),
    time BIGINT
);
```

### Process Management
Consider using PM2 for production deployment:
```bash
npm install -g pm2
pm2 start bin/www --name "crisprbuildr"
pm2 save
pm2 startup
```

---

## Development Setup

### Local Development
1. **Start Backend**:
   ```bash
   npm start
   ```

2. **Start Frontend** (in separate terminal):
   ```bash
   cd client
   npm start
   ```

3. **Access Application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3000/api`

### Testing
```bash
# Backend tests
node apitest.js

# Frontend tests
cd client && npm test
```

### File Structure for Development
```
fly-server/
├── Development files
│   ├── test-api.js
│   ├── test-primer3.js
│   ├── apitest.js
│   └── dbtest.js
├── Documentation
│   ├── docs.html
│   ├── front-end.html
│   └── README.md
└── Debug files
    ├── before_submit.png
    ├── after_submit.png
    └── results_page.html
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify MySQL service is running
- Check firewall settings for port 3306
- Confirm credentials in `.env.js`

#### 2. Puppeteer Issues
- Install required dependencies:
  ```bash
  sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
  ```

#### 3. CORS Issues
- Ensure CORS is properly configured in `app.js`
- Check that the frontend is making requests to the correct API URL

#### 4. Memory Issues
- Monitor memory usage in Puppeteer functions
- Consider implementing request queuing for high traffic

### Debug Tools
- Screenshots saved during Puppeteer operations
- HTML content saved for failed requests
- Console logging throughout the application

### Performance Monitoring
- Memory usage tracking in API responses
- Request timeout handling (3600 seconds)
- Connection pooling for database efficiency

---

## Additional Resources

### Credentials
- **CrisprBuildr Gmail**: crisprbuildr@gmail.com
- **Password**: Flyserver123!!

### Bug Reporting
- **Platform**: JotForm
- **Integration**: Embedded in application

### Repository
- **GitHub**: https://github.com/SelinaLiu8/fly-server.git
- **Upstream**: git@github.com:mdbassoon/fly-server.git

### Manual
- **Location**: `client/src/assets/CrisprBuildr1.0_manual.pdf`

---

*Documentation last updated: January 2025*
*Application version: 2.0 (Updated with Redux Toolkit)*
