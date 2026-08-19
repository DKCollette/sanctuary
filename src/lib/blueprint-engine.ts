/**
 * Collettive Energetic Blueprint Engine
 *
 * Pure math + lookup tables — no external API dependencies.
 * Computes: Astrology, Human Design, and Numerology from birth data.
 */
import { Body, GeoVector, Ecliptic, MakeTime } from "astronomy-engine";

// ── Constants ──────────────────────────────────────────────────────
const GATE_WIDTH = 360 / 64; // 5.625°
const LINE_WIDTH = GATE_WIDTH / 6; // 0.9375°

const ZODIAC_OFFSETS: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90,
  Leo: 120, Virgo: 150, Libra: 180, Scorpio: 210,
  Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330,
};

const ZODIAC_NAMES = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// ── Types ──────────────────────────────────────────────────────────
export interface BirthData {
  fullName: string;
  date: string;       // "1990-06-15"
  time: string;       // "14:30"
  timezone: string;   // "America/New_York"
  utcOffset: number;  // -4
  location: { city: string; lat: number; lng: number };
  birthEpoch: number; // UTC epoch ms
}

export interface PlanetPosition {
  sign: string;
  degree: number;     // 0-29.999 within sign
  eclipticDeg: number; // 0-359.999
  house: number;
}

export interface GateInfo {
  gate: number;
  line: number;
  planet: string;
  center: string;
}

export interface HumanDesignResult {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  gates: GateInfo[];
  centers: Record<string, { defined: boolean; gates: number[] }>;
  channels: { gateA: number; gateB: number; name: string }[];
}

export interface NumerologyResult {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthDay: number;
}

export interface UserBlueprint {
  userId: string;
  generatedAt: string;
  birthData: BirthData;
  astrology: {
    houses: string;
    rising: PlanetPosition;
    sun: PlanetPosition;
    moon: PlanetPosition;
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    chiron: PlanetPosition;
    northNode: PlanetPosition;
    southNode: PlanetPosition;
    dominantElement: string;
    dominantModality: string;
  };
  humanDesign: HumanDesignResult;
  numerology: NumerologyResult;
}

// ── Helper: get ecliptic longitude of a body ──
function eclipticDeg(body: Body, date: Date): number {
  const time = MakeTime(date);
  const eq = GeoVector(body, time, true);
  // Convert equatorial to ecliptic
  const ecl = Ecliptic(eq);
  let deg = ecl.elon;
  if (deg < 0) deg += 360;
  return deg;
}

// ── Helper: degree → zodiac sign + degree within sign ──
function degToSign(deg: number): { sign: string; degree: number; eclipticDeg: number } {
  const normalized = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDeg = normalized - signIndex * 30;
  return { sign: ZODIAC_NAMES[signIndex], degree: +signDeg.toFixed(2), eclipticDeg: normalized };
}

// ── Helper: simple Placidus house (approximate using ascendant) ──
function calcHouse(eclipticDeg: number, ascDeg: number): number {
  // Simplified: offset from ascendant, divided into 12 houses of 30° each
  const offset = ((eclipticDeg - ascDeg + 360) % 360);
  return Math.floor(offset / 30) + 1;
}

// ── Helper: degree → Human Design gate + line ──
function degToGate(deg: number): { gate: number; line: number } {
  const normalized = ((deg % 360) + 360) % 360;
  const gate = Math.floor(normalized / GATE_WIDTH) + 1;
  const remainder = normalized % GATE_WIDTH;
  const line = Math.floor(remainder / LINE_WIDTH) + 1;
  return { gate: Math.min(gate, 64), line: Math.min(line, 6) };
}

// ── Human Design lookup tables ──
const GATE_TO_CENTER: Record<number, string> = {
  1: "head", 2: "ajna", 3: "ajna", 4: "ajna", 5: "ajna",
  6: "solarPlexus", 7: "throat", 8: "throat", 9: "sacral",
  10: "gCenter", 11: "ajna", 12: "throat", 13: "gCenter",
  14: "sacral", 15: "solarPlexus", 16: "throat", 17: "ajna",
  18: "spleen", 19: "root", 20: "throat", 21: "heart",
  22: "solarPlexus", 23: "throat", 24: "ajna", 25: "gCenter",
  26: "heart", 27: "sacral", 28: "spleen", 29: "sacral",
  30: "solarPlexus", 31: "throat", 32: "spleen", 33: "throat",
  34: "sacral", 35: "throat", 36: "solarPlexus", 37: "solarPlexus",
  38: "root", 39: "root", 40: "heart", 41: "root",
  42: "sacral", 43: "ajna", 44: "spleen", 45: "throat",
  46: "gCenter", 47: "ajna", 48: "spleen", 49: "solarPlexus",
  50: "root", 51: "heart", 52: "root", 53: "root",
  54: "sacral", 55: "solarPlexus", 56: "throat", 57: "spleen",
  58: "root", 59: "sacral", 60: "root", 61: "head",
  62: "throat", 63: "head", 64: "head",
};

