module.exports = {
  getOutCome(gold, silver, red) {
    if (gold.length && silver.length && !red.length) {
      return 'GOLD_SILVER' 
    } else if (gold.length && !silver.length && !red.length) {
      return 'ALL_GOLD'
    } else if (!gold.length && silver.length && !red.length) {
      return 'ALL_SILVER'
    } else if(!gold.length && !silver.length && red.length > 2) {
      return 'ALL_RED'
    } else if (gold.length && silver.length && red.length) {
      return red.length > 1 ? 'TWO_RED' : 'ONE_RED'
    } else if ((gold.length ^ silver.length) && red.length) {
      return 'ONE_GOLD_XOR_SILVER'
    }
  },
  add1M(user, round) {
    const currentMoney = user.money
    user.money = currentMoney + 1000000
    if (!user.history) {
      user.history = []
    }
    user.history[round] = 1000000
  },
  minus1M(user, round) {
    const currentMoney = user.money
    user.money = currentMoney - 1000000
    if (!user.history) {
      user.history = []
    }
    user.history[round] = -1000000
  },
  add2M(user, round) {
    const currentMoney = user.money
    user.money = currentMoney + 2000000
    if (!user.history) {
      user.history = []
    }
    user.history[round] = 2000000
  },
  minus10M(user, round) {
    const currentMoney = user.money
    user.money = currentMoney - 10000000
    if (!user.history) {
      user.history = []
    }
    user.history[round] = -10000000
  }
}