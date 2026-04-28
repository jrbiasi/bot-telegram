export interface CreateUserDTO {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isBot?: boolean;
}

export interface UpdateUserDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UserResponseDTO {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
