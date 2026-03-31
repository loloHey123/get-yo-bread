import type { Bakery } from "@/lib/types";
import type { BakeryProvider } from "./provider";

const mockBakeries: Bakery[] = [
  {
    name: "Golden Crust Bakery",
    address: "123 Main St",
    rating: 4.8,
    distance: "0.3 mi",
    url: "https://example.com/golden-crust",
  },
  {
    name: "Rise & Shine Bread Co.",
    address: "456 Oak Ave",
    rating: 4.6,
    distance: "0.7 mi",
    url: "https://example.com/rise-and-shine",
  },
  {
    name: "The Flour Shop",
    address: "789 Elm St",
    rating: 4.9,
    distance: "1.1 mi",
    url: "https://example.com/flour-shop",
  },
  {
    name: "Crumb & Co.",
    address: "321 Pine Rd",
    rating: 4.5,
    distance: "1.4 mi",
    url: "https://example.com/crumb-co",
  },
  {
    name: "Knead To Know Bakery",
    address: "654 Maple Ln",
    rating: 4.7,
    distance: "1.8 mi",
    url: "https://example.com/knead-to-know",
  },
  {
    name: "Upper Crust Patisserie",
    address: "987 Cedar Blvd",
    rating: 4.4,
    distance: "2.2 mi",
  },
  {
    name: "Sourdough & Sons",
    address: "147 Birch Way",
    rating: 4.3,
    distance: "2.5 mi",
  },
  {
    name: "The Rolling Pin",
    address: "258 Walnut Dr",
    rating: 4.6,
    distance: "2.8 mi",
  },
  {
    name: "Baguette About It",
    address: "369 Cherry Ct",
    rating: 4.8,
    distance: "3.1 mi",
  },
  {
    name: "Loaf & Found",
    address: "480 Willow St",
    rating: 4.2,
    distance: "3.5 mi",
  },
];

export class MockBakeryProvider implements BakeryProvider {
  async findNearby(location: string, limit: number = 5): Promise<Bakery[]> {
    return mockBakeries.slice(0, Math.max(0, limit));
  }
}
