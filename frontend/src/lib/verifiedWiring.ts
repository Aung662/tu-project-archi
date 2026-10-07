import data from '@/data/verifiedWiring.json';

export interface VerifiedConnection {
  id: string;
  boardPin: string;
  componentPin: string;
  kind: 'power' | 'ground' | 'signal';
  color: string;
  route: { x: number; y: number }[];
}

export interface VerifiedWiringRecipe {
  id: string;
  boardId: string;
  componentId: string;
  displayName: string;
  diagramFile: string;
  license: string;
  connections: VerifiedConnection[];
  connectionsNotes: { en: string; my: string }[];
  sources: { label: string; url: string }[];
  attribution: string;
}

export const VERIFIED_WIRING_RECIPES = data.recipes as VerifiedWiringRecipe[];

export function verifiedWiringFor(boardId: string, componentId: string): VerifiedWiringRecipe | undefined {
  return VERIFIED_WIRING_RECIPES.find((recipe) => recipe.boardId === boardId && recipe.componentId === componentId);
}
