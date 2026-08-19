/**
 * Transit Engine — compares today's planetary positions against the user's
 * natal chart to find activations, aspects, and generate daily insights.
 */
import { Body, GeoVector, Ecliptic, MakeTime } from "astronomy-engine";
import { calcLifePath, calcPersonalDayNumber } from "./blueprint-engine";
import type { UserBlueprint } from "./blueprint-engine";

// ── Constants ──
const GATE_WIDTH = 360 / 64;
const LINE_WIDTH = GATE_WIDTH / 6;
const ZODIAC_NAMES = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

const ASPECT_ORBS: Record<string, number> = {
  conjunction: 8,   // 0°
  opposition: 8,   // 180°
  trine: 6,        // 120°
  square: 6,       // 90°
  sextile: 4,      // 60°
  quincunx: 3,     // 150°
};

// ── Types ──
export interface TransitActivation {
  type: "gate" | "aspect" | "personalDay";
  planet?: string;
  gate?: number;
  line?: number;
  natalPlanet?: string;
  aspect?: string;
  description: string;
}

export interface DailyTransitSummary {
  date: string;
  personalDayNumber: number;
  activatedGates: TransitActivation[];
  aspects: TransitActivation[];
  raw: string; // Brief raw description for the LLM
}

// ── Helper: get ecliptic longitude ──
function eclipticDeg(body: Body, date: Date): number {
  const time = MakeTime(date);
  const eq = GeoVector(body, time, true);
  const ecl = Ecliptic(eq);
  return ecl.elon;
}

// ── Helper: degree → zodiac sign + degree within sign ──
function degToSign(deg: number): { sign: string; degree: number; eclipticDeg: number } {
  const normalized = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return {
    sign: ZODIAC_NAMES[signIndex],
    degree: +(normalized - signIndex * 30).toFixed(2),
    eclipticDeg: normalized,
  };
}

// ── Helper: degree → Human Design gate ──
function degToGate(deg: number): { gate: number; line: number } {
  const normalized = ((deg % 360) + 360) % 360;
  const gate = Math.floor(normalized / GATE_WIDTH) + 1;
  const remainder = normalized % GATE_WIDTH;
  const line = Math.floor(remainder / LINE_WIDTH) + 1;
  return { gate: Math.min(gate, 64), line: Math.min(line, 6) };
}

// ── Helper: find aspect between two angles ──
function findAspect(deg1: number, deg2: number): string | null {
  const diff = Math.abs(deg1 - deg2);
  const orb = Math.min(diff, 360 - diff);
  for (const [name, maxOrb] of Object.entries(ASPECT_ORBS)) {
    const target = {
      conjunction: 0, opposition: 180, trine: 120,
      square: 90, sextile: 60, quincunx: 150,
    }[name]!;
    if (Math.abs(orb - target) <= maxOrb) return name;
  }
  return null;
}

// ── Compute today's transit summary ──
export async function computeTransits(bp: UserBlueprint, date: Date = new Date()): Promise<DailyTransitSummary> {
  const today = date.toISOString().split("T")[0];
  const personalDayNumber = calcPersonalDayNumber(bp.birthData.date, today);

  // Compute today's planet positions
  const planetBodies: { name: string; body: Body }[] = [
    { name: "Sun", body: Body.Sun },
    { name: "Moon", body: Body.Moon },
    { name: "Mercury", body: Body.Mercury },
    { name: "Venus", body: Body.Venus },
    { name: "Mars", body: Body.Mars },
    { name: "Jupiter", body: Body.Jupiter },
    { name: "Saturn", body: Body.Saturn },
  ];

  const todayPositions: { name: string; deg: number; gate: number; line: number }[] = [];
  for (const p of planetBodies) {
    const deg = eclipticDeg(p.body, date);
    const { gate, line } = degToGate(deg);
    todayPositions.push({ name: p.name, deg, gate, line });
  }

  const activations: TransitActivation[] = [];
  const aspects: TransitActivation[] = [];

  // 1. Gate activations — today's planets hitting the user's defined gates
  const userGates = bp.humanDesign.gates.map(g => g.gate);
  for (const tp of todayPositions) {
    if (userGates.includes(tp.gate)) {
      const matchingGate = bp.humanDesign.gates.find(g => g.gate === tp.gate);
      activations.push({
        type: "gate",
        planet: tp.name,
        gate: tp.gate,
        line: tp.line,
        description: `${tp.name} is activating your Gate ${tp.gate}.${tp.line} (${matchingGate?.center || "unknown"} center).`,
      });
    }
  }

  // 2. Transit-to-natal aspects
  const natalPlanets: { name: string; deg: number }[] = [
    { name: "Sun", deg: bp.astrology.sun.eclipticDeg },
    { name: "Moon", deg: bp.astrology.moon.eclipticDeg },
    { name: "Mercury", deg: bp.astrology.mercury.eclipticDeg },
    { name: "Venus", deg: bp.astrology.venus.eclipticDeg },
    { name: "Mars", deg: bp.astrology.mars.eclipticDeg },
    { name: "Jupiter", deg: bp.astrology.jupiter.eclipticDeg },
    { name: "Saturn", deg: bp.astrology.saturn.eclipticDeg },
  ];

  for (const tp of todayPositions) {
    for (const np of natalPlanets) {
      const aspect = findAspect(tp.deg, np.deg);
      if (aspect) {
        aspects.push({
          type: "aspect",
          planet: tp.name,
          natalPlanet: np.name,
          aspect,
          description: `Transit ${tp.name} is ${aspect} your natal ${np.name}.`,
        });
      }
    }
  }

  // 3. Build raw description for LLM
  const rawParts: string[] = [];
  rawParts.push(`Personal Day Number: ${personalDayNumber}`);
  if (activations.length > 0) {
    rawParts.push(`Gate activations: ${activations.map(a => a.description).join(" ")}`);
  }
  if (aspects.length > 0) {
    rawParts.push(`Aspects: ${aspects.slice(0, 5).map(a => a.description).join(" ")}`);
  }
  rawParts.push(`Transiting planets: ${todayPositions.map(p => `${p.name} in ${degToSign(p.deg).sign} ${degToSign(p.deg).degree}° (Gate ${p.gate})`).join(", ")}`);

  return {
    date: today,
    personalDayNumber,
    activatedGates: activations,
    aspects,
    raw: rawParts.join("\n"),
  };
}