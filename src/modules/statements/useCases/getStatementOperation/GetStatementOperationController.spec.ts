import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, Migration } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { app } from '../../../../app';

import createConnection from '../../../../database/test';


describe('Get Statement Operation Controller', () => {
  let connection: Connection;
  let migrations: Migration[];
  const email = 'admin@test.com';
  const password = '12345678';

  beforeAll(async () => {
    connection = await createConnection();
    migrations = await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash(password, 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${id}', 'user', '${email}', '${passwordHash}', now(), now())`
    );
  });

  afterAll(async () => {
    if (connection) {
      for(const _migration of migrations){
        await connection.undoLastMigration();
      }
      await connection.close();
    }
  });


  it('should be able to get a statement operation', async () => {
    const tokenResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      });

      const responseCreation = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: '100',
        description: 'test 1'
      })
      .set({
        Authorization: `Bearer ${tokenResponse.body.token}`,
      });



      const response = await request(app)
      .get(`/api/v1/statements/${responseCreation.body.id}`)
      .set({
        Authorization: `Bearer ${tokenResponse.body.token}`,
      });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(responseCreation.body.id)

  });



})
