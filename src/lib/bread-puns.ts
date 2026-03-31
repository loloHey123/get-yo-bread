export type PunContext =
  | "clock_in"
  | "clock_out"
  | "friday"
  | "error"
  | "milestone"
  | "empty_shelf";

const puns: Record<PunContext, string[]> = {
  clock_in: [
    "Let's get this bread.",
    "Time to make some dough.",
    "Rise and grind.",
    "Let's roll.",
    "The daily bread begins.",
  ],
  clock_out: [
    "Another day, another loaf.",
    "You've earned your crust today.",
    "That's a wrap... like a tortilla.",
    "Time to loaf around.",
    "Dough well done.",
  ],
  friday: [
    "You're on a roll!",
    "That's a lot of dough!",
    "You really earned your crust this week.",
    "Bread winner of the week!",
    "The yeast you deserve.",
  ],
  error: [
    "Something went a-rye.",
    "We're in a bit of a jam.",
    "That's not what we kneaded.",
    "Looks like we're toast.",
    "Crumbs. Something broke.",
  ],
  milestone: [
    "You're making serious dough.",
    "Proof that hard work rises to the top.",
    "You're the greatest thing since sliced bread.",
    "That's one well-baked achievement.",
  ],
  empty_shelf: [
    "Your shelf is empty. Time to get baking!",
    "No loaves yet. Keep grinding!",
    "This shelf is ready to rise.",
  ],
};

export function getRandomPun(context: PunContext): string {
  const options = puns[context];
  return options[Math.floor(Math.random() * options.length)];
}

export function getAllPuns(context: PunContext): string[] {
  return puns[context];
}
