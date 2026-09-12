"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { VillageGltfProp } from "@/components/land-scene/VillageGltfProp";
import { japanVillageCrop } from "@/lib/japan-village";
import type { CropVisual } from "@/lib/resource-visuals";
import {
  CROP_GROWING_SOFT_SWAY,
  CROP_READY_WORLD_PULSE,
} from "@game/shared";

const PLOT_PLANT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.35, -0.35],
  [0.35, -0.35],
  [-0.35, 0.35],
  [0.35, 0.35],
];

/**
 * Planted crop stems — Japan Village GLTF when the pack has a match, kit otherwise.
 */
export function CropPlotPlants({
  visual,
  cropId,
  stemSway,
  stemGlow,
  pulseIntensity,
  isReady,
  isGrowing,
}: {
  visual: CropVisual;
  cropId: string | null | undefined;
  stemSway: number;
  stemGlow: number;
  pulseIntensity: number;
  isReady: boolean;
  isGrowing: boolean;
}) {
  if (visual.state === "empty") return null;
  const model = japanVillageCrop(cropId, visual.state);
  const kit = (
    <CropKitStems
      visual={visual}
      stemSway={stemSway}
      stemGlow={stemGlow}
      pulseIntensity={pulseIntensity}
      isReady={isReady}
      isGrowing={isGrowing}
    />
  );
  if (!model) return kit;
  return (
    <>
      {PLOT_PLANT_OFFSETS.map(([x, z]) => (
        <group
          key={`jv-crop-${x}-${z}`}
          position={[x, 0.24, z]}
          rotation={[0, 0, stemSway]}
        >
          <VillageGltfProp model={model} kit={<></>} />
        </group>
      ))}
    </>
  );
}

function CropKitStems({
  visual,
  stemSway,
  stemGlow,
  pulseIntensity,
  isReady,
  isGrowing,
}: {
  visual: CropVisual;
  stemSway: number;
  stemGlow: number;
  pulseIntensity: number;
  isReady: boolean;
  isGrowing: boolean;
}) {
  return (
    <>
      {[-0.45, -0.15, 0.15, 0.45].flatMap((x) =>
        [-0.45, -0.15, 0.15, 0.45].map((z) => (
          <group
            key={`${x}-${z}`}
            position={[x, 0.24, z]}
            rotation={[0, 0, stemSway]}
          >
            <mesh position={[0, visual.stemHeight / 2, 0]} castShadow>
              <cylinderGeometry
                args={[
                  visual.state === "sprout" ? 0.02 : 0.03,
                  visual.state === "sprout" ? 0.03 : 0.045,
                  visual.stemHeight,
                  5,
                ]}
              />
              <TexturedStandardMaterial
                kind="plaster"
                color={visual.stemColor}
                emissive={
                  isGrowing ? CROP_GROWING_SOFT_SWAY.stemEmissive : "#000000"
                }
                emissiveIntensity={stemGlow}
              />
            </mesh>
            {visual.headColor ? (
              <mesh position={[0, visual.stemHeight + 0.1, 0]} castShadow>
                <sphereGeometry args={[isReady ? 0.11 : 0.07, 6, 6]} />
                <TexturedStandardMaterial
                  kind="plaster"
                  color={visual.headColor}
                  emissive={
                    isReady ? CROP_READY_WORLD_PULSE.headEmissive : "#000000"
                  }
                  emissiveIntensity={isReady ? pulseIntensity : 0}
                />
              </mesh>
            ) : null}
          </group>
        )),
      )}
    </>
  );
}
