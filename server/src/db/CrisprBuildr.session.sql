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
-- SELECT COUNT(*) FROM GeneInfo;
-- SELECT * FROM IsoformInfo WHERE FBppID = 'FBpp0071716';
-- SELECT * FROM gene_info WHERE isoForm = 'Snx27';

-- CREATE TABLE GuideTargetInfo (
--     GuideTargetID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
--     FBppID VARCHAR(50) NOT NULL,
--     TerminalTypeID INT NOT NULL,
--     TargetSequence TEXT,
--     OffTarget INT,
--     Distal TEXT,
--     Proximal TEXT,
--     Pam TEXT,
--     Strand CHAR(1),
--     Label VARCHAR(50),
--     EfficiencyStore DECIMAL,
--     CONSTRAINT fk_target_isoform FOREIGN KEY (FBppID)
--         REFERENCES IsoformInfo(FBppID)
--         ON DELETE CASCADE,
--     CONSTRAINT fk_target_terminal FOREIGN KEY (TerminalTypeID)
--         REFERENCES TerminalType(TerminalTypeID)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ALTER TABLE GuideTargetInfo 
-- ADD UNIQUE KEY unique_target (FBppID, GuideTargetID);

-- SELECT * FROM GuideTargetInfo;
SELECT * FROM IsoformInfo WHERE FBppID='FBpp0089351';