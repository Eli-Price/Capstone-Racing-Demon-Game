/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

export class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
    this.rooms = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }

  createRoom(roomID) {
    this.rooms[roomID] = { isActive: true };
    console.log(this.rooms[roomID]);
  }

  getRoom(roomID) {
    return this.rooms.get(roomID);
  }

  isRoomActive(roomID) {
    return this.rooms[roomID]?.isActive;
  }

  getRoomPlayerCount(roomID) {
    return this.rooms[roomID]?.players?.length || 0;
  }

  addPlayerToRoom(roomID, playerID) {
    if (!this.rooms.has(roomID)) {
        this.rooms.set(roomID, { players: [], isActive: true });
        console.log(this.rooms.get(roomID) + ' : ' + playerID);
    }
    const room = this.rooms.get(roomID);
    if (!room.players.includes(playerID)) {
        room.players.push(playerID);
    }
    console.log(`Room ${roomID} players: ${room.players.join(', ')}`);
  }
}
/*module = {
  exports: InMemorySessionStore
};*/
