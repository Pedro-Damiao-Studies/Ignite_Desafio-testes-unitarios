import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection, Migration } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { app } from '../../../../app';

import createConnection from '../../../../database/test';


describe('Authenticate User Controller', () => {
  let connection: Connection;
  let migrations: Migration[];
  const email = 'user@test.com';
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


  it.only('should be able to authenticate an existing user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      });


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

})
