import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateIngredientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  avg_cost?: number;
}
