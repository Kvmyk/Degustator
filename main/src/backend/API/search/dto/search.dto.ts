import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchPostsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}

export class SearchUsersDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}