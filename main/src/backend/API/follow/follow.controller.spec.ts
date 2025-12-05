import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FollowController', () => {
    let controller: FollowController;
    let service: FollowService;

    const mockFollowService = {
        followUser: jest.fn(),
        unfollowUser: jest.fn(),
        isFollowing: jest.fn(),
    };

    const mockRequest = {
        user: {
            sub: 'current-user-id',
            email: 'test@example.com',
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FollowController],
            providers: [
                {
                    provide: FollowService,
                    useValue: mockFollowService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const req = context.switchToHttp().getRequest();
                    req.user = mockRequest.user;
                    return true;
                },
            })
            .compile();

        controller = module.get<FollowController>(FollowController);
        service = module.get<FollowService>(FollowService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('follow', () => {
        it('should call followUser with correct parameters', async () => {
            const targetUserId = 'target-user-id';
            const expectedResult = {
                message: `Obserwujesz użytkownika ${targetUserId}`,
            };

            mockFollowService.followUser.mockResolvedValue(expectedResult);

            const result = await controller.follow(mockRequest, targetUserId);

            expect(service.followUser).toHaveBeenCalledWith(
                mockRequest.user.sub,
                targetUserId
            );
            expect(result).toEqual(expectedResult);
        });

        it('should extract user ID from JWT token in request', async () => {
            const targetUserId = 'target-user-id';

            mockFollowService.followUser.mockResolvedValue({
                message: 'Success',
            });

            await controller.follow(mockRequest, targetUserId);

            const callArgs = mockFollowService.followUser.mock.calls[0];
            expect(callArgs[0]).toBe('current-user-id');
        });

        it('should propagate service errors', async () => {
            const targetUserId = 'target-user-id';
            const error = new Error('Service error');

            mockFollowService.followUser.mockRejectedValue(error);

            await expect(
                controller.follow(mockRequest, targetUserId)
            ).rejects.toThrow(error);
        });
    });

    describe('unfollow', () => {
        it('should call unfollowUser with correct parameters', async () => {
            const targetUserId = 'target-user-id';
            const expectedResult = {
                message: `Przestałeś obserwować użytkownika ${targetUserId}`,
            };

            mockFollowService.unfollowUser.mockResolvedValue(expectedResult);

            const result = await controller.unfollow(mockRequest, targetUserId);

            expect(service.unfollowUser).toHaveBeenCalledWith(
                mockRequest.user.sub,
                targetUserId
            );
            expect(result).toEqual(expectedResult);
        });

        it('should extract user ID from JWT token', async () => {
            const targetUserId = 'target-user-id';

            mockFollowService.unfollowUser.mockResolvedValue({
                message: 'Success',
            });

            await controller.unfollow(mockRequest, targetUserId);

            const callArgs = mockFollowService.unfollowUser.mock.calls[0];
            expect(callArgs[0]).toBe('current-user-id');
        });

        it('should handle service errors during unfollow', async () => {
            const targetUserId = 'target-user-id';
            const error = new Error('Unfollow failed');

            mockFollowService.unfollowUser.mockRejectedValue(error);

            await expect(
                controller.unfollow(mockRequest, targetUserId)
            ).rejects.toThrow(error);
        });
    });

    describe('isFollowing', () => {
        it('should return true when user is following', async () => {
            const targetUserId = 'target-user-id';

            mockFollowService.isFollowing.mockResolvedValue(true);

            const result = await controller.isFollowing(mockRequest, targetUserId);

            expect(service.isFollowing).toHaveBeenCalledWith(
                mockRequest.user.sub,
                targetUserId
            );
            expect(result).toBe(true);
        });

        it('should return false when user is not following', async () => {
            const targetUserId = 'target-user-id';

            mockFollowService.isFollowing.mockResolvedValue(false);

            const result = await controller.isFollowing(mockRequest, targetUserId);

            expect(result).toBe(false);
        });

        it('should extract user ID from JWT token', async () => {
            const targetUserId = 'target-user-id';

            mockFollowService.isFollowing.mockResolvedValue(false);

            await controller.isFollowing(mockRequest, targetUserId);

            const callArgs = mockFollowService.isFollowing.mock.calls[0];
            expect(callArgs[0]).toBe('current-user-id');
        });

        it('should handle errors during follow status check', async () => {
            const targetUserId = 'target-user-id';
            const error = new Error('Check failed');

            mockFollowService.isFollowing.mockRejectedValue(error);

            await expect(
                controller.isFollowing(mockRequest, targetUserId)
            ).rejects.toThrow(error);
        });
    });

    describe('JWT Authentication', () => {
        it('should have JwtAuthGuard applied to controller', () => {
            const guards = Reflect.getMetadata('__guards__', FollowController);
            expect(guards).toBeDefined();
        });

        it('should have JwtAuthGuard on all endpoints', () => {
            const followGuards = Reflect.getMetadata(
                '__guards__',
                FollowController.prototype.follow
            );
            const unfollowGuards = Reflect.getMetadata(
                '__guards__',
                FollowController.prototype.unfollow
            );
            const isFollowingGuards = Reflect.getMetadata(
                '__guards__',
                FollowController.prototype.isFollowing
            );

            expect(followGuards).toBeDefined();
            expect(unfollowGuards).toBeDefined();
            expect(isFollowingGuards).toBeDefined();
        });
    });
});
