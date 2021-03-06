import { useContext } from 'react'
import { PlayersContext } from '~/contexts/Players'

export default function useRoomPlayers() {
  const { error, loading, players, setPlayers } = useContext(PlayersContext)

  return { error, loading, players, setPlayers }
}
