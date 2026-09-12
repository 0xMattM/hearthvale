"use client";

import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { HuntWildlifeKit } from "@/components/land-scene/HuntWildlifeKit";

export type CombatFoeKind = "hare" | "boar" | "dummy";

interface CombatHuntCreatureProps {
  kind: CombatFoeKind;
  hideColor: string;
  hornColor: string;
  ready: boolean;
  lunging: boolean;
}

/**
 * Readable hare / boar / dummy silhouette for hunt and arena fights.
 *
 * @param props - Kind, hide colors, ready flag, and lunge telegraph.
 */
export function CombatHuntCreature({
  kind,
  hideColor,
  hornColor,
  ready,
  lunging,
}: CombatHuntCreatureProps) {
  if (kind === "dummy") {
    return (
      <>
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.12, 0.72, 8]} />
          <TexturedStandardMaterial kind="bark" color="#6a4a28" roughness={0.85} metalness={0} />
        </mesh>
        <mesh castShadow>
          <cylinderGeometry args={[0.24, 0.28, 0.58, 10]} />
          <TexturedStandardMaterial kind="plaster" color="#c4a070" roughness={0.7} metalness={0} />
        </mesh>
        <mesh position={[0, 0.44, 0]} castShadow>
          <sphereGeometry args={[0.2, 10, 10]} />
          <TexturedStandardMaterial kind="plaster" color="#d8c090" roughness={0.65} metalness={0} />
        </mesh>
        <mesh position={[0.08, 0.5, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#2a2018" />
        </mesh>
        <mesh position={[-0.08, 0.5, 0.14]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#2a2018" />
        </mesh>
        <mesh position={[0.3, 0.06, 0]} rotation={[0, 0, 0.42]} castShadow>
          <boxGeometry args={[0.09, 0.5, 0.09]} />
          <TexturedStandardMaterial kind="bark" color="#8a6038" roughness={0.8} metalness={0} />
        </mesh>
        <mesh position={[-0.3, 0.06, 0]} rotation={[0, 0, -0.42]} castShadow>
          <boxGeometry args={[0.09, 0.5, 0.09]} />
          <TexturedStandardMaterial kind="bark" color="#8a6038" roughness={0.8} metalness={0} />
        </mesh>
      </>
    );
  }

  const fur = ready ? hideColor : "#5a5048";
  const eye = lunging ? "#c45a48" : "#1a1410";
  return (
    <HuntWildlifeKit
      isBoar={kind === "boar"}
      fur={fur}
      hornColor={hornColor}
      eye={eye}
      lunging={lunging}
    />
  );
}
