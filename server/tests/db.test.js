const db = require('../src/db/db')

describe('Database Connection', () => {
    afterAll(async () => {
      await db.end(); // close the pool after tests
    });
  
    test('should connect and run a simple query', async () => {
      const [rows] = await db.query('SELECT 1 + 1 AS result');
      expect(rows[0].result).toBe(2);
    });
  
    test('should connect to the right database', async () => {
      const [rows] = await db.query('SELECT DATABASE() AS db');
      expect(rows[0].db).toBe(process.env.DB_NAME);
    });

    test('should be using the fly_cache database', async () => {
        const [rows] = await db.query('SELECT DATABASE() AS db');
        console.log('Connected to database:', rows[0].db); // debug log
        expect(rows[0].db).toBe('fly_cache');
    });

    test('should attempt a safe insert', async () => {
        const testId = 'FBgnTest123';
        const testName = 'TestGene';
        let inserted = false;
    
        try {
          const [result] = await db.query(
            `INSERT INTO GeneInfo (FBgnID, GeneName) VALUES (?, ?)`,
            [testId, testName]
          );
          inserted = result.affectedRows === 1;
        } catch (err) {
          console.error('Insert failed:', err.message);
        } finally {
          // cleanup
          await db.query(`DELETE FROM GeneInfo WHERE FBgnID = ?`, [testId]);
        }
    
        expect(inserted).toBe(true);
    });
});