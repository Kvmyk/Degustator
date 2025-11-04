import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUser(createUserDto: CreateUserDto): Promise<any>;
    getAllUsers(): Promise<any[]>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getUserFollowers(id: string): Promise<any[]>;
    getUserFollowing(id: string): Promise<any[]>;
    followUser(id: string, targetId: string): Promise<{
        message: string;
    }>;
    unfollowUser(id: string, targetId: string): Promise<{
        message: string;
    }>;
    getUserPosts(id: string): Promise<any[]>;
    getUserLikedPosts(id: string): Promise<any[]>;
}
