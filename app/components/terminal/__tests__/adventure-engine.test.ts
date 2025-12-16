import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadState,
  saveState,
  resetState,
  getRoom,
  getCurrentRoom,
  parseCommand,
  getStats,
  type AdventureState,
} from '../adventure-engine'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('adventure-engine', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('loadState', () => {
    it('returns initial state when no saved state exists', () => {
      const state = loadState()
      expect(state.currentRoom).toBe('bedroom')
      expect(state.inventory).toEqual([])
      expect(state.visitedRooms).toEqual([])
      expect(state.moveCount).toBe(0)
      expect(state.gameStarted).toBe(false)
      expect(state.gameComplete).toBe(false)
    })

    it('returns saved state from localStorage', () => {
      const savedState: AdventureState = {
        currentRoom: 'hallway',
        inventory: ['floppy'],
        visitedRooms: ['bedroom', 'hallway'],
        flags: {},
        moveCount: 5,
        gameStarted: true,
        gameComplete: false,
        takenItems: {},
      }
      localStorageMock.setItem('frhd-adventure-state', JSON.stringify(savedState))

      const state = loadState()
      expect(state.currentRoom).toBe('hallway')
      expect(state.inventory).toContain('floppy')
      expect(state.moveCount).toBe(5)
    })
  })

  describe('saveState', () => {
    it('saves state to localStorage', () => {
      const state: AdventureState = {
        currentRoom: 'school',
        inventory: ['manual'],
        visitedRooms: ['bedroom', 'school'],
        flags: { testFlag: true },
        moveCount: 3,
        gameStarted: true,
        gameComplete: false,
        takenItems: {},
      }

      saveState(state)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-adventure-state',
        expect.any(String)
      )

      const saved = JSON.parse(localStorageMock.getItem('frhd-adventure-state')!)
      expect(saved.currentRoom).toBe('school')
    })
  })

  describe('resetState', () => {
    it('returns initial state', () => {
      const state = resetState()
      expect(state.currentRoom).toBe('bedroom')
      expect(state.inventory).toEqual([])
      expect(state.gameStarted).toBe(false)
    })

    it('saves reset state to localStorage', () => {
      resetState()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('getRoom', () => {
    it('returns correct room by id', () => {
      const room = getRoom('bedroom')
      expect(room).toBeDefined()
      expect(room?.name).toBe('Your Childhood Bedroom')
    })

    it('returns undefined for invalid room id', () => {
      const room = getRoom('nonexistent')
      expect(room).toBeUndefined()
    })
  })

  describe('getCurrentRoom', () => {
    it('returns current room from state', () => {
      const state: AdventureState = {
        currentRoom: 'school',
        inventory: [],
        visitedRooms: [],
        flags: {},
        moveCount: 0,
        gameStarted: true,
        gameComplete: false,
        takenItems: {},
      }

      const room = getCurrentRoom(state)
      expect(room.name).toBe('The Computer Lab')
    })

    it('defaults to bedroom for invalid room', () => {
      const state: AdventureState = {
        currentRoom: 'invalid',
        inventory: [],
        visitedRooms: [],
        flags: {},
        moveCount: 0,
        gameStarted: true,
        gameComplete: false,
        takenItems: {},
      }

      const room = getCurrentRoom(state)
      expect(room.id).toBe('bedroom')
    })
  })

  describe('parseCommand', () => {
    describe('when game not started', () => {
      it('shows intro text on first command', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: false,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('look', state)

        expect(result.output.join('\n')).toContain("THE DEVELOPER'S JOURNEY")
        expect(result.newState.gameStarted).toBe(true)
      })
    })

    describe('look command', () => {
      it('displays room description', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('look', state)

        expect(result.output.join('\n')).toContain('Your Childhood Bedroom')
      })

      it('marks room as visited', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('look', state)

        expect(result.newState.visitedRooms).toContain('bedroom')
      })

      it('shortcut l works', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('l', state)

        expect(result.output.join('\n')).toContain('Your Childhood Bedroom')
      })
    })

    describe('go command', () => {
      it('moves to adjacent room', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('go north', state)

        expect(result.newState.currentRoom).toBe('hallway')
        expect(result.newState.moveCount).toBe(1)
      })

      it('direction shortcuts work (n/s/e/w)', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('n', state)

        expect(result.newState.currentRoom).toBe('hallway')
      })

      it('cannot go in invalid direction', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('go east', state)

        expect(result.newState.currentRoom).toBe('bedroom')
        expect(result.output).toContain("You can't go that way.")
      })

      it('shows error when no direction given', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('go', state)

        expect(result.output).toContain('Go where? Try: north, south, east, west')
      })
    })

    describe('take command', () => {
      it('picks up item from room', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('take floppy', state)

        expect(result.newState.inventory).toContain('floppy')
        expect(result.output.join('\n')).toContain('You take the floppy disk')
      })

      it('get alias works', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('get manual', state)

        expect(result.newState.inventory).toContain('manual')
      })

      it('cannot take nonexistent item', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('take sword', state)

        expect(result.output).toContain('You don\'t see any "sword" here.')
      })

      it('shows error when no item specified', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('take', state)

        expect(result.output).toContain('Take what?')
      })
    })

    describe('inventory command', () => {
      it('shows empty inventory', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('inventory', state)

        expect(result.output).toContain("You're not carrying anything.")
      })

      it('shortcut i works', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('i', state)

        expect(result.output).toContain("You're not carrying anything.")
      })

      it('lists items when carrying', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: ['floppy'],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('inv', state)

        expect(result.output.join('\n')).toContain('You are carrying:')
        expect(result.output.join('\n')).toContain('floppy disk')
      })
    })

    describe('help command', () => {
      it('shows help text', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('help', state)

        expect(result.output.join('\n')).toContain('Commands:')
        expect(result.output.join('\n')).toContain('look')
        expect(result.output.join('\n')).toContain('take')
      })

      it('? shortcut works', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('?', state)

        expect(result.output.join('\n')).toContain('Commands:')
      })
    })

    describe('exits command', () => {
      it('lists available exits', () => {
        const state: AdventureState = {
          currentRoom: 'hallway',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('exits', state)

        expect(result.output.join('\n')).toContain('north')
        expect(result.output.join('\n')).toContain('south')
        expect(result.output.join('\n')).toContain('east')
        expect(result.output.join('\n')).toContain('west')
      })
    })

    describe('examine command', () => {
      it('examines item in room', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('examine floppy', state)

        expect(result.output.join('\n')).toContain('3.5"')
        expect(result.output.join('\n')).toContain('floppy disk')
      })

      it('x shortcut works', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: ['bedroom'],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('x manual', state)

        expect(result.output.join('\n')).toContain('programming manual')
      })
    })

    describe('unknown command', () => {
      it('shows error for unknown commands', () => {
        const state: AdventureState = {
          currentRoom: 'bedroom',
          inventory: [],
          visitedRooms: [],
          flags: {},
          moveCount: 0,
          gameStarted: true,
          gameComplete: false,
        takenItems: {},
        }

        const result = parseCommand('dance', state)

        expect(result.output.join('\n')).toContain("I don't understand")
      })
    })

    describe('game completion', () => {
      it('shows completion message when game is complete', () => {
        const state: AdventureState = {
          currentRoom: 'summit',
          inventory: ['wisdom'],
          visitedRooms: ['bedroom', 'summit'],
          flags: {},
          moveCount: 10,
          gameStarted: true,
          gameComplete: true,
        takenItems: {},
        }

        const result = parseCommand('look', state)

        expect(result.output.join('\n')).toContain('adventure reset')
      })
    })
  })

  describe('getStats', () => {
    it('returns correct statistics', () => {
      const state: AdventureState = {
        currentRoom: 'hallway',
        inventory: ['floppy', 'manual'],
        visitedRooms: ['bedroom', 'hallway', 'school'],
        flags: {},
        moveCount: 15,
        gameStarted: true,
        gameComplete: false,
        takenItems: {},
      }

      const stats = getStats(state)

      expect(stats.moveCount).toBe(15)
      expect(stats.itemsCollected).toBe(2)
      expect(stats.roomsVisited).toBe(3)
      expect(stats.gameComplete).toBe(false)
    })
  })
})
