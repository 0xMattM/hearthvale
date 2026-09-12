"use client";

import { CityHallSurfaceMaterial } from "@/components/land-scene/CityHallSurfaceMaterial";
import "@/components/land-scene/kit-box-geometry";
import { WorldHtml } from "@/components/land-scene/WorldHtml";
import {
  CITY_HALL_FACADE,
  createGableFaceGeometry,
  createGablePrismGeometry,
  gableRoofSlope,
} from "@/lib/city-hall-kit";
import {
  CITY_HALL_STYLE,
  cityHallRgbHex,
  type ClayAtlasPalette,
} from "@/lib/city-hall-style";
import type { CityAtmosphereDecorHall } from "@game/shared";
import { useMemo } from "react";

const HALL_KNOB = cityHallRgbHex(CITY_HALL_STYLE.knob);
const HALL_CLOCK = cityHallRgbHex(CITY_HALL_STYLE.clockFace);
const HALL_GLASS = cityHallRgbHex(CITY_HALL_STYLE.glass);

/**
 * Gabled clay house — City Hall silhouette with optional clock / label.
 *
 * @param props - Size, palette, and hall-only extras.
 * @returns Clay house group.
 */
export function CityClayHouse({
  x,
  z,
  rotY,
  w,
  d,
  h,
  palette = CITY_HALL_STYLE,
  cachePrefix = "hall-v2",
  showClock = false,
  chimney = false,
  label,
}: CityAtmosphereDecorHall & {
  palette?: ClayAtlasPalette;
  cachePrefix?: string;
  showClock?: boolean;
  chimney?: boolean;
  label?: string;
}) {
  const foundH = 0.42;
  const beam = 0.26;
  const ridge = Math.min(1.55, h * 0.4);
  const front = d / 2;
  const faceZ = front + beam / 2 - 0.02;
  const storyY = foundH + h * 0.5;
  const doorZ = front + 0.06;
  const sx = w / CITY_HALL_FACADE.width;
  const groundX = CITY_HALL_FACADE.groundWindowX.map((wx) => wx * sx);
  const upperX =
    w < 4
      ? [0]
      : CITY_HALL_FACADE.upperWindowX.map((wx) => wx * sx);
  const plasterHex = cityHallRgbHex(palette.plaster);

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, foundH / 2, 0]} castShadow receiveShadow>
        <kitBoxGeometry args={[w + 0.22, foundH, d + 0.22]} />
        <CityHallSurfaceMaterial
          kind="stone"
          repeat={[3, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>

      <mesh position={[0, foundH + h / 2, 0]} castShadow>
        <kitBoxGeometry args={[w, h, d]} />
        <CityHallSurfaceMaterial
          kind="plaster"
          repeat={[2, 2]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>

      {[-w / 2 + beam / 2, w / 2 - beam / 2].flatMap((px) =>
        [-d / 2 + beam / 2, d / 2 - beam / 2].map((pz) => (
          <ClayBeam
            key={`c-${px}-${pz}`}
            pos={[px, foundH + h / 2, pz]}
            size={[beam, h, beam]}
            palette={palette}
            cachePrefix={cachePrefix}
          />
        )),
      )}
      {[-w / 6, w / 6].map((px) => (
        <ClayBeam
          key={`f-${px}`}
          pos={[px, foundH + h / 2, faceZ]}
          size={[beam, h, beam]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ))}
      <ClayBeam
        pos={[0, storyY, faceZ]}
        size={[w - beam, beam, beam]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <ClayBeam
        pos={[0, foundH + beam / 2, faceZ]}
        size={[w - beam, beam, beam]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <ClayBeam
        pos={[0, foundH + h - beam / 2, faceZ]}
        size={[w - beam, beam, beam]}
        palette={palette}
        cachePrefix={cachePrefix}
      />

      <HallDoor z={doorZ} y={foundH + 0.02} palette={palette} cachePrefix={cachePrefix} />

      {groundX.map((wx) => (
        <ShutterWindow
          key={`g-${wx}`}
          x={wx}
          y={foundH + Math.min(1.12, h * 0.42)}
          z={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ))}
      {upperX.map((wx) => (
        <ShutterWindow
          key={`u-${wx}`}
          x={wx}
          y={foundH + h * 0.72}
          z={doorZ}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      ))}

      <Gable
        width={w + 0.08}
        ridge={ridge}
        depth={d + 0.12}
        y={foundH + h}
        plasterHex={plasterHex}
        palette={palette}
        cachePrefix={cachePrefix}
        showClock={showClock}
      />

      {chimney ? (
        <>
          <mesh position={[w * 0.28, foundH + h + ridge * 0.15, -d * 0.08]} castShadow>
            <kitBoxGeometry args={[0.42, ridge * 0.7, 0.42]} />
            <CityHallSurfaceMaterial
              kind="stone"
              repeat={[1, 2]}
              palette={palette}
              cachePrefix={cachePrefix}
            />
          </mesh>
          <mesh position={[w * 0.28, foundH + h + ridge * 0.55, -d * 0.08]} castShadow>
            <kitBoxGeometry args={[0.5, 0.12, 0.5]} />
            <CityHallSurfaceMaterial
              kind="stone"
              repeat={[1, 1]}
              palette={palette}
              cachePrefix={cachePrefix}
            />
          </mesh>
        </>
      ) : null}

      {label ? (
        <WorldHtml
          position={[0, foundH + h + ridge + 0.45, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            data-testid="city-main-hall-label"
            style={{
              background: "rgba(14, 18, 24, 0.86)",
              color: "#d8e4ec",
              padding: "3px 10px",
              borderRadius: 5,
              border: "1px solid #6a8090",
              fontSize: 11,
              fontWeight: 650,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </div>
        </WorldHtml>
      ) : null}
    </group>
  );
}

/**
 * Fat timber beam (concept posts are thick clay bars).
 *
 * @param props - Center, size, and clay wash.
 * @returns Beam mesh.
 */
function ClayBeam({
  pos,
  size,
  palette,
  cachePrefix,
}: {
  pos: [number, number, number];
  size: [number, number, number];
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  return (
    <mesh position={pos} castShadow>
      <kitBoxGeometry args={size} />
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
 * Double door with timber jambs and a brass knob.
 *
 * @param props - Façade Z, sill Y, clay wash.
 * @returns Door group.
 */
function HallDoor({
  z,
  y,
  palette,
  cachePrefix,
}: {
  z: number;
  y: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const doorH = 1.78;
  const cy = y + doorH / 2;

  return (
    <group position={[0, 0, z]}>
      <ClayBeam
        pos={[-0.62, cy, 0.02]}
        size={[0.16, doorH + 0.2, 0.18]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <ClayBeam
        pos={[0.62, cy, 0.02]}
        size={[0.16, doorH + 0.2, 0.18]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      <ClayBeam
        pos={[0, y + doorH + 0.08, 0.02]}
        size={[1.4, 0.18, 0.18]}
        palette={palette}
        cachePrefix={cachePrefix}
      />
      {([-0.26, 0.26] as const).map((lx) => (
        <mesh key={`leaf-${lx}`} position={[lx, cy, 0.04]} castShadow>
          <kitBoxGeometry args={[0.5, doorH, 0.1]} />
          <CityHallSurfaceMaterial
            kind="wood"
            repeat={[1, 2]}
            palette={palette}
            cachePrefix={cachePrefix}
          />
        </mesh>
      ))}
      <mesh position={[0.2, cy - 0.08, 0.12]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color={HALL_KNOB} roughness={0.35} metalness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Recessed wood-frame window, shutters hinged open — no yellow plastic frames.
 *
 * @param props - Window center + clay wash.
 * @returns Window group.
 */
function ShutterWindow({
  x,
  y,
  z,
  palette,
  cachePrefix,
}: {
  x: number;
  y: number;
  z: number;
  palette: ClayAtlasPalette;
  cachePrefix: string;
}) {
  const f = CITY_HALL_FACADE;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.05]}>
        <kitBoxGeometry args={[f.windowFrameW, f.windowFrameH, 0.14]} />
        <CityHallSurfaceMaterial
          kind="wood"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <kitBoxGeometry args={[f.windowGlassW, f.windowGlassH, 0.04]} />
        <meshStandardMaterial
          color={HALL_GLASS}
          roughness={0.22}
          metalness={0.12}
          emissive="#8aa0b0"
          emissiveIntensity={0.12}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <kitBoxGeometry args={[0.04, f.windowGlassH, 0.02]} />
        <CityHallSurfaceMaterial
          kind="wood"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <kitBoxGeometry args={[f.windowGlassW, 0.04, 0.02]} />
        <CityHallSurfaceMaterial
          kind="wood"
          repeat={[1, 1]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <group position={[-f.shutterOffset, 0, 0.05]} rotation={[0, 0.42, 0]}>
        <mesh>
          <kitBoxGeometry args={[f.shutterW, f.shutterH, 0.05]} />
          <CityHallSurfaceMaterial
            kind="shutter"
            repeat={[1, 1]}
            palette={palette}
            cachePrefix={cachePrefix}
          />
        </mesh>
        <mesh position={[0.06, 0.05, 0.04]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={HALL_KNOB} roughness={0.35} metalness={0.4} />
        </mesh>
      </group>
      <group position={[f.shutterOffset, 0, 0.05]} rotation={[0, -0.42, 0]}>
        <mesh>
          <kitBoxGeometry args={[f.shutterW, f.shutterH, 0.05]} />
          <CityHallSurfaceMaterial
            kind="shutter"
            repeat={[1, 1]}
            palette={palette}
            cachePrefix={cachePrefix}
          />
        </mesh>
        <mesh position={[-0.06, 0.05, 0.04]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={HALL_KNOB} roughness={0.35} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Steep gable + shingles + optional clock on the plaster face.
 *
 * @param props - Roof span and clock flag.
 * @returns Gable group.
 */
function Gable({
  width,
  ridge,
  depth,
  y,
  plasterHex,
  palette,
  cachePrefix,
  showClock,
}: {
  width: number;
  ridge: number;
  depth: number;
  y: number;
  plasterHex: string;
  palette: ClayAtlasPalette;
  cachePrefix: string;
  showClock: boolean;
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
  const eaves = slope.length + 0.22;

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
        position={[0, ridge / 2 + 0.05, depth / 4]}
        rotation={[slope.pitch, 0, 0]}
        castShadow
      >
        <kitBoxGeometry args={[width + 0.45, 0.14, eaves]} />
        <CityHallSurfaceMaterial
          kind="roof"
          repeat={[3, 2]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      <mesh
        position={[0, ridge / 2 + 0.05, -depth / 4]}
        rotation={[-slope.pitch, 0, 0]}
        castShadow
      >
        <kitBoxGeometry args={[width + 0.45, 0.14, eaves]} />
        <CityHallSurfaceMaterial
          kind="roof"
          repeat={[3, 2]}
          palette={palette}
          cachePrefix={cachePrefix}
        />
      </mesh>
      {showClock ? <HallClock y={ridge * 0.38} z={depth / 2 + 0.06} /> : null}
    </group>
  );
}

/**
 * Square clock on the gable (concept civic tell).
 *
 * @param props - Local Y / Z on the gable group.
 * @returns Clock group.
 */
function HallClock({ y, z }: { y: number; z: number }) {
  return (
    <group position={[0, y, z]}>
      <mesh>
        <kitBoxGeometry args={[0.72, 0.72, 0.1]} />
        <CityHallSurfaceMaterial kind="wood" repeat={[1, 1]} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <circleGeometry args={[0.28, 24]} />
        <meshStandardMaterial color={HALL_CLOCK} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.06, 0.08]} rotation={[0, 0, -0.55]}>
        <kitBoxGeometry args={[0.035, 0.16, 0.02]} />
        <meshStandardMaterial color="#2a2420" roughness={0.7} />
      </mesh>
      <mesh position={[0.05, 0, 0.08]} rotation={[0, 0, 1.2]}>
        <kitBoxGeometry args={[0.03, 0.12, 0.02]} />
        <meshStandardMaterial color="#2a2420" roughness={0.7} />
      </mesh>
    </group>
  );
}
