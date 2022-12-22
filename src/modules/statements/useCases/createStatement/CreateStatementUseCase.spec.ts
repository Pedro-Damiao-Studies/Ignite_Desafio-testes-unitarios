import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository'
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

describe('Create Statement', () => {

  let statementsRepository: IStatementsRepository;
  let usersRepository: IUsersRepository;
  let createStatementUseCase: CreateStatementUseCase;

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
  });

  it('should create a statement of type deposit', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const result = await createStatementUseCase.execute({
      user_id: createdUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'test operation',
    });

    expect(result).toHaveProperty('id');
  });

  it('should create a statement of type withdraw', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    await createStatementUseCase.execute({
      user_id: createdUser.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'test operation',
    });

    const result = await createStatementUseCase.execute({
      user_id: createdUser.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'test operation',
    });

    expect(result).toHaveProperty('id');
  });

  it('should create a statement of type transfer', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });
    const createdSender = await usersRepository.create({ name: 'Sender', email: 'tt@t.co', password: (await hash('1234', 8)) });

    await createStatementUseCase.execute({
      user_id: createdSender.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'test operation',
    });

    const result = await createStatementUseCase.execute({
      user_id: createdUser.id as string,
      sender_id: createdSender.id as string,
      type: OperationType.TRANSFER,
      amount: 80,
      description: 'test operation',
    });

    expect(result).toHaveProperty('id');
  });

  it('should not be able to create a statement when the user does not exists', async () => {

    const calledFunction = async () => {
      await createStatementUseCase.execute({
        user_id: '1234',
        type: OperationType.DEPOSIT,
        amount: 50,
        description: 'test operation',
      });
    }
    await expect(calledFunction).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });


  it('should not be able to create a statement when the sender does not exists', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const calledFunction = async () => {
      await createStatementUseCase.execute({
        user_id: createdUser.id as string,
        sender_id: '1234',
        type: OperationType.TRANSFER,
        amount: 50,
        description: 'test operation',
      });
    }
    await expect(calledFunction).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('should not be able to create a statement of type withdraw when have no founds', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });

    const calledFunction = async () => {
      await createStatementUseCase.execute({
        user_id: createdUser.id as string,
        type: OperationType.WITHDRAW,
        amount: 50,
        description: 'test operation',
      });
    }
    await expect(calledFunction).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a statement of type transfer when have no founds', async () => {
    const createdUser = await usersRepository.create({ name: 'Test', email: 't@t.co', password: (await hash('1234', 8)) });
    const createdSender = await usersRepository.create({ name: 'Sender', email: 'tt@t.co', password: (await hash('1234', 8)) });

    const calledFunction = async () => {
      await createStatementUseCase.execute({
        user_id: createdUser.id as string,
        sender_id: createdSender.id as string,
        type: OperationType.TRANSFER,
        amount: 80,
        description: 'test operation',
      });
    }
    await expect(calledFunction).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });


})
