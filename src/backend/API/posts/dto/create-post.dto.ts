import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  recipe: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsNotEmpty()
  @IsUUID()
  userId: string; // Creator of the post

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  ingredientIds?: string[];
}
