import fs from "node:fs";

const p = "apps/web/components/land-scene/BuildingMesh.tsx";
let s = fs.readFileSync(p, "utf8");

const fns = [
  "MillBuilding",
  "ForgeBuilding",
  "KitchenBuilding",
  "WorkshopBuilding",
  "LoomBuilding",
  "AlchemyBenchBuilding",
];

for (const fn of fns) {
  const start = s.indexOf(`function ${fn}({`);
  if (start < 0) {
    console.error("missing fn", fn);
    continue;
  }
  const marker = "craftWorking = false,";
  const j = s.indexOf(marker, start);
  if (j < 0 || j > start + 900) {
    console.error("no default", fn);
    continue;
  }
  if (s.slice(j, j + 60).includes("craft = null")) continue;
  s =
    s.slice(0, j) +
    "craftWorking = false,\n  craft = null,\n  " +
    s.slice(j + marker.length);
}

// Type props after craftWorking?: boolean;
s = s.replaceAll(
  "craftWorking?: boolean;\n  /** PL131.1",
  'craftWorking?: boolean;\n  craft?: { state: "working" | "ready"; isYours: boolean } | null;\n  /** PL131.1',
);
s = s.replaceAll(
  "craftWorking?: boolean;\n  craftCompleteFlash?: boolean;",
  'craftWorking?: boolean;\n  craft?: { state: "working" | "ready"; isYours: boolean } | null;\n  craftCompleteFlash?: boolean;',
);

s = s.replaceAll(
  /<ProcessStationWorldLabel type="([^"]+)" y=\{([^}]+)\} \/>/g,
  '<ProcessStationWorldLabel type="$1" y={$2} craft={craft} />',
);

fs.writeFileSync(p, s);
console.log("patched", fns.length);
