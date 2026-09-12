/**
 * Traveler-chibi layout — pear torso, hooded head, stub limbs (reference style).
 */
export const HUMANOID_LAYOUT = {
  faceForward: "+z",
  style: "traveler-chibi",
  headScale: 0.9,
  faceWidth: 0.2,
  faceHeight: 0.22,
  eyeRadius: 0.018,
  browHeight: 0.012,
  hasBackHairCue: false,
  hasBootToeCue: false,
} as const;

/** Warm brown hood — never map-tinted (tint reads as a blue mask on the face). */
export const TRAVELER_HOOD_COLOR = "#5a4030";

export const HUMANOID_BODY = {
  /** In-world scale — readable on isometric camera without oversized kit detail. */
  worldScale: 1.36,
  /** Pear robe — wide hips, narrower shoulders */
  torsoLower: [0.46, 0.34, 0.32] as const,
  torsoUpper: [0.38, 0.28, 0.3] as const,
  hipY: 0.78,
  hipSpan: 0.12,
  shoulderY: 1.1,
  shoulderSpan: 0.24,
  sleeveSpan: 0.26,
  armRestAngle: 0.06,
  headAnchorY: 1.28,
  beltY: 0.78,
  legStubHeight: 0.28,
  bootHeight: 0.1,
} as const;

/** Local Y of boot soles before `worldScale` (see `TravelerLeg` boot mesh). */
export const HUMANOID_FOOT_BOTTOM_Y =
  HUMANOID_BODY.hipY -
  HUMANOID_BODY.legStubHeight -
  HUMANOID_BODY.bootHeight +
  0.02;

/** Offset applied on the body group so soles sit on world y=0 after scale. */
export const HUMANOID_GROUND_ALIGN_Y = -HUMANOID_FOOT_BOTTOM_Y;
