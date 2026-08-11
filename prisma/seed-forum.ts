import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    slug: "the-beginning",
    name: "The Beginning",
    description: "For people beginning their spiritual journey.",
    icon: "🌱",
    color: "#84cc16",
    sortOrder: 1,
  },
  {
    slug: "self-and-reflection",
    name: "Self & Reflection",
    description: "Exploring the inner world.",
    icon: "🪞",
    color: "#f472b6",
    sortOrder: 2,
  },
  {
    slug: "consciousness",
    name: "Consciousness",
    description: "Discussion about consciousness and awareness.",
    icon: "🧘",
    color: "#8b5cf6",
    sortOrder: 3,
  },
  {
    slug: "spiritual-practices",
    name: "Spiritual Practices",
    description: "Members can share practices that help them grow.",
    icon: "✨",
    color: "#06b6d4",
    sortOrder: 4,
  },
  {
    slug: "the-universe",
    name: "The Universe",
    description: "A space for exploring larger spiritual and philosophical questions.",
    icon: "🌌",
    color: "#3b82f6",
    sortOrder: 5,
  },
  {
    slug: "study-hall",
    name: "The Study Hall",
    description: "For studying spiritual and philosophical teachings.",
    icon: "📖",
    color: "#f59e0b",
    sortOrder: 6,
  },
  {
    slug: "ask-the-sanctuary",
    name: "Ask the Sanctuary",
    description: "A question-focused area for seekers.",
    icon: "💭",
    color: "#10b981",
    sortOrder: 7,
  },
  {
    slug: "growth-and-transformation",
    name: "Growth & Transformation",
    description: "Members share breakthroughs, realizations, lessons, and moments of personal growth.",
    icon: "🌻",
    color: "#f97316",
    sortOrder: 8,
  },
  {
    slug: "community",
    name: "Community",
    description: "A lighter space for introductions, conversations, events, meditation groups, and community activities.",
    icon: "🤝",
    color: "#ec4899",
    sortOrder: 9,
  },
];

const reflectionPrompts = [
  "What are you holding onto today that no longer needs to be carried?",
  "Where in your life are you seeking control when what you truly need is surrender?",
  "What small kindness can you offer yourself in this moment?",
  "If your heart could speak without fear, what would it say right now?",
  "What distractions are keeping you from what truly matters?",
  "Who are you when no one is watching?",
  "What belief about yourself is ready to be released?",
  "Where have you been seeking outside validation when the answer lies within?",
  "What does silence teach you that words cannot?",
  "What would you do today if you weren't afraid?",
  "What pattern from your past are you ready to release?",
  "Where in your life do you feel most alive?",
  "What is your heart calling you toward that your mind is resisting?",
  "What would it mean to forgive yourself completely?",
  "What does love ask of you today?",
];

async function main() {
  console.log("🌱 Seeding forum categories...");

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder },
      create: cat,
    });
  }

  console.log(`✓ ${categories.length} categories seeded`);

  // Seed daily reflections for the next 30 days
  console.log("🌅 Seeding daily reflections...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const prompt = reflectionPrompts[i % reflectionPrompts.length];

    await prisma.dailyReflection.upsert({
      where: { date },
      update: { prompt },
      create: { prompt, date },
    });
  }

  console.log(`✓ 30 daily reflections seeded`);
  console.log("✨ Forum seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });