export interface PlayerBase {
  [key: number]: number[]
  tickets: string
  date: firebase.firestore.Timestamp | null
  name: string
  selectedNumbers: number[]
}

export interface Player extends PlayerBase {
  exists: boolean
  id: string
  ref: firebase.firestore.DocumentReference
}
