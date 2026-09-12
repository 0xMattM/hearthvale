"use client";

import { CityHallSurfaceMaterial } from "@/components/land-scene/CityHallSurfaceMaterial";
import "@/components/land-scene/kit-box-geometry";
import {
  createGableFaceGeometry,
  createGablePrismGeometry,
  gableRoofSlope,
} from "@/lib/city-hall-kit";
import {
  cityCivicHousePalette,
  type ClayAtlasPalette,
} from "@/lib/city-hall-style";
import type { CityCivicHouse as CityCivicHousePlacement } from "@game/shared";
import { useMemo } from "react";

const BEAM = 0.14;
const FOUND_H = 0.32;

/**
 * Calmer street house — not a mini City Hall (no shutter lattice / double door).
 */
export function CityStreetHouse({
  x,
  z,
  rotY,
  w,
  d,
  h,
  tint,
  look,
}: Omit<CityCivicHousePlacement, "id">) {
  const palette = cityCivicHousePalette(tint);
  const cachePrefix = `street-${tint}-${look}`;
  const front = d / 2;
  const doorZ = front + 0.05;
  const ridge = Math.min(1.05, h * 0.34);
  const plasterHex = `#${palette.plaster.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, FOUND_H / 2, 0]} castShadow receiveShadow>
        <kitBoxGeometry args={[w + 0.16, FOUND_H, d + 0.16]} />
        <CityHallSurfaceMaterial
          kind="stone"
          repeat={[2, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh position={[0, FOUND_H + h / 2, 0]} castShadow>
        <kitBoxGeometry args={[w, h, d]} />
        <CityHallSurfaceMaterial
          kind="plaster"
          repeat={[2, 2]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      {([-w / 2 + BEAM / 2, w / 2 - BEAM / 2] as const).flatMap((px) =>
        ([-d / 2 + BEAM / 2, d / 2 - BEAM / 2] as const).map((pz) => (
          <mesh
            key={`c-${px}-${pz}`}
            position={[px, FOUND_H + h / 2, pz]}
            castShadow
          >
            <kitBoxGeometry args={[BEAM, h, BEAM]} />
            <CityHallSurfaceMaterial
              kind="wood"
              repeat={[1, 2]}
              palette={palette}
              cachePrefix={cachePrefix}
            />
          </mesh>
        )),
      )}

      {look === "shop" ? (
        <ShopFront
          w={w}
          h={h}
          doorZ={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ) : null}
      {look === "cottage" ? (
        <CottageFront
          w={w}
          h={h}
          doorZ={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ) : null}
      {look === "loft" ? (
        <LoftFront
          h={h}
          doorZ={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ) : null}
      {look === "shed" ? (
        <ShedFront
          w={w}
          d={d}
          h={h}
          doorZ={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ) : null}

      <StreetGable
        width={w + 0.06}
        ridge={ridge}
        depth={d + 0.1}
        y={FOUND_H + h}
        plasterHex={plasterHex}
        palette={palette}
        cachePrefix={cachePrefix}
      />

      {look === "loft" ? (
        <mesh
          position={[w * 0.22, FOUND_H + h + ridge * 0.2, -d * 0.12]}
          castShadow
        >
          <kitBoxGeometry args={[0.32, ridge * 0.85, 0.32]} />
          <CityHallSurfaceMaterial
            kind="stone"
            repeat={[1, 2]}
            palette={palette}
            cachePrefix={cachePrefix}
          />
        </mesh>
      ) : null}
    </group>
  );
}

/**
 * Offset door + display window + cloth awning.
 */
function ShopFront({
  w,
  h,
  doorZ,
  palette,
  cachePrefix,
}: {
  w: number;
  h: number;
  doorZ: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const doorX = -w * 0.28;
  const winX = w * 0.22;
  return (
    <>
      <StreetDoor
        x={doorX}
        z={doorZ}
        y={FOUND_H}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <StreetWindow
        x={winX}
        y={FOUND_H + Math.min(1.05, h * 0.48)}
        z={doorZ}
        wide
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <mesh
        position={[0, FOUND_H + Math.min(1.55, h * 0.72), doorZ + 0.18]}
        rotation={[0.42, 0, 0]}
        castShadow
      >
        <kitBoxGeometry args={[w * 0.78, 0.05, 0.5]} />
        <CityHallSurfaceMaterial
          kind="shutter"
          repeat={[2, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
    </>
  );
}

/**
 * Center door and one window — quiet cottage.
 */
function CottageFront({
  w,
  h,
  doorZ,
  palette,
  cachePrefix,
}: {
  w: number;
  h: number;
  doorZ: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const winX = w * 0.28;
  return (
    <>
      <StreetDoor
        x={-w * 0.16}
        z={doorZ}
        y={FOUND_H}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <StreetWindow
        x={winX}
        y={FOUND_H + Math.min(1.02, h * 0.46)}
        z={doorZ}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <mesh position={[winX, FOUND_H + 0.42, doorZ + 0.12]} castShadow>
        <kitBoxGeometry args={[0.62, 0.14, 0.18]} />
        <CityHallSurfaceMaterial
          kind="wood"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
    </>
  );
}

/**
 * Narrow two-storey: door + one upper sash, no shutter stack.
 */
function LoftFront({
  h,
  doorZ,
  palette,
  cachePrefix,
}: {
  h: number;
  doorZ: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  return (
    <>
      <StreetDoor
        x={0}
        z={doorZ}
        y={FOUND_H}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <StreetWindow
        x={0}
        y={FOUND_H + h * 0.72}
        z={doorZ}
        palette={palette}
        cachePrefix={cachePrefix}
      />
    </>
  );
}

/**
 * Small workshop with a lean-to and a single door.
 */
function ShedFront({
  w,
  d,
  h,
  doorZ,
  palette,
  cachePrefix,
}: {
  w: number;
  d: number;
  h: number;
  doorZ: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const leanW = 0.85;
  const leanH = h * 0.58;
  return (
    <>
      <StreetDoor
        x={w * 0.12}
        z={doorZ}
        y={FOUND_H}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <mesh
        position={[-w / 2 - leanW / 2 + 0.02, FOUND_H + leanH / 2, 0]}
        castShadow
      >
        <kitBoxGeometry args={[leanW, leanH, d * 0.72]} />
        <CityHallSurfaceMaterial
          kind="plaster"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh
        position={[-w / 2 - leanW / 2 + 0.02, FOUND_H + leanH + 0.06, 0]}
        rotation={[0, 0, -0.28]}
        castShadow
      >
        <kitBoxGeometry args={[leanW + 0.16, 0.08, d * 0.8]} />
        <CityHallSurfaceMaterial
          kind="roof"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
    </>
  );
}

/**
 * Single door leaf — not the hall's double doors.
 */
function StreetDoor({
  x,
  z,
  y,
  palette,
  cachePrefix,
}: {
  x: number;
  z: number;
  y: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const doorH = 1.42;
  return (
    <mesh position={[x, y + doorH / 2, z]} castShadow>
      <kitBoxGeometry args={[0.62, doorH, 0.08]} />
      <CityHallSurfaceMaterial
        kind="wood"
        repeat={[1, 2]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
    </mesh>
  );
}

/**
 * Recessed sash without hinged shutters.
 */
function StreetWindow({
  x,
  y,
  z,
  wide = false,
  palette,
  cachePrefix,
}: {
  x: number;
  y: number;
  z: number;
  wide?: boolean;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const fw = wide ? 0.92 : 0.48;
  const fh = wide ? 0.7 : 0.52;
  const gw = wide ? 0.72 : 0.34;
  const gh = wide ? 0.52 : 0.36;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.04]}>
        <kitBoxGeometry args={[fw, fh, 0.1]} />
        <CityHallSurfaceMaterial
          kind="wood"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <kitBoxGeometry args={[gw, gh, 0.03]} />
        <meshStandardMaterial
          color="#7a90a0"
          roughness={0.28}
          metalness={0.1}
          emissive="#7a90a0"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}

/**
 * Quiet gable — plaster triangle + two roof slabs, no clock.
 */
function StreetGable({
  width,
  ridge,
  depth,
  y,
  plasterHex,
  palette,
  cachePrefix,
}: {
  width: number;
  ridge: number;
  depth: number;
  y: number;
  plasterHex: string;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const prism = useMemo(
    () => createGablePrismGeometry(width, ridge, depth),
    [width, ridge, depth],
  );
  const face = useMemo(
    () => createGableFaceGeometry(width, ridge),
    [width, ridge],
  );
  const slope = gableRoofSlope(depth, ridge);
  const eaves = slope.length + 0.14;
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={prism} castShadow>
        <meshStandardMaterial color={plasterHex} roughness={0.9} metalness={0.03} />
      </mesh>
      <mesh geometry={face} position={[0, 0, depth / 2 + 0.01]} castShadow>
        <CityHallSurfaceMaterial
          kind="plaster"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh
        position={[0, ridge / 2 + 0.04, depth / 4]}
        rotation={[slope.pitch, 0, 0]}
        castShadow
      >
        <kitBoxGeometry args={[width + 0.28, 0.11, eaves]} />
        <CityHallSurfaceMaterial
          kind="roof"
          repeat={[2, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh
        position={[0, ridge / 2 + 0.04, -depth / 4]}
        rotation={[-slope.pitch, 0, 0]}
        castShadow
      >
        <kitBoxGeometry args={[width + 0.28, 0.11, eaves]} />
        <CityHallSurfaceMaterial
          kind="roof"
          repeat={[2, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
    </group>
  );
}
