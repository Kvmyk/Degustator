import { IsNotEmpty, IsUUID, IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  content?: string;
}
