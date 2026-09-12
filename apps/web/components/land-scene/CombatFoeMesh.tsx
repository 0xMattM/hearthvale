"use client";

import {
  ARENA_DUMMY,
  EDGE_CREATURE,
  TRAIL_CREATURE,
  stepCombatFoeDisplay,
  huntFoeIdleOffset,
  huntDenSeed,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group, MeshStandardMaterial } from "three";
import { CombatHuntCreature, type CombatFoeKind } from "@/components/land-scene/CombatHuntCreature";
import { combatFoePlateY, combatFoeStandY } from "@/lib/wild-animals";
import {
  combatVisualForBuilding,
  useCombatVisual,
} from "@/components/land-scene/combat-visual-context";
import { usePlayerViewPos } from "@/components/land-scene/PlayerViewContext";
import { WorldHtml } from "@/components/land-scene/WorldHtml";

export type { CombatFoeKind };

interface CombatFoeMeshProps {
  kind: CombatFoeKind;
  buildingId: string;
  ready: boolean;
  hideColor: string;
  hornColor?: string;
  padX: number;
  padZ: number;
}

function idleFoeName(kind: CombatFoeKind): string {
  if (kind === "boar") return EDGE_CREATURE.name;
  if (kind === "dummy") return ARENA_DUMMY.name;
  return TRAIL_CREATURE.name;
}

/**
 * Wildlife / dummy mesh: patrols grass, telegraphs aggro, then locks to the live fight.
 *
 * @param props - Kind, den, ready flag, and hide colors.
 */
export function CombatFoeMesh({
  kind,
  buildingId,
  ready,
  hideColor,
  hornColor = "#e8d8b0",
  padX,
  padZ,
}: CombatFoeMeshProps) {
  const visual = useCombatVisual();
  const local = combatVisualForBuilding(buildingId, visual);
  const playerPosRef = usePlayerViewPos();
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const chasingRef = useRef(false);
  const [chasing, setChasing] = useState(false);
  const seed = huntDenSeed(buildingId);
  const spawn = huntFoeIdleOffset(kind, seed);
  const shown = useRef({
    x: spawn.x,
    z: spawn.z,
    yaw: Math.atan2(spawn.x, spawn.z),
  });
  const baseY = combatFoeStandY(kind);

  useFrame((_, dt) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    const now = performance.now();
    const player = playerPosRef?.current;
    const next = stepCombatFoeDisplay({
      kind,
      dt,
      x: shown.current.x,
      z: shown.current.z,
      yaw: shown.current.yaw,
      playerLocalX: player ? player.x - padX : 99,
      playerLocalZ: player ? player.z - padZ : 99,
      timeSec: now / 1000,
      seed,
      ready,
      combatActive: local.active,
      serverOffsetX: local.offsetX,
      serverOffsetZ: local.offsetZ,
      serverYaw: local.yaw,
    });
    shown.current = { x: next.x, z: next.z, yaw: next.yaw };
    g.position.x = next.x;
    g.position.z = next.z;
    g.rotation.y = next.yaw;

    if (next.chasing !== chasingRef.current) {
      chasingRef.current = next.chasing;
      setChasing(next.chasing);
    }

    const hit = local.hitAt != null ? Math.max(0, 1 - (now - local.hitAt) / 280) : 0;
    const lunge = local.pose === "lunge" ? 1 : 0;
    b.position.y = baseY + hit * 0.14;
    b.rotation.z = (local.pose === "hit" ? -0.22 : 0) * hit;
    b.rotation.x = 0;
    g.scale.setScalar(1 + hit * 0.06);

    if (ringMat.current) {
      const show = local.active || next.chasing;
      ringMat.current.opacity = show ? 0.42 + lunge * 0.4 : 0;
      ringMat.current.emissiveIntensity = (next.chasing ? 0.55 : 0) + lunge * 0.9;
    }
  });

  const hpPct = Math.round(local.foeHealthRatio * 100);
  const plateY = combatFoePlateY(kind);
  const name = local.active && local.foeName ? local.foeName : idleFoeName(kind);

  if (!ready && kind !== "dummy") return null;

  return (
    <group ref={root}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.42, 0.58, 24]} />
        <meshStandardMaterial
          ref={ringMat}
          color={local.pose === "lunge" || chasing ? "#d9776f" : "#c4a35a"}
          emissive={local.pose === "lunge" || chasing ? "#d9776f" : "#c4a35a"}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <group ref={body} position={[0, baseY, 0]}>
        <CombatHuntCreature
          kind={kind}
          hideColor={hideColor}
          hornColor={hornColor}
          ready={ready}
          lunging={local.pose === "lunge"}
        />
      </group>
      <WorldHtml position={[0, plateY, 0]} center style={{ pointerEvents: "none" }}>
        <div
          className="combat-world-plate"
          data-testid="combat-world-plate"
          data-lunge={local.pose === "lunge" ? "1" : "0"}
          data-chasing={chasing || local.active ? "1" : "0"}
          data-fighting={local.active ? "1" : "0"}
        >
          {chasing && !local.active ? (
            <div className="combat-world-plate__aggro">!</div>
          ) : null}
          <div className="combat-world-plate__name">{name}</div>
          {local.active ? (
            <div className="combat-world-plate__bar">
              <span style={{ width: `${hpPct}%` }} />
            </div>
          ) : (
            <div className="combat-world-plate__hint">Hostile</div>
          )}
        </div>
      </WorldHtml>
    </group>
  );
}
