"use client";

import type { LandKind } from "@game/shared";
import {
  clampWalkPosition,
  clampWalkInsideCityPerimeter,
  heldCombatWeaponKind,
  mapSpawnPosition,
  resolveWalkAgainstObstacles,
  type WalkObstacle,
} from "@game/shared";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import { AvatarKit } from "@/components/land-scene/AvatarKit";
import { shouldLoadAvatarGltf } from "@/lib/avatar-art";
import { applyAvatarWalkPose, avatarCombatOverlay, avatarWalkPose } from "@/lib/avatar-walk";
import { cameraRelativeWalk } from "@/lib/camera-relative-walk";

const SPEED = 4.4;
const MOVE_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

interface PlayerAvatarProps {
  onPosition: (x: number, z: number) => void;
  /** Active map — quiet cloak/kit tint for self presence (PL122.1). */
  landKind?: LandKind;
  /** Creditcoin NFT plot size — walk clamp larger than the free yard. */
  nftLandSize?: string | null;
  /** Solid footprints so the avatar cannot walk through stations / NPCs. */
  obstacles?: ReadonlyArray<WalkObstacle>;
  /** Live foe world XZ so the avatar faces the fight. */
  combatFoeWorld?: { x: number; z: number } | null;
  combatGuarding?: boolean;
  combatSwingAt?: number | null;
  /** Equipped combat weapon catalog id (null when unarmed). */
  combatWeaponItemId?: string | null;
}

/**
 * Playable avatar — KayKit GLB when installed, kit fallback otherwise.
 */
