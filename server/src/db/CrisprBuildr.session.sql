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
-- SELECT * FROM IsoformInfo;

-- CREATE TABLE HomologyType (
--     HomologyTypeID VARCHAR(10) PRIMARY KEY,
--     HomologyType VARCHAR(100) NOT NULL
-- );

-- INSERT INTO HomologyType (HomologyTypeID, HomologyType)
-- VALUES
--     ('hom5', 'Forward Homology Arm Primer'),
--     ('hom3', 'Reverse Homology Arm Primer'),
--     ('seq5', 'Forward Sequencing Primer'),
--     ('seq3', 'Reverse Sequencing Primer');

-- SELECT * FROM HomologyType;

CREATE TABLE PrimerInfo (
    PrimerID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    FBppID VARCHAR(50) NOT NULL,
    TerminalTypeID INT NOT NULL,
    HomologyTypeID VARCHAR(10) NOT NULL,
    PrimerSequence TEXT,
    Tm DECIMAL(5,2),
    GCPercent DECIMAL(5,2),
    AnyValue VARCHAR(50),
    ThreePrime VARCHAR(50),
    CONSTRAINT fk_primer_isoform FOREIGN KEY (FBppID)
        REFERENCES IsoformInfo(FBppID)
        ON DELETE CASCADE,
    CONSTRAINT fk_primer_terminal FOREIGN KEY (TerminalTypeID)
        REFERENCES TerminalType(TerminalTypeID)
        ON DELETE CASCADE,
    CONSTRAINT fk_primer_homology FOREIGN KEY (HomologyTypeID)
        REFERENCES HomologyType(HomologyTypeID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

