"use client";

import {
  NEARBY_PEER_PING,
  PRESENCE_PEER_SILHOUETTE,
  inWorldInteractRange,
  peerRangeExitFadeEmissiveIntensity,
  peerRangeExitFadeEnvelope,
  peerRangeExitFadeOpacity,
  remotePresenceKitMaterials,
  shouldFlashNearbyPeerWorldReinforce,
  shouldStartPeerRangeExitFade,
} from "@game/shared";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, type MutableRefObject } from "react";
import type { MeshStandardMaterial } from "three";
import { AvatarKit } from "@/components/land-scene/AvatarKit";

interface RemotePlayerAvatarProps {
  username: string;
  x: number;
  z: number;
  /** Local player world position — drives soft nearby ping (PL15.2). */
  playerPosRef?: MutableRefObject<{ x: number; z: number }>;
  /** PL184.2 — soft HUD rim when peer first enters interact range. */
  onInteractRangeEnter?: () => void;
}

/**
 * Other players on the same land — shared farmer kit, cooler palette (F14.2).
 * Soft always-on silhouette halo so peers read apart from tutors/stations (PL40.3).
 * Soft floor ring when the peer enters interact range (PL15.2); no HUD list growth.
 * Soft ring fade when the peer leaves interact range (PL134.2).
 * Soft HUD rim when the peer first enters interact range (PL184.2).
 * Halo / ping ring PBR under cue envelopes (VA5.1).
 */
export function RemotePlayerAvatar({
  username,
  x,
  z,
  playerPosRef,
  onInteractRangeEnter,
}: RemotePlayerAvatarProps) {
  const [near, setNear] = useState(false);
  const [exitFadeStartedAt, setExitFadeStartedAt] = useState<number | null>(
    null,
  );
  const nearRef = useRef(false);
  const exitFadeStartedAtRef = useRef<number | null>(null);
  const pingMatRef = useRef<MeshStandardMaterial>(null);
  const onInteractRangeEnterRef = useRef(onInteractRangeEnter);
  onInteractRangeEnterRef.current = onInteractRangeEnter;

  useFrame(() => {
    if (!playerPosRef) {
      if (nearRef.current) {
        nearRef.current = false;
        setNear(false);
      }
      if (exitFadeStartedAtRef.current != null) {
        exitFadeStartedAtRef.current = null;
        setExitFadeStartedAt(null);
      }
      return;
    }
    const next = inWorldInteractRange(
      playerPosRef.current.x,
      playerPosRef.current.z,
      x,
      z,
    );
    if (next !== nearRef.current) {
      if (shouldStartPeerRangeExitFade(nearRef.current, next)) {
        const started = performance.now();
        exitFadeStartedAtRef.current = started;
        setExitFadeStartedAt(started);
      } else if (next) {
        // Reason: re-enter cancels any leftover exit fade so ping reads solid.
        if (exitFadeStartedAtRef.current != null) {
          exitFadeStartedAtRef.current = null;
          setExitFadeStartedAt(null);
        }
      }
      // Reason: PL184.2 — enter-edge only; complements floor ping without HUD list growth.
      if (shouldFlashNearbyPeerWorldReinforce(nearRef.current, next)) {
        onInteractRangeEnterRef.current?.();
      }
      nearRef.current = next;
      setNear(next);
    }

    const mat = pingMatRef.current;
    if (!mat) return;
    if (nearRef.current) {
      mat.opacity = NEARBY_PEER_PING.opacity;
      mat.emissiveIntensity = NEARBY_PEER_PING.emissiveIntensity;
      return;
    }
    const startedAt = exitFadeStartedAtRef.current;
    if (startedAt == null) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      return;
    }
    const envelope = peerRangeExitFadeEnvelope(performance.now() - startedAt);
    if (envelope <= 0) {
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
      if (exitFadeStartedAtRef.current != null) {
        exitFadeStartedAtRef.current = null;
        setExitFadeStartedAt(null);
      }
      return;
    }
    mat.opacity = peerRangeExitFadeOpacity(envelope);
    mat.emissiveIntensity = peerRangeExitFadeEmissiveIntensity(envelope);
  });

  const ping = NEARBY_PEER_PING;
  const silhouette = PRESENCE_PEER_SILHOUETTE;
  const showPingRing = near || exitFadeStartedAt != null;
  // Reason: VA5.1 — PBR under presence cues; RGB/opacity/geometry stay on catalog.
  const presenceKit = remotePresenceKitMaterials();

  return (
    <group position={[x, 0, z]}>
      {/* PL40.3 — quiet always-on peer halo (cooler than tutor/station pads). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry
          args={[silhouette.haloInner, silhouette.haloOuter, 28]}
        />
        <meshStandardMaterial
          color={silhouette.color}
          emissive={silhouette.color}
          emissiveIntensity={silhouette.emissiveIntensity}
          transparent
          opacity={silhouette.opacity}
          roughness={presenceKit.halo.roughness}
          metalness={presenceKit.halo.metalness}
        />
      </mesh>
      {/* Quiet lip under silhouette so the always-on disc reads less flat (VA5.1). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry
          args={[silhouette.haloOuter, silhouette.haloOuter + 0.04, 28]}
        />
        <meshStandardMaterial
          color={presenceKit.lipColor}
          transparent
          opacity={0.35}
          roughness={presenceKit.lip.roughness}
          metalness={presenceKit.lip.metalness}
          depthWrite={false}
        />
      </mesh>
      {showPingRing ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[ping.ringInner, ping.ringOuter, 28]} />
          <meshStandardMaterial
            ref={pingMatRef}
            color={ping.color}
            emissive={ping.color}
            emissiveIntensity={ping.emissiveIntensity}
            transparent
            opacity={ping.opacity}
            depthWrite={false}
            roughness={presenceKit.ping.roughness}
            metalness={presenceKit.ping.metalness}
          />
        </mesh>
      ) : null}
      <AvatarKit variant="remote" />
      <WorldHtml position={[0, 2.15, 0]} center style={{ pointerEvents: "none" }}>
        <div
          style={{
            background: "rgba(20,28,18,0.75)",
            color: "#c8d8c0",
            padding: "1px 6px",
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: "nowrap",
            border: near
              ? `1px solid color-mix(in srgb, ${ping.color} 65%, transparent)`
              : `1px solid color-mix(in srgb, ${silhouette.nameBorder} 45%, transparent)`,
          }}
        >
          {username}
        </div>
      </WorldHtml>
    </group>
  );
}
