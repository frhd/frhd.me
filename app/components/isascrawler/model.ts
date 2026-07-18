/**
 * Procedural three.js model of the ISAScrawler.
 *
 * Builds a low-poly, box-and-cylinder approximation of the rebuilt
 * caterpillar robot: a two-plate PCB trunk carrying a battery + XBee radio,
 * riding on three independent leg segments (front/middle/rear). Geometry is
 * pure composition — no textures, no WebGL context required — so it can be
 * constructed and asserted on in jsdom/node via vitest.
 *
 * Units: millimeters. Front of the robot is +x, ground is y=0. Positions
 * within a group are aesthetic; only group-level placement (trunk height,
 * leg slot spacing) is load-bearing for the gait mapping in
 * applyCrawlerState.
 *
 * Ownership note: the Scene that mounts this model is responsible for
 * disposing geometries/materials on teardown (e.g. via root.traverse()).
 */

import * as THREE from 'three'
import type { CrawlerState, LegState } from './gait-engine'

export const DIMS = {
  trunk: { length: 160, width: 50, plateThickness: 1.6, plateGap: 8, restHeight: 42 },
  segment: { size: 45, height: 28 }, // leg segment boxes under the trunk
  segmentSpacing: 55, // center-to-center
  servo: { w: 12, d: 24, h: 22 },
  battery: { l: 50, w: 30, h: 6 },
  xbee: { l: 28, w: 25, h: 2, antenna: 25 },
  legRod: { radius: 1, length: 40 },
  foot: { l: 30, w: 8, h: 6 },
} as const

export const COLORS = {
  copper: 0xb87333,
  fr4: 0xc8a165,
  servo: 0x1a1a1a,
  horn: 0xe6c619,
  battery: 0xc0c0c8,
  xbee: 0x2255aa,
  rod: 0x2266cc,
  foot: 0xe6c619,
} as const

export type LegName = 'front' | 'middle' | 'rear'

export interface CrawlerParts {
  root: THREE.Group // whole robot; Scene rotates this for orbit
  trunk: THREE.Group // both plates + battery + xbee + antenna
  front: THREE.Group // leg segment groups, children of root (NOT trunk)
  middle: THREE.Group
  rear: THREE.Group
}

function box(w: number, h: number, d: number, color: number): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(w, h, d)
  const material = new THREE.MeshLambertMaterial({ color })
  return new THREE.Mesh(geometry, material)
}

/** Home x offset (mm) for each leg slot, front-to-rear along +x. */
function slotX(leg: LegName): number {
  switch (leg) {
    case 'front':
      return DIMS.segmentSpacing
    case 'middle':
      return 0
    case 'rear':
      return -DIMS.segmentSpacing
  }
}

function buildTrunk(): THREE.Group {
  const trunk = new THREE.Group()
  trunk.name = 'trunk'

  const { length, width, plateThickness, plateGap } = DIMS.trunk

  const bottomPlate = box(length, plateThickness, width, COLORS.copper)
  bottomPlate.name = 'bottomPlate'
  bottomPlate.position.y = plateThickness / 2
  trunk.add(bottomPlate)

  const topPlate = box(length, plateThickness, width, COLORS.copper)
  topPlate.name = 'topPlate'
  topPlate.position.y = plateGap + plateThickness / 2
  trunk.add(topPlate)

  const topPlateY = topPlate.position.y + plateThickness / 2

  const battery = box(DIMS.battery.l, DIMS.battery.h, DIMS.battery.w, COLORS.battery)
  battery.name = 'battery'
  battery.position.set(-length * 0.15, topPlateY + DIMS.battery.h / 2, 0)
  trunk.add(battery)

  const xbee = box(DIMS.xbee.l, DIMS.xbee.h, DIMS.xbee.w, COLORS.xbee)
  xbee.name = 'xbee'
  xbee.position.set(length * 0.25, topPlateY + DIMS.xbee.h / 2, 0)
  trunk.add(xbee)

  const antennaGeometry = new THREE.CylinderGeometry(0.5, 0.5, DIMS.xbee.antenna, 8)
  const antennaMaterial = new THREE.MeshLambertMaterial({ color: COLORS.xbee })
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
  antenna.name = 'antenna'
  antenna.position.set(
    length * 0.25 + DIMS.xbee.l * 0.3,
    topPlateY + DIMS.xbee.h + DIMS.xbee.antenna / 2,
    0,
  )
  trunk.add(antenna)

  return trunk
}

