import { describe, expect, it } from "vitest";
import {
  PROCESS_STATION_TYPES,
  PLAYER_LAND_STATIONS,
} from "@game/shared";
import {
  PROCESS_STATION_SILHOUETTE,
  processStationIsFurniture,
  processStationLabelY,
} from "../../apps/web/lib/process-station-silhouette";

/**
 * Process-station kits must read as furniture (workbench, hearth, stove…)
 * rather than identical mini sheds.
 */
describe("process station silhouettes", () => {
  it("matches catalog names and furniture forms (happy)", () => {
    for (const type of PROCESS_STATION_TYPES) {
      const spec = PROCESS_STATION_SILHOUETTE[type];
      expect(spec.catalogName).toBe(PLAYER_LAND_STATIONS[type].name);
      expect(processStationIsFurniture(type)).toBe(true);
      expect(spec.signature.length).toBeGreaterThanOrEqual(3);
      expect(processStationLabelY(type)).toBeGreaterThan(1);
    }
    expect(PROCESS_STATION_SILHOUETTE.workshop.form).toBe("workbench");
    expect(PROCESS_STATION_SILHOUETTE.forge.form).toBe("hearth");
    expect(PROCESS_STATION_SILHOUETTE.kitchen.form).toBe("stove");
    expect(PROCESS_STATION_SILHOUETTE.mill.form).toBe("windmill");
    expect(PROCESS_STATION_SILHOUETTE.loom.form).toBe("frame");
    expect(PROCESS_STATION_SILHOUETTE.alchemy_bench.form).toBe("bench");
  });

  it("keeps mill tower roof and drops shed roofs on craft benches (edge)", () => {
    expect(PROCESS_STATION_SILHOUETTE.mill.hasShedRoof).toBe(true);
    expect(PROCESS_STATION_SILHOUETTE.mill.signature).toContain("sails");
    expect(processStationLabelY("mill")).toBeGreaterThan(5);
    for (const type of PROCESS_STATION_TYPES) {
      if (type === "mill") continue;
      expect(PROCESS_STATION_SILHOUETTE[type].hasShedRoof).toBe(false);
    }
  });

  it("does not treat gather stations as process furniture (failure)", () => {
    expect("crop_plot" in PROCESS_STATION_SILHOUETTE).toBe(false);
    expect("tree_stump" in PROCESS_STATION_SILHOUETTE).toBe(false);
    expect("fishing_dock" in PROCESS_STATION_SILHOUETTE).toBe(false);
    expect("animal_pen" in PROCESS_STATION_SILHOUETTE).toBe(false);
    expect(PROCESS_STATION_SILHOUETTE.workshop.form).not.toBe("shed");
    expect(PROCESS_STATION_SILHOUETTE.forge.form).not.toBe("shed");
  });
});
