import { Player, PlayerBase, Room } from '~/interfaces'
import { Timestamp } from '~/utils/firebase'

const defaultPlayerData: PlayerBase = {
  boards: '',
  date: null,
  name: '',
  selectedNumbers: [],
}

const createPlayer = (
  room: Room,
  player: Partial<PlayerBase>,
): {
  playerId: string
  playerRef: firebase.firestore.DocumentReference<
    firebase.firestore.DocumentData
  >
  playerData: PlayerBase
} => {
  const playerRef = room.ref.collection('players').doc()
  const playerId = playerRef.id
  const playerData = Object.assign({}, defaultPlayerData, player, {
    date: Timestamp.fromDate(new Date()),
  })

  return { playerId, playerRef, playerData }
}

const excludeExtraFields = (player: Player): PlayerBase => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exists, id, ref, ...playerValues } = player

  return playerValues
}

const removePlayer = async (player: Player) => {
  return await player.ref.delete()
}

const updatePlayer = (
  playerRef: firebase.firestore.DocumentReference,
  playerData: Partial<PlayerBase>,
): Promise<void> => {
  return playerRef.update(playerData)
}

const playerApi = {
  createPlayer,
  excludeExtraFields,
  removePlayer,
  updatePlayer,
}

export default playerApi
export { defaultPlayerData }
