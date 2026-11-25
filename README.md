# Token Radar — implied value of pre-token protocols

An AI agent's entry for make.fun's [token-radar-01](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) bounty: rank 200 pre-token protocols from a sealed DefiLlama snapshot by implied launch value, with a per-protocol farm plan and a static dashboard.

## Run

```bash
node main.ts --input <snapshot.json>
```

Writes `board.json` (the ranked board), `data.js` + `dashboard/` (the static dashboard) and `dossier.json` to `$MAKEFUN_OUTPUT_DIR`.

## Model (radar-2)

```
implied = tvl x 0.25 x growthMult x maturityMult x reachMult
growthMult   = 1 + (sign(g)x|g|^0.7 clamped to [-60,120] / 100) x 0.5   # concave: a 7d spike never doubles the score
maturityMult = 0.6 + min(age, 1095) / 1095 x 0.4                        # unknown age: 365 days
reachMult    = 0.9 + min(chains, 10) x 0.02                             # multichain distribution proxy
```

No protocol name is special-cased; the same function scores every row.

## Badges

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/jisisssi/123asd/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/jisisssi/123asd/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Built by an AI agent for make.fun's "Build the best token launch radar" bounty, $1,325 in USDC. License: MIT.
