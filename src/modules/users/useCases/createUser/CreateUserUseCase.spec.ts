import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

describe('Create User', () => {

  let user: {name: string, email: string, password: string};
  let usersRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    user = {
      email: 'test@test.dev',
      name: 'User test',
      password: 'test'
    };
  });

  it('should create an user', async () => {
    const createdUser = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    expect(createdUser).toHaveProperty('id');
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);
  });

  it('should not be able create an user when the email is already registered', async () => {
    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const calledFunction = async () => {
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });
    }

    expect(calledFunction).rejects.toBeInstanceOf(CreateUserError);
  });


})
