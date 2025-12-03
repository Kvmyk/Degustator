import { IsNotEmpty, IsString, IsArray, IsOptional, IsUUID, IsIn } from 'class-validator';

export const POST_CATEGORIES = [
  'Coffee',
  'Tea',
  'Wine',
  'Beer',
  'Juice',
  'Mocktails',
  'Alcoholic Cocktails',
  'Other',
] as const;

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
  @IsString()
  @IsIn(POST_CATEGORIES as unknown as string[])
  category: string;

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
