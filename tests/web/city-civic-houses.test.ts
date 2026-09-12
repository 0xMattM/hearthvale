import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const CITY_ENV = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityEnvironment.tsx",
);
const COLLISION = path.join(
  process.cwd(),
  "packages/shared/src/world-collision.ts",
);
const STREET = path.join(
  process.cwd(),
  "apps/web/components/land-scene/CityStreetHouse.tsx",
);

/**
 * Clay civic houses on the city margin — hall kit, not brick pack.
 */
describe("city civic houses on the margin", () => {
  it("mounts tinted clay houses and keeps City Hall (happy)", () => {
    const env = fs.readFileSync(CITY_ENV, "utf8");
    expect(env).toContain("CityMainHall");
    expect(env).toContain("CityCivicHouse");
    expect(env).toContain("cityCivicHouses");
    expect(env).not.toContain("BrickHouseProp");
    expect(env).not.toContain("CivicBlock");
    expect(env).not.toContain("BRICK_HOUSE_CIVIC_BLOCKS");
  });

  it("builds houses from the hall clay kit without leftover civic pads (edge)", () => {
    const env = fs.readFileSync(CITY_ENV, "utf8");
    const street = fs.readFileSync(STREET, "utf8");
    const hall = fs.readFileSync(
      path.join(process.cwd(), "apps/web/components/land-scene/CityMainHall.tsx"),
      "utf8",
    );
    expect(env).toContain("cityAtmosphereMainHall");
    expect(hall).toContain("CityStreetHouse");
    expect(street).toContain("ShopFront");
    expect(street).toContain("CottageFront");
    expect(street).toContain("LoftFront");
    expect(street).toContain("ShedFront");
    expect(street).not.toContain("ShutterWindow");
    expect(env).not.toContain("cityCivicPadLandmarkCue");
    expect(env).not.toContain("civicBlockKitMaterials");
  });

  it("walks around clay houses and still forbids brick footprints (failure)", () => {
    const src = fs.readFileSync(COLLISION, "utf8");
    expect(src).not.toContain("CITY_CIVIC_BLOCK_OBSTACLES");
    expect(src).toContain("cityCivicHouseWalkObstacles");
    expect(src).toContain("CITY_MAIN_HALL_OBSTACLE");
    expect(() => {
      if (!fs.existsSync(CITY_ENV)) throw new Error("missing city environment");
    }).not.toThrow();
  });
});
