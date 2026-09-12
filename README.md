# Hearthvale

A persistent online sandbox with a **player-driven economy**. Local login is enough to play. **Creditcoin + Attestcoin** own REALM and land NFTs — never combat power.

## BUIDL CTC 2026 Fall (Gaming)

Attestcoin is the join between fast in-game coins and Creditcoin settlement:

`coins burned` → Sepolia `CoinBurnNotary` → Attestcoin proof (`0x0FD2`) → `RealmMinterASC` mints **REALM** → `LandNFT` / `ItemMarketplace`.

| Need | Where |
| --- | --- |
| Integration write-up | [docs/10_blockchain/AttestcoinIntegration.md](docs/10_blockchain/AttestcoinIntegration.md) |
| 3-minute demo script | [docs/10_blockchain/DemoScript.md](docs/10_blockchain/DemoScript.md) |
| Combat never gated | [docs/10_blockchain/ChainNeverGatesCombat.md](docs/10_blockchain/ChainNeverGatesCombat.md) |
| Live testnet addresses | table below + `contracts/deployments/` |
| App tests | `npm test` |
| Contract tests | `npm run test:contracts` (`forge test`; Foundry) |

Live (Creditcoin Testnet `102031` + Sepolia `11155111`):

| Contract | Chain | Address |
| --- | --- | --- |
| CoinBurnNotary | Sepolia | [`0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A`](https://sepolia.etherscan.io/address/0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A) |
| RealmToken | Creditcoin | [`0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A`](https://creditcoin-testnet.blockscout.com/address/0x8ebd21b2934dBF67F7a09A6feB61bB05a31Ed36A) |
| LandNFT | Creditcoin | [`0x843Da5c71F3703ea2Ec4220B2Ca4b5F948ba6769`](https://creditcoin-testnet.blockscout.com/address/0x843Da5c71F3703ea2Ec4220B2Ca4b5F948ba6769) |
| ItemMarketplace | Creditcoin | [`0x3c536377f9dAF9F8a0FA1BAcb020C174e65466c7`](https://creditcoin-testnet.blockscout.com/address/0x3c536377f9dAF9F8a0FA1BAcb020C174e65466c7) |
| RealmMinterASC | Creditcoin | [`0x7DA68C1C7775256b96D992167A057941BB964602`](https://creditcoin-testnet.blockscout.com/address/0x7DA68C1C7775256b96D992167A057941BB964602) |

Same hex on Notary and REALM is two `CREATE` nonce-0 deploys on **different chains**, not one contract.

Opening the web app shows the **Hearthvale** title cover (dusk mill, world intro, four maps) and a styled **Cross the gate** card for local login / register. No wallet is required to play.

## Stack (locked)

| Layer | Choice |
| --- | --- |
| Client | Next.js + React Three Fiber (Three.js) + Drei |
| Server | Node.js + Hono (monolith, authoritative) |
| DB | SQLite + Drizzle (supported). Postgres opt-in disabled until RF3.3 async layer. |
| Auth | Local username/password (optional Creditcoin / MetaMask wallet; never required). Sessions expire after 7d (`GAME_SESSION_TTL_MS` override). Min password length 8. |
| 3D | Stylized procedural kits (farmer, tutors, mill windmill, craft stations); **City Hall** is assembled from the farmer-style concept palette (cream clay, timber, green shutters, clock — not brick/farm/niko packs); placeholder brick-pack civic houses are off the city map; plaza arch is the masonry kit; **city / homestead atmosphere** uses YumeForge Free Japan Village GLTFs (trees, fences, lanterns) with kit fallback; crop plots use Japan Village produce when planted; chop-ready wood nodes are leafy trees (stump while cooling); tree canopies hide only while you stand behind them. |

See [docs/19_development_plan/MVPDefinition.md](docs/19_development_plan/MVPDefinition.md).

## Quick start

```bash
npm install
npm run dev
```

`predev` frees ports **8787** and **3000** first (avoids Windows `EADDRINUSE` from stale `tsx`/Next watchers). If a port is still stuck: `npm run ports:free`.

Production (builds shared, server, and Next, then serves):

```bash
npm start
```

`prestart` frees ports **8787** and **3000** (same as `npm run ports:free`), then runs the full workspace build so `next start` has a production `.next`. Use `npm run build` alone when you only need compile output.

- Web: http://localhost:3000  
- API: http://localhost:8787/health  
- WebSocket: `ws://localhost:8787/ws` (presence + chat push)  
- CORS: `GAME_CORS_ORIGIN` (default `http://localhost:3000`; comma-separated for multiple)  
- Auth rate-limit IP: `GAME_TRUST_PROXY=1` only when a reverse proxy overwrites `X-Forwarded-For` (otherwise spoofed headers are ignored)  
- Session TTL: `GAME_SESSION_TTL_MS` (default 7 days)  
- Telemetry counters: `GET /telemetry` with a session Bearer token (anonymous callers get `{ ok: true }` only)  
- Stub chain price mirror (read-only): http://localhost:8787/chain/marketplace  
- Chain never gates combat/energy (F15.5): see [docs/10_blockchain/ChainNeverGatesCombat.md](docs/10_blockchain/ChainNeverGatesCombat.md)
- Creditcoin + Attestcoin (REALM token, land NFTs, coin swap): [docs/10_blockchain/AttestcoinIntegration.md](docs/10_blockchain/AttestcoinIntegration.md). Copy `.env.example`. Economy contracts: `npm run chain:deploy` (tCTC from Discord `#token-faucet`). Attestcoin path: `npm run chain:deploy:sepolia` (Sepolia ETH) then `npm run chain:deploy:asc`. Press **B** in-game. `GAME_CREDITCOIN_MODE=attestcoin` mints REALM via Sepolia notary + `RealmMinterASC`; `local_dev` is the offline fallback.  

### Local SQLite

DB file: `apps/server/data/game.db`. Schema version bumps may wipe local data — delete that file and register again if state looks wrong.

### Postgres (not supported yet)

`GAME_DB_DRIVER=postgres` **hard-fails at startup** (RF3.1). SQLite is the only supported driver until the async AppDb work (RF3.3). Ignore older F16.1 / Compose notes that claim Postgres is ready.

Register a settler on the Hearthvale cover at http://localhost:3000 (Enter / Join).

Hero art: mill is the in-engine windmill kit (clay tower + wooden vanes; not mill.glb); City Hall is the in-engine concept kit (not the brick-house Collada pack); city/homestead props + crop meshes → `apps/web/public/models/japan-village/` (YumeForge Free Japan Village; `npm run setup:japan-village -- <unzipped pack>`). Explore hunt hare/boar are in-engine stylized kits (hop / trot), not CraftPix FBX. Avatars use the stylized procedural farmer kit (`StylizedHumanoidKit`) with walk pose — no external character packs.

You play as an **avatar on the land** (MMO presence), not a dashboard:

| Key | Action |
| --- | --- |
| WASD / arrows | Move |
| E | Interact with nearest building |
| I | Inventory — icon grid, search/filter chips, eat food, equip tools / weapons / armor / shields |
| P | Land editor on Your Land (place from bag, click a station to move or pick up) |
| T | Player trade |
| V | Visit another player's land |
| N | Travel map (City / Land / Explore / Warrior — free, instant) |
| M | Player market board — search open listings by item or seller (also walk-up at city market board) |
| E | Interact — stations, city tutors, city vendor, coin Market, REALM Market, notice board, arena plaque, land gate |
| C | World / guild chat |
| G | Guilds (create / invite code / ranks) |
| Q | Starter quests (track + claim) |
| J | Achievements (counters + unlocks) |
| L | Mail (offline parcels) |
| B | Creditcoin desk — MetaMask, coin→REALM, NFT lands, REALM item market |
| H | Settings + full keybind help (mute BGM/SFX) |
| Esc | Close panel / leave visit |

While logged in, **Cozy Game Loop** plays on Your Land, **Peaceful Affection** in the City, and **Calm Optimism** on Explore and the Arena. Travel between Explore and Arena keeps the same song; other map hops crossfade. Mute in Settings (H).

Walking HUD is minimal (vitals bars, coin count, map chip, quiet key chips) — panels open on walk-up or hotkey, not as permanent columns (CL6.1). Full key list is **H**.

- First session: a one-shot **welcome** tells you to talk to the **Governor** in front of City Hall (a few steps from where you arrive in the City — **N**). Talking is a **dialogue** (one line at a time; **E** / click to continue). He sends you to the **Farmer** (buy seeds, plant, harvest). After you claim a tutor lesson, that NPC **points you to the next one** (station + where they stand). Builder, Animal Hunter, and Monster Hunter stand **by the plaza fountain** (practice is on Your Land / Explore). The **Market Broker** (east sage stall) teaches player-to-player coin listings; the indigo stall in front of it is the **REALM Market** (same desk as **B**). City tutors use a different villager (not the player Hunter); each profession recolors that villager's clothes. The **Deed Clerk** (Deed desk) teaches optional Creditcoin — REALM and land NFTs, never required to play. **Q** is a **quest board**: the current errand is a parchment slip, finished tutors sit in a compact Done list, and rewards are still claimed by talking to that NPC. Later station quests appear after you finish the current one.

- Walk to a **Field** → E to plant / harvest. Empty plots with more than one seed type open a **seed picker**. Wheat is ready in **3 minutes**; corn 2m, potato 4m, cotton 5m, herb 6m (different vendor prices).
- Empty **player land**: open grass yard (no starter shed or wooden path). The **lower fence gate** is the land exit — walk up and press **E** (or **N**) for Travel. Craft station/decor kits at a Workshop (wait/collect), then press **P** to place from your bag (hover ghost, **R** rotate preview, click cell). In the land editor, click stations to **move** or **pick up**. Process crafts are **start → wait → Collect**.
- Walk to the **Tree Stump** → E chops wood; **Workshop** saws planks / crafts wooden hoe / station kits.
- Walk to the **Ore Rock** with an **Iron Hammer** → E chips ore. Player-land rocks yield **iron**; Explore mines mix **iron / copper / gold** (60s–120s cooldowns). Smelt bars at the Forge.
- Walk through **Hunt grounds** brush — hares live in a grass patch and **roam that area**. Getting close starts an encounter: the camera frames the duel, HP bars sit on the creature and the HUD, they **bite on their own**. **LMB** Attack, **RMB** Guard, **WASD** to move. Leather/meat on win (**Animal Hunter XP**). Equip a club / sword / bow, armor, and shield from Inventory (I).
- Walk through the **Edge Thicket** brush → same realtime hunt vs a Brush Boar (boar tusks + **Monster Hunter XP**).
- **Warrior Arena** has a **training dummy** in the ring (it stays planted but punches on a timer; same WASD / LMB / RMB, no hunter loot). Plaques still explain the optional path. Free enter/exit via **N** or the north Exit portal; warrior buildings cannot be placed on Your Land.
- City vendor sells a **Wooden Club** as basic combat gear (plus wheat/corn/potato/cotton/herb seeds and tools). Forge an iron sword; workshop carves bow/shield/club; loom stitches leather armor (or weave cotton).
- Equip a **hoe or Iron Hammer** before hunting for soft bonus damage (tools wear on the hunt).
- Losing a hunt costs extra energy and a longer zone cooldown — never wipes inventory or land.
- Walk to **Vendor Stall** → E opens buy/sell.
- Press **V** / **M** / **C** / **G** for visit, market, chat, guilds.
- Press **P** on Your Land to place kits from your bag, or click a station to move / pick it up.
- Server rejects actions if you are too far from the station (proximity).
- Energy gates production; bake bread or cornbread, roast potato, cook meat/fish/stew, or pack travel rations at the Kitchen; brew herbal tonic at the Alchemy Bench (wheat+leather or farmed herb); sew cloth bandages at the Loom (+20 energy / +20 HP). Eating food restores the same amount of **HP** as energy. Health also regenerates +1 every 30s while below max (paused during a live fight). After a lost hunt you get up at 1 HP.
- Coins are soft currency (not inventory). Schema **v31** adds `craft_jobs` (start→wait→collect); **v30** adds `alchemist_xp` (CL31.3); v29 `animal_hunter_xp` / `monster_hunter_xp` (CL31.1; legacy `hunter_xp` migrates to animal); v28 `animal_breeder_xp` (CL27.2); v27 `fisher_xp` (CL23.1); v26 `builder_xp`; v25 `miner_xp`; v24 `forester_xp`; v23 `weaver_xp` (CL13.3); v22 CityLands map kinds (`city` / `player_land` / `explore` / `warrior`; legacy `starter`→`player_land`, `forest`→`explore`); new players get **empty** player land (open grass; no packed mill/forge/kitchen yard; layout editor is **P**). A one-shot onboarding tip points at **City as the shared hub** (dismissible; Settings can hide tips) — press **N** / Portal (CL12.1). Another dismissible tip + land-editor copy clarifies empty land is intentional (CL16.1). After the first land craft, a one-shot tip nudges **City Vendor / Market** (CL21.1). Player-land stations are unlimited per type (CL3.2). v21 deed mint/list stubs; v20 land deeds; v19 optional wallet stub; v18 mail parcels; v17 achievements; v16 starter quests; v15 claim soft war; v14 claim nodes; v13 guild bank; v12 guild ranks + invite codes; v11 caravan travel; v10 multi-land; v9 building tiers; v8 carpenter XP + wood; v7 hunter XP; v6 combat stats; v5 cook XP + guilds (additive).
- Press **N**, walk up to the **yard gate** on Your Land, or the Arena **Exit** portal for **free instant travel** (**City / Land / Explore / Arena** tiles). City and Explore have no world portal — use **N**. No road time or coin fare. Travel Ration is kitchen energy food (not a travel ticket). The old F11.2 caravan timer is **legacy / inert** for CityLands map hops.
- **Warrior Arena** is an optional combat map (ring dummy + info plaques) — not required, not on the profession ladder, free enter/exit via **N** or the north Exit portal; warrior training buildings cannot be placed on Your Land (CL5.1 / CL11.1–CL11.2).
- On **City**: walk up to **tutorial NPCs** (Farmer / Forester / Carpenter / Miner / Blacksmith / Cook / Weaver / Fisher / Alchemist / Animal Hunter / Monster Hunter / Builder / Animal Breeder / Market Broker / Deed Clerk) for profession and civic lessons; scarce shared stations (plots, trees, ore, workshop, forge, mill, kitchen, **one loom**, **one river fishing spot**, **one alchemy bench**); **Vendor** sells seeds + basic tools and buys mats plus craft sinks (`herbal_tonic` 4c / `cloth_bandage` 2c, CL33.1; `wood_crate` 3c, CL39.1; `bread` 3c, CL47.3; `cooked_fish` 4c, CL51.1); **Market board** for player list/buy (Analytics button: search an item for lowest ask, recent sales, city vendor NPC buyback, and a suggested list price; incl. tonic/bandage/crate/bread/stew, CL33.2 / CL39.1 / CL35.2 / CL51.2); **Notice board** for static tips (travel, scarce stations, warrior optional, land→city, explore vendor prices, explore mats→craft, fisher river + alchemist bench, fish→kitchen, hunt meat→kitchen, animal breeder pen feed/clean) — walk-up only, no live-ops (CL8.3 / CL14.2 / CL16.2 / CL19 / CL20 / CL21.2 / CL25.3 / CL27 / CL28 / CL33.3 / CL34.2). Weave cloth (or sew cloth bandages as a cloth sink) at the city loom or on Your Land; crafts grant **Weaver XP** (CL13.2–CL13.3 / CL29.2). Market board: list, buy, and cancel listings (CL29.1). Catch **Fish** at the city river (camera-near bank) or build docks on Your Land (CL19 / CL23.1 — catch grants **Fisher XP**); sell/list fish or cook at the Kitchen (`cooked_fish` vendor 4c, CL23.2–CL23.3 / CL25.3 / CL51.1). Stone walls close the other three city edges (west / east / camera-far) with grass, dirt, and woods beyond; the river is the remaining bound. Alchemist practices at the shared Alchemy Bench — brew `herbal_tonic` (CL28.2–CL28.3); Hearty Stew stays Cook at the Kitchen (market list CL51.2). Animal / Monster Hunter lessons need Explore trail leather / thicket tusks (CL15.1). Builder lesson: place a station on Your Land (CL15.2). Animal Breeder: feed wheat at an Animal Pen on Your Land (CL27.1–CL27.3) — city has no pens; no livestock combat.
- **Exploration** is a multi-section wilds map (Woodland / Mines / Hunt grounds) with high-contrast floating section labels, distinct floor tints, and a hunt trail belt (CL10.1 / PL4.1–PL4.2) plus prompt prefixes — gather wood/ore and hunt there; homestead has no hunt trail (CL4.1–CL4.2). Sell wood, iron ore, and hunt mats (leather, raw meat, boar tusks) at the Exploration vendor for more coins than City or Your Land; wheat and flour sell for less at Explore; seeds cost more there. (`/telemetry` exposes `vendorPricesByRegion`; CL10.2).
- Market listings cost **2 coins** to post and expire after **10 minutes** (goods returned).
- Player land starts empty (open grass). Craft kits then Place crop plots / trees / ore / workshops / mill / forge / kitchen / alchemy / loom / dock / pen from **P** (unlimited). Press **P** and click a station to move or pick it up. Trees/ore on land grant Forester/Miner XP (city stays scarce). Kit crafts gate mill/forge/loom/alchemy/dock/pen on builder XP; kitchen and workshop kits stay ungated.
- Mill/Forge craft panel can upgrade T1→T2 (60 coins + planks/bars) for −2 energy and +1 stackable craft output.
- Mill/Forge/Kitchen/Workshop/Loom/Alchemy Bench open a **recipe book** (output-icon tiles + selected workbench: ingredients → output, energy, wait).

```bash
npm test
```

## Docs

- [PROJECTBIBLE.md](PROJECTBIBLE.md) — design index  
- [PLANNING.md](PLANNING.md) — constraints + stack  
- [TASKS.md](TASKS.md) — work tracking  

## Monorepo

```
apps/server   Hono API + game rules
apps/web      Next.js + R3F land scene
packages/shared   Item/recipe catalog + DTOs
tests/        Vitest unit tests
docs/         Project Bible
```
