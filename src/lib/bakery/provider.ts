import type { Bakery } from "@/lib/types";

export interface BakeryProvider {
  findNearby(location: string, limit?: number): Promise<Bakery[]>;
}
