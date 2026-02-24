import type { PtypeDetail, PtypeListItem } from "../types/ptype-types";

export interface UIPtype {
  id: number;
  name: string;
  notes?: string;
  createdAt?: string;
}

export function transformPtypeListItem(entity: PtypeListItem): UIPtype {
  return {
    id: entity.ID_TIPO,
    name: entity.TIPO,
    notes: undefined,
    createdAt: undefined,
  };
}

export function transformPtypeList(items: PtypeListItem[]): UIPtype[] {
  return items.map(transformPtypeListItem);
}

export function transformPtypeDetail(entity: PtypeDetail): UIPtype {
  return {
    id: entity.ID_TIPO,
    name: entity.TIPO ?? "",
    notes: entity.ANOTACOES ?? undefined,
    createdAt: entity.DT_CADASTRO ?? undefined,
  };
}

export function transformPtypeDetailList(items: PtypeDetail[]): UIPtype[] {
  return items.map(transformPtypeDetail);
}

export function transformPtype(
  entity: PtypeListItem | PtypeDetail | null | undefined,
): UIPtype | null {
  if (!entity) return null;

  if ("ANOTACOES" in entity) {
    return transformPtypeDetail(entity as PtypeDetail);
  }

  return transformPtypeListItem(entity as PtypeListItem);
}
