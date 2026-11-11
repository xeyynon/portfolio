/**
 * The order arithmetic, as this page illustrates it. Pure: no React, no DOM.
 *
 * Everything here is an example written for this page: the shelf, the prices,
 * the stock, how a line is rounded and the wording of the sentences are all
 * invented, and none of it is the agent's own code. What is taken from the
 * project is the split itself: the model only says which items and how many;
 * code checks stock, rounds, totals and writes every sentence that states an
 * amount. The page says so beside the exhibit.
 */

export type Item = {
  key: string;
  name: string;
  unit: string;
  /** How much one press of a stepper adds. */
  step: number;
  /** Rupees for one unit. */
  price: number;
  /** Units on the shelf. */
  stock: number;
};

/** An invented shelf. */
export const SHELF: Item[] = [
  { key: "rice", name: "Rice", unit: "kg", step: 1, price: 62, stock: 6 },
  { key: "sugar", name: "Sugar", unit: "kg", step: 1, price: 46, stock: 4 },
  { key: "dal", name: "Toor dal", unit: "kg", step: 0.5, price: 155, stock: 2 },
];

/** What the model hands over: which items and how many. No prices, no totals. */
export type Note = Record<string, number>;

/** The example order used across the page. */
export const EXAMPLE_NOTE: Note = { rice: 2, sugar: 1, dal: 0.5 };

export type Line = {
  item: Item;
  quantity: number;
  inStock: boolean;
  /** Price times quantity, before rounding. */
  exact: number;
  /** The amount charged: rounded to the whole rupee in this example. */
  amount: number;
};

export type Order = { lines: Line[]; total: number };

/** The most a stepper allows: one step past the shelf, so the stock check can be seen to fail. */
export function mostAllowed(item: Item): number {
  return item.stock + item.step;
}

/** One step up or down, kept between nothing and the most allowed. */
export function stepped(item: Item, quantity: number, direction: 1 | -1): number {
  return Math.max(0, Math.min(mostAllowed(item), quantity + direction * item.step));
}

/** Code's part: check each line against the shelf, round it, and total what is in stock. */
export function priceOrder(note: Note): Order {
  const lines = SHELF.filter((item) => (note[item.key] ?? 0) > 0).map((item) => {
    const quantity = note[item.key];
    const exact = quantity * item.price;
    return { item, quantity, inStock: quantity <= item.stock, exact, amount: Math.round(exact) };
  });
  const total = lines.reduce((sum, line) => sum + (line.inStock ? line.amount : 0), 0);
  return { lines, total };
}

export function rupees(amount: number): string {
  return `₹${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

export function quantityText(item: Item, quantity: number): string {
  return `${quantity} ${item.unit}`;
}

/** A sentence in parts, so the page can mark which words are amounts. */
export type Sentence = { text: string; amount?: boolean }[];

/** Every sentence that states an amount is put together here, from the numbers above. */
export function sentences(order: Order): Sentence[] {
  const said: Sentence[] = [];
  for (const line of order.lines) {
    if (line.inStock) continue;
    said.push([
      { text: `Sorry, we have only ` },
      { text: quantityText(line.item, line.item.stock), amount: true },
      { text: ` of ${line.item.name.toLowerCase()}, so I have left it out.` },
    ]);
  }
  const counted = order.lines.filter((line) => line.inStock).length;
  if (counted === 0) {
    said.push([{ text: "There is nothing in the order yet." }]);
  } else {
    said.push([
      { text: `That is ${counted} ${counted === 1 ? "item" : "items"}. Your total is ` },
      { text: rupees(order.total), amount: true },
      { text: "." },
    ]);
  }
  return said;
}
