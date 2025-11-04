import { Neo4jService } from '../../db/neo4j.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsService {
    private neo4jService;
    constructor(neo4jService: Neo4jService);
    create(createTagDto: CreateTagDto): Promise<any>;
    findAll(): Promise<any[]>;
    findPopular(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateTagDto: UpdateTagDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getPostsByTag(tagId: string): Promise<any[]>;
}
