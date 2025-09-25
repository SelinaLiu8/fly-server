-- SHOW TABLES;

-- CREATE TABLE GeneInfo (
--     FBgnID VARCHAR(50) PRIMARY KEY,
--     GeneName VARCHAR(255) NOT NULL
-- );

-- SELECT * FROM GeneInfo;
DELETE FROM GeneInfo WHERE FBgnID = 'FBgnTest123';

-- CREATE TABLE TerminalType (
--     TerminalTypeID INT PRIMARY KEY AUTO_INCREMENT,
--     TerminalName VARCHAR(10) NOT NULL UNIQUE
-- );

-- INSERT INTO TerminalType (TerminalName)
-- VALUES ('N'), ('C');

-- SELECT * FROM TerminalType;

-- DROP TABLE GeneInfo;