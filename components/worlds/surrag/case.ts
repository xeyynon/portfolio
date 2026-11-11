/**
 * The worked example for "From a report to a lead": two short reports and
 * what each step of the pipeline makes of them. Pure data, no DOM.
 *
 * Everything here is made up for the picture: the reports, the names, the
 * places and the lead. The steps and what they do are the project's own; the
 * page says the rest is invented.
 */

export type Kind = "person" | "place";

/** A run of a report's text. An entity is a run the extraction step picks out. */
export type Run = { text: string; entity?: { kind: Kind; person?: string } };

export type Report = { id: string; runs: Run[] };

export const REPORTS: Report[] = [
  {
    id: "FIR 1",
    runs: [
      { text: "The complainant states that on the night of the theft a man named " },
      { text: "Ravi Kumar", entity: { kind: "person", person: "ravi" } },
      { text: " was seen near the market at " },
      { text: "Old Town", entity: { kind: "place" } },
      { text: " with a second man, " },
      { text: "Suresh", entity: { kind: "person", person: "suresh" } },
      { text: "." },
    ],
  },
  {
    id: "FIR 2",
    runs: [
      { text: "A shop owner reports a break-in. Witnesses name " },
      { text: "R. Kumar", entity: { kind: "person", person: "ravi" } },
      { text: ", who was seen earlier with " },
      { text: "Imran", entity: { kind: "person", person: "imran" } },
      { text: " near the " },
      { text: "bus depot", entity: { kind: "place" } },
      { text: "." },
    ],
  },
];

/** The steps, in the order of the project's own pipeline. */
export const STEPS = [
  { key: "report", label: "Report", text: "Two reports, filed as separate cases. Nothing yet says they are connected." },
  {
    key: "extract",
    label: "Extraction",
    text: "An LLM marks the entities in each report: here, people and places. spaCy and regex step in where it falls short.",
  },
  {
    key: "resolve",
    label: "Resolution",
    text: "Fuzzy person resolution matches “R. Kumar” in FIR 2 to “Ravi Kumar” in FIR 1: one person, named two ways.",
  },
  {
    key: "graph",
    label: "Case graph",
    text: "The two cases and the people in them go into one graph. The cases now meet at one person.",
  },
  {
    key: "lead",
    label: "Lead",
    text: "The connection comes out as a lead, and every lead carries its citations: the lines in the reports it rests on.",
  },
] as const;

export const EXTRACT_STEP = 1;
export const RESOLVE_STEP = 2;
export const GRAPH_STEP = 3;
export const LEAD_STEP = 4;

/** The resolved people, and which reports name each of them. */
export const PEOPLE: { key: string; name: string; reports: string[] }[] = [
  { key: "suresh", name: "Suresh", reports: ["FIR 1"] },
  { key: "ravi", name: "Ravi Kumar", reports: ["FIR 1", "FIR 2"] },
  { key: "imran", name: "Imran", reports: ["FIR 2"] },
];

/** The name a person is resolved to, when a report names them some other way. */
export const resolvedName = (person: string, asWritten: string) => {
  const name = PEOPLE.find((p) => p.key === person)?.name;
  return name && name !== asWritten ? name : null;
};

/** The lead, and the lines it cites. */
export const LEAD = {
  text: "FIR 1 and FIR 2 share one person: Ravi Kumar, written “R. Kumar” in FIR 2. Suresh and Imran are each one step from him.",
  citations: [
    { report: "FIR 1", line: "a man named Ravi Kumar was seen near the market" },
    { report: "FIR 2", line: "Witnesses name R. Kumar" },
  ],
} as const;
