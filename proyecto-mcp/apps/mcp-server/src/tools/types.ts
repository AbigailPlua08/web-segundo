/**
 * Definición de tipos para MCP Tools
 */

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
  items?: {
    type: string;
    properties?: Record<string, ToolParameter>;
  };
  properties?: Record<string, ToolParameter>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolExecutor {
  (params: any): Promise<any>;
}

export interface Tool {
  definition: ToolDefinition;
  execute: ToolExecutor;
}
