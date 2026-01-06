import { Tool } from './types';
import { BackendClient } from '../services/backend-client';
import { createBuscarTourTool } from './buscar-tour.tool';
import { createValidarDisponibilidadTool } from './validar-disponibilidad.tool';
import { createCrearReservaTool } from './crear-reserva.tool';

/**
 * Registro centralizado de todas las herramientas (Tools) disponibles
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor(backendClient: BackendClient) {
    // Registrar los 3 Tools principales
    this.registerTool(createBuscarTourTool(backendClient));
    this.registerTool(createValidarDisponibilidadTool(backendClient));
    this.registerTool(createCrearReservaTool(backendClient));
  }

  private registerTool(tool: Tool): void {
    this.tools.set(tool.definition.name, tool);
  }

  /**
   * Obtiene la lista de definiciones de todas las herramientas
   * (usado para enviar a Gemini)
   */
  getToolDefinitions() {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }

  /**
   * Ejecuta una herramienta específica
   */
  async executeTool(name: string, params: any) {
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool "${name}" no encontrada`);
    }

    return await tool.execute(params);
  }

  /**
   * Verifica si una herramienta existe
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Obtiene los nombres de todas las herramientas disponibles
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
}
