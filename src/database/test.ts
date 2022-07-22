import 'dotenv/config';

import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (host = 'localhost'): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      host,
      database: 'fin_api_test',
    })
  );
};
