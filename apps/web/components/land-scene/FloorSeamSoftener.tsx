"use client";



import type { SurfaceTextureKind } from "@/lib/procedural-textures";
import { pathBedUvRepeat } from "@/lib/floor-seam-metrics";
import { TexturedStandardMaterial } from "@/components/land-scene/TexturedStandardMaterial";



interface RaisedFloorCurbProps {

  /** Inner floor width (X). */

  width: number;

  /** Inner floor depth (Z). */

  depth: number;

  /** World Y of the curb bottom (sit on the lower floor). */

  y: number;

  x?: number;

  z?: number;

  color: string;

  kind?: SurfaceTextureKind;

  /** Curb thickness in XZ. */

  curbW?: number;

  /** Curb height (real silhouette + soft shadow). */

  curbH?: number;

}



/**

 * Raised curb frame — plain boxes, no cast shadows (shadow acne flickered on floors).

 */

export function RaisedFloorCurb({

  width,

  depth,

  y,

  x = 0,

  z = 0,

  color,

  kind = "stone",

  curbW = 0.28,

  curbH = 0.08,

}: RaisedFloorCurbProps) {

  const halfW = width / 2;

  const halfD = depth / 2;

  const midY = y + curbH / 2;

  return (

    <group position={[x, midY, z]}>

      <mesh position={[0, 0, halfD]} receiveShadow>

        <boxGeometry args={[width + curbW * 2, curbH, curbW]} />

        <TexturedStandardMaterial

          kind={kind}

          color={color}

          flatFloor

          metalness={0}

          repeat={2}

        />

      </mesh>

      <mesh position={[0, 0, -halfD]} receiveShadow>

        <boxGeometry args={[width + curbW * 2, curbH, curbW]} />

        <TexturedStandardMaterial

          kind={kind}

          color={color}

          flatFloor

          metalness={0}

          repeat={2}

        />

      </mesh>

      <mesh position={[halfW, 0, 0]} receiveShadow>

        <boxGeometry args={[curbW, curbH, depth]} />

        <TexturedStandardMaterial

          kind={kind}

          color={color}

          flatFloor

          metalness={0}

          repeat={2}

        />

      </mesh>

      <mesh position={[-halfW, 0, 0]} receiveShadow>

        <boxGeometry args={[curbW, curbH, depth]} />

        <TexturedStandardMaterial

          kind={kind}

          color={color}

          flatFloor

          metalness={0}

          repeat={2}

        />

      </mesh>

    </group>

  );

}



interface RaisedPathBedProps {

  /** Path length along the long axis. */

  length: number;

  /** Path width across the short axis. */

  pathWidth: number;

  /** World Y of the path top plane. */

  y: number;

  x?: number;

  z?: number;

  /** Long axis of the path. */

  along?: "z" | "x";

  bedColor: string;

  lipColor: string;

  bedKind?: SurfaceTextureKind;

  lipKind?: SurfaceTextureKind;

  /** Edge lip strip width (0 = no lips). */

  lipW?: number;

  /**

   * Clear lips across the center so a crossing path does not z-fight

   * (half-gap on each side of center).

   */

  crossClear?: number;

  bedMatRef?: (mat: import("three").MeshStandardMaterial | null) => void;

  emissive?: string;

  emissiveIntensity?: number;

}



/**

 * Path as a flat top plane (+ optional edge strips).

 * No extruded kit boxes: vertical faces + SoftShadows caused shine/flicker.

 */

export function RaisedPathBed({

  length,

  pathWidth,

  y,

  x = 0,

  z = 0,

  along = "z",

  bedColor,

  lipColor,

  bedKind = "dirt",

  lipKind = "dirt",

  lipW = 0.14,

  crossClear = 0,

  bedMatRef,

  emissive,

  emissiveIntensity,

}: RaisedPathBedProps) {

  const alongZ = along === "z";

  const bedW = alongZ ? pathWidth : length;

  const bedD = alongZ ? length : pathWidth;

  const lipInset = pathWidth / 2 + lipW / 2;

  const lipY = y + 0.008;

  const clear = Math.max(0, crossClear);

  const segLen = clear > 0 ? (length - clear) / 2 : length;

  const segOff = clear > 0 ? (segLen + clear) / 2 : 0;



  function lipStrip(

    key: string,

    px: number,

    pz: number,

    w: number,

    d: number,

  ) {

    if (w < 0.05 || d < 0.05) return null;

    return (

      <mesh

        key={key}

        rotation={[-Math.PI / 2, 0, 0]}

        position={[px, lipY, pz]}

        receiveShadow

      >

        <planeGeometry args={[w, d]} />

        <TexturedStandardMaterial

          kind={lipKind}

          color={lipColor}

          flatFloor

          metalness={0}

          repeat={pathBedUvRepeat(w, d)}

        />

      </mesh>

    );

  }



  return (

    <group position={[x, 0, z]}>

      {/* Flat deck — no side faces to catch specular / soft-shadow acne */}

      <mesh

        rotation={[-Math.PI / 2, 0, 0]}

        position={[0, y, 0]}

        receiveShadow

      >

        <planeGeometry args={[bedW, bedD]} />

        <TexturedStandardMaterial

          ref={bedMatRef}

          kind={bedKind}

          color={bedColor}

          flatFloor

          metalness={0}

          emissive={emissive}

          emissiveIntensity={emissiveIntensity}

          repeat={pathBedUvRepeat(bedW, bedD)}

        />

      </mesh>

      {lipW > 0 &&

        (alongZ ? (

          clear > 0 ? (

            <>

              {lipStrip("l0", -lipInset, -segOff, lipW, segLen)}

              {lipStrip("l1", -lipInset, segOff, lipW, segLen)}

              {lipStrip("r0", lipInset, -segOff, lipW, segLen)}

              {lipStrip("r1", lipInset, segOff, lipW, segLen)}

            </>

          ) : (

            <>

              {lipStrip("l", -lipInset, 0, lipW, length)}

              {lipStrip("r", lipInset, 0, lipW, length)}

            </>

          )

        ) : clear > 0 ? (

          <>

            {lipStrip("n0", -segOff, -lipInset, segLen, lipW)}

            {lipStrip("n1", segOff, -lipInset, segLen, lipW)}

            {lipStrip("s0", -segOff, lipInset, segLen, lipW)}

            {lipStrip("s1", segOff, lipInset, segLen, lipW)}

          </>

        ) : (

          <>

            {lipStrip("n", 0, -lipInset, length, lipW)}

            {lipStrip("s", 0, lipInset, length, lipW)}

          </>

        ))}

    </group>

  );

}



/** @deprecated Transparent apron removed — use RaisedFloorCurb. */

export function SoftFloorFrame(

  props: RaisedFloorCurbProps & { bedH?: number; opacity?: number; band?: number },

) {

  const { band: _b, opacity: _o, bedH: _h, ...curb } = props;

  return (

    <RaisedFloorCurb

      {...curb}

      curbW={props.curbW ?? 0.26}

      curbH={props.curbH ?? 0.08}

    />

  );

}



/** @deprecated Prefer RaisedPathBed. */

export function SoftPathLipsNS() {

  return null;

}



/** @deprecated Prefer RaisedPathBed. */

export function SoftPathLipsEW() {

  return null;

}


