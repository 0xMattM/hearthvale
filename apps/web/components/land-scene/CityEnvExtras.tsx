"use client";

import "@/components/land-scene/kit-box-geometry";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";
import { VillageGltfProp } from "@/components/land-scene/VillageGltfProp";
import { japanVillageProp } from "@/lib/japan-village";
import type { CityAtmosphereDecorExtra } from "@game/shared";

/**
 * Extra civic atmosphere props — plaza furniture + masonry / flowers.
 */
export function CityDecorExtra({
  kind,
  x,
  z,
  rotY,
  scale = 1,
}: CityAtmosphereDecorExtra) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]} scale={scale}>
      {kind === "lantern" ? (
        <VillageGltfProp model={japanVillageProp("lantern")} kit={<CityLantern />} />
      ) : null}
      {kind === "bench" ? (
        <VillageGltfProp model={japanVillageProp("chair")} kit={<CityBench />} />
      ) : null}
      {kind === "planter" ? (
        <VillageGltfProp model={japanVillageProp("pot")} kit={<CityPlanter />} />
      ) : null}
      {kind === "trough" ? (
        <VillageGltfProp model={japanVillageProp("riceBin")} kit={<CityTrough />} />
      ) : null}
      {kind === "signpost" ? <CitySignpost /> : null}
      {kind === "column" ? <CityColumn /> : null}
      {kind === "arch" ? <CityArch /> : null}
      {kind === "wall" ? <CityStoneWall /> : null}
      {kind === "rock" ? <CityRock /> : null}
      {kind === "flowerpot" ? (
        <VillageGltfProp model={japanVillageProp("pot")} kit={<CityFlowerPot />} />
      ) : null}
    </group>
  );
}

function CityLantern() {
  return (
    <>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.8, 8]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#4a4034"
          roughness={0.88}
          metalness={0.05}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <kitBoxGeometry args={[0.28, 0.32, 0.28]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#5a6068"
          roughness={0.45}
          metalness={0.4}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <kitBoxGeometry args={[0.2, 0.22, 0.2]} />
        <meshStandardMaterial
          color="#f0d080"
          emissive="#e8b040"
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 2.08, 0]} castShadow>
        <coneGeometry args={[0.2, 0.16, 4]} />
        <TexturedStandardMaterial
          kind="metal"
          color="#3a4048"
          roughness={0.5}
          metalness={0.45}
          repeat={1}
        />
      </mesh>
    </>
  );
}

function CityBench() {
  return (
    <>
      <mesh position={[0, 0.28, 0]} castShadow>
        <kitBoxGeometry args={[1.35, 0.1, 0.42]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#6a5340"
          roughness={0.85}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.55, -0.16]} castShadow>
        <kitBoxGeometry args={[1.35, 0.42, 0.08]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#5a4434"
          roughness={0.88}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      {(
        [
          [-0.55, 0.14],
          [0.55, 0.14],
        ] as const
      ).map(([lx], i) => (
        <mesh key={`leg-${i}`} position={[lx, 0.14, 0]} castShadow>
          <kitBoxGeometry args={[0.08, 0.28, 0.36]} />
          <TexturedStandardMaterial
            kind="wood"
            color="#4a3828"
            roughness={0.9}
            metalness={0.03}
            repeat={1}
          />
        </mesh>
      ))}
    </>
  );
}

function CityPlanter() {
  return (
    <>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.55, 10]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#6a6860"
          roughness={0.92}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <sphereGeometry args={[0.36, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color="#2e5a38"
          roughness={0.9}
          metalness={0.02}
          repeat={2}
        />
      </mesh>
      <mesh position={[0.12, 0.72, 0.08]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <TexturedStandardMaterial
          kind="grass"
          color="#3a6a44"
          roughness={0.88}
          metalness={0.02}
          repeat={2}
        />
      </mesh>
    </>
  );
}

function CityTrough() {
  return (
    <>
      <mesh position={[0, 0.32, 0]} castShadow>
        <kitBoxGeometry args={[1.1, 0.45, 0.48]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#5a4838"
          roughness={0.88}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <kitBoxGeometry args={[0.95, 0.08, 0.34]} />
        <meshStandardMaterial
          color="#4a7088"
          transparent
          opacity={0.55}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
    </>
  );
}

function CitySignpost() {
  return (
    <>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.4, 6]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#4a4034"
          roughness={0.9}
          metalness={0.03}
          repeat={1}
        />
      </mesh>
      <mesh position={[0.22, 1.15, 0]} rotation={[0, 0, -0.08]} castShadow>
        <kitBoxGeometry args={[0.55, 0.28, 0.06]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#7a6a48"
          roughness={0.85}
          metalness={0.04}
          repeat={1}
        />
      </mesh>
      <mesh position={[-0.18, 0.95, 0]} rotation={[0, 0, 0.12]} castShadow>
        <kitBoxGeometry args={[0.42, 0.22, 0.05]} />
        <TexturedStandardMaterial
          kind="wood"
          color="#6a5a40"
          roughness={0.88}
          metalness={0.04}
          repeat={1}
        />
      </mesh>
    </>
  );
}

/** Tall civic stone column with base + capital. */
function CityColumn() {
  return (
    <>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.24, 10]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#7a828c"
          roughness={0.9}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 2.4, 10]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#8a9098"
          roughness={0.88}
          metalness={0.05}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.26, 0.28, 10]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#6a727c"
          roughness={0.86}
          metalness={0.06}
          repeat={2}
        />
      </mesh>
    </>
  );
}

