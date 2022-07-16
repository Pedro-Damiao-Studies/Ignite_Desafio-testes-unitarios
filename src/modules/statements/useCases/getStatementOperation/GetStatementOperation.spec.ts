import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository'
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';


describe('Get Balance', () => {

  let statementsRepository: IStatementsRepository;
  let usersRepository: IUsersRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository);
  });

  it('should return the specified statement operation', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const createdStatement = await statementsRepository.create({
      user_id: createdUser.id as string,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: createdUser.id as string,
      statement_id: createdStatement.id as string,
    });



    expect(result.id).toBe(createdStatement.id);

  });



  it('should not be able to get statement operation when user does not exists', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const createdStatement = await statementsRepository.create({
      user_id: createdUser.id as string,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT
    });

    const calledFunction = async () => {
      await getStatementOperationUseCase.execute({
        user_id: '1234',
        statement_id: createdStatement.id as string,
      });
    }
    expect(calledFunction).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to get statement operation when operations does not exists', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const calledFunction = async () => {
      await getStatementOperationUseCase.execute({
        user_id: createdUser.id as string,
        statement_id: '12345',
      });
    }

    expect(calledFunction).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });



})
