-- SHOW TABLES;

-- CREATE TABLE GeneInfo (
--     FBgnID VARCHAR(50) PRIMARY KEY,
--     GeneName VARCHAR(255) NOT NULL
-- );

-- SELECT * FROM GeneInfo;
-- SELECT * FROM gene_info WHERE isoForm = 'Hsp70Bc-PA'; 
-- SELECT * FROM gene_info WHERE isoForm = 'Abd-B-RD';
-- SELECT * FROM isoforms;
-- DELETE FROM GeneInfo WHERE FBgnID = 'FBgnTest123';

-- CREATE TABLE TerminalType (
--     TerminalTypeID INT PRIMARY KEY AUTO_INCREMENT,
--     TerminalName VARCHAR(10) NOT NULL UNIQUE
-- );

-- INSERT INTO TerminalType (TerminalName)
-- VALUES ('N'), ('C');

-- SELECT * FROM TerminalType;

-- DROP TABLE GeneInfo;

-- CREATE TABLE IsoformInfo (
--     FBppID VARCHAR(50) PRIMARY KEY NOT NUlL,
--     FBgnID VARCHAR(50) NOT NULL,
--     IsoformName VARCHAR(255) NOT NULL,
--     GeneSequence TEXT,
--     Strand CHAR(1),
--     LocStart INT,
--     LocEnd INT,
--     LocDesc VARCHAR(255),
--     UpStreamSequence TEXT,
--     DownStreamSequence TEXT,
--     Region VARCHAR(255),
--     CONSTRAINT fk_isoform_gene FOREIGN KEY (FBgnID)
--         REFERENCES GeneInfo(FBgnID)
--         ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SHOW CREATE TABLE GeneInfo;
-- DROP TABLE IsoformInfo;
-- SELECT COUNT(*) FROM GeneInfo;
SELECT * FROM IsoformInfo;
SELECT * FROM gene_info WHERE isoForm = 'Snx27';