/** Stone arch on the City Hall approach — vaulted ring on two piers. */
function CityArch() {
  const pierX = 1.7;
  const pierH = 1.82;
  const ringR = 1.7;
  const tube = 0.3;
  return (
    <group>
      {(
        [
          [-pierX, 1],
          [pierX, -1],
        ] as const
      ).map(([x, sx], i) => (
        <group key={`pier-${i}`} position={[x, 0, 0]}>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.38, 0.24, 10]} />
            <TexturedStandardMaterial
              kind="stone"
              color="#6a727c"
              roughness={0.92}
              metalness={0.04}
              repeat={2}
            />
          </mesh>
          <mesh position={[0, pierH * 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.3, pierH, 10]} />
            <TexturedStandardMaterial
              kind="stone"
              color="#7a828c"
              roughness={0.9}
              metalness={0.04}
              repeat={2}
            />
          </mesh>
          <mesh
            position={[sx * 0.02, pierH + 0.08, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.28, 0.16, 10]} />
            <TexturedStandardMaterial
              kind="stone"
              color="#6a727c"
              roughness={0.88}
              metalness={0.05}
              repeat={1}
            />
          </mesh>
        </group>
      ))}
      {/* Upper semicircle is the vault — ends sit on the pier caps */}
      <mesh position={[0, pierH, 0]} castShadow>
        <torusGeometry args={[ringR, tube, 10, 24, Math.PI]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#7a848e"
          roughness={0.9}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, pierH + ringR, 0]} castShadow>
        <kitBoxGeometry args={[0.38, 0.42, 0.5]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#8a9098"
          roughness={0.86}
          metalness={0.05}
          repeat={1}
        />
      </mesh>
    </group>
  );
}

/** Low stone murito segment. */
function CityStoneWall() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <kitBoxGeometry args={[2.4, 0.7, 0.38]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#6e7680"
          roughness={0.92}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[-0.7, 0.72, 0]} castShadow>
        <kitBoxGeometry args={[0.55, 0.18, 0.42]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#8a9098"
          roughness={0.9}
          metalness={0.04}
          repeat={1}
        />
      </mesh>
      <mesh position={[0.65, 0.7, 0.02]} castShadow>
        <kitBoxGeometry args={[0.7, 0.16, 0.4]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#7a828c"
          roughness={0.9}
          metalness={0.04}
          repeat={1}
        />
      </mesh>
    </group>
  );
}

/** Loose plaza boulder. */
function CityRock() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <dodecahedronGeometry args={[0.32, 0]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#6a6860"
          roughness={0.95}
          metalness={0.03}
          repeat={1}
        />
      </mesh>
      <mesh position={[0.18, 0.12, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.16, 0]} />
        <TexturedStandardMaterial
          kind="stone"
          color="#5a5850"
          roughness={0.96}
          metalness={0.02}
          repeat={1}
        />
      </mesh>
    </group>
  );
}

/** Clay pot with colorful flower blooms. */
function CityFlowerPot() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.42, 10]} />
        <TexturedStandardMaterial
          kind="dirt"
          color="#8a5a3a"
          roughness={0.9}
          metalness={0.04}
          repeat={2}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.22, 0.08, 10]} />
        <TexturedStandardMaterial
          kind="dirt"
          color="#7a4a30"
          roughness={0.88}
          metalness={0.04}
          repeat={1}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.2, 10, 10]} />
        <TexturedStandardMaterial
          kind="grass"
          color="#2e5a38"
          roughness={0.9}
          metalness={0.02}
          repeat={2}
        />
      </mesh>
      {(
        [
          [0.08, 0.62, 0.06, "#d85878"],
          [-0.1, 0.64, -0.04, "#e8c048"],
          [0.02, 0.7, -0.1, "#c060d0"],
          [-0.02, 0.68, 0.1, "#e87850"],
        ] as const
      ).map(([fx, fy, fz, color], i) => (
        <mesh key={`bloom-${i}`} position={[fx, fy, fz]} castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color={color}
            roughness={0.55}
            metalness={0.05}
            emissive={color}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}