export function PlayerAvatar({
  onPosition,
  landKind,
  nftLandSize = null,
  obstacles = [],
  combatFoeWorld = null,
  combatGuarding = false,
  combatSwingAt = null,
  combatWeaponItemId = null,
}: PlayerAvatarProps) {
  const ref = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const body = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const onPositionRef = useRef(onPosition);
  onPositionRef.current = onPosition;
  const landKindRef = useRef(landKind);
  landKindRef.current = landKind;
  const nftLandSizeRef = useRef(nftLandSize);
  nftLandSizeRef.current = nftLandSize;
  const obstaclesRef = useRef(obstacles);
  obstaclesRef.current = obstacles;
  const combatFoeRef = useRef(combatFoeWorld);
  combatFoeRef.current = combatFoeWorld;
  const combatGuardRef = useRef(combatGuarding);
  combatGuardRef.current = combatGuarding;
  const combatSwingAtRef = useRef(combatSwingAt);
  combatSwingAtRef.current = combatSwingAt;
  const combatWeaponItemIdRef = useRef(combatWeaponItemId);
  combatWeaponItemIdRef.current = combatWeaponItemId;
  const lastReported = useRef({ x: Number.NaN, z: Number.NaN });
  const walkPhase = useRef(0);
  const moveAmp = useRef(0);
  const idleTime = useRef(0);
  const spawn = mapSpawnPosition(landKind);

  useEffect(() => {
    function down(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (MOVE_CODES.has(e.code)) e.preventDefault();
      keys.current[e.code] = true;
    }
    function up(e: KeyboardEvent) {
      keys.current[e.code] = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function applyConstraints(x: number, z: number): { x: number; z: number } {
    const cleared = resolveWalkAgainstObstacles(
      x,
      z,
      obstaclesRef.current,
    );
    const dry = clampWalkInsideCityPerimeter(
      cleared.x,
      cleared.z,
      landKindRef.current,
    );
    return clampWalkPosition(
      dry.x,
      dry.z,
      landKindRef.current,
      nftLandSizeRef.current,
    );
  }

  // Reason: arriving on a map teleports to that map's spawn (City = City Hall / Governor).
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const spawnAt = mapSpawnPosition(landKindRef.current);
    const next = applyConstraints(spawnAt.x, spawnAt.z);
    group.position.x = next.x;
    group.position.z = next.z;
    lastReported.current = { x: next.x, z: next.z };
    onPositionRef.current(next.x, next.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyConstraints reads refs
  }, [landKind]);

  // Reason: obstacle set must pull the avatar out of solids without resetting spawn.
  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    const next = applyConstraints(group.position.x, group.position.z);
    group.position.x = next.x;
    group.position.z = next.z;
    lastReported.current = { x: next.x, z: next.z };
    onPositionRef.current(next.x, next.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyConstraints reads refs
  }, [obstacles, nftLandSize]);

  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    let inputX = 0;
    let inputZ = 0;
    if (keys.current.KeyW || keys.current.ArrowUp) inputZ -= 1;
    if (keys.current.KeyS || keys.current.ArrowDown) inputZ += 1;
    if (keys.current.KeyA || keys.current.ArrowLeft) inputX -= 1;
    if (keys.current.KeyD || keys.current.ArrowRight) inputX += 1;
    // Reason: isometric follow sits on +X/+Z; world-axis WASD reads as diagonal on screen.
    const { dx, dz } = cameraRelativeWalk(inputX, inputZ);
    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      const proposedX = group.position.x + dx * SPEED * dt;
      const proposedZ = group.position.z + dz * SPEED * dt;
      const next = applyConstraints(proposedX, proposedZ);
      group.position.x = next.x;
      group.position.z = next.z;
      group.rotation.y = Math.atan2(dx, dz);
    } else {
      const foe = combatFoeRef.current;
      if (foe) {
        const fx = foe.x - group.position.x;
        const fz = foe.z - group.position.z;
        if (fx * fx + fz * fz > 0.04) group.rotation.y = Math.atan2(fx, fz);
      }
    }
    const dtClamped = Math.min(dt, 0.05);
    moveAmp.current += ((moving ? 1 : 0) - moveAmp.current) * Math.min(1, dtClamped * 9);
    walkPhase.current += dtClamped * (7 + moveAmp.current * 5);
    idleTime.current += dtClamped;
    if (!shouldLoadAvatarGltf()) {
      const pose = avatarWalkPose(walkPhase.current, moveAmp.current, idleTime.current);
      const swingAt = combatSwingAtRef.current;
      const swingT =
        swingAt != null ? Math.max(0, 1 - (performance.now() - swingAt) / 280) : 0;
      const overlay = avatarCombatOverlay(
        combatGuardRef.current,
        swingT,
        heldCombatWeaponKind(
          combatWeaponItemIdRef.current,
          combatFoeRef.current != null,
        ) != null,
      );
      applyAvatarWalkPose(
        {
          ...pose,
          leftArmX: pose.leftArmX + overlay.leftArmX,
          rightArmX: pose.rightArmX + overlay.rightArmX,
          leftArmZ: pose.leftArmZ + overlay.leftArmZ,
          torsoYaw: pose.torsoYaw + overlay.torsoYaw,
        },
        {
          leftLeg: leftLeg.current,
          rightLeg: rightLeg.current,
          leftArm: leftArm.current,
          rightArm: rightArm.current,
          body: body.current,
          torso: torso.current,
        },
      );
    }

    const x = group.position.x;
    const z = group.position.z;
    if (
      Number.isNaN(lastReported.current.x) ||
      Math.abs(x - lastReported.current.x) > 0.015 ||
      Math.abs(z - lastReported.current.z) > 0.015
    ) {
      lastReported.current = { x, z };
      onPositionRef.current(x, z);
    }
  });

  const inCombat = combatFoeWorld != null;
  const weaponKind = heldCombatWeaponKind(combatWeaponItemId, inCombat);

  return (
    <group ref={ref} position={[spawn.x, 0, spawn.z]}>
        <AvatarKit
        variant="local"
        showTool={!inCombat}
        combatWeaponKind={weaponKind}
        landKind={landKind}
        moveAmpRef={moveAmp}
        combatSwingAtRef={combatSwingAtRef}
        combatGuardRef={combatGuardRef}
        leftLegRef={leftLeg}
        rightLegRef={rightLeg}
        leftArmRef={leftArm}
        rightArmRef={rightArm}
        bodyRef={body}
        torsoRef={torso}
      />
      <CombatSwingArc swingAtRef={combatSwingAtRef} />
    </group>
  );
}

/**
 * Bright slash in front of the hunter so a melee click reads on camera.
 *
 * @param props - Ref updated when the player clicks attack.
 */
function CombatSwingArc({
  swingAtRef,
}: {
  swingAtRef: RefObject<number | null>;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const at = swingAtRef.current;
    const t = at != null ? Math.max(0, 1 - (performance.now() - at) / 420) : 0;
    const mat = m.material as MeshBasicMaterial;
    m.visible = t > 0.04;
    m.rotation.y = (1 - t) * 2.1 - 0.85;
    m.position.y = 0.95 + (1 - t) * 0.08;
    mat.opacity = Math.min(1, t * 1.15);
  });

  return (
    <mesh
      ref={mesh}
      position={[0.15, 0.95, 0.62]}
      rotation={[1.15, -0.85, 0.35]}
      visible={false}
    >
      <torusGeometry args={[0.62, 0.045, 7, 16, Math.PI * 0.72]} />
      <meshBasicMaterial color="#f4e6b0" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
