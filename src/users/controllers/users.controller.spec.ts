import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { AuthService } from "../services/auth.service";

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id) => {
        return Promise.resolve({
          id,
          email: 'test@mail.com',
          password: 'test',
        } as User);
      },
      find: (email) => {
        return Promise.resolve([{
            id: 1,
            email,
            password: 'test',
          } as User,
        ]);
      },
      //remove: () => {},
      //update: () => {},
    };
    /*fakeAuthService = {
      signup: () => {},
      login: () => {},
    };*/

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with given email', async () => {
    const users = await controller.findAllUsers('test@mail.com');
    expect(users).toEqual(1);
    expect(users[0].email).toEqual('test@mail.com');
  })
});
