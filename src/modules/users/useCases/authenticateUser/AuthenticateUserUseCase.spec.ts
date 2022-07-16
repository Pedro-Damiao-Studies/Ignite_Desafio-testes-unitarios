import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase'
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe('Authenticate User', () => {

  let usersRepository: IUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it('should authenticate an user', async () => {
    let user = {
      email: 'test@test.dev',
      name: 'User test',
      password: 'test'
    };

    const createdUser = await usersRepository.create({
      email: user.email,
      name: user.name,
      password: (await hash(user.password, 8)),
    });


    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(result.user).toEqual({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email
    });
    expect(result).toHaveProperty('token');

  });

  it('should fail when user do not exists', async () => {

    const calledFunction = async () =>
      await authenticateUserUseCase.execute({
        email: 'test@email.com',
        password: '1234'
      });

    expect(calledFunction).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });

  it('should not be able to authenticate when password do not match', async () => {
    let user = {
      email: 'test@test.dev',
      name: 'User test',
      password: 'test'
    };

    await usersRepository.create({
      email: user.email,
      name: user.name,
      password: (await hash(user.password, 8)),
    });

    const calledFunction = async () =>
      await authenticateUserUseCase.execute({
        email: user.email,
        password: '1234'
      });

    expect(calledFunction).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });




})
