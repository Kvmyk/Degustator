import { Neo4jService } from '../../db/neo4j.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private neo4jService;
    constructor(neo4jService: Neo4jService);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getFollowers(userId: string): Promise<any[]>;
    getFollowing(userId: string): Promise<any[]>;
    followUser(userId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    unfollowUser(userId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    getUserPosts(userId: string): Promise<any[]>;
    getLikedPosts(userId: string): Promise<any[]>;
    private excludePassword;
}
