import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guidance Modes — Sanctuary",
  description: "Learn about the six guidance modes of Sanctuary.",
};

const MODES = [
  {
    title: "Balanced Guidance",
    description: "The default mode. Integrates spiritual insight, logical reasoning, emotional awareness, personal responsibility, and practical action into a cohesive response. Suitable for most questions.",
    bestFor: "Everyday questions, life decisions, emotional struggles, relationship challenges",
  },
  {
    title: "Divine Reflection",
    description: "Focuses on surrender, attachment, forgiveness, consciousness, peace, and relationship with God. Helps the user release control and trust in a higher order. Uses gentle spiritual language around divine presence.",
    bestFor: "Spiritual crisis, questions about God's will, letting go, finding peace, surrender",
  },
  {
    title: "Christ-Centered Guidance",
    description: "Offers guidance inspired by the teachings and character of Jesus — compassion, forgiveness, humility, service, love of neighbor, and spiritual transformation. Never impersonates Jesus but reflects on his example.",
    bestFor: "Christian spiritual growth, forgiveness, humility, loving others, moral questions",
  },
  {
    title: "Grounded Clarity",
    description: "Focuses on facts, boundaries, communication, consequences, and practical decisions. Direct and clear while remaining compassionate. Strips away spiritual metaphor to get to the practical heart.",
    bestFor: "Difficult decisions, boundary-setting, conflict resolution, practical life choices",
  },
  {
    title: "Deep Reflection",
    description: "Offers a longer, deeper analysis of beliefs, emotions, assumptions, and life lessons. Explores root patterns beneath the surface question. Expect more contemplative depth and a slower pace.",
    bestFor: "Self-examination, understanding patterns, processing grief, existential questions",
  },
  {
    title: "Gentle Guidance",
    description: "Uses exceptionally soft, nurturing, and gentle language. Prioritizes emotional safety and comfort. Especially patient and warm — designed for those who are hurting, overwhelmed, or raw.",
    bestFor: "When you are in pain, grieving, anxious, or feeling fragile",
  },
];

export default function GuidancePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="text-xl font-serif text-primary wings-aura">
            Collettive
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif mb-4">Guidance Modes</h1>
        <p className="text-muted-foreground mb-10">
          Sanctuary offers six guidance modes, each shaping the tone and focus of the conversation.
          The default is Balanced Guidance. You can switch modes at any time during a conversation.
        </p>

        <div className="space-y-6">
          {MODES.map((mode) => (
            <div
              key={mode.title}
              className="border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <h2 className="text-xl font-serif text-foreground mb-2">{mode.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">{mode.description}</p>
              <p className="text-sm text-primary/80">
                <span className="font-medium">Best for:</span> {mode.bestFor}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12 pt-6 border-t border-border">
          <h2 className="text-xl font-serif text-foreground mb-3">How to Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            Before or during a conversation, click the mode indicator below the chat input to open
            the selector. Choose the mode that best fits what you need in this moment. You can change
            modes mid-conversation — each message will reflect the current mode.
          </p>
        </section>

        <section className="pt-6 border-t border-border mt-6">
          <Link href="/" className="text-primary hover:text-primary/80 underline">
            Return to Sanctuary
          </Link>
        </section>
      </main>
    </div>
  );
}