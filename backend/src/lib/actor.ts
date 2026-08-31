export function buildActorId(usuarioId?: number, visitanteId?: string): string {
  if (usuarioId) return `user:${usuarioId}`;
  if (visitanteId) return `visitante:${visitanteId}`;
  throw new Error('Se requiere usuarioId o visitanteId');
}