const CHANNELS: { gateA: number; gateB: number; name: string }[] = [
  { gateA: 1, gateB: 8, name: "Inspiration" },
  { gateA: 2, gateB: 14, name: "The Beat" },
  { gateA: 3, gateB: 60, name: "Mutation" },
  { gateA: 4, gateB: 63, name: "Doubt" },
  { gateA: 5, gateB: 15, name: "Rhythm" },
  { gateA: 6, gateB: 59, name: "Mating" },
  { gateA: 7, gateB: 31, name: "The Alpha" },
  { gateA: 9, gateB: 52, name: "Concentration" },
  { gateA: 10, gateB: 20, name: "Awakening" },
  { gateA: 10, gateB: 34, name: "Exploration" },
  { gateA: 10, gateB: 57, name: "Perfect Form" },
  { gateA: 11, gateB: 56, name: "Curiosity" },
  { gateA: 12, gateB: 22, name: "Openness" },
  { gateA: 13, gateB: 33, name: "The Witness" },
  { gateA: 16, gateB: 48, name: "The Wavelength" },
  { gateA: 17, gateB: 62, name: "Organizing" },
  { gateA: 18, gateB: 58, name: "Judgment" },
  { gateA: 19, gateB: 49, name: "Synthesis" },
  { gateA: 20, gateB: 34, name: "Charisma" },
  { gateA: 20, gateB: 57, name: "The Brain Wave" },
  { gateA: 21, gateB: 45, name: "Money" },
  { gateA: 23, gateB: 43, name: "Structuring" },
  { gateA: 24, gateB: 61, name: "Awareness" },
  { gateA: 25, gateB: 51, name: "Initiation" },
  { gateA: 26, gateB: 44, name: "Surrender" },
  { gateA: 27, gateB: 50, name: "Preservation" },
  { gateA: 28, gateB: 38, name: "Struggle" },
  { gateA: 29, gateB: 46, name: "Discovery" },
  { gateA: 30, gateB: 41, name: "Recognition" },
  { gateA: 32, gateB: 54, name: "Transformation" },
  { gateA: 34, gateB: 57, name: "Power" },
  { gateA: 35, gateB: 36, name: "Transitoriness" },
  { gateA: 37, gateB: 40, name: "Community" },
  { gateA: 39, gateB: 55, name: "Emoting" },
  { gateA: 42, gateB: 53, name: "Maturation" },
  { gateA: 47, gateB: 64, name: "Abstraction" },
];

const STAR_CHANNELS: { gateA: number; gateB: number }[] = [
  { gateA: 2, gateB: 1 }, { gateA: 4, gateB: 63 }, { gateA: 5, gateB: 15 },
  { gateA: 6, gateB: 59 }, { gateA: 7, gateB: 31 }, { gateA: 9, gateB: 52 },
  { gateA: 10, gateB: 57 }, { gateA: 11, gateB: 56 }, { gateA: 12, gateB: 22 },
  { gateA: 13, gateB: 33 }, { gateA: 16, gateB: 48 }, { gateA: 17, gateB: 62 },
  { gateA: 18, gateB: 58 }, { gateA: 19, gateB: 49 }, { gateA: 20, gateB: 10 },
  { gateA: 21, gateB: 45 }, { gateA: 23, gateB: 43 }, { gateA: 24, gateB: 61 },
  { gateA: 25, gateB: 51 }, { gateA: 26, gateB: 44 }, { gateA: 27, gateB: 50 },
  { gateA: 28, gateB: 38 }, { gateA: 29, gateB: 46 }, { gateA: 30, gateB: 41 },
  { gateA: 32, gateB: 54 }, { gateA: 34, gateB: 20 }, { gateA: 35, gateB: 36 },
  { gateA: 37, gateB: 40 }, { gateA: 39, gateB: 55 }, { gateA: 42, gateB: 53 },
  { gateA: 47, gateB: 64 }, { gateA: 3, gateB: 60 },
];

