export declare class ApiController {
    getApiStatus(): {
        message: string;
        version: string;
        status: string;
        endpoints: {
            users: string;
            posts: string;
            reviews: string;
            tags: string;
            ingredients: string;
        };
    };
    healthCheck(): {
        status: string;
        timestamp: string;
    };
}
