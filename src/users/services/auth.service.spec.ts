import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

let service: AuthService;
let fakeUsersService: Partial<UsersService>;

describe('AuthService', () => {
  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'password');

    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: 'a' } as User]);
    await service
      .signup('ola4@test.com', 'ola4')
      .catch((err: BadRequestException) => {
        expect(err.message);
      });
  });

  it('throws an error if user signs up with an unused email', async () => {
    await service
      .login('ola5@test.com', 'ola5')
      .catch((err: BadRequestException) => {
        expect(err.message);
      });
  });

  it('throws if an invalid password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'a', password: 'a' } as User]);
    await service
      .login('test@test.com', 'password')
      .catch((err: BadRequestException) => {
        expect(err.message);
      });
  });

  it('returns a user if a valid password is provided', async () => {
    await service.login('mail@test.com', 'password');
    await expect(service.login('mail@test.com', 'password2')).rejects.toThrow();
  });
});
