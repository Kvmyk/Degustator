import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg_cost?: number;
}
