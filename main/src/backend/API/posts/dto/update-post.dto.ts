import { IsOptional, IsString, IsArray } from 'class-validator';

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
}
