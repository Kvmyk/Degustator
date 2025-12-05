import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPostsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0;
}

export class SearchUsersDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}