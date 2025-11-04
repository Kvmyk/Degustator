import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as neo4j from 'neo4j-driver';
import { ConfigService } from '@nestjs/config';
export declare class Neo4jService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private driver;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    getDriver(): neo4j.Driver;
    read(query: string, params?: Record<string, any>): Promise<neo4j.RecordShape[]>;
    write(query: string, params?: Record<string, any>): Promise<neo4j.RecordShape[]>;
}
