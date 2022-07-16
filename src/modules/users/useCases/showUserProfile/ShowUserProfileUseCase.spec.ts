import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

describe('Create User', () => {

  let user: {name: string, email: string, password: string};
  let usersRepository: IUsersRepository;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    user = {
      email: 'test@test.dev',
      name: 'User test',
      password: 'test'
    };
  });

  it('should return the specified user', async () => {
    const createdUser = await usersRepository.create({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const returnedUser = await showUserProfileUseCase.execute(createdUser.id as string);

    expect(returnedUser).toHaveProperty('id');
    expect(returnedUser.name).toBe(createdUser.name);
    expect(returnedUser.email).toBe(createdUser.email);
  });

  it('should not be able return an non existent user', async () => {


    const calledFunction = async () => {
      await showUserProfileUseCase.execute('123456')
    }

    expect(calledFunction).rejects.toBeInstanceOf(ShowUserProfileError);
  });


})
