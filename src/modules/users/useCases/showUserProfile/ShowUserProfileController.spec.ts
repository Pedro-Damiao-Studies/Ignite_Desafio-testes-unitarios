import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, Migration } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { app } from '../../../../app';

import createConnection from '../../../../database/test';


describe('Show User Profile Controller', () => {
  let connection: Connection;
  let migrations: Migration[];
  const email = 'admin@test.com';
  const password = '12345678';

  beforeEach(async () => {
    connection = await createConnection();
    migrations = await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash(password, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${id}', 'user', '${email}', '${passwordHash}', now(), now())`
    );
  });

  afterEach(async () => {
    if (connection) {
      for(const _migration of migrations){
        await connection.undoLastMigration();
      }
      await connection.close();
    }
  });


  it('should be able to show a profile of an user', async () => {
    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      });

      const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${tokenResponse.body.token}`,
      });

      expect(response.status).toBe(200);

  });

})
