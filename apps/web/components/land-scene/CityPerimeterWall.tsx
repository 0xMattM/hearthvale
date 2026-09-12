"use client";

import { CityHallSurfaceMaterial } from "@/components/land-scene/CityHallSurfaceMaterial";
import "@/components/land-scene/kit-box-geometry";
import {
  cityPerimeterLayout,
  cityPerimeterPosts,
  cityPerimeterWallRuns,
} from "@game/shared";

/**
 * Stone town wall on west / east / camera-far edges. River owns +Z.
 */
export function CityPerimeterWall() {
  const p = cityPerimeterLayout();
  const runs = cityPerimeterWallRuns();
  const posts = cityPerimeterPosts();
  const bodyH = p.wallHeight - p.footingHeight - p.capHeight;

  return (
    <group userData={{ cityPerimeter: true }}>
      {runs.map((run) => (
        <group
          key={run.id}
          position={[run.x, 0, run.z]}
          rotation={[0, run.rotY, 0]}
        >
          <mesh
            position={[0, p.footingHeight / 2, 0]}
            castShadow
            receiveShadow
          >
            <kitBoxGeometry
              args={[run.length + 0.12, p.footingHeight, p.wallThickness + 0.1]}
            />
            <CityHallSurfaceMaterial
              kind="stone"
              repeat={[Math.max(2, run.length / 4), 1]}
            />
          </mesh>
          <mesh
            position={[0, p.footingHeight + bodyH / 2, 0]}
            castShadow
            receiveShadow
          >
            <kitBoxGeometry args={[run.length, bodyH, p.wallThickness]} />
            <CityHallSurfaceMaterial
              kind="plaster"
              repeat={[Math.max(2, run.length / 5), 2]}
            />
          </mesh>
          <mesh
            position={[0, p.footingHeight + bodyH + p.capHeight / 2, 0]}
            castShadow
          >
            <kitBoxGeometry
              args={[run.length + 0.16, p.capHeight, p.wallThickness + 0.16]}
            />
            <CityHallSurfaceMaterial
              kind="wood"
              repeat={[Math.max(2, run.length / 3), 1]}
            />
          </mesh>
        </group>
      ))}
      {posts.map((post) => (
        <group key={`post-${post.x.toFixed(1)}-${post.z.toFixed(1)}`} position={[post.x, 0, post.z]}>
          <mesh position={[0, (p.wallHeight + 0.28) / 2, 0]} castShadow>
            <kitBoxGeometry
              args={[p.postRadius * 2, p.wallHeight + 0.28, p.postRadius * 2]}
            />
            <CityHallSurfaceMaterial kind="stone" repeat={[1, 2]} />
          </mesh>
          <mesh position={[0, p.wallHeight + 0.36, 0]} castShadow>
            <kitBoxGeometry
              args={[p.postRadius * 2.15, 0.16, p.postRadius * 2.15]}
            />
            <CityHallSurfaceMaterial kind="wood" repeat={[1, 1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
