import { IsOptional, IsString, IsArray, IsIn } from 'class-validator';
import { POST_CATEGORIES } from './create-post.dto';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  recipe?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  @IsIn(POST_CATEGORIES as unknown as string[])
  category?: string;
}
