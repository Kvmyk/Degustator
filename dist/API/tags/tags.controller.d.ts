import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    createTag(createTagDto: CreateTagDto): Promise<any>;
    getAllTags(): Promise<any[]>;
    getPopularTags(): Promise<any[]>;
    getTagById(id: string): Promise<any>;
    updateTag(id: string, updateTagDto: UpdateTagDto): Promise<any>;
    deleteTag(id: string): Promise<{
        message: string;
    }>;
    getPostsByTag(id: string): Promise<any[]>;
}