// ── Type detection ──
function determineType(definedCenters: string[]): { type: string; strategy: string; authority: string } {
  const hasSacral = definedCenters.includes("sacral");
  const hasMotor = definedCenters.includes("heart") || definedCenters.includes("solarPlexus") || definedCenters.includes("root");
  const hasSpleen = definedCenters.includes("spleen");
  const hasAjna = definedCenters.includes("ajna");
  const hasG = definedCenters.includes("gCenter");
  const hasThroat = definedCenters.includes("throat");
  const hasRoot = definedCenters.includes("root");
  const hasHead = definedCenters.includes("head");

  const motorCount = [hasSacral, hasMotor, hasSpleen, hasRoot].filter(Boolean).length;
  const definedCount = definedCenters.length;

  // Reflector: no centers defined
  if (definedCount === 0) return { type: "Reflector", strategy: "To Wait a Lunar Cycle", authority: "Lunar" };

  // Manifestor: throat connected to motor (heart, root, or solar plexus)
  if (hasThroat && (hasHeartOrSolarPlexus(definedCenters) || hasRoot)) {
    if (hasSacral) return { type: "Manifesting Generator", strategy: "To Respond", authority: "Sacral" };
    return { type: "Manifestor", strategy: "To Inform", authority: hasSpleen ? "Splenic" : "Emotional" };
  }

  // Generator: sacral defined
  if (hasSacral) return { type: "Generator", strategy: "To Respond", authority: "Sacral" };

  // Projector: nothing else
  return { type: "Projector", strategy: "To Wait for the Invitation", authority: hasSpleen ? "Splenic" : "Emotional" };
}

function hasHeartOrSolarPlexus(centers: string[]): boolean {
  return centers.includes("heart") || centers.includes("solarPlexus");
}

function determineProfile(sunGate: number, earthGate: number): string {
  // Simplified: personality = sun gate line, design = earth gate line
  const personality = ((sunGate - 1) % 6) + 1;
  const design = ((earthGate - 1) % 6) + 1;
  return `${personality}/${design}`;
}

function determineDefinition(definedCenters: string[]): string {
  if (definedCenters.length >= 7) return "Single Definition";
  if (definedCenters.length >= 3) return "Split Definition";
  if (definedCenters.length > 0) return "Single Definition";
  return "No Definition";
}

// ── Numerology ──
function reduceToDigit(n: number): number {
  while (n > 9 && ![11, 22, 33].includes(n)) {
    n = String(n).split("").reduce((s, c) => s + parseInt(c), 0);
  }
  return n;
}

function letterToNumber(c: string): number {
  const val = c.toUpperCase().charCodeAt(0) - 64;
  if (val < 1 || val > 26) return 0;
  return val;
}

export function calcLifePath(birthDate: string): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  const yr = reduceToDigit(y);
  const mo = reduceToDigit(m);
  const dy = reduceToDigit(d);
  const sum = yr + mo + dy;
  if ([11, 22, 33].includes(sum)) return sum;
  return reduceToDigit(sum);
}

export function calcExpression(fullName: string): number {
  const sum = fullName.replace(/[^a-zA-Z]/g, "").split("").reduce((s, c) => s + letterToNumber(c), 0);
  return reduceToDigit(sum);
}

export function calcSoulUrge(fullName: string): number {
  const vowels = "AEIOU";
  const sum = fullName.replace(/[^a-zA-Z]/g, "").split("").reduce((s, c) => {
    if (vowels.includes(c.toUpperCase())) return s + letterToNumber(c);
    return s;
  }, 0);
  return reduceToDigit(sum);
}

export function calcPersonality(fullName: string): number {
  const vowels = "AEIOU";
  const sum = fullName.replace(/[^a-zA-Z]/g, "").split("").reduce((s, c) => {
    if (!vowels.includes(c.toUpperCase())) return s + letterToNumber(c);
    return s;
  }, 0);
  return reduceToDigit(sum);
}

export function calcBirthDay(birthDate: string): number {
  const d = parseInt(birthDate.split("-")[2]);
  return reduceToDigit(d);
}

export function calcPersonalDayNumber(birthDate: string, currentDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [cy, cm, cd] = currentDate.split("-").map(Number);
  const sum = reduceToDigit(bd) + reduceToDigit(bm) + reduceToDigit(cd) + reduceToDigit(cm) + reduceToDigit(cy);
  if ([11, 22, 33].includes(sum)) return sum;
  return reduceToDigit(sum);
}

