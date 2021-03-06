import Router from 'next-translate/Router'
import useTranslation from 'next-translate/useTranslation'
import React, { Fragment, useEffect, useState } from 'react'
import { FiSmile } from 'react-icons/fi'
import Box from '~/components/Box'
import Button from '~/components/Button'
import Checkbox from '~/components/Checkbox'
import Container from '~/components/Container'
import Copy from '~/components/Copy'
import Heading from '~/components/Heading'
import InputText from '~/components/InputText'
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import Players from '~/components/Players'
import RoomCodeCell from '~/components/RoomCodeCell'
import Select from '~/components/Select'
import useEasterEgg from '~/hooks/useEasterEgg'
import useRandomTickets from '~/hooks/useRandomTickets'
import useRoom from '~/hooks/useRoom'
import useRoomPlayers from '~/hooks/useRoomPlayers'
import useToast from '~/hooks/useToast'
import { Emojis } from '~/interfaces'
import playerApi, { defaultPlayerData } from '~/models/player'
import roomApi, { defaultRoomData } from '~/models/room'
import { createBatch, getBaseUrl, isRoomOld, scrollToTop } from '~/utils'

export default function Admin() {
  const { t } = useTranslation()
  const {
    error: playersError,
    loading: playersLoading,
    players,
    setPlayers,
  } = useRoomPlayers()
  const { error: roomError, loading: roomLoading, room, updateRoom } = useRoom()
  const randomTickets = useRandomTickets()
  const [inProgress, setInProgress] = useState(false)
  const { createToast, dismissToast, updateToast } = useToast()
  const { isActive, incrementInteractions } = useEasterEgg('useRoomExperiments')

  useEffect(scrollToTop, [])

  if (roomLoading || playersLoading) {
    return (
      <Layout>
        <Container>
          <Message type="information">{t('common:loading-room')}</Message>
        </Container>
      </Layout>
    )
  }

  if (roomError || playersError) {
    return (
      <Layout>
        <Container>
          <Message type="error">{t('common:error-room')}</Message>
        </Container>
      </Layout>
    )
  }

  if (!room) return null

  if (isRoomOld(room)) {
    return (
      <Layout>
        <Container>
          <Message type="error">{t('common:outdated-room')}</Message>
        </Container>
      </Layout>
    )
  }

  const submitRoom = async () => {
    setInProgress(true)

    const toastId = createToast('admin:saving', 'information')

    try {
      const batch = createBatch()

      batch.update(room.ref, {
        ...defaultRoomData,
        ...roomApi.excludeExtraFields(room),
        readyToPlay: true,
        selectedNumbers: [],
        soundToPlay: '',
        confettiType: '',
      })

      players.map((player, index) => {
        batch.set(player.ref, {
          ...defaultPlayerData,
          ...playerApi.excludeExtraFields(player),
          /* TODO: review this case after improving the one with the room above */
          tickets: randomTickets[index],
          selectedNumbers: [],
        })
      })

      await batch.commit()

      updateToast('admin:success', 'success', toastId)

      setTimeout(() => {
        dismissToast(toastId)

        Router.pushI18n('/room/[roomId]', `/room/${room.id}`)
      }, 2000)
    } catch (e) {
      updateToast('admin:error', 'error', toastId)

      setInProgress(false)
    }
  }

  return (
    <Layout>
      <Container>
        <Box>
          <div className="mb-4 text-center">
            <Heading type="h2">
              <span
                id="room-title"
                onClick={incrementInteractions}
                role="button"
                tabIndex={0}
                onKeyPress={incrementInteractions}
                className="cursor-text focus:outline-none outline-none"
              >
                {t('admin:title')}
              </span>
            </Heading>
          </div>
          <Fragment>
            <InputText
              id="room-name"
              label={t('admin:field-name')}
              value={room.name}
              readonly
              onFocus={event => event.target.select()}
            />
            <InputText
              hint={t('admin:field-link-hint')}
              id="url"
              label={t('admin:field-link')}
              value={`${getBaseUrl()}/room/${room.id}`}
              readonly
              onFocus={event => event.target.select()}
            />
            <Copy content={`${getBaseUrl()}/room/${room.id}`} />
            <Players
              isFormDisabled={inProgress}
              players={players}
              room={room}
              setPlayers={setPlayers}
              updateRoom={updateRoom}
            />
            <div className="mt-4">
              <Select
                disabled={!players.length || inProgress}
                hint={t('admin:players.field-admin-hint')}
                id="adminId"
                label={t('admin:players.field-admin')}
                onChange={value => updateRoom({ adminId: value })}
                options={players}
                value={room.adminId}
              />
            </div>
            <div className="mt-4">
              <Checkbox
                hint={t('admin:field-bingo-spinner-hint')}
                id="bingo-spinner"
                label={t('admin:field-bingo-spinner')}
                onChange={value => {
                  updateRoom({ bingoSpinner: value })
                }}
                value={room.bingoSpinner}
                disabled={inProgress}
              />
            </div>
            <div className="mt-4">
              <Checkbox
                hint={t('admin:field-hide-dreams-hint')}
                id="hide-numbers-meaning"
                label={t('admin:field-hide-dreams')}
                onChange={value => {
                  updateRoom({ hideNumbersMeaning: value })
                }}
                value={room.hideNumbersMeaning}
                disabled={inProgress}
              />
            </div>
            {isActive && (
              <Fragment>
                <div className="mt-4">
                  <Checkbox
                    hint="Pedir el código de sala al ingresar a los cartones de quien dirige la sala"
                    id="activate-admin-code"
                    label="Activar código para el admin"
                    onChange={value => {
                      updateRoom({ activateAdminCode: value })
                    }}
                    value={room.activateAdminCode}
                    disabled={inProgress}
                  />
                </div>
                {room.activateAdminCode && (
                  <div className="mt-4">
                    <p>{t('admin:room-code')}</p>
                    <div className="flex flex-wrap justify-between mt-1">
                      {room.code.split(',').map((emoji, index) => {
                        return (
                          <RoomCodeCell
                            highlighted
                            emoji={emoji as keyof Emojis}
                            index={index}
                            isChecked={false}
                            key={index}
                            onClick={() => void 0}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}
              </Fragment>
            )}
            <div className="mt-8">
              <Button
                aria-label={t('admin:field-submit')}
                color="green"
                id="configure-room"
                className="w-full"
                disabled={!room.adminId || players.length < 2 || inProgress}
                onClick={submitRoom}
              >
                <FiSmile />
                <span className="ml-4">{t('admin:field-submit')}</span>
              </Button>
            </div>
          </Fragment>
        </Box>
      </Container>
    </Layout>
  )
}
