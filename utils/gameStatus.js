module.exports = {
  WAITING: 'WAITING',
  WAITING_PLAYERS: 'WAITING_PLAYERS',
  IN_PROGRESS: 'IN_PROGRESS',
  END: 'END',
  ROUND_ENDED: 'ROUND_ENDED',
  isWaiting: (status) => {
    return status.toUpperCase().includes('WAITING')
  }
}