function buildLegSegment(name: LegName, withFoot: boolean): THREE.Group {
  const leg = new THREE.Group()
  leg.name = name

  const { size, height } = DIMS.segment
  const frameY = height / 2

  const frame = box(size, height, size, COLORS.fr4)
  frame.name = 'frame'
  frame.position.y = frameY
  leg.add(frame)

  const servoY = frameY
  const servoZOffset = size / 2 - DIMS.servo.d / 2
  for (const side of [-1, 1] as const) {
    const servo = box(DIMS.servo.w, DIMS.servo.h, DIMS.servo.d, COLORS.servo)
    servo.name = `servo-${side < 0 ? 'a' : 'b'}`
    servo.position.set(size / 2 + DIMS.servo.w / 2, servoY, side * servoZOffset)
    leg.add(servo)

    const horn = box(DIMS.servo.w * 0.5, 2, DIMS.servo.d * 0.6, COLORS.horn)
    horn.name = `horn-${side < 0 ? 'a' : 'b'}`
    horn.position.set(size / 2 + DIMS.servo.w, servoY + DIMS.servo.h / 2, side * servoZOffset)
    leg.add(horn)
  }

  const rodGeometry = new THREE.CylinderGeometry(
    DIMS.legRod.radius,
    DIMS.legRod.radius,
    DIMS.legRod.length,
    6,
  )
  const rodMaterial = new THREE.MeshLambertMaterial({ color: COLORS.rod })
  const rodTilt = 0.35 // rad, splay about the x axis so the rods lean outward in z
  // Center the rod so its lower tip lands at y = 0 (ground) at the home pose.
  const rodCenterY = (DIMS.legRod.length / 2) * Math.cos(rodTilt)
  for (const side of [-1, 1] as const) {
    const rod = new THREE.Mesh(rodGeometry, rodMaterial)
    rod.name = `rod-${side < 0 ? 'a' : 'b'}`
    // rotation.x leans the rod outward (in ±z); the position offset places it
    // beside the frame with its tip touching the ground.
    rod.rotation.x = side * rodTilt
    rod.position.set(size / 2 - DIMS.legRod.radius, rodCenterY, side * (size / 2 + 4))
    leg.add(rod)
  }

  if (withFoot) {
    const foot = box(DIMS.foot.l, DIMS.foot.h, DIMS.foot.w, COLORS.foot)
    foot.name = 'foot'
    foot.position.set(0, DIMS.foot.h / 2, 0)
    leg.add(foot)
  }

  return leg
}

export function buildCrawler(): CrawlerParts {
  const root = new THREE.Group()
  root.name = 'root'

  const trunk = buildTrunk()
  trunk.position.y = DIMS.trunk.restHeight
  root.add(trunk)

  const front = buildLegSegment('front', false)
  front.position.x = slotX('front')
  root.add(front)

  const middle = buildLegSegment('middle', true)
  middle.position.x = slotX('middle')
  root.add(middle)

  const rear = buildLegSegment('rear', false)
  rear.position.x = slotX('rear')
  root.add(rear)

  return { root, trunk, front, middle, rear }
}

function applyLeg(leg: THREE.Group, state: LegState): void {
  // leg.name is set to its LegName by buildLegSegment.
  leg.position.x = slotX(leg.name as LegName) + state.x
  leg.position.y = state.lift
}

export function applyCrawlerState(parts: CrawlerParts, state: CrawlerState): void {
  parts.trunk.position.y = DIMS.trunk.restHeight + state.trunkLift
  applyLeg(parts.front, state.front)
  applyLeg(parts.middle, state.middle)
  applyLeg(parts.rear, state.rear)
}
