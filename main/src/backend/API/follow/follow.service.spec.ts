import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from './follow.service';
import { Neo4jService } from '../../db/neo4j.service';
import { BadRequestException } from '@nestjs/common';

describe('FollowService', () => {
    let service: FollowService;
    let neo4jService: Neo4jService;

    beforeEach(async () => {
        const mockNeo4jService = {
            write: jest.fn(),
            read: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowService,
                {
                    provide: Neo4jService,
                    useValue: mockNeo4jService,
                },
            ],
        }).compile();

        service = module.get<FollowService>(FollowService);
        neo4jService = module.get<Neo4jService>(Neo4jService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('followUser', () => {
        it('should successfully create a follow relationship', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.write as jest.Mock).mockResolvedValue(undefined);

            const result = await service.followUser(followerId, followeeId);

            expect(neo4jService.write).toHaveBeenCalledWith(
                expect.stringContaining('MERGE (follower)-[:FOLLOWS]->'),
                { followerId, followeeId }
            );
            expect(result).toEqual({
                message: `Obserwujesz użytkownika ${followeeId}`,
            });
        });

        it('should throw BadRequestException when user tries to follow themselves', async () => {
            const userId = 'user-1';

            await expect(service.followUser(userId, userId)).rejects.toThrow(
                BadRequestException
            );
            await expect(service.followUser(userId, userId)).rejects.toThrow(
                'Nie możesz obserwować samego siebie'
            );
            expect(neo4jService.write).not.toHaveBeenCalled();
        });

        it('should handle database errors gracefully', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';
            const dbError = new Error('Database connection failed');

            (neo4jService.write as jest.Mock).mockRejectedValue(dbError);

            await expect(
                service.followUser(followerId, followeeId)
            ).rejects.toThrow(dbError);
        });

        it('should use MERGE to prevent duplicate follow relationships', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.write as jest.Mock).mockResolvedValue(undefined);

            await service.followUser(followerId, followeeId);

            const cypherQuery = (neo4jService.write as jest.Mock).mock.calls[0][0];
            expect(cypherQuery).toContain('MERGE');
        });
    });

    describe('unfollowUser', () => {
        it('should successfully delete a follow relationship', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.write as jest.Mock).mockResolvedValue(undefined);

            const result = await service.unfollowUser(followerId, followeeId);

            expect(neo4jService.write).toHaveBeenCalledWith(
                expect.stringContaining('DELETE r'),
                { followerId, followeeId }
            );
            expect(result).toEqual({
                message: `Przestałeś obserwować użytkownika ${followeeId}`,
            });
        });

        it('should handle unfollowing a user that is not followed', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.write as jest.Mock).mockResolvedValue(undefined);

            const result = await service.unfollowUser(followerId, followeeId);

            expect(result).toEqual({
                message: `Przestałeś obserwować użytkownika ${followeeId}`,
            });
        });

        it('should handle database errors during unfollow', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';
            const dbError = new Error('Database error');

            (neo4jService.write as jest.Mock).mockRejectedValue(dbError);

            await expect(
                service.unfollowUser(followerId, followeeId)
            ).rejects.toThrow(dbError);
        });
    });

    describe('isFollowing', () => {
        it('should return true when follow relationship exists', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.read as jest.Mock).mockResolvedValue([
                { following: true },
            ]);

            const result = await service.isFollowing(followerId, followeeId);

            expect(neo4jService.read).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(r) > 0 AS following'),
                { followerId, followeeId }
            );
            expect(result).toBe(true);
        });

        it('should return false when follow relationship does not exist', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.read as jest.Mock).mockResolvedValue([
                { following: false },
            ]);

            const result = await service.isFollowing(followerId, followeeId);

            expect(result).toBe(false);
        });

        it('should return false when query returns empty result', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.read as jest.Mock).mockResolvedValue([]);

            const result = await service.isFollowing(followerId, followeeId);

            expect(result).toBe(false);
        });

        it('should return false when result is null or undefined', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';

            (neo4jService.read as jest.Mock).mockResolvedValue([{}]);

            const result = await service.isFollowing(followerId, followeeId);

            expect(result).toBe(false);
        });

        it('should handle database errors during isFollowing check', async () => {
            const followerId = 'user-1';
            const followeeId = 'user-2';
            const dbError = new Error('Query failed');

            (neo4jService.read as jest.Mock).mockRejectedValue(dbError);

            await expect(
                service.isFollowing(followerId, followeeId)
            ).rejects.toThrow(dbError);
        });
    });
});