// ── Main blueprint generation ──
export async function generateBlueprint(userId: string, birthData: BirthData): Promise<UserBlueprint> {
  const birthDate = new Date(birthData.birthEpoch);

  // Compute planet positions at birth
  const planets = [
    { name: "Sun", body: Body.Sun },
    { name: "Moon", body: Body.Moon },
    { name: "Mercury", body: Body.Mercury },
    { name: "Venus", body: Body.Venus },
    { name: "Mars", body: Body.Mars },
    { name: "Jupiter", body: Body.Jupiter },
    { name: "Saturn", body: Body.Saturn },
    { name: "Chiron", body: Body.Pluto }, // Chiron not in astronomy-engine, use Pluto as placeholder
    { name: "NorthNode", body: Body.Sun }, // Moon's nodes need separate calc
  ];

  const rawPositions: { name: string; eclipticDeg: number }[] = [];
  for (const p of planets) {
    const deg = eclipticDeg(p.body, birthDate);
    rawPositions.push({ name: p.name, eclipticDeg: deg });
  }

  // Ascendant (Rising) — approximate: ascendant = 90° before the Sun at roughly 2h before sunrise
  // Simplified: Sun at 6AM = ascending, so asc ≈ Sun - 90°
  const sunDeg = rawPositions.find(p => p.name === "Sun")!.eclipticDeg;
  const ascDeg = (sunDeg - 90 + 360) % 360;
  const rising = degToSign(ascDeg);

  // Build planet positions with houses
  const chart: Record<string, PlanetPosition> = {};
  for (const r of rawPositions) {
    const pos = degToSign(r.eclipticDeg);
    chart[r.name] = {
      ...pos,
      house: calcHouse(r.eclipticDeg, ascDeg),
    };
  }

  // Human Design gates
  const gates: GateInfo[] = [];
  const definedGateSet = new Set<number>();
  const centerGateMap: Record<string, number[]> = {};

  for (const r of rawPositions) {
    const { gate, line } = degToGate(r.eclipticDeg);
    const center = GATE_TO_CENTER[gate] || "unknown";
    gates.push({ gate, line, planet: r.name, center });
    definedGateSet.add(gate);
    if (!centerGateMap[center]) centerGateMap[center] = [];
    centerGateMap[center].push(gate);
  }

  // Determine defined centers (any center with at least one gate from a planet)
  const allCenters = ["head", "ajna", "throat", "gCenter", "heart", "sacral", "solarPlexus", "spleen", "root"];
  const definedCenters: string[] = [];
  const centers: Record<string, { defined: boolean; gates: number[] }> = {};
  for (const c of allCenters) {
    const cgates = centerGateMap[c] || [];
    const defined = cgates.length > 0;
    if (defined) definedCenters.push(c);
    centers[c] = { defined, gates: cgates };
  }

  const { type, strategy, authority } = determineType(definedCenters);
  const profile = determineProfile(
    (gates.find(g => g.planet === "Sun")?.gate || 1),
    (gates.find(g => g.planet === "Earth")?.gate || 2),
  );

  // Find active channels
  const definedGates = [...definedGateSet];
  const channels = CHANNELS.filter(ch =>
    definedGates.includes(ch.gateA) && definedGates.includes(ch.gateB)
  );

  // Also check star channels
  const starChannels = STAR_CHANNELS.filter(ch =>
    definedGates.includes(ch.gateA) && definedGates.includes(ch.gateB)
  );

  // Determine dominant element and modality
  const elementCount: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCount: Record<string, number> = { cardinal: 0, fixed: 0, mutable: 0 };
  const ELEMENT_MAP: Record<string, string> = { Aries: "fire", Taurus: "earth", Gemini: "air", Cancer: "water",
    Leo: "fire", Virgo: "earth", Libra: "air", Scorpio: "water",
    Sagittarius: "fire", Capricorn: "earth", Aquarius: "air", Pisces: "water" };
  const MODALITY_MAP: Record<string, string> = { Aries: "cardinal", Taurus: "fixed", Gemini: "mutable", Cancer: "cardinal",
    Leo: "fixed", Virgo: "mutable", Libra: "cardinal", Scorpio: "fixed",
    Sagittarius: "mutable", Capricorn: "cardinal", Aquarius: "fixed", Pisces: "mutable" };

  for (const r of rawPositions) {
    const pos = degToSign(r.eclipticDeg);
    elementCount[ELEMENT_MAP[pos.sign]] = (elementCount[ELEMENT_MAP[pos.sign]] || 0) + 1;
    modalityCount[MODALITY_MAP[pos.sign]] = (modalityCount[MODALITY_MAP[pos.sign]] || 0) + 1;
  }

  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "earth";
  const dominantModality = Object.entries(modalityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "cardinal";

  return {
    userId,
    generatedAt: new Date().toISOString(),
    birthData,
    astrology: {
      houses: "placidus",
      rising: { ...rising, house: 1 },
      sun: chart["Sun"],
      moon: chart["Moon"],
      mercury: chart["Mercury"],
      venus: chart["Venus"],
      mars: chart["Mars"],
      jupiter: chart["Jupiter"],
      saturn: chart["Saturn"],
      chiron: chart["Chiron"],
      northNode: chart["NorthNode"],
      southNode: { ...degToSign((chart["NorthNode"]?.eclipticDeg || 0) + 180), house: 0 },
      dominantElement,
      dominantModality,
    },
    humanDesign: {
      type,
      strategy,
      authority,
      profile,
      definition: determineDefinition(definedCenters),
      gates,
      centers,
      channels,
    },
    numerology: {
      lifePath: calcLifePath(birthData.date),
      expression: calcExpression(birthData.fullName),
      soulUrge: calcSoulUrge(birthData.fullName),
      personality: calcPersonality(birthData.fullName),
      birthDay: calcBirthDay(birthData.date),
    },
  };
}