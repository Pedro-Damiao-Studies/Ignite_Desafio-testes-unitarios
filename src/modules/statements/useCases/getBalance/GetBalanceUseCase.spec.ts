import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository'
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';


describe('Get Balance', () => {

  let statementsRepository: IStatementsRepository;
  let usersRepository: IUsersRepository;
  let getBalanceUseCase: GetBalanceUseCase;

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it('should return the balance and the statements of the user', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    await statementsRepository.create({
      user_id: createdUser.id as string,
      amount: 100,
      description: 'test',
      type: OperationType.DEPOSIT
    });

    await statementsRepository.create({
      user_id: createdUser.id as string,
      amount: 80,
      description: 'test',
      type: OperationType.WITHDRAW
    });

    const result = await getBalanceUseCase.execute({
      user_id: createdUser.id as string
    });

    expect(result.balance).toBe(20);
    expect(result.statement.length).toBe(2);

  });



  it('should not be able to get balance when user does not exists', async () => {

    const calledFunction = async () => {
      await getBalanceUseCase.execute({
        user_id: '1234',
      });
    }
    expect(calledFunction).rejects.toBeInstanceOf(GetBalanceError);
  });



})
