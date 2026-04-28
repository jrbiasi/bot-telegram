import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.getUserById(data.telegramId);

    if (existingUser) {
      return existingUser;
    }

    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async getUserById(telegramId: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { telegramId },
      relations: ['subscriptions', 'payments'],
    });
  }

  async updateUser(telegramId: number, data: UpdateUserDTO): Promise<User | null> {
    await this.userRepository.update({ telegramId }, data);
    return this.getUserById(telegramId);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['subscriptions', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateUser(telegramId: number): Promise<User | null> {
    return this.updateUser(telegramId, { isActive: false });
  }
}

export const userService = new UserService();
