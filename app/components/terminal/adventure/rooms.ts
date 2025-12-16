/**
 * Adventure Room Definitions
 * All room data for the text adventure game
 */

import type { Room } from "./types";

// Room definitions - A journey through a tech career
export const ROOMS: Record<string, Room> = {
  bedroom: {
    id: "bedroom",
    name: "Your Childhood Bedroom",
    description: `You're in a small bedroom filled with the warm glow of nostalgia. An old desktop
computer sits on a cluttered desk, its CRT monitor displaying a blinking cursor. Posters of video
games and sci-fi movies cover the walls. A window shows the fading light of a late afternoon.

This is where it all began - where you first learned that computers could do more than play games.`,
    shortDescription: "Your childhood bedroom with an old computer.",
    items: [
      {
        id: "floppy",
        name: "floppy disk",
        description: "A 3.5\" floppy disk labeled 'My First Program'",
        canTake: true,
      },
      {
        id: "manual",
        name: "BASIC manual",
        description: "A well-worn programming manual with coffee stains and margin notes",
        canTake: true,
      },
    ],
    exits: [{ direction: "north", roomId: "hallway", description: "A hallway leads north" }],
    visited: false,
    onEnter: "Memories flood back as you take in the familiar surroundings...",
  },

  hallway: {
    id: "hallway",
    name: "The Hallway of Decisions",
    description: `A long hallway stretches before you, its walls lined with doors. Each door has
a small plaque. To the east is "School", to the west is "The Garage", and to the north the
hallway continues toward a bright light labeled "The Future".`,
    shortDescription: "A hallway with several doors.",
    items: [],
    exits: [
      { direction: "south", roomId: "bedroom", description: "Your bedroom is to the south" },
      { direction: "east", roomId: "school", description: "The School door" },
      { direction: "west", roomId: "garage", description: "The Garage door" },
      { direction: "north", roomId: "university", description: "Towards The Future" },
    ],
    visited: false,
  },

  school: {
    id: "school",
    name: "The Computer Lab",
    description: `Rows of chunky beige computers fill this room, their fans humming in unison.
A friendly teacher nods at you from behind a desk cluttered with cables and software boxes.

"Feel free to explore," they say. "The best way to learn is by doing."

A bulletin board displays notices about programming competitions and tech clubs.`,
    shortDescription: "A school computer lab with rows of old PCs.",
    items: [
      {
        id: "certificate",
        name: "programming certificate",
        description: "A certificate from a coding competition - 'First Place'",
        canTake: true,
      },
    ],
    exits: [{ direction: "west", roomId: "hallway", description: "Back to the hallway" }],
    visited: false,
    onEnter: "The familiar smell of warm electronics fills your nostrils.",
  },

  garage: {
    id: "garage",
    name: "The Startup Garage",
    description: `A converted garage that serves as a makeshift office. Whiteboards covered in
diagrams and sticky notes line the walls. Pizza boxes are stacked in one corner, and the hum
of multiple servers fills the air.

A sign on the wall reads: "Move Fast and Build Things"

This is where side projects become real products.`,
    shortDescription: "A garage converted into a startup workspace.",
    items: [
      {
        id: "laptop",
        name: "vintage laptop",
        description: "A ThinkPad covered in conference stickers - your first 'real' dev machine",
        canTake: true,
      },
      {
        id: "whiteboard-marker",
        name: "whiteboard marker",
        description: "A blue marker that's seen countless architecture diagrams",
        canTake: true,
      },
    ],
    exits: [{ direction: "east", roomId: "hallway", description: "Back to the hallway" }],
    visited: false,
    onEnter: "The entrepreneurial spirit is palpable here.",
  },

  university: {
    id: "university",
    name: "The University Campus",
    description: `A sprawling campus stretches before you. Students hurry between buildings,
some carrying thick textbooks, others with laptops. A grand library rises in the distance.

To the east is the Computer Science building, and to the north lies the path to the professional
world beyond.`,
    shortDescription: "A university campus with paths in multiple directions.",
    items: [
      {
        id: "diploma",
        name: "diploma",
        description: "A framed diploma in Computer Science - hard-earned knowledge",
        canTake: true,
      },
    ],
    exits: [
      { direction: "south", roomId: "hallway", description: "Back to the hallway" },
      { direction: "east", roomId: "csbuilding", description: "The CS building" },
      { direction: "north", roomId: "crossroads", description: "The path forward" },
    ],
    visited: false,
  },

  csbuilding: {
    id: "csbuilding",
    name: "Computer Science Building",
    description: `The CS building buzzes with activity. Through open doors you see students
debugging code, professors gesturing at whiteboards, and TAs helping with homework.

A vending machine in the corner promises caffeine and sugar. A poster advertises
"Algorithm Design: Where Theory Meets Practice."`,
    shortDescription: "The Computer Science department building.",
    items: [
      {
        id: "algorithm-book",
        name: "algorithms textbook",
        description: "Introduction to Algorithms - the bible of CS",
        canTake: true,
      },
    ],
    exits: [{ direction: "west", roomId: "university", description: "Back to campus" }],
    visited: false,
    onLook: "You notice students collaborating on projects in study rooms.",
  },

  crossroads: {
    id: "crossroads",
    name: "The Career Crossroads",
    description: `You stand at a crossroads. Multiple paths branch out before you, each
representing a different career direction.

To the east lies "Big Tech Corp" - stability, resources, and established processes.
To the west is "Startup Valley" - risk, innovation, and the unknown.
To the north glows "Open Source Gardens" - community, collaboration, and contribution.`,
    shortDescription: "A crossroads with paths to different career directions.",
    items: [],
    exits: [
      { direction: "south", roomId: "university", description: "Back to university" },
      { direction: "east", roomId: "bigtech", description: "Big Tech Corp" },
      { direction: "west", roomId: "startup", description: "Startup Valley" },
      { direction: "north", roomId: "opensource", description: "Open Source Gardens" },
    ],
    visited: false,
    onEnter: "Every path has its own rewards and challenges...",
  },

  bigtech: {
    id: "bigtech",
    name: "Big Tech Corp",
    description: `A sleek, modern office building with floor-to-ceiling windows. Engineers
work at standing desks with multiple monitors. The cafeteria serves gourmet food, and
every meeting room has a quirky name.

A plaque on the wall reads: "Scaling to Billions"

The work here reaches millions of users every day.`,
    shortDescription: "A modern corporate tech office.",
    items: [
      {
        id: "badge",
        name: "employee badge",
        description: "A corporate badge - access to resources and mentorship",
        canTake: true,
      },
    ],
    exits: [{ direction: "west", roomId: "crossroads", description: "Back to crossroads" }],
    visited: false,
    onEnter: "The scale of impact here is impressive.",
  },

  startup: {
    id: "startup",
    name: "Startup Valley",
    description: `A co-working space filled with energy and chaos. Founders pitch to investors
in one corner while developers ship features at breakneck speed in another. A ping pong
table serves as a conference room.

A banner declares: "Build. Measure. Learn."

The potential for creation is unlimited here, but so is the uncertainty.`,
    shortDescription: "A chaotic but energetic startup space.",
    items: [
      {
        id: "equity",
        name: "stock options",
        description: "A stock option agreement - a bet on the future",
        canTake: true,
      },
    ],
    exits: [{ direction: "east", roomId: "crossroads", description: "Back to crossroads" }],
    visited: false,
    onEnter: "The entrepreneurial energy is infectious!",
  },

  opensource: {
    id: "opensource",
    name: "Open Source Gardens",
    description: `A beautiful garden where code grows on digital trees. Contributors from
around the world tend to projects, fixing bugs like weeding and adding features like
planting new flowers.

A sign reads: "Given enough eyeballs, all bugs are shallow."

In the center stands a fountain with the words "Free as in Freedom" inscribed.`,
    shortDescription: "A collaborative garden of open source projects.",
    items: [
      {
        id: "commit",
        name: "merged PR",
        description: "A commemorative plaque for your first merged pull request",
        canTake: true,
      },
    ],
    exits: [
      { direction: "south", roomId: "crossroads", description: "Back to crossroads" },
      {
        direction: "north",
        roomId: "summit",
        description: "The path to the summit",
        locked: true,
        keyItem: "wisdom",
      },
    ],
    visited: false,
    onEnter: "You feel connected to developers around the world.",
  },

  summit: {
    id: "summit",
    name: "The Summit",
    description: `You've reached the summit - not of a mountain, but of understanding. From
here, you can see all the paths you've traveled: the bedroom where curiosity sparked,
the school where skills were honed, the crossroads where decisions were made.

A terminal sits on a stone pedestal, its screen displaying:

    ┌──────────────────────────────────────────┐
    │                                          │
    │   The journey never really ends.         │
    │   Technology evolves, and so do we.      │
    │                                          │
    │   Keep learning. Keep building.          │
    │   Keep sharing what you know.            │
    │                                          │
    │   Type 'claim reward' to complete        │
    │   your journey.                          │
    │                                          │
    └──────────────────────────────────────────┘

You've gathered wisdom from every path - now it's time to share your own story.`,
    shortDescription: "The summit - where all paths converge.",
    items: [],
    exits: [{ direction: "south", roomId: "opensource", description: "Back down" }],
    visited: false,
    onEnter: "You feel a sense of accomplishment wash over you.",
  },
};

export function getRoom(roomId: string): Room | undefined {
  return ROOMS[roomId];
}

export function getTotalRoomCount(): number {
  return Object.keys(ROOMS).length;
}
