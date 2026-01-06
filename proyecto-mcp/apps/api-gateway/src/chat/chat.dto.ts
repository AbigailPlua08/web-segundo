import { IsString, IsNotEmpty } from 'class-validator';

export class ChatRequestDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}

export class ChatResponseDto {
  userPrompt: string;
  response: string;
  toolsExecuted: Array<{
    tool: string;
    arguments: any;
    result: any;
  }>;
  iterations: number;
  timestamp: string;
}
