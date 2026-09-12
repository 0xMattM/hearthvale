# Tasks

**Last Updated:** September 11, 2026 (NFT land stock not pickupable)

- Sprint / MVP history: below (P0–P7 done).  
- **Live queue (loop reads this):** **Hardening (RF\*)** — [FullGameBuildPlan_CityLands_Hardening.md](docs/19_development_plan/FullGameBuildPlan_CityLands_Hardening.md) (Gate 0–RF7.4 + RF9.1 done — **RF7.5** line-count in progress).  
- **Polish queue (PL\*) — FROZEN:** [FullGameBuildPlan_CityLands_Polish_41.md](docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_41.md) PL202–PL205 leftovers paused for hardening (do not pick).  
- **CityLands build history (CL1–CL98 done):** archived under CityLands sections below; original plan [FullGameBuildPlan_CityLands.md](docs/19_development_plan/FullGameBuildPlan_CityLands.md).  
- **CL99–CL102 fidelity recycle:** **deferred / frozen** — do not pick (see frozen table under Polish queue).  
- **Product direction (locked):** [PlayerVision_CityLands.md](docs/19_development_plan/PlayerVision_CityLands.md) — city / lands / explore / warrior; free travel; min HUD; scarce city stations; warrior optional.  
- **F16.2–F17.5 deferred / superseded** by CityLands plan (do not resume; infra-only optional later).  
- Legacy plan archive: [FullGameBuildPlan.md](docs/19_development_plan/FullGameBuildPlan.md) (F8–F15 shipped).  
- Loop rules: [docs/19_development_plan/AgentAutonomousLoop.md](docs/19_development_plan/AgentAutonomousLoop.md) — sentinel `AGENT_LOOP_TICK_full_game` = **Hardening RF\*** ticks.

## User request (2026-09-11)

| ID | Task | Status |
| --- | --- | --- |
| INV-LABELS-1 | Inventory slots show item names (no hover-only) | done |
| INV-LOADOUT-1 | Inventory Loadout tab: work tool vs combat weapon/armor/shield | done |
| COMBAT-WEAPON-MESH-1 | Show equipped combat weapon on the avatar when a fight starts | done |
| COMBAT-WEAPON-MESH-2 | Held weapon sits in the fist (upright), not on the ground | done |
| COMBAT-WEAPON-MESH-3 | Club/sword/bow are chunky and readable from the isometric camera | done |
| SEC-1 | Bind REALM market buy/attach to on-chain seller, buyer, gameListingId | done |
| SEC-2 | confirmOnchainLand verifies ownerOf; no client-trusted token | done |
| SEC-3 | Stub wallet connect only in local_dev | done |
| SEC-4 | Integer-cap vendor qty (reject Infinity) | done |
| SEC-5 | Ignore X-Forwarded-For unless GAME_TRUST_PROXY=1 | done |
| SEC-6 | Presence/WS landId bound to server active land | done |
| SEC-7 | authJson 401 logout, GltfOrKit memo clone, applyState tokenRef | done |
| SEC-8 | Auth failure tests (wrong password, taken username) | done |
| CODE-REVIEW-1 | Full code review (server, client, chain, tests) | done |
| FOLIAGE-GHOST-1 | Trees behind the camera ghost (transparency), they do not vanish | done |
| EXPLORE-VENDOR-1 | Remove vendor stall from Explore map (sell at City / homestead) | done |
| CTC-ATTEST-WAIT-1 | Unstick notarized swaps: worker mutex, poll attestation, HUD copy | done |
| CTC-HUD-TABS-1 | B Creditcoin desk uses tabs: Wallet, NFT Lands, History, Contracts | done |
| REALM-MARKET-2 | Indigo stall E opens its own REALM market menu, not the B desk | done |
| CTC-MARKET-ESCROW-1 | List tx left items ESCROWED; attach listing id from ItemListed + reconcile | done |
| HUD-ACTION-CUE-1 | TopBar action cues name the item (chop/mine/craft start/collect); still one ephemeral line | done |
| MARKET-LIST-INV-1 | Market sell picker lists owned stackables with bag qty (not the full catalog dropdown) | done |
| LAND-EDITOR-1 | Remove expand-field from the P land editor (land cannot be expanded from the menu) | done |
| LAND-EDITOR-2 | Click workstations in the P editor to move or pick them up | done |
| LAND-EDITOR-3 | P editor lists placeable stations/decor from inventory | done |
| LAND-EDITOR-4 | NFT land stock (trees/ore/plots) cannot be picked up or farmed for infinite kits | done |
| HACK-1 | Foundry tests for REALM / land / market / notary | done |
| HACK-2 | README + 3-min demo script for BUIDL CTC / DoraHacks | done |
| HACK-3 | Hide /telemetry from anonymous callers | done |
| HACK-4 | Guild bank withdraw owner/officer only | done |
| HACK-RECORD-1 | Record DemoScript.md (3 min) and upload the video to DoraHacks | pending |
| NFT-BIOME-1 | NFT forest/mountain/fertile plots seed choppable trees, ore, or crop plots | done |
| CITY-NPC-LOOK-2 | Players share Hunter; tutors are Blacksmith with unique tunic/sash/cloak | superseded |
| CITY-NPC-LOOK-3 | Distinguish tutors by Blacksmith color wash + nameplate rim (no extra clothes meshes) | superseded |
| CITY-NPC-LOOK-4 | Recolor Blacksmith clothing atlas per profession (skin stays; no extra meshes) | done |

## User request (2026-09-10)

| ID | Task | Status |
| --- | --- | --- |
| ONBOARD-1 | One-shot welcome: talk to the Intendente near City Hall (city spawn) | done |
| ONBOARD-2 | Intendente welcome + lore; first quest is talk to the Farmer | done |
| ONBOARD-3 | Farmer quest: buy seeds, plant, harvest; quest log reveals stations in order | done |
| ONBOARD-4 | Quest board (Q) cannot claim — rewards only at the NPC | done |
| ONBOARD-5 | NPC talk is a line-by-line dialogue, not a dump window | done |
| ONBOARD-6 | Quest board (Q) looks like a city errand board, not a plain list | done |
| ONBOARD-7 | After a claim, the NPC points you to the next tutor | done |
| HUD-1 | Walking HUD is bars + key chips, not a wall of labels | done |
| ONBOARD-8 | City compass matches the camera (screen-up = north) | done |
| STATION-LOOK-1 | Process stations are furniture (workbench, hearth, stove, windmill sails, loom frame, alchemy table), not identical sheds | done |
| STATION-LOOK-2 | Forge is a closed furnace + anvil (not an armchair); kitchen is iron cauldron on a stove, not an orange cylinder | done |
| STATION-LOOK-3 | Mill drops mill.glb silo; in-engine windmill with cloth sails | done |
| STATION-LOOK-4 | Mill is landmark-scale plaster (not tiny stone/bark grain) | done |
| STATION-LOOK-5 | Mill silhouette: tower + cone + sails only (drop gallery/bands/window stack) | done |
| STATION-LOOK-6 | Mill uses flat painted colors (no plaster/cloth grain maps) | done |
| STATION-LOOK-7 | Mill uses City Hall clay/timber/roof maps (not plastic fill, not streaky plaster) | done |
| STATION-LOOK-8 | Mill palette is wheat ivory + chocolate (not City Hall grey-cream) | done |
| STATION-LOOK-9 | Mill is timber (oak tower, walnut cap, pine sails) | superseded |
| STATION-LOOK-10 | Only mill vanes are wood; tower stays City Hall clay | done |
| ORE-LOOK-1 | Ore rocks sit in the grass — drop the circular understone disc | done |
| AVATAR-TEX-1 | Villager FBX textures stay on /models/villager (not wild-animals rewrite) | done |
| VENDOR-LOOK-1 | Vendor stall is a bit larger (kit scale 1.3) | done |
| VENDOR-LOOK-2 | Vendor stall: canvas awning + timber table (drop wood-grain tarp / mud cube / beige pad) | done |
| VENDOR-PLACE-1 | City vendor sits on the west plaza lip (not the mill/ore yard) | done |
| ORE-PLACE-1 | City ore rocks (and miner) sit on west scarce-yard grass, not street stone | done |
| DEED-PLACE-1 | Deed desk stands on inner-court flagstone, off the NE murito / column | done |
| MARKET-LOOK-1 | Market is a peaked canvas stall like vendor, sage/gold cloth + listings | done |
| MARKET-PLACE-1 | City market sits on the east plaza lip (mirrors the vendor) | done |
| REALM-MARKET-1 | REALM market is an indigo stall; E opens Creditcoin REALM listings | superseded |
| REALM-MARKET-PLACE-1 | REALM stall sits in front of the coin Market on the east plaza lip | done |
| PORTAL-PLACE-1 | Drop world portals on City and Explore (travel stays N / Travel panel) | done |
| CITY-HALL-WIN-1 | Bigger City Hall windows; add upper-center sash; drop the two ground windows on the timber posts | done |
| CITY-CIVIC-1 | Remove brick-pack civic houses (and pads/collision) from the city map | done |
| CITY-CIVIC-2 | Hall-kit houses on the inner-wall streets (tinted, smaller, not stations) | done |
| CITY-CIVIC-3 | Margin houses a bit larger (still smaller than City Hall) | done |
| CITY-CIVIC-3 | E/W houses face the plaza; street massing (cottage/shop/loft/shed), not mini-halls | done |
| CITY-PLAZA-FLOOR-1 | Plaza walks are cobble paving (drop wood-grain road stripes) | done |
| CITY-PLAZA-FLOOR-2 | Plaza zones: flagstone field/court, cobble walks, fountain apron | done |
| CITY-GRASS-1 | Civic lawn green + grass seams in the plaza cross | done |
| CITY-FOLIAGE-1 | Dress plaza with unused Sprout / Kenney / torii assets | reverted |
| CITY-PLAZA-CORNER-2 | Restore inner-court muritos; keep lanterns off the columns | done |
| CITY-PLAZA-CORNER-3 | Inner-court muritos form an L at each column | done |
| CITY-PLAZA-DIRT-1 | Dirt caminitos continue the fountain cobble onto the lawn | done |
| WORLD-TIMER-1 | Hide floating world cooldown chips (crops, ore, trees, hunt, docks) | done |
| WILD-ANIMAL-1 | CraftPix Free Wild Animal FBX for Forest Hare + Brush Boar (kit fallback) | done |
| TREE-STUMP-1 | Cooling stump matches living trunk thickness (not a fat barrel) | done |
| WILD-ANIMAL-2 | Procedural hop/trot on CraftPix bones (pack has no animation clips) | done |
| CITY-WALL-1 | Stone perimeter wall on west / east / camera-far city edges (river keeps +Z) | done |
| CITY-WALL-2 | Outside the wall: grass/dirt countryside + trees/bushes (stone stays inside) | done |
| WILD-ANIMAL-3 | Softer gait: plant between hops, smaller bone swing, no rubber stretch | done |
| WILD-ANIMAL-4 | Drop CraftPix hunt meshes; stylized kit hare/boar with hop/trot parts | done |
| COVER-1 | Title cover: Hearthvale name, world intro, styled connect gate (not a bare login) | done |
| HUD-2 | Mail (L), Chat (C), Trade (T) open as styled desks (kicker, key chip, labeled fields) | done |
| HUD-3 | Remaining menus (I N H G J B M P V + walk-up E desks + Q) share the same desk chrome | done |
| CITY-NPC-PLACE-1 | Builder + Animal / Monster Hunter stand by the plaza fountain, not behind City Hall | done |
| CITY-NPC-PLACE-2 | Fountain tutors stand scattered and face different ways (not a lined-up row) | done |
| CITY-NPC-PLACE-3 | Every city tutor faces a distinct idle yaw (station / plaza / conversation) | done |
| CITY-NPC-MARKET-1 | Market Broker NPC teaches player-to-player Market stall | done |
| CITY-NPC-CHAIN-1 | Deed Clerk NPC teaches optional REALM swap and land NFTs | done |
| CITY-NPC-LOOK-1 | City tutors look distinct (Hunter/Blacksmith body, cloak tint, trade gear) | superseded |
| CITY-NPC-LOOK-2 | Players share Hunter; tutors are Blacksmith with unique tunic/sash/cloak | superseded |
| CITY-NPC-LOOK-3 | Distinguish tutors by Blacksmith color wash + nameplate rim (no extra clothes meshes) | superseded |
| CITY-NPC-LOOK-4 | Recolor Blacksmith clothing atlas per profession (skin stays; no extra meshes) | done |

## Demo freeze (2026-09-10) — Saturday delivery / Friday video

Hackathon slice, not the full sandbox. Freeze City Hall (JV-ENV-14), RF7.5+, polish. Creditcoin demo loop is next after combat reads as an RPG.

| ID | Task | Status |
| --- | --- | --- |
| DEMO-COMBAT-1 | Explore is a wild map: no hunt pads, brush props, or Hunt grounds floor | done |
| DEMO-COMBAT-2 | Animals/monsters roam slowly; aggro only at walk-up (no rocket charge on enter) | done |
| DEMO-COMBAT-3 | Spawns sit on the path to woods/mines so you fight to push deeper | superseded |
| EXPLORE-MIX-1 | Mixed semi-open Explore: no wood/mine yards; nodes + dens scattered | done |
| DEMO-COMBAT-4 | Readable fight: player swing on Hunter FBX, nameplates, IN COMBAT HUD, slash arc | done |
| DEMO-CTC-1 | Filmable Creditcoin: MetaMask → coins→REALM tx → land NFT (Attestcoin stretch) | done |
| DEMO-CTC-SWAP-1 | Coin→REALM mints on Creditcoin in the same click or refunds coins | done |
| DEMO-CTC-CHAIN-1 | Land approve used wrong chainId hex 0x18e6f; MetaMask RPC invalid chain id | done |
| DEMO-CTC-LAND-1 | Persist NFT in B panel (SWR + local ledger); Work this land as extra homestead | done |
| DEMO-CTC-LAND-2 | Work this land hidden: on-chain merge dropped landId; always show + enter-land | done |
| DEMO-CTC-LAND-3 | NFT small homestead is larger than the free common land (walk/fence/place) | done |
| DEMO-VIDEO-1 | 3-min script + README/deck for DoraHacks | done |

## User request (2026-09-10)

| ID | Task | Status |
| --- | --- | --- |
| CITY-FOUNTAIN-1 | Plaza fountain reads as stone basin + water (drop glow / plaster drum) | done |
| CITY-FOUNTAIN-2 | Center nozzle + ripples expand from the pool (no sideways UV slide) | done |

## User request (2026-09-09)

| ID | Task | Status |
| --- | --- | --- |
| JV-ENV-1 | Wire YumeForge Free Japan Village GLTFs into city + homestead atmosphere (trees, fences, hall, torii, lanterns, yard clutter) with kit fallback | done |
| JV-ENV-2 | City Hall stays civic kit (House_4x5 too Japanese); keep village props | done |
| JV-ENV-3 | Broken Vector brick houses for City Hall + civic blocks; Japan Village meshes on crop plots | done |
| JV-ENV-5 | Assemble City Hall from brick-pack palette textures (kit), drop Collada townhouse | done |
| JV-ENV-6 | Try niko-3d-models village FBX for City Hall + civic houses (kit fallback) | done |
| JV-ENV-7 | Swap City Hall + civic houses to CrisDias 3D Farm Asset Pack barns (extracted GLBs) | done |
| JV-ENV-8 | Drop farm barns from City; restore brick Collada hall at plaza-tall scale | done |
| JV-ENV-9 | City Hall is a plaza-sized brick kit (gable + cupola); Collada stays house-scale on civic blocks | done |
| JV-ENV-10 | City Hall: chunky brick, stone/plaster split, portico door, fix white gable UVs | done |
| JV-ENV-11 | City Hall: drop dark ground storey / quoins / cupola; one plaster volume | done |
| JV-ENV-12 | Drop box-kit City Hall; use brick-pack Church.dae at plaza scale | done |
| JV-ENV-13 | Drop church (wrong style); City Hall is House-2-2 at house scale | done |
| JV-ENV-14 | City Hall concept art (farmer-style, AI) for image-to-3D; GLB not wired yet | done |
| JV-ENV-15 | Assemble City Hall from concept palette surfaces (shutters, clock, timber) | done |
| JV-ENV-16 | City Hall: drop honey-gold frames; wood recessed windows + cooler plaster | done |
| JV-ENV-17 | Remove brick-pack civic houses (and pads/collision) from the city map | done |

Leftovers: brick pack church/lamppost/river; Japan stalls/tools; farm-pack trees/fences/crops unused. Wheat/cotton stay kit after sprout (no matching mesh).

## User request (2026-09-04)

| ID | Task | Status |
| --- | --- | --- |
| HP-REGEN-1 | Passive HP regen over time (mirrors energy; paused in live fights) | done |
| FOOD-HEAL-1 | Eating food / bandage / tonic also restores HP | done |
| MKT-SEARCH-1 | Open listings search on the market board (item name, id, seller) | done |
| COMBAT-PRES-1 | Presentable hunt: server-synced foe, readable creatures, encounter HUD, camera frame | done |
| COMBAT-WILD-1 | Hunt animals as loose wildlife in a spawn patch (no hunt-station plot) | done |
| MKT-ANALYTICS-1 | Market Analytics button: search item for board price, recent sales, vendor NPC, suggested list | done |
| CITY-RIVER-2 | City river surface flows (traveling waves + looping current streaks) | done |
| CITY-RIVER-3 | Fix river look: no overlay cards, UV current, clean bank seam | done |
| CITY-RIVER-4 | Bank dirt tiles as soil (not wood); water has caustics + vertex waves | done |
| CTC-SWAP-TYPE-1 | Type `apiCreditcoinSwap` `swap` field so `next build` compiles | done |
| TREE-READY-1 | Chop-ready wood nodes look like leafy trees (stump only while cooling) | done |

## User request (2026-09-03)

| ID | Task | Status |
| --- | --- | --- |
| CTC-HUD-1 | CreditcoinPanel visual redesign (sections, balance chips, status pills) + TopBar REALM chip | done |
| CTC-SWAP-UX-1 | Clarify coins→REALM swap (tCTC is gas only); swap card under wallet balances | done |
| CTC-MM-TOKEN-1 | Add REALM to MetaMask (wallet_watchAsset) + switch network + copy contract addr | done |
| CTC-SEPOLIA-1 | Deploy script for CoinBurnNotary on Sepolia (`npm run chain:deploy:sepolia`) | done |
| CTC-ASC-1 | Deploy script for EvmV1Decoder + RealmMinterASC on Creditcoin (`npm run chain:deploy:asc`) | done |
| CTC-EXPLORER-1 | Blockscout explorer links in CreditcoinPanel (wallet, swaps, lands, contracts) | done |
| CTC-TRANSFER-1 | REALM P2P transfer via MetaMask in CreditcoinPanel | done |
| CTC-LAND-BONUS-1 | NFT land owners get −15% crop grow time (cosmetic, never combat) | done |
| CTC-TCTC-1 | Better tCTC balance display + Discord faucet warning when 0 | done |

## User request (2026-09-02)

| ID | Task | Status |
| --- | --- | --- |
| HUD-LAYER-1 | World nameplates (Vendor, Tutor, …) stay under HUD menus | done |
| ISO-MOVE-1 | Camera-relative WASD so Up/Down match screen, not world diagonal | done |
| BGM-MUSIC-2 | Per-map BGM: Cozy Game Loop (land), Peaceful Affection (city), Calm Optimism (explore + arena) | done |
| CITY-RIVER-1 | City +Z river + riverside fishing spot (replace grass pier) | done |
| CTC-DEPLOY-1 | Compile + deploy RealmToken, LandNFT, ItemMarketplace on Creditcoin Testnet | done |
| CTC-DEPLOY-2 | Wire addresses, dotenv, on-chain REALM mint, MetaMask land/market txs | done |

## User request (2026-09-01)

| ID | Task | Status |
| --- | --- | --- |
| CROPS-ORES-1 | Extra crops (corn, potato, cotton, herb) with distinct grow times and vendor prices | done |
| CROPS-ORES-2 | Extra ores (copper, gold) on Explore/City rocks + smelt/craft sinks | done |
| CTC-HACK-1 | Creditcoin Testnet wallet link (MetaMask / EIP-1193) | done |
| CTC-HACK-2 | REALM token, NFT lands, REALM item market | done |
| CTC-HACK-3 | Coin→REALM via Attestcoin Protocol (Sepolia notary + ASC + USC SDK worker) | done |
| HUD-CRAFT-1 | Craft recipe book: icon tiles + selected workbench (ingredients → output), not a text list | done |
| HUD-MENUS-1 | Shared panel chrome + vendor/market/build rows with item icons / cards | done |
| START-WEB-1 | `npm start` builds `@game/web` so `next start` has a production `.next` | done |

## User request (2026-08-28)

| ID | Task | Status |
| --- | --- | --- |
| COMBAT-LIVE-1 | Explore + Arena click combat (LMB attack / RMB block), gear slots, bows | done |
| COMBAT-LIVE-2 | Realtime hunt: animals wander/chase/bite; LMB is a spatial swing | done |
| COMBAT-LIVE-3 | Hunt animals roam the grass (not the pad), auto-aggro, server heartbeat bites | done |
| COMBAT-LIVE-4 | RPG encounter: fight auto-starts in hunt grounds; animal attacks without E | done |
| BGM-MUSIC-1 | Loop Pastoral Morning on city/land/warrior; The Quiet Hunt on explore/hunt | done |
| INTERACT-LAG-1 | Instant E on stations/gather: live target, SFX before state apply, no GameApp 500ms scene loop | done |
| LAND-GATE-1 | Lower-fence yard gate (tranquera) opens Travel; compact Travel tiles | done |

## User request (2026-08-27)

| ID | Task | Status |
| --- | --- | --- |
| LAND-YARD-1 | Open grass player land: no shed, wooden path, build board, or expand pad; land editor via **P** | done |

---

## Polish queue (PL*) — FROZEN (do not pick)

> **Frozen 2026-08-03** for Hardening RF\* (Gate 0). PL1–PL201.2 done; PL202.1–PL205.2 leftovers paused — do **not** auto-pick. Unfreeze only by human request. Acceptance archive: `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_41.md`.

| ID | Task | Status |
| --- | --- | --- |
| PL1.1 | City scarce-yard + wayfinding labels | done |
| PL1.2 | Tutor silhouette cloak colors for all professions | done |
| PL1.3 | Market / vendor / notice service visuals | done |
| PL2.1 | Interact prompt action-first hierarchy | done |
| PL2.2 | TopBar declutter (day phase / nearby) | done |
| PL2.3 | Single contextual panel focus | done |
| PL3.1 | Empty-land build board beacon | done |
| PL3.2 | BuildPanel grouped by profession | done |
| PL4.1 | Explore section label contrast | done |
| PL4.2 | Hunt vs gather floor separation | done |
| PL5.1 | Portal free-travel prompt clarity | done |
| PL5.2 | TravelPanel you-are-here polish | done |
| PL6.1 | SFX for gather / build / travel | done |
| PL6.2 | Brief success cue on core actions | done |
| PL7.1 | Per-map soft BGM tint | done |
| PL7.2 | Explore ambient tint vs land | done |
| PL8.1 | Busy station world cue (city scarce) | done |
| PL8.2 | Busy interact prompt copy | done |
| PL9.1 | Low-energy TopBar cue | done |
| PL9.2 | Inventory open accent | done |
| PL10.1 | Vendor buy/sell SFX | done |
| PL10.2 | Market list/buy brief success cue | done |
| PL11.1 | Arena floor / plaque contrast | done |
| PL11.2 | Arena enter travel cue | done |
| PL12.1 | Crop ready world pulse | done |
| PL12.2 | Gather node depleted cue | done |
| PL13.1 | First free-travel tip | done |
| PL13.2 | Tutor claim brief cue | done |
| PL14.1 | Current-map chip (min HUD) | done |
| PL14.2 | Portal mesh tint by destination | done |
| PL15.1 | Visit arrive confirm | done |
| PL15.2 | Nearby peer soft ping | done |
| PL16.1 | Soft refuse SFX | done |
| PL16.2 | Decor place success cue | done |
| PL17.1 | Unread mail / notice accent | done |
| PL17.2 | Mail claim success cue | done |
| PL18.1 | Trade invite receive cue | done |
| PL18.2 | Trade accept success cue | done |
| PL19.1 | Vendor panel open accent | done |
| PL19.2 | Market panel open accent | done |
| PL20.1 | Eat food success cue | done |
| PL20.2 | Equip tool brief cue | done |
| PL20.3 | Expand field success cue | done |
| PL21.1 | Low tool durability accent | done |
| PL21.2 | Broken tool refuse clarity | done |
| PL22.1 | Built-yard soft atmosphere | done |
| PL22.2 | Housing decor world label polish | done |
| PL23.1 | Process station world labels | done |
| PL23.2 | Gather station name cue when ready | done |
| PL24.1 | Build panel open accent | done |
| PL24.2 | Craft panel open accent | done |
| PL24.3 | Travel panel open accent | done |
| PL25.1 | Repair tool success cue | done |
| PL25.2 | First station place homestead cue | done |
| PL26.1 | Expand pad afford tint | done |
| PL26.2 | Expand refuse clarity | done |
| PL27.1 | Visit leave brief cue | done |
| PL27.2 | Chat receive soft ping | done |
| PL28.1 | Trade offer sent cue | done |
| PL28.2 | Mail send / cancel brief cues | done |
| PL28.3 | Subsequent station place Built cue | done |
| PL29.1 | Trade panel open accent | done |
| PL29.2 | Quest panel open accent | done |
| PL29.3 | Quest claim success cue | done |
| PL30.1 | Fishing dock ready world label | done |
| PL30.2 | Animal pen ready world label | done |
| PL30.3 | Tutor claimable world accent | done |
| PL31.1 | Visit interact sticky declutter | done |
| PL31.2 | Guild claim / soft-war brief cues | done |
| PL32.1 | Vendor row afford tint | done |
| PL32.2 | Market list afford clarity | done |
| PL33.1 | Tool broke brief cue | done |
| PL33.2 | Hunt encounter brief cues | done |
| PL33.3 | Deed / wallet surface brief cues | done |
| PL34.1 | Mail panel open accent | done |
| PL34.2 | Decor panel open accent | done |
| PL34.3 | Notice panel open accent | done |
| PL35.1 | Craft recipe afford row tint | done |
| PL35.2 | Build place afford clarity | done |
| PL36.1 | City civic soft atmosphere | done |
| PL36.2 | Explore wilds soft atmosphere | done |
| PL37.1 | Portal world label destination | done |
| PL37.2 | Mute toggle brief confirm | done |
| PL38.1 | Chat panel open accent | done |
| PL38.2 | Settings panel open accent | done |
| PL39.1 | Craft upgrade afford clarity | done |
| PL39.2 | Decor place afford clarity | done |
| PL40.1 | Crop ready world name cue | done |
| PL40.2 | Travel arrive map-chip pulse | done |
| PL40.3 | Presence peer soft silhouette | done |
| PL41.1 | Low energy threshold brief cue | done |
| PL41.2 | Warrior optional-path soft haze | done |
| PL42.1 | Busy scarce refuse ephemeral | done |
| PL42.2 | First portal walk-up tip once | done |
| PL43.1 | Gather success ephemeral | done |
| PL43.2 | Vendor sell success cue | done |
| PL43.3 | Vendor buy success cue | done |
| PL44.1 | Energy refuse ephemeral | done |
| PL44.2 | Travel already-here ephemeral | done |
| PL45.1 | First Explore walk-up tip once | done |
| PL45.2 | Arena optional walk-up tip once | done |
| PL46.1 | Guild panel open accent | done |
| PL46.2 | Achievements panel open accent | done |
| PL47.1 | Character level-up ephemeral | done |
| PL47.2 | Achievement unlock brief cue | done |
| PL48.1 | Craft station upgrade success cue | done |
| PL48.2 | Guild bank deposit brief cue | done |
| PL48.3 | Guild bank withdraw brief cue | done |
| PL49.1 | Character title change ephemeral | done |
| PL49.2 | Extra decor pad unlock tip once | done |
| PL50.1 | Guild create / join brief cue | done |
| PL50.2 | Guild leave brief cue | done |
| PL51.1 | BGM soft transition on map change | done |
| PL51.2 | Visit land soft atmosphere tint | done |
| PL52.1 | First empty-land build-board tip once | done |
| PL52.2 | Arena stub panel open accent | done |
| PL53.1 | First visit land tip once | done |
| PL53.2 | First warrior map presence tip once | done |
| PL54.1 | Too-far refuse ephemeral | done |
| PL54.2 | Coins refuse ephemeral | done |
| PL54.3 | Materials refuse ephemeral | done |
| PL55.1 | Tutorial NPC panel open accent | done |
| PL55.2 | Deed panel open accent | done |
| PL56.1 | Trade offer create brief cue | done |
| PL56.2 | Market cancel brief cue | done |
| PL56.3 | Guild invite refresh brief cue | done |
| PL57.1 | First city hub ephemeral tip once | done |
| PL57.2 | Day-phase change soft cue | done |
| PL58.1 | Hammer refuse ephemeral | done |
| PL58.2 | Crop-not-ready refuse ephemeral | done |
| PL58.3 | Plot-occupied refuse ephemeral | done |
| PL59.1 | First market walk-up tip once | done |
| PL59.2 | First vendor walk-up tip once | done |
| PL60.1 | Crop ready soft world cue | done |
| PL60.2 | Ore cooldown soft refuse ephemeral | done |
| PL61.1 | Tool durability low threshold cue | done |
| PL62.1 | Trade cancel brief cue | done |
| PL62.2 | Chat send brief cue | done |
| PL63.1 | Wood stump cooldown soft refuse ephemeral | done |
| PL63.2 | Fishing dock cooldown soft refuse ephemeral | done |
| PL63.3 | Animal pen cooldown soft refuse ephemeral | done |
| PL63.4 | Hunt cooldown soft refuse ephemeral | done |
| PL64.1 | Health low threshold cue | done |
| PL64.2 | Missing seed refuse ephemeral | done |
| PL65.1 | Wood stump ready soft cue | done |
| PL65.2 | Fishing dock ready soft cue | done |
| PL66.1 | First fishing dock walk-up tip once | done |
| PL66.2 | First animal pen walk-up tip once | done |
| PL67.1 | Low health TopBar accent | done |
| PL68.1 | First tree stump walk-up tip once | done |
| PL68.2 | First ore node walk-up tip once | done |
| PL68.3 | First crop plot walk-up tip once | done |
| PL68.4 | First hunt trail walk-up tip once | done |
| PL69.1 | Ore node ready soft cue | done |
| PL69.2 | Animal pen ready soft cue | done |
| PL70.1 | First kitchen walk-up tip once | done |
| PL70.2 | First notice board walk-up tip once | done |
| PL71.1 | No-bread energy refuse ephemeral | done |
| PL71.2 | Build-board-missing refuse ephemeral | done |
| PL72.1 | First expand-pad walk-up tip once | done |
| PL72.2 | Tutor claim-ready soft TopBar cue | done |
| PL73.1 | No-food eat refuse ephemeral | done |
| PL73.2 | Build-cell-occupied refuse ephemeral | done |
| PL73.3 | Tool-already-repaired refuse ephemeral | done |
| PL74.1 | First mill walk-up tip once | done |
| PL74.2 | First workshop walk-up tip once | done |
| PL74.3 | First forge walk-up tip once | done |
| PL75.1 | First decor-pad walk-up tip once | done |
| PL75.2 | Decor-already-placed refuse ephemeral | done |
| PL76.1 | Quest-not-ready refuse ephemeral | done |
| PL76.2 | First tutor NPC walk-up tip once | done |
| PL77.1 | First loom walk-up tip once | done |
| PL77.2 | First alchemy-bench walk-up tip once | done |
| PL78.1 | Quest-locked refuse ephemeral | done |
| PL78.2 | Quest-already-claimed refuse ephemeral | done |
| PL79.1 | Vendor-won't-buy refuse ephemeral | done |
| PL79.2 | Vendor-won't-sell refuse ephemeral | done |
| PL80.1 | First claim-node walk-up tip once | done |
| PL80.2 | Claim-need-guild refuse ephemeral | done |
| PL81.1 | Claim-held-by-other refuse ephemeral | done |
| PL81.2 | Claim-nothing-stored refuse ephemeral | done |
| PL82.1 | Claim-war-already-open refuse ephemeral | done |
| PL82.2 | Claim-war-need-mats refuse ephemeral | done |
| PL82.3 | Claim-war-not-open refuse ephemeral | done |
| PL83.1 | Market-own-listing refuse ephemeral | done |
| PL83.2 | Market-expired refuse ephemeral | done |
| PL84.1 | Mail-self refuse ephemeral | done |
| PL84.2 | Mail-inbox-full refuse ephemeral | done |
| PL85.1 | Travel-in-progress refuse ephemeral | done |
| PL86.1 | Trade-self refuse ephemeral | done |
| PL86.2 | Trade-empty refuse ephemeral | done |
| PL86.3 | Trade-player-missing refuse ephemeral | done |
| PL87.1 | Guild-already-in refuse ephemeral | done |
| PL87.2 | Guild-not-in refuse ephemeral | done |
| PL87.3 | Guild-exists refuse ephemeral | done |
| PL88.1 | Claim-war-need-guild refuse ephemeral | done |
| PL88.2 | Build-player-land-only refuse ephemeral | done |
| PL89.1 | Already-upgraded refuse ephemeral | done |
| PL89.2 | Cannot-upgrade refuse ephemeral | done |
| PL90.1 | Travel-need-coins refuse ephemeral | done |
| PL91.1 | Trade-not-found refuse ephemeral | done |
| PL91.2 | Trade-not-yours refuse ephemeral | done |
| PL91.3 | Trade-only-recipient refuse ephemeral | done |
| PL92.1 | Trade-broke refuse ephemeral | done |
| PL92.2 | Trade-missing-items refuse ephemeral | done |
| PL93.1 | Mail-empty refuse ephemeral | done |
| PL93.2 | Mail-player-missing refuse ephemeral | done |
| PL93.3 | Mail-already-claimed refuse ephemeral | done |
| PL94.1 | Market-not-found refuse ephemeral | done |
| PL94.2 | Market-not-yours refuse ephemeral | done |
| PL95.1 | Guild-invite-invalid refuse ephemeral | done |
| PL95.2 | Guild-name-invalid refuse ephemeral | done |
| PL96.1 | Mail-not-found refuse ephemeral | done |
| PL96.2 | Mail-only-recipient refuse ephemeral | done |
| PL96.3 | Mail-only-sender refuse ephemeral | done |
| PL97.1 | Market-need-fee refuse ephemeral | done |
| PL97.2 | Market-not-stackable refuse ephemeral | done |
| PL98.1 | Guild-bank-full refuse ephemeral | done |
| PL98.2 | Guild-bank-empty refuse ephemeral | done |
| PL98.3 | Guild-rank-forbidden refuse ephemeral | done |
| PL99.1 | Hunt-explore-only refuse ephemeral | done |
| PL99.2 | Warrior-homestead-forbidden refuse ephemeral | done |
| PL100.1 | Repair-need-mats refuse ephemeral | done |
| PL100.2 | Not-a-tool refuse ephemeral | done |
| PL101.1 | Gather-node-missing refuse ephemeral | done |
| PL101.2 | Plot-missing refuse ephemeral | done |
| PL101.3 | Hunt-or-claim-missing refuse ephemeral | done |
| PL102.1 | Guild-bank-not-stackable refuse ephemeral | done |
| PL102.2 | Guild-bank-unknown-item refuse ephemeral | done |
| PL102.3 | Guild-bank-bad-qty refuse ephemeral | done |
| PL103.1 | Mail-not-stackable refuse ephemeral | done |
| PL103.2 | Market-invalid refuse ephemeral | done |
| PL103.3 | Invalid-qty refuse ephemeral | done |
| PL104.1 | Unknown-recipe refuse ephemeral | done |
| PL104.2 | Needs-station refuse ephemeral | done |
| PL104.3 | Needs-xp refuse ephemeral | done |
| PL105.1 | Decor-pad-missing refuse ephemeral | done |
| PL105.2 | Decor-starter-only refuse ephemeral | done |
| PL105.3 | No-expand-slots refuse ephemeral | done |
| PL106.1 | Unknown-decor refuse ephemeral | done |
| PL106.2 | Decor-need-coins refuse ephemeral | done |
| PL107.1 | Unknown-seed refuse ephemeral | done |
| PL107.2 | Crop-missing refuse ephemeral | done |
| PL108.1 | Item-missing refuse ephemeral | done |
| PL108.2 | Unknown-station refuse ephemeral | done |
| PL109.1 | Guild-not-found refuse ephemeral | done |
| PL109.2 | Guild-target-missing refuse ephemeral | done |
| PL109.3 | Guild-rank-invalid refuse ephemeral | done |
| PL110.1 | Quest-unknown refuse ephemeral | done |
| PL110.2 | Missing-item refuse ephemeral | done |
| PL111.1 | Guild-rank-change success ephemeral | done |
| PL111.2 | Guild-bank deposit/withdraw cue verify | done |
| PL112.1 | Deed-missing / not-yours refuse ephemeral | done |
| PL112.2 | Deed-mint / list-state refuse ephemeral | done |
| PL112.3 | Deed-price / owned / forest refuse ephemeral | done |
| PL113.1 | Wallet-already-linked refuse ephemeral | done |
| PL113.2 | Wallet-not-linked refuse ephemeral | done |
| PL114.1 | Empty-homestead meadow contrast | done |
| PL114.2 | Visit-home return cue clarity | done |
| PL115.1 | City scarce-busy peer pulse | done |
| PL115.2 | Travel-arrive destination whisper | done |
| PL116.1 | Explore hunt-trail wayfinding contrast | done |
| PL116.2 | Explore premium-node soft glow | done |
| PL117.1 | Market / vendor service-pad warmth | done |
| PL117.2 | Notice-board unread soft flicker | done |
| PL118.1 | Lived-homestead quiet chimney cue | done |
| PL118.2 | Fishing-dock ready water shimmer | done |
| PL119.1 | City scarce Free settle flash | done |
| PL119.2 | Visit host nameplate reinforce | done |
| PL120.1 | Map BGM bed identity | done |
| PL120.2 | Portal highlight Free pulse | done |
| PL121.1 | Crop growing soft sway cue | done |
| PL121.2 | Process-station working emissive | done |
| PL122.1 | Local avatar map-tint micro | done |
| PL122.2 | Day-phase soft world haze | done |
| PL123.1 | Expand-pad short afford pulse | done |
| PL123.2 | Trade preferred-partner nameplate | done |
| PL124.1 | Energy-low soft world vignette | done |
| PL124.2 | Eat success soft reinforce | done |
| PL125.1 | City plaza soft landmark cue | done |
| PL125.2 | Mute-toggle soft confirm | done |
| PL126.1 | Health-low soft world vignette | done |
| PL126.2 | Coins-gain soft reinforce | done |
| PL127.1 | Animal-pen ready soft pad pulse | done |
| PL127.2 | Crop plant success soft reinforce | done |
| PL128.1 | Quest-ready soft row accent | done |
| PL128.2 | Inventory pickup soft slot flash | done |
| PL129.1 | Tutor-lane soft landmark strip | done |
| PL129.2 | Arena plaque soft walk-up pulse | done |
| PL130.1 | Day-night toggle soft confirm | done |
| PL130.2 | Tips-toggle soft confirm | done |
| PL131.1 | Craft-complete soft bench flash | done |
| PL131.2 | Gather-success soft pad flash | done |
| PL132.1 | Fish-catch soft splash reinforce | done |
| PL132.2 | Tool-low soft world leftover | done |
| PL133.1 | Mail-pending closed glance | done |
| PL133.2 | TravelPanel destination map-tint | done |
| PL134.1 | Build-place soft spawn flash | done |
| PL134.2 | Peer range-exit soft fade | done |
| PL135.1 | Scarce Free sticky world label | done |
| PL135.2 | Level-up soft world reinforce | done |
| PL136.1 | Achievement unlock soft world reinforce | done |
| PL136.2 | Title-change soft world reinforce | done |
| PL137.1 | Station-upgrade soft pad flash | done |
| PL137.2 | Expand-field soft pad flash | done |
| PL138.1 | Market-list soft world reinforce | done |
| PL138.2 | Quest-claim soft world reinforce | done |
| PL139.1 | Visit home-return soft world reinforce | done |
| PL139.2 | Chat-send soft confirm leftover | done |
| PL140.1 | Explore section soft landmark cue | done |
| PL140.2 | Guild panel soft open accent | done |
| PL141.1 | Explore mines soft landmark cue | done |
| PL141.2 | Explore vendor soft landmark cue | done |
| PL142.1 | Homestead lived-path soft cue | done |
| PL142.2 | Crop-ready soft world leftover | done |
| PL143.1 | Trade-accept soft world reinforce | done |
| PL143.2 | Guild-bank deposit soft confirm leftover | done |
| PL144.1 | Portal free-travel soft pulse leftover | done |
| PL144.2 | Travel panel open soft map accent | done |
| PL145.1 | Claim-node held soft cue leftover | done |
| PL145.2 | Arena enter soft world reinforce | done |
| PL146.1 | Claim soft-war contest world cue | done |
| PL146.2 | Soft-war deliver soft world reinforce | done |
| PL147.1 | Arena leave soft world reinforce | done |
| PL147.2 | Arena exit-portal soft pulse leftover | done |
| PL148.1 | Guild-bank withdraw soft confirm leftover | done |
| PL148.2 | Invite-accept soft world reinforce | done |
| PL149.1 | Mail-send soft world reinforce | done |
| PL149.2 | Decor-place soft world reinforce | done |
| PL150.1 | Tool-repair soft world reinforce | done |
| PL150.2 | City market board soft landmark cue | done |
| PL151.1 | City vendor soft landmark cue | done |
| PL151.2 | Crop-harvest soft world reinforce | done |
| PL152.1 | Equip soft world reinforce | done |
| PL152.2 | Mail-claim soft world reinforce | done |
| PL153.1 | Vendor-buy soft world reinforce | done |
| PL153.2 | Notice-board soft landmark cue | done |
| PL154.1 | Empty-homestead path soft cue leftover | done |
| PL154.2 | Unequip soft world reinforce | done |
| PL155.1 | Arena board soft landmark cue leftover | done |
| PL155.2 | Market-buy soft world reinforce | done |
| PL156.1 | Vendor-sell soft world reinforce leftover | done |
| PL156.2 | Market-cancel soft world reinforce | done |
| PL157.1 | Trade-cancel soft world reinforce | done |
| PL157.2 | Mail-cancel soft world reinforce | done |
| PL158.1 | Guild-create soft world reinforce | done |
| PL158.2 | Guild-leave soft world reinforce | done |
| PL159.1 | Hunt-win soft world reinforce leftover | done |
| PL159.2 | Craft-complete soft world reinforce leftover | done |
| PL160.1 | Empty-land build-board soft landmark cue leftover | done |
| PL160.2 | Day-phase soft world reinforce leftover | done |
| PL161.1 | Gather-success soft world reinforce leftover | done |
| PL161.2 | Fish-catch soft world reinforce leftover | done |
| PL162.1 | Station-upgrade soft world reinforce leftover | done |
| PL162.2 | Expand-field soft world reinforce leftover | done |
| PL163.1 | Expand-pad soft landmark cue leftover | done |
| PL163.2 | Claim-empty soft landmark cue leftover | done |
| PL164.1 | Travel-arrive soft world reinforce leftover | done |
| PL164.2 | Day-night-enable soft world reinforce leftover | done |
| PL165.1 | Deed-desk soft landmark cue leftover | done |
| PL165.2 | Scarce-Free-settle soft world reinforce leftover | done |
| PL166.1 | Scarce-busy soft world reinforce leftover | done |
| PL166.2 | Deed-claim soft world reinforce leftover | done |
| PL167.1 | Deed-mint soft world reinforce leftover | done |
| PL167.2 | Wallet-link soft world reinforce leftover | done |
| PL168.1 | Wallet-disconnect soft world reinforce leftover | done |
| PL168.2 | Portal Free soft landmark cue leftover | done |
| PL169.1 | City fishing-dock soft landmark cue leftover | done |
| PL169.2 | City loom soft landmark cue leftover | done |
| PL170.1 | City alchemy-bench soft landmark cue leftover | done |
| PL170.2 | City animal-pen soft landmark cue leftover | done |
| PL171.1 | City crop-plot soft landmark cue leftover | done |
| PL171.2 | City tree-stump soft landmark cue leftover | done |
| PL172.1 | City ore-node soft landmark cue leftover | done |
| PL172.2 | City workshop soft landmark cue leftover | done |
| PL173.1 | City forge soft landmark cue leftover | done |
| PL173.2 | City mill soft landmark cue leftover | done |
| PL174.1 | City kitchen soft landmark cue leftover | done |
| PL174.2 | Explore trail soft landmark cue leftover | done |
| PL175.1 | Explore thicket soft landmark cue leftover | done |
| PL175.2 | Visit land soft atmosphere leftover | done |
| PL176.1 | Housing decor soft landmark cue leftover | done |
| PL176.2 | Homestead fence soft landmark cue leftover | done |
| PL177.1 | Warrior arena soft atmosphere leftover | done |
| PL177.2 | City scarce-yard soft atmosphere leftover | done |
| PL178.1 | Explore canopy soft atmosphere leftover | done |
| PL178.2 | Homestead empty meadow soft landmark leftover | done |
| PL179.1 | Hunt-lose soft world reinforce leftover | done |
| PL179.2 | Soft-refuse busy soft world reinforce leftover | done |
| PL180.1 | Mute soft world reinforce leftover | done |
| PL180.2 | Visit-leave soft world reinforce leftover | done |
| PL181.1 | Lived homestead soft atmosphere leftover | done |
| PL181.2 | Homestead shed soft landmark leftover | done |
| PL182.1 | City plaza soft atmosphere leftover | done |
| PL182.2 | City civic-pad soft landmark leftover | done |
| PL183.1 | Claim-node soft landmark leftover | done |
| PL183.2 | Soft-war contest soft atmosphere leftover | done |
| PL184.1 | Visit-arrive soft world reinforce leftover | done |
| PL184.2 | Nearby-peer soft world reinforce leftover | done |
| PL185.1 | City tutor-lane soft atmosphere leftover | done |
| PL185.2 | Map-chip idle soft glance leftover | done |
| PL186.1 | Portal soft atmosphere leftover | done |
| PL186.2 | City market-board soft atmosphere leftover | done |
| PL187.1 | City vendor soft atmosphere leftover | done |
| PL187.2 | City notice soft atmosphere leftover | done |
| PL188.1 | Interact-prompt idle soft glance leftover | done |
| PL188.2 | Energy-meter idle soft glance leftover | done |
| PL189.1 | Quest-pending closed glance leftover | done |
| PL189.2 | Guild-invite closed glance leftover | done |
| PL190.1 | Crop-growing soft atmosphere leftover | done |
| PL190.2 | Fishing-dock soft atmosphere leftover | done |
| PL191.1 | Animal-pen soft atmosphere leftover | done |
| PL191.2 | Tree-stump soft atmosphere leftover | done |
| PL192.1 | Ore-node soft atmosphere leftover | done |
| PL192.2 | Mill soft atmosphere leftover | done |
| PL193.1 | Forge soft atmosphere leftover | done |
| PL193.2 | Kitchen soft atmosphere leftover | done |
| PL194.1 | Loom soft atmosphere leftover | done |
| PL194.2 | Alchemy-bench soft atmosphere leftover | done |
| PL195.1 | Trade-pending closed glance leftover | done |
| PL195.2 | Achievements-pending closed glance leftover | done |
| PL196.1 | Workshop soft atmosphere leftover | done |
| PL196.2 | Expand-pad soft atmosphere leftover | done |
| PL197.1 | Chat-pending closed glance leftover | done |
| PL197.2 | Notice-unread closed glance leftover | done |
| PL198.1 | Health-meter idle soft glance leftover | done |
| PL198.2 | Inventory-pickup idle soft glance leftover | done |
| PL199.1 | Deed-desk soft atmosphere leftover | done |
| PL199.2 | Soft-war deliver soft glance leftover | done |
| PL200.1 | Build-board soft atmosphere leftover | done |
| PL200.2 | Empty-homestead path soft atmosphere leftover | done |
| PL201.1 | Housing-decor soft atmosphere leftover | done |
| PL201.2 | Homestead-fence soft atmosphere leftover | done |
| PL202.1 | Homestead-shed soft atmosphere leftover | frozen |
| PL202.2 | Lived-homestead path soft atmosphere leftover | frozen |
| PL203.1 | Crop-ready soft atmosphere leftover | frozen |
| PL203.2 | Claim-held soft atmosphere leftover | frozen |
| PL204.1 | Tool-durability idle soft glance leftover | frozen |
| PL204.2 | Coins idle soft glance leftover | frozen |
| PL205.1 | Arena-board soft atmosphere leftover | frozen |
| PL205.2 | Expand-afford closed glance leftover | frozen |

### Hardening queue (RF*) — LIVE

> **This is the active full-game queue** the autonomous loop picks from. Acceptance: [FullGameBuildPlan_CityLands_Hardening.md](docs/19_development_plan/FullGameBuildPlan_CityLands_Hardening.md). Lowest pending ID first. Prefer behavior-preserving changes + tests. Skip `deferred` (RF3.3) unless asked. NFT / dungeons / caravans stay in FutureIdeasBacklog. Polish 41 PL202–PL205 frozen — do not pick.

| ID | Task | Status |
| --- | --- | --- |
| G0.1 | Finish PL202–PL205 or freeze Polish 41 | done |
| G0.2 | Activate RF* as live queue + loop sentinel | done |
| RF1.1 | Session TTL / expiry check | done |
| RF1.2 | Logout / revoke session + client | done |
| RF1.3 | Login / register rate limit | done |
| RF1.4 | Password floor + bcrypt cost on new hashes | done |
| RF1.5 | Chat / WS flood guard | done |
| RF2.1 | withTransaction helper (SQLite) | done |
| RF2.2 | Market buy/list/cancel atomic | done |
| RF2.3 | Trade accept atomic | done |
| RF2.4 | Mail claim/send atomic | done |
| RF2.5 | Concurrent market-buy smoke | done |
| RF3.1 | Hard-fail GAME_DB_DRIVER=postgres until async | done |
| RF3.2 | README + PLANNING: SQLite-only supported | done |
| RF3.3 | Optional async AppDb / Postgres (skip unless asked) | deferred |
| RF4.1 | Presence WS-primary (HTTP fallback) | done |
| RF4.2 | Reduce / event-trigger /api/me poll | done |
| RF4.3 | WS hub index by landId (+ user) | done |
| RF4.4 | CORS via GAME_CORS_ORIGIN | done |
| RF5.1 | Shared pulse/flash/contrast util | done |
| RF5.2 | Migrate gather-family cues to util | done |
| RF5.3 | Migrate process-station cues to util | done |
| RF5.4 | success-cue.ts use shared util | done |
| RF5.5 | Cull dead cue re-exports | done |
| RF6.1 | Split catalog items module | done |
| RF6.2 | Split catalog recipes module | done |
| RF6.3 | Split catalog buildings module | done |
| RF6.4 | Split catalog visual-cue configs | done |
| RF6.5 | Stable barrel + module map docs | done |
| RF7.1 | GameApp: extract auth/refresh hooks | done |
| RF7.2 | GameApp: extract travel/visit/map | done |
| RF7.3 | GameApp: extract economy panel wiring | done |
| RF7.4 | GameApp: extract audio/ephemeral cues | done |
| RF7.5 | GameApp line-count target (~2.5k) | pending |
| RF8.1 | Split process-station mesh components | pending |
| RF8.2 | Split gather/civic/portal mesh groups | pending |
| RF8.3 | InstancedMesh pilot (crops or ore) | pending |
| RF8.4 | Shared useFrame / pulse clock where safe | pending |
| RF9.1 | Zod on auth + top mutating routes | done |
| RF9.2 | Zod on remaining action routes | pending |
| RF9.3 | WS message schemas (auth/presence/chat) | pending |
| RF10.1 | Vitest coverage tooling + script | pending |
| RF10.2 | RTL HUD panel test | pending |
| RF10.3 | GameApp logged-out smoke (no WebGL) | pending |
| RF10.4 | Optional CI coverage floor (shared/server) | pending |
| RF11.1 | Reconcile OpenQuestions vs shipped code | pending |
| RF11.2 | Annotate MVPDefinition CityLands expansion | pending |
| RF11.3 | Manual playtest sheet (MVP criteria) | pending |

### Visual assets (VA*) — parallel workstream

> Player-visible **mesh/material polish** for world objects (stations, gather nodes, props). Parallel to PL* cue loop — do not block PL*. Prefer procedural Three.js materials + cheap geometry; no new asset pipeline / external downloads unless already in repo. Gameplay / economy / MAP_IDENTITY unchanged.  
> **Status: idle** — VA1–VA5 complete; post-VA5 survey found **no meaningful structural flat kits** left → **no VA6** (do not invent busywork). Plan annex: [FullGameBuildPlan_CityLands_VisualAssets_5.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_5.md) Continuations. Optional-only leftovers (crop stem/head PBR, lived chimney PBR, barrel-band SoT dedupe) documented there — not queued. Loop picks **Polish PL\*** next.

| ID | Task | Status |
| --- | --- | --- |
| VA1.1 | Gather nodes + core process-station kit materials (stump/ore + mill/forge/kitchen/workshop) | done |
| VA1.2 | City scarce yard props + remaining stations (loom/alchemy/dock/pen) material pass | done |
| VA1.3 | Environment props (trees/fences/sheds) + crop plot soil articulation | done |
| VA2.1 | Travel portal kit materials (posts/lintel/footing/threshold/band + articulation) | done |
| VA2.2 | Vendor stall + market board commerce kit materials | done |
| VA2.3 | Notice board + build board + arena plaque kit materials | done |
| VA2.4 | Tutor NPC + housing decor (pad/planter/banner) kit materials | done |
| VA2.5 | Hunt trail + thicket path/creature kit materials | done |
| VA2.6 | Plaza fountain + warrior arena prop kit materials | done |
| VA3.1 | Expand pad kit materials (pad stone/lip + post/cap articulation) | done |
| VA3.2 | Claim node kit materials (post/footing/banner/finial) | done |
| VA3.3 | Avatar farmer kit materials (cloth/skin/boots/hat/tool PBR) | done |
| VA3.4 | Civic block silhouette materials (pad/wall/roof/door/window) | done |
| VA4.1 | City hub floor materials (streets/plaza/scarce/inlay/road + curb) | done |
| VA4.2 | Homestead yard floor materials (meadow/plot/pad/path + lip) | done |
| VA4.3 | Explore wilds floor materials (canopy/sections/paths PBR) | done |
| VA4.4 | Warrior arena floors + HighlightRing materials | done |
| VA5.1 | Remote presence halo/ping materials | done |
| VA5.2 | Avatar ground shadow disc materials | done |
| VA5.3 | Crop growth progress bar materials | done |
| VA5.4 | Cue-pad flash base materials (gather/fish/expand/build/craft/upgrade) | done |
| VA6 | *(not authored)* — survey: no meaningful flat kits | idle / skipped |

### CityLands fidelity recycle (CL99–CL102) — deferred / frozen

> Do **not** pick. Replaced by Polish (PL\*) on 2026-08-02. Plan archive: [FullGameBuildPlan_CityLands_24.md](docs/19_development_plan/FullGameBuildPlan_CityLands_24.md).

| ID | Task | Status |
| --- | --- | --- |
| CL99.1 | Explore wood → land saw_planks still green | deferred |
| CL99.2 | Explore ore → land smelt still green | deferred |
| CL99.3 | Explore leather → land weave still green | deferred |
| CL100.1 | Land wood_crate City vendor sink still green | deferred |
| CL100.2 | Land cooked_fish City vendor sink still green | deferred |
| CL100.3 | Bread / stew / ration eat energy still green | deferred |
| CL101.1 | Visit presence + nearby trade still green | deferred |
| CL101.2 | Trade invite accept + cancel still green | deferred |
| CL101.3 | Market buy + TTL escrow still green | deferred |
| CL102.1 | Min HUD / interact prompts still green | deferred |
| CL102.2 | Four-map free travel / portal prompts still green | deferred |
| CL102.3 | Regression smoke after CL99–CL102 | deferred |

### CityLands phase 23 (CL95–CL98) — done

| ID | Task | Status |
| --- | --- | --- |
| CL95.1 | City scarce kitchen/workshop craft contention still green | done |
| CL95.2 | City scarce tree/ore gather contention still green | done |
| CL95.3 | Land unlimited craft (no stationBusy) still green | done |
| CL96.1 | Fisher tutor claim after land dock catch still green | done |
| CL96.2 | Alchemist tutor claim after land brew still green | done |
| CL96.3 | Land flour City vendor sink still green | done |
| CL97.1 | Explore premium wood sell still green | done |
| CL97.2 | Mail cancel returns escrow still green | done |
| CL97.3 | Market cancel returns escrow still green | done |
| CL98.1 | Notice tip / scarce_stations fidelity still green | done |
| CL98.2 | Warrior arena optional still green | done |
| CL98.3 | Regression smoke after CL95–CL98 | done |

### CityLands phase 22 (CL91–CL94) — done

| ID | Task | Status |
| --- | --- | --- |
| CL91.1 | Explore wood → land saw_planks still green | done |
| CL91.2 | Explore ore → land smelt still green | done |
| CL91.3 | Explore leather → land weave still green | done |
| CL92.1 | Land wood_crate City vendor sink still green | done |
| CL92.2 | Land cooked_fish City vendor sink still green | done |
| CL92.3 | Bread / stew / ration eat energy still green | done |
| CL93.1 | Visit presence + nearby trade still green | done |
| CL93.2 | Trade invite accept + cancel still green | done |
| CL93.3 | Market buy + TTL escrow still green | done |
| CL94.1 | Min HUD / interact prompts still green | done |
| CL94.2 | Four-map free travel / portal prompts still green | done |
| CL94.3 | Regression smoke after CL91–CL94 | done |

### CityLands phase 21 (CL87–CL90) — done

| ID | Task | Status |
| --- | --- | --- |
| CL87.1 | City scarce kitchen/workshop craft contention still green | done |
| CL87.2 | City scarce tree/ore gather contention still green | done |
| CL87.3 | Land unlimited craft (no stationBusy) still green | done |
| CL88.1 | Fisher tutor claim after land dock catch still green | done |
| CL88.2 | Alchemist tutor claim after land brew still green | done |
| CL88.3 | Land flour City vendor sink still green | done |
| CL89.1 | Explore premium wood sell still green | done |
| CL89.2 | Mail cancel returns escrow still green | done |
| CL89.3 | Market cancel returns escrow still green | done |
| CL90.1 | Notice tip / scarce_stations fidelity still green | done |
| CL90.2 | Warrior arena optional still green | done |
| CL90.3 | Regression smoke after CL87–CL90 | done |

### CityLands phase 20 (CL83–CL86) — done

| ID | Task | Status |
| --- | --- | --- |
| CL83.1 | Explore wood → land saw_planks still green | done |
| CL83.2 | Explore ore → land smelt still green | done |
| CL83.3 | Explore leather → land weave still green | done |
| CL84.1 | Land wood_crate City vendor sink still green | done |
| CL84.2 | Land cooked_fish City vendor sink still green | done |
| CL84.3 | Bread / stew / ration eat energy still green | done |
| CL85.1 | Visit presence + nearby trade still green | done |
| CL85.2 | Trade invite accept + cancel still green | done |
| CL85.3 | Market buy + TTL escrow still green | done |
| CL86.1 | Min HUD / interact prompts still green | done |
| CL86.2 | Four-map free travel / portal prompts still green | done |
| CL86.3 | Regression smoke after CL83–CL86 | done |

### CityLands phase 19 (CL79–CL82) — done

| ID | Task | Status |
| --- | --- | --- |
| CL79.1 | City scarce kitchen/workshop craft contention still green | done |
| CL79.2 | City scarce tree/ore gather contention still green | done |
| CL79.3 | Land unlimited craft (no stationBusy) still green | done |
| CL80.1 | Farmer tutor claim after land plant/harvest still green | done |
| CL80.2 | Weaver tutor claim after land weave still green | done |
| CL80.3 | Land mill→bake→City bread sell still green | done |
| CL81.1 | Explore premium leather/ore sell still green | done |
| CL81.2 | Mail parcel claim still green | done |
| CL81.3 | Market cancel returns escrow still green | done |
| CL82.1 | Notice tip / scarce_stations fidelity still green | done |
| CL82.2 | Warrior arena optional still green | done |
| CL82.3 | Regression smoke after CL79–CL82 | done |

### CityLands phase 18 (CL75–CL78) — done

| ID | Task | Status |
| --- | --- | --- |
| CL75.1 | Land flour City vendor sink still green | done |
| CL75.2 | Land cloth_bandage City vendor sink still green | done |
| CL75.3 | Land plank City vendor / market still green | done |
| CL76.1 | Mail cancel returns escrow still green | done |
| CL76.2 | Trade invite accept + cancel still green | done |
| CL76.3 | Market buy from listing still green | done |
| CL77.1 | Explore premium wood sell still green | done |
| CL77.2 | Recipe XP gate fidelity still green | done |
| CL77.3 | Homestead hunt refuse still green | done |
| CL78.1 | Min HUD / interact prompts still green | done |
| CL78.2 | Four-map free travel still green | done |
| CL78.3 | Regression smoke after CL75–CL78 | done |

### CityLands phase 17 (CL71–CL74) — done

| ID | Task | Status |
| --- | --- | --- |
| CL71.1 | Explore wood → land saw_planks still green | done |
| CL71.2 | Explore ore → land smelt_iron_bar still green | done |
| CL71.3 | Explore thicket → Monster Hunter claim still green | done |
| CL72.1 | Bread / hearty_stew eat energy still green | done |
| CL72.2 | Housing banner coin sink still green | done |
| CL72.3 | Land wood_crate City vendor sink still green | done |
| CL73.1 | Animal Hunter claim after trail still green | done |
| CL73.2 | Visit presence + nearby trade still green | done |
| CL73.3 | Mail send refuse edges still green | done |
| CL74.1 | Portal free-travel prompts still green | done |
| CL74.2 | City vendor buy seed/tool still green | done |
| CL74.3 | Regression smoke after CL71–CL74 | done |

### CityLands phase 16 (CL67–CL70) — done

| ID | Task | Status |
| --- | --- | --- |
| CL67.1 | Travel ration craft → energy eat smoke | done |
| CL67.2 | Herbal tonic / cooked_fish eat energy smoke | done |
| CL67.3 | Housing decor coin sink still green | done |
| CL68.1 | Animal Breeder tutor claim after pen care still green | done |
| CL68.2 | Explore leather → land loom weave still green | done |
| CL68.3 | Explore premium leather sell still green | done |
| CL69.1 | Mail / offline parcel claim still green | done |
| CL69.2 | Four-map free travel circuit still green | done |
| CL69.3 | Market cancel returns escrow still green | done |
| CL70.1 | Notice board tips still green | done |
| CL70.2 | Warrior arena board optional still green | done |
| CL70.3 | Regression smoke after CL67–CL70 | done |

### CityLands phase 15 (CL63–CL66) — done

| ID | Task | Status |
| --- | --- | --- |
| CL63.1 | City scarce loom contention assert | done |
| CL63.2 | City scarce fishing_dock contention assert | done |
| CL63.3 | City scarce alchemy_bench contention assert | done |
| CL64.1 | Farmer tutor claim after land plant/harvest still green | done |
| CL64.2 | Fisher tutor claim after land dock catch still green | done |
| CL64.3 | Alchemist tutor claim after land brew still green | done |
| CL65.1 | Market listing TTL expire → escrow return smoke | done |
| CL65.2 | City scarce crop_plot plant contention assert | done |
| CL65.3 | Cooked_fish market cross-player buy smoke | done |
| CL66.1 | Visit presence + nearby trade still green | done |
| CL66.2 | Min HUD / interact prompts still green | done |
| CL66.3 | Regression smoke after CL63–CL66 | done |

### CityLands phase 14 (CL59–CL62) — done

| ID | Task | Status |
| --- | --- | --- |
| CL59.1 | Explore ore chip → Miner tutor claim e2e | done |
| CL59.2 | Land smelt → Blacksmith tutor claim e2e | done |
| CL59.3 | Land cook → Cook tutor claim e2e | done |
| CL60.1 | City scarce tree chop contention assert | done |
| CL60.2 | City scarce ore chip contention assert | done |
| CL60.3 | City scarce workshop contention assert | done |
| CL61.1 | Market buy from other player listing smoke | done |
| CL61.2 | City vendor buy seed/tool smoke | done |
| CL61.3 | Cooked_fish / ore NPC rates still green | done |
| CL62.1 | Builder tutor claim after land station place | done |
| CL62.2 | Weaver tutor claim after land weave still green | done |
| CL62.3 | Regression smoke after CL59–CL62 | done |

### CityLands phase 13 (CL55–CL58) — done

| ID | Task | Status |
| --- | --- | --- |
| CL55.1 | Explore trail → Animal Hunter tutor claim e2e | done |
| CL55.2 | Trail vs thicket tutor isolation smoke | done |
| CL55.3 | Homestead hunt refuse still green | done |
| CL56.1 | Explore ore chip → land smelt e2e | done |
| CL56.2 | Land smelt → City vendor ore/bar sink smoke | done |
| CL56.3 | Miner XP stays on chip not smelt | done |
| CL57.1 | City scarce forge contention assert | done |
| CL57.2 | City scarce mill contention assert | done |
| CL57.3 | Cooked_fish market list smoke | done |
| CL58.1 | Forester tutor claim after land chop | done |
| CL58.2 | Carpenter tutor claim after land saw | done |
| CL58.3 | Regression smoke after CL55–CL58 | done |

### CityLands phase 12 (CL51–CL54) — done

| ID | Task | Status |
| --- | --- | --- |
| CL51.1 | Land cook_fish → City vendor sell e2e | done |
| CL51.2 | Land stew → City market list smoke | done |
| CL51.3 | Land wheat harvest → City vendor sell | done |
| CL52.1 | Trade invite accept + cancel smoke | done |
| CL52.2 | Visit land presence + leave smoke | done |
| CL52.3 | City scarce station contention assert | done |
| CL53.1 | Explore thicket → Monster Hunter tutor claim e2e | done |
| CL53.2 | Land tree → saw plank → City crate sell chain | done |
| CL53.3 | Recipe XP gate fidelity smoke | done |
| CL54.1 | Portal interact prompts all four maps | done |
| CL54.2 | Warrior arena board optional fidelity | done |
| CL54.3 | Regression smoke after CL51–CL54 | done |

### CityLands phase 11 (CL47–CL50) — done

| ID | Task | Status |
| --- | --- | --- |
| CL47.1 | Land dock fish → kitchen cook_fish | done |
| CL47.2 | Land alchemy brew → vendor/market sink | done |
| CL47.3 | Land bread → City vendor sell e2e | done |
| CL48.1 | Land workshop saw → crate smoke | done |
| CL48.2 | Explore leather → land loom weave e2e | done |
| CL48.3 | Land mill→bake→pack_travel_ration chain | done |
| CL49.1 | Visit land + trade invite nearby smoke | done |
| CL49.2 | Housing second decor place smoke | done |
| CL49.3 | Breeder tutor claim after pen care | done |
| CL50.1 | Interact prompt fidelity (stations) | done |
| CL50.2 | Four-map free travel still green | done |
| CL50.3 | Regression smoke after CL47–CL50 | done |

### CityLands phase 10 (CL43–CL46) — done

| ID | Task | Status |
| --- | --- | --- |
| CL43.1 | Land mill → kitchen bake bread smoke | done |
| CL43.2 | Land forge smelt → hammer smoke | done |
| CL43.3 | Land loom bandage → vendor/market sink | done |
| CL44.1 | Explore ore chip → premium sell e2e | done |
| CL44.2 | Land fishing_dock catch after builder gate | done |
| CL44.3 | Explore hunt meat → land kitchen cook | done |
| CL45.1 | Breeder feed + clean XP e2e smoke | done |
| CL45.2 | Market cross-player buy smoke | done |
| CL45.3 | Travel ration tip fidelity | done |
| CL46.1 | Gate animal_pen on builder XP | done |
| CL46.2 | Min HUD walk-up panel fidelity | done |
| CL46.3 | Regression smoke after CL43–CL46 | done |

### CityLands phase 9 (CL39–CL42) — done

| ID | Task | Status |
| --- | --- | --- |
| CL39.1 | Wood crate vendor or market sink | done |
| CL39.2 | Land plant → harvest → mill flour smoke | done |
| CL39.3 | Carpenter crate tip fidelity | done |
| CL40.1 | Explore gather → premium sell e2e | done |
| CL40.2 | Travel ration craft assert | done |
| CL40.3 | City scarce stations tip fidelity | done |
| CL41.1 | Breeder quest blurb names clean beat | done |
| CL41.2 | Gate fishing_dock on builder XP | done |
| CL41.3 | Housing decor place smoke | done |
| CL42.1 | Warrior arena tip / plaque fidelity | done |
| CL42.2 | Four-map free travel smoke | done |
| CL42.3 | Regression smoke after CL39–CL42 | done |

### CityLands phase 8 (CL35–CL38) — done

| ID | Task | Status |
| --- | --- | --- |
| CL35.1 | Mill flour → bake bread smoke | done |
| CL35.2 | Flour / bread vendor or market sink | done |
| CL35.3 | Cook meat assert | done |
| CL36.1 | Carpenter second light recipe OR plank sink | done |
| CL36.2 | Blacksmith forge hammer / hoe smoke assert | done |
| CL36.3 | Gate alchemy_bench or kitchen on builder XP | done |
| CL37.1 | Explore vendor premium sell smoke | done |
| CL37.2 | Explore mats → land craft tip fidelity | done |
| CL37.3 | Breeder path tip names feed + clean | done |
| CL38.1 | Alchemist second light brew OR tonic eat assert | done |
| CL38.2 | Regression smoke after CL35–CL38 | done |

### CityLands phase 7 (CL31–CL34) — done

| ID | Task | Status |
| --- | --- | --- |
| CL31.1 | Split Animal / Monster Hunter XP | done |
| CL31.2 | Hunter tutor / tip fidelity | done |
| CL31.3 | Alchemist XP column | done |
| CL32.1 | Placeable land tree stump | done |
| CL32.2 | Placeable land ore node | done |
| CL32.3 | Land gather practice tip | done |
| CL33.1 | Vendor sell tonic + bandage | done |
| CL33.2 | Market list tonic/bandage smoke | done |
| CL33.3 | Hunt meat → kitchen tip | done |
| CL34.1 | Gate kitchen or loom on builder XP | done |
| CL34.2 | Animal Breeder light second beat | done |
| CL34.3 | Regression smoke after CL31–CL34 | done |

### CityLands phase 6 (CL27–CL30) — done

| ID | Task | Status |
| --- | --- | --- |
| CL27.1 | Pen interact feed stub | done |
| CL27.2 | Animal Breeder XP column | done |
| CL27.3 | Seed Animal Breeder tutor | done |
| CL28.1 | Gate mill/workshop on builder XP | done |
| CL28.2 | Alchemist bench stub | done |
| CL28.3 | Retarget Alchemist practice to bench | done |
| CL29.1 | Market cancel + buy smoke | done |
| CL29.2 | Weaver second recipe | done |
| CL29.3 | Cook fish tip + stew sink assert | done |
| CL30.1 | Animal Hunter XP assert | done |
| CL30.2 | Monster Hunter thicket assert | done |
| CL30.3 | Regression smoke after CL27–CL30 | done |

### CityLands phase 5 (CL23–CL26) — done

| ID | Task | Status |
| --- | --- | --- |
| CL23.1 | Fisher XP column on gatherFish | done |
| CL23.2 | Fish vendor/market sink | done |
| CL23.3 | Cook fish recipe at kitchen | done |
| CL24.1 | Explore woodland → forester XP assert | done |
| CL24.2 | Explore mines → miner XP assert | done |
| CL24.3 | Explore gather → craft tip | done |
| CL25.1 | List land craft on City market smoke | done |
| CL25.2 | City vendor buy book completeness | done |
| CL25.3 | Fish → kitchen tip | done |
| CL26.1 | Builder XP gate on expensive station | done |
| CL26.2 | Animal pen stub (land) or defer note | done |
| CL26.3 | Regression smoke after CL23–CL26 | done |

### CityLands phase 4 (CL18–CL22) — done

| ID | Task | Status |
| --- | --- | --- |
| CL18.1 | Forester XP column (stop carpenter chop routing) | done |
| CL18.2 | Miner XP column (stop blacksmith ore routing) | done |
| CL18.3 | Builder XP on placeLandStation | done |
| CL19.1 | Fish item + fishing dock on player land | done |
| CL19.2 | Scarce city fishing dock + practice map | done |
| CL19.3 | Retarget Fisher tutor + tip to fish | done |
| CL20.1 | Wire Alchemist practice to Kitchen | done |
| CL20.2 | Alchemist brew clarity (copy / tip) | done |
| CL21.1 | Post-craft market tip (land→City list) | done |
| CL21.2 | Explore mats → craft chain tip | done |
| CL22.1 | Regression smoke after CL18–CL21 | done |

### CityLands phase 3 (CL13–CL17) — done

| ID | Task | Status |
| --- | --- | --- |
| CL13.1 | Seed Weaver tutor on City | done |
| CL13.2 | Scarce city loom for Weaver practice | done |
| CL13.3 | Weaver XP column (stop carpenter gate) | done |
| CL14.1 | Seed Fisher + Alchemist tutors | done |
| CL14.2 | Practice nodes for Fisher/Alchemist (or tip defer) | done |
| CL15.1 | Seed Animal Hunter + Monster Hunter tutors | done |
| CL15.2 | Builder tutor + first land build quest | done |
| CL16.1 | Empty-land build board tip | done |
| CL16.2 | Animal Breeder path note / light seed | done |
| CL17.1 | Regression smoke after CL13–CL16 | done |

### CityLands phase 2 (CL8–CL12) — done

| ID | Task | Status |
| --- | --- | --- |
| CL8.1 | Seed next city tutorial NPC batch (≥3) | done |
| CL8.2 | Scarce city stations for newly seeded tutors | done |
| CL8.3 | City event / notice board stub | done |
| CL9.1 | More buildable player-land station types | done |
| CL9.2 | Land→City produce loop tip | done |
| CL10.1 | Explore section labels / wayfinding | done |
| CL10.2 | Hunt/gather regional vendor value check | done |
| CL11.1 | Arena plaque copy + exit clarity | done |
| CL11.2 | No warrior training buildings on player land | done |
| CL12.1 | First-session City hub tip | done |
| CL12.2 | Keep four-map smoke green after CL8–CL11 | done |

### CityLands phase 1 (CL1–CL7) — done

| ID | Task | Status |
| --- | --- | --- |
| CL1.1 | Stop starter-yard-everything; four map-kind model | done |
| CL1.2 | Free travel skeleton (City↔Lands↔Explore↔Warrior) | done |
| CL1.3 | Client map routing (LandScene per kind) | done |
| CL2.1 | City template + scarce shared stations | done |
| CL2.2 | Tutorial NPC framework + seed NPCs (≥3 professions) | done |
| CL2.3 | City market stub (list/buy + NPC tools/seeds) | done |
| CL3.1 | Empty free player land (no auto production seed) | done |
| CL3.2 | Build stations on land (unlimited per type) | done |
| CL4.1 | Exploration map template | done |
| CL4.2 | Relocate hunt loop off homestead onto explore | done |
| CL5.1 | Warrior arena stub map (optional, no balance) | done |
| CL6.1 | Strip persistent HUD chrome (contextual panels) | done |
| CL6.2 | Split GameApp panel orchestration | done |
| CL7.1 | Travel UX polish (free circuit, clear copy) | done |
| CL7.2 | Four-map smoke tests | done |

---

## Full game queue (F8+) — SUPERSEDED / ARCHIVE

> **Superseded (2026-08-01):** F16.2–F17.5 content/platform queue is **deferred**. Live work is the **CityLands queue** above. F8–F16.1 remain done history. Do not plan-rollover new single-land content.

| ID | Task | Status |
| --- | --- | --- |
| F8.1 | Presence heartbeat API (report x,z) | done |
| F8.2 | Show other players on land / visit | done |
| F8.3 | WebSocket gateway for presence + chat | done |
| F8.4 | Chat over WebSocket (HTTP fallback) | done |
| F8.5 | Trade invite ping when nearby | done |
| F9.1 | Combat stats Health / Damage / Defense | done |
| F9.2 | Game trail real encounter fight | done |
| F9.3 | Second creature + public edge zone | done |
| F9.4 | Tool soft combat role on hunt | done |
| F9.5 | Downed penalty without loot wipe | done |
| F10.1 | Hunter profession XP | done |
| F10.2 | Carpenter / wood chain | done |
| F10.3 | Longer food chain | done |
| F10.4 | Mill/forge building upgrades | done |
| F10.5 | Recipe book UI at stations | done |
| F11.1 | Second biome stub | done |
| F11.2 | Caravan / travel timer | done |
| F11.3 | Regional vendor price variance | done |
| F11.4 | Marketplace listing TTL + fees | done |
| F11.5 | Cosmetic housing decor slots | done |
| F12.1 | Guild ranks + invite codes | done |
| F12.2 | Guild bank | done |
| F12.3 | Claim node | done |
| F12.4 | Contested claim soft war | done |
| F12.5 | Guild chat channel | done |
| F13.1 | Character level from characterXp | done |
| F13.2 | Five starter quests | done |
| F13.3 | Achievements stubs | done |
| F13.4 | Mail / offline trade delivery | done |
| F13.5 | Settings + keybind help | done |
| F14.1 | GLTF loader + one hero building | done |
| F14.2 | Avatar art upgrade | done |
| F14.3 | Crop/ore/trail visual polish | done |
| F14.4 | BGM + SFX hooks | done |
| F14.5 | Cosmetic day-night cycle | done |
| F15.1 | Optional wallet connect stub | done |
| F15.2 | Off-chain premium land deed | done |
| F15.3 | Mint/list stub UI | done |
| F15.4 | On-chain marketplace read-only view | done |
| F15.5 | Assert chain never gates combat | done |
| F16.1 | Postgres adapter | done |
| F16.2 | Docker compose | deferred — superseded by CityLands |
| F16.3 | Auth hardening | deferred — superseded by CityLands |
| F16.4 | Richer telemetry | deferred — superseded by CityLands |
| F16.5 | CI test + lint | deferred — superseded by CityLands |
| F17.1 | Playtest smoke script | deferred — superseded by CityLands |
| F17.2 | Balance pass notes | deferred — superseded by CityLands |
| F17.3 | Content freeze tag notes | deferred — superseded by CityLands |
| F17.4 | Signup / wipe policy in README | deferred — superseded by CityLands |
| F17.5 | Residual → FutureIdeas only | deferred — superseded by CityLands |

---

## Shipped MVP / polish (P0–P7)

| ID | Task | Status |
| --- | --- | --- |
| P0–P7 | Vertical slice + living loop + proximity + chat + hunt + cook + guilds | done |

---

## Completed

| TREE-STUMP-1 Cooling stump matches trunk caliber | 2026-09-10 | `GatherDepletedStumpMesh` uses same flare/roots + trunk radii (`stumpRadiusBase` 0.22 vs old 0.65 barrel); `gather-ready-tree-visual` |
| TREE-READY-1 Chop-ready wood nodes look like trees | 2026-09-04 | Leafy trunk+canopy while choppable (`GatherReadyTreeMesh` / `GATHER_READY_TREE`); cooling stays stump; label above canopy; `gather-ready-tree-visual` |
| CTC-SWAP-TYPE-1 | Type swap API `swap` field | 2026-09-04 | `AuthActionResult` extra + `creditcoinSwapSuccessCueText`; `creditcoin-swap-cue` |
| RF9.1 Zod auth + market list/buy/cancel | 2026-08-03 | `zod` + `auth/schemas.ts`; register/login + market POST/buy/cancel; `auth-schemas-rf91` |
| RF5.5 Cull dead cue re-exports | 2026-08-03 | Mass-migrate 72 sine envelopes to util; no dead public API to cull yet |
| RF5.4 success-cue.ts shared util | 2026-08-03 | Kinship: success-cue is copy/text only — no pulse math to migrate |
| RF5.3 Process-station cues → util | 2026-08-03 | mill/forge/kitchen/loom/alchemy/workshop + working emissive; `process-station-cue-util-rf53` |
| RF5.2 Gather-family cues → util | 2026-08-03 | crop/stump/ore/gather flash; `gather-cue-util-rf52` |
| RF5.1 Shared pulse/flash/contrast util | 2026-08-03 | `visual-cue-math.ts` sine/lerp/flash/contrast; crop ready + growing atmosphere + craft flash wrappers; `visual-cue-math-rf51` |
| RF4.4 CORS via GAME_CORS_ORIGIN | 2026-08-03 | `resolveCorsOrigins` + Hono cors; comma-separated; `cors-rf44` |
| RF4.3 WS hub land/user index | 2026-08-03 | `byLand` / `byUser` Maps; broadcastLand/pushToUser indexed; `ws-hub` RF4.3 |
| RF4.2 Reduce /api/me poll | 2026-08-03 | 4s → 12s; skip when `document.hidden` |
| RF4.1 Presence WS-primary | 2026-08-03 | `sendPresence` when socket ready; HTTP `apiReportPresence` fallback |
| RF3.2 README + PLANNING SQLite-only | 2026-08-03 | Docs: Postgres hard-fail until RF3.3 |
| RF3.1 Hard-fail postgres driver | 2026-08-03 | `assertSupportedDbDriver`; `postgres-honesty-rf31` |
| RF2.5 Concurrent market-buy smoke | 2026-08-03 | Second buy after sold fails; `economy-txn-rf2` |
| RF2.4 Mail claim/send atomic | 2026-08-03 | send/claim/cancel in `withTransaction` |
| RF2.3 Trade accept atomic | 2026-08-03 | `acceptTrade` wrapped |
| RF2.2 Market buy/list/cancel atomic | 2026-08-03 | create/buy/cancel wrapped |
| RF2.1 withTransaction helper | 2026-08-03 | `db/transaction.ts`; rollback on throw |
| RF1.5 Chat / WS flood guard | 2026-08-03 | chat 5/10s; presence 20/5s; `rateLimit.ts` |
| RF1.4 Password floor + bcrypt | 2026-08-03 | min 8; cost 10 (`GAME_BCRYPT_COST`); `auth-hardening-rf1` |
| RF1.3 Login/register rate limit | 2026-08-03 | 10/60s per IP + username → 429 |
| RF1.2 Logout / revoke session | 2026-08-03 | `revokeSession` + `POST /api/auth/logout` + `apiLogout` |
| RF1.1 Session TTL / expiry check | 2026-08-03 | `createdAt + GAME_SESSION_TTL_MS` (default 7d); expired → delete row + null in `userIdFromToken`; helpers `resolveSessionTtlMs` / `sessionExpiresAt` / `isSessionExpired`; no schema migration; `session-ttl-rf11` |
| G0.2 Activate RF* live queue + loop sentinel | 2026-08-03 | TASKS live → Hardening RF*; AgentAutonomousLoop sentinel = RF*; Polish 41 frozen |
| G0.1 Freeze Polish 41 (PL202–PL205) | 2026-08-03 | Fast-track hardening; PL202–PL205 status `frozen` |
| PL201.2 Homestead-fence soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing boundary mist via `HOMESTEAD_FENCE_ATMOSPHERE_CUE` / `homesteadFenceAtmosphereCue` / pulse+haze helpers leftover discs at fence corners in HomesteadEnvironment while on player land (complements fence landmark PL176.2 + path cues; ≠ landmark `#4a6a78` / empty path / decor rosewood `#583020` / lived path; wider/slower/quieter — landmark stays identity rim on posts/corners; layouts SoT; mute ok); `homestead-fence-atmosphere-cue-pl2012` |
| PL201.1 Housing-decor soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing rosewood mist via `HOUSING_DECOR_ATMOSPHERE_CUE` / `housingDecorAtmosphereCue` / pulse+haze helpers leftover disc on DecorPad/Planter/Banner while on player land (complements landmark PL176.1 + place flash PL149.2; ≠ landmark `#c89878` / tip `#c4b07a` / place `#a8786c` / build `#684828`; wider/slower/quieter — landmark stays identity rim; decor costs SoT; mute ok); `housing-decor-atmosphere-cue-pl2011` |
| PL200.2 Empty-homestead path soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing path mist via `EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE` / `emptyHomesteadPathAtmosphereCue` / pulse+haze helpers leftover plane over empty path-cross while yard empty (complements meadow landmark PL178.2 + empty path cue PL154.1; ≠ path cue `#6a8090` / meadow `#c4a858` / lived path; wider/slower/quieter — path cue stays identity emissive; layouts SoT; mute ok); `empty-homestead-path-atmosphere-cue-pl2002` |
| PL200.1 Build-board soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing timber mist via `BUILD_BOARD_ATMOSPHERE_CUE` / `buildBoardAtmosphereCue` / pulse+haze helpers leftover disc on BuildBoardBuilding while on player land beacon+soft (complements landmark PL160.1 + place flash PL134.1; ≠ landmark `#b88840` / beacon pad / spawn `#e8c078` / workshop `#583018`; wider/slower/quieter — landmark stays empty identity rim, soft-mode keeps mist after first station; build costs SoT; mute ok); `build-board-atmosphere-cue-pl2001` |
| PL199.2 Soft-war deliver soft glance leftover | 2026-08-02 | Quiet TopBar `E · Deliver` chip via `SOFT_WAR_DELIVER_CLOSED_GLANCE` / `shouldShowSoftWarDeliverClosedGlance` / `softWarDeliverClosedGlanceLabel` / `topbar-soft-war-deliver-glance` while open contest + guild + wood and claim interact not focused (complements contest atmosphere PL183.2 + deliver rim PL146.2; scoring/window SoT; min HUD; mute ok; no claim column); `soft-war-deliver-closed-glance-pl1992` |
| PL199.1 Deed-desk soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing civic mist via `CITY_DEED_DESK_ATMOSPHERE_CUE` / `cityDeedDeskAtmosphereCue` / pulse+haze helpers leftover disc on DeedDeskLandmark while on City (complements desk landmark PL165.1 + mint/link rims; ≠ landmark `#5e7a8c` / notice leftover `#3e5c6e` / plaza cyan; wider/slower/quieter — landmark stays identity rim; stub path SoT; no NFT combat; mute ok); `deed-desk-atmosphere-cue-pl1991` |
| PL198.2 Inventory-pickup idle soft glance leftover | 2026-08-02 | Quiet periodic TopBar `I · Bag` chip via `INVENTORY_PICKUP_IDLE_GLANCE` / `shouldShowInventoryPickupIdleGlance` / `inventoryPickupIdleGlanceLabel` / `topbar-inventory-pickup-glance` after recent bag inflow while Inventory closed (complements slot flash PL128.2 + open accent PL9.2; arms via `shouldArmInventoryPickupIdleGlance` on same risen/new stacks; linger 10s; clears on I open / linger end / logout; inventory rules SoT; min HUD; mute ok; no inventory column); `inventory-pickup-idle-glance-pl1982` |
| PL198.1 Health-meter idle soft glance leftover | 2026-08-02 | Quiet periodic TopBar HP breath via `HEALTH_METER_IDLE_GLANCE` / `shouldShowHealthMeterIdleGlance` / `topbar-health-meter--idle-glance` while walking healthy with no panel open (complements low-health warn PL67.1 + vignette PL126.1; low warn wins; heal/combat SoT; min HUD; mute ok; period desynced from energy/map idle); `health-meter-idle-glance-pl1981` |
| PL197.2 Notice-unread closed glance leftover | 2026-08-02 | Quiet TopBar `Notice` chip via `NOTICE_UNREAD_CLOSED_GLANCE` / `shouldShowNoticeUnreadClosedGlance` / `noticeUnreadClosedGlanceLabel` / `topbar-notice-glance` while unread tip ids pending and Notice panel closed (complements unread flicker PL117.2 + open accent PL34.3; walk-up board — no fake Travel N hotkey; tip ids SoT; min HUD; mute ok; no notice column); `notice-unread-closed-glance-pl1972` |
| PL197.1 Chat-pending closed glance leftover | 2026-08-02 | Quiet TopBar `C · Chat` chip via `CHAT_PENDING_CLOSED_GLANCE` / `shouldShowChatPendingClosedGlance` / `chatPendingClosedGlanceLabel` / `topbar-chat-glance` while staged unread world/guild lines pending and Chat closed (complements receive ping PL27.2 + open accent PL38.1; stages via `shouldStageChatPendingClosedGlance` / `mergePendingChatGlanceLine`; clears on C open / close / logout; chat rules SoT; min HUD; mute ok; no chat column); `chat-pending-closed-glance-pl1971` |
| PL196.2 Expand-pad soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing footing mist via `EXPAND_PAD_ATMOSPHERE_CUE` / `expandPadAtmosphereCue` / pulse+haze helpers leftover disc on ExpandPadMesh while on player land (complements expand flash PL137.2 + unlock cues + warm field-gold landmark PL163.1; ≠ landmark `#b8a048` / short amber / flash gold / affordable green; wider/slower/quieter cool footing — warm landmark stays identity rim, not a second gold disc; expand costs SoT; mute ok); `expand-pad-atmosphere-cue-pl1962` |
| PL196.1 Workshop soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing deep timber mist via `WORKSHOP_ATMOSPHERE_CUE` / `workshopAtmosphereCue` / pulse+haze helpers leftover disc on WorkshopBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm timber landmark PL172.2; ≠ landmark `#966848` / working `#c89840` / forge coal `#702818`; City kinship = warm landmark alone, no stack; recipes SoT; mute ok); `workshop-atmosphere-cue-pl1961` |
| PL195.2 Achievements-pending closed glance leftover | 2026-08-02 | Quiet TopBar `A · Unlock` chip via `ACHIEVEMENTS_PENDING_CLOSED_GLANCE` / `shouldShowAchievementsPendingClosedGlance` / `achievementsPendingClosedGlanceLabel` / `topbar-achievements-glance` while staged new unlock pending review and Achievements closed (complements unlock rim PL136.1 + open accent PL46.2; stages via `newlyUnlockedAchievementGlanceRows` / `mergePendingAchievementUnlocks`; clears on A open / close / logout; unlock rules SoT; min HUD; mute ok; no achievements column); `achievements-pending-closed-glance-pl1952` |
| PL195.1 Trade-pending closed glance leftover | 2026-08-02 | Quiet TopBar `T · Trade` chip via `TRADE_PENDING_CLOSED_GLANCE` / `shouldShowTradePendingClosedGlance` / `tradePendingClosedGlanceLabel` / `topbar-trade-glance` while unanswered incoming trade offer pending and Trade closed (complements receive cue PL18.1 + accept rim PL143.1; outgoing ignored; escrow SoT; min HUD; mute ok; no trade column); `trade-pending-closed-glance-pl1951` |
| PL194.2 Alchemy-bench soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing deep tonic mist via `ALCHEMY_BENCH_ATMOSPHERE_CUE` / `alchemyBenchAtmosphereCue` / pulse+haze helpers leftover disc on AlchemyBenchBuilding while on player land (complements Free/Busy + craft working PL121.2 + City cool tonic landmark PL170.1; ≠ landmark `#4a8878` / working `#c89840` / loom thread `#685028`; City kinship = cool landmark alone, no stack; recipes SoT; mute ok); `alchemy-bench-atmosphere-cue-pl1942` |
| PL194.1 Loom soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing deep thread mist via `LOOM_ATMOSPHERE_CUE` / `loomAtmosphereCue` / pulse+haze helpers leftover disc on LoomBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm thread landmark PL169.2; ≠ landmark `#a88850` / working `#c89840` / kitchen stew `#8a4820`; City kinship = warm landmark alone, no stack; recipes SoT; mute ok); `loom-atmosphere-cue-pl1941` |
| PL193.2 Kitchen soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing stew-hearth mist via `KITCHEN_ATMOSPHERE_CUE` / `kitchenAtmosphereCue` / pulse+haze helpers leftover disc on KitchenBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm hearth landmark PL174.1; ≠ landmark `#c46828` / working `#c89840` / forge coal `#702818`; City kinship = warm landmark alone, no stack; recipes SoT; mute ok); `kitchen-atmosphere-cue-pl1932` |
| PL193.1 Forge soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing deep coal mist via `FORGE_ATMOSPHERE_CUE` / `forgeAtmosphereCue` / pulse+haze helpers leftover disc on ForgeBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm ember landmark PL173.1; ≠ landmark `#b85828` / working `#c89840`; City kinship = warm landmark alone, no stack; recipes SoT; mute ok); `forge-atmosphere-cue-pl1931` |
| PL192.2 Mill soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing grain mist via `MILL_ATMOSPHERE_CUE` / `millAtmosphereCue` / pulse+haze helpers leftover disc on MillBuilding while on player land (complements Free/Busy + craft working PL121.2 + City cool landmark PL173.2; ≠ landmark `#8a8860` / working `#c89840`; City kinship = cool landmark alone, no stack; recipes SoT; mute ok); `mill-atmosphere-cue-pl1922` |
| PL192.1 Ore-node soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing ore mist via `ORE_NODE_ATMOSPHERE_CUE` / `oreNodeAtmosphereCue` / pulse+haze helpers leftover disc on OreNodeMesh while on player land (complements ready/depleted PL12.2 + City landmark PL172.1 + Explore premium PL116.2; ≠ landmark `#4a6280` / ready `#6a727a` / premium `#5a7a9a`; City kinship = landmark alone, no stack; mine cooldown SoT; mute ok); `ore-node-atmosphere-cue-pl1921` |
| PL191.2 Tree-stump soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing wood mist via `TREE_STUMP_ATMOSPHERE_CUE` / `treeStumpAtmosphereCue` / pulse+haze helpers leftover disc on TreeStumpBuilding while on player land (complements ready/depleted PL12.2 + City landmark PL171.2; ≠ landmark / ready top; City kinship = landmark alone, no stack; chop cooldown SoT; mute ok); `tree-stump-atmosphere-cue-pl1912` |
| PL191.1 Animal-pen soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing pen mist via `ANIMAL_PEN_ATMOSPHERE_CUE` / `animalPenAtmosphereCue` / pulse+haze helpers leftover disc on AnimalPenBuilding while on player land (complements ready pad PL127.1 + City landmark PL170.2; ≠ landmark hay / ready green; City kinship = landmark alone, no stack; care / cooldown SoT; mute ok); `animal-pen-atmosphere-cue-pl1911` |
| PL190.2 Fishing-dock soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing water mist via `FISHING_DOCK_ATMOSPHERE_CUE` / `fishingDockAtmosphereCue` / pulse+haze helpers leftover disc on FishingDockBuilding while on City or player land (complements City landmark PL169.1 + ready shimmer PL118.2; ≠ landmark / ready shimmer; catch rates SoT; mute ok); `fishing-dock-atmosphere-cue-pl1902` |
| PL190.1 Crop-growing soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing soil mist via `CROP_GROWING_ATMOSPHERE_CUE` / `cropGrowingAtmosphereCue` / pulse+haze helpers leftover disc on CropFieldMesh while sprout/growing on player land (complements growing sway PL121.1 + ready pulse PL12.1; ≠ sway pad / ready lime / City crop landmark; growMs / yields SoT; mute ok); `crop-growing-atmosphere-cue-pl1901` |
| PL189.2 Guild-invite closed glance leftover | 2026-08-02 | Quiet TopBar `G · Invite` chip via `GUILD_INVITE_CLOSED_GLANCE` / `shouldShowGuildInviteClosedGlance` / `guildInviteClosedGlanceLabel` / `topbar-guild-invite-glance` while unanswered soft offer pending and Guild closed (complements accept rim PL148.2 + membership open PL140.2; soft nearby offer shares existing code via `guild_invite` WS + `offerGuildInviteToNearby`; join-by-code SoT unchanged; clears when none pending / panel open / already in guild; min HUD; mute ok; no social column); `guild-invite-closed-glance-pl1892` |
| PL189.1 Quest-pending closed glance leftover | 2026-08-02 | Quiet TopBar `Q · Quest` chip via `QUEST_PENDING_CLOSED_GLANCE` / `shouldShowQuestPendingClosedGlance` / `questPendingClosedGlanceLabel` / `topbar-quest-glance` while claimable reward pending and Quest closed (complements claim rim PL138.2 + open accent PL29.2 + ready-row PL128.1; clears when none ready or panel open; quest rules unchanged; min HUD; mute ok; no quest column); `quest-pending-closed-glance-pl1891` |
| PL188.2 Energy-meter idle soft glance leftover | 2026-08-02 | Quiet periodic TopBar energy-bar breath via `ENERGY_METER_IDLE_GLANCE` / `shouldShowEnergyMeterIdleGlance` / `topbar-energy-meter--idle-glance` while walking healthy with no panel open (complements low-energy warn PL9.1 + vignette; low warn wins; clears when panel open; regen rules unchanged; min HUD; mute ok); `energy-meter-idle-glance-pl1882` |
| PL188.1 Interact-prompt idle soft glance leftover | 2026-08-02 | Quiet periodic prompt chrome breath via `INTERACT_PROMPT_IDLE_GLANCE` / `shouldShowInteractPromptIdleGlance` / `interact-prompt--idle-glance` while in interact range with no panel open (complements action-first hierarchy PL2.1 + success pulse PL6.2; success one-shot wins; clears when far or panel open; no HUD column; mute ok); `interact-prompt-idle-glance-pl1881` |
| PL187.2 City notice soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing civic mist via `CITY_NOTICE_BOARD_ATMOSPHERE_CUE` / `cityNoticeBoardAtmosphereCue` / pulse+haze helpers leftover disc on NoticeBoardBuilding over pad while on City (complements board landmark PL153.2 + unread flicker PL117.2; ≠ landmark slate / unread gold / plaza cyan / civic pad; tip ids unchanged; mute ok); `city-notice-board-atmosphere-cue-pl1872` |
| PL187.1 City vendor soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing stall mist via `CITY_VENDOR_ATMOSPHERE_CUE` / `cityVendorAtmosphereCue` / pulse+haze helpers leftover disc on VendorStall over pad while on City (complements stall landmark PL151.1 + Explore stall PL141.2 + commerce pad; ≠ identical landmark honey-copper / Explore amber / market mist / pad; prices unchanged; mute ok); `city-vendor-atmosphere-cue-pl1871` |
| PL186.2 City market-board soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing parchment mist via `CITY_MARKET_BOARD_ATMOSPHERE_CUE` / `cityMarketBoardAtmosphereCue` / pulse+haze helpers leftover disc on MarketBoardBuilding over pad while on City (complements board landmark PL150.2 + commerce pad PL117.1; ≠ landmark parchment / Explore stall / pad body; prices unchanged; mute ok); `city-market-board-atmosphere-cue-pl1862` |
| PL186.1 Portal soft atmosphere leftover | 2026-08-02 | Quiet deeper cool pulsing Free mist via `PORTAL_FREE_ATMOSPHERE_CUE` / `portalFreeAtmosphereCue` / pulse+haze helpers leftover disc on PortalBuilding while Free on non-Arena maps (complements Free landmark PL168.2 + threshold pulse PL144.1; ≠ identical Free cyan landmark disc / soft pulse / Exit; fares free; mute ok); `portal-free-atmosphere-cue-pl1861` |
| PL185.2 Map-chip idle soft glance leftover | 2026-08-02 | Quiet periodic TopBar map-chip breath via `MAP_CHIP_IDLE_GLANCE` / `shouldShowMapChipIdleGlance` / `topbar-map-chip--idle-glance` while walking with no panel open (complements arrive pulse PL40.2 + travel open accent PL144.2; arrive one-shot wins; clears when panel open; destinations / fares unchanged; min HUD; mute ok); `map-chip-idle-glance-pl1852` |
| PL185.1 City tutor-lane soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing tutor mist via `CITY_TUTOR_LANE_ATMOSPHERE_CUE` / `cityTutorLaneAtmosphereCue` / pulse+haze helpers on CityEnvironment leftover mist plane over existing tutor-lane strip (complements landmark strip PL129.1 + plaza mist PL182.1; ≠ landmark mint / plaza / scarce warm; claim rules / layouts SoT; mute ok); `city-tutor-lane-atmosphere-cue-pl1851` |
| PL184.2 Nearby-peer soft world reinforce leftover | 2026-08-02 | Brief soft sage rim via `NEARBY_PEER_WORLD_REINFORCE` / `shouldFlashNearbyPeerWorldReinforce` / `nearbyPeerWorldReinforceBackground` on GameHudShell when peer first enters interact range (complements floor ping PL15.2 + silhouette PL40.3 + exit fade PL134.2; enter-edge only; no nearby-list growth; presence rules unchanged; mute ok); `nearby-peer-world-reinforce-pl1842` |
| PL184.1 Visit-arrive soft world reinforce leftover | 2026-08-02 | Brief soft guest-teal rim via `VISIT_ARRIVE_WORLD_REINFORCE` / `shouldFlashVisitArriveWorldReinforce` / `visitArriveWorldReinforceBackground` on GameHudShell after visit arrive ok (complements Visiting · PL15.1 + host nameplate PL119.2 + first tip PL53.1; ≠ travel cyan / home-return meadow; visit rules unchanged; mute ok; fail silent); `visit-arrive-world-reinforce-pl1841` |
| PL183.2 Soft-war contest soft atmosphere leftover | 2026-08-02 | Quiet ember pulsing mist via `SOFT_WAR_CONTEST_ATMOSPHERE_CUE` / `softWarContestAtmosphereCue` / pulse+haze helpers on ClaimNodeBuilding leftover haze disc while soft-war contest open (complements contest pulse PL146.1 + deliver rim; scoring/window SoT; mute ok); `soft-war-contest-atmosphere-cue-pl1832` |
| PL183.1 Claim-node soft landmark leftover | 2026-08-02 | Kinship with PL163.2 `CLAIM_EMPTY_LANDMARK_CUE` grove mist on claim_node while unheld (complements held/contest + first tip; no second identical grove mist); claim rules SoT; mute ok; `claim-node-landmark-cue-pl1831` |
| PL182.2 City civic-pad soft landmark leftover | 2026-08-02 | Quiet cool civic haze/emissive via `CITY_CIVIC_PAD_LANDMARK_CUE` / `cityCivicPadLandmarkCue` / pulse+haze helpers on CityEnvironment CivicBlock pads while on City (complements plaza mist PL182.1 + deed desk PL165.1; layouts SoT; mute ok); `city-civic-pad-landmark-cue-pl1822` |
| PL182.1 City plaza soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing plaza mist via `CITY_PLAZA_ATMOSPHERE_CUE` / `cityPlazaAtmosphereCue` / pulse+haze helpers on CityEnvironment leftover mist plane over stone plaza floor (16×14) while on City (complements fountain PL125.1 + scarce-yard mist PL177.2; layouts SoT; mute ok); `city-plaza-atmosphere-cue-pl1821` |
| PL181.2 Homestead shed soft landmark leftover | 2026-08-02 | Quiet warm shed footing/haze/emissive via `HOMESTEAD_SHED_LANDMARK_CUE` / `homesteadShedLandmarkCue` / pulse+haze helpers on HomesteadYardShed sill + haze disc while lived at home (complements chimney PL118.1 + yard mist PL181.1; quiet on empty / visit; no station invent; layouts SoT; mute ok); `homestead-shed-landmark-cue-pl1812` |
| PL181.1 Lived homestead soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing hearth mist via `LIVED_HOMESTEAD_ATMOSPHERE_CUE` / `livedHomesteadAtmosphereCue` / pulse+haze helpers on HomesteadEnvironment leftover mist plane over lived home plot (complements chimney PL118.1 + lived path PL142.1; quiet on empty / visit; layouts SoT; mute ok); `lived-homestead-atmosphere-cue-pl1811` |
| PL180.2 Visit-leave soft world reinforce leftover | 2026-08-02 | Kinship with PL139.1 — asserts existing `VISIT_HOME_RETURN_WORLD_REINFORCE` / `shouldFlashVisitHomeReturnWorldReinforce` covers leave-home beside Home PL27.1 + visit mist PL175.2 + Your land tip PL114.2 (no second rim); visit rules unchanged; mute ok; fail silent; `visit-leave-world-reinforce-pl1802` |
| PL180.1 Mute soft world reinforce leftover | 2026-08-02 | Brief soft hush graphite rim via `MUTE_WORLD_REINFORCE` / `shouldFlashMuteWorldReinforce` / `muteWorldReinforceBackground` on GameHudShell when mute toggles on/off from settings (complements Muted/Unmuted PL37.2 + mute enable confirm PL125.2; both edges ≠ enable-only row; audio rules unchanged; mute ok); `mute-world-reinforce-pl1801` |
| PL179.2 Soft-refuse busy soft world reinforce leftover | 2026-08-02 | Brief soft dusty rose rim via `SOFT_REFUSE_BUSY_WORLD_REINFORCE` / `shouldFlashSoftRefuseBusyWorldReinforce` / `softRefuseBusyWorldReinforceBackground` on GameHudShell when scarce busy interact soft-refuses (same gate as Busy ephemeral PL42.1; ≠ free→busy coral PL166.1; contention unchanged; mute ok); `soft-refuse-busy-world-reinforce-pl1792` |
| PL179.1 Hunt-lose soft world reinforce leftover | 2026-08-02 | Brief soft cool trail-ash rim via `HUNT_LOSE_WORLD_REINFORCE` / `shouldFlashHuntLoseWorldReinforce` / `huntLoseWorldReinforceBackground` on GameHudShell after hunt lose ok (complements Lost · foe PL33.2 + hunt-win rim PL159.1; rates / XP unchanged; mute ok; fail silent); `hunt-lose-world-reinforce-pl1791` |
| PL178.2 Homestead empty meadow soft landmark leftover | 2026-08-02 | Quiet warm sunlit meadow haze/emissive via `EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE` / `emptyHomesteadMeadowLandmarkCue` / pulse+haze helpers on HomesteadEnvironment outer meadow floor + mist plane while yard empty (complements empty path cue + meadow contrast; layouts SoT; mute ok); `empty-homestead-meadow-landmark-cue-pl1782` |
| PL178.1 Explore canopy soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing canopy mist via `EXPLORE_CANOPY_ATMOSPHERE_CUE` / `exploreCanopyAtmosphereCue` / pulse+haze helpers on ForestEnvironment leftover mist plane over PL36.2 static wilds haze while on Explore (complements woodland/mines landmarks + wilds palette; spawns unchanged; mute ok); `explore-canopy-atmosphere-cue-pl1781` |
| PL177.2 City scarce-yard soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing shared-yard mist via `CITY_SCARCE_YARD_ATMOSPHERE_CUE` / `cityScarceYardAtmosphereCue` / pulse+haze helpers on CityEnvironment leftover mist plane over scarce yard floor while on City (complements station landmarks + Free/Busy pads; contention unchanged; mute ok); `city-scarce-yard-atmosphere-cue-pl1772` |
| PL177.1 Warrior arena soft atmosphere leftover | 2026-08-02 | Quiet warm pulsing arena mist via `WARRIOR_ARENA_ATMOSPHERE_CUE` / `warriorArenaAtmosphereCue` / pulse+haze helpers on WarriorEnvironment leftover mist plane over PL41.2 static haze while on Warrior (complements board landmark + enter/leave rims; stub / no balance invent; mute ok); `warrior-arena-atmosphere-cue-pl1771` |
| PL176.2 Homestead fence soft landmark cue leftover | 2026-08-02 | Quiet cool pewter fence-post haze/emissive via `HOMESTEAD_FENCE_LANDMARK_CUE` / `homesteadFenceLandmarkCue` / pulse+haze helpers on HomesteadEnvironment fence caps + corner haze discs while on player land (complements yard atmosphere + path cues; layouts SoT; mute ok); `homestead-fence-landmark-cue-pl1762` |
| PL176.1 Housing decor soft landmark cue leftover | 2026-08-02 | Quiet warm rosewood haze/emissive via `HOUSING_DECOR_LANDMARK_CUE` / `housingDecorLandmarkCue` / pulse+haze helpers on DecorPadBuilding lip/haze + planter rim + banner footing while on player land (complements tip + place rim; costs SoT; mute ok); `housing-decor-landmark-cue-pl1761` |
| PL175.2 Visit land soft atmosphere leftover | 2026-08-02 | Quiet cool pulsing visit mist via `VISIT_LAND_ATMOSPHERE_CUE` / `visitLandAtmosphereCue` / pulse+haze helpers on HomesteadEnvironment leftover mist plane while presence is visit (complements PL51.2 static haze + visit tip + leave cue; visit rules SoT; mute ok); `visit-land-atmosphere-cue-pl1752` |
| PL175.1 Explore thicket soft landmark cue leftover | 2026-08-02 | Quiet cool leaf-moss haze/emissive via `EXPLORE_THICKET_LANDMARK_CUE` / `exploreThicketLandmarkCue` / pulse+haze helpers on EdgeThicketMesh curb lips/haze while on Explore (complements hunt tip + ready cues; hunt rates SoT; mute ok); `explore-thicket-landmark-cue-pl1751` |
| PL174.2 Explore trail soft landmark cue leftover | 2026-08-02 | Quiet warm trail haze/emissive via `EXPLORE_TRAIL_LANDMARK_CUE` / `exploreTrailLandmarkCue` / pulse+haze helpers on GameTrailMesh curb lips/haze while on Explore (complements hunt tip + ready cues; hunt rates SoT; mute ok); `explore-trail-landmark-cue-pl1742` |
| PL174.1 City kitchen soft landmark cue leftover | 2026-08-02 | Quiet warm hearth haze/emissive via `CITY_KITCHEN_LANDMARK_CUE` / `cityKitchenLandmarkCue` / pulse+haze helpers on KitchenBuilding pot lip/haze while on City (complements craft working + Free/Busy pads; recipes SoT; mute ok); `city-kitchen-landmark-cue-pl1741` |
| PL173.2 City mill soft landmark cue leftover | 2026-08-02 | Quiet cool grain haze/emissive via `CITY_MILL_LANDMARK_CUE` / `cityMillLandmarkCue` / pulse+haze helpers on MillBuilding haze + MillKitMeshes band while on City (complements craft working + Free/Busy pads; recipes SoT; mute ok); `city-mill-landmark-cue-pl1732` |
| PL173.1 City forge soft landmark cue leftover | 2026-08-02 | Quiet warm ember haze/emissive via `CITY_FORGE_LANDMARK_CUE` / `cityForgeLandmarkCue` / pulse+haze helpers on ForgeBuilding firebox lip/haze while on City (complements craft working + Free/Busy pads; recipes SoT; mute ok); `city-forge-landmark-cue-pl1731` |
| PL172.2 City workshop soft landmark cue leftover | 2026-08-02 | Quiet warm timber haze/emissive via `CITY_WORKSHOP_LANDMARK_CUE` / `cityWorkshopLandmarkCue` / pulse+haze helpers on WorkshopBuilding plank stack/haze while on City (complements craft working + Free/Busy pads; recipes SoT; mute ok); `city-workshop-landmark-cue-pl1722` |
| PL172.1 City ore-node soft landmark cue leftover | 2026-08-02 | Quiet cool mineral haze/emissive via `CITY_ORE_NODE_LANDMARK_CUE` / `cityOreNodeLandmarkCue` / pulse+haze helpers on OreNodeMesh rock/haze while on City (complements ready + Free/Busy pads; yields SoT; mute ok); `city-ore-node-landmark-cue-pl1721` |
| PL171.2 City tree-stump soft landmark cue leftover | 2026-08-02 | Quiet cool woodland haze/emissive via `CITY_TREE_STUMP_LANDMARK_CUE` / `cityTreeStumpLandmarkCue` / pulse+haze helpers on TreeStumpBuilding cut-top/body/haze while on City (complements gather ready + Free/Busy pads; yields SoT; mute ok); `city-tree-stump-landmark-cue-pl1712` |
| PL171.1 City crop-plot soft landmark cue leftover | 2026-08-02 | Quiet warm soil haze/emissive via `CITY_CROP_PLOT_LANDMARK_CUE` / `cityCropPlotLandmarkCue` / pulse+haze helpers on CropFieldMesh soil bed/haze while on City (complements ready pulse + Free/Busy pads; grow times SoT; mute ok); `city-crop-plot-landmark-cue-pl1711` |
| PL170.2 City animal-pen soft landmark cue leftover | 2026-08-02 | Seeded scarce city `animal_pen` (slot 30) + quiet warm hay haze/emissive via `CITY_ANIMAL_PEN_LANDMARK_CUE` / `cityAnimalPenLandmarkCue` / pulse+haze helpers on AnimalPenBuilding trough/haze while on City; practice map + tips + Content Lock; soft presence contention; yields SoT; `city-animal-pen-landmark-cue-pl1702`, `city-scarce-animal-pen-contention-pl1702` |
| PL170.1 City alchemy-bench soft landmark cue leftover | 2026-08-02 | Quiet cool tonic haze/emissive via `CITY_ALCHEMY_BENCH_LANDMARK_CUE` / `cityAlchemyBenchLandmarkCue` / pulse+haze helpers on AlchemyBenchBuilding burner lip/haze while on City (complements brew cues + Free/Busy pads; recipes unchanged; mute ok); `city-alchemy-bench-landmark-cue-pl1701` |
| PL169.2 City loom soft landmark cue leftover | 2026-08-02 | Quiet warm thread haze/emissive via `CITY_LOOM_LANDMARK_CUE` / `cityLoomLandmarkCue` / pulse+haze helpers on LoomBuilding treadle/haze while on City (complements weave craft cues + Free/Busy pads; recipes unchanged; mute ok); `city-loom-landmark-cue-pl1692` |
| PL169.1 City fishing-dock soft landmark cue leftover | 2026-08-02 | Quiet cool water haze/emissive via `CITY_FISHING_DOCK_LANDMARK_CUE` / `cityFishingDockLandmarkCue` / pulse+haze helpers on FishingDockBuilding piles/haze while on City (complements dock tip + Free/Busy pads; catch rates unchanged; mute ok); `city-fishing-dock-landmark-cue-pl1691` |
| PL168.2 Portal Free soft landmark cue leftover | 2026-08-02 | Quiet cool Free cyan haze/emissive via `PORTAL_FREE_LANDMARK_CUE` / `portalFreeLandmarkCue` / pulse+haze helpers on PortalBuilding footing/haze while Free on non-Arena maps (complements Free portal pulse PL144.1 + travel rim PL164.1; Arena keeps Exit pulse PL147.2; fares free; mute ok); `portal-free-landmark-cue-pl1682` |
| PL168.1 Wallet-disconnect soft world reinforce leftover | 2026-08-02 | Brief soft disconnect ash-slate rim via `WALLET_DISCONNECT_WORLD_REINFORCE` / `shouldFlashWalletDisconnectWorldReinforce` / `walletDisconnectWorldReinforceBackground` on GameHudShell after wallet disconnect ok (complements Wallet disconnected ephemeral PL33.3; core loops stay wallet-free; mute ok; fail silent; no NFT combat); `wallet-disconnect-world-reinforce-pl1681` |
| PL167.2 Wallet-link soft world reinforce leftover | 2026-08-02 | Brief soft link-slate rim via `WALLET_LINK_WORLD_REINFORCE` / `shouldFlashWalletLinkWorldReinforce` / `walletLinkWorldReinforceBackground` on GameHudShell after wallet link ok (complements Wallet linked ephemeral PL33.3; core loops stay wallet-free; mute ok; fail silent; no NFT combat); `wallet-link-world-reinforce-pl1672` |
| PL167.1 Deed-mint soft world reinforce leftover | 2026-08-02 | Brief soft mint-slate rim via `DEED_MINT_WORLD_REINFORCE` / `shouldFlashDeedMintWorldReinforce` / `deedMintWorldReinforceBackground` on GameHudShell after mock mint ok (complements Deed minted ephemeral PL33.3 + desk landmark; stub path unchanged; mute ok; fail silent; no NFT combat); `deed-mint-world-reinforce-pl1671` |
| PL166.2 Deed-claim soft world reinforce leftover | 2026-08-02 | Brief soft system-slate rim via `DEED_CLAIM_WORLD_REINFORCE` / `shouldFlashDeedClaimWorldReinforce` / `deedClaimWorldReinforceBackground` on GameHudShell after cosmetic deed claim ok (complements Deed claimed ephemeral PL33.3 + desk landmark PL165.1; wallet path B unchanged; mute ok; fail silent; no NFT combat); `deed-claim-world-reinforce-pl1662` |
| PL166.1 Scarce-busy soft world reinforce leftover | 2026-08-02 | Brief soft Busy coral rim via `SCARCE_BUSY_WORLD_REINFORCE` / `shouldFlashScarceBusyWorldReinforce` / `scarceBusyWorldReinforceBackground` on GameHudShell when scarce pad edges free→busy (same gate as peer pulse PL115.1; complements Free settle rim PL165.2; contention unchanged; mute ok); `scarce-busy-world-reinforce-pl1661` |
| PL165.2 Scarce-Free-settle soft world reinforce leftover | 2026-08-02 | Brief soft Free cyan rim via `SCARCE_FREE_SETTLE_WORLD_REINFORCE` / `shouldFlashScarceFreeSettleWorldReinforce` / `scarceFreeSettleWorldReinforceBackground` on GameHudShell when scarce pad settles busy→Free (same gate as pad settle PL119.1; complements sticky Free/Busy; contention unchanged; mute ok); `scarce-free-settle-world-reinforce-pl1652` |
| PL165.1 Deed-desk soft landmark cue leftover | 2026-08-02 | Civic atmosphere deed desk + quiet cool system-slate haze/emissive via `CITY_DEED_DESK_LANDMARK_CUE` / `cityDeedDeskLandmarkCue` / pulse+haze helpers on CityEnvironment (complements open accent PL55.2; label `Deed · B`; no BuildingType / E interact; wallet path B unchanged; no NFT combat); `deed-desk-landmark-cue-pl1651` |
| PL164.2 Day-night-enable soft world reinforce leftover | 2026-08-02 | Brief soft dawn-slate rim via `DAY_NIGHT_ENABLE_WORLD_REINFORCE` / `shouldFlashDayNightEnableWorldReinforce` / `dayNightEnableWorldReinforceBackground` on GameHudShell when enabling day/night from settings (same gate as confirm PL130.1; complements phase rim PL160.2; clocks unchanged; mute ok; disable quiet); `day-night-enable-world-reinforce-pl1642` |
| PL164.1 Travel-arrive soft world reinforce leftover | 2026-08-02 | Brief soft Free cyan rim via `TRAVEL_ARRIVE_WORLD_REINFORCE` / `shouldFlashTravelArriveWorldReinforce` / `travelArriveWorldReinforceBackground` on GameHudShell after map travel Arrived (complements Arrived dest PL115.2 + Free portal pulse PL144.1; fares free; mute ok; fail silent); `travel-arrive-world-reinforce-pl1641` |
| PL163.2 Claim-empty soft landmark cue leftover | 2026-08-02 | Quiet cool grove mist haze/emissive via `CLAIM_EMPTY_LANDMARK_CUE` / `claimEmptyLandmarkCue` / pulse+haze helpers on ClaimNodeBuilding footing/haze while unheld / no contest (complements tip PL80.1 + held PL145.1 + contest PL146.1; claim / war rules unchanged; mute ok); `claim-empty-landmark-cue-pl1632` |
| PL163.1 Expand-pad soft landmark cue leftover | 2026-08-02 | Quiet warm field-gold haze/emissive via `EXPAND_PAD_LANDMARK_CUE` / `expandPadLandmarkCue` / pulse+haze helpers on ExpandPadMesh lip/haze while pad visible (complements short-afford pulse PL123.1 + tip PL72.1; ≠ short amber / flash gold / afford green; layouts / costs unchanged; mute ok); `expand-pad-landmark-cue-pl1631` |
| PL162.2 Expand-field soft world reinforce leftover | 2026-08-02 | Brief soft field-gold rim via `EXPAND_FIELD_WORLD_REINFORCE` / `shouldFlashExpandFieldWorldReinforce` / `expandFieldWorldReinforceBackground` on GameHudShell after expand ok (complements Expanded PL20.3 + field-gold pad PL137.2; costs / slots unchanged; mute ok; fail silent); `expand-field-world-reinforce-pl1622` |
| PL162.1 Station-upgrade soft world reinforce leftover | 2026-08-02 | Brief soft warm copper rim via `STATION_UPGRADE_WORLD_REINFORCE` / `shouldFlashStationUpgradeWorldReinforce` / `stationUpgradeWorldReinforceBackground` on GameHudShell after upgrade ok (complements Upgraded PL48.1 + copper pad PL137.1; costs / tiers unchanged; mute ok; fail silent); `station-upgrade-world-reinforce-pl1621` |
| PL161.2 Fish-catch soft world reinforce leftover | 2026-08-02 | Brief soft cool water rim via `FISH_CATCH_WORLD_REINFORCE` / `shouldFlashFishCatchWorldReinforce` / `fishCatchWorldReinforceBackground` on GameHudShell after fish catch ok (complements Caught + cool splash PL132.1 + ready shimmer PL118.2; catch rates unchanged; mute ok; fail silent); `fish-catch-world-reinforce-pl1612` |
| PL161.1 Gather-success soft world reinforce leftover | 2026-08-02 | Brief soft mint-lime rim via `GATHER_SUCCESS_WORLD_REINFORCE` / `shouldFlashGatherSuccessWorldReinforce` / `gatherSuccessWorldReinforceBackground` on GameHudShell after gather ok on stump/ore/pen (complements Chopped/Mined/Collected PL43.1 + mint pad PL131.2; yields / cooldowns unchanged; mute ok; fail silent); `gather-success-world-reinforce-pl1611` |
| PL160.2 Day-phase soft world reinforce leftover | 2026-08-02 | Brief soft twilight-sky rim via `DAY_PHASE_WORLD_REINFORCE` / `shouldFlashDayPhaseWorldReinforce` / `dayPhaseWorldReinforceBackground` on GameHudShell when cosmetic phase edges Dawn/Dusk/Night (same gate as TopBar PL57.2; Day / hydrate / cycle-off quiet; complements edge haze PL122.2; clocks unchanged; mute ok); `day-phase-world-reinforce-pl1602` |
| PL160.1 Empty-land build-board soft landmark cue leftover | 2026-08-02 | Quiet warm timber haze/emissive via `EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE` / `emptyLandBuildBoardLandmarkCue` / pulse+haze helpers on BuildBoardBuilding footing/haze while beacon mode (complements beacon PL3.1 + tip PL52.1; soft quiet after first station; layouts / slots unchanged; mute ok); `empty-land-build-board-landmark-cue-pl1601` |
| PL159.2 Craft-complete soft world reinforce leftover | 2026-08-02 | Brief soft sprout-olive rim via `CRAFT_COMPLETE_WORLD_REINFORCE` / `shouldFlashCraftCompleteWorldReinforce` / `craftCompleteWorldReinforceBackground` on GameHudShell after craft ok (complements olive bench pad PL131.1 + inventory pickup PL128.2; recipes unchanged; mute ok; fail silent); `craft-complete-world-reinforce-pl1592` |
| PL159.1 Hunt-win soft world reinforce leftover | 2026-08-02 | Brief soft warm trail-gold rim via `HUNT_WIN_WORLD_REINFORCE` / `shouldFlashHuntWinWorldReinforce` / `huntWinWorldReinforceBackground` on GameHudShell after hunt win ok (complements Won · foe PL33.2 + trail ready cues; lose quiet; rates / XP unchanged; mute ok; fail silent); `hunt-win-world-reinforce-pl1591` |
| PL158.2 Guild-leave soft world reinforce | 2026-08-02 | Brief soft cool membership-release mist rim via `GUILD_LEAVE_WORLD_REINFORCE` / `shouldFlashGuildLeaveWorldReinforce` / `guildLeaveWorldReinforceBackground` on GameHudShell after guild leave ok (complements Left PL50.2 + membership open PL140.2; ranks unchanged; mute ok; fail silent); `guild-leave-world-reinforce-pl1582` |
| PL158.1 Guild-create soft world reinforce | 2026-08-02 | Brief soft warm founding crest teal rim via `GUILD_CREATE_WORLD_REINFORCE` / `shouldFlashGuildCreateWorldReinforce` / `guildCreateWorldReinforceBackground` on GameHudShell after guild create ok (complements Created PL50.1 + membership open PL140.2; ranks unchanged; mute ok; fail silent); `guild-create-world-reinforce-pl1581` |
| PL157.2 Mail-cancel soft world reinforce | 2026-08-02 | Brief soft cool dusty parchment-ash rim via `MAIL_CANCEL_WORLD_REINFORCE` / `shouldFlashMailCancelWorldReinforce` / `mailCancelWorldReinforceBackground` on GameHudShell after mail cancel ok (complements Parcel cancelled PL28.2 + send/claim rims PL149.1 / PL152.2; escrow unchanged; mute ok; fail silent); `mail-cancel-world-reinforce-pl1572` |
| PL157.1 Trade-cancel soft world reinforce | 2026-08-02 | Brief soft cool release mist rim via `TRADE_CANCEL_WORLD_REINFORCE` / `shouldFlashTradeCancelWorldReinforce` / `tradeCancelWorldReinforceBackground` on GameHudShell after outgoing trade cancel ok (complements Cancelled PL62.1 + accept rim PL143.1; incoming reject quiet; escrow unchanged; mute ok; fail silent); `trade-cancel-world-reinforce-pl1571` |
| PL156.2 Market-cancel soft world reinforce | 2026-08-02 | Brief soft cool dusty board-ash rim via `MARKET_CANCEL_WORLD_REINFORCE` / `shouldFlashMarketCancelWorldReinforce` / `marketCancelWorldReinforceBackground` on GameHudShell after market cancel ok (complements Cancelled listing cue + list rim PL138.1; escrow / fees unchanged; mute ok; fail silent); `market-cancel-world-reinforce-pl1562` |
| PL156.1 Vendor-sell soft world reinforce leftover | 2026-08-02 | Brief soft warm stall amber-copper rim via `VENDOR_SELL_WORLD_REINFORCE` / `shouldFlashVendorSellWorldReinforce` / `vendorSellWorldReinforceBackground` on GameHudShell after vendor sell ok (complements Sold PL43.2 + coins-gain rim PL126.2; prices unchanged; mute ok; fail silent); `vendor-sell-world-reinforce-pl1561` |
| PL155.2 Market-buy soft world reinforce | 2026-08-02 | Brief soft warm parchment-gold rim via `MARKET_BUY_WORLD_REINFORCE` / `shouldFlashMarketBuyWorldReinforce` / `marketBuyWorldReinforceBackground` on GameHudShell after market buy ok (complements Bought + list rim PL138.1; escrow / fees unchanged; mute ok; fail silent); `market-buy-world-reinforce-pl1552` |
| PL155.1 Arena board soft landmark cue leftover | 2026-08-02 | Quiet warm clay-amber plaque haze/emissive via `ARENA_BOARD_LANDMARK_CUE` / `arenaBoardLandmarkCue` / pulse+haze helpers on ArenaBoardBuilding footing/haze while on Warrior (complements walk-up pulse PL129.2 + tip; ≠ face red / ring gold; layouts unchanged; stub / no balance invent; mute ok); `arena-board-landmark-cue-pl1551` |
| PL154.2 Unequip soft world reinforce | 2026-08-02 | Brief soft cool release-grip mist rim via `TOOL_UNEQUIP_WORLD_REINFORCE` / `shouldFlashToolUnequipWorldReinforce` / `toolUnequipWorldReinforceBackground` on GameHudShell after tool unequip ok (complements Unequipped PL20.2 + equip rim PL152.1; durability unchanged; mute ok; fail silent); `tool-unequip-world-reinforce-pl1542` |
| PL154.1 Empty-homestead path soft cue leftover | 2026-08-02 | Quiet cooler path emissive via `EMPTY_HOMESTEAD_PATH_CUE` / `emptyHomesteadPathCue` / pulse helpers on existing yard path/cross in HomesteadEnvironment when yard `empty` (complements lived warm path PL142.1 + empty meadow PL114.1; layouts / slots unchanged; mute ok); `empty-homestead-path-cue-pl1541` |
| PL153.2 Notice-board soft landmark cue | 2026-08-02 | Quiet cool civic slate haze/emissive via `CITY_NOTICE_BOARD_LANDMARK_CUE` / `cityNoticeBoardLandmarkCue` / pulse+haze helpers on NoticeBoardBuilding while on City (complements unread flicker PL117.2 + tip PL36.1; ≠ unread gold / plaza cyan; layouts / tip ids unchanged; no board invent); `notice-board-landmark-cue-pl1532` |
| PL153.1 Vendor-buy soft world reinforce | 2026-08-02 | Brief soft warm stall honey-copper rim via `VENDOR_BUY_WORLD_REINFORCE` / `shouldFlashVendorBuyWorldReinforce` / `vendorBuyWorldReinforceBackground` on GameHudShell after vendor buy ok (complements Bought PL43.3 + coins-gain sell rim PL126.2; prices unchanged; mute ok; fail silent); `vendor-buy-world-reinforce-pl1531` |
| PL152.2 Mail-claim soft world reinforce | 2026-08-02 | Brief soft cool sage-parchment rim via `MAIL_CLAIM_WORLD_REINFORCE` / `shouldFlashMailClaimWorldReinforce` / `mailClaimWorldReinforceBackground` on GameHudShell after mail claim ok (complements Parcel claimed PL17.2 + send rim PL149.1; escrow unchanged; mute ok; fail silent); `mail-claim-world-reinforce-pl1522` |
| PL152.1 Equip soft world reinforce | 2026-08-02 | Brief soft cool ready-grip steel rim via `TOOL_EQUIP_WORLD_REINFORCE` / `shouldFlashToolEquipWorldReinforce` / `toolEquipWorldReinforceBackground` on GameHudShell after tool equip ok (complements Equipped PL20.2 + repair rim PL150.1; unequip rim PL154.2; durability unchanged; mute ok; fail silent); `tool-equip-world-reinforce-pl1521` |
| PL151.2 Crop-harvest soft world reinforce | 2026-08-02 | Brief soft wheat-gold rim via `CROP_HARVEST_WORLD_REINFORCE` / `shouldFlashCropHarvestWorldReinforce` / `cropHarvestWorldReinforceBackground` on GameHudShell after harvest ok (complements plant sprout PL127.2 + ready rim PL142.2 + Harvested; grow / yield unchanged; mute ok; fail silent); `crop-harvest-world-reinforce-pl1512` |
| PL151.1 City vendor soft landmark cue | 2026-08-02 | Quiet warm hub honey-copper stall haze/emissive via `CITY_VENDOR_LANDMARK_CUE` / `cityVendorLandmarkCue` / pulse+haze helpers on VendorStall while on City (complements Explore stall PL141.2 + market board PL150.2 + commerce pad PL117.1; ≠ Explore amber / market parchment; layouts / prices unchanged; no stall invent); `city-vendor-landmark-cue-pl1511` |
| PL150.2 City market board soft landmark cue | 2026-08-02 | Quiet warm parchment-gold listing haze/emissive via `CITY_MARKET_BOARD_LANDMARK_CUE` / `cityMarketBoardLandmarkCue` / pulse+haze helpers on MarketBoardBuilding while on City (complements tip PL59.1 + commerce pad PL117.1; ≠ Explore stall amber; layouts / prices unchanged; no board invent); `city-market-board-landmark-cue-pl1502` |
| PL150.1 Tool-repair soft world reinforce | 2026-08-02 | Brief soft warm forge-pewter rim via `TOOL_REPAIR_WORLD_REINFORCE` / `shouldFlashToolRepairWorldReinforce` / `toolRepairWorldReinforceBackground` on GameHudShell after tool repair ok (complements Repaired PL25.1 + tool-low vignette clear PL132.2; mats unchanged; mute ok; fail silent); `tool-repair-world-reinforce-pl1501` |
| PL149.2 Decor-place soft world reinforce | 2026-08-02 | Brief soft rosewood blush rim via `DECOR_PLACE_WORLD_REINFORCE` / `shouldFlashDecorPlaceWorldReinforce` / `decorPlaceWorldReinforceBackground` on GameHudShell after decor place ok (complements decor SFX + Decor placed PL16.2; costs / slots unchanged; mute ok; fail silent); `decor-place-world-reinforce-pl1492` |
| PL149.1 Mail-send soft world reinforce | 2026-08-02 | Brief soft warm parchment-gold rim via `MAIL_SEND_WORLD_REINFORCE` / `shouldFlashMailSendWorldReinforce` / `mailSendWorldReinforceBackground` on GameHudShell after mail send ok (complements Parcel sent PL28.2 + mail pending glance PL133.1; escrow unchanged; mute ok; fail silent); `mail-send-world-reinforce-pl1491` |
| PL148.2 Invite-accept soft world reinforce | 2026-08-02 | Brief soft welcome kinship rim via `INVITE_ACCEPT_WORLD_REINFORCE` / `shouldFlashInviteAcceptWorldReinforce` / `inviteAcceptWorldReinforceBackground` on GameHudShell after guild join-by-code ok (complements Joined PL50.1 + membership open PL140.2; invite / rank rules unchanged; mute ok; fail silent; no invite column); `invite-accept-world-reinforce-pl1482` |
| PL148.1 Guild-bank withdraw soft confirm leftover | 2026-08-02 | Brief quiet steel-slate edge rim via `GUILD_BANK_WITHDRAW_WORLD_REINFORCE` / `shouldFlashGuildBankWithdrawWorldReinforce` / `guildBankWithdrawWorldReinforceBackground` on GameHudShell after bank withdraw ok (complements Withdrew PL48.3 + deposit rim PL143.2; bank caps unchanged; mute ok; fail silent); `guild-bank-withdraw-world-reinforce-pl1481` |
| PL147.2 Arena exit-portal soft pulse leftover | 2026-08-02 | Quiet warmer Exit threshold emissive sine while interact-highlighted via `PORTAL_ARENA_EXIT_SOFT_PULSE` / `portalArenaExitSoftPulseEnvelope` / emissive helpers on PortalBuilding when `isWarriorLandKind` (complements Exit soft PL37.1 + cool Free cyan PL144.1; fare-free unchanged; mute ok); `portal-arena-exit-soft-pulse-pl1472` |
| PL147.1 Arena leave soft world reinforce | 2026-08-02 | Brief soft dusty amber rim via `ARENA_LEAVE_WORLD_REINFORCE` / `shouldFlashArenaLeaveWorldReinforce` / `isLeavingWarriorMap` / `arenaLeaveWorldReinforceBackground` on GameHudShell when leaving Warrior (complements enter PL145.2 + Arrived dest PL115.2; stub / no balance invent; mute ok); `arena-leave-world-reinforce-pl1471` |
| PL146.2 Soft-war deliver soft world reinforce | 2026-08-02 | Brief soft ember rim via `SOFT_WAR_DELIVER_WORLD_REINFORCE` / `shouldFlashSoftWarDeliverWorldReinforce` / `softWarDeliverWorldReinforceBackground` on GameHudShell after wood deliver scores (complements Delivered · N PL31.2 + contest pulse PL146.1; scoring / window unchanged; mute ok; fail silent); `soft-war-deliver-world-reinforce-pl1462` |
| PL146.1 Claim soft-war contest world cue | 2026-08-02 | Quiet warm-ember banner/footing emissive sine while `contestEndsAt` future via `CLAIM_NODE_CONTEST_SOFT_CUE` / `claimNodeContestSoftCueEnvelope` / emissive helpers on ClaimNodeBuilding (complements held PL145.1 + Soft war PL31.2; tip gold wins; contest > held; soft-war rules unchanged; mute ok); `claim-node-contest-soft-cue-pl1461` |
| PL145.2 Arena enter soft world reinforce | 2026-08-02 | Brief soft warm arena edge rim via `ARENA_ENTER_WORLD_REINFORCE` / `shouldFlashArenaEnterWorldReinforce` / `arenaEnterWorldReinforceBackground` on GameHudShell when entering Warrior map (complements Arrived PL115.2 + first Warrior tip PL53.2 + warm haze PL41.2; stub / no balance invent; mute ok); `arena-enter-world-reinforce-pl1452` |
| PL145.1 Claim-node held soft cue leftover | 2026-08-02 | Quiet ownership-green banner/footing emissive sine while `claim.isYours` via `CLAIM_NODE_HELD_SOFT_CUE` / `claimNodeHeldSoftCueEnvelope` / emissive helpers on ClaimNodeBuilding (complements tip PL80.1 + soft-war PL31.2; tip gold wins briefly; claim rules unchanged; mute ok); `claim-node-held-soft-cue-pl1451` |
| PL144.2 Travel panel open soft map accent | 2026-08-02 | Quiet open chrome keyed to current-map chip via `TRAVEL_PANEL_MAP_OPEN_ACCENT` / `shouldPlayTravelMapOpenAccent` / `travelPanelMapOpenAccentClassName` + style on TravelPanel (`travel-panel--map-open-accent`; kinship with destination map-tints PL133.2; complements Travel open PL24.3; destinations / fares unchanged; mute ok); `travel-panel-map-open-accent-pl1442` |
| PL144.1 Portal free-travel soft pulse leftover | 2026-08-02 | Quiet cooler threshold emissive sine while interact-highlighted via `PORTAL_FREE_TRAVEL_SOFT_PULSE` / `portalFreeTravelSoftPulseEnvelope` / emissive helpers on PortalBuilding (complements veil Free pulse PL120.2 + Travel · free PL37.1 + tip PL42.2; fare-free unchanged; mute ok); `portal-free-travel-soft-pulse-pl1441` |
| VA5.4 Cue-pad flash base materials | 2026-08-02 | `cuePadFlashMaterials` land+water disc PBR under gather/fish/expand/build/craft/upgrade envelopes; pad RGB / peaks / helpers unchanged; `world-object-materials-va54` |
| VA5.3 Crop growth progress bar materials | 2026-08-02 | `cropGrowthProgressBarMaterials` + CropFieldMesh fill/frame lip PBR; growMs / ready pulse / growing sway / timer badge unchanged; `world-object-materials-va53` |
| VA5.2 Avatar ground shadow disc materials | 2026-08-02 | `avatarGroundShadowMaterials` + AvatarKit soft disc PBR (replaces meshBasic); silhouette / palette / PL122.1 map tint unchanged; `world-object-materials-va52` |
| VA5.1 Remote presence halo/ping materials | 2026-08-02 | `remotePresenceKitMaterials` + halo/ping PBR + quiet lip; PRESENCE_PEER_SILHOUETTE / NEARBY_PEER_PING RGB + PL134.2 exit fade unchanged; `world-object-materials-va51` |
| VA4.4 Warrior arena floors + HighlightRing | 2026-08-02 | `warriorArenaFloorKitMaterials` + ring lip PBR; `interactHighlightRingMaterials` SoT wired in BuildingMesh + ResourceMeshes; WARRIOR_ARENA_VISUAL hexes + select gold cue unchanged; `world-object-materials-va44` |
| VA4.3 Explore wilds floor materials | 2026-08-02 | `exploreWildsFloorKitMaterials` + entry/hunt path lips PBR; EXPLORE_WILDS_VISUAL / EXPLORE_SECTIONS hexes + woodland/mines landmark emissive+haze unchanged; `world-object-materials-va43` |
| VA4.2 Homestead yard floor materials | 2026-08-02 | `homesteadYardFloorKitMaterials` + path edge lips PBR; empty/lived/visit hexes + PL142.1 path emissive unchanged; `world-object-materials-va42` |
| VA4.1 City hub floor materials | 2026-08-02 | `cityHubFloorKitMaterials` + plaza/scarce curb lips PBR; CITY_HUB_VISUAL hexes + scarce-vs-civic contrast unchanged; `world-object-materials-va41` |
| VA3.4 Civic block silhouette materials | 2026-08-02 | `civicBlockKitMaterials` + sill / eaves trim PBR; CITY_HUB_VISUAL cool civic pad + scarce contrast + door/window emissive unchanged; `world-object-materials-va34` |
| VA3.3 Avatar farmer kit materials | 2026-08-02 | `avatarFarmerKitMaterials` + boot cuffs / belt / tool ferrule PBR; resolveAvatarKitColors + PL122.1 vest/hatBand tint + remotes palette + silhouette lock unchanged; `world-object-materials-va33` |
| VA3.2 Claim node kit materials | 2026-08-02 | `claimNodeKitMaterials` + footing ring / finial PBR; yours/held/unclaimed banner + walk-up tip emissives + CLAIM_NODE produce SoT unchanged; `world-object-materials-va32` |
| VA3.1 Expand pad kit materials | 2026-08-02 | `expandPadKitMaterials` + pad lip / post caps PBR; EXPAND_PAD_AFFORD_CUE colors + short pulse + walk-up tip unchanged; `world-object-materials-va31` |
| VA2.6 Plaza fountain + warrior arena prop kit materials | 2026-08-02 | `plazaFountainKitMaterials` / `warriorArenaPropKitMaterials` + footing/lip/water disc + post caps; CITY_PLAZA_LANDMARK_CUE pulse + WARRIOR_ARENA_VISUAL floors/plaque unchanged; `world-object-materials-va26` |
| VA2.5 Hunt trail + thicket path/creature kit materials | 2026-08-02 | `huntTrailKitMaterials` + path curb / brush trunks / underbrush / hide+horn PBR; HUNT_TRAIL_WAYFINDING path/creature colors + ready cues unchanged; `world-object-materials-va25` |
| VA2.4 Tutor NPC + housing decor kit materials | 2026-08-02 | `tutorNpcKitMaterials` / `housingDecorPadKitMaterials` / planter / banner + boots / lip / rim / finial PBR; cloak colors + claim pads / tips unchanged; `world-object-materials-va24` |
| VA2.3 Notice / build / arena plaque kit materials | 2026-08-02 | `noticeBoardKitMaterials` / `buildBoardKitMaterials` / `arenaBoardKitMaterials` + caps/trim/crossbeam/band articulation; unread/beacon/pulse emissives + WARRIOR_ARENA_VISUAL colors unchanged; `world-object-materials-va23` |
| VA2.2 Vendor stall + market board commerce kit materials | 2026-08-02 | `vendorStallKitMaterials` / `marketBoardKitMaterials` + VendorStall apron / MarketBoard post caps; commerce pads / lantern / prices unchanged; `world-object-materials-va22` |
| VA2.1 Travel portal kit materials | 2026-08-02 | `portalKitMaterials` + PortalBuilding footings/bands/threshold/keystone PBR; MAP_IDENTITY tint RGB + Free pulse unchanged; `world-object-materials-va21` |
| PL143.2 Guild-bank deposit soft confirm leftover | 2026-08-02 | Brief quiet membership-blue edge rim via `GUILD_BANK_DEPOSIT_WORLD_REINFORCE` / `shouldFlashGuildBankDepositWorldReinforce` / `guildBankDepositWorldReinforceBackground` on GameHudShell after bank deposit ok (complements Deposited PL48.2 + membership open PL140.2; bank caps unchanged; mute ok; fail silent); `guild-bank-deposit-world-reinforce-pl1432` |
| PL143.1 Trade-accept soft world reinforce | 2026-08-02 | Brief soft handshake sage edge rim via `TRADE_ACCEPT_WORLD_REINFORCE` / `shouldFlashTradeAcceptWorldReinforce` / `tradeAcceptWorldReinforceBackground` on GameHudShell after trade accept ok (complements Trade open PL29.1 + Trade accepted PL18.2; escrow / rules unchanged; mute ok; fail silent); `trade-accept-world-reinforce-pl1431` |
| PL142.2 Crop-ready soft world leftover | 2026-08-02 | Brief quiet harvest lime/gold edge rim via `CROP_READY_WORLD_REINFORCE` / `shouldFlashCropReadyWorldReinforce` / `cropReadyWorldReinforceBackground` on GameHudShell when a plot edges into ready (same gate as Ready soft PL60.1; complements ready pad pulse PL12.1; ≠ plant sprout rim PL127.2; grow timers unchanged; mute ok); `crop-ready-world-reinforce-pl1422` |
| PL142.1 Homestead lived-path soft cue | 2026-08-02 | Quiet warmer path emissive via `LIVED_HOMESTEAD_PATH_CUE` / `livedHomesteadPathCue` / envelope helpers on existing yard path/cross in HomesteadEnvironment when yard `lived` (complements chimney PL118.1 + empty meadow PL114.1; layouts / slots unchanged; empty quiet); `lived-homestead-path-cue-pl1421` |
| PL141.2 Explore vendor soft landmark cue | 2026-08-02 | Quiet warm stall haze/emissive via `EXPLORE_VENDOR_LANDMARK_CUE` / `exploreVendorLandmarkCue` / envelope helpers on existing Explore vendor_stall pad+lantern in VendorStall (complements tip PL59.2 + premium glow PL116.2 + commerce pad PL117.1; off Explore quiet; prices / layouts unchanged; no stall invent); `explore-vendor-landmark-cue-pl1412` |
| PL141.1 Explore mines soft landmark cue | 2026-08-02 | Quiet cooler stone emissive + haze via `EXPLORE_MINES_LANDMARK_CUE` / `exploreMinesLandmarkCue` / envelope helpers on existing mines floor in ForestEnvironment (complements woodland PL140.1 + hunt warmth + section floors PL4.2; layouts / spawns unchanged; no station invent); `explore-mines-landmark-cue-pl1411` |
| PL140.2 Guild panel soft open accent | 2026-08-02 | Quiet cooler membership open accent via `shouldPlayGuildMembershipOpenAccent` / `guild-panel--member-open-accent` when G opens while in a guild (complements Created/Joined PL50.1 + generic PL46.1 gold for non-members; guild rules unchanged; mute ok; min HUD); `guild-membership-open-accent-pl1402` |
| PL140.1 Explore section soft landmark cue | 2026-08-02 | Quiet cooler teal-mist emissive + haze via `EXPLORE_SECTION_LANDMARK_CUE` / `exploreSectionLandmarkCue` / envelope helpers on existing woodland floor in ForestEnvironment (complements hunt-trail PL116.1 + Explore tip PL45.1; ≠ homestead / plaza / hunt warm; layouts / spawns unchanged; no station invent); `explore-section-landmark-cue-pl1401` |
| PL139.2 Chat-send soft confirm leftover | 2026-08-02 | Brief quiet social seafoam edge rim via `CHAT_SEND_WORLD_REINFORCE` / `shouldFlashChatSendWorldReinforce` / `chatSendWorldReinforceBackground` on GameHudShell after chat send ok (complements Sent PL62.2 + receive Chat PL27.2; ≠ market teal / home meadow; quieter than visit rim; chat rules unchanged; mute ok; fail silent); `chat-send-world-reinforce-pl1392` |
| PL139.1 Visit home-return soft world reinforce | 2026-08-02 | Brief soft meadow edge rim via `VISIT_HOME_RETURN_WORLD_REINFORCE` / `shouldFlashVisitHomeReturnWorldReinforce` / `visitHomeReturnWorldReinforceBackground` on GameHudShell when leaving a visit (complements Your land tip PL114.2 + Home PL27.1 + host nameplate PL119.2; Land-chip kinship; ≠ quest verdant / market teal; visit rules unchanged; mute ok; own-land idle silent); `visit-home-return-world-reinforce-pl1391` |
| PL138.2 Quest-claim soft world reinforce | 2026-08-02 | Brief soft verdant edge rim via `QUEST_CLAIM_WORLD_REINFORCE` / `shouldFlashQuestClaimWorldReinforce` / `questClaimWorldReinforceBackground` on GameHudShell after quest claim ok (complements Quest claimed PL29.3 + coins gold PL126.2; ≠ market teal; rewards / catalog unchanged; mute ok; fail silent); `quest-claim-world-reinforce-pl1382` |
| PL138.1 Market-list soft world reinforce | 2026-08-02 | Brief soft market-teal edge rim via `MARKET_LIST_WORLD_REINFORCE` / `shouldFlashMarketListWorldReinforce` / `marketListWorldReinforceBackground` on GameHudShell after market list ok (complements Listed PL10.2 + coins rim stays for sells; ≠ quest verdant / coins gold; escrow / fees unchanged; mute ok; fail silent); `market-list-world-reinforce-pl1381` |
| PL137.2 Expand-field soft pad flash | 2026-08-02 | Brief warm field-gold pad via `EXPAND_FIELD_PAD_FLASH` / `shouldFlashExpandFieldPad` / `shouldShowExpandFieldPadFlash` / `ExpandFieldFlashPad` on unlocked footprint coords frozen at expand ok (complements Expanded PL20.3 + short-afford pulse PL123.1; ≠ upgrade copper PL137.1 / spawn amber; costs / slots unchanged; mute ok); `expand-field-pad-flash-pl1372` |
| PL137.1 Station-upgrade soft pad flash | 2026-08-02 | Brief warm copper pad via `STATION_UPGRADE_PAD_FLASH` / `shouldFlashStationUpgradePad` / `shouldShowStationUpgradePadFlash` on upgraded mill/forge (id-scoped) after ok upgrade (complements Upgraded PL48.1 + craft olive PL131.1; costs / tiers unchanged; mute ok; fail silent); `station-upgrade-pad-flash-pl1371` |
| PL136.2 Title-change soft world reinforce | 2026-08-02 | Brief soft warm ochre edge rim via `TITLE_CHANGE_WORLD_REINFORCE` / `shouldFlashTitleChangeWorldReinforce` / `titleChangeWorldReinforceBackground` on GameHudShell when cosmetic title changes (same gate as Title · PL49.1; ≠ level sage / unlock violet / coins gold; titles cosmetic; mute ok; hydrate quiet); `title-change-world-reinforce-pl1362` |
| PL136.1 Achievement unlock soft world reinforce | 2026-08-02 | Brief amber-violet edge rim via `ACHIEVEMENT_UNLOCK_WORLD_REINFORCE` / `shouldFlashAchievementUnlockWorldReinforce` / `achievementUnlockWorldReinforceBackground` on GameHudShell when stubs flip (same flashUnlocks gate as Unlocked · PL47.2; ≠ level sage PL135.2 / coins gold; unlock rules unchanged; mute ok; hydrate quiet); `achievement-unlock-world-reinforce-pl1361` |
| PL135.2 Level-up soft world reinforce | 2026-08-02 | Brief sage-teal edge rim via `LEVEL_UP_WORLD_REINFORCE` / `shouldFlashLevelUpWorldReinforce` / `levelUpWorldReinforceBackground` on GameHudShell when characterLevel rises (complements Level N PL47.1 + coins gold PL126.2; XP curve / titles unchanged; mute ok; no XP bar invent); `level-up-world-reinforce-pl1352` |
| PL135.1 Scarce Free sticky world label | 2026-08-02 | Quiet sticky Free Html + cooler pad/halo via `CITY_SCARCE_STATION_FREE_CUE` / `shouldShowScarceFreeStickyWorldLabel` on ScarceStationPad while free (pairs Busy PL8.1 + settle PL119.1; contention / land unlimited unchanged; mute ok); `city-scarce-free-sticky-world-label-pl1351` |
| PL134.2 Peer range-exit soft fade | 2026-08-02 | Soft ping-ring ease-out via `NEARBY_PEER_EXIT_FADE` / `shouldStartPeerRangeExitFade` / envelope+opacity helpers on RemotePlayerAvatar when leaving interact range (complements enter ping PL15.2 + silhouette PL40.3; no nearby-list growth; presence rules unchanged; zero peers quiet); `peer-range-exit-fade-pl1342` |
| PL134.1 Build-place soft spawn flash | 2026-08-02 | Brief warm timber-amber pad via `BUILD_PLACE_SPAWN_FLASH` / `shouldFlashBuildPlaceSpawn` / `newlyPlacedStationBuildingId` / envelope helpers on newly placed station after build ok (complements Homestead PL25.2 + Built PL28.3 + beacon hide PL3.1; place costs / slots unchanged; mute ok); `build-place-spawn-flash-pl1341` |
| PL133.2 TravelPanel destination map-tint | 2026-08-02 | Quiet destination-row accents via `TRAVEL_DESTINATION_MAP_TINT` / `travelDestinationMapTintAccent` / `travelDestinationMapTintStyle` matching TopBar MAP_IDENTITY chip colors for City/Land/Explore/Arena (complements chip PL14.1 + arrive pulse PL40.2 + Arrived PL115.2; Here stays louder; fare-free unchanged); `travel-destination-map-tint-pl1332` |
| PL133.1 Mail-pending closed glance | 2026-08-02 | Quiet TopBar `L · Mail` chip via `MAIL_PENDING_CLOSED_GLANCE` / `shouldShowMailPendingClosedGlance` / `mailPendingClosedGlanceLabel` while inbox pending and Mail closed (complements panel unread PL17.1 + open accent PL34.1; no always-on mail column; clears when empty or panel open; mailbox rules unchanged); `mail-pending-closed-glance-pl1331` |
| PL132.2 Tool-low soft world leftover | 2026-08-02 | Quiet cool steel edge vignette via `TOOL_LOW_WORLD_VIGNETTE` / `shouldShowToolLowWorldVignette` on GameHudShell while equipped tool in TOOL.lowWarnPct (complements TopBar PL61.1 + inventory PL21.1; ≠ energy/HP rims; durability / break unchanged; clears on repair/replace; mute ok; not a HUD column); `tool-low-world-vignette-pl1322` |
| PL132.1 Fish-catch soft splash reinforce | 2026-08-02 | Brief cool water splash via `FISH_CATCH_SPLASH_FLASH` / `shouldFlashFishCatchSplash` / envelope helpers on fishing dock after catch ok (complements Caught + ready shimmer PL118.2; ≠ mint gather PL131.2; rates / cooldown unchanged; mute ok); `fish-catch-splash-flash-pl1321` |
| PL131.2 Gather-success soft pad flash | 2026-08-02 | Brief mint-lime pad via `GATHER_SUCCESS_PAD_FLASH` / `shouldFlashGatherSuccessPad` / envelope helpers on stump / ore / pen after gather ok by building id (complements Chopped/Mined/Collected + inventory flash PL128.2; dock → PL132.1; yields / cooldowns unchanged; mute ok); `gather-success-pad-flash-pl1312` |
| PL131.1 Craft-complete soft bench flash | 2026-08-02 | Brief sprout-olive pad settle via `CRAFT_COMPLETE_BENCH_FLASH` / `shouldFlashCraftCompleteBench` / envelope+opacity helpers on process stations after craft ok (complements Crafted + working emissive PL121.2; recipes / XP unchanged; mute ok; fail silent); `craft-complete-bench-flash-pl1311` |
| PL130.2 Tips-toggle soft confirm | 2026-08-02 | Brief settings tips-row flash + `Tips on` chip via `TIPS_ENABLE_CONFIRM_MS` / `shouldFlashTipsEnableConfirm` on enable edge only (mute/day family; tip ids / localStorage unchanged; settings only); `tips-toggle-soft-confirm-pl1302` |
| PL130.1 Day-night toggle soft confirm | 2026-08-02 | Brief settings day-night-row flash + `Day/night` chip via `DAY_NIGHT_ENABLE_CONFIRM_MS` / `shouldFlashDayNightEnableConfirm` on enable edge only (complements mute-enable PL125.2; cycle still cosmetic; settings only); `day-night-toggle-soft-confirm-pl1301` |
| PL129.2 Arena plaque soft walk-up pulse | 2026-08-02 | Soft plaque emissive sine while interact-highlighted via `ARENA_PLAQUE_HIGHLIGHT_PULSE` / `arenaPlaqueHighlightPulseEnvelope` / `arenaPlaqueHighlightPulseEmissiveIntensity` on ArenaBoardBuilding (complements PL41.2 haze / PL11.1 plaque; walk-up tip stays bright; stub / no balance invent; mute ok); `arena-plaque-walkup-pulse-pl1292` |
| PL129.1 Tutor-lane soft landmark strip | 2026-08-02 | Quiet cooler mint-teal emissive + haze via `CITY_TUTOR_LANE_LANDMARK_CUE` / `cityTutorLaneLandmarkCue` / envelope+intensity helpers on existing CityEnvironment tutor-lane strip (complements plaza landmark PL125.1; ≠ warm scarce yard); claim rules / layouts unchanged; no station invent; `tutor-lane-landmark-strip-pl1291` |
| PL128.2 Inventory pickup soft slot flash | 2026-08-02 | Brief slot/border flash via `INVENTORY_PICKUP_SLOT_FLASH` / `inventoryPickupFlashStackIds` / `shouldFlashInventoryPickupSlots` on InventoryPanel when qty rises or new stack after bag inflow (complements gather/craft/buy SFX); capacity rules unchanged; mute ok; `inventory-pickup-slot-flash-pl1282` |
| PL128.1 Quest-ready soft row accent | 2026-08-02 | Quiet ready-row tint via `QUEST_READY_ROW_ACCENT` / `shouldShowQuestReadyRowAccent` / `questReadyRowAccentClassName` on QuestPanel claimable rows (complements claim cue PL29.3); catalog / claim rules unchanged; min HUD; `quest-ready-row-accent-pl1281` |
| PL127.2 Crop plant success soft reinforce | 2026-08-02 | Brief sprout-green edge radial rim via `CROP_PLANT_SUCCESS_WORLD_REINFORCE` / `shouldFlashCropPlantSuccessWorldReinforce` / `cropPlantSuccessWorldReinforceBackground` on GameHudShell after ok plant (complements plant SFX + Planted); grow timers / seed rules unchanged; mute ok; `crop-plant-success-world-reinforce-pl1272` |
| PL127.1 Animal-pen ready soft pad pulse | 2026-08-02 | Soft pad/emissive sine while collect-ready via `ANIMAL_PEN_READY_PAD_PULSE` / `animalPenReadyPadPulse` / envelope+intensity helpers on AnimalPenBuilding (complements Ready PL30.2 / edge PL69.2; kinship dock shimmer PL118.2); cooldown / rates unchanged; mute ok; `animal-pen-ready-pad-pulse-pl1271` |
| PL126.2 Coins-gain soft reinforce | 2026-08-02 | Brief warm gold edge radial rim via `COINS_GAIN_WORLD_REINFORCE` / `shouldFlashCoinsGainWorldReinforce` / `coinsGainWorldReinforceBackground` on GameHudShell when soft currency rises from vendor sell / market (delta-gated) / quest·tutor claim (complements Sold/Bought); prices / sinks unchanged; mute ok; `coins-gain-world-reinforce-pl1262` |
| PL126.1 Health-low soft world vignette | 2026-08-02 | Quiet cool crimson edge radial vignette while `isHealthLow` via `HEALTH_LOW_WORLD_VIGNETTE` / `shouldShowHealthLowWorldVignette` in GameHudShell (complements TopBar PL67.1 / energy amber PL124.1); COMBAT.lowWarnPct SoT unchanged; clears when recovered; mute ok; not a HUD column; `health-low-world-vignette-pl1261` |
| PL125.2 Mute-toggle soft confirm | 2026-08-02 | Brief settings mute-row flash + chip via `MUTE_ENABLE_CONFIRM_MS` / `shouldFlashMuteEnableConfirm` on enable edge only (complements TopBar Muted PL37.2); unmute cue-only; mute still silences BGM+SFX; settings only; `mute-toggle-soft-confirm-pl1252` |
| PL125.1 City plaza soft landmark cue | 2026-08-02 | Quiet cool emissive + haze on existing plaza fountain via `CITY_PLAZA_LANDMARK_CUE` / `cityPlazaLandmarkCue` / pulse envelope helpers in CityEnvironment; scarce contention / layouts unchanged; no station invent; `city-plaza-landmark-cue-pl1251` |
| PL124.2 Eat success soft reinforce | 2026-08-02 | Brief warm olive world rim flash via `EAT_SUCCESS_WORLD_REINFORCE` / `shouldFlashEatSuccessWorldReinforce` / `eatSuccessWorldReinforceBackground` on GameHudShell (complements eat SFX + Ate PL20.1); food / energy restore unchanged; mute ok; `eat-success-world-reinforce-pl1242` |
| PL124.1 Energy-low soft world vignette | 2026-08-02 | Quiet warm edge radial vignette while `isEnergyLow` via `ENERGY_LOW_WORLD_VIGNETTE` / `shouldShowEnergyLowWorldVignette` in GameHudShell (complements TopBar PL9.1); threshold SoT unchanged; clears when recovered; mute ok; not a HUD column; `energy-low-world-vignette-pl1241` |
| PL123.2 Trade preferred-partner nameplate | 2026-08-02 | Soft Host · panel chip + open reinforce via `TRADE_PREFERRED_PARTNER_NAMEPLATE` / `tradePreferredPartnerNameplateText` / border helpers in TradePanel (teal kinship with PL119.2); trade rules / T unchanged; min HUD; `trade-preferred-partner-nameplate-pl1232` |
| PL123.1 Expand-pad short afford pulse | 2026-08-02 | Soft warm amber pad emissive sine while short + interact-highlighted via `EXPAND_PAD_SHORT_AFFORD_PULSE` / envelope + emissive helpers on ExpandPadMesh; complements PL26.1 short tint; costs / slots unchanged; mute ok; `expand-pad-short-afford-pulse-pl1231` |
| PL122.2 Day-phase soft world haze | 2026-08-02 | Brief fog/light reinforce on dusk↔night + night↔dawn via `DAY_PHASE_EDGE_HAZE` / `dayPhaseEdgeHazeEnvelope` / fog·hemi·sun helpers in DayNightLighting; midday quiet; cycle toggle off = no haze; cosmetic only; `day-phase-edge-haze-pl1222` |
| PL122.1 Local avatar map-tint micro | 2026-08-02 | Quiet vest→portalVeil + hatBand→accent via `LOCAL_AVATAR_MAP_TINT` / `localAvatarMapTintForLandKind` / `resolveAvatarKitColors` on local PlayerAvatar only; remotes untinted; complements chip PL14.1 + portal PL14.2; movement unchanged; `local-avatar-map-tint-pl1221` |
| PL121.2 Process-station working emissive | 2026-08-02 | Soft warm pad/body glow while craft panel open via `PROCESS_STATION_WORKING_EMISSIVE` / `shouldShowProcessStationWorkingEmissive` / envelope+intensity helpers on mill/forge/kitchen/workshop/loom/alchemy; recipes / XP unchanged; mute ok; `process-station-working-emissive-pl1212` |
| PL121.1 Crop growing soft sway cue | 2026-08-02 | Quiet growing pad + signed stem lean via `CROP_GROWING_SOFT_SWAY` / `cropGrowingSoftSwayActive` / sway envelope helpers on CropFieldMesh; empty/ready unchanged (ready keeps PL12.1); growMs unchanged; `crop-growing-soft-sway-pl1211` |
| PL120.2 Portal highlight Free pulse | 2026-08-02 | Soft veil opacity/emissive sine while interact-highlighted via `PORTAL_HIGHLIGHT_FREE_PULSE` / `portalHighlightFreePulseEnvelope` + opacity/emissive helpers on PortalBuilding; complements Travel · free PL37.1 + tint PL14.2; destinations unchanged; `portal-highlight-free-pulse-pl1202` |
| PL120.1 Map BGM bed identity | 2026-08-02 | Brief bed-rooted two-note stinger via `BGM_ARRIVE_IDENTITY_STINGER` / `bgmArriveIdentityStingerSteps` / `shouldPlayBgmArriveIdentityStinger` + `playBgmArriveIdentityStinger` on free-travel map change; complements travel SFX PL11.2 + soft swap PL51.1; fare-free / mute ok; `map-bgm-bed-identity-pl1201` |
| PL119.2 Visit host nameplate reinforce | 2026-08-02 | Soft shed Html nameplate + pad via `VISIT_HOST_NAMEPLATE` / `shouldShowVisitHostNameplate` / arrive reinforce helpers in HomesteadEnvironment; complements PL15.1 Visiting ·; visit rules / min HUD unchanged; `visit-host-nameplate-pl1192` |
| PL119.1 City scarce Free settle flash | 2026-08-02 | Brief pad dim/emissive busy→free via `CITY_SCARCE_FREE_SETTLE_FLASH` / `shouldFlashScarceFreeSettleEdge` / envelope+opacity helpers in `ScarceStationPad`; complements PL115.1 busy pulse + sticky Free/Busy PL8; contention unchanged; mute ok; `city-scarce-free-settle-flash-pl1191` |
| PL118.2 Fishing-dock ready water shimmer | 2026-08-02 | Soft water sine + ready pad via `FISHING_DOCK_READY_WATER_SHIMMER` / `fishingDockReadyWaterShimmer` / envelope+intensity helpers on FishingDockBuilding; cooling quiet; cooldown / catch rates unchanged; complements PL30.1 Ready + PL65.2 edge; `fishing-dock-ready-water-shimmer-pl1182` |
| PL118.1 Lived-homestead quiet chimney cue | 2026-08-02 | Soft chimney emissive + roof plume via `LIVED_HOMESTEAD_CHIMNEY_CUE` / `livedHomesteadChimneyCue` on existing shed when yard `lived` (PL3.1/PL22.1 gate); empty quiet; no station invent; beacon unchanged; `lived-homestead-chimney-cue-pl1181` |
| PL117.2 Notice-board unread soft flicker | 2026-08-02 | Soft plaque sine flicker via `noticeUnreadFlickerEnvelope` / `noticeUnreadPlaqueEmissiveIntensity` + `NOTICE_UNREAD_WORLD_CUE` flicker fields while unread; tip ids / localStorage unchanged; min HUD; `notice-unread-soft-flicker-pl1172` |
| PL117.1 Market / vendor service-pad warmth | 2026-08-02 | Warm lantern/pad via `CITY_COMMERCE_SERVICE_PAD` / `cityCommerceServicePad` under VendorStall + MarketBoard; apart from scarce yard + cool civic; prices unchanged; `market-vendor-service-pad-warmth-pl1171` |
| PL116.2 Explore premium-node soft glow | 2026-08-02 | Soft ready pad/emissive via `EXPLORE_PREMIUM_NODE_GLOW` / `explorePremiumNodeGlow` on Explore `tree_stump`/`ore_node` only; City/Land quiet; depleted stays PL12.2; rates unchanged; `explore-premium-node-glow-pl1162` |
| PL116.1 Explore hunt-trail wayfinding contrast | 2026-08-02 | Warm sand vs cool dusk pads via `HUNT_TRAIL_WAYFINDING` / `huntTrailWayfindingVisual` + `trailVisual` pads on GameTrail/EdgeThicket; hunt rules unchanged; `hunt-trail-wayfinding-contrast-pl1161` |
| PL115.2 Travel-arrive destination whisper | 2026-08-02 | One-shot `Arrived ·` via `travelArriveSuccessCueText` / `travelArriveDestinationLabel` / `shouldFlashTravelArriveSuccessCue` — dest = TravelPanel `LAND_DESTINATIONS.name` (not map-chip short words); first-map tips may replace; free travel / no caravan; mute ok; `travel-arrive-destination-whisper-pl1152` |
| PL115.1 City scarce-busy peer pulse | 2026-08-02 | Brief pad/halo free→busy pulse via `CITY_SCARCE_BUSY_PEER_PULSE` / `shouldPulseScarceBusyPeerEdge` / envelope+intensity helpers wired in `ScarceStationPad`; sticky Busy (PL8.1) kept; contention unchanged; mute ok; `city-scarce-busy-peer-pulse-pl1151` |
| PL114.2 Visit-home return cue clarity | 2026-08-02 | Soft TopBar `Your land` via `shouldShowVisitHomeReturnWorldTip` / `visitHomeReturnWorldTip` + Land map-chip pulse via `shouldPulseMapChipOnVisitHomeReturn`; complements PL27.1 `Home` ephemeral + visit_leave SFX; own-land idle silent; visit rules / min HUD unchanged; `visit-home-return-cue-pl1142` |
| PL114.1 Empty-homestead meadow contrast | 2026-08-02 | Warmer empty outer meadow + readable fence via `HOMESTEAD_YARD_VISUAL.empty.meadowColor` / fence colors + `homesteadYardFloorColors`; contrast helpers `emptyHomesteadVsExploreMeadowContrast` / `emptyHomesteadFenceVsMeadowContrast`; PL3.1 beacon / no station invent; apart from Explore cool canopy (PL36.2); `empty-homestead-meadow-contrast-pl1141` |
| PL113.2 Wallet-not-linked refuse ephemeral | 2026-08-02 | Ephemeral `Wallet` via `shouldFlashWalletNotLinkedRefuseCue` / `walletNotLinkedRefuseCueText` for `walletNotLinked` + refuse SFX; sticky suppressed; disconnect rules unchanged; settings only; mute ok; `wallet-not-linked-refuse-ephemeral-pl1132` |
| PL113.1 Wallet-already-linked refuse ephemeral | 2026-08-02 | Ephemeral `Linked` via `shouldFlashWalletAlreadyLinkedRefuseCue` / `walletAlreadyLinkedRefuseCueText` for `walletAlreadyLinked` + refuse SFX; sticky suppressed; wallet rules unchanged; settings only; mute ok; `wallet-already-linked-refuse-ephemeral-pl1131` |
| PL112.3 Deed-price / owned / forest refuse ephemeral | 2026-08-02 | Ephemeral `Price` / `Owned` / `Forest` via `shouldFlashDeedBadPriceRefuseCue` / `shouldFlashDeedAlreadyOwnedRefuseCue` / `shouldFlashDeedNeedForestRefuseCue` + refuse SFX; sticky suppressed; price bounds / forest unlock unchanged; surface only; mute ok; `deed-price-owned-forest-refuse-ephemeral-pl1123` |
| PL112.2 Deed-mint / list-state refuse ephemeral | 2026-08-02 | Ephemeral `Mint` / `Listed` / `Unlisted` via `shouldFlashDeedNeedMintRefuseCue` / `shouldFlashDeedAlreadyMintedRefuseCue` / `shouldFlashDeedAlreadyListedRefuseCue` / `shouldFlashDeedNotListedRefuseCue` + refuse SFX; sticky suppressed; mint/list rules unchanged; surface only; mute ok; `deed-mint-list-state-refuse-ephemeral-pl1122` |
| PL112.1 Deed-missing / not-yours refuse ephemeral | 2026-08-02 | Ephemeral `Gone` / `Yours` via `shouldFlashDeedMissingRefuseCue` / `shouldFlashDeedNotYoursRefuseCue` + refuse SFX; sticky suppressed; deed rules unchanged; settings/deed surface only; mute ok; `deed-missing-not-yours-refuse-ephemeral-pl1121` |
| PL111.2 Guild-bank deposit/withdraw cue verify | 2026-08-02 | Verified already flashing `Deposited` / `Withdrew` via `guildBankDepositSuccessCueText` / `guildBankWithdrawSuccessCueText` (PL48.2–PL48.3) on GuildPanel deposit/withdraw; no silent path; bank rules unchanged |
| PL111.1 Guild-rank-change success ephemeral | 2026-08-02 | Ephemeral `Ranked` via `guildRankChangeSuccessCueText` + `guild_claim` SFX after successful `apiSetGuildRank`; rank enum / permissions unchanged; mute ok; distinct from refuse `Rank`; `guild-rank-change-success-ephemeral-pl1111` |
| PL110.2 Missing-item refuse ephemeral | 2026-08-02 | Ephemeral `Need` via `shouldFlashMissingItemRefuseCue` / `missingItemRefuseCueText` for dynamic `missingItem(name)` (`You need ${Title Case}.`) + refuse SFX; carved out coins/mats/station/XP/login/seed You-need*; sticky suppressed; item reqs unchanged; mute ok; `missing-item-refuse-ephemeral-pl1102` |
| PL110.1 Quest-unknown refuse ephemeral | 2026-08-02 | Ephemeral `Quest` via `shouldFlashQuestUnknownRefuseCue` / `questUnknownRefuseCueText` for `questUnknown` + refuse SFX; sticky suppressed; quest catalog unchanged; mute ok; `quest-unknown-refuse-ephemeral-pl1101` |
| PL109.3 Guild-rank-invalid refuse ephemeral | 2026-08-02 | Ephemeral `Rank` via `shouldFlashGuildRankInvalidRefuseCue` / `guildRankInvalidRefuseCueText` for `guildRankInvalid` + refuse SFX; sticky suppressed; rank enum unchanged; mute ok; distinct flash ID from forbidden Rank; `guild-rank-invalid-refuse-ephemeral-pl1093` |
| PL109.2 Guild-target-missing refuse ephemeral | 2026-08-02 | Ephemeral `Member` via `shouldFlashGuildTargetMissingRefuseCue` / `guildTargetMissingRefuseCueText` for `guildTargetMissing` + refuse SFX; sticky suppressed; membership rules unchanged; mute ok; `guild-target-missing-refuse-ephemeral-pl1092` |
| PL109.1 Guild-not-found refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashGuildNotFoundRefuseCue` / `guildNotFoundRefuseCueText` for `guildNotFound` + refuse SFX; sticky suppressed; guild lookup unchanged; mute ok; `guild-not-found-refuse-ephemeral-pl1091` |
| PL108.2 Unknown-station refuse ephemeral | 2026-08-02 | Ephemeral `Build` via `shouldFlashUnknownStationRefuseCue` / `unknownStationRefuseCueText` for `unknownStation` + refuse SFX; sticky suppressed; station catalog unchanged; mute ok; distinct from craft `Station`; `unknown-station-refuse-ephemeral-pl1082` |
| PL108.1 Item-missing refuse ephemeral | 2026-08-02 | Ephemeral `Item` via `shouldFlashItemMissingRefuseCue` / `itemMissingRefuseCueText` for `itemMissing` + refuse SFX; sticky suppressed; inventory rules unchanged; mute ok; distinct flash ID from guild-bank Item; `item-missing-refuse-ephemeral-pl1081` |
| PL107.2 Crop-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashCropMissingRefuseCue` / `cropMissingRefuseCueText` for `cropMissing` + refuse SFX; sticky long prose suppressed; crop rules unchanged; mute ok; `crop-missing-refuse-ephemeral-pl1072` |
| PL107.1 Unknown-seed refuse ephemeral | 2026-08-02 | Ephemeral `Plant` via `shouldFlashUnknownSeedRefuseCue` / `unknownSeedRefuseCueText` for `unknownSeed` + refuse SFX; sticky long prose suppressed; plant rules unchanged; mute ok; distinct from missing-seed `Seed`; `unknown-seed-refuse-ephemeral-pl1071` |
| PL106.2 Decor-need-coins refuse ephemeral | 2026-08-02 | Ephemeral `Coins` via `shouldFlashDecorNeedCoinsRefuseCue` / `decorNeedCoinsRefuseCueText` for dynamic `needCoinsDecor(n)` + refuse SFX; sticky long prose suppressed; decor prices unchanged; mute ok; distinct from market Fee / place `to` Coins; `decor-need-coins-refuse-ephemeral-pl1062` |
| PL106.1 Unknown-decor refuse ephemeral | 2026-08-02 | Ephemeral `Decor` via `shouldFlashUnknownDecorRefuseCue` / `unknownDecorRefuseCueText` for `unknownDecor` + refuse SFX; sticky long prose suppressed; decor catalog unchanged; mute ok; `unknown-decor-refuse-ephemeral-pl1061` |
| PL105.3 No-expand-slots refuse ephemeral | 2026-08-02 | Ephemeral `Slots` via `shouldFlashNoExpandSlotsRefuseCue` / `noExpandSlotsRefuseCueText` for `noExpandSlots` + refuse SFX; sticky long prose suppressed; expand slot caps unchanged; mute ok; `no-expand-slots-refuse-ephemeral-pl1053` |
| PL105.2 Decor-starter-only refuse ephemeral | 2026-08-02 | Ephemeral `Home` via `shouldFlashDecorStarterOnlyRefuseCue` / `decorStarterOnlyRefuseCueText` for `decorStarterOnly` + refuse SFX; sticky long prose suppressed; homestead gate unchanged; mute ok; `decor-starter-only-refuse-ephemeral-pl1052` |
| PL105.1 Decor-pad-missing refuse ephemeral | 2026-08-02 | Ephemeral `Pad` via `shouldFlashDecorPadMissingRefuseCue` / `decorPadMissingRefuseCueText` for `decorPadMissing` + refuse SFX; sticky long prose suppressed; decor pad rules unchanged; mute ok; `decor-pad-missing-refuse-ephemeral-pl1051` |
| PL104.3 Needs-xp refuse ephemeral | 2026-08-02 | Ephemeral `XP` via `shouldFlashNeedsXpRefuseCue` / `needsXpRefuseCueText` for dynamic `needsXp(profession, need)` + refuse SFX; sticky long prose suppressed; XP gates unchanged; mute ok; `needs-xp-refuse-ephemeral-pl1043` |
| PL104.2 Needs-station refuse ephemeral | 2026-08-02 | Ephemeral `Station` via `shouldFlashNeedsStationRefuseCue` / `needsStationRefuseCueText` for dynamic `needsStation(station)` + refuse SFX; sticky long prose suppressed; station requirements unchanged; mute ok; `needs-station-refuse-ephemeral-pl1042` |
| PL104.1 Unknown-recipe refuse ephemeral | 2026-08-02 | Ephemeral `Recipe` via `shouldFlashUnknownRecipeRefuseCue` / `unknownRecipeRefuseCueText` for `unknownRecipe` + refuse SFX; sticky long prose suppressed; recipe catalog unchanged; mute ok; `unknown-recipe-refuse-ephemeral-pl1041` |
| PL103.3 Invalid-qty refuse ephemeral | 2026-08-02 | Ephemeral `Qty` via `shouldFlashInvalidQtyRefuseCue` / `invalidQtyRefuseCueText` for `invalidQty` + refuse SFX; sticky long prose suppressed; qty validation unchanged; mute ok; `invalid-qty-refuse-ephemeral-pl1033` |
| PL103.2 Market-invalid refuse ephemeral | 2026-08-02 | Ephemeral `List` via `shouldFlashMarketInvalidRefuseCue` / `marketInvalidRefuseCueText` for `marketInvalid` + refuse SFX; sticky long prose suppressed; list validation unchanged; mute ok; `market-invalid-refuse-ephemeral-pl1032` |
| PL103.1 Mail-not-stackable refuse ephemeral | 2026-08-02 | Ephemeral `Stack` via `shouldFlashMailNotStackableRefuseCue` / `mailNotStackableRefuseCueText` for `mailNotStackable` + refuse SFX; sticky long prose suppressed; mail stack rules unchanged; mute ok; `mail-not-stackable-refuse-ephemeral-pl1031` |
| PL102.3 Guild-bank-bad-qty refuse ephemeral | 2026-08-02 | Ephemeral `Qty` via `shouldFlashGuildBankBadQtyRefuseCue` / `guildBankBadQtyRefuseCueText` for `guildBankBadQty` + refuse SFX; sticky long prose suppressed; qty rules unchanged; mute ok; `guild-bank-bad-qty-refuse-ephemeral-pl1023` |
| PL102.2 Guild-bank-unknown-item refuse ephemeral | 2026-08-02 | Ephemeral `Item` via `shouldFlashGuildBankUnknownItemRefuseCue` / `guildBankUnknownItemRefuseCueText` for `guildBankUnknownItem` + refuse SFX; sticky long prose suppressed; item rules unchanged; mute ok; `guild-bank-unknown-item-refuse-ephemeral-pl1022` |
| PL102.1 Guild-bank-not-stackable refuse ephemeral | 2026-08-02 | Ephemeral `Stack` via `shouldFlashGuildBankNotStackableRefuseCue` / `guildBankNotStackableRefuseCueText` for `guildBankNotStackable` + refuse SFX; sticky long prose suppressed; stack rules unchanged; mute ok; `guild-bank-not-stackable-refuse-ephemeral-pl1021` |
| PL101.3 Hunt-or-claim-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashHuntOrClaimMissingRefuseCue` / `huntOrClaimMissingRefuseCueText` for `huntMissing` / `claimNodeMissing` + refuse SFX; sticky long prose suppressed; hunt / claim node rules unchanged; mute ok; `hunt-or-claim-missing-refuse-ephemeral-pl1013` |
| PL101.2 Plot-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashPlotMissingRefuseCue` / `plotMissingRefuseCueText` for `plotMissing` + refuse SFX; sticky long prose suppressed; plot rules unchanged; mute ok; `plot-missing-refuse-ephemeral-pl1012` |
| PL101.1 Gather-node-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashGatherNodeMissingRefuseCue` / `gatherNodeMissingRefuseCueText` for `oreNodeMissing` / `woodStumpMissing` / `fishingDockMissing` / `animalPenMissing` + refuse SFX; sticky long prose suppressed; gather node rules unchanged; mute ok; `gather-node-missing-refuse-ephemeral-pl1011` |
| PL100.2 Not-a-tool refuse ephemeral | 2026-08-02 | Ephemeral `Tool` via `shouldFlashNotAToolRefuseCue` / `notAToolRefuseCueText` for `notATool` + refuse SFX; sticky long prose suppressed; equip rules unchanged; mute ok; `not-a-tool-refuse-ephemeral-pl1002` |
| PL100.1 Repair-need-mats refuse ephemeral | 2026-08-02 | Ephemeral `Mats` via `shouldFlashNeedMatsRepairRefuseCue` / `needMatsRepairRefuseCueText` for dynamic `needMatsRepair(qty,name)` + refuse SFX; carved out of generic Materials cue; sticky long prose suppressed; repair costs unchanged; mute ok; `need-mats-repair-refuse-ephemeral-pl1001` |
| PL99.2 Warrior-homestead-forbidden refuse ephemeral | 2026-08-02 | Ephemeral `Arena` via `shouldFlashWarriorHomesteadForbiddenRefuseCue` / `warriorHomesteadForbiddenRefuseCueText` for `warriorTrainingHomesteadForbidden` + refuse SFX; sticky long prose suppressed; warrior/arena place rules unchanged; mute ok; `warrior-homestead-forbidden-refuse-ephemeral-pl992` |
| PL99.1 Hunt-explore-only refuse ephemeral | 2026-08-02 | Ephemeral `Explore` via `shouldFlashHuntExploreOnlyRefuseCue` / `huntExploreOnlyRefuseCueText` for `huntExploreOnly` + refuse SFX; sticky long prose suppressed; hunt map gate unchanged; mute ok; `hunt-explore-only-refuse-ephemeral-pl991` |
| PL98.3 Guild-rank-forbidden refuse ephemeral | 2026-08-02 | Ephemeral `Rank` via `shouldFlashGuildRankForbiddenRefuseCue` / `guildRankForbiddenRefuseCueText` for `guildRankForbidden` + `guildInviteForbidden` + refuse SFX; sticky long prose suppressed; guild rank / invite refresh rules unchanged; mute ok; `guild-rank-forbidden-refuse-ephemeral-pl983` |
| PL98.2 Guild-bank-empty refuse ephemeral | 2026-08-02 | Ephemeral `Empty` via `shouldFlashGuildBankEmptyRefuseCue` / `guildBankEmptyRefuseCueText` for `guildBankEmpty` + refuse SFX; sticky long prose suppressed; withdraw rules unchanged; mute ok; `guild-bank-empty-refuse-ephemeral-pl982` |
| PL98.1 Guild-bank-full refuse ephemeral | 2026-08-02 | Ephemeral `Full` via `shouldFlashGuildBankFullRefuseCue` / `guildBankFullRefuseCueText` for `guildBankFull` + refuse SFX; sticky long prose suppressed; guild bank slots unchanged; mute ok; `guild-bank-full-refuse-ephemeral-pl981` |
| PL97.2 Market-not-stackable refuse ephemeral | 2026-08-02 | Ephemeral `Stack` via `shouldFlashMarketNotStackableRefuseCue` / `marketNotStackableRefuseCueText` for `marketNotStackable` + refuse SFX; sticky long prose suppressed; market stack rules unchanged; mute ok; `market-not-stackable-refuse-ephemeral-pl972` |
| PL97.1 Market-need-fee refuse ephemeral | 2026-08-02 | Ephemeral `Fee` via `shouldFlashMarketNeedFeeRefuseCue` / `marketNeedFeeRefuseCueText` for dynamic `marketNeedFee(n)` + refuse SFX; carved out of generic Coins cue; sticky long prose suppressed; listing fee numbers unchanged; mute ok; `market-need-fee-refuse-ephemeral-pl971` |
| PL96.3 Mail-only-sender refuse ephemeral | 2026-08-02 | Ephemeral `Sender` via `shouldFlashMailOnlySenderRefuseCue` / `mailOnlySenderRefuseCueText` for `mailOnlySender` + refuse SFX; sticky long prose suppressed; mail cancel rules unchanged; mute ok; `mail-only-sender-refuse-ephemeral-pl963` |
| PL96.2 Mail-only-recipient refuse ephemeral | 2026-08-02 | Ephemeral `Wait` via `shouldFlashMailOnlyRecipientRefuseCue` / `mailOnlyRecipientRefuseCueText` for `mailOnlyRecipient` + refuse SFX; sticky long prose suppressed; mail claim rules unchanged; mute ok; `mail-only-recipient-refuse-ephemeral-pl962` |
| PL96.1 Mail-not-found refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashMailNotFoundRefuseCue` / `mailNotFoundRefuseCueText` for `mailNotFound` + refuse SFX; sticky long prose suppressed; mail escrow unchanged; mute ok; `mail-not-found-refuse-ephemeral-pl961` |
| PL95.2 Guild-name-invalid refuse ephemeral | 2026-08-02 | Ephemeral `Name` via `shouldFlashGuildNameInvalidRefuseCue` / `guildNameInvalidRefuseCueText` for `guildNameInvalid` + refuse SFX; sticky long prose suppressed; guild naming bounds unchanged; mute ok; `guild-name-invalid-refuse-ephemeral-pl952` |
| PL95.1 Guild-invite-invalid refuse ephemeral | 2026-08-02 | Ephemeral `Code` via `shouldFlashGuildInviteInvalidRefuseCue` / `guildInviteInvalidRefuseCueText` for `guildInviteInvalid` + refuse SFX; sticky long prose suppressed; guild invite rules unchanged; mute ok; `guild-invite-invalid-refuse-ephemeral-pl951` |
| PL94.2 Market-not-yours refuse ephemeral | 2026-08-02 | Ephemeral `Yours` via `shouldFlashMarketNotYoursRefuseCue` / `marketNotYoursRefuseCueText` for `marketNotYours` + refuse SFX; sticky long prose suppressed; market ownership unchanged; mute ok; `market-not-yours-refuse-ephemeral-pl942` |
| PL94.1 Market-not-found refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashMarketNotFoundRefuseCue` / `marketNotFoundRefuseCueText` for `marketNotFound` + refuse SFX; sticky long prose suppressed; market listings unchanged; mute ok; `market-not-found-refuse-ephemeral-pl941` |
| PL93.3 Mail-already-claimed refuse ephemeral | 2026-08-02 | Ephemeral `Claimed` via `shouldFlashMailAlreadyClaimedRefuseCue` / `mailAlreadyClaimedRefuseCueText` for `mailAlreadyClaimed` + refuse SFX; sticky long prose suppressed; mail claim rules unchanged; mute ok; `mail-already-claimed-refuse-ephemeral-pl933` |
| PL93.2 Mail-player-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashMailPlayerMissingRefuseCue` / `mailPlayerMissingRefuseCueText` for `mailPlayerMissing` + refuse SFX; sticky long prose suppressed; mail rules unchanged; mute ok; `mail-player-missing-refuse-ephemeral-pl932` |
| PL93.1 Mail-empty refuse ephemeral | 2026-08-02 | Ephemeral `Empty` via `shouldFlashMailEmptyRefuseCue` / `mailEmptyRefuseCueText` for `mailEmpty` + refuse SFX; sticky long prose suppressed; mail escrow unchanged; mute ok; `mail-empty-refuse-ephemeral-pl931` |
| PL92.2 Trade-missing-items refuse ephemeral | 2026-08-02 | Ephemeral `Items` via `shouldFlashTradeMissingItemsRefuseCue` / `tradeMissingItemsRefuseCueText` for `tradeYouMissingItems` / `tradeSenderMissingItems` + refuse SFX; sticky long prose suppressed; trade item escrow unchanged; mute ok; `trade-missing-items-refuse-ephemeral-pl922` |
| PL92.1 Trade-broke refuse ephemeral | 2026-08-02 | Ephemeral `Broke` via `shouldFlashTradeBrokeRefuseCue` / `tradeBrokeRefuseCueText` for `tradeYouBroke` / `tradeSenderBroke` + refuse SFX; sticky long prose suppressed; trade coin escrow unchanged; mute ok; `trade-broke-refuse-ephemeral-pl921` |
| PL91.3 Trade-only-recipient refuse ephemeral | 2026-08-02 | Ephemeral `Wait` via `shouldFlashTradeOnlyRecipientRefuseCue` / `tradeOnlyRecipientRefuseCueText` for `tradeOnlyRecipient` + refuse SFX; sticky long prose suppressed; trade accept rules unchanged; mute ok; `trade-only-recipient-refuse-ephemeral-pl913` |
| PL91.2 Trade-not-yours refuse ephemeral | 2026-08-02 | Ephemeral `Yours` via `shouldFlashTradeNotYoursRefuseCue` / `tradeNotYoursRefuseCueText` for `tradeNotYours` + refuse SFX; sticky long prose suppressed; trade escrow unchanged; mute ok; `trade-not-yours-refuse-ephemeral-pl912` |
| PL91.1 Trade-not-found refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashTradeNotFoundRefuseCue` / `tradeNotFoundRefuseCueText` for `tradeNotFound` + refuse SFX; sticky long prose suppressed; trade escrow unchanged; mute ok; `trade-not-found-refuse-ephemeral-pl911` |
| PL90.1 Travel-need-coins refuse ephemeral | 2026-08-02 | Ephemeral `Coins` via `shouldFlashTravelNeedCoinsRefuseCue` / `travelNeedCoinsRefuseCueText` for `needCoinsTravel(n)` template + refuse SFX; sticky long prose suppressed; caravan costs unchanged; mute ok; `travel-need-coins-refuse-ephemeral-pl901` |
| PL89.2 Cannot-upgrade refuse ephemeral | 2026-08-02 | Ephemeral `Fixed` via `shouldFlashCannotUpgradeBuildingRefuseCue` / `cannotUpgradeBuildingRefuseCueText` for `cannotUpgradeBuilding` + refuse SFX; sticky long prose suppressed; upgrade rules unchanged; mute ok; `cannot-upgrade-refuse-ephemeral-pl892` |
| PL89.1 Already-upgraded refuse ephemeral | 2026-08-02 | Ephemeral `Max` via `shouldFlashAlreadyUpgradedRefuseCue` / `alreadyUpgradedRefuseCueText` for `alreadyUpgraded` + refuse SFX; sticky long prose suppressed; upgrade rules unchanged; mute ok; `already-upgraded-refuse-ephemeral-pl891` |
| PL88.2 Build-player-land-only refuse ephemeral | 2026-08-02 | Ephemeral `Land` via `shouldFlashBuildPlayerLandOnlyRefuseCue` / `buildPlayerLandOnlyRefuseCueText` for `buildPlayerLandOnly` + refuse SFX; sticky long prose suppressed; place rules unchanged; mute ok; `build-player-land-only-refuse-ephemeral-pl882` |
| PL88.1 Claim-war-need-guild refuse ephemeral | 2026-08-02 | Ephemeral `Guild` via `shouldFlashClaimWarNeedGuildRefuseCue` / `claimWarNeedGuildRefuseCueText` for `claimWarNeedGuild` + refuse SFX; sticky long prose suppressed; soft-war rules unchanged; mute ok; `claim-war-need-guild-refuse-ephemeral-pl881` |
| PL87.3 Guild-exists refuse ephemeral | 2026-08-02 | Ephemeral `Taken` via `shouldFlashGuildExistsRefuseCue` / `guildExistsRefuseCueText` for `guildExists` + refuse SFX; sticky long prose suppressed; guild naming unchanged; mute ok; `guild-exists-refuse-ephemeral-pl873` |
| PL87.2 Guild-not-in refuse ephemeral | 2026-08-02 | Ephemeral `No guild` via `shouldFlashGuildNotInRefuseCue` / `guildNotInRefuseCueText` for `guildNotIn` + refuse SFX; sticky long prose suppressed; guild rules unchanged; mute ok; `guild-not-in-refuse-ephemeral-pl872` |
| PL87.1 Guild-already-in refuse ephemeral | 2026-08-02 | Ephemeral `Member` via `shouldFlashGuildAlreadyInRefuseCue` / `guildAlreadyInRefuseCueText` for `guildAlreadyIn` + refuse SFX; sticky long prose suppressed; guild rules unchanged; mute ok; `guild-already-in-refuse-ephemeral-pl871` |
| PL86.3 Trade-player-missing refuse ephemeral | 2026-08-02 | Ephemeral `Gone` via `shouldFlashTradePlayerMissingRefuseCue` / `tradePlayerMissingRefuseCueText` for `tradePlayerMissing` + refuse SFX; sticky long prose suppressed; trade rules unchanged; mute ok; `trade-player-missing-refuse-ephemeral-pl863` |
| PL86.2 Trade-empty refuse ephemeral | 2026-08-02 | Ephemeral `Empty` via `shouldFlashTradeEmptyRefuseCue` / `tradeEmptyRefuseCueText` for `tradeEmpty` + refuse SFX; sticky long prose suppressed; trade rules unchanged; mute ok; `trade-empty-refuse-ephemeral-pl862` |
| PL86.1 Trade-self refuse ephemeral | 2026-08-02 | Ephemeral `Self` via `shouldFlashTradeSelfRefuseCue` / `tradeSelfRefuseCueText` for `tradeSelf` + refuse SFX; sticky long prose suppressed; trade rules unchanged; mute ok; `trade-self-refuse-ephemeral-pl861` |
| PL85.1 Travel-in-progress refuse ephemeral | 2026-08-02 | Ephemeral `Road` via `shouldFlashTravelInProgressRefuseCue` / `travelInProgressRefuseCueText` for `travelInProgress(sec)` template + refuse SFX; sticky long prose suppressed; caravan timing / costs unchanged; mute ok; `travel-in-progress-refuse-ephemeral-pl851` |
| PL84.2 Mail-inbox-full refuse ephemeral | 2026-08-02 | Ephemeral `Full` via `shouldFlashMailInboxFullRefuseCue` / `mailInboxFullRefuseCueText` for `mailInboxFull` + refuse SFX; sticky long prose suppressed; mailbox caps unchanged; mute ok; `mail-inbox-full-refuse-ephemeral-pl842` |
| PL84.1 Mail-self refuse ephemeral | 2026-08-02 | Ephemeral `Self` via `shouldFlashMailSelfRefuseCue` / `mailSelfRefuseCueText` for `mailSelf` + refuse SFX; sticky long prose suppressed; mail escrow unchanged; mute ok; `mail-self-refuse-ephemeral-pl841` |
| PL83.2 Market-expired refuse ephemeral | 2026-08-02 | Ephemeral `Expired` via `shouldFlashMarketExpiredRefuseCue` / `marketExpiredRefuseCueText` for `marketExpired` + refuse SFX; sticky long prose suppressed; TTL / return rules unchanged; mute ok; `market-expired-refuse-ephemeral-pl832` |
| PL83.1 Market-own-listing refuse ephemeral | 2026-08-02 | Ephemeral `Yours` via `shouldFlashMarketOwnListingRefuseCue` / `marketOwnListingRefuseCueText` for `marketOwnListing` + refuse SFX; sticky long prose suppressed; market fee / escrow unchanged; mute ok; `market-own-listing-refuse-ephemeral-pl831` |
| PL82.3 Claim-war-not-open refuse ephemeral | 2026-08-02 | Ephemeral `Peace` via `shouldFlashClaimWarNotOpenRefuseCue` / `claimWarNotOpenRefuseCueText` for `claimWarNotOpen` + refuse SFX; sticky long prose suppressed; soft-war rules unchanged; mute ok; `claim-war-not-open-refuse-ephemeral-pl823` |
| PL82.2 Claim-war-need-mats refuse ephemeral | 2026-08-02 | Ephemeral `Wood` via `shouldFlashClaimWarNeedMatsRefuseCue` / `claimWarNeedMatsRefuseCueText` for `claimWarNeedMats` + refuse SFX; sticky long prose suppressed; deliver scoring unchanged; mute ok; `claim-war-need-mats-refuse-ephemeral-pl822` |
| PL82.1 Claim-war-already-open refuse ephemeral | 2026-08-02 | Ephemeral `Contest` via `shouldFlashClaimWarAlreadyOpenRefuseCue` / `claimWarAlreadyOpenRefuseCueText` for `claimWarAlreadyOpen` + refuse SFX; sticky long prose suppressed; soft-war rules unchanged; mute ok; `claim-war-already-open-refuse-ephemeral-pl821` |
| PL81.2 Claim-nothing-stored refuse ephemeral | 2026-08-02 | Ephemeral `Empty` via `shouldFlashClaimNothingStoredRefuseCue` / `claimNothingStoredRefuseCueText` for `claimNothingStored` + refuse SFX; sticky long prose suppressed; claim produce rules unchanged; mute ok; `claim-nothing-stored-refuse-ephemeral-pl812` |
| PL81.1 Claim-held-by-other refuse ephemeral | 2026-08-02 | Ephemeral `Held` via `shouldFlashClaimHeldByOtherRefuseCue` / `claimHeldByOtherRefuseCueText` for `claimHeldByOther` + refuse SFX; sticky long prose suppressed; claim / war rules unchanged; mute ok; `claim-held-by-other-refuse-ephemeral-pl811` |
| PL80.2 Claim-need-guild refuse ephemeral | 2026-08-02 | Ephemeral `Guild` via `shouldFlashClaimNeedGuildRefuseCue` / `claimNeedGuildRefuseCueText` for `claimNeedGuild` + refuse SFX; sticky long prose suppressed; claim rules unchanged; mute ok; `claim-need-guild-refuse-ephemeral-pl802` |
| PL80.1 First claim-node walk-up tip once | 2026-08-02 | One-shot ephemeral `Grove · claim territory` + soft world `Claim · E` via `shouldFlashFirstClaimNodeWalkUpCue` / `firstClaimNodeWalkUpCueText` / `claimNodeFirstWalkUpWorldTip` on first claim_node proximity; localStorage; tips gate; claim / war rules unchanged; min HUD; `first-claim-node-walkup-tip-pl801` |
| PL79.2 Vendor-won't-sell refuse ephemeral | 2026-08-02 | Ephemeral `Stock` via `shouldFlashVendorWontSellRefuseCue` / `vendorWontSellRefuseCueText` for `vendorWontSell` + refuse SFX; sticky long prose suppressed; vendor prices unchanged; mute ok; `vendor-wont-sell-refuse-ephemeral-pl792` |
| PL79.1 Vendor-won't-buy refuse ephemeral | 2026-08-02 | Ephemeral `Unwanted` via `shouldFlashVendorWontBuyRefuseCue` / `vendorWontBuyRefuseCueText` for `vendorWontBuy` + refuse SFX; sticky long prose suppressed; vendor prices unchanged; mute ok; `vendor-wont-buy-refuse-ephemeral-pl791` |
| PL78.2 Quest-already-claimed refuse ephemeral | 2026-08-02 | Ephemeral `Claimed` via `shouldFlashQuestAlreadyClaimedRefuseCue` / `questAlreadyClaimedRefuseCueText` for `questAlreadyClaimed` + refuse SFX; sticky long prose suppressed; quest / XP rules unchanged; mute ok; `quest-already-claimed-refuse-ephemeral-pl782` |
| PL78.1 Quest-locked refuse ephemeral | 2026-08-02 | Ephemeral `Locked` via `shouldFlashQuestLockedRefuseCue` / `questLockedRefuseCueText` for `questLocked` + refuse SFX; sticky long prose suppressed; quest / XP rules unchanged; mute ok; `quest-locked-refuse-ephemeral-pl781` |
| PL77.2 First alchemy-bench walk-up tip once | 2026-08-02 | One-shot ephemeral `Alchemy · brew tonic` + soft world `Brew · E` via `shouldFlashFirstAlchemyBenchWalkUpCue` / `firstAlchemyBenchWalkUpCueText` / `alchemyBenchFirstWalkUpWorldTip` on first alchemy_bench proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-alchemy-bench-walkup-tip-pl772` |
| PL77.1 First loom walk-up tip once | 2026-08-02 | One-shot ephemeral `Loom · weave cloth` + soft world `Weave · E` via `shouldFlashFirstLoomWalkUpCue` / `firstLoomWalkUpCueText` / `loomFirstWalkUpWorldTip` on first loom proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-loom-walkup-tip-pl771` |
| PL76.2 First tutor NPC walk-up tip once | 2026-08-02 | One-shot ephemeral `Tutor · learn + claim` + soft world `Talk · E` via `shouldFlashFirstTutorWalkUpCue` / `firstTutorWalkUpCueText` / `tutorFirstWalkUpWorldTip` on first any-profession tutorial_npc proximity; localStorage; tips gate; tutor XP / claim unchanged; min HUD; `first-tutor-walkup-tip-pl762` |
| PL76.1 Quest-not-ready refuse ephemeral | 2026-08-02 | Ephemeral `Objective` via `shouldFlashQuestNotReadyRefuseCue` / `questNotReadyRefuseCueText` for `questNotReady` + refuse SFX; sticky long prose suppressed; quest / XP rules unchanged; mute ok; `quest-not-ready-refuse-ephemeral-pl761` |
| PL75.2 Decor-already-placed refuse ephemeral | 2026-08-02 | Ephemeral `Taken` via `shouldFlashDecorAlreadyPlacedRefuseCue` / `decorAlreadyPlacedRefuseCueText` for `decorAlreadyPlaced` + refuse SFX; sticky long prose suppressed; decor place rules / costs unchanged; mute ok; `decor-already-placed-refuse-ephemeral-pl752` |
| PL75.1 First decor-pad walk-up tip once | 2026-08-02 | One-shot ephemeral `Decor · place yard` + soft world `Place · E` via `shouldFlashFirstDecorPadWalkUpCue` / `firstDecorPadWalkUpCueText` / `decorPadFirstWalkUpWorldTip` on first housing decor_pad proximity; localStorage; tips gate; decor costs unchanged; min HUD; `first-decor-pad-walkup-tip-pl751` |
| PL74.3 First forge walk-up tip once | 2026-08-02 | One-shot ephemeral `Forge · smelt iron` + soft world `Smelt · E` via `shouldFlashFirstForgeWalkUpCue` / `firstForgeWalkUpCueText` / `forgeFirstWalkUpWorldTip` on first forge proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-forge-walkup-tip-pl743` |
| PL74.2 First workshop walk-up tip once | 2026-08-02 | One-shot ephemeral `Workshop · saw planks` + soft world `Saw · E` via `shouldFlashFirstWorkshopWalkUpCue` / `firstWorkshopWalkUpCueText` / `workshopFirstWalkUpWorldTip` on first workshop proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-workshop-walkup-tip-pl742` |
| PL74.1 First mill walk-up tip once | 2026-08-02 | One-shot ephemeral `Mill · grind flour` + soft world `Grind · E` via `shouldFlashFirstMillWalkUpCue` / `firstMillWalkUpCueText` / `millFirstWalkUpWorldTip` on first mill proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-mill-walkup-tip-pl741` |
| PL73.3 Tool-already-repaired refuse ephemeral | 2026-08-02 | Ephemeral `Intact` via `shouldFlashToolAlreadyRepairedRefuseCue` / `toolAlreadyRepairedRefuseCueText` for `toolAlreadyRepaired` + refuse SFX; sticky long prose suppressed; repair rules / costs unchanged; mute ok; `tool-already-repaired-refuse-ephemeral-pl733` |
| PL73.2 Build-cell-occupied refuse ephemeral | 2026-08-02 | Ephemeral `Spot` via `shouldFlashBuildCellOccupiedRefuseCue` / `buildCellOccupiedRefuseCueText` for `buildCellOccupied` + refuse SFX; sticky long prose suppressed; place rules unchanged; mute ok; `build-cell-occupied-refuse-ephemeral-pl732` |
| PL73.1 No-food eat refuse ephemeral | 2026-08-02 | Ephemeral `Food` via `shouldFlashNoFoodRefuseCue` / `noFoodRefuseCueText` for `noFood` + refuse SFX; sticky long prose suppressed; eat / energy numbers unchanged; mute ok; `no-food-refuse-ephemeral-pl731` |
| PL72.2 Tutor claim-ready soft TopBar cue | 2026-08-02 | Brief TopBar `Claim` via `shouldFlashTutorClaimReadyEdgeCue` / `tutorClaimReadyEdgeCueText` when a tutor first edges into claimable (hydrate / account swap quiet; complements world Claim accent PL30.3; XP / claim rules unchanged; mute ok); `tutor-claim-ready-edge-cue-pl722` |
| PL72.1 First expand-pad walk-up tip once | 2026-08-02 | One-shot ephemeral `Expand · unlock field` + soft world `Expand · E` via `shouldFlashFirstExpandPadWalkUpCue` / `firstExpandPadWalkUpCueText` / `expandPadFirstWalkUpWorldTip` on first expand-pad proximity; localStorage; tips gate; expand costs unchanged; min HUD; `first-expand-pad-walkup-tip-pl721` |
| PL71.2 Build-board-missing refuse ephemeral | 2026-08-02 | Ephemeral `Board` via `shouldFlashBuildBoardMissingRefuseCue` / `buildBoardMissingRefuseCueText` for `buildBoardMissing` + refuse SFX; sticky long prose suppressed; place rules unchanged; mute ok; `build-board-missing-refuse-ephemeral-pl712` |
| PL71.1 No-bread energy refuse ephemeral | 2026-08-02 | Ephemeral `Bread` via `shouldFlashNoBreadRefuseCue` / `noBreadRefuseCueText` for `noBread` + refuse SFX; sticky long prose suppressed; eat / energy numbers unchanged; mute ok; `no-bread-refuse-ephemeral-pl711` |
| PL70.2 First notice board walk-up tip once | 2026-08-02 | One-shot ephemeral `Notices · city tips` + soft world `Read · E` via `shouldFlashFirstNoticeBoardWalkUpCue` / `firstNoticeBoardWalkUpCueText` / `noticeBoardFirstWalkUpWorldTip` on first notice_board proximity; localStorage; tips gate; tip / mail rules unchanged; min HUD; `first-notice-board-walkup-tip-pl702` |
| PL70.1 First kitchen walk-up tip once | 2026-08-02 | One-shot ephemeral `Kitchen · cook food` + soft world `Cook · E` via `shouldFlashFirstKitchenWalkUpCue` / `firstKitchenWalkUpCueText` / `kitchenFirstWalkUpWorldTip` on first kitchen proximity; localStorage; tips gate; craft recipes unchanged; min HUD; `first-kitchen-walkup-tip-pl701` |
| PL69.2 Animal pen ready soft cue | 2026-08-02 | Brief TopBar `Ready` via `shouldFlashAnimalPenReadyEdgeCue` / `animalPenReadyEdgeCueText` / `readyAnimalPenIds` when pen first becomes care-ready after cooldown (gameNow edge; hydrate / travel / visit reseed quiet; never-cared `readyAt` null excluded so place stays silent; complements world Ready label; cooldown / feed·clean yields unchanged; mute ok); `animal-pen-ready-edge-cue-pl692` |
| PL69.1 Ore node ready soft cue | 2026-08-02 | Brief TopBar `Ready` via `shouldFlashOreNodeReadyEdgeCue` / `oreNodeReadyEdgeCueText` / `readyOreNodeIds` when ore first becomes chip-ready after cooldown (gameNow edge; hydrate / travel / visit reseed quiet; never-chipped `readyAt` null excluded so place stays silent; complements world Ready label; cooldown / yields unchanged; mute ok); `ore-node-ready-edge-cue-pl691` |
| PL68.4 First hunt trail walk-up tip once | 2026-08-02 | One-shot ephemeral `Trail · hunt` + soft world `Hunt · E` via `shouldFlashFirstHuntTrailWalkUpCue` / `firstHuntTrailWalkUpCueText` / `huntTrailFirstWalkUpWorldTip` on first game_trail or edge_thicket proximity (shared one-shot); localStorage; tips gate; hunt / spawn rates unchanged; min HUD; `first-hunt-trail-walkup-tip-pl684` |
| PL68.3 First crop plot walk-up tip once | 2026-08-02 | One-shot ephemeral `Plot · plant + harvest` + soft world `Plant · E` via `shouldFlashFirstCropPlotWalkUpCue` / `firstCropPlotWalkUpCueText` / `cropPlotFirstWalkUpWorldTip` on first crop_plot proximity; localStorage; tips gate; plant / harvest rules unchanged; min HUD; `first-crop-plot-walkup-tip-pl683` |
| PL68.2 First ore node walk-up tip once | 2026-08-02 | One-shot ephemeral `Ore · chip ore` + soft world `Chip · E` via `shouldFlashFirstOreNodeWalkUpCue` / `firstOreNodeWalkUpCueText` / `oreNodeFirstWalkUpWorldTip` on first ore_node proximity; localStorage; tips gate; chip / hammer rules unchanged; min HUD; `first-ore-node-walkup-tip-pl682` |
| PL68.1 First tree stump walk-up tip once | 2026-08-02 | One-shot ephemeral `Stump · chop wood` + soft world `Chop · E` via `shouldFlashFirstTreeStumpWalkUpCue` / `firstTreeStumpWalkUpCueText` / `treeStumpFirstWalkUpWorldTip` on first tree_stump proximity; localStorage; tips gate; chop rules unchanged; min HUD; `first-tree-stump-walkup-tip-pl681` |
| PL67.1 Low health TopBar accent | 2026-08-02 | Soft warm HP readout via `isHealthLow` / `HEALTH_LOW_TEXT_COLOR` + `data-health-low` / `topbar-health-label` · low while in `COMBAT.lowWarnPct` band (clears when recovered); complements PL64.1 edge cue; health numbers unchanged; no toast stack; `low-health-topbar-accent-pl671` |
| PL66.2 First animal pen walk-up tip once | 2026-08-02 | One-shot ephemeral `Pen · feed + clean` + soft world `Care · E` via `shouldFlashFirstAnimalPenWalkUpCue` / `firstAnimalPenWalkUpCueText` / `animalPenFirstWalkUpWorldTip` on first animal_pen proximity; localStorage; tips gate; care / collect rules unchanged; min HUD; `first-animal-pen-walkup-tip-pl662` |
| PL66.1 First fishing dock walk-up tip once | 2026-08-02 | One-shot ephemeral `Dock · catch fish` + soft world `Catch · E` via `shouldFlashFirstFishingDockWalkUpCue` / `firstFishingDockWalkUpCueText` / `fishingDockFirstWalkUpWorldTip` on first fishing_dock proximity; localStorage; tips gate; catch rules unchanged; min HUD; `first-fishing-dock-walkup-tip-pl661` |
| PL65.2 Fishing dock ready soft cue | 2026-08-02 | Brief TopBar `Ready` via `shouldFlashFishingDockReadyEdgeCue` / `fishingDockReadyEdgeCueText` / `readyFishingDockIds` when a dock edges into cast-ready after cooldown (hydrate / travel / visit / never-cast null readyAt quiet); complements world Ready label (PL30.1); cooldown / yields unchanged; mute ok; `fishing-dock-ready-edge-cue-pl652` |
| PL65.1 Wood stump ready soft cue | 2026-08-02 | Brief TopBar `Ready` via `shouldFlashWoodStumpReadyEdgeCue` / `woodStumpReadyEdgeCueText` / `readyWoodStumpIds` when a stump edges into chop-ready after cooldown (hydrate / travel / visit / never-chopped null readyAt quiet); complements world Ready label (PL23.2); cooldown / yields unchanged; mute ok; `wood-stump-ready-edge-cue-pl651` |
| PL64.2 Missing seed refuse ephemeral | 2026-08-02 | Ephemeral `Seed` via `shouldFlashMissingSeedRefuseCue` / `missingSeedRefuseCueText` for `missingSeed` + refuse SFX; sticky long prose suppressed; plant rules unchanged; mute ok; `missing-seed-refuse-ephemeral-pl642` |
| PL64.1 Health low threshold cue | 2026-08-02 | Brief TopBar `Health low` via `shouldFlashHealthLowCue` / `healthLowThresholdCueText` / `isHealthLow` + `COMBAT.lowWarnPct` (25%, mirrors ENERGY); edge into band only; combat numbers unchanged; mute ok; `health-low-threshold-cue-pl641` |
| PL63.4 Hunt cooldown soft refuse ephemeral | 2026-08-02 | Ephemeral `Scattered` via `shouldFlashHuntCooldownRefuseCue` / `huntCooldownRefuseCueText` for `huntCooldown` + refuse SFX; sticky long prose suppressed; cooldown / spawn rates unchanged; mute ok; `hunt-cooldown-refuse-ephemeral-pl634` |
| PL63.3 Animal pen cooldown soft refuse ephemeral | 2026-08-02 | Ephemeral `Resting` via `shouldFlashAnimalPenCooldownRefuseCue` / `animalPenCooldownRefuseCueText` for `animalPenCooldown` + refuse SFX; sticky long prose suppressed; cooldown numbers unchanged; mute ok; `animal-pen-cooldown-refuse-ephemeral-pl633` |
| PL63.2 Fishing dock cooldown soft refuse ephemeral | 2026-08-02 | Ephemeral `Waiting` via `shouldFlashFishingDockCooldownRefuseCue` / `fishingDockCooldownRefuseCueText` for `fishingDockCooldown` + refuse SFX; sticky long prose suppressed; cooldown numbers unchanged; mute ok; `fishing-dock-cooldown-refuse-ephemeral-pl632` |
| PL63.1 Wood stump cooldown soft refuse ephemeral | 2026-08-02 | Ephemeral `Resting` via `shouldFlashWoodStumpCooldownRefuseCue` / `woodStumpCooldownRefuseCueText` for `woodStumpCooldown` + refuse SFX; sticky long prose suppressed; cooldown numbers unchanged; mute ok; `wood-stump-cooldown-refuse-ephemeral-pl631` |
| PL62.2 Chat send brief cue | 2026-08-02 | Soft `chat` SFX + ephemeral `Sent` via `chatSendSuccessCueText` after successful land/guild send (WS + HTTP); complements receive `Chat` (PL27.2); chat rules unchanged; mute ok; `chat-send-brief-cue-pl622` |
| PL62.1 Trade cancel brief cue | 2026-08-02 | Ephemeral `Cancelled` via `shouldFlashTradeCancelCue` / `tradeCancelSuccessCueText` on outgoing cancel only (incoming reject silent); escrow / nearby rules unchanged; mute ok; `trade-cancel-brief-cue-pl621` |
| PL61.1 Tool durability low threshold cue | 2026-08-02 | Brief TopBar `Tool low` via `shouldFlashToolDurabilityLowCue` / `toolDurabilityLowThresholdCueText` / `equippedToolDurabilitySnapshot` when same equipped stack edges into `TOOL.lowWarnPct` band; plant/gather success cues yield so Tool low stays visible; meter · low accent (PL21.1) stays; durability / break rules unchanged; mute ok; `tool-durability-low-threshold-cue-pl611` |
| PL60.2 Ore cooldown soft refuse ephemeral | 2026-08-02 | Ephemeral `Settling` via `shouldFlashOreCooldownRefuseCue` / `oreCooldownRefuseCueText` for `oreNodeCooldown` + refuse SFX; sticky long prose suppressed; cooldown numbers unchanged; mute ok; `ore-cooldown-refuse-ephemeral-pl602` |
| PL60.1 Crop ready soft world cue | 2026-08-02 | Brief TopBar `Ready` via `shouldFlashCropReadyEdgeCue` / `cropReadyEdgeCueText` / `readyCropPlotIds` when a plot edges into harvest-ready (hydrate / travel / visit reseed quiet); complements pulse+label (PL12.1/PL40.1); grow timers / yields unchanged; mute ok; `crop-ready-edge-cue-pl601` |
| PL59.2 First vendor walk-up tip once | 2026-08-02 | One-shot ephemeral `Vendor · tools + seeds` + soft world `Buy · E` via `shouldFlashFirstVendorWalkUpCue` / `firstVendorWalkUpCueText` / `vendorFirstWalkUpWorldTip` on first vendor_stall proximity; localStorage; tips gate; prices unchanged; min HUD; `first-vendor-walkup-tip-pl592` |
| PL59.1 First market walk-up tip once | 2026-08-02 | One-shot ephemeral `Market · list + buy` + soft world `List · E` via `shouldFlashFirstMarketWalkUpCue` / `firstMarketWalkUpCueText` / `marketFirstWalkUpWorldTip` on first market_board proximity; localStorage; tips gate; complements sticky `post_craft_market`; list / buy / fee rules unchanged; min HUD; `first-market-walkup-tip-pl591` |
| PL58.3 Plot-occupied refuse ephemeral | 2026-08-02 | Ephemeral `Occupied` via `shouldFlashPlotOccupiedRefuseCue` / `plotOccupiedRefuseCueText` for `plotNotEmpty` + refuse SFX; sticky long prose suppressed; plant rules unchanged; mute ok; `plot-occupied-refuse-ephemeral-pl583` |
| PL58.2 Crop-not-ready refuse ephemeral | 2026-08-02 | Ephemeral `Growing` via `shouldFlashCropNotReadyRefuseCue` / `cropNotReadyRefuseCueText` for `cropNotReady` + refuse SFX; sticky long prose suppressed; grow timers unchanged; mute ok; `crop-not-ready-refuse-ephemeral-pl582` |
| PL58.1 Hammer refuse ephemeral | 2026-08-02 | Ephemeral `Hammer` via `shouldFlashHammerRefuseCue` / `hammerRefuseCueText` for `needHammer` / `needHammerBroken` + refuse SFX; sticky long prose suppressed; tool / ore chip rules unchanged; mute ok; `hammer-refuse-ephemeral-pl581` |
| PL57.2 Day-phase change soft cue | 2026-08-02 | Brief TopBar `Dawn` / `Dusk` / `Night` via `shouldFlashDayPhaseChangeCue` / `dayPhaseChangeCueText` on cosmetic phase edge (cycle on); Day / hydrate seed / cycle-off quiet; secondary chrome while non-Day unchanged; cosmetics only; `day-phase-change-cue-pl572` |
| PL57.1 First city hub ephemeral tip once | 2026-08-02 | One-shot ephemeral `City · shared hub` + soft world `Scarce · shared` via `shouldFlashFirstCityHubCue` / `isEnteringCityMap` / `firstCityHubCueText` / `cityHubFirstWorldTip` on first City presence (travel + hydrate); localStorage; tips gate; complements sticky `city_hub`; scarce stations unchanged; min HUD; `first-city-hub-tip-pl571` |
| PL56.3 Guild invite refresh brief cue | 2026-08-02 | Ephemeral `Refreshed` via `guildInviteRefreshSuccessCueText` + soft `guild_claim` SFX after successful `apiRegenerateGuildInvite`; rank / invite rules unchanged; mute ok; `guild-invite-refresh-cue-pl563` |
| PL56.2 Market cancel brief cue | 2026-08-02 | Already shipped as PL10.2 — ephemeral `Cancelled` via `marketSuccessCueText("cancel")` / `flashSuccessCue`; escrow / fees unchanged; mute ok |
| PL56.1 Trade offer create brief cue | 2026-08-02 | Already shipped as PL28.1 — soft `trade_offer` SFX + ephemeral `Offer · to` via `tradeOfferSentCueText`; escrow / nearby rules unchanged; mute ok |
| PL55.2 Deed panel open accent | 2026-08-02 | Brief system tint via `shouldPlayDeedOpenAccent` + `deed-panel--open-accent` / `flashDeedOpenAccent` on B open (settings / wallet path); no combat power; core loops stay wallet-free; `deed-panel-open-accent-pl552` |
| PL55.1 Tutorial NPC panel open accent | 2026-08-02 | Brief social seafoam via `shouldPlayTutorialNpcOpenAccent` + `tutorial-npc-panel--open-accent` / `flashTutorialNpcOpenAccent` on walk-up; XP / claim rules unchanged; `tutorial-npc-open-accent-pl551` |
| PL54.3 Materials refuse ephemeral | 2026-08-02 | Ephemeral `Materials` via `shouldFlashMaterialsRefuseCue` / `materialsRefuseCueText` for `missingMaterials` / `notEnoughItems` + dynamic needMats*; soft refuse SFX; sticky long prose suppressed; recipe / listing rules unchanged; mute ok; `materials-refuse-ephemeral-pl543` |
| PL54.2 Coins refuse ephemeral | 2026-08-02 | Ephemeral `Coins` via `shouldFlashCoinsRefuseCue` / `coinsRefuseCueText` for `notEnoughCoins` + dynamic needCoins* (buy / place / expand / upgrade); soft refuse SFX; prices / costs unchanged; mute ok; `coins-refuse-ephemeral-pl542` |
| PL54.1 Too-far refuse ephemeral | 2026-08-02 | Ephemeral `Closer` via `shouldFlashTooFarRefuseCue` / `tooFarRefuseCueText` on `tooFar`; soft refuse SFX; sticky long prose suppressed; interact ranges unchanged; mute ok; `too-far-refuse-ephemeral-pl541` |
| PL53.2 First warrior map presence tip once | 2026-08-02 | One-shot ephemeral `Warrior · optional` + soft world `Optional · free` via `shouldFlashFirstWarriorMapCue` / `firstWarriorMapCueText` / `warriorFirstMapWorldTip` / `isEnteringWarriorMap` on first Warrior map presence (travel + hydrate); localStorage; tips gate; complements PL45.2 plaque tip; no balance invent; free enter/exit; min HUD; `first-warrior-map-tip-pl532` |
| PL53.1 First visit land tip once | 2026-08-02 | One-shot ephemeral `Visit · trade · T` + soft banner `Trade · T` via `shouldFlashFirstVisitLandCue` / `firstVisitLandCueText` / `visitLandFirstWalkUpWorldTip` on first successful visit (replaces Visiting · name once); localStorage; tips gate; cool tint / visit rules / T unchanged; min HUD; `first-visit-land-tip-pl531` |
| PL52.2 Arena stub panel open accent | 2026-08-02 | Brief warm open accent via `shouldPlayArenaOpenAccent` + `arena-stub-panel--open-accent` / `flashArenaOpenAccent` on plaque open; optional path copy unchanged; no balance invent; `arena-stub-open-accent-pl522` |
| PL52.1 First empty-land build-board tip once | 2026-08-02 | One-shot ephemeral `Land · build board` + soft world `Build · E` via `shouldFlashFirstEmptyLandBuildBoardCue` / `firstEmptyLandBuildBoardCueText` / `emptyLandBuildFirstWalkUpWorldTip` on first empty-yard build_board proximity; localStorage; tips gate; complements PL3.1 beacon; place costs unchanged; min HUD; `first-empty-land-build-board-tip-pl521` |
| PL51.2 Visit land soft atmosphere tint | 2026-08-02 | Cool guest meadow/plot/path + quiet haze via `HOMESTEAD_YARD_VISUAL.visit` / `homesteadYardPresenceFor` / `homesteadYardFloorColors(..., "visit")`; warm home unchanged; visit rules / trade hotkey unchanged; no HUD; `visit-land-atmosphere-pl512` |
| PL51.1 BGM soft transition on map change | 2026-08-02 | Quieter restart / brief crossfade via `BGM_MAP_TRANSITION` / `shouldSoftBgmMapTransition` on landKind/visit bed swap; bed identities unchanged; mute ok; cold start/unmute stay full-gain; `bgm-map-soft-transition-pl511` |
| PL50.2 Guild leave brief cue | 2026-08-02 | Ephemeral `Left` via `guildLeaveSuccessCueText` + soft `guild_claim` SFX after `apiLeaveGuild`; leave rules unchanged; mute ok; `guild-leave-cue-pl502` |
| PL50.1 Guild create / join brief cue | 2026-08-02 | Ephemeral `Created` / `Joined` via `guildCreateSuccessCueText` / `guildJoinSuccessCueText` + soft `guild_claim` SFX after `apiCreateGuild` / `apiJoinGuild`; invite/rank rules unchanged; mute ok; `guild-create-join-cue-pl501` |
| PL49.2 Extra decor pad unlock tip once | 2026-08-02 | One-shot ephemeral `Decor · extra pad` (L5+title → `Homesteader · decor pad`) via `shouldFlashExtraDecorPadUnlockCue` / `extraDecorPadUnlockCueText` / `titleWithDecorPadUnlockCueText`; unlock level/slot unchanged; no HUD column; `extra-decor-pad-unlock-cue-pl492` |
| PL49.1 Character title change ephemeral | 2026-08-02 | Ephemeral `Title · Settler/Homesteader/Veteran` via `shouldFlashCharacterTitleChangeCue` / `characterTitleChangeCueText` (wins over Level N; L5 combines with pad tip); titles cosmetic; min HUD; `character-title-change-cue-pl491` |
| PL48.3 Guild bank withdraw brief cue | 2026-08-02 | Ephemeral `Withdrew` via `guildBankWithdrawSuccessCueText` + soft `guild_claim` SFX after `apiWithdrawGuildBank`; GUILD_BANK slots/stacks unchanged; mute ok; `guild-bank-withdraw-cue-pl483` |
| PL48.2 Guild bank deposit brief cue | 2026-08-02 | Ephemeral `Deposited` via `guildBankDepositSuccessCueText` + soft `guild_claim` SFX after `apiDepositGuildBank`; GUILD_BANK slots/stacks unchanged; mute ok; `guild-bank-deposit-cue-pl482` |
| PL48.1 Craft station upgrade success cue | 2026-08-02 | Ephemeral `Upgraded` via `stationUpgradeSuccessCueText` + soft craft SFX after `apiUpgradeBuilding`; BUILDING_UPGRADES costs unchanged; mute ok; `station-upgrade-success-cue-pl481` |
| PL47.2 Achievement unlock brief cue | 2026-08-02 | Ephemeral `Unlocked · {title}` via `newlyUnlockedAchievementTitles` / `achievementUnlockSuccessCueText` after action poll; hydrate skips flash; unlock rules unchanged; mute ok; `achievement-unlock-cue-pl472` |
| PL47.1 Character level-up ephemeral | 2026-08-02 | Ephemeral `Level N` via `shouldFlashCharacterLevelUpCue` / `characterLevelUpCueText` on characterLevel rise (post-paint effect so action cues don't steal); XP curve unchanged; no always-on column; `character-level-up-cue-pl471` |
| PL46.2 Achievements panel open accent | 2026-08-02 | Brief system tint via `shouldPlayAchievementsOpenAccent` + `achievements-panel--open-accent` (A); reuses inventory accent MS; stub counters unchanged; `guild-achievements-open-accent-pl46` |
| PL46.1 Guild panel open accent | 2026-08-02 | Brief system tint via `shouldPlayGuildOpenAccent` + `guild-panel--open-accent` (G); claim/war rules unchanged; `guild-achievements-open-accent-pl46` |
| PL45.2 Arena optional walk-up tip once | 2026-08-02 | One-shot ephemeral `Arena · optional` + soft world `Optional · E` via `shouldFlashFirstArenaWalkUpCue` / `firstArenaWalkUpCueText` / `arenaFirstWalkUpWorldTip` on first arena_board proximity; localStorage; tips gate; no balance invent; free enter/exit; `first-arena-walkup-tip-pl452` |
| PL45.1 First Explore walk-up tip once | 2026-08-02 | One-shot ephemeral `Explore · hunt + gather` + soft world `Hunt + gather` via `shouldFlashFirstExploreWalkUpCue` / `isEnteringExploreMap` / `firstExploreWalkUpCueText` / `exploreFirstWalkUpWorldTip` on first Explore presence (travel replaces Arrived once; hydrate edge); spawn rates unchanged; min HUD; `first-explore-walkup-tip-pl451` |
| PL44.2 Travel already-here ephemeral | 2026-08-02 | Ephemeral `Already here` via `shouldFlashTravelAlreadyHereCue` / `travelAlreadyHereRefuseCueText` / `flashSuccessCue` + soft refuse SFX; sticky long `travelAlreadyHere` prose suppressed; fare-free destinations unchanged; mute ok; `travel-already-here-ephemeral-pl442` |
| PL44.1 Energy refuse ephemeral | 2026-08-02 | Ephemeral `Energy` via `shouldFlashEnergyRefuseCue` / `energyRefuseCueText` / `flashSuccessCue` + soft refuse SFX; sticky long `notEnoughEnergy` prose suppressed; energy numbers unchanged; mute ok; `energy-refuse-ephemeral-pl441` |
| PL43.3 Vendor buy success cue | 2026-08-02 | Ephemeral `Bought` via `vendorBuySuccessCueText` / `flashSuccessCue` after vendor_buy SFX; prices unchanged; mute ok; `vendor-buy-success-cue-pl433` |
| PL43.2 Vendor sell success cue | 2026-08-02 | Ephemeral `Sold` via `vendorSellSuccessCueText` / `flashSuccessCue` after vendor_sell SFX; prices unchanged; mute ok; `vendor-sell-success-cue-pl432` |
| PL43.1 Gather success ephemeral | 2026-08-02 | Ephemeral `Chopped` / `Mined` / `Caught` / `Collected` via `gatherSuccessCueText` / `flashSuccessCue` after gather SFX; tool-break path stays Tool broke; yields/cooldowns unchanged; mute ok; `gather-success-cue-pl431` |
| PL42.2 First portal walk-up tip once | 2026-08-02 | One-shot ephemeral `Portal · fare-free` + soft world `Fare-free · E` via `shouldFlashFirstPortalWalkUpCue` / `firstPortalWalkUpCueText` / `portalFirstWalkUpWorldTip` on first portal proximity; localStorage one-shot; tips gate; free travel unchanged; min HUD; `first-portal-walkup-tip-pl422` |
| PL42.1 Busy scarce refuse ephemeral | 2026-08-02 | Ephemeral TopBar `Busy` via `shouldFlashBusyStationCue` / `busyStationRefuseCueText` / `flashSuccessCue` + soft refuse SFX; sticky long `stationBusy` prose suppressed; other soft refuses unchanged; contention rules unchanged; mute ok; `busy-scarce-refuse-ephemeral-pl421` |
| PL41.2 Warrior optional-path soft haze | 2026-08-02 | Warm arena haze + plaque emissive polish via `WARRIOR_ARENA_VISUAL.haze*` / `plaqueEmissive*` + `WarriorEnvironment` haze plane + ArenaStubPanel glow; distinct from Explore cool haze (PL36.2); no balance / gear ladder; free enter/exit; `warrior-optional-path-haze-pl412` |
| PL41.1 Low energy threshold brief cue | 2026-08-02 | Ephemeral TopBar `Energy low` via `shouldFlashEnergyLowCue` / `energyLowThresholdCueText` / `flashSuccessCue` on band-edge only; meter warn (PL9.1) stays while low; energy numbers unchanged; mute ok; no always-on column; `energy-low-threshold-cue-pl411` |
| PL40.3 Presence peer soft silhouette | 2026-08-02 | Quiet always-on cool teal halo via `PRESENCE_PEER_SILHOUETTE` under remote avatars + soft nameplate border; distinct from tutor claim gold / warmer cloaks; interact-range ping (PL15.2) still stacks when near; presence rules unchanged; no HUD column; `presence-peer-silhouette-pl403` |
| PL40.2 Travel arrive map-chip pulse | 2026-08-02 | Brief TopBar map-identity chip pulse via `shouldPulseMapChipOnTravelArrive` + `MAP_CHIP_ARRIVE_PULSE_MS` / `topbar-map-chip--arrive-pulse` on successful free travel; fare-free destinations unchanged; refuse silent; `travel-arrive-map-chip-pulse-pl402` |
| PL40.1 Crop ready world name cue | 2026-08-02 | Name-first + soft `Ready` via `cropReadyWorldLabelParts` Html (replaces READY chip); complements pulse (PL12.1); grow timers unchanged; `crop-ready-world-label-pl401` |
| PL39.2 Decor place afford clarity | 2026-08-02 | Soft `Need Nc` + muted/disabled place rows via `decorPlaceShortFundsHint` / `decorPlaceAffordMode`; coin costs unchanged; no HUD column; `decor-place-afford-clarity-pl392` |
| PL39.1 Craft upgrade afford clarity | 2026-08-02 | Soft `Need …` + muted/disabled Upgrade to T2 via `craftUpgradeShortFundsHint` / `craftUpgradeAffordMode` (coins→mats→energy); upgrade costs + recipes unchanged; `craft-upgrade-afford-clarity-pl391` |
| PL38.2 Settings panel open accent | 2026-08-02 | Brief inventory-tint open accent via `shouldPlaySettingsOpenAccent` + `settings-panel--open-accent` (H); prefs / mute (PL37.2) unchanged; `settings-panel-open-accent-pl382` |
| PL38.1 Chat panel open accent | 2026-08-02 | Brief social seafoam open accent via `shouldPlayChatOpenAccent` + `chat-panel--open-accent` (C); receive ping (PL27.2) still works while closed; `chat-panel-open-accent-pl381` |
| PL37.2 Mute toggle brief confirm | 2026-08-02 | Ephemeral `Muted` / `Unmuted` via `muteToggleSuccessCueText` / `flashSuccessCue` on settings mute flip; audio `setMuted` immediate; no always-on audio column; `mute-toggle-brief-confirm-pl372` |
| PL37.1 Portal world label destination | 2026-08-02 | Soft world Html circuit role via `portalWorldLabelParts` + `PORTAL_WORLD_SOFT` / warrior Exit; complements PL5.1 prompt + PL14.2 tint; fare-free; no caravan; `portal-world-label-pl371` |
| PL36.2 Explore wilds soft atmosphere | 2026-08-02 | Cooler canopy + soft haze + sparser trees via `EXPLORE_WILDS_VISUAL` / `exploreWildsFloorColors`; section floors (PL4.*) unchanged; no spawn invent; `explore-wilds-atmosphere-pl362` |
| PL36.1 City civic soft atmosphere | 2026-08-02 | Cooler streets/plaza + quiet civic pads via `CITY_HUB_VISUAL` / `cityHubFloorColors`; warm scarce yard (PL1.1) unchanged; no station invent; `city-civic-atmosphere-pl361` |
| PL35.2 Build place afford clarity | 2026-08-02 | Soft `Need …` + muted/disabled place rows via `buildPlaceShortFundsHint` / `buildPlaceAffordMode` (XP→coins→mats→energy); place costs + land unlimited unchanged; `build-place-afford-clarity-pl352` |
| PL35.1 Craft recipe afford row tint | 2026-08-02 | Quiet recipe-row affordable/short/xp_locked CSS via `craftRecipeAffordMode`; recipes/costs unchanged; short input accent; no HUD column; `craft-recipe-afford-tint-pl351` |
| PL34.3 Notice panel open accent | 2026-08-02 | Brief social seafoam open accent via `shouldPlayNoticeOpenAccent` + `notice-panel--open-accent`; walk-up; tips + unread (PL17.1) still work; `notice-panel-open-accent-pl343` |
| PL34.2 Decor panel open accent | 2026-08-02 | Brief workspace open accent via `shouldPlayDecorOpenAccent` + `decor-panel--open-accent`; walk-up pad; coin costs unchanged; `decor-panel-open-accent-pl342` |
| PL34.1 Mail panel open accent | 2026-08-02 | Brief social seafoam open accent via `shouldPlayMailOpenAccent` + `mail-panel--open-accent` (L); coexists with unread (PL17.1); escrow unchanged; `mail-panel-open-accent-pl341` |
| PL33.3 Deed / wallet surface brief cues | 2026-08-02 | Ephemeral `Deed claimed` / `Deed minted` / `Deed listed` / `Deed unlisted` / `Wallet linked` / `Wallet disconnected` via success-cue helpers / `flashSuccessCue`; sticky cosmetic/stub prose removed; settings + deed panel only; no combat power; core loops wallet-free; `deed-wallet-brief-cues-pl333` |
| PL33.2 Hunt encounter brief cues | 2026-08-02 | Soft `hunt` win / `hunt_lose` SFX + ephemeral `Won ·` / `Lost ·` via `huntEncounterSuccessCueText` / `flashSuccessCue`; sticky encounter loot/rounds prose removed; loot / energy drain unchanged; mute ok; `hunt-encounter-brief-cues-pl332` |
| PL33.1 Tool broke brief cue | 2026-08-02 | Soft `tool_break` SFX + ephemeral `Tool broke` via `toolBrokeSuccessCueText` / `shouldFlashToolBrokeCue` / `flashSuccessCue`; sticky “Craft or equip another” prose removed; durability rules unchanged; mute ok; `tool-broke-brief-cue-pl331` |
| PL32.2 Market list afford clarity | 2026-08-02 | Soft `Need Nc` hint + muted/disabled Buy on short-funds others' rows via `marketBuyShortFundsHint` / `commerceBuyAffordMode`; own cancel unchanged; listings/TTL unchanged; mute ok; `market-list-afford-clarity-pl322` |
| PL32.1 Vendor row afford tint | 2026-08-02 | Quiet buy-row affordable/short CSS tint via `commerceBuyAffordMode` + `softCurrency`; sell rows neutral; prices unchanged; no HUD column; `vendor-row-afford-tint-pl321` |
| PL31.2 Guild claim / soft-war brief cues | 2026-08-02 | Soft `guild_claim` / `soft_war` SFX + ephemeral `Grove claimed` / `Soft war` / `Collected · N` / `Delivered · N` via success-cue helpers / `flashSuccessCue`; sticky Wild Grove prose removed; rules unchanged; mute ok; `guild-claim-soft-war-cues-pl312` |
| PL31.1 Visit interact sticky declutter | 2026-08-02 | Visit E no longer sticky-sets leave/trade prose (`visitInteractStickyInfo` → null); banner + Esc/Go home; T trade hotkey unchanged; `visit-interact-sticky-declutter-pl311` |
| PL30.3 Tutor claimable world accent | 2026-08-02 | Quiet pad/halo + name-first soft `Claim` via `TUTOR_CLAIMABLE_WORLD_CUE` / `tutorClaimableWorldLabelParts`; list refresh `apiListTutorialNpcs` + `tutorClaimableProfessionIds`; claim XP/coins unchanged; no HUD column; `tutor-claimable-world-accent-pl303`
| PL30.2 Animal pen ready world label | 2026-08-02 | Name-first + soft `Ready` via extended `gatherStationReadyWorldLabelParts`; quiet depleted pad/timer; care CD/yields unchanged; no spawn invent; `animal-pen-ready-world-label-pl302` |
| PL30.1 Fishing dock ready world label | 2026-08-02 | Name-first + soft `Ready` (PL23.2 SoT) on catch-available dock; depleted stay timer/water pad; cooldown/yields unchanged; `fishing-dock-ready-world-label-pl301` |
| PL29.3 Quest claim success cue | 2026-08-02 | Soft `quest_claim` SFX + ephemeral `Quest claimed` via `questClaimSuccessCueText` / `flashSuccessCue`; sticky XP prose removed; distinct from tutor `Claimed`; XP/coins unchanged; fail silent; mute ok; `quest-claim-success-cue-pl293` |
| PL29.2 Quest panel open accent | 2026-08-02 | Brief border/header seafoam tint on Quest log open (Q); rewards unchanged; `SOCIAL_PANEL_OPEN_ACCENT_MS`; `quest-panel-open-accent-pl292` |
| PL29.1 Trade panel open accent | 2026-08-02 | Brief border/header seafoam tint on Trade open (T / invite review); escrow unchanged; `SOCIAL_PANEL_OPEN_ACCENT_MS`; `trade-panel-open-accent-pl291` |
| PL28.3 Subsequent station place Built cue | 2026-08-02 | Soft `build` SFX + ephemeral `Built` via `stationBuiltSuccessCueText` / `flashSuccessCue` on later places; first place stays Homestead (PL25.2); sticky `Built ….` removed; place costs unchanged; mute ok; `station-built-cue-pl283` |
| PL28.2 Mail send / cancel brief cues | 2026-08-02 | Ephemeral `Parcel sent` / `Parcel cancelled` via `mailSendSuccessCueText` / `mailCancelSuccessCueText` / `flashSuccessCue`; sticky claim-online / goods-returned prose removed; escrow unchanged; mute ok; `mail-send-cancel-brief-cues-pl282` |
| PL28.1 Trade offer sent cue | 2026-08-02 | Soft `trade_offer` SFX + ephemeral `Offer · to` via `tradeOfferSentCueText` / `flashSuccessCue`; sticky escrow prose removed; empty to-user silent; mute ok; `trade-offer-sent-cue-pl281` |
| PL27.2 Chat receive soft ping | 2026-08-02 | Quiet `chat` SFX + ephemeral `Chat` while panel closed via `shouldPlayChatReceivePing` / cooldown `CHAT_RECEIVE_PING_COOLDOWN_MS`; own echo + panel-open silent; no always-on column; mute ok; `chat-receive-soft-ping-pl272` |
| PL27.1 Visit leave brief cue | 2026-08-02 | Soft `visit_leave` SFX + ephemeral `Home` via `visitLeaveSuccessCueText` / `flashSuccessCue`; complements PL15.1 arrive; own-land idle silent (`visitLandRef` gate); sticky “Back on your land.” removed; mute ok; `visit-leave-brief-cue-pl271` |
| PL26.2 Expand refuse clarity | 2026-08-02 | Walk-up `Expand field · Need …` via `expandRefuseClarityText` / `expandSlotShortfall` when short; affordable keeps full cost; sticky coin/mat/energy strings unchanged; PL16.1 soft refuse stays narrow (energy yes, coin/mat silent); `expand-refuse-clarity-pl262` |
| PL26.1 Expand pad afford tint | 2026-08-02 | Quiet world pad tint via `EXPAND_PAD_AFFORD_CUE` + `expandPadAffordMode` / `expandPadMeshColors`; affordable green vs short muted; costs unchanged; no HUD column; `expand-pad-afford-tint-pl261` |
| PL25.2 First station place homestead cue | 2026-08-02 | Ephemeral `Homestead` via `isFirstHomesteadStationPlace` + `homesteadFirstPlaceSuccessCueText` on first placeable station; subsequent Built via PL28.3; mute ok; `first-station-homestead-cue-pl252` |
| PL25.1 Repair tool success cue | 2026-08-02 | Inventory Repair + soft `repair` SFX + ephemeral `Repaired`; `TOOL.repairMats` (1 wood / 1 iron_bar); fail silent; `repair-tool-success-cue-pl251`, `repair-tool-pl251` |
| PL24.3 Travel panel open accent | 2026-08-02 | Brief border/header tint on Travel open (N / portal / notice / arena); fare-free destinations unchanged; `travel-panel-open-accent-pl243` |
| PL24.2 Craft panel open accent | 2026-08-02 | Brief border/header tint on craft station walk-up open; recipes unchanged; `craft-panel-open-accent-pl242` |
| PL24.1 Build panel open accent | 2026-08-02 | Brief border/header tint on Build Board walk-up open; place costs unchanged; `build-panel-open-accent-pl241` |
| PL23.2 Gather station name cue when ready | 2026-08-02 | Tree / Ore Rock name-first + soft `Ready` when choppable/mineable; depleted stay timer/pad (PL12.2); no spawn invent; `gather-ready-world-label-pl232` |
| PL23.1 Process station world labels | 2026-08-02 | Name-first + soft `Craft` via `processStationWorldLabelParts` on mill/forge/kitchen/workshop/loom/alchemy; costs/recipes unchanged; `process-station-world-label-pl231` |
| PL22.2 Housing decor world label polish | 2026-08-02 | Name-first + soft `Decor` via `housingDecorWorldLabelParts`; Html on planter/banner; costs unchanged; `housing-decor-world-label-pl222` |
| PL22.1 Built-yard soft atmosphere | 2026-08-02 | `HOMESTEAD_YARD_VISUAL` + `homesteadYardAtmosphereMode` (same station gate as PL3.1); lived plot/path + quiet pad; empty beacon still works; `built-yard-atmosphere-pl221` |
| PL21.2 Broken tool refuse clarity | 2026-08-02 | `needHammerBroken` when no Iron Hammer in inv; `needHammer` when unequipped; walk-up `oreChipInteractLabel`; soft refuse on both; mute ok; `broken-tool-refuse-clarity-pl212` |
| PL21.1 Low tool durability accent | 2026-08-02 | `TOOL.lowWarnPct` (20%) + `isToolDurabilityLow`; inventory `· nearly broken` + TopBar equipped `· low` warm accent; clears when repaired/replaced; no toast; `low-tool-durability-pl211` |
| PL20.3 Expand field success cue | 2026-08-02 | Soft `expand` SFX + ephemeral TopBar `Expanded` via `expandFieldSuccessCueText` / `flashSuccessCue`; costs unchanged; fail silent/refuse; `expand-field-success-cue-pl203` |
| PL20.2 Equip tool brief cue | 2026-08-02 | Soft `equip` SFX + ephemeral `Equipped` / `Unequipped` via `equipToolSuccessCueText` / `flashSuccessCue`; durability unchanged; mute ok; `equip-tool-brief-cue-pl202` |
| PL20.1 Eat food success cue | 2026-08-02 | Soft `eat` SFX + ephemeral TopBar `Ate` via `eatFoodSuccessCueText` / `flashSuccessCue`; energy numbers unchanged; empty/refuse silent; `eat-food-success-cue-pl201` |
| PL19.2 Market panel open accent | 2026-08-02 | Brief border/header tint on Market open (walk-up board or M); `ECONOMY_PANEL_OPEN_ACCENT_MS`; listings unchanged; `market-panel-open-accent-pl192` |
| PL19.1 Vendor panel open accent | 2026-08-02 | Brief border/header tint on Vendor Stall walk-up open (PL9.2 pattern); same panel; no price retune; `vendor-panel-open-accent-pl191` |
| PL18.2 Trade accept success cue | 2026-08-02 | Soft `trade_accept` SFX + ephemeral TopBar `Trade accepted` via `tradeAcceptSuccessCueText` / `flashSuccessCue`; reject/cancel silent; escrow unchanged; `trade-accept-success-cue-pl182` |
| PL18.1 Trade invite receive cue | 2026-08-02 | Soft `trade_invite` SFX + ephemeral `Trade · from` via `tradeInviteReceiveCueText` / `flashSuccessCue`; sticky T-prose removed; no trade HUD column; mute ok; `trade-invite-receive-cue-pl181` |
| PL17.2 Mail claim success cue | 2026-08-02 | Ephemeral TopBar `Parcel claimed` via `mailClaimSuccessCueText` / `flashSuccessCue`; sticky prose removed; escrow unchanged; `mail-claim-success-cue-pl172` |
| PL17.1 Unread mail / notice accent | 2026-08-02 | Notice world pad/halo + prompt `· New` while tip ids unread (localStorage seen); mail panel soft unread accent on pending inbox; same panels; no HUD column; `unread-mail-notice-accent-pl171`, `unread-notice-prompt-pl171` |
| PL16.2 Decor place success cue | 2026-08-02 | Soft `decor` SFX + ephemeral `Decor placed` via `decorPlaceSuccessCueText` / `flashSuccessCue`; costs unchanged; fail silent or refuse path; sticky cosmetic prose removed; `decor-place-success-cue-pl162` |
| PL16.1 Soft refuse SFX | 2026-08-02 | Quiet descending `refuse` via `isSoftRefuseError` on stationBusy / notEnoughEnergy / travelAlreadyHere only; wired in `applyState`; success cues unchanged; mute ok; `soft-refuse-sfx-pl161` |
| PL15.2 Nearby peer soft ping | 2026-08-02 | Quiet floor ring via `NEARBY_PEER_PING` + `inWorldInteractRange` / `peersInInteractRange` when peer in interact range; zero peers quiet (PL2.2); no HUD list growth; `nearby-peer-ping-pl152` |
| PL15.1 Visit arrive confirm | 2026-08-02 | Soft `visit` SFX + ephemeral `Visiting · owner` via `visitSuccessCueText` / `flashSuccessCue`; own/refuse silent; mute ok; sticky leave prose removed (banner covers stay); `visit-arrive-confirm-pl151` |
| PL14.2 Portal mesh tint by destination | 2026-08-02 | Portal veil/frame via `MAP_IDENTITY` / `portalMeshTintForLandKind` by circuit role; fare-free prompts + warrior Exit-first unchanged; `portal-mesh-tint-pl142` |
| PL14.1 Current-map chip (min HUD) | 2026-08-02 | Quiet TopBar chip City/Land/Explore/Arena via `formatCurrentMapChip`; warrior optional Arena wording; updates on travel; `current-map-chip-pl141` |
| PL13.2 Tutor claim brief cue | 2026-08-02 | Ephemeral TopBar `Claimed` via `tutorClaimSuccessCueText` + `flashSuccessCue`; XP/coins unchanged; fail silent; `tutor-claim-cue-pl132` |
| PL13.1 First free-travel tip | 2026-08-02 | One-shot `free_travel` tip after city hub / on City (`firstFreeTravelTip`); four maps · fare-free · N; dismissible min HUD; `free-travel-tip-pl131` |
| PL12.2 Gather node depleted cue | 2026-08-02 | Quiet depleted pad + stump/ore tint via `GATHER_NODE_DEPLETED_CUE`; ready stays bright; no spawn invent; `gather-node-depleted-cue-pl122` |
| PL12.1 Crop ready world pulse | 2026-08-02 | Soft ready pad + clock-driven emissive pulse (`CROP_READY_WORLD_PULSE`); empty/growing quiet; no timer retune; `crop-ready-world-pulse-pl121` |
| PL11.2 Arena enter travel cue | 2026-08-02 | `travel_warrior` SFX + TravelPanel warrior blurb emphasis; fare-free; mute ok; `arena-enter-travel-cue-pl112` |
| PL11.1 Arena floor / plaque contrast | 2026-08-02 | `WARRIOR_ARENA_VISUAL` scorched grounds + clay ring + plaque accent; homestead refuse; `arena-floor-plaque-contrast-pl111` |
| PL10.2 Market list/buy brief success cue | 2026-08-02 | Ephemeral `Listed`/`Bought`/`Cancelled` via `marketSuccessCueText` + `flashSuccessCue`; min HUD; `market-success-cue-pl102` |
| PL10.1 Vendor buy/sell SFX | 2026-08-02 | `SFX_PRESETS` vendor_buy/vendor_sell; success-only + mute; no price retune; `vendor-buy-sell-sfx-pl101` |
| PL9.2 Inventory open accent | 2026-08-02 | Brief accent on hotkey bag open (`INVENTORY_OPEN_ACCENT_MS`); same panel; `inventory-open-accent-pl92` |
| PL9.1 Low-energy TopBar cue | 2026-08-02 | `ENERGY.lowWarnPct` + `isEnergyLow`; soft warm meter/`· low`; min HUD; `low-energy-topbar-pl91` |
| PL8.2 Busy interact prompt copy | 2026-08-02 | City scarce prompts append `· Free` / `· Busy` from presence; land/explore/tutors unchanged; hierarchy action-first; `busy-prompt-copy-pl82` |
| PL8.1 Busy station world cue | 2026-08-02 | Soft-busy pad + emissive halo + world `Busy`; `isStationContendedByPresence` shared SoT; land unlimited; `busy-station-world-cue-pl81` |
| PL7.2 Explore ambient tint vs land | 2026-08-02 | Explore bed sparser/tenser (saw + partial) vs Land sine; no combat suite; `bgm-explore-tint-pl72` |
| PL7.1 Per-map soft BGM tint | 2026-08-02 | `BGM_BEDS` city/land/explore/warrior; `setBgmLandKind` + mute; GameApp follows map; `bgm-map-tint-pl71` |
| PL6.2 Brief success cue on core actions | 2026-08-02 | Ephemeral TopBar cue (`Planted`/`Harvested`/`Crafted`/`Arrived ·`) auto-clears `SUCCESS_CUE_MS`; prompt pulse plant/harvest; `success-cue-pl62` |
| PL6.1 SFX for gather / build / travel | 2026-08-02 | `SFX_PRESETS` gather/build/travel; success paths + mute; `core-action-sfx-pl61` |
| PL5.2 TravelPanel you-are-here polish | 2026-08-02 | Stronger here border/accent + `You are here`; one-line blurbs; `isTravelDestinationHere` / `travelDestinationActionLabel`; `travel-panel-here-pl52` |
| PL5.1 Portal free-travel prompt clarity | 2026-08-02 | `Travel · free ·` circuit; warrior `Exit · Travel · free (N)`; hierarchy verb=Travel; fare-free; `portal-prompts-pl51` |
| PL4.2 Hunt vs gather floor separation | 2026-08-02 | Distinct woodland/mines/hunt floors + hunt `pathColor` trail belt; no homestead hunt; `explore-floor-separation-pl42` |
| PL4.1 Explore section label contrast | 2026-08-02 | `labelAccent` + stronger hints on `EXPLORE_SECTIONS`; ForestEnvironment high-contrast Html; prompts still prefix label; `explore-section-label-contrast-pl41` |
| PL3.2 BuildPanel grouped by profession | 2026-08-02 | `PLAYER_LAND_STATION_BUILD_GROUPS` gather/process/care; costs unchanged; `build-panel-groups-pl32` |
| PL3.1 Empty-land build board beacon | 2026-08-02 | Glow pad + “Build here · empty land”; softens to “Build” after first station; tip stays dismissible; `empty-land-beacon-pl31` |
| PL2.3 Single contextual panel focus | 2026-08-02 | Soft `hud-panel-dim` + clear prompt/tips while panel open; `panel-focus` helpers; `panel-focus-pl23` |
| PL2.2 TopBar declutter (day phase / nearby) | 2026-08-02 | Quiet secondary line via `formatQuietHudExtras`; hide default Day + zero nearby; visiting banner unchanged; `topbar-declutter-pl22` |
| PL2.1 Interact prompt action-first hierarchy | 2026-08-02 | Key badge + verb hierarchy (`buildInteractPromptHierarchy`); lean chip chrome (not `.panel`); `interact-prompt-hierarchy-pl21` |
| PL1.3 Market / vendor / notice service visuals | 2026-08-02 | `CITY_SERVICE_VISUAL_KITS` awning/board/post; VendorStall stripes + Market listing strips + Notice single-post; `city-service-visuals-pl13` + `city-service-prompts-pl13` |
| PL1.2 Tutor silhouette cloak colors | 2026-08-02 | `TUTOR_CLOAK_COLORS` + `tutorialNpcCloakColor` for all seeded; BuildingMesh uses SoT; `tutor-cloak-colors-pl12` |
| PL1.1 City scarce-yard + wayfinding | 2026-08-02 | `CITY_ATMOSPHERE_LABELS` + `cityScarceStationMarkers`; CityEnvironment pads/labels + civic door/window; `city-scarce-yard-pl11` |
| CL98.3 Regression smoke CL95–CL98 | 2026-08-02 | reuse `citylands-smoke-cl903` scarce/land, Fisher/Alchemist/flour, wood premium, mail/market cancel, notice/warrior |
| CL98.2 Warrior arena optional green | 2026-08-02 | reuse `warrior-arena-board-cl902` plaque/tip optional + no balance; homestead refuse |
| CL98.1 Notice tip / scarce_stations green | 2026-08-02 | reuse `notice-board-tips-cl901` travel/scarce/warrior ids + scarce vs land copy |
| CL97.3 Market cancel returns escrow green | 2026-08-02 | reuse `market-cancel-escrow-cl893` list→cancel restore; cancel-not-yours refuse |
| CL97.2 Mail cancel returns escrow green | 2026-08-02 | reuse `mail-cancel-escrow-cl892` send→cancel restore; cancel-not-yours refuse |
| CL97.1 Explore premium wood sell green | 2026-08-02 | reuse `explore-premium-wood-sell-cl891` Explore > City wood; empty refuse |
| CL96.3 Land flour City vendor sink | 2026-08-02 | reuse `land-flour-vendor-sink-cl883` City sell @5; empty refuse; Explore regional 3 |
| CL96.2 Alchemist tutor claim after land brew | 2026-08-02 | reuse `alchemist-tutor-claim-cl882` land brew tonic → City claim; incomplete refuse |
| CL96.1 Fisher tutor claim after land dock catch | 2026-08-02 | reuse `fisher-tutor-claim-cl881` land dock catch → City claim; incomplete refuse |
| CL95.3 Land unlimited craft (no stationBusy) | 2026-08-02 | reuse `land-unlimited-craft-cl873` peer on player_land kitchen/workshop OK; city still busy |
| CL95.2 City scarce tree/ore gather contention | 2026-08-02 | reuse `city-scarce-gather-contention-cl872` city stump+ore `stationBusy`; land unlimited |
| CL95.1 City scarce kitchen/workshop craft | 2026-08-02 | reuse `city-scarce-craft-contention-cl871` city kitchen+workshop `stationBusy`; land unlimited |
| CL94.3 Regression smoke CL91–CL94 | 2026-08-02 | reuse `citylands-smoke-cl863` (Explore saw, crate/fish+eat, visit/trade/market, min HUD + free travel) |
| CL94.2 Four-map free travel / portal prompts | 2026-08-02 | reuse `four-map-travel-cl862` fare-free circuit + Free travel · Exit · N |
| CL94.1 Min HUD / interact prompts green | 2026-08-02 | reuse `min-hud-interact-cl861` walk-up craft/portal/market; closed panels |
| CL93.3 Market buy + TTL escrow green | 2026-08-02 | reuse `market-buy-ttl-escrow-cl853` cross-buy + TTL restore; own-list refuse |
| CL93.2 Trade invite accept + cancel green | 2026-08-02 | reuse `trade-invite-accept-cancel-cl852` nearby accept/cancel; far + tradeSelf |
| CL93.1 Visit presence + nearby trade green | 2026-08-02 | reuse `visit-presence-trade-cl851` visit host + trade ping; own-visit + far refuse |
| CL92.3 Bread / stew / ration eat energy | 2026-08-02 | reuse `bread-stew-ration-eat-cl843` +25/+55/+75; empty `noBread`/`noFood` |
| CL92.2 Land cooked_fish City vendor sink | 2026-08-02 | reuse `land-cooked-fish-vendor-sink-cl842` catch→cook→City sell @4; empty refuse |
| CL92.1 Land wood_crate City vendor sink | 2026-08-02 | reuse `land-crate-vendor-sink-cl841` land crate → City sell @3; empty refuse |
| CL91.3 Explore leather → land weave green | 2026-08-02 | reuse `explore-leather-weave-cl833` dual-trail → land `weave_cloth`; missing refuse |
| CL91.2 Explore ore → land smelt green | 2026-08-02 | reuse `explore-ore-smelt-cl832` Explore chip×2 → land `smelt_iron_bar`; missing refuse |
| CL91.1 Explore wood → land saw green | 2026-08-02 | reuse `explore-wood-saw-planks-cl831` Explore stump×2 → land `saw_planks`; missing refuse |
| CL90.3 Regression smoke CL87–CL90 | 2026-08-02 | `citylands-smoke-cl903` scarce/land, Fisher/Alchemist/flour, wood premium, mail/market cancel, notice/warrior |
| CL90.2 Warrior arena optional green | 2026-08-02 | `warrior-arena-board-cl902` plaque/tip optional + no balance; homestead refuse |
| CL90.1 Notice tip / scarce_stations green | 2026-08-02 | `notice-board-tips-cl901` travel/scarce/warrior ids + scarce vs land copy |
| CL89.3 Market cancel returns escrow green | 2026-08-02 | `market-cancel-escrow-cl893` list→cancel restore; cancel-not-yours refuse |
| CL89.2 Mail cancel returns escrow green | 2026-08-02 | `mail-cancel-escrow-cl892` send→cancel restore; cancel-not-yours refuse |
| CL89.1 Explore premium wood sell green | 2026-08-02 | `explore-premium-wood-sell-cl891` Explore > City wood; empty refuse |
| CL88.3 Land flour City vendor sink | 2026-08-02 | `land-flour-vendor-sink-cl883` City sell @5; empty refuse; Explore regional 3 |
| CL88.2 Alchemist tutor claim after land brew | 2026-08-02 | `alchemist-tutor-claim-cl882` land brew tonic → City claim; incomplete refuse |
| CL88.1 Fisher tutor claim after land dock catch | 2026-08-02 | `fisher-tutor-claim-cl881` land dock catch → City claim; incomplete refuse |
| CL87.3 Land unlimited craft (no stationBusy) | 2026-08-02 | `land-unlimited-craft-cl873` peer on player_land kitchen/workshop OK; city still busy |
| CL87.2 City scarce tree/ore gather contention | 2026-08-02 | `city-scarce-gather-contention-cl872` city stump+ore `stationBusy`; land unlimited |
| CL87.1 City scarce kitchen/workshop craft | 2026-08-02 | `city-scarce-craft-contention-cl871` city kitchen+workshop `stationBusy`; land unlimited |
| CL86.3 Regression smoke CL83–CL86 | 2026-08-02 | `citylands-smoke-cl863` Explore saw, crate/fish+eat, visit/trade/market, min HUD + free travel |
| CL86.2 Four-map free travel / portal prompts | 2026-08-02 | `four-map-travel-cl862` fare-free circuit + Free travel · Exit · N; already-here refuse |
| CL86.1 Min HUD / interact prompts green | 2026-08-02 | `min-hud-interact-cl861` walk-up craft/portal/market; closed panels; no invent |
| CL85.3 Market buy + TTL escrow green | 2026-08-02 | `market-buy-ttl-escrow-cl853` cross-buy + TTL restore; own-list refuse |
| CL85.2 Trade invite accept + cancel green | 2026-08-02 | `trade-invite-accept-cancel-cl852` nearby accept/cancel; far + tradeSelf refuse |
| CL85.1 Visit presence + nearby trade green | 2026-08-02 | `visit-presence-trade-cl851` visit host + trade ping; own-visit + far refuse |
| CL84.3 Bread / stew / ration eat energy | 2026-08-02 | `bread-stew-ration-eat-cl843` +25/+55/+75; empty `noBread`/`noFood` |
| CL84.2 Land cooked_fish City vendor sink | 2026-08-02 | `land-cooked-fish-vendor-sink-cl842` catch→cook→City sell @4; empty refuse |
| CL84.1 Land wood_crate City vendor sink | 2026-08-02 | `land-crate-vendor-sink-cl841` land crate → City sell @3; empty refuse |
| CL83.3 Explore leather → land weave green | 2026-08-02 | `explore-leather-weave-cl833` dual-trail → land `weave_cloth`; missing refuse |
| CL83.2 Explore ore → land smelt green | 2026-08-02 | `explore-ore-smelt-cl832` Explore chip×2 → land `smelt_iron_bar`; missing refuse |
| CL83.1 Explore wood → land saw green | 2026-08-02 | `explore-wood-saw-planks-cl831` Explore stump×2 → land `saw_planks`; missing refuse |
| CL82.3 Regression smoke CL79–CL82 | 2026-08-02 | `citylands-smoke-cl823` scarce/land, Farmer/Weaver/bread, Explore premium, mail/market, notice/warrior |
| CL82.2 Warrior arena optional green | 2026-08-02 | `warrior-arena-board-cl822` plaque/tip optional + no balance; homestead refuse |
| CL82.1 Notice tip / scarce_stations green | 2026-08-02 | `notice-board-tips-cl821` travel/scarce/warrior ids + scarce vs land copy |
| CL81.3 Market cancel returns escrow green | 2026-08-02 | `market-cancel-escrow-cl813` list→cancel restore; cancel-not-yours refuse |
| CL81.2 Mail parcel claim still green | 2026-08-02 | `mail-parcel-claim-cl812` send→claim escrow; already-claimed + missing refuse |
| CL81.1 Explore premium leather/ore sell | 2026-08-02 | `explore-premium-leather-ore-sell-cl811` Explore > City leather+ore; empty refuse |
| CL80.3 Land mill→bake→City bread sell | 2026-08-02 | `land-mill-bake-bread-sell-cl803` mill→bake→vendor @3; empty refuse |
| CL80.2 Weaver tutor claim after land weave | 2026-08-02 | `weaver-tutor-claim-cl802` land loom weave → City claim; incomplete refuse |
| CL80.1 Farmer tutor claim after land plant/harvest | 2026-08-02 | `farmer-tutor-claim-cl801` land plant→harvest → City claim; incomplete refuse |
| CL79.3 Land unlimited craft (no stationBusy) | 2026-08-02 | `land-unlimited-craft-cl793` peer on player_land kitchen/workshop OK; city still busy |
| CL79.2 City scarce tree/ore gather contention | 2026-08-02 | `city-scarce-gather-contention-cl792` city stump+ore `stationBusy`; land unlimited |
| CL79.1 City scarce kitchen/workshop craft | 2026-08-02 | `city-scarce-craft-contention-cl791` city kitchen+workshop `stationBusy`; land unlimited |
| CL78.3 Regression smoke CL75–CL78 | 2026-08-02 | `citylands-smoke-cl783` flour/bandage/plank, mail/trade/market, wood premium, XP gates, hunt refuse, min HUD + travel |
| CL78.2 Four-map free travel green | 2026-08-02 | `four-map-travel-cl782` city↔land↔explore↔warrior fare-free; already-here refuse |
| CL78.1 Min HUD / interact prompts green | 2026-08-02 | `min-hud-interact-cl781` walk-up craft/portal/market; closed panels; no invent |
| CL77.3 Homestead hunt refuse green | 2026-08-02 | `homestead-hunt-refuse-cl773` Explore trail/thicket OK; land `huntExploreOnly` |
| CL77.2 Recipe XP gate fidelity green | 2026-08-02 | `recipe-xp-gate-fidelity-cl772` pack_travel_ration cook≥25 / forge_iron_hammer smith≥20 |
| CL77.1 Explore premium wood sell green | 2026-08-02 | `explore-premium-wood-sell-cl771` Explore > City wood; empty refuse |
| CL76.3 Market buy from listing green | 2026-08-02 | `market-buy-listing-cl763` cross-buy plank; own-list `marketOwnListing` |
| CL76.2 Trade invite accept + cancel green | 2026-08-02 | `trade-invite-accept-cancel-cl762` nearby accept/cancel; far + tradeSelf refuse |
| CL76.1 Mail cancel returns escrow green | 2026-08-02 | `mail-cancel-escrow-cl761` send→cancel restore; cancel-not-yours refuse |
| CL75.3 Land plank City vendor / market | 2026-08-02 | `land-plank-vendor-sink-cl753` land plank → City sell @4 + market list; empty refuse |
| CL75.2 Land cloth_bandage City vendor sink | 2026-08-02 | `land-bandage-vendor-sink-cl752` land bandage → City sell @2; empty refuse |
| CL75.1 Land flour City vendor sink green | 2026-08-02 | `land-flour-vendor-sink-cl751` land flour → City sell @5; empty refuse |
| CL74.3 Regression smoke CL71–CL74 | 2026-08-02 | `citylands-smoke-cl743` Explore saw/smelt, AH+MH claims, bread/stew, crate, visit/mail, portal |
| CL74.2 City vendor buy seed/tool green | 2026-08-02 | `city-vendor-buy-seed-tool-cl742` wheat_seed @8 + wooden_hoe @12; broke refuse |
| CL74.1 Portal free-travel prompts green | 2026-08-02 | `portal-prompts-cl741` Free travel · circuit; warrior Exit · N |
| CL73.3 Mail send refuse edges green | 2026-08-02 | `mail-send-refuse-cl733` missing recipient + empty parcel refuse |
| CL73.2 Visit presence + nearby trade green | 2026-08-02 | `visit-presence-trade-cl732` visit host + trade ping; own-visit + far refuse |
| CL73.1 Animal Hunter claim after trail green | 2026-08-02 | `trail-animal-hunter-claim-cl731` trail→City claim; thicket≠AH; incomplete refuse |
| CL72.3 Land wood_crate City vendor sink | 2026-08-02 | `land-crate-vendor-sink-cl723` land crate → City sell @3; empty refuse |
| CL72.2 Housing banner coin sink green | 2026-08-02 | `housing-banner-coin-sink-cl722` land banner @18c; broke `needCoinsDecor` |
| CL72.1 Bread / hearty stew eat energy | 2026-08-02 | `bread-stew-eat-cl721` bread +25 / stew +55; empty `noBread`/`noFood` |
| CL71.3 Explore thicket → MH claim green | 2026-08-02 | `thicket-monster-hunter-claim-cl713` thicket→City claim; trail≠MH; incomplete refuse |
| CL71.2 Explore ore → land smelt green | 2026-08-02 | `explore-ore-smelt-cl712` Explore chip×2 → land `smelt_iron_bar`; missing refuse |
| CL71.1 Explore wood → land saw green | 2026-08-02 | `explore-wood-saw-planks-cl711` Explore stump×2 → land `saw_planks`; missing refuse |
| CL70.3 Regression smoke CL67–CL70 | 2026-08-02 | `citylands-smoke-cl703` ration/tonic eat, Breeder claim, Explore leather weave/sell, free travel, market cancel |
| CL70.2 Warrior arena board optional green | 2026-08-02 | `warrior-arena-board-cl702` plaque/tip optional + no balance; homestead refuse |
| CL70.1 Notice board tips still green | 2026-08-02 | `notice-board-tips-cl701` travel/scarce/warrior ids + copy; no live-ops invent |
| CL69.3 Market cancel returns escrow green | 2026-08-02 | `market-cancel-escrow-cl693` list→cancel restore; cancel-not-yours refuse |
| CL69.2 Four-map free travel circuit green | 2026-08-02 | `four-map-travel-cl692` city↔land↔explore↔warrior fare-free; already-here refuse |
| CL69.1 Mail / offline parcel claim green | 2026-08-02 | `mail-parcel-claim-cl691` send→claim escrow; already-claimed + missing refuse |
| CL68.3 Explore premium leather sell green | 2026-08-02 | `explore-premium-leather-sell-cl683` Explore > City rate; empty refuse |
| CL68.2 Explore leather → land loom weave green | 2026-08-02 | `explore-leather-weave-cl682` trail leather → land `weave_cloth`; missing refuse |
| CL68.1 Breeder tutor claim after pen care | 2026-08-02 | `breeder-tutor-claim-cl681` land feed+clean → City claim; incomplete refuse |
| CL67.3 Housing decor coin sink green | 2026-08-02 | `housing-decor-coin-sink-cl673` land planter place; broke `needCoinsDecor` refuse |
| CL67.2 Tonic / cooked_fish eat energy | 2026-08-02 | `tonic-cooked-fish-eat-cl672` both restore Content Lock energy; empty `noFood` |
| CL67.1 Travel ration craft → eat | 2026-08-02 | `travel-ration-eat-cl671` land kitchen pack→eat; cook XP gate refuse |
| CL66.3 Regression smoke CL63–CL66 | 2026-08-02 | `citylands-smoke-cl663` scarce loom/dock/alchemy, Farmer/Fisher/Alchemist claims, market TTL + cooked_fish buy |
| CL66.2 Min HUD / interact prompts green | 2026-08-02 | Walk-up craft/portal/market prompts; closed craft/notice; no invent panels |
| CL66.1 Visit presence + nearby trade green | 2026-08-02 | Visit host presence + nearby trade ping; own-visit + far refuse |
| CL65.3 Cooked_fish market cross-buy | 2026-08-02 | Seller lists cooked_fish → buyer buys; own-list `marketOwnListing` refuse |
| CL65.2 City scarce crop_plot plant contention | 2026-08-02 | Soft presence lock on city plant (`stationBusy`); land unlimited OK |
| CL65.1 Market listing TTL → escrow return | 2026-08-02 | List → TTL elapse returns goods; buy refuse (`marketExpired`/`marketNotFound`) |
| CL64.3 Alchemist tutor claim after land brew | 2026-08-02 | Land `brew_herbal_tonic` → City claim; incomplete + double-claim refuse |
| CL64.2 Fisher tutor claim after land dock catch | 2026-08-02 | Land dock catch → City claim; incomplete + double-claim refuse |
| CL64.1 Farmer tutor claim after land plant/harvest | 2026-08-02 | Land plant→harvest → City claim; incomplete + double-claim refuse |
| CL63.3 City scarce alchemy_bench contention | 2026-08-02 | Soft presence lock on city alchemy (`stationBusy`); land unlimited OK |
| CL63.2 City scarce fishing_dock contention | 2026-08-02 | Soft presence lock on city dock catch (`stationBusy`); land unlimited OK |
| CL63.1 City scarce loom contention | 2026-08-02 | Soft presence lock on city loom weave (`stationBusy`); land unlimited OK |
| CL62.3 Regression smoke CL59–CL62 | 2026-08-02 | `citylands-smoke-cl623` Miner/Blacksmith/Cook, scarce tree/ore/workshop, market buy, Builder/Weaver |
| CL62.2 Weaver tutor claim after land weave | 2026-08-02 | Land `weave_cloth` → City claim; incomplete + double-claim refuse |
| CL62.1 Builder tutor claim after land place | 2026-08-02 | Land `crop_plot` place → City claim; incomplete + double-claim refuse |
| CL61.3 Cooked_fish / ore NPC rates green | 2026-08-02 | cooked_fish @4; city ore @1 / explore @2; empty-bag refuse |
| CL61.2 City vendor buy seed/tool smoke | 2026-08-02 | Live stall buy wheat_seed @8 + wooden_hoe @12; broke refuse |
| CL61.1 Market buy from other listing smoke | 2026-08-02 | Seller lists plank → buyer buys; own-listing `marketOwnListing` refuse |
| CL60.3 City scarce workshop contention | 2026-08-02 | Soft presence lock on city workshop (`stationBusy`); land unlimited OK |
| CL60.2 City scarce ore chip contention | 2026-08-02 | Soft presence lock on city ore (`stationBusy`); land unlimited OK |
| CL60.1 City scarce tree chop contention | 2026-08-02 | Soft presence lock on city stump (`stationBusy`); land unlimited OK |
| CL59.3 Cook tutor claim after land cook | 2026-08-02 | Land `cook_meat` → City claim; incomplete + double-claim refuse |
| CL59.2 Blacksmith tutor claim after land smelt | 2026-08-02 | Land `smelt_iron_bar` → City claim; incomplete + double-claim refuse |
| CL59.1 Miner tutor claim after Explore ore | 2026-08-02 | Explore ore chip → City claim; incomplete + double-claim refuse |
| CL58.3 Regression smoke CL55–CL58 | 2026-08-02 | `citylands-smoke-cl583` AH claim, ore→smelt XP split, scarce forge/mill, Forester/Carpenter claims |
| CL58.2 Carpenter tutor claim after land saw | 2026-08-02 | Land `saw_planks` → City claim; incomplete + double-claim refuse |
| CL58.1 Forester tutor claim after land chop | 2026-08-02 | Land stump chop → City claim; chop-only≠Carpenter ready; incomplete refuse |
| CL57.3 Cooked_fish market list smoke | 2026-08-02 | Land `cook_fish` → City market list; NPC @4 holds; empty refuse |
| CL57.2 City scarce mill contention | 2026-08-02 | Soft presence lock on city mill (`stationBusy`); land unlimited OK |
| CL57.1 City scarce forge contention | 2026-08-02 | Soft presence lock on city forge (`stationBusy`); land unlimited OK |
| CL56.3 Miner XP stays on chip not smelt | 2026-08-02 | Explore/land chip → miner; smelt → blacksmith; columns distinct |
| CL56.2 Land smelt → City vendor ore/bar sink | 2026-08-02 | Smelt bar → sell leftover ore @1; hold bar (no NPC rate); empty refuse |
| CL56.1 Explore ore chip → land smelt e2e | 2026-08-02 | Explore ore×2 → land `smelt_iron_bar` + blacksmith XP; homestead chip OK |
| CL55.3 Homestead hunt refuse still green | 2026-08-02 | Explore trail/thicket OK; empty land no hunt nodes; homestead `huntExploreOnly` |
| CL55.2 Trail vs thicket tutor isolation | 2026-08-02 | Trail → Animal Hunter ready only; thicket → Monster Hunter ready only |
| CL55.1 Explore trail → Animal Hunter claim | 2026-08-02 | Explore trail leather → City claim; thicket≠AH ready; incomplete refuse |
| CL54.3 Regression smoke CL51–CL54 | 2026-08-02 | `citylands-smoke-cl543` food/crate sinks, nearby trade+visit, thicket claim, portal free-travel copy |
| CL54.2 Warrior arena board optional fidelity | 2026-08-02 | Plaque/tip optional + no balance numbers; arena_board off homestead |
| CL54.1 Portal interact prompts all four maps | 2026-08-02 | City/land/explore Free travel · circuit; warrior Exit arena · N |
| CL53.3 Recipe XP gate fidelity smoke | 2026-08-02 | `pack_travel_ration` cook≥25 / `forge_iron_hammer` smith≥20 under-gate refuse + enough XP OK |
| CL53.2 Land tree → saw plank → City crate sell | 2026-08-02 | Chop→`saw_planks`→crate→City sell @3; empty-bag refuse |
| CL53.1 Explore thicket → Monster Hunter claim | 2026-08-02 | Explore thicket → City claim; trail≠ready; incomplete refuse |
| CL52.3 City scarce station contention assert | 2026-08-01 | Soft presence lock on city craft (`stationBusy` wait copy); land unlimited ignores peers |
| CL52.2 Visit land presence + leave smoke | 2026-08-01 | Visit other land → presence visible; leave/return home clears host presence |
| CL52.1 Trade invite accept + cancel smoke | 2026-08-01 | Nearby invite → accept + cancel escrow; far invite ping refuse + offerer accept refuse |
| CL51.3 Land wheat harvest → City vendor sell | 2026-08-01 | Land plant→harvest → City `vendorSell` wheat @2; `cropNotReady` + empty-bag refuse |
| CL51.2 Land stew → City market list smoke | 2026-08-01 | Land `cook_stew` (cook ≥15) → City market list; empty-stew refuse |
| CL51.1 Land cook_fish → City vendor sell e2e | 2026-08-01 | `VENDOR.sell.cooked_fish` = 4; land catch→cook→City sell; empty-bag refuse |
| CL50.3 Regression smoke CL47–CL50 | 2026-08-01 | `citylands-smoke-cl503` fish cook, alchemy/bread/crate sinks, leather weave, visit/decor/breeder claim, free travel + min HUD |
| CL50.2 Four-map free travel still green | 2026-08-01 | Reverse circuit warrior↔explore↔land↔city instant; fare-free; already-here refuse |
| CL50.1 Interact prompt fidelity (stations) | 2026-08-01 | Craft/notice/build copy; `oreNodeReady` includes dock/pen; min HUD closed-by-default |
| CL49.3 Breeder tutor claim after pen care | 2026-08-01 | Feed+clean → City claim Animal Breeder; clean-only ready edge; incomplete refuse |
| CL49.2 Housing second decor place smoke | 2026-08-01 | L5 pad → `banner` coin sink (18c); no combat; city refuse |
| CL49.1 Visit land + trade invite nearby smoke | 2026-08-01 | Visit other empty player_land; nearby trade ping; own-visit + far refuse |
| CL48.3 Land mill→bake→pack_travel_ration chain | 2026-08-01 | Land mill×2→bake→cook_meat→`pack_travel_ration` + eat energy; missing-mats refuse |
| CL48.2 Explore leather → land loom weave e2e | 2026-08-01 | Explore trail leather×2 → land loom `weave_cloth` + weaver XP; homestead hunt refuse |
| CL48.1 Land workshop saw → crate smoke | 2026-08-01 | Land `saw_planks`→`assemble_wood_crate` + carpenter XP; missing-plank refuse |
| CL47.3 Land bread → City vendor sell e2e | 2026-08-01 | `VENDOR.sell.bread` = 3; land bake → City sell; empty-bag refuse |
| CL47.2 Land alchemy brew → vendor/market sink | 2026-08-01 | Land `brew_herbal_tonic` → City vendor @4 + market list; empty-bag refuse |
| CL47.1 Land dock fish → kitchen cook_fish | 2026-08-01 | Land catch → kitchen `cook_fish` + cook XP (not fisher); missing-fish refuse |
| CL46.3 Regression smoke CL43–CL46 | 2026-08-01 | `citylands-smoke-cl8` land bake/forge/loom, Explore ore premium, dock catch, pen gate, min HUD |
| CL46.2 Min HUD walk-up panel fidelity | 2026-08-01 | `defaultClosedPanelIds` full set incl. notice+craft; no craft hotkey; `formatMinimalHudHint` short |
| CL46.1 Gate animal_pen on builder XP | 2026-08-01 | Sixth costly `minBuilderXp` = 8; crop/workshop/kitchen bootstrap; under-gated refuse |
| CL45.3 Travel ration tip fidelity | 2026-08-01 | Tip `travel_circuit` id stable; ration = kitchen energy food; free travel fare-free |
| CL45.2 Market cross-player buy smoke | 2026-08-01 | Land `wood_crate` list → second account buys; cancel-not-yours holds |
| CL45.1 Breeder feed + clean XP e2e | 2026-08-01 | Land pen wheat feed → wood clean (+ reverse); `animal_breeder_xp` both; CD refuse; no livestock combat |
| CL44.3 Explore hunt meat → land kitchen cook | 2026-08-01 | Explore trail `raw_meat` → land kitchen `cook_meat` + cook XP; homestead hunt refuse |
| CL44.2 Land fishing_dock catch after builder gate | 2026-08-01 | Place dock @ builder XP → `gatherFish` + fisher XP; cooldown refuse |
| CL44.1 Explore ore chip → premium sell e2e | 2026-08-01 | Explore `ore_node` chip → `vendorSell` iron_ore @2 (> City 1); empty-bag refuse |
| CL43.3 Land loom bandage → vendor/market | 2026-08-01 | Land loom `weave_cloth_bandage` → City vendor sell @2 + market list; empty-bag refuse |
| CL43.2 Land forge smelt → hammer | 2026-08-01 | Land forge `smelt_iron_bar` → `forge_iron_hammer`; blacksmith XP not miner; no-bars/no-ore refuse |
| CL43.1 Land mill → kitchen bake bread | 2026-08-01 | Player land mill flour → kitchen bread; farmer + cook XP; no-mats + wrong-station refuse |
| CL42.3 Regression smoke CL39–CL42 | 2026-08-01 | `citylands-smoke-cl8` crate sink, land mill, Explore gather→premium, dock gate, decor |
| CL42.2 Four-map free travel smoke | 2026-08-01 | City↔land↔explore↔warrior instant; no coin/ration fare; already-here refuse; caravan constants unused |
| CL42.1 Warrior tip / plaque fidelity | 2026-08-01 | Tip `warrior_optional` + plaque optional; no balance numbers; training off homestead / tutors |
| CL41.3 Housing decor place smoke | 2026-08-01 | L5 `decor_pad` → planter coin sink on player land; no combat; city refuse `decorStarterOnly` |
| CL41.2 Gate fishing_dock on builder XP | 2026-08-01 | Fifth costly station `minBuilderXp` = 8; crop/workshop/kitchen bootstrap; under-gated refuse |
| CL41.1 Breeder quest blurb clean beat | 2026-08-01 | Quest blurb names wheat feed + wood bedding; objective `feed_animal_pen` stable |
| CL40.3 City scarce stations tip fidelity | 2026-08-01 | Tip `scarce_stations` body lists shared scarce vs unlimited land (+ alchemy bench); notice min HUD |
| CL40.2 Travel ration craft assert | 2026-08-01 | Kitchen `pack_travel_ration` → cook XP; eat restores energy (no combat); missing mats refuse; free travel stays fare-free |
| CL40.1 Explore gather → premium sell e2e | 2026-08-01 | Live Explore stump chop → `vendorSell` wood at Explore rate > City/Land; empty-bag refuse |
| CL39.3 Carpenter crate tip fidelity | 2026-08-01 | Carpenter tutor basics/toolsNeeded name `assemble_wood_crate` / plank sink; quest `craft_plank` stable |
| CL39.2 Land plant → harvest → mill flour | 2026-08-01 | Player land crop_plot → harvest → mill flour + farmer XP; no-wheat + cropNotReady refuse |
| CL39.1 Wood crate vendor/market sink | 2026-08-01 | `VENDOR.sell.wood_crate` = 3 (flat regional); market list; empty-bag refuse |
| CL38.2 Regression smoke CL35–CL38 | 2026-08-01 | `citylands-smoke-cl8` mill→bread, cook meat, tonic eat, explore premium, alchemy gate |
| CL38.1 Herbal tonic eat assert | 2026-08-01 | `eatFood(herbal_tonic)` → +45E; no combat buff; cook crafts unchanged |
| CL37.3 Breeder path tip feed + clean | 2026-08-01 | Tip + Animal Breeder tutor basics name wheat feed and wood bedding; quest id stable |
| CL37.2 Explore mats → craft tip fidelity | 2026-08-01 | `explore_mats_craft` woodland/mines/hunt → craft asserts; id stable |
| CL37.1 Explore vendor premium sell smoke | 2026-08-01 | Live Explore `vendorSell` leather > City rate; empty-bag refuse |
| CL36.3 Gate alchemy_bench on builder XP | 2026-08-01 | `alchemy_bench.minBuilderXp` = BUILDER_PLACE_XP (8); kitchen ungated; under-gated refuse |
| CL36.2 Forge hammer / hoe smoke | 2026-08-01 | Land forge `forge_iron_hammer` + `forge_iron_hoe` → blacksmith XP not miner; no-bars refuse |
| CL36.1 Carpenter wood crate plank sink | 2026-08-01 | Workshop `assemble_wood_crate` (2× plank → wood_crate); carpenter XP; SKU 24 |
| CL35.3 Cook meat assert | 2026-08-01 | City kitchen `cook_meat` → cook XP; `meat_to_kitchen` tip; fail without meat |
| CL35.2 Flour / bread vendor or market sink | 2026-08-01 | Flour vendor Content Lock 5 / Explore 3; bread+flour market list; empty-bag refuse |
| CL35.1 Mill flour → bake bread smoke | 2026-08-01 | City mill→flour (farmer) → kitchen bread (cook); no-mats + wrong-station refuse |
| CL34.3 Regression smoke CL31–CL34 | 2026-08-01 | `citylands-smoke-cl7` dual hunter, alchemist XP, land tree/ore, tonic/bandage vendor+market, pen clean, loom gate |
| CL34.2 Animal Breeder clean beat | 2026-08-01 | Pen wood bedding (`cleanAnimalPen`); shared CD; auto care wheat→wood; tip updated; no livestock combat |
| CL34.1 Gate loom on builder XP | 2026-08-01 | `loom.minBuilderXp` = BUILDER_PLACE_XP (8); kitchen ungated; under-gated refuse |
| CL33.3 Hunt meat → kitchen tip | 2026-08-01 | Notice `meat_to_kitchen` + Kitchen panel; parallel to fish_to_kitchen |
| CL33.2 Market list tonic/bandage | 2026-08-01 | Land brew/sew → City list herbal_tonic + cloth_bandage; bad qty fail |
| CL33.1 Vendor sell tonic + bandage | 2026-08-01 | `VENDOR.sell` herbal_tonic 4 / cloth_bandage 2 (city/explore/land) |
| CL32.3 Land gather practice tip | 2026-08-01 | Notice `land_gather_practice` + Build Board copy; walk-up only |
| CL32.2 Placeable land ore node | 2026-08-01 | Place+chip → miner XP; needHammer; city place refuse |
| CL32.1 Placeable land tree stump | 2026-08-01 | Place+chop → forester XP; city place refuse; costs unchanged |
| CL31.3 Alchemist XP column | 2026-08-01 | `alchemist_xp` v30; `brew_herbal_tonic` → alchemist; stew/fish stay cook |
| CL31.2 Hunter tutor / tip fidelity | 2026-08-01 | Tip `explore_mats_craft` + tutor basics name Animal vs Monster Hunter XP; ids stable |
| CL31.1 Split Animal / Monster Hunter XP | 2026-08-01 | Trail → `animal_hunter_xp`; thicket → `monster_hunter_xp`; migrate `hunter_xp` → animal |
| CL30.3 Regression smoke CL27–CL30 | 2026-08-01 | `citylands-smoke-cl7` pen feed/breeder, mill+alchemy, market buy/cancel, trail/thicket hunt XP |
| CL30.2 Monster Hunter thicket assert | 2026-08-01 | Explore `edge_thicket` → hunter XP + tusks; tutor `hold_boar_tusk`; homestead refuse |
| CL30.1 Animal Hunter XP assert | 2026-08-01 | Explore `game_trail` → hunter XP (not cook); tip body; homestead refuse |
| CL29.3 Cook fish tip + stew sink | 2026-08-01 | Assert `fish_to_kitchen` + `cook_fish`/`cook_stew` craft; fail without mats |
| CL29.2 Weaver second recipe | 2026-08-01 | Loom `weave_cloth_bandage` → `cloth_bandage` (+20E); weaver XP; SKU 23 |
| CL29.1 Market cancel + buy smoke | 2026-08-01 | Land list → buyer buys plank; seller cancels cloth; cancel-not-yours + TTL |
| CL28.3 Retarget Alchemist practice | 2026-08-01 | `CITY_PRACTICE_STATIONS.alchemist` → `alchemy_bench`; objective `hold_herbal_tonic`; tip/tutor; stew stays cook |
| CL28.2 Alchemist bench stub | 2026-08-01 | Land + city×1 `alchemy_bench`; `brew_herbal_tonic` → `herbal_tonic` (+45); cook XP temp; no combat |
| CL28.1 Gate mill on builder XP | 2026-08-01 | `mill.minBuilderXp` = BUILDER_PLACE_XP (8); workshop ungated; under-gated refuse |
| CL27.3 Seed Animal Breeder tutor | 2026-08-01 | City NPC slot 28; objective `feed_animal_pen`; practice null (land pens); tip updated; no livestock combat |
| CL27.2 Animal Breeder XP column | 2026-08-01 | `animal_breeder_xp` schema v28; ProfessionId + grantXp + meetsRecipeXpGate; feed grants +5 |
| CL27.1 Pen interact feed stub | 2026-08-01 | Walk-up feed wheat at land `animal_pen`; fail without mats; city has no pens |
| CL26.3 Regression smoke CL23–CL26 | 2026-08-01 | `citylands-smoke-cl7` asserts fisher/fish sell-cook, explore gather, market list, forge gate, animal_pen |
| CL26.2 Animal pen stub land | 2026-08-01 | `animal_pen` placeable on land; city blocked; tip updated; no livestock combat |
| CL26.1 Builder XP gate on forge | 2026-08-01 | `forge.minBuilderXp` = BUILDER_PLACE_XP (8); under-gated refuse; BuildPanel shows gate |
| CL25.3 Fish → kitchen tip | 2026-08-01 | Notice `fish_to_kitchen` + Kitchen craft panel uses `fishToKitchenTip`; min HUD |
| CL25.2 City vendor buy book | 2026-08-01 | Assert city buy = seeds + wooden_hoe + iron_hammer @ Content Lock; no extra tools |
| CL25.1 List land craft City market | 2026-08-01 | Smoke land craft plank/cloth → City list + fish; bad qty fail; listing not map-gated |
| CL24.3 Explore gather → craft tip | 2026-08-01 | Extended `explore_mats_craft` body for woodland wood + mine ore → carpenter/forge; id stable |
| CL24.2 Explore mines → miner XP | 2026-08-01 | Assert Explore `ore_node` → miner XP (not blacksmith); hammer still required |
| CL24.1 Explore woodland → forester XP | 2026-08-01 | Assert Explore `tree_stump` → forester XP (not carpenter) |
| CL23.3 Cook fish recipe | 2026-08-01 | Kitchen `cook_fish` → `cooked_fish` (+40 energy); cook XP; SKU cap 21; no alchemy |
| CL23.2 Fish vendor/market sink | 2026-08-01 | `VENDOR.sell.fish` = 2 (city/explore/land); market list stackable fish |
| CL23.1 Fisher XP column | 2026-08-01 | `fisher_xp` schema v27; `gatherFish` → fisher (+5); ProfessionId + gate; cook unchanged |
| CL22.1 Regression smoke CL18–CL21 | 2026-08-01 | `citylands-smoke-cl7` asserts forester/miner/builder XP, city dock catch, practice maps, explore_mats + post_craft tips, city dock place refuse + cooldown |
| CL21.2 Explore mats → craft tip | 2026-08-01 | Notice tip `explore_mats_craft` — leather/tusk/wood → weave/cook/carpenter; walk-up only |
| CL21.1 Post-craft market tip | 2026-08-01 | Onboarding `post_craft_market` / `postCraftMarketTip` after first land craft; clears on City/vendor; min HUD |
| CL20.2 Alchemist brew clarity | 2026-08-01 | Tutor + tip: Kitchen practice; `cook_stew` stays cook; no alchemy combat |
| CL20.1 Alchemist practice → Kitchen | 2026-08-01 | `CITY_PRACTICE_STATIONS.alchemist = ["kitchen"]`; tip no longer “deferred forever” |
| CL19.3 Fisher tutor → fish | 2026-08-01 | Objective `hold_fish`; notice tip dock copy; raw_meat proxy removed |
| CL19.2 Scarce city fishing dock | 2026-08-01 | City slot 27 dock×1; `CITY_PRACTICE_STATIONS.fisher`; city place blocked; land unlimited |
| CL19.1 Fish + fishing dock land | 2026-08-01 | `fish` item; `fishing_dock` in PLAYER_LAND_STATIONS (22c); `gatherFish` 60s CD |
| CL18.3 Builder XP on place | 2026-08-01 | `builder_xp` schema v26; `placeLandStation` → builder (`BUILDER_PLACE_XP` 8); city place still blocked |
| CL18.2 Miner XP column | 2026-08-01 | `miner_xp` schema v25; `gatherOre` → miner; blacksmith stays on forge craft; tutor gather_ore uses minerXp |
| CL18.1 Forester XP column | 2026-08-01 | `forester_xp` schema v24; `gatherWood` → forester; carpenter stays on saw/craft; tutor gather_wood uses foresterXp |
| CL17.1 Regression smoke CL13–CL16 | 2026-08-01 | `citylands-smoke-cl7` asserts CL13–16 tutors, weaver XP, builder ready, practice nulls, empty_land tip, city place refuse, stub breeder |
| CL16.2 Animal Breeder path note | 2026-08-01 | No pens/livestock → stub stays unseeded; notice tip `animal_breeder_path`; `CITY_PRACTICE_STATIONS` null; no livestock combat |
| CL16.1 Empty-land build board tip | 2026-08-01 | `emptyLandBuildBoardTip` on BuildPanel + dismissible onboarding `empty_land`; clears on City / station placed; min HUD |
| CL15.2 Builder tutor + first land build | 2026-08-01 | City slot 26; `place_land_station` via owned player land; claim at City walk-up; no forced HUD |
| CL15.1 Animal + Monster Hunter tutors | 2026-08-01 | City slots 24–25; `hold_leather` / `hold_boar_tusk`; homestead hunt refuses; warrior unused |
| CL14.2 Fisher/Alchemist practice defer | 2026-08-01 | `CITY_PRACTICE_STATIONS` null; notice tip `fisher_alchemist_practice`; no homestead refill |
| CL14.1 Fisher + Alchemist tutors | 2026-08-01 | City slots 22–23; `hold_raw_meat` / `brew_stew` proxies; fish/alchemy loops deferred |
| CL13.3 Weaver XP column | 2026-08-01 | `weaver_xp` schema v23; `weave_cloth` profession=weaver; grantXp + gate; no carpenter routing |
| CL13.2 Scarce city loom | 2026-08-01 | City slot 21 loom×1; `CITY_PRACTICE_STATIONS.weaver`; city place blocked; land unlimited |
| CL13.1 Weaver tutor on City | 2026-08-01 | `TUTORIAL_NPCS.weaver` seeded; city slot 20; `weave_cloth` objective via cloth qty; claim persists |
| CL12.2 Four-map smoke CL8–CL11 | 2026-08-01 | Smoke asserts seeded tutors + notice board, loom place, warrior homestead refuse, notice closed-by-default, city_hub tip one-shot |
| CL12.1 First-session City hub tip | 2026-08-01 | `cityHubFirstSessionTip` + onboarding `city_hub`; dismissible; clears on City; min HUD |
| CL11.2 No warrior training on land | 2026-08-01 | `WARRIOR_TRAINING_BUILDING_TYPES` + `placeLandStation` guard; catalog excludes arena_board; failure → `warriorTrainingHomesteadForbidden` |
| CL11.1 Arena plaque + exit clarity | 2026-08-01 | `arenaPlaqueCopy` / exit labels; warrior portal prompt Exit+N; plaque panel + notice tip stress optional/no gear ladder |
| CL10.2 Explore regional vendor value | 2026-08-01 | Assert explore > city sell for wood/hunt mats; `exploreRegionalVendorTip` in README + notice board; farm staples cheaper / seeds pricier at explore |
| CL10.1 Explore section wayfinding | 2026-08-01 | `EXPLORE_SECTIONS` labels + floor tints; explore prompt prefixes; hunt still explore-only |
| CL9.2 Land→City produce loop tip | 2026-08-01 | Notice-board tip `land_to_city` nudges Vendor/Market after land craft; walk-up only, no always-on HUD |
| CL9.1 Loom station on player land | 2026-08-01 | `loom` in PLAYER_LAND_STATIONS; weave_cloth 2×leather→cloth; city place blocked; weaver XP deferred→carpenter gate |
| CL8.3 City notice board stub | 2026-08-01 | `notice_board` city slot 19; static tips; panel on interact only |
| CL8.2 Scarce stations for new tutors | 2026-08-01 | `CITY_PRACTICE_STATIONS` maps miner→ore_node, blacksmith→forge, cook→kitchen (already on city template); practice crafts on city; no city place/refill |
| CL8.1 Next tutorial NPC batch | 2026-08-01 | Seeded Miner/Blacksmith/Cook; objectives gather_ore/smelt_iron_bar/bake_bread; city slots 16–18; warrior still absent |
| CL7.2 Four-map smoke | 2026-08-01 | `citylands-smoke-cl7.test.ts`: travel matrix, city plant, empty land+build, explore hunt, warrior enter/exit, HUD default-closed; fail already-here + homestead hunt |
| CL7.1 Travel UX polish | 2026-08-01 | Circuit copy helpers; TravelPanel circuit strip + caravan disclaimer; portal prompt; README notes F11.2 inert |
| CL6.2 Split GameApp panels | 2026-08-01 | `panel-orchestration` + `usePanelHotkeys` + `interact-prompt` + `GameHudShell`; GameApp delegates open/close; no always-on columns |
| CL6.1 Strip HUD chrome | 2026-08-01 | TopBar = identity/energy/coins/HP; `formatMinimalHudHint`; full binds in Settings (H); panels still closed by default |
| CL5.1 Warrior arena stub | 2026-08-01 | WARRIOR_BUILDINGS portal+arena_board×3; backfill; ArenaStubPanel; no profession/homestead coupling; hunt/build refuse |
| CL4.2 Hunt on explore only | 2026-08-01 | `huntTrail` requires explore kind; trails removed from STARTER_BUILDINGS; city/player_land refuse with huntExploreOnly |
| CL4.1 Exploration map template | 2026-08-01 | EXPLORE_BUILDINGS multi-section (4 trees, 4 ores, 2 trails, 2 thickets, portal, vendor); ForestEnvironment enlarged; gather works |
| CL3.2 Build stations unlimited | 2026-08-01 | `placeLandStation` + `/api/land/build`; PLAYER_LAND_STATIONS catalog; BuildPanel at build_board; ≥2 same type; city blocked |
| CL3.1 Empty free player land | 2026-08-01 | PLAYER_LAND_BUILDINGS = build_board only; ensurePlayerLandYardBuildings never refills production; travel/load safe |
| CL2.3 City market stub | 2026-08-01 | City vendor_stall + market_board; city buy book seeds+hoe+hammer; walk-up opens vendor/market panels; player list/buy reuses market actions |
| CL2.2 Tutorial NPC framework | 2026-08-01 | `tutorial_npc` + TUTORIAL_NPCS registry (all economy professions); seeded Farmer/Forester/Carpenter; walk-up panel; quest_claims persist |
| CL2.1 City scarce shared stations | 2026-08-01 | Global shared city land; sparse plots/trees/ores + one workshop/forge/mill/kitchen; craft/plant work; expand blocked; multi-player same landId |
| CL1.3 Client map routing | 2026-08-01 | LandScene templates city/player_land/explore/warrior; remount on landId; presence cleared + WS channel keyed by active land; empty player land safe |
| CL1.2 Free travel skeleton | 2026-08-01 | Instant City↔Lands↔Explore↔Warrior via `/api/travel`; no coin/ration; ensure city/explore/warrior land rows (city/warrior portal stubs); TravelPanel lists all four |
| CL1.1 Four map kinds + empty player land | 2026-08-01 | Stop packed STARTER_BUILDINGS auto-ensure/bootstrap; `city`/`player_land`/`explore`/`warrior` (+ legacy aliases); schema v22 migrate starter→player_land, forest→explore; default = empty player_land (city hub rows in CL1.2) |
| F16.1 Postgres adapter | 2026-08-01 | Env GAME_DB_DRIVER/DATABASE_URL; SQLite default; pg schema+migrate |
| F15.5 Chain never gates combat | 2026-08-01 | Shared assert + hunt/player guards; ChainNeverGatesCombat.md |
| F15.4 On-chain marketplace read-only | 2026-07-31 | GET /chain/marketplace; soft→wei mirror; B panel |
| F15.3 Mint/list stub UI | 2026-07-31 | B deed desk; mock mint/list; cosmetic-only banner; v21 |
| F15.2 Off-chain premium land deed | 2026-07-31 | land_deeds table; claim for coins; no combat; v20 |
| F15.1 Optional wallet connect stub | 2026-07-31 | H settings stub link; schema v19; never gates play |
| F14.5 Cosmetic day-night cycle | 2026-07-31 | 8m lighting cycle; H toggle; no gameplay power |
| F14.4 BGM + SFX hooks | 2026-07-31 | Web Audio plant/craft/hunt + BGM; H mute |
| F14.3 Crop/ore/trail visual polish | 2026-07-31 | Readable states + READY badges; ResourceMeshes |
| F14.2 Avatar art upgrade | 2026-07-31 | Farmer kit (hat/vest/arms); avatar.glb + kit fallback |
| F14.1 GLTF loader + mill hero | 2026-07-31 | useGLTF + kit fallback; public/models/mill.glb |
| F13.5 Settings + keybind help | 2026-07-31 | H panel; KEYBINDS shared; mute/tips localStorage |
| F13.4 Mail / offline trade delivery | 2026-07-31 | Parcels escrow; claim online; L panel; schema v18 |
| F13.3 Achievements stubs | 2026-07-31 | Counters + A panel; schema v17; no combat power |
| F13.2 Five starter quests | 2026-07-31 | Track+claim plant→ore loop; Q panel; schema v16 |
| F13.1 Character level from characterXp | 2026-07-31 | Level/title HUD; Lv5 cosmetic decor pad; tips |
| F12.5 Guild chat channel | 2026-07-31 | Separate guild buffer + WS/HTTP; Chat panel World/Guild tabs |
| F12.4 Contested claim soft war | 2026-07-31 | Timed window; score via wood deliveries; schema v15 |
| F12.3 Claim node | 2026-07-31 | Wild Grove beacon; guild claim; wood timer; schema v14 |
| F12.2 Guild bank | 2026-07-31 | Shared stackable vault; deposit/withdraw; schema v13 |
| F12.1 Guild ranks + invite codes | 2026-07-31 | Owner/officer/member; invite join; schema v12 |
| F11.5 Housing decor slots | 2026-07-31 | 2 homestead pads; planter/banner coin sink; no combat power |
| F11.4 Market TTL + fees | 2026-07-31 | 2c list fee; 10m TTL returns escrow; expiresAt on board |
| F11.3 Regional vendor prices | 2026-07-31 | Forest vs homestead books; /telemetry vendorPricesByRegion |
| F11.2 Caravan travel timer | 2026-07-31 | Schema v11 travel_*; 45s road + 15 coins or travel_ration |
| F11.1 Forest biome stub | 2026-07-31 | Schema v10 multi-land + travel; forest glade template; portal/N map |
| F10.5 Recipe book UI | 2026-07-31 | Station panel shows XP gates, owned mats, energy, output |
| F10.4 Mill/forge T2 | 2026-07-31 | Schema v9 building.tier; upgrade sink; T2 −2 energy +1 stackable out |
| F10.3 Longer food chain | 2026-07-31 | Stew/ration recipes; FOOD_RESTORE tiers; eat API edible union |
| F10.2 Carpenter wood chain | 2026-07-31 | Workshop + stump; wood/plank; carpenter_xp v8 |
| F10.1 Hunter profession XP | 2026-07-31 | Schema v7 hunter_xp; hunts grant hunter not farmer |
| F9.5 Downed penalty | 2026-07-30 | Energy+cooldown only; no inventory/land wipe |
| F9.4 Tool hunt damage | 2026-07-30 | Equipped hoe/hammer soft +dmg; wear durability |
| F9.3 Edge thicket + boar | 2026-07-30 | Brush Boar → boar_tusk; forge_hoe_tusk_grip recipe |
| F9.2 Trail encounter | 2026-07-30 | Forest Hare fight; loot on win; HP persists |
| F9.1 Combat stats | 2026-07-30 | Schema v6 health/dmg/def; HUD; COMBAT defaults |
| F8.5 Trade invite ping | 2026-07-30 | WS soft ping when offerer+recipient nearby on same land |
| F8.4 Chat over WebSocket | 2026-07-30 | Prefer WS send; HTTP fallback; live push via hub |
| F8.3 WebSocket gateway | 2026-07-30 | `/ws` hub; land channels; HTTP also pushes presence/chat |
| F8.2 Remote player avatars | 2026-07-30 | LandScene renders presence others + nameplates |
| F8.1 Presence heartbeat | 2026-07-30 | POST/GET /api/presence; client 3s pulse; nearby count HUD |
| FullGameBuildPlan + autonomous loop | 2026-07-30 | F8–F17 queue; 15m AGENT_LOOP_TICK_full_game |
| P7 Social + post-MVP slice | 2026-07-30 | Proximity, chat, hunt, cook, guilds |
| P6 Plan fidelity | 2026-07-30 | Trade escrow/tools, hoe fix, energy ETA |
| P5 Living loop | 2026-07-30 | Ore, kitchen, expand UX |
| P0–P4 | 2026-07-30 | MVP economy + visit + market |

---

- 2026-09-01: **`npm start` missing Next build** — `prestart` only built shared+server, so `next start` failed with no production `.next`. `prestart` now runs the full workspace `build`. Test: `package-scripts`.
- 2026-08-28: **Interact lag (E stations/gather)** — Pressing E waited on a GameApp 500ms clock that re-reconciled the 3D scene, plus N+1 craft glances on every action. Live target + busy ref, SFX before applyState, HUD/scene clocks isolated, batched craft glances. Tests: `use-synced-now`, `craft-glance-from-jobs`, `panel-orchestration`.
- 2026-08-28: **Traveler-chibi humanoid** — Pear robe, hooded head, stub limbs, satchel; matches low-poly traveler reference. Test: `humanoid-layout`.
- 2026-08-28: **Kit-integrated 3D face** — Removed billboard/canvas face; eyes/nose/smile as 3D parts on rounded head box (game kit style). Test: `humanoid-layout`.
- 2026-08-28: **Billboard canvas face** — Reverted (did not match style).
- 2026-08-28: **Stylized villager humanoid** — Round head, cartoon eyes (sclera+pupil), smile, ears, blush; tapered torso + shoulders; hat tilted back for face readability. Test: `humanoid-layout`.
- 2026-08-27: **Revert external asset kits** — Removed Kenney Fantasy Town + Quaternius integrations; avatars back to stylized procedural kit; plaza fountain + mill back to in-game kits. Test: `avatar-art`.
- 2026-08-27: **Inventory icon grid + search** — Bag (I) is a 5-column icon grid with per-item glyphs, search field, and All/Mats/Food/Tools/Kits chips. Select a slot for eat/equip/repair/place. Capacity / durability / kit rules unchanged. Tests: `inventory-grid-filter`.
- 2026-08-27: **City trees restored + hide-when-behind** — Large hub trees back in the city. Follow camera hides a canopy only while the player is behind it. Tests: `foliage-occlusion`, `city-atmosphere-decor`.
- 2026-08-27: **City floating wayfinding plaques** — Removed the two city Html boxes ("Shared · scarce stations" and "Profession tutors") plus the ghost duplicate. Yard/tutor layout unchanged. Test: `city-scarce-yard-pl11`.
- 2026-08-27: **Hero avatar GLTF rig** — Regenerated `avatar.glb` (named groups + face plate); runtime uses `AvatarGltfRig` with walk pose + kit fallback. Tutors share same hero. Test: `avatar-art`.
- 2026-08-27: **Stylized chunky humanoids** — Replaced rag-doll capsules with rounded-box farmer kit (`StylizedHumanoidKit`): flat face plate, mitten hands, shared rig for player + tutors. Test: `humanoid-layout`.
- 2026-08-27: **Readable humanoid faces** — `HumanoidHead` with large forward eyes/nose, back-hair + boot-toe facing cues; tilted farmer hat; shared by player kit + tutors. Test: `humanoid-layout`.
- 2026-08-27: **City decor breathing room** — Thinned plaza props; trees smaller + rim-only (clear of mill/farmer/kitchen/dock); fences off farmer bay; civic houses pushed out. Compact canopy mesh so camera is not flooded green. Test: `city-atmosphere-decor`.
- 2026-08-27: **Plaza masonry fill** — Columns, arches, low stone walls, rocks, flower pots around the fountain court (kept clear of fountain + road strip). Test: `city-atmosphere-decor`.
- 2026-08-27: **City atmosphere decor** — Main Hall (env-only civic façade), cooler trees/bushes, short fence runs on plaza/yard edges. Shared SoT in `world-object-materials` + `CityEnvKits`; walk solids for hall/trees/fences. Not BuildingType / scarce stations. Test: `city-atmosphere-decor`.
- 2026-08-27: **Bigger trees + extras + humanoid detail** — City trees taller with varied scales; lanterns/benches/planters/troughs/signs; shared `HumanoidDetail` face/hands on player + tutors (eyes/nose/ears/hair/collar). Test: `city-atmosphere-decor`.
- 2026-08-26: **Walk solids + tutors + matte grass** — Larger station collision + civic/fence solids; tutors use farmer-like kit (hat/cloak); grass floors use Lambert + no SoftShadows (kill shine/flicker). `INTERACT_RANGE` 1.05. Tests: `world-collision`, `land-proximity`, `procedural-textures`.
- 2026-08-26: **City Free pad clutter** — Removed scarce-station ground circles + Free/Busy sticky world labels; contention HUD rims unchanged via headless watcher.
- 2026-08-26: **City practice bays** — Scarce stations spaced out; each profession tutor stands beside their practice pad (Explore hunters + Builder stay by the portal). Expanded scarce yard floor/mist/strip + props. Test: `city-tutor-beside-practice`.
- 2026-08-26: **Path flicker / shine** — Crossing RaisedPathBeds used thick kit-boxes at nearly the same Y → z-fight + bright edge specular + soft-shadow acne. Paths are flat decks with Y stack + lip gap at junctions; curbs no longer cast shadows; SoftShadows/ContactShadows toned down. Tests: `floor-seam-softener`.
- 2026-08-26: **Floor seams redo (geometry, not overlays)** — Removed transparent SoftFloorFrame / SoftPathLips texture stacks (still looked linear + overlapped). Homestead is one continuous matte grass field; paths/city/explore edges use raised curb boxes + raised path beds. Grass albedo green-biased (`n6` cache). Tests: `floor-seam-softener`, `procedural-textures`.
- 2026-08-26: **Brightness readability fix** — Night/dusk no longer crush black; exposure 1.22, ambient+fill floors, brighter fog/keys, albedo maps raised again, contact shadows softened. Tests: `day-night`, `procedural-textures`.
- 2026-08-26: **Punchier world look** — SoftShadows + ContactShadows, harder sun / softer hemi, stronger normals/grain, bigger kit round-overs, wider floor aprons. Should read clearly vs prior flat pass. Tests: `kit-box-geometry`, `procedural-textures`, `day-night`.
- 2026-08-25: **Floor seams + alchemy flicker** — Soft translucent aprons/lips (`FloorSeamSoftener`) on City / Homestead / Explore / Warrior so texture borders are not ruler cuts. Alchemy flask no longer neon-strobes when idle (textured + quieter lit). Tests: `floor-seam-softener`.
- 2026-08-17: **Second art pass (flat kits)** — Height→normal maps + roughness scalar 1 so grain reads; wider chroma albedo. Land-scene `boxGeometry` → rounded `kitBoxGeometry`. ACES + opposite fill light. Denser farmer/tutor capsules. Tests: `procedural-textures`, `kit-box-geometry`, `day-night`.
- 2026-08-17: **`npm start` EADDRINUSE** — `prestart` runs `free-ports.mjs`. Listen attaches HTTP/`ws` error handlers before upgrade so a busy 8787 is not an unhandled WebSocketServer crash. Test: `package-scripts`.
- 2026-08-17: **`npm start` shared resolve** — `@game/shared` `exports` now point Node at `dist/index.js` (was `src/index.ts`, so `node dist/index.js` looked for `achievements.js` next to the TS barrel). Dev: `predev` builds shared; concurrently watches `packages/shared` tsc; server `tsx watch --include dist`. Vitest still aliases src. Test: `package-exports`.
- 2026-08-17: **Production `npm run build`** — Server tsc: restored `ACTION_ERROR.stationBusy`, extended `TelemetryEvent`, typed trade `toUserId` + animal-pen ready narrowing. Next typecheck: `state?.guildName`, `isPlayerLandKind` for kit place, generic station/yard kit lookups, `Side` on textured mats, inventory flash ids, ImageData copy. Root `npm start` runs server+web dist. Tests: `messages`, `telemetry`. Procedural maps: Voronoi cobble (no ruler-grid mortar), warped wood/cloth/grass, stronger bump, wider albedo span. Farmer kit skips static `avatar.glb` T-pose; hip/shoulder walk cycle (legs + opposite arms + bob) + idle breathe. Tutors: rounded robe (no box cloak/boots) + idle sway. Tests: `procedural-textures`, `avatar-walk`, `avatar-art`.
- 2026-08-17: **Canvas DPR cap** — LandScene `dpr={[1, 1.5]}` + adaptive `performance.min` so HiDPI/dev does not render 2–3× pixels. Feel in `npm run dev` is still heavier than a production build.
- 2026-08-15: **Homestead layout editor (design locked)** — Stations crafted as inventory kits (workshop wait/collect; mats = former place costs; no coins). Own land: Inventory → Place → grid editor (free; hover ghost + R rotate preview). Build Board = pickup-only (kit back; no cost/CD; tier on kit). **Decor kits** (`planter_kit` / `banner_kit`) craft + place/pickup same loop. Overrides CL3.2 paid place. SKU cap raised for kits.
- 2026-08-15: **Craft wait/collect** — Process crafts are start → `craftMs` wait → Collect (starter only). `craft_jobs` schema v31; City allows concurrent jobs on the same station (no presence Busy for craft); player land + Explore exclusive while a job holds the building. Overrides Content Lock CL52.3 craft presence contention. Tests: `craft-wait-collect` + smokes updated via `craftRecipeComplete`.
- 2026-08-15: **Travel darkening fix** — R3F `dispose()` was nuking shared procedural `CanvasTexture`s when LandScene remounted (travel). Detach maps on `TexturedStandardMaterial` unmount; cache rebuilds if a texture was disposed; albedo band brightened so map×color stays readable. Test: `procedural-textures` bright-band case.
- 2026-08-15: **Flat-color texture sweep** — Bulk-wired ~249 opaque `meshStandardMaterial` → `TexturedStandardMaterial` across BuildingMesh / City / Homestead / Forest / Warrior / ResourceMeshes (script `scripts/texture-flat-materials.mjs`). Left transparent cue/haze pads flat. Remotes already use textured AvatarKit. Fixed fence-cap + pen pad leftovers and a few mis-guessed kinds (pen rails / vendor post → wood).
- 2026-08-04: **Procedural surface textures** — User asked for real grain (not flat solid colors). Added `apps/web/lib/procedural-textures.ts` (cobble/stone/dirt/grass/wood/bark/cloth/leather/metal/thatch CanvasTexture maps + bump/roughness) and `TexturedStandardMaterial`. Wired floors (City/Homestead/Explore), avatar kit, tutors, mill kit, homestead shed/trees. Keeps catalog hex colors (map multiplies). Test: `procedural-textures`.
- 2026-08-04: **Walk collision + visual kit pass** — Circular footprints via `world-collision.ts` (`resolveWalkAgainstObstacles`, building radii under `INTERACT_RANGE`) + city fountain/yard props + homestead shed/trees. `PlayerAvatar` / `LandScene` apply solids then map clamp. Visuals: richer tutor NPC silhouette, avatar hands/hair, plaza tile articulation (procedural PBR only). Test: `world-collision`.
- 2026-08-04: **usernameRef / KeyA / presence fetch** — RF7 left `usernameRef` used but undefined (walk-up crashes). Replaced with `stateRef.username`. Achievements hotkey **A→J** (WASD conflict). `apiReportPresence` catches fetch failures so HTTP fallback does not throw when WS/server blips.
- 2026-08-04: **Walk clamp was still homestead ±7.2** — floors/layouts spread but `PlayerAvatar` hardcoded `BOUNDS = 7.2`. Added `MAP_WALK_BOUNDS` / `clampWalkPosition` in `world.ts` (city/explore/warrior larger); avatar clamps per `landKind`. Test: `map-walk-bounds`.
- 2026-08-03: **City/Explore map footprint spread** — Hub + wilds were packed into ≈ homestead plot (city world box ~18×22, plaza 16×14). Scaled `CITY_BUILDINGS` / `EXPLORE_BUILDINGS` / sections ×2, enlarged City/Forest floors + tutor/plaza/yard cues, brighter night streets, longer city/explore fog, and `ensureCityYardBuildings` / `ensureForestYardBuildings` now re-sync x/z from catalog. Test: `city-explore-map-footprint`.
- 2026-08-03: **Shared `.js` import + Next resolve** — Removing NodeNext `.js` extensions from `packages/shared/src` broke tsc; keeping them broke Next webpack (`Can't resolve './achievements.js'`). Fix: keep `.js` specifiers + `webpack.resolve.extensionAlias` in `apps/web/next.config.ts` (and vitest). Also repaired RF6.4 forward imports (`catalog-text` removed; missing cue/map-identity imports; `exploreRegionalVendorTip` moved to `catalog-cues-28`).
- 2026-08-03: **RF7.5 line-count in progress** — GameApp ~8000 → **6560** after soft-refuse resolver (`soft-refuse-flash.ts`, 109 cues), walkup persistence module, unused success-cue import prune. Target ~2500 still open. Test: `soft-refuse-flash-rf75`. Next: keep extracting panels / world-reinforce flashes.
- 2026-08-03: **RF7.4 ephemeral success cue shipped** — `useSuccessCue` owns info/promptPulse + flashSuccessCue/ref + clear timers; GameApp unmount cleanup still clears those refs. BGM stays in GameApp (audio controller). Test: `success-cue-rf74`. Next: **RF7.5** line-count target.
- 2026-08-03: **RF7.3 economy panel wiring shipped** — `useEconomyPanels` owns trades/players/listings/mail + refreshPlayers/Market/Mail/Trades; GameApp `refresh` uses them. Test: `economy-panels-rf73`. Next: **RF7.4** audio/ephemeral cues.
- 2026-08-03: **RF7.2 visit/map session shipped** — `useVisitLandState` + `applyVisitLandPayload`; GameApp visit state/refs extracted; visit apply + silent clear on logout. Test: `visit-land-session-rf72`. Next: **RF7.3** economy panel wiring.
- 2026-08-03: **RF7.1 GameApp auth hooks shipped** — `lib/auth-token.ts` + `hooks/useGameAuth.ts` (restore / login-register / clearAuthSession); GameApp wires hook after `refresh`. Test: `auth-token-rf71`. Next: **RF7.2** travel/visit/map.
- 2026-08-03: **RF6.1–RF6.5 catalog split shipped** — `catalog-items`, `catalog-recipes` (+ENERGY), buildings barrel (`catalog-land` / gather-nodes / player-stations / layouts / warrior-service / map-identity), cues barrel (`catalog-cues-01`…`30`), thin `catalog.ts` + PLANNING module map. Public `@game/shared` API unchanged. Tests: `catalog-items-rf61`, `catalog-recipes-rf62`, `catalog-buildings-rf63`, `catalog-cues-rf64`. Next: **RF7.1** GameApp auth/refresh hooks.
- 2026-08-03: **RF1.2–RF5.5 + RF9.1 shipped** — P0 auth/txn/postgres + WS-first/CORS + cue util (72 sine envelopes → `sinePulseEnvelope`) + zod auth/market list+buy/cancel. RF5.4 kinship (success-cue is copy-only). Next pending by ID: **RF6.1** (catalog items split).
- 2026-08-03: **RF1.2–RF5.2 shipped** — Auth logout/rate-limit/password/flood; economy `withTransaction`; Postgres hard-fail + docs; WS-first presence + hub indexes + CORS + slower `/api/me`; `visual-cue-math` + gather-family wrappers (crop/stump/ore/gather flash). Next: **RF5.3**.
- 2026-08-03: **RF1.2–RF4.4 shipped (auth → transactions → Postgres honesty → WS-first)** — Logout `revokeSession` + `POST /api/auth/logout` + `apiLogout` on client clear. Auth rate limit 10/60s IP+username; password min 8 + bcrypt cost 10 (`GAME_BCRYPT_COST` for tests). Chat/WS presence flood guards. `withTransaction` wraps market list/buy/cancel, trade accept, mail send/claim/cancel. Postgres `assertSupportedDbDriver` hard-fail; README/PLANNING SQLite-only. Presence WS-primary (HTTP fallback); `/api/me` poll 12s + skip hidden; hub `byLand`/`byUser` indexes; `GAME_CORS_ORIGIN`. Tests: `auth-hardening-rf1`, `economy-txn-rf2`, `postgres-honesty-rf31`, `ws-hub` RF4.3, `cors-rf44`. Next: **RF5.1**.
- 2026-08-03: **Gate 0 + RF1.1 shipped (Hardening LIVE)** — Polish 41 PL202–PL205 **frozen**; live queue → Hardening RF\*; AgentAutonomousLoop sentinel = RF\*. Session TTL: `createdAt + GAME_SESSION_TTL_MS` (default 7d); expired tokens deleted in `userIdFromToken`; helpers `resolveSessionTtlMs` / `sessionExpiresAt` / `isSessionExpired`. Choice: derive expiry from existing `createdAt` (no schema migration) so all sessions get TTL without `expiresAt` column. Tests: `session-ttl-rf11` (happy / expired+delete / missing / env). Next pending: **RF1.2**.
- 2026-08-03: **Hardening plan authored (RF\*)** — [FullGameBuildPlan_CityLands_Hardening.md](docs/19_development_plan/FullGameBuildPlan_CityLands_Hardening.md) + TASKS section **Hardening queue (RF\*)**. Gate 0 → RF1 auth → RF2 transactions → RF3 Postgres honesty → RF4 WS-first → RF5–8 cue/catalog/GameApp/BuildingMesh → RF9 zod → RF10 coverage → RF11 docs/playtest. Default: finish PL202–PL205 then activate RF*; fast-track = pause PL and switch live pointer. RF3.3 async Postgres deferred. Loop still picks PL* until G0.2.
- 2026-08-03: **Project review (mejoras / gaps)** — Veredicto: core CityLands + MVP vertical está shipped; cola viva = Polish 41 (PL202.1–PL205.2) leftovers de atmósfera/glances; VA* idle; CL99–CL102 frozen; backlog grande (NFT mint, dungeons, caravans, guild wars profundas) sigue en FutureIdeasBacklog. Deuda P0: Postgres path tipado como SQLite sync (`db/client.ts`), sin transacciones en market/trade/mail, auth sin rate-limit/session TTL/logout. P1: partir `GameApp.tsx` (~7.8k) / `BuildingMesh.tsx` (~5.8k) / `catalog.ts` (~14k) + unificar cue helpers; dropear presence HTTP 3s + poll `/api/me` 4s a favor de WS; zod en API; coverage + tests UI. Canvas: `canvases/project-review.canvas.tsx`. Promoted → Hardening plan RF*.
- 2026-08-02: **PL201.1–PL201.2 shipped (housing-decor · homestead-fence soft atmosphere leftovers)** — Decor: quiet warm pulsing rosewood mist via `HOUSING_DECOR_ATMOSPHERE_CUE` leftover disc on DecorPad/Planter/Banner while on player land (complements landmark PL176.1 + place flash PL149.2; ≠ landmark `#c89878` / tip / place / build timber; wider/slower/quieter — landmark stays identity rim). Fence: quiet cool pulsing boundary mist via `HOMESTEAD_FENCE_ATMOSPHERE_CUE` leftover discs at fence corners while on player land (complements fence landmark PL176.2 + path cues; ≠ landmark `#4a6a78` / empty path / decor rosewood / lived path). Choice: continuous decor/fence leftover mists kinship with build-board/workshop/deed-desk leftovers (not a second landmark rim) so decor pads + fence boundary stay glanceable beside landmark identity. Decor costs / layouts SoT; mute ok. Tests: `housing-decor-atmosphere-cue-pl2011`, `homestead-fence-atmosphere-cue-pl2012`. Next pending: **PL202.1**.
- 2026-08-02: **PL200.1–PL200.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_41.md (PL201–PL205)** — Build board: quiet warm pulsing timber mist via `BUILD_BOARD_ATMOSPHERE_CUE` leftover disc on BuildBoardBuilding while on player land (beacon + soft — yard can place; complements landmark PL160.1 + place flash; ≠ landmark `#b88840` / spawn / workshop; wider/slower/quieter — landmark stays empty identity rim). Empty path: quiet cool pulsing path mist via `EMPTY_HOMESTEAD_PATH_ATMOSPHERE_CUE` leftover plane over empty path-cross while yard empty (complements meadow landmark + empty path cue; ≠ path `#6a8090` / meadow gold). Choice: continuous place-zone leftover mist (not empty-beacon-only) so soft-mode boards stay glanceable after first station; continuous empty path leftover mist (not path-emissive-only) so empty yards stay glanceable beside meadow landmark. Build costs / layouts SoT; mute ok. Queue emptied → Polish 41 (housing·fence / shed·lived-path atmospheres, crop-ready·claim-held leftovers, tool·coins idle glances, arena·expand-afford leftovers). Tests: `build-board-atmosphere-cue-pl2001`, `empty-homestead-path-atmosphere-cue-pl2002`. Next pending: **PL201.1**.
- 2026-08-02: **PL199.1–PL199.2 shipped (deed-desk soft atmosphere · soft-war deliver closed glance)** — Deed desk: quiet cool pulsing civic mist via `CITY_DEED_DESK_ATMOSPHERE_CUE` leftover disc on DeedDeskLandmark while on City (complements landmark PL165.1 + mint/link rims; ≠ landmark `#5e7a8c` / notice leftover `#3e5c6e`; wider/slower/quieter — landmark stays identity rim; stub/wallet-free SoT; no NFT combat). Soft-war deliver: quiet TopBar `E · Deliver` chip via `SOFT_WAR_DELIVER_CLOSED_GLANCE` while open contest + guild + wood and claim interact not focused (complements contest atmosphere PL183.2 + deliver rim PL146.2; clears at beacon where interact prompt covers deliver). Choice: continuous City desk leftover mist kinship with notice/vendor leftover discs (not a second landmark slate); continuous E · Deliver chip (not another Delivered toast) so ready wood stays glanceable away from beacon — ember kinship with contest cue. Scoring / stub SoT; min HUD; mute ok. Tests: `deed-desk-atmosphere-cue-pl1991`, `soft-war-deliver-closed-glance-pl1992`. Next pending: **PL200.1**.
- 2026-08-02: **PL198.1–PL198.2 shipped (health · inventory-pickup idle soft glances)** — Health: quiet periodic TopBar HP breath via `HEALTH_METER_IDLE_GLANCE` / `shouldShowHealthMeterIdleGlance` / `topbar-health-meter--idle-glance` while walking healthy with no panel open (complements low-health warn PL67.1 + vignette; low warn wins; heal/combat SoT). Inventory: quiet periodic TopBar `I · Bag` chip via `INVENTORY_PICKUP_IDLE_GLANCE` / `shouldShowInventoryPickupIdleGlance` / `inventoryPickupIdleGlanceLabel` / `topbar-inventory-pickup-glance` after recent bag inflow while Inventory closed (complements slot flash PL128.2 + open accent; arms on risen/new stacks; linger 10s; clears on I open). Choice: continuous healthy HP breath kinship with energy-meter idle PL188.2 (period desynced 6400 vs 5600/4800) so full HP stays glanceable; time-windowed I · Bag chip (not always-on inventory column) so pickups stay glanceable until bag open — mint-olive kinship with slot flash. Min HUD; mute ok. Tests: `health-meter-idle-glance-pl1981`, `inventory-pickup-idle-glance-pl1982`. Next pending: **PL199.1**.
- 2026-08-02: **PL197.1–PL197.2 shipped (chat · notice closed glance leftovers)** — Chat: quiet TopBar `C · Chat` chip via `CHAT_PENDING_CLOSED_GLANCE` while staged unread world/guild lines pending and Chat closed (complements receive ping + open accent; stages on foreign lines while panel closed; clears on C open/close; chat rules SoT). Notice: quiet TopBar `Notice` chip via `NOTICE_UNREAD_CLOSED_GLANCE` while unread tip ids pending and Notice closed (complements unread flicker + open accent; walk-up board — no fake Travel N hotkey; tip ids SoT). Choice: continuous C · Chat chip like Mail/Quest/Invite/Trade so unread social lines stay glanceable — seafoam kinship with chat open accent; continuous Notice chip (not another world · New only) so unread tips stay glanceable from any map until board open — gold kinship with unread cue. Min HUD; mute ok. Tests: `chat-pending-closed-glance-pl1971`, `notice-unread-closed-glance-pl1972`. Next pending: **PL198.1**.
- 2026-08-02: **PL196.1–PL196.2 shipped (workshop · expand-pad soft atmosphere leftovers)** — Workshop: quiet warm pulsing deep timber mist via `WORKSHOP_ATMOSPHERE_CUE` leftover disc on WorkshopBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm timber landmark PL172.2; ≠ landmark `#966848` / working `#c89840` / forge coal `#702818`; wider/slower/quieter). Expand pad: quiet cool pulsing footing mist via `EXPAND_PAD_ATMOSPHERE_CUE` leftover disc on ExpandPadMesh while on player land (complements expand flash + unlock cues + warm field-gold landmark PL163.1; ≠ landmark `#b8a048` / short amber / flash gold / affordable green). Choice: distinct player-land leftover mists (City workshop keeps landmark alone — no stack; expand warm landmark stays identity rim with cool footing leftover, not a second gold disc; not craft/afford-gated) so workshop + expand pad stay glanceable beside working/afford cues. Recipes / expand costs SoT; mute ok. Tests: `workshop-atmosphere-cue-pl1961`, `expand-pad-atmosphere-cue-pl1962`. Next pending: **PL197.1**.
- 2026-08-02: **PL195.1–PL195.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_40.md (PL196–PL200)** — Trade: quiet TopBar `T · Trade` chip via `TRADE_PENDING_CLOSED_GLANCE` while unanswered incoming offer pending and Trade closed (complements receive cue + accept rim; outgoing ignored; escrow SoT). Achievements: quiet TopBar `A · Unlock` chip via `ACHIEVEMENTS_PENDING_CLOSED_GLANCE` while staged new unlock pending review and Achievements closed (complements unlock rim + open accent; stages on locked→unlocked flip; clears on A open). Choice: continuous T · Trade chip like Mail/Quest/Invite so unanswered offers stay glanceable — sage kinship with accept rim; continuous A · Unlock chip (not another Unlocked toast) so new unlocks stay glanceable until reviewed — violet kinship with unlock rim. Queue emptied → Polish 40 (workshop·expand atmospheres, chat·notice closed chips, health·inventory idle glances, deed·soft-war leftovers, build·empty-path atmospheres). Tests: `trade-pending-closed-glance-pl1951`, `achievements-pending-closed-glance-pl1952`. Next pending: **PL196.1**.
- 2026-08-02: **PL194.1–PL194.2 shipped (loom · alchemy soft atmosphere leftovers)** — Loom: quiet warm pulsing deep thread mist via `LOOM_ATMOSPHERE_CUE` leftover disc on LoomBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm thread landmark PL169.2; ≠ landmark `#a88850` / working `#c89840` / kitchen stew `#8a4820`; wider/slower/quieter). Alchemy: quiet cool pulsing deep tonic mist via `ALCHEMY_BENCH_ATMOSPHERE_CUE` leftover disc on AlchemyBenchBuilding while on player land (complements Free/Busy + craft working + City cool tonic landmark PL170.1; ≠ landmark `#4a8878` / working `#c89840` / loom thread `#685028`). Choice: distinct player-land leftover mists (not kinship-stack of City landmarks on City; not craft-gated) so loom + alchemy stay glanceable beside Free/Busy + working cues; City keeps landmark alone. Recipes SoT; mute ok. Tests: `loom-atmosphere-cue-pl1941`, `alchemy-bench-atmosphere-cue-pl1942`. Next pending: **PL195.1**.
- 2026-08-02: **PL193.1–PL193.2 shipped (forge · kitchen soft atmosphere leftovers)** — Forge: quiet warm pulsing deep coal mist via `FORGE_ATMOSPHERE_CUE` leftover disc on ForgeBuilding while on player land (complements Free/Busy + craft working PL121.2 + City warm ember landmark PL173.1; ≠ landmark `#b85828` / working `#c89840`; wider/slower/quieter). Kitchen: quiet warm pulsing stew-hearth mist via `KITCHEN_ATMOSPHERE_CUE` leftover disc on KitchenBuilding while on player land (complements Free/Busy + craft working + City warm hearth landmark PL174.1; ≠ landmark `#c46828` / working `#c89840` / forge coal `#702818`). Choice: distinct player-land leftover mists (not kinship-stack of City landmarks on City; not craft-gated) so forge + kitchen stay glanceable beside Free/Busy + working cues; City keeps landmark alone. Recipes SoT; mute ok. Tests: `forge-atmosphere-cue-pl1931`, `kitchen-atmosphere-cue-pl1932`. Next pending: **PL194.1**.
- 2026-08-02: **PL192.1–PL192.2 shipped (ore-node · mill soft atmosphere leftovers)** — Ore: quiet cool pulsing deep mineral mist via `ORE_NODE_ATMOSPHERE_CUE` leftover disc on OreNodeMesh while on player land (complements ready/depleted PL12.2 + City landmark PL172.1 + Explore premium PL116.2; ≠ landmark `#4a6280` / ready `#6a727a` / premium `#5a7a9a`; wider/slower/quieter). Mill: quiet warm pulsing grain mist via `MILL_ATMOSPHERE_CUE` leftover disc on MillBuilding while on player land (complements Free/Busy + craft working + City cool landmark PL173.2; ≠ landmark `#8a8860` / working `#c89840`). Choice: distinct player-land leftover mists (not kinship-stack of City landmarks on City; not ready/craft-gated) so ore + mill stay glanceable beside ready/working cues; Explore premium keeps its own ready glow. Mine cooldown / recipes SoT; mute ok. Tests: `ore-node-atmosphere-cue-pl1921`, `mill-atmosphere-cue-pl1922`. Next pending: **PL193.1**.
- 2026-08-02: **PL191.1–PL191.2 shipped (animal-pen · tree-stump soft atmosphere leftovers)** — Pen: quiet warm pulsing barn-hay mist via `ANIMAL_PEN_ATMOSPHERE_CUE` leftover disc on AnimalPenBuilding while on player land (complements ready pad PL127.1 + City landmark PL170.2; ≠ landmark `#8a7848` / ready `#7aba58`; wider/slower/quieter). Stump: quiet cool pulsing wood-moss mist via `TREE_STUMP_ATMOSPHERE_CUE` leftover disc on TreeStumpBuilding while on player land (complements ready/depleted + City landmark PL171.2; ≠ landmark `#3a6858` / ready top `#6a8a4a`). Choice: distinct player-land leftover mists (not kinship-stack of City landmarks on City; not ready-gated) so pens + stumps stay glanceable beside ready cues. Care / chop cooldown SoT; mute ok. Tests: `animal-pen-atmosphere-cue-pl1911`, `tree-stump-atmosphere-cue-pl1912`. Next pending: **PL192.1**.
- 2026-08-02: **PL189.2–PL190.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_39.md (PL191–PL195)** — Guild invite: quiet TopBar `G · Invite` chip via `GUILD_INVITE_CLOSED_GLANCE` while unanswered soft offer pending and Guild closed (soft nearby offer shares existing code; join-by-code SoT). Crop: quiet warm pulsing soil mist via `CROP_GROWING_ATMOSPHERE_CUE` while sprout/growing on player land (complements sway + ready pulse; growMs SoT). Dock: quiet cool pulsing water mist via `FISHING_DOCK_ATMOSPHERE_CUE` on City or player land (complements landmark + ready shimmer; catch rates SoT). Choice: continuous G · Invite chip like Mail/Quest; continuous crop/dock leftover mists (not ready-gated) so growing plots + docks stay glanceable. Queue emptied → Polish 39 (pen·stump / ore·mill / forge·kitchen / loom·alchemy atmospheres, trade·achievements closed chips). Tests: `guild-invite-closed-glance-pl1892`, `crop-growing-atmosphere-cue-pl1901`, `fishing-dock-atmosphere-cue-pl1902`. Next pending: **PL191.1**.
- 2026-08-02: **PL189.2 shipped (Guild-invite closed glance leftover)** — Quiet TopBar `G · Invite` chip via `GUILD_INVITE_CLOSED_GLANCE` / `shouldShowGuildInviteClosedGlance` / `guildInviteClosedGlanceLabel` / `topbar-guild-invite-glance` while unanswered soft invite offer pending and Guild closed (complements accept rim PL148.2 + membership open PL140.2; no social column). Soft nearby offer shares existing invite code via `POST /api/guilds/invite/offer` + `guild_invite` WS (`offerGuildInviteToNearby` / `pushGuildInvite`); panel lists pending Join/Dismiss; join-by-code / rank SoT unchanged. Choice: continuous G · Invite chip (not another Joined toast) so unanswered offers stay glanceable like Mail L / Quest Q chips — kinship blue with membership accent. Min HUD; mute ok. Test: `guild-invite-closed-glance-pl1892`. Next pending: **PL190.1**.
- 2026-08-02: **PL188.1–PL189.1 shipped (Interact · energy idle glances + quest-pending closed glance)** — Interact prompt: quiet periodic chrome breath via `INTERACT_PROMPT_IDLE_GLANCE` / `shouldShowInteractPromptIdleGlance` while in range with no panel open (success pulse wins). Energy meter: quiet periodic TopBar breath via `ENERGY_METER_IDLE_GLANCE` / `shouldShowEnergyMeterIdleGlance` while healthy walking (low warn wins; regen SoT). Quest: quiet TopBar `Q · Quest` chip via `QUEST_PENDING_CLOSED_GLANCE` / `shouldShowQuestPendingClosedGlance` while claimable reward pending and Quest closed (complements claim rim + open accent + ready-row; no column). Choice: continuous idle breaths (not more one-shots) so walk-up + healthy energy stay glanceable; continuous Q chip (not another Claim toast) so ready rewards stay glanceable like Mail L chip — periods desynced from map-chip idle. Min HUD; mute ok. Tests: `interact-prompt-idle-glance-pl1881`, `energy-meter-idle-glance-pl1882`, `quest-pending-closed-glance-pl1891`. Next pending: **PL189.2**.
- 2026-08-02: **PL188.1–PL188.2 shipped (Interact-prompt · energy-meter idle soft glances)** — Interact prompt: quiet periodic chrome breath via `INTERACT_PROMPT_IDLE_GLANCE` / `shouldShowInteractPromptIdleGlance` / `interact-prompt--idle-glance` while in interact range with no panel open (complements hierarchy PL2.1 + success pulse PL6.2; success one-shot wins; no HUD column). Energy meter: quiet periodic TopBar bar breath via `ENERGY_METER_IDLE_GLANCE` / `shouldShowEnergyMeterIdleGlance` / `topbar-energy-meter--idle-glance` while walking healthy with no panel open (complements low-energy warn PL9.1 + vignette; low warn wins; regen SoT). Choice: continuous idle chrome breath (not another success one-shot) so walk-up stays glanceable beside hierarchy; continuous healthy meter breath (not low-gated only) so energy stays glanceable while full — periods desynced from map-chip idle. Min HUD; mute ok. Tests: `interact-prompt-idle-glance-pl1881`, `energy-meter-idle-glance-pl1882`. Next pending: **PL189.1**.
- 2026-08-02: **PL187.1–PL187.2 shipped (City vendor · notice soft atmosphere leftovers)** — Vendor: quiet warm pulsing stall mist via `CITY_VENDOR_ATMOSPHERE_CUE` leftover disc on VendorStall over pad while on City (complements stall landmark PL151.1 + Explore stall + commerce pad; ≠ identical landmark honey-copper — distinct wider/slower/quieter mist). Notice: quiet cool pulsing civic mist via `CITY_NOTICE_BOARD_ATMOSPHERE_CUE` leftover disc on NoticeBoardBuilding over pad while on City (complements board landmark PL153.2 + unread flicker; ≠ landmark slate / unread gold / plaza cyan). Choice: continuous City stall mist leftover (not kinship-stack of PL151.1) so hub NPC trade keeps zone atmosphere beside landmark footing; continuous City notice mist leftover (not unread-gated) so hub notices stay glanceable beside landmark. Prices / tip ids / layouts SoT; mute ok. Tests: `city-vendor-atmosphere-cue-pl1871`, `city-notice-board-atmosphere-cue-pl1872`. Next pending: **PL188.1**.
- 2026-08-02: **PL186.1–PL186.2 shipped (portal Free · City market-board soft atmosphere leftovers)** — Portal: quiet deeper cool pulsing Free mist via `PORTAL_FREE_ATMOSPHERE_CUE` leftover disc on PortalBuilding while Free on non-Arena maps (complements Free landmark PL168.2 + threshold pulse; ≠ identical Free cyan landmark disc — distinct wider/slower/quieter mist). Market board: quiet warm pulsing parchment mist via `CITY_MARKET_BOARD_ATMOSPHERE_CUE` leftover disc over pad while on City (complements board landmark + commerce pad; ≠ landmark parchment / Explore stall). Choice: continuous Free mist leftover (not kinship-stack of PL168.2) so fare-free portals keep zone atmosphere beside landmark footing; continuous City board mist leftover (not buy/sell-gated) so hub listings stay glanceable beside landmark. Fares free; prices / layouts SoT; mute ok. Tests: `portal-free-atmosphere-cue-pl1861`, `city-market-board-atmosphere-cue-pl1862`. Next pending: **PL187.1**.
- 2026-08-02: **PL185.1–PL185.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_38.md (PL186–PL190)** — Tutor lane: quiet cool pulsing service mist via `CITY_TUTOR_LANE_ATMOSPHERE_CUE` leftover plane over existing strip while on City (complements landmark strip PL129.1 + plaza mist; ≠ landmark mint / plaza / scarce warm; claim rules / layouts SoT). Map chip: quiet periodic TopBar breath via `MAP_CHIP_IDLE_GLANCE` / `shouldShowMapChipIdleGlance` while walking with no panel open (complements arrive pulse + travel open accent; arrive wins; clears when panel open; fares free; min HUD). Choice: continuous cooler tutor mist leftover (not tip/claim-gated) so service lane stays glanceable beside landmark strip + plaza mist; continuous idle chip breath (not another arrive one-shot / Travel open) so four-map identity stays glanceable while walking. Queue emptied → Polish 38 (portal·market / vendor·notice atmospheres, interact·energy idle glances, quest·guild-invite closed chips, crop·fishing atmospheres). Tests: `city-tutor-lane-atmosphere-cue-pl1851`, `map-chip-idle-glance-pl1852`. Next pending was **PL186.1**.
- 2026-08-02: **PL184.1–PL184.2 shipped (visit-arrive · nearby-peer soft world rim leftovers)** — Visit arrive: brief soft guest-teal rim via `VISIT_ARRIVE_WORLD_REINFORCE` on GameHudShell after visit ok (complements Visiting · PL15.1 + host nameplate PL119.2 + first tip PL53.1; ≠ travel Free cyan / home-return meadow / invite kinship; not kinship — nameplate pad ≠ HUD rim). Nearby peer: brief soft sage rim via `NEARBY_PEER_WORLD_REINFORCE` / `shouldFlashNearbyPeerWorldReinforce` on enter-edge (complements floor ping PL15.2 + silhouette PL40.3 + exit fade PL134.2; no nearby-list growth; not kinship — floor ping ≠ HUD rim). Choice: one-shot guest-teal arrive rim (not another Visiting toast / nameplate) so every visit lands world-readable beside ephemeral + shed plate; one-shot sage enter rim (not another ping ring) so every peer-range enter stays world-readable beside ping + halo. Visit / presence rules unchanged; mute ok; fail silent. Tests: `visit-arrive-world-reinforce-pl1841`, `nearby-peer-world-reinforce-pl1842`. Next pending: **PL185.1**.
- 2026-08-02: **PL182.2–PL183.2 shipped (City civic-pad landmark · claim-node kinship · soft-war contest atmosphere)** — Civic pads: quiet cool service-slate haze/emissive via `CITY_CIVIC_PAD_LANDMARK_CUE` on CivicBlock pads + haze while on City (complements plaza mist + deed desk; ≠ plaza mist / deed / fountain / pad body). Claim-node: kinship with PL163.2 `CLAIM_EMPTY_LANDMARK_CUE` grove mist (no second identical mist). Soft-war: quiet ember pulsing mist via `SOFT_WAR_CONTEST_ATMOSPHERE_CUE` leftover disc on ClaimNodeBuilding while contest open (complements contest beacon pulse + deliver rim; ≠ beacon ember / empty grove / tip gold). Choice: continuous City civic-pad landmark (not tip-gated) so hub façades stay glanceable beside plaza mist + deed desk; kinship assert for claim grove leftover; continuous contest mist leftover (not tip-gated) so open soft-wars read as zone atmosphere beside beacon pulse. Layouts / claim / scoring SoT. Tests: `city-civic-pad-landmark-cue-pl1822`, `claim-node-landmark-cue-pl1831`, `soft-war-contest-atmosphere-cue-pl1832`. Next pending: **PL184.1**.
- 2026-08-02: **PL181.2–PL182.1 shipped (homestead shed landmark · City plaza atmosphere)** — Shed: quiet warm barn-sill honey footing/haze via `HOMESTEAD_SHED_LANDMARK_CUE` on HomesteadYardShed sill + haze disc while lived at home (complements chimney + yard mist; quiet on empty / visit; ≠ chimney orange / mist / path amber / build timber). Plaza: quiet cool pulsing mist via `CITY_PLAZA_ATMOSPHERE_CUE` leftover plane over stone plaza (16×14) while on City (complements fountain landmark + scarce-yard mist; ≠ fountain cyan / scarce warm mist / civic pad). Choice: continuous lived-home shed landmark (not tip-gated) so storage shed stays glanceable beside chimney without inventing stations; continuous City plaza mist leftover (not fountain-gated) so hub center reads apart from warm scarce yard beside fountain landmark. Layouts SoT. Tests: `homestead-shed-landmark-cue-pl1812`, `city-plaza-atmosphere-cue-pl1821`. Next pending: **PL182.2**.
- 2026-08-02: **PL180.2 kinship + Plan rollover → FullGameBuildPlan_CityLands_Polish_37.md (PL181–PL185) + PL181.1 shipped** — Visit-leave leftover acceptance already covered by PL139.1 `VISIT_HOME_RETURN_WORLD_REINFORCE` (Home + tip + visit mist); choice = kinship assert test `visit-leave-world-reinforce-pl1802` (no second identical rim). Queue emptied → Polish 37 (lived-home·shed / City plaza·civic / claim·soft-war / visit-arrive·peer / tutor-lane·map-chip). Lived homestead: quiet warm pulsing hearth mist via `LIVED_HOMESTEAD_ATMOSPHERE_CUE` on HomesteadEnvironment plot mist while lived at home (complements chimney + lived path; quiet on empty / visit). Choice: continuous warm yard mist leftover (not tip-gated) so lived home reads apart from empty meadow + visit cool mist. Layouts SoT. Test: `lived-homestead-atmosphere-cue-pl1811`. Next pending: **PL181.2**.
- 2026-08-02: **PL179.1–PL180.1 shipped (hunt-lose · soft-refuse busy · mute rim leftovers)** — Hunt lose: brief cool trail-ash rim via `HUNT_LOSE_WORLD_REINFORCE` on GameHudShell after lose ok (complements Lost · foe + warm hunt-win rim; win/lose mutually exclusive; fail silent). Soft-refuse busy: brief dusty rose rim via `SOFT_REFUSE_BUSY_WORLD_REINFORCE` on busy interact refuse (same gate as Busy ephemeral; ≠ observational free→busy coral PL166.1). Mute: brief hush graphite rim via `MUTE_WORLD_REINFORCE` on mute toggle either edge (complements Muted/Unmuted + enable-only row confirm). Choice: one-shot cool trail-ash (not another Lost toast / win gold) so lose stays world-readable beside win; one-shot dusty rose refuse (not another Busy toast / coral edge) so interact refuse stays world-readable beside ephemeral + peer pulse; one-shot hush graphite on both mute edges (not enable-only row) so every settings mute toggle stays world-readable. Hunt rates / contention / audio rules unchanged. Note: PL180.2 visit-leave may overlap PL139.1 `VISIT_HOME_RETURN_WORLD_REINFORCE` — leave pending (avoid stacked second leave rim). Tests: `hunt-lose-world-reinforce-pl1791`, `soft-refuse-busy-world-reinforce-pl1792`, `mute-world-reinforce-pl1801`. Next pending: **PL180.2**.
- 2026-08-02: **PL177.2–PL178.2 shipped (City scarce-yard · Explore canopy atmosphere · empty meadow landmark)** — City scarce yard: quiet warm pulsing shared-yard mist via `CITY_SCARCE_YARD_ATMOSPHERE_CUE` on CityEnvironment mist plane over scarce yard floor (14×10 @ z=1.2) while on City (complements station landmarks + Free/Busy; ≠ floor amber / Free cyan / Busy coral / plaza cool). Explore canopy: quiet cool pulsing mist via `EXPLORE_CANOPY_ATMOSPHERE_CUE` leftover plane over PL36.2 static wilds haze while on Explore (complements woodland/mines landmarks; ≠ static haze / woodland teal / mines slate). Empty meadow: quiet warm sunlit haze/emissive via `EMPTY_HOMESTEAD_MEADOW_LANDMARK_CUE` on HomesteadEnvironment outer meadow floor + mist while yard empty (complements empty path slate + meadow contrast; ≠ path / fence pewter / Explore canopy). Choice: continuous City yard mist (not Free/Busy-gated) so shared scarce zone stays glanceable beside pads; continuous Explore canopy mist (not tip/section-gated) so wilds read apart from Warrior warm arena beside static haze; empty-only meadow landmark (clears when lived) so empty yards stay glanceable beside path cue without lived warmth invent. Contention / spawns / layouts SoT. Tests: `city-scarce-yard-atmosphere-cue-pl1772`, `explore-canopy-atmosphere-cue-pl1781`, `empty-homestead-meadow-landmark-cue-pl1782`. Next pending: **PL179.1**.
- 2026-08-02: **PL176.2–PL177.1 shipped (homestead fence landmark · Warrior arena atmosphere)** — Fence: quiet cool pewter haze/emissive via `HOMESTEAD_FENCE_LANDMARK_CUE` on HomesteadEnvironment fence caps + corner haze discs while on player land (complements yard atmosphere + path cues; ≠ decor rosewood / lived path amber / empty path slate / visit mist). Warrior: quiet warm pulsing mist via `WARRIOR_ARENA_ATMOSPHERE_CUE` leftover plane over PL41.2 static haze while on Warrior (complements board landmark + enter/leave; ≠ static haze / board clay / plaque red). Choice: continuous player-land fence landmark (not tip-gated) so yard boundary stays glanceable beside path cues; continuous Warrior mist leftover (not tip/board-gated) so optional arena reads apart from Explore cool canopy beside static haze. Layouts SoT (fence posts ±8/±7); warrior stub / no balance invent. Tests: `homestead-fence-landmark-cue-pl1762`, `warrior-arena-atmosphere-cue-pl1771`. Next pending: **PL177.2**.
- 2026-08-02: **PL176.1 shipped (housing decor landmark)** — Quiet warm rosewood haze/emissive via `HOUSING_DECOR_LANDMARK_CUE` on DecorPadBuilding lip/haze + planter rim + banner footing while on player land (complements tip PL75.1 + place rim PL149.2; ≠ tip gold / lived path amber). Choice: continuous player-land landmark (not tip-gated) so empty pads + placed planter/banner stay glanceable beside yard cues. Costs SoT (planter 12 / banner 18). Test: `housing-decor-landmark-cue-pl1761`. Next pending: **PL176.2**.
- 2026-08-02: **PL175.1–PL175.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_36.md (PL176–PL180)** — Explore thicket: quiet cool leaf-moss haze/emissive via `EXPLORE_THICKET_LANDMARK_CUE` on EdgeThicketMesh curb lips/haze while on Explore (complements hunt tip + ready pad; ≠ thicket pad mauve / trail warm / woodland teal). Visit land: quiet cool pulsing mist via `VISIT_LAND_ATMOSPHERE_CUE` leftover plane over PL51.2 static haze while presence is visit (complements visit tip + leave cue; ≠ static haze / home path / nameplate teal). Choice: continuous Explore-only thicket landmark (not ready/interact-gated) so Monster Hunter thickets stay glanceable beside Animal Hunter trail landmark; continuous visit mist leftover (not tip-gated) so guest yards stay glanceable beside static cool floors. Hunt rates SoT (`HUNT` 60s / leather+meat); visit rules SoT (`Trade · T`). Queue emptied → Polish 36 (housing·fence landmarks, Warrior·City scarce·Explore canopy·empty meadow atmosphere, hunt-lose·busy-refuse·mute·visit-leave rims). Tests: `explore-thicket-landmark-cue-pl1751`, `visit-land-atmosphere-cue-pl1752`. Next pending: **PL176.1**.
- 2026-08-02: **PL174.1–PL174.2 shipped (city kitchen · Explore trail landmarks)** — Kitchen: quiet warm hearth clay-orange haze/emissive via `CITY_KITCHEN_LANDMARK_CUE` on KitchenBuilding pot lip/haze while on City (complements craft working + Free/Busy; ≠ working gold / forge ember / Free cyan). Explore trail: quiet warm packed-path amber haze/emissive via `EXPLORE_TRAIL_LANDMARK_CUE` on GameTrailMesh curb lips/haze while on Explore (complements hunt tip + ready pad; ≠ ready pad amber / woodland teal). Choice: continuous map-only landmarks (not working/ready/interact-gated) so scarce kitchen + Animal Hunter trails stay glanceable beside pads; craft working / hunt ready keep their own surfaces. Recipes SoT (`bake_bread`); hunt rates SoT (`HUNT` 60s / leather+meat). Tests: `city-kitchen-landmark-cue-pl1741`, `explore-trail-landmark-cue-pl1742`. Next pending: **PL175.1**.
- 2026-08-02: **PL173.1–PL173.2 shipped (city forge·mill landmarks)** — Forge: quiet warm ember haze/emissive via `CITY_FORGE_LANDMARK_CUE` on ForgeBuilding firebox lip/haze while on City (complements craft working + Free/Busy; ≠ working gold / workshop timber / Free cyan). Mill: quiet cool grain flour haze/emissive via `CITY_MILL_LANDMARK_CUE` on MillBuilding haze + MillKitMeshes band (≠ working / forge ember / Free). Choice: continuous City-only landmarks (not working/interact-gated) so scarce forge·mill stay glanceable beside pads; craft working keeps its own gold surface. Recipes SoT (`smelt_iron_bar` / `mill_flour`). Tests: `city-forge-landmark-cue-pl1731`, `city-mill-landmark-cue-pl1732`. Next pending: **PL174.1**.
- 2026-08-02: **PL171.2–PL172.2 shipped (city stump·ore·workshop landmarks)** — Tree stump: quiet cool moss woodland haze/emissive via `CITY_TREE_STUMP_LANDMARK_CUE` on TreeStumpBuilding cut-top/body/haze while on City (complements gather ready + Free/Busy; ≠ ready top / crop soil / dock water). Ore: quiet cool slate mineral haze/emissive via `CITY_ORE_NODE_LANDMARK_CUE` on OreNodeMesh rock/haze (≠ ready rock / Free / stump woodland). Workshop: quiet warm carpenter timber haze/emissive via `CITY_WORKSHOP_LANDMARK_CUE` on WorkshopBuilding plank stack/haze (≠ working gold / loom thread / Free). Choice: continuous City-only landmarks (not ready/working/Explore-premium-gated) so scarce stump·ore·workshop stay glanceable beside pads; Explore premium and craft working keep their own surfaces. Yields / recipes SoT. Tests: `city-tree-stump-landmark-cue-pl1712`, `city-ore-node-landmark-cue-pl1721`, `city-workshop-landmark-cue-pl1722`. Next pending: **PL173.1**.
- 2026-08-02: **PL171.1 shipped (city crop-plot landmark)** — Quiet warm tilled-soil haze/emissive via `CITY_CROP_PLOT_LANDMARK_CUE` on CropFieldMesh soil bed/haze while on City (complements ready lime pulse PL12.1 + growing sway PL121.1 + Free/Busy; ≠ ready / pen hay / Free cyan). Choice: continuous City-only landmark (not ready/growing-gated) so scarce plots stay glanceable beside pads. Grow times SoT (wheat 3m). Test: `city-crop-plot-landmark-cue-pl1711`. Next pending: **PL171.2**.
- 2026-08-02: **PL170.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_35.md (PL171–PL175)** — City had no scarce `animal_pen`; choice = seed real scarce station (Vision profession + dock/alchemy pattern) not atmosphere-only prop. Slot 30 at (−1,3); `CITY_SCARCE_STATION_TYPES` + `CITY_PRACTICE_STATIONS.animal_breeder = ["animal_pen"]`; soft presence contention on feed/clean; quiet warm hay landmark via `CITY_ANIMAL_PEN_LANDMARK_CUE` on trough/haze while on City (≠ ready pad green / loom thread / Free cyan). Tips + Content Lock updated; place-on-city still blocked (land unlimited). Yields/CD SoT. Queue emptied → Polish 35 (remaining city scarce crop·tree·ore·workshop·forge·mill·kitchen landmarks + Explore trail·thicket + visit atmosphere). Tests: `city-animal-pen-landmark-cue-pl1702`, `city-scarce-animal-pen-contention-pl1702`. Next pending: **PL171.1**.
- 2026-08-02: **PL169.1–PL170.1 shipped (city dock·loom·alchemy landmarks)** — Fishing dock: quiet cool deep-water haze/emissive via `CITY_FISHING_DOCK_LANDMARK_CUE` on FishingDockBuilding piles/haze while on City (complements tip + Free/Busy; ≠ ready shimmer). Loom: quiet warm thread haze/emissive via `CITY_LOOM_LANDMARK_CUE` on LoomBuilding treadle/haze (complements weave craft; ≠ working gold). Alchemy: quiet cool tonic haze/emissive via `CITY_ALCHEMY_BENCH_LANDMARK_CUE` on AlchemyBenchBuilding burner lip/haze (complements brew; ≠ working / dock). Choice: continuous City-only landmarks (not ready/working/interact-gated) so scarce dock/loom/alchemy stay glanceable beside Free/Busy pads. Catch rates / recipes unchanged. Note: city template still has no `animal_pen` scarce station — PL170.2 may need a scarce pen slot or atmosphere-only cue. Tests: `city-fishing-dock-landmark-cue-pl1691`, `city-loom-landmark-cue-pl1692`, `city-alchemy-bench-landmark-cue-pl1701`. Next pending: **PL170.2**.
- 2026-08-02: **PL168.1–PL168.2 shipped (wallet-disconnect · portal Free landmark leftovers)** — Wallet disconnect: brief cool disconnect ash-slate rim via `WALLET_DISCONNECT_WORLD_REINFORCE` on GameHudShell after disconnect ok (complements Wallet disconnected PL33.3; core loops stay wallet-free; no NFT combat). Portal Free: quiet cool Free cyan haze/emissive via `PORTAL_FREE_LANDMARK_CUE` on PortalBuilding footing/haze while Free on non-Arena maps (complements Free portal pulse PL144.1 + travel rim PL164.1; Arena keeps Exit pulse). Choice: one-shot disconnect ash-slate rim (not another link-slate / deed / Busy) so disconnect stays world-readable beside ephemeral; continuous Free cyan landmark (not another highlight-only pulse / travel Arrived) so fare-free portals stay glanceable beside threshold soft pulse. Core loops wallet-free; fares free. Tests: `wallet-disconnect-world-reinforce-pl1681`, `portal-free-landmark-cue-pl1682`. Next pending: **PL169.1**.
- 2026-08-02: **PL167.1–PL167.2 shipped (deed-mint · wallet-link rim leftovers)** — Deed mint: brief cool mint-slate rim via `DEED_MINT_WORLD_REINFORCE` on GameHudShell after mock mint ok (complements Deed minted PL33.3 + desk landmark; stub path unchanged; no NFT combat). Wallet link: brief cool link-slate rim via `WALLET_LINK_WORLD_REINFORCE` after link ok (complements Wallet linked PL33.3; core loops stay wallet-free). Choice: one-shot mint-slate rim (not another claim system-slate / Busy coral) so every ok mint stays world-readable beside ephemeral + desk haze; one-shot link-slate rim (not another deed claim/mint / Busy) so optional wallet link stays world-readable beside ephemeral. Stub / wallet-free core loops unchanged. Tests: `deed-mint-world-reinforce-pl1671`, `wallet-link-world-reinforce-pl1672`. Next pending: **PL168.1**.
- 2026-08-02: **PL166.1–PL166.2 shipped (scarce-busy · deed-claim rim leftovers)** — Scarce busy: brief Busy coral rim via `SCARCE_BUSY_WORLD_REINFORCE` on GameHudShell when pad edges free→busy (same gate as peer pulse PL115.1; complements Free settle cyan PL165.2 + sticky Busy). Deed claim: brief cool system-slate rim via `DEED_CLAIM_WORLD_REINFORCE` after claim ok (complements Deed claimed PL33.3 + desk landmark PL165.1; wallet path B unchanged; no NFT combat). Choice: one-shot Busy coral rim (not another Free cyan / pad-only pulse) so every free→busy edge stays world-readable beside pad peer pulse; one-shot system-slate rim (not another Deed claimed toast / Busy coral) so cosmetic claim stays world-readable beside ephemeral + desk haze. Contention / wallet path unchanged. Tests: `scarce-busy-world-reinforce-pl1661`, `deed-claim-world-reinforce-pl1662`. Next pending: **PL167.1**.
- 2026-08-02: **PL165.1–PL165.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_34.md (PL166–PL170)** — Deed desk: civic atmosphere prop (no BuildingType) with quiet cool system-slate haze/emissive via `CITY_DEED_DESK_LANDMARK_CUE` on CityEnvironment + `Deed · B` wayfinding (complements open accent PL55.2; wallet path stays B; no NFT combat). Scarce Free settle: brief Free cyan rim via `SCARCE_FREE_SETTLE_WORLD_REINFORCE` on GameHudShell when pad settles busy→Free (same gate as PL119.1; complements sticky Free/Busy). Queue emptied → Polish 34 (scarce-busy·deed-claim, deed-mint·wallet-link, wallet-disconnect·portal Free landmark, city dock·loom / alchemy·pen landmarks). Choice: visible atmosphere desk over inventing BuildingType/E station so B path stays wallet-only while hub reads “deed desk”; one-shot Free cyan rim (not another Busy pulse / travel Arrived) so every Free settle stays world-readable beside pad dim + sticky Free. Contention / wallet path unchanged. Tests: `deed-desk-landmark-cue-pl1651`, `scarce-free-settle-world-reinforce-pl1652`. Next pending: **PL166.1**.
- 2026-08-02: **PL165.1 note (resolved)** — “Deed desk” was HUD-only (`DeedPanel` / B); shipped as civic atmosphere desk prop (not BuildingType) with soft landmark + `Deed · B` label.
- 2026-08-02: **PL164.1–PL164.2 shipped (travel-arrive · day-night-enable rim leftovers)** — Travel: brief cool Free cyan rim via `TRAVEL_ARRIVE_WORLD_REINFORCE` on GameHudShell after map travel Arrived (complements Arrived dest PL115.2 + Free portal pulse PL144.1; ≠ Arena warm enter / dusty leave / meadow home-return). Day-night enable: brief dawn-slate rim via `DAY_NIGHT_ENABLE_WORLD_REINFORCE` when enabling cycle from settings (same gate as confirm PL130.1; complements phase twilight PL160.2; ≠ Free cyan). Choice: one-shot Free cyan rim (not another Arrived toast) so every map hop stays world-readable beside dest whisper + portal Free; one-shot dawn-slate rim (not another Day/night chip / phase twilight) so enabling cycle stays world-readable beside settings confirm + later edges. Fares free; clocks unchanged. Tests: `travel-arrive-world-reinforce-pl1641`, `day-night-enable-world-reinforce-pl1642`. Next pending: **PL165.1**.
- 2026-08-02: **PL163.1–PL163.2 shipped (expand-pad · claim-empty landmark leftovers)** — Expand pad: quiet warm field-gold haze/emissive via `EXPAND_PAD_LANDMARK_CUE` on ExpandPadMesh lip/haze while pad visible (complements short-afford pulse PL123.1 + tip PL72.1; ≠ short amber / flash gold / afford green). Claim empty: quiet cool grove mist via `CLAIM_EMPTY_LANDMARK_CUE` on ClaimNodeBuilding footing/haze while unheld / no contest (complements tip PL80.1 + held PL145.1 + contest PL146.1). Choice: continuous landmarks (not one-shot / interact-only) so unlock pad + unclaimed grove stay glanceable beside short pulse / held green / contest ember. Layouts / costs / claim·war rules unchanged. Tests: `expand-pad-landmark-cue-pl1631`, `claim-empty-landmark-cue-pl1632`. Next pending: **PL164.1**.
- 2026-08-02: **PL161.1–PL162.2 shipped (gather·fish + upgrade·expand rim leftovers)** — Gather: brief mint-lime rim via `GATHER_SUCCESS_WORLD_REINFORCE` after stump/ore/pen gather ok (complements Chopped/Mined/Collected + mint pad PL131.2). Fish: cool water rim via `FISH_CATCH_WORLD_REINFORCE` after dock catch ok (complements Caught + splash PL132.1 + ready shimmer). Upgrade: warm copper rim via `STATION_UPGRADE_WORLD_REINFORCE` after upgrade ok (complements Upgraded + copper pad PL137.1). Expand: field-gold rim via `EXPAND_FIELD_WORLD_REINFORCE` after expand ok (complements Expanded + field-gold pad PL137.2). Choice: one-shot kinship rims (not another toast / pad-only) so each success stays world-readable beside existing settle pads. Yields / catch rates / costs / tiers / slots unchanged. Tests: `gather-success-world-reinforce-pl1611`, `fish-catch-world-reinforce-pl1612`, `station-upgrade-world-reinforce-pl1621`, `expand-field-world-reinforce-pl1622`. Next pending: **PL163.1**.
- 2026-08-02: **PL160.1–PL160.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_33.md (PL161–PL165)** — Empty-land build board: quiet warm timber haze/emissive via `EMPTY_LAND_BUILD_BOARD_LANDMARK_CUE` on BuildBoardBuilding footing/haze while beacon shows (complements beacon PL3.1 + tip PL52.1; soft quiet after first station). Day-phase: brief twilight-sky rim via `DAY_PHASE_WORLD_REINFORCE` on GameHudShell when Dawn/Dusk/Night edges (same gate as TopBar PL57.2; complements edge haze PL122.2). Queue emptied → Polish 33 (gather·fish, upgrade·expand rims, expand-pad·claim-empty landmarks, travel·day-night-enable, deed·scarce Free). Choice: continuous warm timber landmark (not one-shot / beacon-pad-only) so empty yards stay glanceable vs gold pad / spawn amber / lived chimney; one-shot twilight rim (not another Dawn toast / continuous haze) so phase edges stay world-readable beside TopBar + fog. Layouts / clocks unchanged. Tests: `empty-land-build-board-landmark-cue-pl1601`, `day-phase-world-reinforce-pl1602`. Next pending: **PL161.1**.
- 2026-08-02: **PL158.1–PL159.2 shipped (guild create·leave + hunt win·craft leftovers)** — Create: brief warm founding crest teal via `GUILD_CREATE_WORLD_REINFORCE` after create ok (complements Created + membership open). Leave: cool membership-release mist via `GUILD_LEAVE_WORLD_REINFORCE` after leave ok. Hunt win: warm trail-gold via `HUNT_WIN_WORLD_REINFORCE` on win only (complements Won · foe + trail ready; lose quiet). Craft: sprout-olive rim via `CRAFT_COMPLETE_WORLD_REINFORCE` after craft ok (complements olive bench pad PL131.1 + bag pickup PL128.2). Choice: one-shot rims (not another Created/Left/Won/Crafted toast) so each stays world-readable beside existing cues. Guild ranks / hunt rates / recipes unchanged. Tests: `guild-create-world-reinforce-pl1581`, `guild-leave-world-reinforce-pl1582`, `hunt-win-world-reinforce-pl1591`, `craft-complete-world-reinforce-pl1592`. Next pending: **PL160.1**.
- 2026-08-02: **PL156.2–PL157.2 shipped (market·trade·mail cancel confirms)** — Market cancel: brief cool dusty board-ash rim via `MARKET_CANCEL_WORLD_REINFORCE` on GameHudShell after cancel ok (complements Cancelled + list teal PL138.1). Trade cancel: brief cool release mist via `TRADE_CANCEL_WORLD_REINFORCE` after outgoing cancel ok only (same gate as Cancelled PL62.1; complements accept sage PL143.1; incoming reject quiet). Mail cancel: brief cool dusty parchment-ash via `MAIL_CANCEL_WORLD_REINFORCE` after cancel ok (complements Parcel cancelled + send/claim rims PL149.1 / PL152.2). Choice: one-shot ash/mist cancel rims (not another Cancelled toast / list teal / accept sage / send gold) so each cancel stays world-readable beside its post/accept/send kinship. Escrow / fees unchanged. Tests: `market-cancel-world-reinforce-pl1562`, `trade-cancel-world-reinforce-pl1571`, `mail-cancel-world-reinforce-pl1572`. Next pending: **PL158.1**.
- 2026-08-02: **PL155.1–PL156.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_32.md (PL156–PL160)** — Arena board: quiet warm clay-amber haze/emissive via `ARENA_BOARD_LANDMARK_CUE` on ArenaBoardBuilding footing/haze while on Warrior (complements walk-up pulse PL129.2 + tip; stub / no balance invent). Market buy: brief parchment-gold rim via `MARKET_BUY_WORLD_REINFORCE` on GameHudShell after buy ok (complements Bought + list teal PL138.1). Queue emptied → Polish 32 (vendor sell·market cancel, trade·mail cancel, guild create·leave, hunt·craft, empty-build·day-phase). PL156.1 same tick: brief stall amber-copper rim via `VENDOR_SELL_WORLD_REINFORCE` after sell ok (complements Sold PL43.2 + coins-gain PL126.2). Choice: continuous warm plaque landmark (not one-shot / highlight-only) so Warrior stub stays glanceable vs face red / ring gold; one-shot parchment buy rim (not another Bought toast / list teal) so buy stays world-readable; one-shot amber-copper sell rim (not another Sold toast / coins gold) so sell stays world-readable beside buy honey-copper. Layouts / escrow / prices unchanged. Tests: `arena-board-landmark-cue-pl1551`, `market-buy-world-reinforce-pl1552`, `vendor-sell-world-reinforce-pl1561`. Next pending: **PL156.2**.
- 2026-08-02: **PL154.1–PL154.2 shipped (empty homestead / unequip)** — Empty path: quiet cooler slate-dust emissive via `EMPTY_HOMESTEAD_PATH_CUE` on existing yard path/cross in HomesteadEnvironment when yard `empty` (complements lived warm path PL142.1 + empty meadow PL114.1). Unequip: brief cool release-grip mist rim via `TOOL_UNEQUIP_WORLD_REINFORCE` on GameHudShell after unequip ok (complements Unequipped PL20.2 + equip rim PL152.1). Choice: continuous cooler empty path leftover (not one-shot / flat) so empty yards stay glanceable vs lived amber beside meadow; one-shot release-grip mist (not another Unequipped toast) so unequip stays world-readable beside ready-grip steel. Layouts / slots / durability unchanged. Tests: `empty-homestead-path-cue-pl1541`, `tool-unequip-world-reinforce-pl1542`. Next pending: **PL155.1**.
- 2026-08-02: **PL153.1–PL153.2 shipped (vendor buy / notice landmark)** — Vendor buy: brief warm stall honey-copper rim via `VENDOR_BUY_WORLD_REINFORCE` on GameHudShell after buy ok (complements Bought PL43.3 + coins-gain sell rim PL126.2). Notice board: quiet cool civic slate haze/emissive via `CITY_NOTICE_BOARD_LANDMARK_CUE` on NoticeBoardBuilding while on City (complements unread flicker PL117.2 + tip PL36.1). Choice: one-shot stall honey-copper (not another Bought toast / coins gold) so buy stays world-readable beside sell inflow; continuous cool civic landmark (not one-shot / unread-only) so hub notices stay glanceable vs unread gold / plaza cyan. Prices / layouts / tip ids unchanged. Tests: `vendor-buy-world-reinforce-pl1531`, `notice-board-landmark-cue-pl1532`. Next pending: **PL154.1**.
- 2026-08-02: **PL152.1–PL152.2 shipped (equip / mail claim)** — Equip: brief cool ready-grip steel rim via `TOOL_EQUIP_WORLD_REINFORCE` on GameHudShell after tool equip ok (complements Equipped PL20.2 + repair rim PL150.1; unequip stays quiet for PL154.2). Mail claim: brief cool sage-parchment rim via `MAIL_CLAIM_WORLD_REINFORCE` after claim ok (complements Parcel claimed PL17.2 + send rim PL149.1). Choice: one-shot ready-grip steel (not another Equipped toast) so equip stays world-readable beside forge repair / tool-low slate; one-shot sage-parchment (not another Parcel claimed toast) so claim stays world-readable beside send parchment-gold. Durability / escrow unchanged. Tests: `tool-equip-world-reinforce-pl1521`, `mail-claim-world-reinforce-pl1522`. Next pending: **PL153.1**.
- 2026-08-02: **PL151.1–PL151.2 shipped (city vendor / crop harvest)** — City vendor: quiet warm hub honey-copper stall haze/emissive via `CITY_VENDOR_LANDMARK_CUE` on VendorStall while on City (complements Explore stall PL141.2 + market board PL150.2 + commerce pad PL117.1). Crop harvest: brief wheat-gold rim via `CROP_HARVEST_WORLD_REINFORCE` on GameHudShell after harvest ok (complements plant sprout PL127.2 + ready rim PL142.2 + Harvested). Choice: continuous City stall landmark (not one-shot) so hub NPC trade stays glanceable vs Explore regional amber / market parchment; one-shot wheat-gold rim (not another Harvested toast) so harvest stays world-readable beside sprout + ready. Layouts / prices / grow / yield unchanged. Tests: `city-vendor-landmark-cue-pl1511`, `crop-harvest-world-reinforce-pl1512`. Next pending: **PL152.1**.
- 2026-08-02: **PL150.1–PL150.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_31.md (PL151–PL155)** — Tool repair: brief warm forge-pewter rim via `TOOL_REPAIR_WORLD_REINFORCE` on GameHudShell after repair ok (complements Repaired PL25.1 + tool-low vignette clear PL132.2). City market board: quiet parchment-gold listing haze/emissive via `CITY_MARKET_BOARD_LANDMARK_CUE` on MarketBoardBuilding while on City (complements tip PL59.1 + commerce pad PL117.1). Queue emptied → Polish 31 (city vendor·harvest, equip·mail claim, vendor buy·notice, empty homestead·unequip, arena board·market buy). Choice: one-shot forge-pewter rim (not another Repaired toast) so repair stays world-readable beside vignette clear; continuous City listing landmark (not one-shot) so hub board stays glanceable vs Explore stall amber. Mats / layouts / prices unchanged. Tests: `tool-repair-world-reinforce-pl1501`, `city-market-board-landmark-cue-pl1502`. Next pending: **PL151.1**.
- 2026-08-02: **PL149.1–PL149.2 shipped (mail / decor confirms)** — Mail send: brief warm parchment-gold rim via `MAIL_SEND_WORLD_REINFORCE` on GameHudShell after mail send ok (complements Parcel sent PL28.2 + pending glance PL133.1). Decor place: brief rosewood blush rim via `DECOR_PLACE_WORLD_REINFORCE` after place ok (complements decor SFX + Decor placed PL16.2). Choice: one-shot parchment rim (not another Sent toast / mail column) so send stays world-readable; one-shot rosewood rim (not another Decor placed toast) so place stays world-readable beside SFX. Escrow / decor costs·slots unchanged. Tests: `mail-send-world-reinforce-pl1491`, `decor-place-world-reinforce-pl1492`. Next pending: **PL150.1**.

- 2026-08-02: **PL148.1–PL148.2 shipped (guild-bank / invite confirms)** — Withdraw: brief steel-slate rim via `GUILD_BANK_WITHDRAW_WORLD_REINFORCE` on GameHudShell after bank withdraw ok (complements Withdrew PL48.3 + deposit rim PL143.2). Invite accept: brief welcome kinship rim via `INVITE_ACCEPT_WORLD_REINFORCE` after join-by-code ok (complements Joined PL50.1 + membership open PL140.2). Choice: one-shot steel-slate rim (not another Withdrew toast) so withdraw stays world-readable beside deposit membership-blue; one-shot welcome rim (not another Joined toast / invite column) so accept stays world-readable. Bank caps / invite rules unchanged. Tests: `guild-bank-withdraw-world-reinforce-pl1481`, `invite-accept-world-reinforce-pl1482`. Next pending: **PL149.1**.

- 2026-08-02: **PL147.1–PL147.2 shipped (arena leave / exit chrome)** — Leave: brief dusty amber rim via `ARENA_LEAVE_WORLD_REINFORCE` / `isLeavingWarriorMap` on GameHudShell when exiting Warrior (complements enter PL145.2 + Arrived dest). Exit portal: warmer threshold emissive sine via `PORTAL_ARENA_EXIT_SOFT_PULSE` on warrior portals while highlighted (complements Exit soft PL37.1 + cool Free cyan PL144.1). Choice: one-shot dusty leave rim (not another Arrived toast) so exit stays world-readable; continuous warmer underfoot Exit pulse on Arena portals (not another veil bump) so Exit reads apart from Free cyan. Warrior stub / fare-free unchanged. Tests: `arena-leave-world-reinforce-pl1471`, `portal-arena-exit-soft-pulse-pl1472`. Next pending: **PL148.1**.

- 2026-08-02: **PL146.1–PL146.2 shipped (soft-war contest atmosphere)** — Contest: warm-ember continuous banner/footing pulse while `contestEndsAt` future (`CLAIM_NODE_CONTEST_SOFT_CUE`; tip gold > contest > held green). Deliver: one-shot ember rim on ok wood deliver qty (`SOFT_WAR_DELIVER_WORLD_REINFORCE`). Choice: contest pulse on existing claim_node (not a new HUD column / Contest toast); deliver rim complements Delivered · N without inventing scoring. Soft-war window / costs / wood deliver unchanged. Tests: `claim-node-contest-soft-cue-pl1461`, `soft-war-deliver-world-reinforce-pl1462`. Next pending: **PL147.1**.

- 2026-08-02: **Post-VA5 survey — VA* track idle (no VA6)** — Surveyed `land-scene` meshes after VA5.4: **zero structural flat kits** left without shared PBR SoT. Remainders are cue/haze overlays (process/commerce/crop/hunt/tutor/notice/scarce pads, portal veil, HighlightRing basic, atmosphere haze), plus **optional-only** annex notes (crop stem/head PBR, PL118.1 chimney PBR, scarce barrel-band literal dedupe) — not queued. Choice: do not invent VA6 busywork; keep cue envelopes on PL catalogs. Documented in [FullGameBuildPlan_CityLands_VisualAssets_5.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_5.md) Continuations. Next pending for loop: **PL144.1** (Polish).

- 2026-08-02: **VA5.3–VA5.4 shipped — VA5.* emptied (visual assets workstream)** — Crop progress: `cropGrowthProgressBarMaterials` + CropFieldMesh pale fill + quiet frame lip PBR (growMs / ready pulse PL12.1 / growing sway PL121.1 / timer badge unchanged). Cue pads: `cuePadFlashMaterials` land+water disc PBR wired under GatherSuccess / FishCatch / ExpandField / BuildPlace / craft-complete / upgrade flash envelopes (pad RGB / opacity peaks / helpers unchanged; yields / costs intact). Choice: progress bar before cue pads so grow/ready stay isolated; water disc slightly smoother than land flashes. Tests: `world-object-materials-va53`, `world-object-materials-va54`. VA5.* empty — next: survey remaining flat world meshes → VA6 or fold leftovers into next visual appendix.

- 2026-08-02: **VA5 queue + VA5.1–VA5.2 shipped (visual assets workstream)** — Survey after VA4: leftovers = remote presence halo/ping, avatar ground shadow disc, crop progress bar, cue-pad flash discs (gather/fish/expand/build/craft/upgrade). Authored [FullGameBuildPlan_CityLands_VisualAssets_5.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_5.md) (VA5.1–VA5.4). VA5.1: `remotePresenceKitMaterials` + RemotePlayerAvatar halo/ping PBR + quiet lip (PRESENCE_PEER_SILHOUETTE / NEARBY_PEER_PING RGB + PL134.2 exit fade unchanged). VA5.2: `avatarGroundShadowMaterials` + AvatarKit soft disc PBR (silhouette / palette / PL122.1 map tint unchanged). Choice: remotes first (VA4 Continuations), then shadow same kit family as VA3.3; crop bar / cue pads deferred so grow/ready and flash envelopes stay isolated. Tests: `world-object-materials-va51`, `world-object-materials-va52`. Next: VA5.3 crop growth progress bar materials.

- 2026-08-02: **VA4.3–VA4.4 shipped — VA4.* emptied (visual assets workstream)** — Explore wilds: `exploreWildsFloorKitMaterials` + ForestEnvironment canopy/section/entry+hunt path PBR + path lips (EXPLORE_WILDS_VISUAL / EXPLORE_SECTIONS hexes + woodland PL140.1 / mines PL141.1 landmark emissive+haze unchanged; spawns/layouts unchanged). Warrior: `warriorArenaFloorKitMaterials` + ring lip; `interactHighlightRingMaterials` deduped across BuildingMesh + ResourceMeshes (WARRIOR_ARENA_VISUAL hexes + select gold cue unchanged). Choice: Explore floors before arena so woodland/mines landmarks stay isolated; HighlightRing with VA4.4 so select gold stays apart from map ground PBR. Tests: `world-object-materials-va43`, `world-object-materials-va44`. VA4.* empty — remotes / cue-pad discs → Continuations / VA5. Next pending visual: survey leftovers after VA4.

- 2026-08-02: **VA4 queue + VA4.1–VA4.2 shipped (visual assets workstream)** — Survey after VA3: leftovers = city/homestead/explore/warrior floor discs, HighlightRing (dup), remote presence halo/ping + avatar shadow, misc cue pads. Authored [FullGameBuildPlan_CityLands_VisualAssets_4.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_4.md) (VA4.1–VA4.4). VA4.1: `cityHubFloorKitMaterials` + CityEnvironment plaza/scarce curb lips (CITY_HUB_VISUAL hexes + scarce-vs-civic contrast + landmark cues unchanged). VA4.2: `homesteadYardFloorKitMaterials` + HomesteadEnvironment path lips (empty/lived/visit palette + PL142.1 path emissive unchanged). Choice: city floors first (hub beside VA3 civic), then homestead; Explore/Warrior + HighlightRing deferred so landmark/select cues stay isolated. Tests: `world-object-materials-va41`, `world-object-materials-va42`. Next: VA4.3 Explore wilds floor materials.

- 2026-08-02: **VA3.3–VA3.4 shipped (visual assets workstream)** — Avatar farmer: `avatarFarmerKitMaterials` + AvatarKit boot cuffs / belt / tool ferrule PBR (resolveAvatarKitColors + PL122.1 vest/hatBand map tint + remotes palette + silhouette lock unchanged; presence cues untouched). Civic blocks: `civicBlockKitMaterials` + CivicBlock sill / eaves trim PBR (CITY_HUB_VISUAL cool civic pad vs scarce yard + door/window emissive unchanged). Choice: avatar before civic so map-tint palette stays isolated from hub masonry; civic same tick (last VA3 flat kits). Tests: `world-object-materials-va33`, `world-object-materials-va34`. VA3.* empty — next: survey remaining flats (city/homestead/explore floor discs, HighlightRing, remote-only props) → VA4.

- 2026-08-02: **VA3 queue + VA3.1–VA3.2 shipped (visual assets workstream)** — Survey after VA2: leftovers = expand pad posts, claim node beacon, avatar farmer kit, civic block silhouettes (city/homestead/explore floor discs deferred to VA4). Authored [FullGameBuildPlan_CityLands_VisualAssets_3.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_3.md) (VA3.1–VA3.4). VA3.1: `expandPadKitMaterials` + ExpandPadMesh pad lip / post caps (EXPAND_PAD_AFFORD_CUE + short pulse unchanged). VA3.2: `claimNodeKitMaterials` + ClaimNodeBuilding footing/finial (ownership banner colors + tip emissives + CLAIM_NODE produce unchanged). Choice: expand first (homestead every-session unlock), then claim beacon; avatar deferred so map-tint palette stays isolated. Tests: `world-object-materials-va31`, `world-object-materials-va32`. Next: VA3.3 avatar farmer kit materials.

- 2026-08-02: **VA2.5–VA2.6 shipped (visual assets workstream)** — Hunt trail/thicket: `huntTrailKitMaterials` + path curb lips / brush trunks / underbrush clumps / creature paws + horn PBR. HUNT_TRAIL_WAYFINDING path/creature/pad colors + ready tracks/badges + walk-up tip emissives unchanged. Plaza fountain: footing ring / basin lip / water disc PBR under existing spout; CITY_PLAZA_LANDMARK_CUE basin/spout colors + pulse haze unchanged. Warrior arena: post caps + rope/bench/banner pole PBR; WARRIOR_ARENA_VISUAL floors/ring/plaque face + exit chrome unchanged. Choice: hunt kits before civic fountain so Explore hunt nodes match VA1 stations; fountain+arena same tick (last VA2 flat kits). Tests: `world-object-materials-va25`, `world-object-materials-va26`. Next: VA2 queue empty — survey leftovers (avatar / expand / claim) for VA3.

- 2026-08-02: **VA2.3–VA2.4 shipped (visual assets workstream)** — Notice/build/arena: `noticeBoardKitMaterials` / `buildBoardKitMaterials` / `arenaBoardKitMaterials` + post caps / metal corner trim / crossbeam / mid band / plaque frame PBR. Unread flicker / empty-land beacon / arena highlight pulse + WARRIOR_ARENA_VISUAL face colors unchanged. Tutors/decor: `tutorNpcKitMaterials` + boots; pad lip / planter rim+soil / banner footing+finial. Profession cloak colors + claim pads / tips unchanged. Choice: plaque boards before tutors so cue emissives stay isolated; tutors+decor same tick (flat capsules next to upgraded boards). Tests: `world-object-materials-va23`, `world-object-materials-va24`. Next: VA2.5 hunt trail / thicket kits.

- 2026-08-02: **VA2 queue + VA2.1–VA2.2 shipped (visual assets workstream)** — Survey after VA1: remaining flat kits = portals, vendor/market/notice, tutors, housing decor, hunt trails, plaza fountain, warrior arena props, build board, expand/claim, avatar. Authored [FullGameBuildPlan_CityLands_VisualAssets_2.md](docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_2.md) (VA2.1–VA2.6). VA2.1: `portalKitMaterials` + PortalBuilding footings/bands/threshold/keystone PBR (MAP_IDENTITY tint RGB + Free pulse unchanged). VA2.2: `vendorStallKitMaterials` / `marketBoardKitMaterials` + counter apron / post caps. Cue polish / layouts / economy / fares / MAP_IDENTITY unchanged. Choice: portals first (every-map travel gates), then commerce kits; plaque boards deferred to VA2.3 so unread/beacon emissives stay isolated. Tests: `world-object-materials-va21`, `world-object-materials-va22`. Next: VA2.3 notice/build/arena plaque kits.

- 2026-08-02: **VA1.3 shipped (visual assets workstream)** — Extended `world-object-materials.ts` with env kit surfaces + `homesteadTreeMaterials` / `forestTreeMaterials` / `homesteadFenceMaterials` / `homesteadShedMaterials` / `cropPlotSoilMaterials`. Wired Homestead fence (caps/mid-rails), shed shell (sill/planks/eaves/latch via `HomesteadEnvKits`), corner trees (roots/bark band), Explore conifers (flare/bark band), CropFieldMesh soil PBR + furrows/clods by stage. Cue polish / layouts / economy / MAP_IDENTITY / plant·harvest unchanged. Choice: same procedural PBR approach as VA1.1–VA1.2 (no texture pipeline). Tests: `world-object-materials-va13`. VA* queue empty (VA1.1–VA1.3 done).

- 2026-08-02: **VA1.2 shipped (visual assets workstream)** — Extended `world-object-materials.ts` with loom/alchemy kit materials + `gatherDockSurfaceMaterials` / `gatherPenSurfaceMaterials` + scarce yard prop SoT (`CITY_SCARCE_YARD_PROP_*` / `cityScarceYardProps`). Wired loom (shuttle/treadle), alchemy (vessel neck/burner lip), dock (cleats/apron PBR), pen (posts/trough/hay) in BuildingMesh; CityEnvironment scarce yard crates/barrel/post/rope/stone off pads. Cue polish / layouts / economy / MAP_IDENTITY / contention unchanged. Choice: same procedural PBR approach as VA1.1 (no texture pipeline). Tests: `world-object-materials-va12` (+ VA1.1 kit key list extended). Next: VA1.3 environment props (trees/fences/sheds) + crop plot soil articulation.

- 2026-08-02: **VA1.1 shipped (visual assets workstream)** — Survey: world objects are procedural kits (flat `meshStandardMaterial` colors; mill optional GLTF via `GltfOrKit`; no texture maps). First slice: shared SoT `packages/shared/src/world-object-materials.ts` (`WORLD_OBJECT_SURFACE`, `gatherStumpSurfaceMaterials`, `gatherOreSurfaceMaterials`, `PROCESS_STATION_KIT_MATERIALS`) + wired stump/ore meshes and mill/forge/kitchen/workshop kits with roughness/metalness + cheap articulation (bark bands/roots/kerf; ore understone/rubble; mill bands; forge anvil horn/firebox lip; kitchen shelf/pot rim; workshop planks/saw). Cue polish / layouts / economy / MAP_IDENTITY unchanged. Choice: procedural PBR fields over new textures so City scarce + homestead share the same kits without an asset pipeline. Tests: `world-object-materials-va11`, resource-visuals ore surface asserts. Next: VA1.2 loom/alchemy/dock/pen + scarce yard props.


- 2026-08-02: **PL145.1–PL145.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_30.md (PL146–PL150)** — Claim held: quiet ownership-green banner/footing emissive sine while `isYours` via `CLAIM_NODE_HELD_SOFT_CUE` / envelope helpers on ClaimNodeBuilding (complements tip PL80.1 + soft-war PL31.2; tip gold wins briefly; claim rules unchanged). Arena enter: brief warm rim via `ARENA_ENTER_WORLD_REINFORCE` on GameHudShell when entering Warrior (complements Arrived PL115.2 + Warrior tip PL53.2; stub / no balance invent). Queue emptied → Polish 30 (soft-war contest, arena leave·exit, bank·invite, mail·decor, repair·market). Choice: continuous ownership pulse (not another Grove claimed toast) so yours stays glanceable vs rival red; one-shot warm arena rim (not another Arrived toast) so Arena stays world-readable beside ephemeral + chip pulse. Tests: `claim-node-held-soft-cue-pl1451`, `arena-enter-world-reinforce-pl1452`. Next pending: PL146.1 Claim soft-war contest world cue.
- 2026-08-02: **PL144.1–PL144.2 shipped** — Portal free-travel leftover: quiet cooler cyan threshold emissive sine while interact-highlighted via `PORTAL_FREE_TRAVEL_SOFT_PULSE` / `portalFreeTravelSoftPulseEnvelope` + emissive helpers on PortalBuilding (complements veil Free pulse PL120.2 + Travel · free PL37.1 + tip PL42.2; fare-free / destinations unchanged; mute ok). Travel open: map-chip kinship chrome via `TRAVEL_PANEL_MAP_OPEN_ACCENT` / `shouldPlayTravelMapOpenAccent` / `travel-panel--map-open-accent` + `--travel-map-accent` on TravelPanel (complements destination map-tints PL133.2 + open flash PL24.3; destinations / fares unchanged; mute ok). Choice: continuous cooler underfoot pulse (not another veil intensity bump) so Free reads across warm Arena map tints beside the veil; map-chip open flash (not workspace green) so Travel open reads as circuit identity beside continuous destination row tints. Tests: `portal-free-travel-soft-pulse-pl1441`, `travel-panel-map-open-accent-pl1442`. Next pending: PL145.1 Claim-node held soft cue leftover.
- 2026-08-02: **PL143.1–PL143.2 shipped** — Trade accept: brief soft handshake sage edge rim via `TRADE_ACCEPT_WORLD_REINFORCE` / `shouldFlashTradeAcceptWorldReinforce` on GameHudShell after accept ok (complements Trade open PL29.1 + Trade accepted PL18.2; escrow / rules unchanged; mute ok; fail silent). Guild bank deposit: brief quiet membership-blue rim via `GUILD_BANK_DEPOSIT_WORLD_REINFORCE` / `shouldFlashGuildBankDepositWorldReinforce` on GameHudShell after deposit ok (complements Deposited PL48.2 + membership open PL140.2; bank caps unchanged; mute ok; fail silent). Choice: one-shot sage rim (not another Trade accepted toast) so accept stays world-readable beside ephemeral + open accent; one-shot membership-blue rim (not another Deposited toast) so deposit stays world-readable beside the existing ephemeral. Tests: `trade-accept-world-reinforce-pl1431`, `guild-bank-deposit-world-reinforce-pl1432`. Next pending: PL144.1 Portal free-travel soft pulse leftover.
- 2026-08-02: **PL142.1–PL142.2 shipped** — Homestead lived-path: quiet warmer path emissive via `LIVED_HOMESTEAD_PATH_CUE` / `livedHomesteadPathCue` on existing yard path/cross in HomesteadEnvironment when yard `lived` (complements chimney PL118.1 + empty meadow PL114.1; layouts / slots unchanged). Crop-ready: brief quiet harvest lime/gold edge rim via `CROP_READY_WORLD_REINFORCE` / `shouldFlashCropReadyWorldReinforce` on GameHudShell when a plot edges into ready (same gate as Ready soft PL60.1; complements ready pad pulse PL12.1; ≠ plant sprout PL127.2; grow timers unchanged; mute ok). Choice: continuous warm path pulse (not one-shot) so lived yards stay glanceable vs empty meadow beside chimney; one-shot harvest rim (not another Ready toast) so flip stays world-readable beside continuous pad pulse + ephemeral. Tests: `lived-homestead-path-cue-pl1421`, `crop-ready-world-reinforce-pl1422`. Next pending: PL143.1 Trade-accept soft world reinforce.
- 2026-08-02: **PL141.1–PL141.2 shipped** — Explore mines: quiet cooler stone emissive + haze via `EXPLORE_MINES_LANDMARK_CUE` / `exploreMinesLandmarkCue` on existing mines floor in ForestEnvironment (complements woodland PL140.1 + hunt warmth + section floors PL4.2; layouts / spawns unchanged). Explore vendor: quiet warm stall haze/emissive via `EXPLORE_VENDOR_LANDMARK_CUE` / `exploreVendorLandmarkCue` on existing Explore vendor_stall pad+lantern (complements tip PL59.2 + premium glow PL116.2 + commerce pad PL117.1; off Explore quiet; prices / layouts unchanged). Choice: continuous stone pulse (not one-shot) so mines stay glanceable vs woodland teal like plaza/tutor landmarks; Explore-only warm stall over inventing a second stall so regional trade reads at entry without city/land vendor chrome change. Tests: `explore-mines-landmark-cue-pl1411`, `explore-vendor-landmark-cue-pl1412`. Next pending: PL142.1 Homestead lived-path soft cue.
- 2026-08-02: **PL140.1–PL140.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_29.md (PL141–PL145)** — Explore woodland: quiet cooler teal-mist emissive + haze via `EXPLORE_SECTION_LANDMARK_CUE` / `exploreSectionLandmarkCue` on existing woodland floor in ForestEnvironment (complements hunt-trail PL116.1 + Explore tip PL45.1; layouts / spawns unchanged). Guild: cooler membership open accent via `shouldPlayGuildMembershipOpenAccent` / `guild-panel--member-open-accent` when G opens while in a guild (complements Created/Joined PL50.1; non-members keep PL46.1 gold). Queue emptied → Polish 29 (mines·vendor, homestead ambient, trade·bank, portal·map, claim·arena). Choice: continuous woodland landmark pulse (not one-shot) so wilds stay glanceable vs homestead/city like plaza/tutor landmarks; membership-tinted open over another Created toast so guild status reads on panel chrome. Tests: `explore-section-landmark-cue-pl1401`, `guild-membership-open-accent-pl1402`. Next pending: PL141.1 Explore mines soft landmark cue.
- 2026-08-02: **PL139.1–PL139.2 shipped** — Visit home-return: brief soft meadow edge rim via `VISIT_HOME_RETURN_WORLD_REINFORCE` / `shouldFlashVisitHomeReturnWorldReinforce` on GameHudShell when leaving a visit (complements Your land tip PL114.2 + Home PL27.1 + host nameplate PL119.2; Land-chip kinship; visit rules unchanged; mute ok; own-land idle silent). Chat send: brief quiet social seafoam rim via `CHAT_SEND_WORLD_REINFORCE` / `shouldFlashChatSendWorldReinforce` on GameHudShell after send ok (complements Sent PL62.2 + receive Chat PL27.2; quieter than visit rim; chat rules unchanged; mute ok; fail silent). Choice: one-shot meadow rim (not another Home toast) so return stays world-readable beside tip + chip pulse; quieter one-shot seafoam rim (not another Sent toast) so send stays world-readable beside the existing ephemeral. Tests: `visit-home-return-world-reinforce-pl1391`, `chat-send-world-reinforce-pl1392`. Next pending: PL140.1 Explore section soft landmark cue.
- 2026-08-02: **PL138.1–PL138.2 shipped** — Market list: brief soft market-teal edge rim via `MARKET_LIST_WORLD_REINFORCE` / `shouldFlashMarketListWorldReinforce` on GameHudShell after list ok (complements Listed PL10.2; coins rim stays for sells; escrow / fees unchanged; mute ok; fail silent). Quest claim: brief soft verdant edge rim via `QUEST_CLAIM_WORLD_REINFORCE` / `shouldFlashQuestClaimWorldReinforce` on GameHudShell after claim ok (complements Quest claimed PL29.3 + coins gold PL126.2; rewards / catalog unchanged; mute ok; fail silent). Choice: one-shot teal rim (not another Listed toast) so list stays world-readable even when fee spend keeps coins rim quiet; one-shot verdant rim (not another Quest claimed toast) so claim stays world-readable beside coins gold when rewards include coins. Tests: `market-list-world-reinforce-pl1381`, `quest-claim-world-reinforce-pl1382`. Next pending: PL139.1 Visit home-return soft world reinforce.
- 2026-08-02: **PL136.2–PL137.2 shipped** — Title: brief warm ochre edge rim via `TITLE_CHANGE_WORLD_REINFORCE` / `shouldFlashTitleChangeWorldReinforce` on GameHudShell when cosmetic title changes (same gate as Title · PL49.1; ≠ level sage / unlock violet / coins gold; titles cosmetic; mute ok; hydrate quiet). Station upgrade: brief copper pad via `STATION_UPGRADE_PAD_FLASH` / `shouldFlashStationUpgradePad` on upgraded mill/forge (id-scoped) after ok upgrade (complements Upgraded PL48.1 + craft olive PL131.1; costs / tiers unchanged; mute ok; fail silent). Expand: brief field-gold pad via `EXPAND_FIELD_PAD_FLASH` / `ExpandFieldFlashPad` on footprint coords frozen at expand ok (complements Expanded PL20.3 + short-afford PL123.1; costs / slots unchanged; mute ok). Choice: one-shot ochre rim (not another Title toast) so title stays world-readable beside Title · even when level rim also fires; id-scoped copper settle (not another Upgraded toast) so multi-station yards flash the right bench; footprint coords frozen before applyState so the pad lands on the unlocked cell after the expand marker moves. Tests: `title-change-world-reinforce-pl1362`, `station-upgrade-pad-flash-pl1371`, `expand-field-pad-flash-pl1372`. Next pending: PL138.1 Market-list soft world reinforce.
- 2026-08-02: **PL136.1 shipped** — Achievement unlock: brief amber-violet edge rim via `ACHIEVEMENT_UNLOCK_WORLD_REINFORCE` / `shouldFlashAchievementUnlockWorldReinforce` on GameHudShell when stubs flip (same flashUnlocks gate as Unlocked · PL47.2; ≠ level sage PL135.2 / coins gold; unlock rules unchanged; mute ok; hydrate quiet). Choice: one-shot violet rim (not another Unlocked toast) so unlock stays world-readable beside the ephemeral; same gate as PL47.2 so Level N still owns the cue when both fire. Test: `achievement-unlock-world-reinforce-pl1361`. Next pending: PL136.2 Title-change soft world reinforce.
- 2026-08-02: **PL135.1–PL135.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_28.md (PL136–PL140)** — Scarce Free: quiet sticky Free Html + cooler pad/halo via `CITY_SCARCE_STATION_FREE_CUE` / `shouldShowScarceFreeStickyWorldLabel` on ScarceStationPad while free (pairs Busy PL8.1 + settle PL119.1; contention / land unlimited unchanged; mute ok). Level-up: brief sage-teal edge rim via `LEVEL_UP_WORLD_REINFORCE` / `shouldFlashLevelUpWorldReinforce` on GameHudShell when characterLevel rises (complements Level N PL47.1 + coins gold PL126.2; XP curve / titles unchanged; mute ok; no XP bar invent). Queue emptied → Polish 28 (progress unlock·title, upgrade·expand pads, market·quest confirms, visit·chat, explore·guild). Choice: continuous Free sticky (not pad-only) so Free↔Busy stay equally glanceable; one-shot sage rim (not another Level toast) so progress stays world-readable beside Level N. Tests: `city-scarce-free-sticky-world-label-pl1351`, `level-up-world-reinforce-pl1352`. Next pending: PL136.1 Achievement unlock soft world reinforce.
- 2026-08-02: **PL134.1–PL134.2 shipped** — Build place: brief warm timber-amber pad via `BUILD_PLACE_SPAWN_FLASH` / `shouldFlashBuildPlaceSpawn` / `newlyPlacedStationBuildingId` / `BuildPlaceSpawnFlashPad` on the newly placed station after build ok (complements Homestead PL25.2 + Built PL28.3 + beacon hide PL3.1; place costs / slots unchanged; mute ok). Peer exit: soft ping-ring ease-out via `NEARBY_PEER_EXIT_FADE` / `shouldStartPeerRangeExitFade` on RemotePlayerAvatar when leaving interact range (complements enter ping PL15.2 + silhouette PL40.3; no nearby-list growth; presence rules unchanged). Choice: id-scoped one-shot spawn pad (not another Built toast) so place stays world-readable; exit fade reuses enter-ping palette over inventing a second ring so leave reads soft without HUD growth. Tests: `build-place-spawn-flash-pl1341`, `peer-range-exit-fade-pl1342`. Next pending: PL135.1 Scarce Free sticky world label.
- 2026-08-02: **PL133.1–PL133.2 shipped** — Mail closed glance: quiet TopBar `L · Mail` chip via `MAIL_PENDING_CLOSED_GLANCE` / `shouldShowMailPendingClosedGlance` / `mailPendingClosedGlanceLabel` while inbox pending and Mail closed (complements panel unread PL17.1 + open accent PL34.1; no always-on mail column; clears when empty or panel open). Travel: quiet destination-row accents via `TRAVEL_DESTINATION_MAP_TINT` / `travelDestinationMapTintAccent` / `travelDestinationMapTintStyle` matching TopBar MAP_IDENTITY chip colors for City/Land/Explore/Arena (Here stays louder; fare-free unchanged). Mailbox / destinations unchanged. Choice: continuous L · Mail chip (not a toast / not a column) so pending parcels stay glanceable while walking until L opens the panel; continuous per-row map accent over one-shot so Travel stays tied to the four-map chip palette. Tests: `mail-pending-closed-glance-pl1331`, `travel-destination-map-tint-pl1332`. Next pending: PL134.1 Build-place soft spawn flash.
- 2026-08-02: **PL131.2–PL132.2 shipped** — Gather: brief mint-lime pad settle via `GATHER_SUCCESS_PAD_FLASH` / `shouldFlashGatherSuccessPad` on stump / ore / pen after gather ok by building id (complements Chopped/Mined/Collected + inventory flash PL128.2). Fish catch: brief cool water splash via `FISH_CATCH_SPLASH_FLASH` / `shouldFlashFishCatchSplash` on fishing dock after catch ok (complements Caught + ready shimmer PL118.2; ≠ mint gather). Tool low: quiet cool steel edge vignette via `TOOL_LOW_WORLD_VIGNETTE` / `shouldShowToolLowWorldVignette` on GameHudShell while equipped tool stays in TOOL.lowWarnPct (complements TopBar PL61.1 + inventory PL21.1; ≠ energy/HP; clears on repair/replace). Yields / catch rates / cooldowns / durability rules unchanged; mute ok. Choice: id-scoped one-shot pads so multi-node yards flash the right station; cooler splash for docks; continuous steel rim (not one-shot) so worn tools stay world-readable beside TopBar. Tests: `gather-success-pad-flash-pl1312`, `fish-catch-splash-flash-pl1321`, `tool-low-world-vignette-pl1322`. Next pending: PL133.1 Mail-pending closed glance.
- 2026-08-02: **PL131.1 shipped** — Craft complete: brief sprout-olive pad settle via `CRAFT_COMPLETE_BENCH_FLASH` / `shouldFlashCraftCompleteBench` / envelope helpers on process stations after craft ok (complements Crafted + working gold PL121.2; recipes / XP unchanged; mute ok; fail silent). Choice: one-shot olive settle (not another Crafted toast) so bench success stays world-readable beside continuous working glow while panel stays open. Test: `craft-complete-bench-flash-pl1311`. Next pending: PL131.2 Gather-success soft pad flash.
- 2026-08-02: **PL129.2–PL130.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_27.md (PL131–PL135)** — Arena: soft plaque emissive sine while interact-highlighted via `ARENA_PLAQUE_HIGHLIGHT_PULSE` / envelope + intensity helpers on ArenaBoardBuilding (complements PL41.2 haze / PL11.1 plaque; walk-up tip stays bright; stub / no balance invent; mute ok). Day-night + tips: brief settings-row flash + chip via `DAY_NIGHT_ENABLE_CONFIRM_MS` / `TIPS_ENABLE_CONFIRM_MS` / `shouldFlashDayNightEnableConfirm` / `shouldFlashTipsEnableConfirm` on enable edge only (mute-enable family PL125.2; cycle cosmetic; tip ids unchanged; settings only). Queue emptied → Polish 27 (craft·gather success, fish·tool leftovers, mail·travel glanceables, build·peer atmosphere, Free sticky·level-up). Choice: continuous soft sine while highlighted (not one-shot) so optional warrior plaques stay glanceable in range like portal Free pulse; enable-only settings flashes over re-flashing disable so chrome stays asymmetric with mute. Tests: `arena-plaque-walkup-pulse-pl1292`, `day-night-toggle-soft-confirm-pl1301`, `tips-toggle-soft-confirm-pl1302`. Next pending: PL131.1 Craft-complete soft bench flash.
- 2026-08-02: **PL128.2–PL129.1 shipped** — Inventory: brief mint-olive slot/border flash via `INVENTORY_PICKUP_SLOT_FLASH` / `inventoryPickupFlashStackIds` / `shouldFlashInventoryPickupSlots` wired GameApp applyState→InventoryPanel when qty rises or new stack (complements gather/craft/buy SFX; capacity unchanged; mute ok; skip first hydrate). Tutor lane: quiet cooler mint-teal emissive + haze via `CITY_TUTOR_LANE_LANDMARK_CUE` / `cityTutorLaneLandmarkCue` / envelope helpers on existing CityEnvironment strip (complements plaza PL125.1; ≠ warm scarce / plaza blue; claim rules / layouts unchanged; no station invent). Choice: detect rising/new stacks centrally in applyState (not only three call sites) so bag inflow stays readable for gather·craft·buy and kinship harvest/claim without a second Got toast; continuous soft lane pulse over one-shot so tutors stay glanceable vs scarce yard like the plaza fountain. Tests: `inventory-pickup-slot-flash-pl1282`, `tutor-lane-landmark-strip-pl1291`. Next pending: PL129.2 Arena plaque soft walk-up pulse.
- 2026-08-02: **PL127.2–PL128.1 shipped** — Crop plant: brief sprout-green edge radial rim via `CROP_PLANT_SUCCESS_WORLD_REINFORCE` / `shouldFlashCropPlantSuccessWorldReinforce` / `cropPlantSuccessWorldReinforceBackground` on GameHudShell after ok plant (complements plant SFX + Planted; grow timers / seeds unchanged; mute ok). Quest panel: quiet ready-row tint via `QUEST_READY_ROW_ACCENT` / `shouldShowQuestReadyRowAccent` / `questReadyRowAccentClassName` on claimable rows (complements Claim + Quest claimed PL29.3; catalog / claim rules unchanged; min HUD). Choice: one-shot sprout rim (not another Planted toast) so empty→growing stays world-readable; continuous ready-row tint (not one-shot) so claimable quests stay glanceable while the panel is open. Tests: `crop-plant-success-world-reinforce-pl1272`, `quest-ready-row-accent-pl1281`. Next pending: PL128.2 Inventory pickup soft slot flash.
- 2026-08-02: **PL126.2–PL127.1 shipped** — Coins gain: brief warm gold edge radial rim via `COINS_GAIN_WORLD_REINFORCE` / `shouldFlashCoinsGainWorldReinforce` / `coinsGainWorldReinforceBackground` on GameHudShell when soft currency rises from vendor sell / market (delta-gated) / quest·tutor claim (complements Sold/Bought; prices / sinks unchanged; mute ok). Animal pen: soft pad/emissive sine while collect-ready via `ANIMAL_PEN_READY_PAD_PULSE` / `animalPenReadyPadPulse` / envelope+intensity helpers on AnimalPenBuilding (complements Ready PL30.2 / edge PL69.2; kinship dock shimmer PL118.2; cooldown / rates unchanged). Choice: one-shot gold rim (not another Coins toast) so inflow stays world-readable beside Sold/Bought; continuous ready pad pulse over one-shot so pens stay glanceable like docks while care is available. Tests: `coins-gain-world-reinforce-pl1262`, `animal-pen-ready-pad-pulse-pl1271`. Next pending: PL127.2 Crop plant success soft reinforce.
- 2026-08-02: **PL125.1–PL126.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_26.md (PL126–PL130)** — Plaza: quiet cool fountain emissive + haze via `CITY_PLAZA_LANDMARK_CUE` / `cityPlazaLandmarkCue` / pulse envelope helpers on existing CityEnvironment fountain (hub center ≠ warm scarce yard; layouts / contention unchanged; no station invent). Mute: brief settings mute-row flash + chip via `MUTE_ENABLE_CONFIRM_MS` / `shouldFlashMuteEnableConfirm` on enable edge only (complements TopBar Muted PL37.2; unmute cue-only; mute still silences BGM+SFX; settings only). Queue emptied → Polish 26 (health vignette·coins, pen·plant ambient, quest·inventory glanceables, tutor·arena landmarks, day·tips settings). Health low: quiet cool crimson edge radial vignette via `HEALTH_LOW_WORLD_VIGNETTE` / `shouldShowHealthLowWorldVignette` on GameHudShell while `isHealthLow` (complements TopBar · low PL67.1; COMBAT.lowWarnPct SoT unchanged; distinct from warm energy amber PL124.1; clears when recovered; mute ok; not a HUD column). Choice: always-on cool fountain landmark (not busy-gated) so plaza identity stays glanceable beside scarce pads; enable-only mute-row flash over re-flashing unmute so settings confirm stays asymmetric with the silencing edge; continuous cool HP rim (not one-shot) mirroring energy vignette so fragile HP stays world-readable. Tests: `city-plaza-landmark-cue-pl1251`, `mute-toggle-soft-confirm-pl1252`, `health-low-world-vignette-pl1261`. Next pending: PL126.2 Coins-gain soft reinforce.
- 2026-08-02: **PL124.1–PL124.2 shipped** — Energy low: quiet warm danger-amber edge radial vignette via `ENERGY_LOW_WORLD_VIGNETTE` / `shouldShowEnergyLowWorldVignette` / `energyLowWorldVignetteBackground` on GameHudShell while `isEnergyLow` (complements TopBar · low PL9.1; threshold SoT unchanged; clears when recovered; mute ok; not a HUD column). Eat success: brief warm olive recovery rim via `EAT_SUCCESS_WORLD_REINFORCE` / `shouldFlashEatSuccessWorldReinforce` wired GameApp→GameHudShell (complements eat SFX + Ate PL20.1; food / energy restore unchanged). Choice: continuous soft edge vignette while low (not one-shot) so the world stays glanceably tired until regen/food recovers; one-shot olive recovery rim (not another Ate toast) so food→energy stays world-readable beside existing ephemeral + SFX. Next pending: PL125.1 City plaza soft landmark cue.
- 2026-08-02: **PL123.1–PL123.2 shipped** — Expand pad: soft warm amber emissive sine while short + interact-highlighted via `EXPAND_PAD_SHORT_AFFORD_PULSE` / `expandPadShortAffordPulseActive` / envelope+emissive helpers on ExpandPadMesh (complements PL26.1 short tint; affordable / idle short stay static; costs / slots unchanged; mute ok). Trade visit: soft `Host ·` panel chip + open-accent reinforce via `TRADE_PREFERRED_PARTNER_NAMEPLATE` / `tradePreferredPartnerNameplateText` / border helpers in TradePanel (teal kinship with visit host world nameplate PL119.2; trade rules / T hotkey unchanged; min HUD). Choice: continuous short+highlighted pulse (not one-shot) so can't-afford pads stay glanceable in range; panel Host · chip over a second world plaque so visit trade reads without inventing HUD columns. Next pending: PL124.1 Energy-low soft world vignette.
- 2026-08-02: **PL122.1–PL122.2 shipped** — Local avatar: quiet vest→portalVeil + hatBand→accent + soft vest emissive via `LOCAL_AVATAR_MAP_TINT` / `localAvatarMapTintForLandKind` / `resolveAvatarKitColors` wired LandScene→PlayerAvatar→AvatarKit (local only; remotes stay peer palette; complements chip PL14.1 + portal PL14.2; movement / combat unchanged). Day-phase haze: brief fog pull + warm/cool fog mix + hemi bump / sun dip on dusk↔night + night↔dawn via `DAY_PHASE_EDGE_HAZE` helpers in DayNightLighting (midday quiet; settings cycle off silences haze; complements PL57.2 phase cues). Choice: vest toward portal veil (not chip accent) so Land≠Explore contrast stays glanceable; edge-only haze windows (not continuous night fog) so steady day/night lighting stays the baseline. Next pending: PL123.1 Expand-pad short afford pulse.

- 2026-08-02: **PL121.1–PL121.2 shipped** — Crop growing: quiet olive pad + signed stem lean via `CROP_GROWING_SOFT_SWAY` / `cropGrowingSoftSwayActive` / envelope+pad/stem helpers on CropFieldMesh (sprout/growing only; empty quiet; ready keeps PL12.1 pulse + PL40.1 label; growMs unchanged). Process stations: soft warm pad/body glow while craft panel open via `PROCESS_STATION_WORKING_EMISSIVE` / `shouldShowProcessStationWorkingEmissive` wired mill→alchemy through LandScene `craftPanelStation` (panel-open = in-flight; no invent queues; recipes / XP / Craft label unchanged; mute ok). Choice: continuous soft growing sway (not one-shot) so plots read apart from empty for the whole grow window; panel-open working glow (not craft-click flash) so busy craft reads while the bench UI is up without inventing timers. Next pending: PL122.1 Local avatar map-tint micro.

- 2026-08-02: **PL119.2–PL120.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_25.md (PL121–PL125)** — Visit host: soft shed Html nameplate + pad via `VISIT_HOST_NAMEPLATE` / `shouldShowVisitHostNameplate` / arrive reinforce envelope in HomesteadEnvironment (complements PL15.1 Visiting ·; cool teal kinship with peer silhouette PL40.3; visit rules / min HUD unchanged). Map BGM: brief bed-rooted two-note stinger via `BGM_ARRIVE_IDENTITY_STINGER` / `bgmArriveIdentityStingerSteps` / `shouldPlayBgmArriveIdentityStinger` on free-travel map change (complements travel SFX PL11.2 + soft swap PL51.1; fare-free / mute ok). Portal Free pulse: soft veil opacity/emissive sine while interact-highlighted via `PORTAL_HIGHLIGHT_FREE_PULSE` helpers on PortalBuilding (complements Travel · free PL37.1 + tint PL14.2; destinations unchanged). Queue emptied → Polish 25 (crop·process ambient, avatar·day haze, expand·trade glanceables, energy·eat feedback, plaza·mute chrome). Choice: always-on visit shed nameplate + brief arrive pad pulse over TopBar-only so host stays in-world; bed-rooted stinger (not a second suite) so City/Land/Explore/Arena beds stay distinct on arrive; continuous highlight sine over one-shot so fare-free portals stay glanceable in range. Next pending: PL121.1 Crop growing soft sway cue.

- 2026-08-02: **PL118.1–PL119.1 shipped** — Lived homestead: soft chimney emissive + roof plume via `LIVED_HOMESTEAD_CHIMNEY_CUE` / `livedHomesteadChimneyCue` + plume envelope on the existing shed when yard is `lived` (same PL3.1/PL22.1 station gate; empty quiet; no station invent; beacon unchanged; complements empty meadow PL114.1). Fishing dock: soft ready water sine + pad via `FISHING_DOCK_READY_WATER_SHIMMER` / `fishingDockReadyWaterShimmer` on FishingDockBuilding (cooling quiet; cooldown / catch rates unchanged; complements PL30.1 Ready + PL65.2 edge). City scarce Free settle: brief pad dim/emissive busy→free via `CITY_SCARCE_FREE_SETTLE_FLASH` / `shouldFlashScarceFreeSettleEdge` in `ScarceStationPad` (complements PL115.1 busy pulse + sticky Free/Busy PL8; contention unchanged; mute ok). Choice: shed chimney (not new building) so lived≠empty without invent; continuous ready water shimmer over one-shot so docks stay glanceable while castable; edge-only Free settle dim mirroring busy pulse so sticky Free stays the steady read. Next pending: PL119.2 Visit host nameplate reinforce.

- 2026-08-02: **PL117.1–PL117.2 shipped** — Market/vendor: warm lantern + pad via `CITY_COMMERCE_SERVICE_PAD` / `cityCommerceServicePad` on VendorStall + MarketBoard (apart from scarce yard PL1.1 + cool civic PL36.1; awning/board kits PL1.3 kept; prices/panels unchanged; no station invent). Notice unread: soft plaque sine flicker via `noticeUnreadFlickerEnvelope` / `noticeUnreadPlaqueEmissiveIntensity` while tips unread (PL17.1 New pad/halo/`· New` kept; tip ids / localStorage unchanged; min HUD). Choice: always-on commerce warmth (not busy-gated) so market≠yard at a glance; continuous soft sine flicker over one-shot flash so unread board stays glanceable until tips are seen. Next pending: PL118.1 Lived-homestead quiet chimney cue.
- 2026-08-02: **PL116.1–PL116.2 shipped** — Hunt trails: warm sand Animal pad (`game_trail`) vs cool dusk mauve Monster pad (`edge_thicket`) via `HUNT_TRAIL_WAYFINDING` / `huntTrailWayfindingVisual` wired through `trailVisual` + GameTrail/EdgeThicket meshes (cooling softens pad but keeps contrast; hunt energy / explore-only / spawns unchanged). Explore premiums: ready-only soft pad/emissive via `EXPLORE_PREMIUM_NODE_GLOW` / `explorePremiumNodeGlow` on Explore stump/ore (City/Land/warrior quiet; depleted stays PL12.2; vendor premium rates unchanged). Choice: always-on quiet trail pads (not ready-only) so AH≠MH reads at a glance even while cooling; Explore-map gate for premium glow so land/city common gather stays un-glowed. Next pending: PL117.1 Market / vendor service-pad warmth.

- 2026-08-02: **PL115.1–PL115.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_24.md (PL116–PL120)** — City scarce: brief pad/halo free→busy pulse via `CITY_SCARCE_BUSY_PEER_PULSE` / `shouldPulseScarceBusyPeerEdge` / `cityScarceBusyPeerPulseEnvelope` + intensity/opacity helpers in `ScarceStationPad` (sticky Busy PL8.1 kept; contention unchanged; mute ok). Travel arrive: one-shot `Arrived ·` via `travelArriveSuccessCueText` / `travelArriveDestinationLabel` / `shouldFlashTravelArriveSuccessCue` locked to TravelPanel `LAND_DESTINATIONS.name` (not chip short words; no caravan; first-map tips may replace). Queue emptied → Polish 24 (explore hunt/premium, city market/notice, homestead chimney·dock shimmer, free-settle·visit nameplate, BGM·portal pulse). Choice: edge-only busy pulse over continuous loop so sticky Busy stays the steady read; panel destination names over Land/Explore/Arena chip words so Arrived matches TravelPanel. Next pending: PL116.1 Explore hunt-trail wayfinding contrast.

- 2026-08-02: **PL114.1–PL114.2 shipped** — Empty homestead: warmer outer meadow `#628848` + readable fence via `HOMESTEAD_YARD_VISUAL.empty` meadow/fence colors wired through `homesteadYardFloorColors` / `HomesteadEnvironment`; contrast helpers `emptyHomesteadVsExploreMeadowContrast` / `emptyHomesteadFenceVsMeadowContrast` / `emptyVsLivedHomesteadMeadowContrast`; lived meadow quieter olive; visit cool fence unchanged; PL3.1 beacon / no station invent. Visit leave: soft TopBar `Your land` via `shouldShowVisitHomeReturnWorldTip` / `visitHomeReturnWorldTip` + Land map-chip pulse via `shouldPulseMapChipOnVisitHomeReturn` reinforcing PL27.1 `Home` ephemeral; own-land idle silent; visit rules / min HUD unchanged. Choice: warm empty meadow/fence over inventing stations so empty land ≠ Explore canopy; soft `Your land` tip + chip pulse over a second ephemeral verb so Home stays the leave confirm. Next pending: PL115.1 City scarce-busy peer pulse.

- 2026-08-02: **PL112.1–PL113.2 shipped** — Deed surface: ephemeral `Gone` / `Yours` / `Mint` / `Listed` / `Unlisted` / `Price` / `Owned` / `Forest` via `shouldFlashDeedMissingRefuseCue` / `shouldFlashDeedNotYoursRefuseCue` / `shouldFlashDeedNeedMintRefuseCue` / `shouldFlashDeedAlreadyMintedRefuseCue` / `shouldFlashDeedAlreadyListedRefuseCue` / `shouldFlashDeedNotListedRefuseCue` / `shouldFlashDeedBadPriceRefuseCue` / `shouldFlashDeedAlreadyOwnedRefuseCue` / `shouldFlashDeedNeedForestRefuseCue` + refuse SFX. Wallet settings: ephemeral `Linked` / `Wallet` via `shouldFlashWalletAlreadyLinkedRefuseCue` / `shouldFlashWalletNotLinkedRefuseCue` + refuse SFX. Sticky long prose suppressed; deed mint/list/price/forest / wallet link rules unchanged; settings/deed surface only; mute ok. Choice: reuse Gone/Yours family for missing/not-yours; Mint shared verb for need-mint + already-minted (separate flash predicates); Listed/Unlisted list-state pair; Price/Owned/Forest one-word; Linked vs Wallet so already-linked vs disconnect stay clear. Next pending: PL114.1 Empty-homestead meadow contrast.

- 2026-08-02: **PL108.1–PL111.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_23.md (PL111–PL115)** — Inventory·build: ephemeral `Item` / `Build` via `shouldFlashItemMissingRefuseCue` / `shouldFlashUnknownStationRefuseCue` for `itemMissing` / `unknownStation` + refuse SFX. Guild leftovers: ephemeral `Gone` / `Member` / `Rank` via `shouldFlashGuildNotFoundRefuseCue` / `shouldFlashGuildTargetMissingRefuseCue` / `shouldFlashGuildRankInvalidRefuseCue`. Quest·need: ephemeral `Quest` / `Need` via `shouldFlashQuestUnknownRefuseCue` / `shouldFlashMissingItemRefuseCue` for `questUnknown` + dynamic `missingItem(name)` (Title Case `You need X.` carved from other You-need*). Sticky long prose suppressed; inventory / station catalog / guild lookup·membership·rank / quest catalog / item reqs unchanged; mute ok. Queue emptied → Polish 23 (guild rank success, deed·wallet surface refuses, homestead·visit readability, busy pulse·travel whisper). Polish 23 start: ephemeral `Ranked` via `guildRankChangeSuccessCueText` + guild_claim SFX after successful rank set; PL111.2 verified bank deposit/withdraw already flash Deposited/Withdrew (PL48). Choice: Item reuses guild-bank verb (separate flash ID); Build (not Station) so place-catalog stays distinct from craft needsStation; Need (not Item) so requirement shortfall stays distinct from inventory-missing Item; Ranked (not Rank) so success stays distinct from refuse Rank family. Next pending: PL112.1 Deed-missing / not-yours refuse ephemeral.

- 2026-08-02: **PL106.2–PL107.2 shipped** — Decor need-coins: ephemeral `Coins` via `shouldFlashDecorNeedCoinsRefuseCue` for dynamic `needCoinsDecor(n)` + refuse SFX (carved from place/upgrade `to` Coins and market Fee). Plant/crop: ephemeral `Plant` / `Gone` via `shouldFlashUnknownSeedRefuseCue` / `shouldFlashCropMissingRefuseCue` for `unknownSeed` / `cropMissing` + refuse SFX. Sticky long prose suppressed; decor prices / plant / crop rules unchanged; mute ok. Next pending: PL108.1 Item-missing refuse ephemeral. Choice: Coins reuse verb (not Fee) so decor price shortfall matches travel/place coin family while flash ID stays separate; Plant (not Seed) so unknown catalog stays distinct from missing-seed bag cue; Gone family for crop-missing vs plot Gone ID separate.

- 2026-08-02: **PL105.1–PL106.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_22.md (PL106–PL110)** — Decor·expand soft refuses: ephemeral `Pad` / `Home` / `Slots` via `shouldFlashDecorPadMissingRefuseCue` / `shouldFlashDecorStarterOnlyRefuseCue` / `shouldFlashNoExpandSlotsRefuseCue` + refuse SFX. Polish 22 start: ephemeral `Decor` via `shouldFlashUnknownDecorRefuseCue` for `unknownDecor` + refuse SFX. Sticky long prose suppressed; decor pad / homestead gate / expand slot caps / decor catalog unchanged; mute ok. Queue emptied → Polish 22 (decor leftovers·coins, plant·crop, inventory·build, guild gone·member·rank, quest·need). Choice: Pad (not Gone) so missing decor pad stays housing-flavored vs land-node Gone; Home reuses visit-leave verb (distinct from Land build-only); Slots one-word for expand cap; Decor (not Unknown) matching Recipe craft-gate family. Next pending: PL106.2 Decor-need-coins refuse ephemeral.
- 2026-08-02: **PL103.1–PL104.3 shipped** — Mail / market invalid: ephemeral `Stack` / `List` / `Qty` via `shouldFlashMailNotStackableRefuseCue` / `shouldFlashMarketInvalidRefuseCue` / `shouldFlashInvalidQtyRefuseCue` + refuse SFX. Craft-gate: ephemeral `Recipe` / `Station` / `XP` via `shouldFlashUnknownRecipeRefuseCue` / `shouldFlashNeedsStationRefuseCue` / `shouldFlashNeedsXpRefuseCue` + refuse SFX (`needsStation` / `needsXp` dynamic templates). Sticky long prose suppressed; mail stack / market list / qty / recipe / station / XP rules unchanged; mute ok. Next pending: PL105.1 Decor-pad-missing refuse ephemeral. Choice: reuse Stack (market·guild bank family) for mail not-stackable; List (not Invalid) so market form validation reads as listing; Qty shared verb with guild-bank-bad-qty but separate flash IDs; Recipe/Station/XP one-word craft-gate family.

- 2026-08-02: **PL101.2–PL102.3 shipped** — Land-node leftovers: ephemeral `Gone` via `shouldFlashPlotMissingRefuseCue` / `shouldFlashHuntOrClaimMissingRefuseCue` for `plotMissing` + `huntMissing` / `claimNodeMissing` + refuse SFX. Guild bank leftovers: ephemeral `Stack` / `Item` / `Qty` via `shouldFlashGuildBankNotStackableRefuseCue` / `shouldFlashGuildBankUnknownItemRefuseCue` / `shouldFlashGuildBankBadQtyRefuseCue` + refuse SFX. Sticky long prose suppressed; plot / hunt / claim / bank stack·item·qty rules unchanged; mute ok. Next pending: PL103.1 Mail-not-stackable refuse ephemeral. Choice: keep Gone family IDs separate (plot vs hunt/claim vs gather) per PL101.1 note; reuse Stack (market family) for guild bank not-stackable; Item/Qty one-word for unknown item / bad qty.

- 2026-08-02: **PL101.1 shipped** — Gather-node-missing refuse ephemeral: `Gone` via `shouldFlashGatherNodeMissingRefuseCue` for ore/stump/dock/pen missing + refuse SFX; sticky suppressed; node rules unchanged; mute ok. Next pending: PL101.2 Plot-missing refuse ephemeral. Choice: reuse Gone family (trade/mail/market missing) for land gather nodes; plot/hunt/claim missing stay separate IDs.

- 2026-08-02: **PL99.1–PL100.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_21.md (PL101–PL105)** — Map-gate soft refuses: ephemeral `Explore` / `Arena` via `shouldFlashHuntExploreOnlyRefuseCue` / `shouldFlashWarriorHomesteadForbiddenRefuseCue` + refuse SFX. Repair·tool: ephemeral `Mats` / `Tool` via `shouldFlashNeedMatsRepairRefuseCue` / `shouldFlashNotAToolRefuseCue` + refuse SFX; `needMatsRepair` carved out of generic Materials (`shouldFlashMaterialsRefuseCue`) so repair reads Mats not Materials. Sticky long prose suppressed; hunt gate / arena place / repair costs / equip rules unchanged; mute ok. Queue emptied → Polish 21 (land-node gone, guild bank stack·item·qty, mail·market invalid, craft recipe·station·xp, decor pad·home·slots). Choice: Explore/Arena map verbs; Mats (not Materials) for repair flavor parity with Fee vs Coins; Tool one-word for equip refuse.

- 2026-08-02: **PL98.1–PL98.3 shipped** — Guild bank / rank soft refuses: ephemeral `Full` / `Empty` / `Rank` via `shouldFlashGuildBankFullRefuseCue` / `shouldFlashGuildBankEmptyRefuseCue` / `shouldFlashGuildRankForbiddenRefuseCue` + refuse SFX; `guildInviteForbidden` shares Rank with `guildRankForbidden` (permission family). Sticky long prose suppressed; bank slots / withdraw / rank·invite rules unchanged; mute ok. Next pending: PL99.1 Hunt-explore-only refuse ephemeral. Choice: reuse Full/Empty family (mail inbox / mail empty); Rank (not Owner/Code) so both rank-change and invite-refresh forbidden read as permission, distinct from invite Code invalid.

- 2026-08-02: **PL96.1–PL97.2 shipped** — Mail party soft refuses: ephemeral `Gone` / `Wait` / `Sender` via `shouldFlashMailNotFoundRefuseCue` / `shouldFlashMailOnlyRecipientRefuseCue` / `shouldFlashMailOnlySenderRefuseCue` + refuse SFX. Market fee·stack: ephemeral `Fee` / `Stack` via `shouldFlashMarketNeedFeeRefuseCue` / `shouldFlashMarketNotStackableRefuseCue` + refuse SFX; `marketNeedFee(n)` carved out of generic Coins (`shouldFlashCoinsRefuseCue`) so listing fee reads Fee not Coins. Sticky long prose suppressed; escrow / claim / cancel / fee / stack unchanged; mute ok. Next pending: PL98.1 Guild-bank-full refuse ephemeral. Choice: reuse Gone/Wait family; Sender (not Cancel) so cancel-party stays role-clear; Fee over Coins for market listing flavor; Stack over Goods matching mail stackable family.

- 2026-08-02: **PL91.1–PL95.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_20.md (PL96–PL100)** — Trade escrow soft refuses: ephemeral `Gone` / `Yours` / `Wait` via `shouldFlashTradeNotFoundRefuseCue` / `shouldFlashTradeNotYoursRefuseCue` / `shouldFlashTradeOnlyRecipientRefuseCue` + refuse SFX. Trade broke·items: ephemeral `Broke` / `Items` (you+sender keys). Mail leftovers: ephemeral `Empty` / `Gone` / `Claimed`. Market leftovers: ephemeral `Gone` / `Yours`. Guild invite·name: ephemeral `Code` / `Name`. Sticky long prose suppressed; escrow / ownership / invite / naming unchanged; mute ok. Queue emptied → Polish 20 (mail party gone·wait·sender, market fee·stack, guild bank full·empty·rank, map-gate explore·arena, repair mats·tool). Choice: reuse Gone/Yours/Empty/Claimed family; Wait for accept-only; Broke reserved (vs generic Coins) for escrow coin fails; Items over Missing; Code/Name one-word for invite/name bounds. Note: `mailPlayerMissing` shares ACTION_ERROR prose with `tradePlayerMissing` — both flash Gone. Tests: `trade-not-found-refuse-ephemeral-pl911`, `trade-not-yours-refuse-ephemeral-pl912`, `trade-only-recipient-refuse-ephemeral-pl913`, `trade-broke-refuse-ephemeral-pl921`, `trade-missing-items-refuse-ephemeral-pl922`, `mail-empty-refuse-ephemeral-pl931`, `mail-player-missing-refuse-ephemeral-pl932`, `mail-already-claimed-refuse-ephemeral-pl933`, `market-not-found-refuse-ephemeral-pl941`, `market-not-yours-refuse-ephemeral-pl942`, `guild-invite-invalid-refuse-ephemeral-pl951`, `guild-name-invalid-refuse-ephemeral-pl952`. Next pending: PL96.1 Mail-not-found refuse ephemeral.

- 2026-08-02: **PL86.1–PL90.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_19.md (PL91–PL95)** — Trade soft refuses: ephemeral `Self` / `Empty` / `Gone` via `shouldFlashTradeSelfRefuseCue` / `shouldFlashTradeEmptyRefuseCue` / `shouldFlashTradePlayerMissingRefuseCue` + refuse SFX. Guild: ephemeral `Member` / `No guild` / `Taken`. Soft-war contest guild + land place: ephemeral `Guild` / `Land`. Upgrade: ephemeral `Max` / `Fixed`. Travel coins: ephemeral `Coins` for dynamic `needCoinsTravel(n)` (`for the caravan`, distinct from place/upgrade `to` forms). Sticky long prose suppressed; rules / costs / naming unchanged; mute ok. Queue emptied → Polish 19 (trade escrow gone·yours·wait, broke·items, mail empty·gone·claimed, market gone·yours, guild code·name). Choice: reuse Self/Empty/Guild/Taken/Coins family verbs so min-HUD refuse stays one word where possible; `No guild` two-word for leave/join clarity; Gone for missing peer; Max/Fixed over Upgraded/Cannot so upgrade refuses stay distinct from success Upgraded; Broke reserved for Polish 19 escrow coin fails vs generic Coins. Tests: `trade-self-refuse-ephemeral-pl861`, `trade-empty-refuse-ephemeral-pl862`, `trade-player-missing-refuse-ephemeral-pl863`, `guild-already-in-refuse-ephemeral-pl871`, `guild-not-in-refuse-ephemeral-pl872`, `guild-exists-refuse-ephemeral-pl873`, `claim-war-need-guild-refuse-ephemeral-pl881`, `build-player-land-only-refuse-ephemeral-pl882`, `already-upgraded-refuse-ephemeral-pl891`, `cannot-upgrade-refuse-ephemeral-pl892`, `travel-need-coins-refuse-ephemeral-pl901`. Next pending: PL91.1 Trade-not-found refuse ephemeral.

- 2026-08-02: **PL81.1–PL85.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_18.md (PL86–PL90)** — Claim hold/collect soft refuses: ephemeral `Held` / `Empty` via `shouldFlashClaimHeldByOtherRefuseCue` / `shouldFlashClaimNothingStoredRefuseCue` + refuse SFX. Soft-war: ephemeral `Contest` / `Wood` / `Peace`. Market: ephemeral `Yours` / `Expired`. Mail: ephemeral `Self` / `Full`. Travel: ephemeral `Road` for dynamic `travelInProgress(sec)` template. Sticky long prose suppressed; rules / costs / caps unchanged; mute ok. Queue emptied → Polish 18 (trade self·empty·gone, guild member·no-guild·taken, contest-guild·land, upgrade max·fixed, travel coins). Choice: one-word Held/Empty/Contest/Wood/Peace/Yours/Expired/Self/Full/Road matching Guild/Locked refuse family; Road over Timer so caravan stays map-travel flavored without inventing free-travel product change. Tests: `claim-held-by-other-refuse-ephemeral-pl811`, `claim-nothing-stored-refuse-ephemeral-pl812`, `claim-war-already-open-refuse-ephemeral-pl821`, `claim-war-need-mats-refuse-ephemeral-pl822`, `claim-war-not-open-refuse-ephemeral-pl823`, `market-own-listing-refuse-ephemeral-pl831`, `market-expired-refuse-ephemeral-pl832`, `mail-self-refuse-ephemeral-pl841`, `mail-inbox-full-refuse-ephemeral-pl842`, `travel-in-progress-refuse-ephemeral-pl851`. Next pending: PL86.1 Trade-self refuse ephemeral.

- 2026-08-02: **PL79.1–PL80.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_17.md (PL81–PL85)** — Vendor soft refuses: ephemeral `Unwanted` / `Stock` via `shouldFlashVendorWontBuyRefuseCue` / `shouldFlashVendorWontSellRefuseCue` + refuse SFX for `vendorWontBuy` / `vendorWontSell` (sticky long prose suppressed; vendor prices unchanged; mute ok). Claim beacon: one-shot ephemeral `Grove · claim territory` + soft world `Claim · E` via `shouldFlashFirstClaimNodeWalkUpCue` on first claim_node proximity (localStorage; tips gate; claim / war rules unchanged; min HUD). Soft refuse: ephemeral `Guild` via `shouldFlashClaimNeedGuildRefuseCue` for `claimNeedGuild`. Queue emptied → Polish 17 (claim held·empty, soft-war contest·wood·peace, market yours·expired, mail self·full, travel road). Choice: one-word Unwanted/Stock/Guild matching Locked/Claimed refuse family; plaque-proximity Grove tip over sticky guild lesson so walk-up teaches at the beacon; Claim · E verb shared with interact prompt family. Tests: `vendor-wont-buy-refuse-ephemeral-pl791`, `vendor-wont-sell-refuse-ephemeral-pl792`, `first-claim-node-walkup-tip-pl801`, `claim-need-guild-refuse-ephemeral-pl802`. Next pending: PL81.1 Claim-held-by-other refuse ephemeral.

- 2026-08-02: **PL77.1–PL78.2 shipped** — Loom/alchemy onboarding: one-shot ephemeral `Loom · weave cloth` / `Alchemy · brew tonic` + soft world `Weave · E` / `Brew · E` via `shouldFlashFirstLoomWalkUpCue` / `shouldFlashFirstAlchemyBenchWalkUpCue` on first loom / alchemy_bench proximity (localStorage; tips gate; craft recipes unchanged; min HUD). Quest claim soft refuses: ephemeral `Locked` / `Claimed` via `shouldFlashQuestLockedRefuseCue` / `shouldFlashQuestAlreadyClaimedRefuseCue` + refuse SFX for `questLocked` / `questAlreadyClaimed` (sticky long prose suppressed; quest / XP rules unchanged; mute ok). Choice: plaque-proximity tip (mill/forge family) over sticky weaver/alchemist lessons so walk-up teaches at the mesh; purpose verbs weave/brew over recipe ids so Content Lock stays untouched; one-word Locked/Claimed matching Objective refuse family. Tests: `first-loom-walkup-tip-pl771`, `first-alchemy-bench-walkup-tip-pl772`, `quest-locked-refuse-ephemeral-pl781`, `quest-already-claimed-refuse-ephemeral-pl782`. Next pending: PL79.1 Vendor-won't-buy refuse ephemeral.

- 2026-08-02: **PL75.1–PL76.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_16.md (PL77–PL80)** — Housing decor: one-shot ephemeral `Decor · place yard` + soft world `Place · E` via `shouldFlashFirstDecorPadWalkUpCue` on first decor_pad proximity (localStorage; tips gate; costs unchanged; min HUD). Soft refuse: ephemeral `Taken` / `Objective` via `shouldFlashDecorAlreadyPlacedRefuseCue` / `shouldFlashQuestNotReadyRefuseCue` + refuse SFX for `decorAlreadyPlaced` / `questNotReady` (sticky long prose suppressed; place / quest rules unchanged; mute ok). Tutor: one-shot ephemeral `Tutor · learn + claim` + soft world `Talk · E` via `shouldFlashFirstTutorWalkUpCue` on first any-profession tutorial_npc proximity (XP / claim unchanged; min HUD). Queue emptied → Polish 16 (loom·alchemy tips, quest locked·claimed refuses, vendor buy·sell refuses, claim-node tip + guild refuse). Choice: plaque-proximity tip (expand/forge family) over sticky housing lesson; `place yard` over coin numbers so Content Lock stays untouched; one-word Taken/Objective matching Spot/Intact refuse family; shared one-shot across all tutors so city onboarding stays one tip not thirteen. Tests: `first-decor-pad-walkup-tip-pl751`, `decor-already-placed-refuse-ephemeral-pl752`, `quest-not-ready-refuse-ephemeral-pl761`, `first-tutor-walkup-tip-pl762`. Next pending: PL77.1 First loom walk-up tip once.
- 2026-08-02: **PL74.1–PL74.3 shipped** — Process station onboarding: one-shot ephemeral `Mill · grind flour` / `Workshop · saw planks` / `Forge · smelt iron` + soft world `Grind · E` / `Saw · E` / `Smelt · E` via `shouldFlashFirstMillWalkUpCue` / `shouldFlashFirstWorkshopWalkUpCue` / `shouldFlashFirstForgeWalkUpCue` on first mill / workshop / forge proximity (localStorage; tips gate; craft recipes unchanged; min HUD). Choice: plaque-proximity tip (kitchen/market family) over sticky craft lessons so walk-up teaches at the mesh; purpose verbs grind/saw/smelt over recipe ids so Content Lock stays untouched. Tests: `first-mill-walkup-tip-pl741`, `first-workshop-walkup-tip-pl742`, `first-forge-walkup-tip-pl743`. Next pending: PL75.1 First decor-pad walk-up tip once.
- 2026-08-02: **PL73.1–PL73.3 shipped** — Soft refuse leftovers: ephemeral `Food` / `Spot` / `Intact` via `shouldFlashNoFoodRefuseCue` / `shouldFlashBuildCellOccupiedRefuseCue` / `shouldFlashToolAlreadyRepairedRefuseCue` + refuse SFX for `noFood` / `buildCellOccupied` / `toolAlreadyRepaired` (sticky long prose suppressed; eat / place / repair rules unchanged; mute ok). Choice: one-word Food/Spot/Intact matching Bread/Board/Seed refuse family; Spot (not Occupied) so build-cell stays distinct from crop-plot Occupied. Tests: `no-food-refuse-ephemeral-pl731`, `build-cell-occupied-refuse-ephemeral-pl732`, `tool-already-repaired-refuse-ephemeral-pl733`. Next pending: PL74.1 First mill walk-up tip once.
- 2026-08-02: **PL71.1–PL72.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_15.md (PL73–PL76)** — Soft refuse leftovers: ephemeral `Bread` / `Board` via `shouldFlashNoBreadRefuseCue` / `shouldFlashBuildBoardMissingRefuseCue` + refuse SFX for `noBread` / `buildBoardMissing` (sticky long prose suppressed; eat / place rules unchanged; mute ok). Expand pad: one-shot ephemeral `Expand · unlock field` + soft world `Expand · E` via `shouldFlashFirstExpandPadWalkUpCue` on first expand-pad proximity (localStorage; tips gate; costs unchanged; min HUD). Tutor claim-ready: brief TopBar `Claim` via `shouldFlashTutorClaimReadyEdgeCue` when a tutor first edges into claimable (hydrate / account swap quiet; complements PL30.3 world Claim; XP / claim unchanged; mute ok). Queue emptied → Polish 15 (food·spot·intact refuses, mill·workshop·forge tips, decor tip+refuse, quest·tutor tips). Choice: one-word Bread/Board matching Seed/Hammer refuse family; expand plaque-proximity tip over sticky expand onboarding so walk-up teaches at the pad; Claim verb shared with world soft label so claim-ready family stays one word. Tests: `no-bread-refuse-ephemeral-pl711`, `build-board-missing-refuse-ephemeral-pl712`, `first-expand-pad-walkup-tip-pl721`, `tutor-claim-ready-edge-cue-pl722`. Next pending: PL73.1 No-food eat refuse ephemeral.

- 2026-08-02: **PL70.1–PL70.2 shipped** — Kitchen/notice onboarding: one-shot ephemeral `Kitchen · cook food` / `Notices · city tips` + soft world `Cook · E` / `Read · E` via `shouldFlashFirstKitchenWalkUpCue` / `shouldFlashFirstNoticeBoardWalkUpCue` on first kitchen / notice_board proximity (localStorage; tips gate; craft recipes / tip·mail rules unchanged; min HUD). Choice: plaque-proximity tip (market/vendor/dock family) over sticky fish_to_kitchen / meat_to_kitchen so walk-up teaches at the mesh; `cook food` over recipe names so Content Lock stays untouched; `city tips` (not mail) because notice board is static tips only — mail stays L-hotkey. Tests: `first-kitchen-walkup-tip-pl701`, `first-notice-board-walkup-tip-pl702`. Next pending: PL71.1 No-bread energy refuse ephemeral.

- 2026-08-02: **PL69.1–PL69.2 shipped** — Ore/pen ready edges: brief TopBar `Ready` via `shouldFlashOreNodeReadyEdgeCue` / `shouldFlashAnimalPenReadyEdgeCue` + `readyOreNodeIds` / `readyAnimalPenIds` when ore/pen first become actionable after cooldown (gameNow edge; hydrate / travel / visit reseed quiet; never-chipped/never-cared `readyAt` null excluded so place stays silent; complements world Ready labels; cooldown / yields unchanged; mute ok). Choice: reuse crop/stump/dock `Ready` over inventing Chip/Care so gather ready family stays one ephemeral verb; post-cooldown-only ids (not `oreNodeReady` null) so fresh place does not false-edge. Tests: `ore-node-ready-edge-cue-pl691`, `animal-pen-ready-edge-cue-pl692`. Next pending: PL70.1 First kitchen walk-up tip once.

- 2026-08-02: **PL68.1–PL68.4 shipped** — Gather/farm/hunt onboarding: one-shot ephemeral `Stump · chop wood` / `Ore · chip ore` / `Plot · plant + harvest` / `Trail · hunt` + soft world `Chop · E` / `Chip · E` / `Plant · E` / `Hunt · E` via `shouldFlashFirstTreeStumpWalkUpCue` / `shouldFlashFirstOreNodeWalkUpCue` / `shouldFlashFirstCropPlotWalkUpCue` / `shouldFlashFirstHuntTrailWalkUpCue` on first tree_stump / ore_node / crop_plot / (game_trail|edge_thicket) proximity (localStorage; tips gate; chop / chip / plant / hunt rules unchanged; min HUD). Choice: plaque-proximity tip (dock/pen/market family) over sticky lessons so walk-up teaches at the mesh; shared hunt tip for trail+thicket so Explore hunt onboarding stays one-shot; `plant + harvest` mirroring pen `feed + clean`. Tests: `first-tree-stump-walkup-tip-pl681`, `first-ore-node-walkup-tip-pl682`, `first-crop-plot-walkup-tip-pl683`, `first-hunt-trail-walkup-tip-pl684`. Next pending: PL69.1 Ore node ready soft cue.

- 2026-08-02: **PL66.1–PL67.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_14.md (PL68–PL72)** — Dock/pen onboarding: one-shot ephemeral `Dock · catch fish` / `Pen · feed + clean` + soft world `Catch · E` / `Care · E` via `shouldFlashFirstFishingDockWalkUpCue` / `shouldFlashFirstAnimalPenWalkUpCue` on first fishing_dock / animal_pen proximity (localStorage; tips gate; catch / care rules unchanged; min HUD). Low health: soft warm HP readout via `isHealthLow` + `HEALTH_LOW_TEXT_COLOR` / `topbar-health-label` · low while in band (clears when recovered; complements PL64.1 edge cue; combat numbers unchanged). Queue emptied → Polish 14 (stump·ore·crop·hunt tips, ore·pen ready edges, kitchen·notice tips, bread·board refuse, expand·tutor cues). Choice: plaque-proximity tip (market/vendor family) over sticky fisher lesson so walk-up teaches at the mesh; `feed + clean` mirroring vendor `tools + seeds` for care modes; HP accent reuses energy/tool warm family so meter accents stay one palette. Tests: `first-fishing-dock-walkup-tip-pl661`, `first-animal-pen-walkup-tip-pl662`, `low-health-topbar-accent-pl671`. Next pending: PL68.1 First tree stump walk-up tip once.

- 2026-08-02: **PL65.1–PL65.2 shipped** — Gather ready edges: brief TopBar `Ready` via `shouldFlashWoodStumpReadyEdgeCue` / `shouldFlashFishingDockReadyEdgeCue` + `readyWoodStumpIds` / `readyFishingDockIds` when stump/dock first become actionable after cooldown (gameNow edge; hydrate / travel / visit reseed quiet; never-chopped/never-cast `readyAt` null excluded so place stays silent; complements world Ready labels PL23.2/PL30.1; cooldown / yields unchanged; mute ok). Choice: reuse crop `Ready` over inventing Chop/Cast so gather ready family stays one ephemeral verb; post-cooldown-only ids (not `oreNodeReady` null) so fresh place does not false-edge. Tests: `wood-stump-ready-edge-cue-pl651`, `fishing-dock-ready-edge-cue-pl652`. Next pending: PL66.1 First fishing dock walk-up tip once.

- 2026-08-02: **PL63.1–PL64.2 shipped** — Gather/hunt cooldown soft refuses: ephemeral `Resting` / `Waiting` / `Resting` / `Scattered` via `shouldFlashWoodStumpCooldownRefuseCue` / `shouldFlashFishingDockCooldownRefuseCue` / `shouldFlashAnimalPenCooldownRefuseCue` / `shouldFlashHuntCooldownRefuseCue` + refuse SFX (sticky long prose suppressed; cooldown numbers / spawn rates unchanged; mute ok). Health low: brief TopBar `Health low` via `shouldFlashHealthLowCue` / `isHealthLow` + `COMBAT.lowWarnPct` 25% (mirrors ENERGY; combat numbers unchanged). Missing seed: ephemeral `Seed` for `missingSeed` + refuse SFX (plant rules unchanged). Choice: one-word Resting shared by stump+pen (keyed by distinct ACTION_ERROR) over inventing Care/Chop so min-HUD refuse family stays consistent with Busy/Settling; Health low before Energy low on same tick so damage feedback wins; Seed matching Hammer/Coins refuse verbs. Tests: `wood-stump-cooldown-refuse-ephemeral-pl631`, `fishing-dock-cooldown-refuse-ephemeral-pl632`, `animal-pen-cooldown-refuse-ephemeral-pl633`, `hunt-cooldown-refuse-ephemeral-pl634`, `health-low-threshold-cue-pl641`, `missing-seed-refuse-ephemeral-pl642`. Next pending: PL65.1 Wood stump ready soft cue.

- 2026-08-02: **PL61.1–PL62.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_13.md (PL63–PL67)** — Tool low: brief TopBar `Tool low` via `shouldFlashToolDurabilityLowCue` / `toolDurabilityLowThresholdCueText` / `equippedToolDurabilitySnapshot` when the same equipped stack edges into `TOOL.lowWarnPct` (hydrate / swap quiet; plant/gather success yield so Tool low stays; · low accent PL21.1 stays; durability / break unchanged; mute ok). Trade cancel: ephemeral `Cancelled` via `shouldFlashTradeCancelCue` on outgoing only (incoming reject silent). Chat send: soft `chat` SFX + ephemeral `Sent` on successful land/guild send (WS + HTTP); complements receive `Chat`. Queue emptied → Polish 13 (gather·hunt cooldown refuses, health·seed feedback, stump·dock ready edges, dock·pen tips, HP accent). Choice: `Tool low` mirroring `Energy low` over inventing a second meter toast; suppress plant/gather confirm on the edge tick so threshold feedback is visible; Cancelled reuse for trade cancel (market family) over longer escrow prose; `Sent` vs receive `Chat` so send/receive read apart. Tests: `tool-durability-low-threshold-cue-pl611`, `trade-cancel-brief-cue-pl621`, `chat-send-brief-cue-pl622`. Next pending: PL63.1 Wood stump cooldown soft refuse ephemeral.

- 2026-08-02: **PL60.1–PL60.2 shipped** — Crop ready edge: brief TopBar `Ready` via `shouldFlashCropReadyEdgeCue` / `cropReadyEdgeCueText` / `readyCropPlotIds` when a plot first becomes harvest-ready (gameNow edge; hydrate / travel / visit reseed quiet; complements PL12.1 pulse + PL40.1 name label; grow timers / yields unchanged; mute ok). Ore cooldown refuse: ephemeral `Settling` via `shouldFlashOreCooldownRefuseCue` / `oreCooldownRefuseCueText` for `oreNodeCooldown` + refuse SFX (sticky long prose suppressed; cooldown numbers unchanged; mute ok). Choice: TopBar edge `Ready` over inventing a second world tip so PL40.1/PL12.1 keep plot chrome; one-word Settling matching Growing/Busy refuse family and interact “settling” copy. Tests: `crop-ready-edge-cue-pl601`, `ore-cooldown-refuse-ephemeral-pl602`. Next pending: PL61.1 Tool durability low threshold cue.

- 2026-08-02: **PL59.1–PL59.2 shipped** — Market/vendor onboarding: one-shot ephemeral `Market · list + buy` / `Vendor · tools + seeds` + soft world `List · E` / `Buy · E` via `shouldFlashFirstMarketWalkUpCue` / `shouldFlashFirstVendorWalkUpCue` on first market_board / vendor_stall proximity (localStorage; tips gate; complements sticky `post_craft_market`; list fee / vendor prices unchanged; min HUD). Choice: plaque-proximity tip (portal/arena family) over re-firing sticky post-craft so walk-up teaches at the mesh; `list + buy` / `tools + seeds` over fee numbers so Content Lock stays untouched. Tests: `first-market-walkup-tip-pl591`, `first-vendor-walkup-tip-pl592`. Next pending: PL60.1 Crop ready soft world cue.

- 2026-08-02: **PL58.2–PL58.3 shipped** — Soft refuse leftovers: ephemeral `Growing` / `Occupied` via `shouldFlashCropNotReadyRefuseCue` / `shouldFlashPlotOccupiedRefuseCue` + refuse SFX for `cropNotReady` / `plotNotEmpty` (sticky long prose suppressed; grow timers / plant rules unchanged; mute ok). Choice: one-word Growing/Occupied matching Busy/Energy/Hammer family over longer “Still growing” so min-HUD refuse verbs stay consistent. Tests: `crop-not-ready-refuse-ephemeral-pl582`, `plot-occupied-refuse-ephemeral-pl583`. Next pending: PL59.1 First market walk-up tip once.

- 2026-08-02: **PL57.1–PL58.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_12.md (PL58–PL62)** — City hub: one-shot ephemeral `City · shared hub` + soft world `Scarce · shared` via `shouldFlashFirstCityHubCue` / `isEnteringCityMap` / `cityHubFirstWorldTip` on first City presence (travel replaces Arrived once; login hydrate; localStorage; tips gate; complements sticky `city_hub`; scarce stations unchanged). Day-phase: brief TopBar `Dawn` / `Dusk` / `Night` via `shouldFlashDayPhaseChangeCue` / `dayPhaseChangeCueText` on cosmetic phase edge (cycle on; Day / hydrate / cycle-off quiet; secondary chrome while non-Day stays). Queue emptied → Polish 12 (hammer·crop refuse leftovers, market·vendor tips, crop·ore readiness, tool low threshold, trade·chat confirms). Hammer refuse: ephemeral `Hammer` for `needHammer` / `needHammerBroken` + refuse SFX (sticky long prose suppressed; ore chip rules unchanged). Choice: map-presence tip (like Explore/Warrior) over re-firing sticky hub so City arrival teaches shared/scarce without stacking long prose; phase-name ephemerals over inventing weather so cosmetics stay min-HUD; one-word `Hammer` matching Busy/Closer refuse family. Tests: `first-city-hub-tip-pl571`, `day-phase-change-cue-pl572`, `hammer-refuse-ephemeral-pl581`. Next pending: PL58.2 Crop-not-ready refuse ephemeral.

- 2026-08-02: **PL55.1–PL56.3 shipped** — Tutor: brief social seafoam open accent via `shouldPlayTutorialNpcOpenAccent` + `tutorial-npc-panel--open-accent` / `flashTutorialNpcOpenAccent` on walk-up (XP / claim unchanged). Deed desk: brief system tint via `shouldPlayDeedOpenAccent` + `deed-panel--open-accent` / `flashDeedOpenAccent` on B (wallet path; no combat power). PL56.1/PL56.2 already satisfied by PL28.1 (`Offer · to`) and PL10.2 (`Cancelled`) — marked done without re-work. Guild invite refresh: ephemeral `Refreshed` + soft `guild_claim` via `guildInviteRefreshSuccessCueText` after successful regenerate (rank/invite rules unchanged; mute ok). Choice: reuse social seafoam for tutor walk-up (notice family) and inventory system tint for Deed like Settings; one-word `Refreshed` + reuse earthy `guild_claim` like create/join/bank. Tests: `tutorial-npc-open-accent-pl551`, `deed-panel-open-accent-pl552`, `guild-invite-refresh-cue-pl563`. Next pending: PL57.1 First city hub ephemeral tip once.

- 2026-08-02: **PL53.2–PL54.3 shipped** — Warrior map: one-shot ephemeral `Warrior · optional` + soft world `Optional · free` via `shouldFlashFirstWarriorMapCue` / `isEnteringWarriorMap` / `warriorFirstMapWorldTip` on first Warrior presence (travel replaces Arrived once; login hydrate; localStorage; tips gate; complements PL45.2 plaque tip; no balance invent; free enter/exit). Soft refuse leftovers: ephemeral `Closer` / `Coins` / `Materials` via `shouldFlashTooFarRefuseCue` / `shouldFlashCoinsRefuseCue` / `shouldFlashMaterialsRefuseCue` (tooFar; notEnoughCoins + needCoins*; missingMaterials / notEnoughItems + needMats*); sticky long prose suppressed; soft refuse SFX expanded; interact ranges / prices / recipes unchanged; mute ok. Choice: map-presence tip (like Explore PL45.1) over re-firing plaque tip so Warrior arrival teaches optional+free without stacking with `Arena · optional`; short one-word refuse verbs matching Busy/Energy; dynamic needCoins*/needMats* regex so place/expand/upgrade shortfalls share buy/list cue. Tests: `first-warrior-map-tip-pl532`, `too-far-refuse-ephemeral-pl541`, `coins-refuse-ephemeral-pl542`, `materials-refuse-ephemeral-pl543`. Next pending: PL55.1 Tutorial NPC panel open accent.

- 2026-08-02: **PL52.1–PL53.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_11.md (PL53–PL57)** — Empty-land: one-shot ephemeral `Land · build board` + soft world `Build · E` via `shouldFlashFirstEmptyLandBuildBoardCue` / `emptyLandBuildFirstWalkUpWorldTip` on first empty-yard build_board proximity (localStorage; tips gate; complements PL3.1 beacon; place costs unchanged). Arena stub: brief warm open accent via `shouldPlayArenaOpenAccent` + `arena-stub-panel--open-accent` (optional path copy unchanged). Queue emptied → Polish 11 (visit/warrior tips, soft refuse leftovers, tutor/deed accents, trade/market/invite confirms, city/day-phase). Visit: one-shot `Visit · trade · T` + banner soft `Trade · T` via `shouldFlashFirstVisitLandCue` / `visitLandFirstWalkUpWorldTip` on first successful visit (replaces Visiting · name once; cool tint / T unchanged). Choice: proximity tip under beacon over map-presence so empty-board teach fires at the mesh; warm arena open accent over inventing balance; first-visit trade tip replaces every-visit name cue once so guest yards teach T without stacking toasts. Tests: `first-empty-land-build-board-tip-pl521`, `arena-stub-open-accent-pl522`, `first-visit-land-tip-pl531`. Next pending: PL53.2 First warrior map presence tip once.

- 2026-08-02: **PL51.1–PL51.2 shipped** — BGM: quieter restart / brief crossfade on landKind / visit map bed change via `BGM_MAP_TRANSITION` + `shouldSoftBgmMapTransition` (old 0.2s fade overlaps new quieter fade-in; bed identities in `BGM_BEDS` unchanged; mute silent; cold start / unmute stay full-gain; GameApp `startBgm` idempotent so it does not hard-clobber soft swaps). Visit yard: cool guest meadow/plot/path + quiet haze via `HOMESTEAD_YARD_VISUAL.visit` / `homesteadYardPresenceFor` / `homesteadYardFloorColors(..., presence)` wired through `LandScene` `visiting` → `HomesteadEnvironment`; warm home empty/lived (PL22.1) unchanged; visit rules / trade hotkey unchanged; no HUD column. Choice: quieter fade-in over inventing a second bed suite so map continuity stays soft; cool visit haze+floors over HUD badge so guest yards read apart from warm home without growing chrome. Tests: `bgm-map-soft-transition-pl511`, `visit-land-atmosphere-pl512`. Next pending: PL52.1 First empty-land build-board tip once.

- 2026-08-02: **PL49.1–PL50.2 shipped** — Title: ephemeral TopBar `Title · Settler/Homesteader/Veteran` via `shouldFlashCharacterTitleChangeCue` / `characterTitleChangeCueText` on characterTitle change (post-paint; hydrate skips; titles cosmetic / no combat power). Soft unlock: one-shot `Decor · extra pad` via `shouldFlashExtraDecorPadUnlockCue` / `extraDecorPadUnlockCueText` on unlock edge; L5 combined `Homesteader · decor pad` via `titleWithDecorPadUnlockCueText` so both tips share one ephemeral. Priority: title+decor > title > decor > Level N. Guild membership: ephemeral `Created` / `Joined` / `Left` + soft `guild_claim` SFX after successful create/join/leave (fail paths silent; invite/rank/leave rules unchanged; mute ok). Choice: `Title ·` prefix over bare Settler so cosmetic titles read apart from Level N / Unlocked achievements; L5 combined cue over dropping Homesteader or pad tip; one-word Created/Joined/Left + reuse earthy guild_claim like bank confirms. Tests: `character-title-change-cue-pl491`, `extra-decor-pad-unlock-cue-pl492`, `guild-create-join-cue-pl501`, `guild-leave-cue-pl502`. Next pending: PL51.1 BGM soft transition on map change.

- 2026-08-02: **PL48.2–PL48.3 shipped** — Guild bank: ephemeral TopBar `Deposited` / `Withdrew` via `guildBankDepositSuccessCueText` / `guildBankWithdrawSuccessCueText` + soft `guild_claim` SFX after successful `apiDepositGuildBank` / `apiWithdrawGuildBank` (fail paths silent; refresh bank only on ok). GUILD_BANK maxSlots/maxStackQty unchanged; mute ok. Choice: one-word verbs (not qty prefixes) so bank confirms stay min-HUD like Sold/Upgraded; reuse earthy `guild_claim` over inventing a bank SFX so guild vault stays in the claim family. Tests: `guild-bank-deposit-cue-pl482`, `guild-bank-withdraw-cue-pl483`. Next pending: PL49.1 Character title change ephemeral.

- 2026-08-02: **PL47.1–PL48.1 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_10.md (PL48–PL52)** — Level-up: ephemeral TopBar `Level N` via `shouldFlashCharacterLevelUpCue` / `characterLevelUpCueText` on characterLevel rise (post-paint effect so Crafted/etc. don't steal the cue; XP curve unchanged). Achievement unlock: ephemeral `Unlocked · {title}` via `newlyUnlockedAchievementTitles` / `achievementUnlockSuccessCueText` after action achievement poll (hydrate on login skips flash; unlock rules unchanged; mute ok; skip unlock flash when Level N owns the cue). Queue emptied → Polish 10 (upgrade/guild-bank confirms, title/decor soft unlocks, guild membership cues, BGM/visit atmosphere, empty-land/arena leftovers). Craft upgrade: ephemeral `Upgraded` + soft craft SFX via `stationUpgradeSuccessCueText` after `apiUpgradeBuilding` (BUILDING_UPGRADES costs unchanged). Choice: post-paint Level N over sync applyState flash so progress beats same-tick action confirms; title-prefixed Unlocked over bare Unlocked so A-list stubs stay identifiable; Upgraded verb distinct from Built/Crafted. Tests: `character-level-up-cue-pl471`, `achievement-unlock-cue-pl472`, `station-upgrade-success-cue-pl481`. Next pending: PL48.2 Guild bank deposit brief cue.

- 2026-08-02: **PL45.1–PL46.2 shipped** — Explore: one-shot ephemeral TopBar `Explore · hunt + gather` + soft world `Hunt + gather` via `shouldFlashFirstExploreWalkUpCue` / `isEnteringExploreMap` / `firstExploreWalkUpCueText` / `exploreFirstWalkUpWorldTip` on first Explore presence (travel replaces Arrived once; login hydrate edge; localStorage; tips gate; spawn rates unchanged). Arena: one-shot `Arena · optional` + soft `Optional · E` via `shouldFlashFirstArenaWalkUpCue` / `firstArenaWalkUpCueText` / `arenaFirstWalkUpWorldTip` on first arena_board proximity (no balance invent; free enter/exit). Guild/Achievements: brief system open accents via `shouldPlayGuildOpenAccent` / `shouldPlayAchievementsOpenAccent` + `guild-panel--open-accent` / `achievements-panel--open-accent` (G/A; inventory tint family like Settings PL38.2; claim/war + stub counters unchanged). Choice: map-presence tip (not portal proximity) so wilds hunt+gather reads on arrival; plaque proximity mirrors portal PL42.2 for optional path; system tint for guild/achievements over social seafoam so meta panels stay with Settings. Tests: `first-explore-walkup-tip-pl451`, `first-arena-walkup-tip-pl452`, `guild-achievements-open-accent-pl46`. Next pending: PL47.1 Character level-up ephemeral.

- 2026-08-02: **PL43.2–PL44.2 shipped** — Vendor: ephemeral TopBar `Sold` / `Bought` via `vendorSellSuccessCueText` / `vendorBuySuccessCueText` / `flashSuccessCue` after existing vendor_sell / vendor_buy SFX (PL10.1); prices unchanged; mute ok. Soft refuse leftovers: ephemeral `Energy` / `Already here` via `shouldFlashEnergyRefuseCue` / `shouldFlashTravelAlreadyHereCue` + refuse SFX (sticky long `notEnoughEnergy` / `travelAlreadyHere` prose suppressed; mirrors Busy PL42.1); energy numbers + fare-free destinations unchanged. Choice: reuse market `Bought` verb for vendor buy so commerce confirms stay one word; short `Energy` over “Energy low” so refuse ≠ threshold-cross cue (PL41.1). Tests: `vendor-sell-success-cue-pl432`, `vendor-buy-success-cue-pl433`, `energy-refuse-ephemeral-pl441`, `travel-already-here-ephemeral-pl442`. Next pending: PL45.1 First Explore walk-up tip once.

- 2026-08-02: **PL42.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_9.md (PL43–PL47) + PL43.1 shipped** — Portal: one-shot ephemeral TopBar `Portal · fare-free` + soft world `Fare-free · E` via `shouldFlashFirstPortalWalkUpCue` / `firstPortalWalkUpCueText` / `portalFirstWalkUpWorldTip` on first portal proximity (localStorage; tips gate; complements PL13.1 free_travel + PL37.1 label; free travel unchanged). Queue emptied → Polish 9 (gather/vendor success leftovers, energy/already-here refuse ephemerals, Explore/Arena one-shot tips, guild/achievements open accents, level-up/achievement unlock). Gather: ephemeral `Chopped` / `Mined` / `Caught` / `Collected` via `gatherSuccessCueText` after existing gather SFX (tool-break stays Tool broke; yields/cooldowns unchanged). Choice: proximity one-shot + soft world tip over reusing PL13.1 sticky onboarding so walk-up teaches fare-free at the mesh; station-specific gather verbs over one generic Gathered so chop/mine/dock/pen read apart. Tests: `first-portal-walkup-tip-pl422`, `gather-success-cue-pl431`. Next pending: PL43.2 Vendor sell success cue.
- 2026-08-02: **PL41.1–PL42.1 shipped** — Energy: ephemeral TopBar `Energy low` via `shouldFlashEnergyLowCue` / `energyLowThresholdCueText` / `flashSuccessCue` on band-edge only (meter `· low` PL9.1 stays while low; energy numbers unchanged; mute ok). Warrior: warm arena haze + plaque emissive polish via `WARRIOR_ARENA_VISUAL.haze*` / `plaqueEmissive*` in `WarriorEnvironment` + ArenaStubPanel / arena_board (apart from Explore cool haze PL36.2; no balance invent). Busy scarce: ephemeral `Busy` + refuse SFX via `shouldFlashBusyStationCue` / `busyStationRefuseCueText` (sticky long `stationBusy` prose suppressed; other soft refuses unchanged). Choice: edge-only energy flash over re-toasting while low; warm haze/emissive over inventing combat atmosphere; Busy ephemeral over sticky prose so scarce contention stays min-HUD. Tests: `energy-low-threshold-cue-pl411`, `warrior-optional-path-haze-pl412`, `busy-scarce-refuse-ephemeral-pl421`. Next pending: PL42.2 First portal walk-up tip once.
- 2026-08-02: **PL40.2–PL40.3 shipped** — Travel arrive: brief TopBar map-chip pulse via `shouldPulseMapChipOnTravelArrive` + `MAP_CHIP_ARRIVE_PULSE_MS` / `topbar-map-chip--arrive-pulse` (complements Arrived cue + SFX; fare-free destinations unchanged; refuse silent). Presence: quiet always-on cool teal peer halo via `PRESENCE_PEER_SILHOUETTE` under remote avatars + soft nameplate border (reads apart from warm tutor claim pads/cloaks); interact-range ping (PL15.2) still stacks when near; presence rules unchanged; no HUD column. Choice: chip pulse on map-identity status over inventing a second TopBar toast; always-on quieter teal halo under peers (not only near-ping) so city/visit presence reads vs tutors without growing HUD. Tests: `travel-arrive-map-chip-pulse-pl402`, `presence-peer-silhouette-pl403`. Next pending: PL41.1 Low energy threshold brief cue.

- 2026-08-02: **PL39.1–PL40.1 shipped** — Craft: soft `Need …` + muted/disabled Upgrade to T2 via `craftUpgradeShortfall` / `craftUpgradeShortFundsHint` / `craftUpgradeAffordMode` (server order coins→mats→energy); recipes + BUILDING_UPGRADES costs unchanged. Decor: soft `Need Nc` + muted/disabled place rows via `decorPlaceShortFundsHint` / `decorPlaceAffordMode`; HOUSING_DECOR coin costs unchanged; no HUD column. Crop: name-first + soft `Ready` via `cropReadyWorldLabelParts` Html (Wheat / Crop Plot fallback; replaces READY chip); pad pulse (PL12.1) kept; growMs unchanged. Choice: reuse build/commerce shortfall SoT for upgrade + coins-only decor; reuse gather Ready soft + harvest name for crop over inventing HUD/spawn. Tests: `craft-upgrade-afford-clarity-pl391`, `decor-place-afford-clarity-pl392`, `crop-ready-world-label-pl401`. Next pending: PL40.2 Travel arrive map-chip pulse.

- 2026-08-02: **PL38.1–PL38.2 shipped** — Chat: brief social seafoam open accent via `shouldPlayChatOpenAccent` + `chat-panel--open-accent` (C); receive ping (PL27.2) still silent while panel open / active while closed. Settings: brief inventory-tint open accent via `shouldPlaySettingsOpenAccent` + `settings-panel--open-accent` (H); mute confirm (PL37.2) unchanged. Choice: social seafoam for chat (peer family with mail/trade) over inventing a fifth accent; reuse inventory system tint for Settings prefs over seafoam so system/help reads apart from social. Tests: `chat-panel-open-accent-pl381`, `settings-panel-open-accent-pl382`. Next pending: PL39.1 Craft upgrade afford clarity.

- 2026-08-02: **PL35.1–PL37.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_8.md (PL38–PL42)** — Craft: quiet affordable/short/xp_locked recipe-row tint via `craftRecipeAffordMode` + CSS (`craft-panel__recipe--*`); recipes unchanged. Build: soft `Need …` + muted/disabled place rows via `buildPlaceShortFundsHint` / `buildPlaceAffordMode` (server order XP→coins→mats→energy); place costs + unlimited unchanged. City: cooler streets/plaza + quiet civic pads via `CITY_HUB_VISUAL` (warm scarce yard stays). Explore: cooler canopy + soft haze + sparser trees via `EXPLORE_WILDS_VISUAL` (section floors PL4.* stay). Portal: Html circuit role + `Travel · free` / warrior `Exit · free` via `portalWorldLabelParts`. Mute: ephemeral `Muted`/`Unmuted` on settings flip. Choice: production afford SoT mirrors commerce/expand shortfall over inventing HUD; shared hub/wilds palettes like homestead yard over hardcoding mesh colors; map-identity word on portal over inventing destination list Html. Queue emptied → Polish 8 (chat/settings accents, upgrade/decor afford, crop/travel/presence, energy/arena, busy refuse/portal tip). Tests: `craft-recipe-afford-tint-pl351`, `build-place-afford-clarity-pl352`, `city-civic-atmosphere-pl361`, `explore-wilds-atmosphere-pl362`, `portal-world-label-pl371`, `mute-toggle-brief-confirm-pl372`. Next pending: PL38.1 Chat panel open accent.

- 2026-08-02: **PL33.2–PL34.3 shipped** — Hunt: soft `hunt` win / quieter `hunt_lose` SFX + ephemeral `Won · {foe}` / `Lost · {foe}` via `huntEncounterSuccessCueText` / `flashSuccessCue` (sticky rounds/loot prose removed; loot + energy drain unchanged; mute ok). Deed/wallet settings+deed surface: ephemeral `Deed claimed` / `Deed minted` / `Deed listed` / `Deed unlisted` / `Wallet linked` / `Wallet disconnected` (sticky cosmetic/stub prose removed; no combat power; core loops stay wallet-free; no dedicated SFX). Mail/Notice: brief social seafoam open accents (`shouldPlayMailOpenAccent` / `shouldPlayNoticeOpenAccent`); Decor: workspace open accent (`shouldPlayDecorOpenAccent`); unread mail (PL17.1) still stacks with open accent. Choice: foe-name prefixes over inventing loot chips in TopBar; quiet lose settle distinct from win hunt / refuse; deed/wallet copy-only confirms (mail-send pattern); reuse social seafoam for mail/notice + workspace tint for decor over inventing a third accent family. Tests: `hunt-encounter-brief-cues-pl332`, `deed-wallet-brief-cues-pl333`, `mail-panel-open-accent-pl341`, `decor-panel-open-accent-pl342`, `notice-panel-open-accent-pl343`. Next pending: PL35.1 Craft recipe afford row tint.

- 2026-08-02: **PL32.1–PL32.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_7.md (PL33–PL37) + PL33.1 shipped** — Vendor buy rows: quiet affordable/short tint via `commerceBuyAffordMode` + CSS (`vendor-panel__buy--*`); sell neutral; prices unchanged. Market: soft `Need Nc` + muted/disabled Buy when short (`marketBuyShortFundsHint`); listings/TTL unchanged. Tool broke: soft `tool_break` SFX + ephemeral `Tool broke` (`shouldFlashToolBrokeCue` / `flashSuccessCue`); sticky equip prose removed. Choice: shared commerce afford SoT for vendor+market over inventing HUD coins column; descending crack for break over reusing refuse/repair. Queue emptied → Polish 7 (sticky leftovers, remaining panel accents, production afford, map atmosphere, portal/mute). Tests: `vendor-row-afford-tint-pl321`, `market-list-afford-clarity-pl322`, `tool-broke-brief-cue-pl331`. Next pending: PL33.2 Hunt encounter brief cues.

- 2026-08-02: **PL31.1–PL31.2 shipped** — Visit E: `visitInteractStickyInfo` → null (no sticky leave/trade prose); TopBar banner + Esc/Go home; T trade hotkey unchanged. Guild Wild Grove: soft `guild_claim` / `soft_war` SFX + ephemeral `Grove claimed` / `Soft war` / `Collected · N` / `Delivered · N` via success-cue helpers / `flashSuccessCue` (sticky setInfo removed; rules unchanged; mute ok). Choice: silent visit-E over ephemeral reminder (banner already covers stay); distinct earthy claim vs tense soft-war tones over reusing quest_claim. Tests: `visit-interact-sticky-declutter-pl311`, `guild-claim-soft-war-cues-pl312`. Next pending: PL32.1 Vendor row afford tint.

- 2026-08-02: **PL30.1–PL30.3 shipped** — Dock/pen: name-first + soft `Ready` via extended `GatherReadyLabelType` / `gatherStationReadyWorldLabelParts` (PL23.2 SoT); depleted stay timer/quiet pad; cooldown/yields/care mats unchanged; no spawn invent. Tutor claimable: quiet pad/halo + soft `Claim` via `TUTOR_CLAIMABLE_WORLD_CUE` / `tutorClaimableWorldLabelParts`; city list via `apiListTutorialNpcs` + `tutorClaimableProfessionIds` (refresh on state + after claim); XP/coins unchanged; no HUD column. Choice: reuse gather Ready SoT for dock/pen over inventing profession-specific softs; notice-unread pad pattern + Claim secondary for tutors over inventing a TopBar claim column. Tests: `fishing-dock-ready-world-label-pl301`, `animal-pen-ready-world-label-pl302`, `tutor-claimable-world-accent-pl303`. Next pending: PL31.1 Visit interact sticky declutter.

- 2026-08-02: **PL29.1–PL29.3 shipped** — Trade/Quest: brief seafoam open accents via `SOCIAL_PANEL_OPEN_ACCENT_MS` + `shouldPlayTradeOpenAccent` / `shouldPlayQuestOpenAccent` (T / Q; distinct from economy gold + workspace accent). Quest claim: soft `quest_claim` SFX + ephemeral TopBar `Quest claimed` (distinct from tutor `Claimed`; sticky XP prose removed; rewards unchanged). Choice: shared social seafoam tint for peer/log panels over reusing economy/workspace CSS so social reads apart. Tests: `trade-panel-open-accent-pl291`, `quest-panel-open-accent-pl292`, `quest-claim-success-cue-pl293`. Next pending: PL30.1 Fishing dock ready world label.

- 2026-08-02: **PL28.1–PL28.3 shipped** — Trade offer sent: soft outbound `trade_offer` SFX + ephemeral TopBar `Offer · to` via `tradeOfferSentCueText` / `flashSuccessCue` (replaces sticky escrow prose; empty to-user silent; distinct from invite `Trade ·` / accept). Mail send/cancel: ephemeral `Parcel sent` / `Parcel cancelled` (claim pattern; escrow unchanged; no dedicated SFX). Subsequent station place: soft `build` + ephemeral `Built` (first place stays Homestead PL25.2). Choice: `Offer ·` prefix over reusing `Trade ·` so outbound send reads apart from incoming invite. Tests: `trade-offer-sent-cue-pl281`, `mail-send-cancel-brief-cues-pl282`, `station-built-cue-pl283`. Next pending: PL29.1 Trade panel open accent.
- 2026-08-02: **PL27.1–PL27.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_6.md (PL28–PL32)** — Visit leave: soft descending `visit_leave` SFX + ephemeral TopBar `Home` via `visitLeaveSuccessCueText` / `flashSuccessCue` (replaces sticky “Back on your land.”); `visitLandRef` gate keeps own-land idle silent; complements PL15.1 arrive. Chat receive: quiet `chat` blip + ephemeral `Chat` while panel closed via `shouldPlayChatReceivePing` + `CHAT_RECEIVE_PING_COOLDOWN_MS` (own echo / panel-open / mute silent; no always-on column). Choice: descending leave mirror of arrive over reusing travel; cooldown SoT over toast stack for chat spam. Queue emptied → Polish 6 (sticky→ephemeral leftovers, social/quest accents, dock/pen/tutor labels, visit declutter, commerce afford rows). Tests: `visit-leave-brief-cue-pl271`, `chat-receive-soft-ping-pl272`. Next pending: PL28.1 Trade offer sent cue.

- 2026-08-02: **PL26.1–PL26.2 shipped** — Expand pad: quiet affordable (soft green + emissive) vs short (muted) world tint via `EXPAND_PAD_AFFORD_CUE` / `expandPadAffordMode` / `expandPadMeshColors`; walk-up / idle both keep distinction. Refuse clarity: interact prompt switches to `Expand field · Need …` (coins → mats → energy, same order as server) via `expandSlotShortfall` + `expandRefuseClarityText`; affordable keeps full cost line. SLOT_EXPANSIONS costs unchanged; no HUD column. Soft refuse SFX stays PL16.1-narrow (energy busy already-here; coin/mat expand sticky only). Choice: shared shortfall SoT for pad + prompt over inventing HUD afford chips. Tests: `expand-pad-afford-tint-pl261`, `expand-refuse-clarity-pl262`. Next pending: PL27.1 Visit leave brief cue.

- 2026-08-02: **PL25.1–PL25.2 shipped** — Repair: inventory Repair on worn tools (`canRepairTool` / `TOOL.repairMats` — 1× wood wooden hoe, 1× iron_bar iron tools); restores max durability; soft `repair` SFX + ephemeral TopBar `Repaired` (`repairToolSuccessCueText`); fail silent. First station place: ephemeral `Homestead` when yard still beacon-empty (`isFirstHomesteadStationPlace`); subsequent places stay quiet build SFX + sticky Built; complements PL3.1 / PL22.1. Choice: craft-chain mat sink (Combat.md) over inventing coin fees; shared PL3.1 empty gate for first-homestead cue. Tests: `repair-tool-success-cue-pl251`, `repair-tool-pl251`, `first-station-homestead-cue-pl252`. Next pending: PL26.1 Expand pad afford tint.

- 2026-08-02: **PL23.1–PL24.3 shipped** — Process stations: name-first + soft `Craft` via `processStationWorldLabelParts` Html on mill/forge/kitchen/workshop/loom/alchemy; costs/recipes unchanged. Gather ready: Tree / Ore Rock + soft `Ready` when choppable/mineable (replaces ore CHIP badge); depleted stay timer/pad only (PL12.2); no spawn invent. Build/Craft/Travel: brief open accents via `WORKSPACE_PANEL_OPEN_ACCENT_MS` + `shouldPlay*OpenAccent` (walk-up / N / portal); place costs, recipes, fare-free destinations unchanged. Choice: soft secondary `Craft`/`Ready` matching PL22.2 Decor hierarchy over inventing HUD; shared workspace accent CSS (accent tint, distinct from economy gold) for production/travel panels. Tests: `process-station-world-label-pl231`, `gather-ready-world-label-pl232`, `build-panel-open-accent-pl241`, `craft-panel-open-accent-pl242`, `travel-panel-open-accent-pl243`. Next pending: PL25.1 Repair tool success cue.

- 2026-08-02: **PL22.1–PL22.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_5.md (PL23–PL27)** — Built yard: `HOMESTEAD_YARD_VISUAL` + `homesteadYardAtmosphereMode` (same station gate as PL3.1); lived warmer plot/path + quiet pad via `HomesteadEnvironment`; empty beacon still full. Decor labels: name-first + soft `Decor` via `housingDecorWorldLabelParts` on planter/banner Html; coin costs unchanged. Choice: shared PL3.1 station gate for atmosphere (not decor-alone) so empty yards stay cool; name-first Decor secondary over inventing HUD. Queue emptied → Polish 5 (station labels, panel accents, repair/first-build, expand afford, visit leave/chat). Tests: `built-yard-atmosphere-pl221`, `housing-decor-world-label-pl222`. Next pending: PL23.1 Process station world labels.

- 2026-08-02: **PL21.1–PL21.2 shipped** — Low durability: `TOOL.lowWarnPct` (20%) + `isToolDurabilityLow`; inventory warm `· nearly broken` + TopBar equipped `· low` (clears when repaired/replaced; no toast). Broken refuse: `needHammerBroken` when no Iron Hammer in inventory vs `needHammer` when unequipped; walk-up `oreChipInteractLabel` (equip / need / ready); soft refuse on both tool errors; mute ok. Choice: percentage SoT (matches wooden hoe ≤5 prior hardcode; scales iron tools) over absolute remaining; distinct broken vs equip copy over one generic hammer line. Tests: `low-tool-durability-pl211`, `broken-tool-refuse-clarity-pl212`. Next pending: PL22.1 Built-yard soft atmosphere.

- 2026-08-02: **PL20.1–PL20.3 shipped** — Eat: soft `eat` SFX + ephemeral TopBar `Ate` (`eatFoodSuccessCueText` / `flashSuccessCue`); energy restore amounts unchanged; empty/refuse silent. Equip: soft `equip` SFX + ephemeral `Equipped` / `Unequipped` (`equipToolSuccessCueText`); durability rules unchanged; mute ok. Expand: soft `expand` SFX + ephemeral `Expanded`; costs unchanged; fail silent/refuse. Choice: distinct warm bite / short clack / earthy thud over reusing harvest/craft/build so inventory and land-grow confirms read apart from production. Tests: `eat-food-success-cue-pl201`, `equip-tool-brief-cue-pl202`, `expand-field-success-cue-pl203`. Next pending: PL21.1 Low tool durability accent.

- 2026-08-02: **PL19.1–PL19.2 shipped** — Vendor: brief border/header tint on walk-up stall open (`shouldPlayVendorOpenAccent` / `ECONOMY_PANEL_OPEN_ACCENT_MS`); prices unchanged. Market: same accent on City Market Board walk-up and M hotkey (`shouldPlayMarketOpenAccent`); listings unchanged. Choice: shared economy gold tint (distinct from bag open) over reusing inventory CSS so commerce panels read apart from inventory. Tests: `vendor-panel-open-accent-pl191`, `market-panel-open-accent-pl192`. Next pending: PL20.1 Eat food success cue.

- 2026-08-02: **PL18.1–PL18.2 shipped** — Receive: soft `trade_invite` SFX + ephemeral TopBar `Trade · from` (`tradeInviteReceiveCueText` / `flashSuccessCue`); sticky “press T to review” prose removed (T hotkey unchanged; no always-on trade column). Accept: soft `trade_accept` SFX + ephemeral `Trade accepted`; reject/cancel stay silent; escrow unchanged. Choice: distinct invite ping vs accept settle over reusing visit/vendor so social trade reads apart from map/economy confirms. Tests: `trade-invite-receive-cue-pl181`, `trade-accept-success-cue-pl182`. Next pending: PL19.1 Vendor panel open accent.

- 2026-08-02: **PL17.1–PL17.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_4.md (PL18–PL22)** — Unread: notice soft pad/halo + world `Notices · New` + interact `· New` while tip ids unread (per-user localStorage); opening board marks seen; mail panel warm unread accent + `· New (N)` on pending inbox only (no TopBar column). Claim: sticky `Parcel claimed.` → ephemeral `Parcel claimed` via `mailClaimSuccessCueText` / `flashSuccessCue`; escrow unchanged. Choice: world+prompt for notice (walk-up) and panel accent for mail (hotkey L, no mailbox mesh) over inventing a HUD mail column. Queue emptied → Polish 4 (trade confirms, vendor/market open accents, eat/equip/expand cues, tool durability, yard atmosphere). Tests: `unread-mail-notice-accent-pl171`, `unread-notice-prompt-pl171`, `mail-claim-success-cue-pl172`. Next pending: PL18.1 Trade invite receive cue.

- 2026-08-02: **PL16.1–PL16.2 shipped** — Soft refuse: quiet descending `refuse` SFX via `isSoftRefuseError` gated to `stationBusy` / `notEnoughEnergy` / `travelAlreadyHere` only (wired in `applyState`); other errors stay silent; success cues unchanged; mute ok. Decor place: soft `decor` SFX + ephemeral TopBar `Decor placed` (`decorPlaceSuccessCueText` / `flashSuccessCue`); costs unchanged; fail keeps panel open (silent or refuse path); sticky “cosmetic only” prose removed. Choice: narrow refuse gate over all-errors tone to avoid arcade spam; distinct decor tone over reusing build so housing reads apart from stations. Tests: `soft-refuse-sfx-pl161`, `decor-place-success-cue-pl162`. Next pending: PL17.1 Unread mail / notice accent.

- 2026-08-02: **PL15.1–PL15.2 shipped** — Visit arrive: soft `visit` SFX + ephemeral TopBar `Visiting · owner` via `visitSuccessCueText` / `flashSuccessCue` (replaces sticky leave prose; banner covers stay-state); own/refuse silent; mute ok. Nearby peer: quiet floor ring via `NEARBY_PEER_PING` + `inWorldInteractRange` when peer in interact range; zero peers stay quiet (PL2.2); no always-on list growth. Choice: distinct visit tone over reusing travel so social arrive reads apart from map hops; world ring over prompt spam. Tests: `visit-arrive-confirm-pl151`, `nearby-peer-ping-pl152`. Next pending: PL16.1 Soft refuse SFX.

- 2026-08-02: **PL14.1–PL14.2 shipped** — Map identity: quiet TopBar chip City/Land/Explore/Arena via `MAP_IDENTITY` + `formatCurrentMapChip` (warrior optional Arena wording; not a dashboard column; updates on travel). Portals: veil/frame tint by circuit role via `portalMeshTintForLandKind`; fare-free prompts + warrior Exit-first unchanged. Choice: shared SoT for chip + portal so map identity reads the same in HUD and world. Tests: `current-map-chip-pl141`, `portal-mesh-tint-pl142`. Next pending: PL15.1 Visit arrive confirm.

- 2026-08-02: **PL13.1–PL13.2 shipped** — Free-travel: one-shot dismissible `free_travel` tip after city hub / on first City arrive (`firstFreeTravelTip` + circuit names); fare-free · N opens travel; no sticky panel. Tutor claim: sticky XP prose → PL6.2-style ephemeral `Claimed` (`tutorClaimSuccessCueText` / `flashSuccessCue`); server XP/coins unchanged; fail paths silent. Choice: dedicated tip after hub (not only strengthening `city_hub`) so portal-arrive on City still teaches the four-map circuit. Tests: `free-travel-tip-pl131`, `tutor-claim-cue-pl132`. Next pending: PL14.1 Current-map chip (min HUD).

- 2026-08-02: **PL12.1–PL12.2 shipped** — Crop ready: soft lime pad + clock-driven emissive pulse (`CROP_READY_WORLD_PULSE` / `cropReadyWorldPulseIntensity`) on harvest-ready plots only; empty/growing stay quiet; grow timers unchanged. Gather depleted: muted pad + stump/ore body tint via `GATHER_NODE_DEPLETED_CUE` + `gatherStumpWorldVisual` / `gatherOreDepletedPad` (land + explore meshes); ready tops/veins stay bright; no spawn-rate invent. Choice: shared SoT + deterministic pulse from `nowMs` over useFrame so readiness reads at a glance and stays seek-safe. Tests: `crop-ready-world-pulse-pl121`, `gather-node-depleted-cue-pl122`. Next pending: PL13.1 First free-travel tip.

- 2026-08-02: **PL11.1–PL11.2 shipped + Plan rollover → FullGameBuildPlan_CityLands_Polish_3.md (PL12–PL17)** — Arena: `WARRIOR_ARENA_VISUAL` scorched grounds `#3a2820` + warm clay ring `#d4a048` vs city/land/explore peers; plaque face/accent on boards + ArenaStubPanel; optional copy unchanged; homestead still refuses. Travel-to-warrior: distinct `travel_warrior` square-led SFX via `travelSfxFor` + TravelPanel blurb emphasis (optional / free / no ladder). Choice: shared palette SoT (like PL4 floors) over hardcoding only in mesh. Queue emptied → Polish 3 (ready-state crops/gather, onboarding tips, map chip, visit/refuse cues, mail accents). Tests: `arena-floor-plaque-contrast-pl111`, `arena-enter-travel-cue-pl112`. Next pending: PL12.1 Crop ready world pulse.

- 2026-08-02: **PL10.1–PL10.2 shipped** — Vendor: new soft confirm SFX `vendor_buy` / `vendor_sell` on successful stall buy/sell only (mute-safe; no price retune). Market: PL6.2-style ephemeral TopBar cues `Listed` / `Bought` / `Cancelled` via `marketSuccessCueText` + `flashSuccessCue` (replaces sticky prose; auto-clears `SUCCESS_CUE_MS`). Choice: distinct marketplace ids over reusing craft/travel so economy feedback stays readable. Tests: `vendor-buy-sell-sfx-pl101`, `market-success-cue-pl102`. Next pending: PL11.1 Arena floor / plaque contrast.

- 2026-08-02: **PL9.1–PL9.2 shipped** — Low energy: `ENERGY.lowWarnPct` (25%) SoT + `isEnergyLow`; TopBar soft warm meter/border/`· low` label (clears when recovered; min HUD, no toast). Inventory: brief accent border + header tint on hotkey open (`INVENTORY_OPEN_ACCENT_MS`); same panel, no extra columns. Choice: percentage threshold over absolute so maxEnergy scaling stays consistent. Tests: `low-energy-topbar-pl91`, `inventory-open-accent-pl92`. Next pending: PL10.1 Vendor buy/sell SFX.

- 2026-08-02: **PL8.1–PL8.2 shipped** — City scarce soft-busy: warmer pad + emissive halo + floating `Busy` when peer in interact range (`CityEnvironment` + `isStationContendedByPresence`); interact prompt appends `· Free` / `· Busy` on city scarce gather/craft only (land unlimited / explore / tutors / services unchanged). Server contention reuses shared presence geometry. Choice: always name Free vs Busy on city scarce walk-up (readable at a glance) over Busy-only. Tests: `busy-station-world-cue-pl81`, `busy-prompt-copy-pl82`. Next pending: PL9.1 Low-energy TopBar cue.

- 2026-08-02: **PL7.1–PL7.2 shipped** — Per-map soft BGM via `BGM_BEDS` (city triangle / land sine / explore saw+partial / warrior square); `setBgmLandKind` swaps tint; mute silences. Explore intentionally quieter + sparse second voice vs homestead (AudioDirection wilds; no combat suite). Choice: dual-voice Explore over filter graph for Web Audio simplicity. Tests: `bgm-map-tint-pl71`, `bgm-explore-tint-pl72`. Next pending: PL8.1 Busy station world cue.

- 2026-08-02: **PL6.1–PL6.2 shipped + Polish_2 rollover** — Gather/build/travel Web Audio presets wired on success (mute-safe). Brief TopBar success cues for plant/harvest/craft/travel (`SUCCESS_CUE_MS` auto-clear) + plant/harvest prompt pulse; no toast stack. Choice: distinct gather thud / build clack / travel rise over reusing craft/hunt. Queue emptied → `FullGameBuildPlan_CityLands_Polish_2.md` (PL7–PL11). Tests: `core-action-sfx-pl61`, `success-cue-pl62`. Next pending: PL7.1 Per-map soft BGM tint.

- 2026-08-02: **PL5.1–PL5.2 shipped** — Portal prompt: action-first `Travel · free ·` + named four-map circuit (Vision fare-free); warrior `Exit · Travel · free (N) · circuit`; hierarchy treats Exit as prefix and Travel as verb. TravelPanel: accent border/`You are here` on current map (disabled); one-line destination blurbs; free/instant unchanged. Choice: `Travel · free` over legacy `Free travel` so PL2.1 hierarchy bold-verbs Travel (not City). Tests: `portal-prompts-pl51`, `travel-panel-here-pl52`. Next pending: PL6.1 SFX for gather / build / travel.

- 2026-08-02: **PL4.1–PL4.2 shipped** — Explore section labels: per-section `labelAccent` + stronger hints on `EXPLORE_SECTIONS` SoT; ForestEnvironment high-contrast Html (accent border/title, denser plate). Floors: woodland green / mines slate / hunt warm earth + north trail belt (`pathColor`); hunt nodes still explore-only. Prompts still prefix section label. Choice: warm hunt floor + path belt over relocating nodes. Tests: `explore-section-label-contrast-pl41`, `explore-floor-separation-pl42`. Next pending: PL5.1 Portal free-travel prompt clarity.

- 2026-08-02: **PL3.1–PL3.2 shipped** — Empty-land beacon: glow pad + emissive board + "Build here · empty land" world label on fresh yard; softens to quiet "Build" after first placeable station (choice: soften not hide). Tip/`emptyLandBuildBoardTip` stays dismissible min-HUD. BuildPanel: `PLAYER_LAND_STATION_BUILD_GROUPS` Gather/Process/Care headers; costs unchanged; unlimited place. Tests: `empty-land-beacon-pl31`, `build-panel-groups-pl32`. Next pending: PL4.1 Explore section label contrast.

- 2026-08-02: **PL2.1–PL2.3 shipped** — Interact prompt: accent key badge + bold verb + soft prefix/detail; no `.panel` chrome; still null when far. TopBar: identity/energy/coins stay; Day + nearby demoted to quiet secondary line until non-default (Dawn/Dusk/Night or peers). Panel focus: soft world dim + hide prompt/tips while any contextual panel open; close restores min HUD. Choice: hierarchy parse in web lib (not shared) so explore section stays wayfinding prefix. Tests: `interact-prompt-hierarchy-pl21`, `topbar-declutter-pl22`, `panel-focus-pl23`. Next pending: PL3.1 Empty-land build board beacon.
- 2026-08-02: **PL1.2–PL1.3 shipped** — Tutor cloaks: `TUTOR_CLOAK_COLORS` / `tutorialNpcCloakColor` for every seeded profession (not only farmer/forester/carpenter); capitalize labels + HighlightRing unchanged. Service kits: vendor awning stripes, market twin-post listing board, notice single-post plaque — SoT `CITY_SERVICE_VISUAL_KITS`; walk-up prompts unchanged. Tests: `tutor-cloak-colors-pl12`, `city-service-visuals-pl13`, `city-service-prompts-pl13`. Next pending: PL2.1 Interact prompt action-first hierarchy.
- 2026-08-02: **Polish loop replaces fidelity recycle** — Human asked to “pule todo con un loop.” Authored `FullGameBuildPlan_CityLands_Polish.md` (PL1–PL6). Active queue = **Polish (PL\*)**. CL99–CL102 marked deferred/frozen. `AgentAutonomousLoop.md` ticks pull first pending PL\* only; do not resume F16+ or CL fidelity recycle. Sentinel stays `AGENT_LOOP_TICK_full_game`.
- 2026-08-02: **PL1.1 shipped** — City scarce-yard pad + tutor lane + floating Shared/Tutors labels; per-station soft pads from `cityScarceStationMarkers()`; civic blocks get door/window. Choice: marker SoT in shared from `CITY_BUILDINGS` (no station reposition that would break proximity tests). Next pending: PL1.2 tutor cloak colors.
- 2026-08-02: **HUMAN REDIRECT — queue is pure fidelity recycle** — CL91–CL98 (phases 22–23) and the new CL99–CL102 (phase 24) are the same two alternating “still green” templates (Explore craft/sinks/social/HUD ↔ scarce/claims/premium/notice). Agents correctly reuse green suites instead of cloning tests, so ticks ship zero new gameplay. A human should stop or rewrite the next plan toward real PlayerVision depth (e.g. remaining profession NPC polish, city station-count clarity, regional economy / taxes from FutureIdeas — still no NFT combat power / dungeons / wars invent) before more recycle rollovers.
- 2026-08-02: **CL96.1–CL98.3 shipped (reuse) + Plan rollover → FullGameBuildPlan_CityLands_24.md (CL99–CL102)** — Re-ran CL88–CL90 suites green (9 files) plus CL95 scarce peers in one smoke batch (12 files / 37 tests): `fisher-tutor-claim-cl881`, `alchemist-tutor-claim-cl882`, `land-flour-vendor-sink-cl883`, `explore-premium-wood-sell-cl891`, `mail-cancel-escrow-cl892`, `market-cancel-escrow-cl893`, `notice-board-tips-cl901`, `warrior-arena-board-cl902`, `citylands-smoke-cl903` (+ `*-cl871`/`872`/`873`). Choice: reuse (no identical clone files). Queue emptied → CityLands_24 (same even-phase template as CL91–CL94 / CL83–CL86; flagged as fidelity recycle above). Next pending: CL99.1 Explore wood → land saw_planks still green.
- 2026-08-02: **CL95.1–CL95.3 shipped (reuse)** — Re-ran CL87 scarce/unlimited suites green (`city-scarce-craft-contention-cl871`, `city-scarce-gather-contention-cl872`, `land-unlimited-craft-cl873`). Choice: reuse (no identical clone files). Next pending: CL96.1 Fisher tutor claim after land dock catch still green.
- 2026-08-02: **CL91.1–CL94.3 shipped (reuse)** — Re-ran CL83–CL86 suites green (12 files / 38 tests): `explore-wood-saw-planks-cl831`, `explore-ore-smelt-cl832`, `explore-leather-weave-cl833`, `land-crate-vendor-sink-cl841`, `land-cooked-fish-vendor-sink-cl842`, `bread-stew-ration-eat-cl843`, `visit-presence-trade-cl851`, `trade-invite-accept-cancel-cl852`, `market-buy-ttl-escrow-cl853`, `min-hud-interact-cl861`, `four-map-travel-cl862`, `citylands-smoke-cl863`. Choice: reuse existing green suites (no identical clone files) over duplicating CL83–CL86 asserts. Queue emptied → CityLands_23 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_23.md (CL95–CL98)** — CL91–CL94 complete; sequel focuses city scarce vs land unlimited, Fisher/Alchemist claims + flour sink, Explore wood premium + mail/market cancel, notice/warrior + regression. Prefer re-run of CL87–CL90 suites when still green. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL89.1–CL90.3 shipped** — Explore wood premium (`explore-premium-wood-sell-cl891`): Explore > City; empty refuse. Mail cancel escrow (`mail-cancel-escrow-cl892`): send→cancel restore; cancel-not-yours. Market cancel escrow (`market-cancel-escrow-cl893`): list→cancel restore; cancel-not-yours. Notice tips (`notice-board-tips-cl901`): scarce_stations + travel/warrior ids. Warrior arena optional (`warrior-arena-board-cl902`): plaque/tip; homestead refuse. Regression (`citylands-smoke-cl903`): city scarce busy + land unlimited, Fisher/Alchemist claims, flour sink, Explore wood premium, mail/market cancel, notice/warrior. Choice: assert-only fidelity (parity with CL77.1 / CL76.1 / CL81.3 / CL82.1 / CL82.2; no Content Lock retune). Queue emptied → CityLands_22 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_22.md (CL91–CL94)** — CL87–CL90 complete; sequel focuses Explore→land craft (wood saw / ore smelt / leather weave), land crate/fish sinks + energy eat, visit/trade/market escrow, min HUD + free travel + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL88.1–CL88.3 shipped** — Fisher claim after land dock catch (`fisher-tutor-claim-cl881`): land catch → City claim; incomplete refuse. Alchemist claim after land brew (`alchemist-tutor-claim-cl882`): land `brew_herbal_tonic` → City claim; incomplete refuse. Land flour City vendor (`land-flour-vendor-sink-cl883`): sell @5; empty refuse. Choice: assert-only fidelity (parity with CL64.2 / CL64.3 / CL75.1; no Content Lock retune). Next pending: CL89.1 Explore premium wood sell still green.
- 2026-08-02: **CL87.1–CL87.3 shipped** — City scarce kitchen/workshop craft (`city-scarce-craft-contention-cl871`): soft presence `stationBusy` on city kitchen + workshop; land unlimited. City scarce tree/ore gather (`city-scarce-gather-contention-cl872`): city stump+ore `stationBusy`; land unlimited. Land unlimited craft (`land-unlimited-craft-cl873`): peer on player_land kitchen/workshop OK; city still busy. Choice: assert-only fidelity (parity with CL79.1 / CL79.2 / CL79.3; no Content Lock retune). Next pending: CL88.1 Fisher tutor claim after land dock catch still green.
- 2026-08-02: **CL85.1–CL86.3 shipped** — Visit+trade (`visit-presence-trade-cl851`): host presence + nearby ping; own-visit + far refuse. Trade invite accept/cancel (`trade-invite-accept-cancel-cl852`): nearby accept + cancel escrow; far ping + `tradeSelf`. Market buy+TTL (`market-buy-ttl-escrow-cl853`): cross-buy plank + TTL restore; own-list refuse. Min HUD (`min-hud-interact-cl861`): walk-up craft/portal/market; closed panels. Four-map travel+portal (`four-map-travel-cl862`): fare-free circuit + Free travel · Exit · N; already-here refuse. Regression (`citylands-smoke-cl863`): Explore saw, crate/fish sinks + eat, visit/trade/market, min HUD + free travel. Choice: assert-only fidelity (parity with CL73.2 / CL76.2 / CL76.3+CL65.1 / CL78.1 / CL78.2+CL74.1; no Content Lock retune). Queue emptied → CityLands_21 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_21.md (CL87–CL90)** — CL83–CL86 complete; sequel focuses city scarce vs land unlimited, Fisher/Alchemist claims + flour sink, Explore wood premium + mail/market cancel, notice/warrior + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL83.1–CL84.3 shipped** — Explore wood→land saw (`explore-wood-saw-planks-cl831`): stump×2 → `saw_planks` + carpenter XP; missing refuse. Explore ore→land smelt (`explore-ore-smelt-cl832`): chip×2 → `smelt_iron_bar` + blacksmith XP; missing refuse. Explore leather→land weave (`explore-leather-weave-cl833`): dual-trail → `weave_cloth` + weaver XP; homestead hunt + missing refuse. Land crate City sink (`land-crate-vendor-sink-cl841`): sell @3; empty refuse. Land cooked_fish City sink (`land-cooked-fish-vendor-sink-cl842`): catch→cook→sell @4; empty refuse. Bread/stew/ration eat (`bread-stew-ration-eat-cl843`): +25/+55/+75; empty `noBread`/`noFood`. Choice: assert-only fidelity (parity with CL71.1 / CL71.2 / CL68.2 / CL72.3 / CL51.1 / CL72.1+CL67.1; no Content Lock retune). Next pending: CL85.1 Visit presence + nearby trade still green.
- 2026-08-02: **CL81.1–CL82.3 shipped** — Explore premium leather/ore (`explore-premium-leather-ore-sell-cl811`): Explore > City rates; empty refuse. Mail parcel claim (`mail-parcel-claim-cl812`): send→claim; already-claimed + missing refuse. Market cancel escrow (`market-cancel-escrow-cl813`): list→cancel restore; cancel-not-yours. Notice tips (`notice-board-tips-cl821`): scarce_stations + travel/warrior ids. Warrior arena optional (`warrior-arena-board-cl822`): plaque/tip; homestead refuse. Regression (`citylands-smoke-cl823`): city scarce busy + land unlimited, Farmer/Weaver claims, bread sink, Explore premium, mail claim + market cancel, notice/warrior. Choice: assert-only fidelity (parity with CL68.3 / CL44.1 / CL69.1 / CL69.3 / CL70.1 / CL70.2; no Content Lock retune). Queue emptied → CityLands_20 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_20.md (CL83–CL86)** — CL79–CL82 complete; sequel focuses Explore→land craft (wood saw / ore smelt / leather weave), land crate/fish sinks + energy eat, visit/trade/market escrow, min HUD + free travel + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL77.2–CL78.3 shipped** — Recipe XP gates (`recipe-xp-gate-fidelity-cl772`): `pack_travel_ration` cook≥25 / `forge_iron_hammer` smith≥20 under-gate refuse + enough XP OK. Homestead hunt refuse (`homestead-hunt-refuse-cl773`): Explore trail/thicket OK; empty land no hunt nodes; `huntExploreOnly`. Min HUD (`min-hud-interact-cl781`): walk-up craft/portal/market; closed panels. Four-map travel (`four-map-travel-cl782`): fare-free circuit; already-here refuse. Regression (`citylands-smoke-cl783`): flour/bandage/plank sinks, mail cancel + trade/market buy, Explore wood premium, XP gates, homestead hunt, min HUD + free travel. Choice: assert-only fidelity (parity with CL53.3 / CL55.3 / CL66.2 / CL69.2; no Content Lock retune).
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_19.md (CL79–CL82)** — CL75–CL78 complete; sequel focuses city scarce vs land unlimited, Farmer/Weaver claims + bread sink, Explore premium + mail/market escrow, notice/warrior + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL79.2–CL80.3 shipped** — City scarce tree/ore gather (`city-scarce-gather-contention-cl792`): soft presence `stationBusy` on city stump + ore; land unlimited. Land unlimited craft (`land-unlimited-craft-cl793`): peer on player_land kitchen/workshop does not block; city still busy. Farmer claim (`farmer-tutor-claim-cl801`): land plant→harvest → City claim; incomplete refuse. Weaver claim (`weaver-tutor-claim-cl802`): land loom weave → City claim; incomplete refuse. Mill→bake→bread sell (`land-mill-bake-bread-sell-cl803`): land mill flour → bake → City vendor @3; empty refuse. Choice: assert-only fidelity (parity with CL60.1/CL60.2 / CL52.3 / CL64.1 / CL62.2 / CL43.1+CL47.3; no Content Lock retune). Next pending: CL81.1 Explore premium leather/ore sell still green.
- 2026-08-02: **CL79.1 shipped** — City scarce kitchen/workshop craft contention (`city-scarce-craft-contention-cl791`): soft presence `stationBusy` on city kitchen + workshop; land unlimited ignores peer. Choice: assert-only (parity with CL52.3 / CL60.3; no qty caps). Next pending: CL79.2 City scarce tree/ore gather contention still green.
- 2026-08-02: **CL76.2–CL77.1 shipped** — Trade invite accept/cancel (`trade-invite-accept-cancel-cl762`): nearby accept + cancel escrow restore; far ping refuse + offerer `tradeOnlyRecipient`; own `tradeSelf`. Market buy (`market-buy-listing-cl763`): cross-account plank buy; own-list `marketOwnListing`. Explore premium wood (`explore-premium-wood-sell-cl771`): Explore > City wood rate; empty refuse. Choice: assert-only fidelity (parity with CL52.1 / CL61.1 / CL68.3; no Content Lock retune). Next pending: CL77.2 Recipe XP gate fidelity still green.
- 2026-08-02: **CL75.2–CL76.1 shipped** — Land bandage City vendor (`land-bandage-vendor-sink-cl752`): sell @2 flat; empty refuse. Land plank (`land-plank-vendor-sink-cl753`): City sell @4 + market list; Explore premium 6; empty refuse. Mail cancel escrow (`mail-cancel-escrow-cl761`): send→cancel restore; cancel-not-yours `mailOnlySender`. Choice: assert-only fidelity (parity with CL75.1 / CL69.3; no Content Lock retune). Next pending: CL76.2 Trade invite accept + cancel still green.
- 2026-08-02: **CL75.1 shipped** — Land flour City vendor (`land-flour-vendor-sink-cl751`): sell @5 (Explore regional 3); empty-bag refuse. Choice: assert-only fidelity (parity with CL72.3 crate; no Content Lock retune). Next pending: CL75.2 Land cloth_bandage City vendor sink still green.
- 2026-08-02: **CL73.1–CL74.3 shipped** — Animal Hunter claim (`trail-animal-hunter-claim-cl731`): Explore trail → City claim; thicket≠AH; incomplete + double-claim refuse. Visit+trade (`visit-presence-trade-cl732`): host presence + nearby ping; own-visit + far refuse. Mail send refuses (`mail-send-refuse-cl733`): missing recipient + empty parcel. Portal prompts (`portal-prompts-cl741`): Free travel · circuit; warrior Exit · N. City vendor buy (`city-vendor-buy-seed-tool-cl742`): wheat_seed @8 + wooden_hoe @12; broke refuse. Regression (`citylands-smoke-cl743`): Explore saw/smelt, AH+MH, bread/stew, crate, visit/mail, portal. Choice: assert-only fidelity (parity with CL55.1 / CL66.1 / CL54.1 / CL61.2; no Content Lock retune). Queue emptied → CityLands_18 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_18.md (CL75–CL78)** — CL71–CL74 complete; sequel focuses land flour/bandage/plank City sinks, mail cancel + trade + market buy escrow, Explore wood premium + XP gates + homestead hunt refuse, min HUD + free travel + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL72.1–CL72.3 shipped** — Bread / Hearty Stew eat (`bread-stew-eat-cl721`): Content Lock +25 / +55; empty `noBread` / `noFood`; no combat buff. Housing banner coin sink (`housing-banner-coin-sink-cl722`): land pad place @18c; broke `needCoinsDecor`. Land crate → City vendor (`land-crate-vendor-sink-cl723`): sell @3; empty-bag refuse. Choice: assert-only fidelity (parity with CL67.2 / CL49.2 / CL39.1; no Content Lock retune). Next pending: CL73.1 Animal Hunter claim after trail still green.
- 2026-08-02: **CL71.1–CL71.3 shipped** — Explore wood → land saw (`explore-wood-saw-planks-cl711`): dual Explore stump chop → land `saw_planks` + carpenter XP (not forester); missing-wood refuse. Explore ore → land smelt (`explore-ore-smelt-cl712`): chip×2 → land `smelt_iron_bar` + blacksmith XP (not miner); missing-ore refuse. Thicket → MH claim (`thicket-monster-hunter-claim-cl713`): Explore thicket → City claim; trail≠MH; incomplete + double-claim refuse. Choice: assert-only fidelity (parity with CL56.1 / CL53.1; no Content Lock retune). Next pending: CL72.1 Bread / hearty_stew eat energy still green.
- 2026-08-02: **CL69.2–CL70.3 shipped** — Four-map free travel (`four-map-travel-cl692`): city↔land↔explore↔warrior fare-free; already-here refuse. Market cancel escrow (`market-cancel-escrow-cl693`): list→cancel restore; cancel-not-yours. Notice tips (`notice-board-tips-cl701`); warrior arena optional (`warrior-arena-board-cl702`). Regression (`citylands-smoke-cl703`): ration/tonic eat, Breeder claim, Explore leather weave/sell, free travel, market cancel. Choice: assert-only fidelity (no Content Lock retune). Queue emptied → CityLands_17 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_17.md (CL71–CL74)** — CL67–CL70 complete; sequel focuses Explore→land saw/smelt, MH+AH claims, bread/stew + housing banner + crate vendor sinks, visit/mail refuse, portal/vendor verify + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL68.2–CL69.1 shipped** — Explore leather → land loom (`explore-leather-weave-cl682`): dual-trail hunt → land `weave_cloth` + weaver XP; homestead hunt + missing-leather refuse. Explore premium leather sell (`explore-premium-leather-sell-cl683`): Explore rate > City; empty-bag refuse. Mail parcel claim (`mail-parcel-claim-cl691`): offline send → claim; already-claimed + missing refuse. Choice: assert-only fidelity (no Content Lock retune). Next pending: CL69.2 Four-map free travel circuit still green.
- 2026-08-02: **CL67.1–CL68.1 shipped** — Land travel ration craft→eat (`travel-ration-eat-cl671`): land kitchen `pack_travel_ration` → eat energy; cook≥25 gate refuse. Tonic/cooked_fish eat (`tonic-cooked-fish-eat-cl672`): both restore Content Lock energy; empty refuse. Housing decor coin sink (`housing-decor-coin-sink-cl673`): land planter place; broke `needCoinsDecor`. Breeder claim (`breeder-tutor-claim-cl681`): land feed+clean → City claim; incomplete refuse. Choice: assert-only economy/tutor fidelity (no retune). Next pending: CL68.2 Explore leather → land loom weave still green.
- 2026-08-02: **CL65.1–CL66.3 shipped** — Market TTL escrow (`market-ttl-escrow-cl651`): list → TTL returns goods; buy refuse. Crop plot contention (`city-scarce-crop-plot-contention-cl652`): soft presence lock extended into `plantCrop`; land unlimited. Cooked_fish cross-buy (`cooked-fish-market-buy-cl653`): seller→buyer; own-list refuse. Visit+trade (`visit-presence-trade-cl661`); min HUD prompts (`min-hud-interact-cl662`). Regression (`citylands-smoke-cl663`). Choice: code change for city plant lock (was craft/gather-only); assert-only elsewhere. Queue emptied → CityLands_16 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_16.md (CL67–CL70)** — CL63–CL66 complete; sequel focuses energy eat sinks (ration/tonic/cooked_fish), housing decor coins, Breeder + Explore leather weave/sell verify, mail + free travel + market cancel, notice/warrior optional + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL64.1–CL64.3 shipped** — Farmer/Fisher/Alchemist tutor claims after land paths (`farmer-tutor-claim-cl641` / `fisher-tutor-claim-cl642` / `alchemist-tutor-claim-cl643`): land plant→harvest → Farmer; land dock catch → Fisher; land `brew_herbal_tonic` → Alchemist; incomplete + double-claim refuse. Choice: assert-only claim fidelity (objectives already Content Lock) over new quests. Next pending: CL65.1 Market listing TTL expire → escrow return smoke.
- 2026-08-02: **CL63.1–CL63.3 shipped** — Scarce loom/alchemy assert (`city-scarce-loom-contention-cl631` / `city-scarce-alchemy-bench-contention-cl633`): soft presence `stationBusy` on city craft (lock already CL52.3); land unlimited. Fishing dock (`city-scarce-fishing-dock-contention-cl632`): extended presence lock into `gatherFish` (was missing vs tree/ore). Choice: assert-only loom/alchemy over inventing caps; dock code change required for catch path. Next pending: CL64.1 Farmer tutor claim after land plant/harvest.
- 2026-08-02: **CL61.1–CL62.3 shipped** — Market buy (`market-buy-listing-cl611`): seller lists plank → buyer purchases; own-listing `marketOwnListing` refuse (vs CL45.2 cancel-not-yours). City vendor seed/tool (`city-vendor-buy-seed-tool-cl612`): live stall wheat_seed @8 + wooden_hoe @12; broke refuse. NPC rates (`cooked-fish-ore-npc-rates-cl613`): cooked_fish @4; city/land ore @1 / explore @2; empty-bag refuse; no invent iron_bar NPC. Builder claim (`builder-tutor-claim-cl621`): land `crop_plot` place → City claim; incomplete + double-claim refuse. Weaver claim (`weaver-tutor-claim-cl622`): land `weave_cloth` → City claim; clear leftover planks so weave≠carpenter ready. Regression (`citylands-smoke-cl623`). Choice: assert-only market/vendor/claim fidelity over new SKUs; crop_plot bootstrap for Builder (no minBuilderXp). Queue emptied → CityLands_15 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_15.md (CL63–CL66)** — CL59–CL62 complete; sequel focuses remaining city scarce loom/dock/alchemy contention, Farmer/Fisher/Alchemist tutor claim verify, market TTL + crop scarce + cooked_fish cross-buy, visit/HUD verify + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL59.1–CL60.3 shipped** — Miner/Blacksmith/Cook claims (`miner-tutor-claim-cl591` / `blacksmith-tutor-claim-cl592` / `cook-tutor-claim-cl593`): Explore ore → Miner; land `smelt_iron_bar` → Blacksmith; land `cook_meat` → Cook (objective still `bake_bread`; cooked_meat listed explicitly — preferred over `cook_fish` cookXp-only proxy); incomplete + double-claim refuse. Scarce tree/ore/workshop (`city-scarce-tree-contention-cl601` / `city-scarce-ore-contention-cl602` / `city-scarce-workshop-contention-cl603`): soft presence `stationBusy` on city gatherWood/gatherOre + workshop craft; land unlimited. Choice: extend CL52.3 presence lock into gather (tree/ore) over inventing qty caps; workshop assert-only (craft lock already existed); loom left optional. Next pending: CL61.1 Market buy from other player listing smoke.
- 2026-08-02: **CL56.1–CL58.3 shipped** — Explore ore→land smelt (`explore-ore-smelt-cl561`): chip Explore ore×2 → land forge `smelt_iron_bar` + blacksmith XP; homestead chip OK; missing-ore refuse. Ore/bar sink (`land-smelt-vendor-ore-bar-cl562`): sell leftover ore @1, hold bar (no invent NPC rate / `vendorWontBuy`); empty refuse. Miner≠smelt XP (`miner-xp-chip-not-smelt-cl563`): Explore/land chip → miner; smelt → blacksmith. Scarce forge/mill (`city-scarce-forge-contention-cl571` / `city-scarce-mill-contention-cl572`): soft presence `stationBusy`; land unlimited. Cooked_fish market (`cooked-fish-market-list-cl573`): list OK; NPC @4 holds. Forester/Carpenter claims (`forester-tutor-claim-cl581` / `carpenter-tutor-claim-cl582`): land chop/saw → City claim; incomplete refuse. Regression (`citylands-smoke-cl583`). Choice: assert-only chains (recipes/rates/contention already Content Lock) over inventing iron_bar NPC buyback. Queue emptied → CityLands_14 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_14.md (CL59–CL62)** — CL55–CL58 complete; sequel focuses Miner/Blacksmith/Cook tutor claims, city scarce tree/ore/workshop contention, market buy + vendor buy fidelity, Builder/Weaver claim verify + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL53.1–CL54.3 shipped** — Thicket → Monster Hunter claim (`thicket-monster-hunter-claim-cl531`): Explore `edge_thicket` → City claim; trail leather does not ready MH; incomplete + double-claim refuse. Land tree→crate→City (`land-tree-saw-crate-sell-cl532`): chop→`saw_planks`→`assemble_wood_crate`→vendor @3; empty-bag refuse. Recipe XP gates (`recipe-xp-gate-fidelity-cl533`): `pack_travel_ration` cook≥25 / `forge_iron_hammer` smith≥20 under-gate refuse + enough XP OK. Portal prompts (`portal-prompts-four-maps-cl541`): Free travel · circuit on city/land/explore; warrior Exit arena · N. Arena board (`warrior-arena-board-cl542`): optional/no-ladder plaque+tip; no balance invent; homestead refuse. Regression (`citylands-smoke-cl543`): food/crate sinks, nearby trade+visit, thicket claim, portal copy. Choice: assert-only fidelity (gates/rates/prompts already Content Lock) over new SKUs or combat invent. Queue emptied → CityLands_13 rollover.
- 2026-08-02: **Plan rollover → FullGameBuildPlan_CityLands_13.md (CL55–CL58)** — CL51–CL54 complete; sequel focuses Animal Hunter claim + trail/thicket isolation, Explore ore→land smelt + miner/blacksmith XP split, city scarce forge/mill contention + cooked_fish market, Forester/Carpenter tutor claims + regression. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-02: **CL55.1–CL55.3 shipped** — Animal Hunter claim (`trail-animal-hunter-claim-cl551`): Explore trail → City claim; thicket does not ready AH; incomplete refuse. Tutor isolation (`trail-thicket-tutor-isolation-cl552`): trail≠MH / thicket≠AH. Homestead hunt refuse (`homestead-hunt-refuse-cl553`): Explore OK; empty land no hunt nodes; `huntExploreOnly` holds. Choice: assert-only parity with CL53.1 Monster Hunter claim.
- 2026-08-01: **CL52.1–CL52.3 shipped** — Trade accept/cancel (`trade-invite-accept-cancel-cl521`): nearby presence → create→accept + cancel restores escrow; far soft-invite refuse holds + offerer cannot accept. Visit presence leave (`visit-presence-leave-cl522`): visit other empty land → host sees visitor presence; leave/return home clears host list; own-visit + unknown refuse. City scarce contention (`city-scarce-station-contention-cl523` + `stationContention.ts`): second crafter at city kitchen with peer in interact range gets `stationBusy` wait copy; alone OK; player land ignores peer presence (no daily caps). Choice: soft presence lock on city craft over inventing qty caps; assert-only trade/visit flows. Next pending: CL53.1 Explore thicket → Monster Hunter tutor claim e2e.
- 2026-08-01: **CL51.1–CL51.3 shipped** — Cooked fish City sink (`land-cook-fish-vendor-sell-cl511`): `VENDOR.sell.cooked_fish` = 4; land catch→`cook_fish`→City sell; empty-bag refuse; rate above fish / under stew. Land stew market (`land-stew-market-list-cl512`): kitchen `cook_stew` (cook ≥15) → City `createMarketListing`; empty-stew refuse; stew NPC @5 stays. Land wheat sell (`land-wheat-vendor-sell-cl513`): plant→harvest → City `vendorSell` @2; `cropNotReady` holds. Choice: add cooked_fish NPC rate (plan asked `vendorSell` fish/cooked path; raw fish already @2) over market-only; market list for stew (already has vendor) over second NPC assert; assert-only wheat sell (rate already Content Lock). Next pending: CL52.1 Trade invite accept + cancel smoke.
- 2026-08-01: **CL49.3–CL50.3 shipped** — Breeder claim (`breeder-tutor-claim-cl493`): land feed→clean → City Animal Breeder claim; clean-only ready edge; incomplete + double-claim refuse. Interact prompts (`interact-prompt-stations-cl501`): craft/notice/build labels + min HUD; fixed `oreNodeReady` for fishing_dock/animal_pen (was stuck on settling). Four-map travel (`four-map-travel-cl502`): reverse circuit fare-free; already-here refuse. Regression companion (`citylands-smoke-cl503`): land fish cook, alchemy/bread/crate sinks, leather weave, visit/decor/breeder claim. Choice: assert-only dual-care→claim (objective stays `feed_animal_pen` via any breeder XP); fix dock/pen ready helper over rewriting all prompts. Queue emptied → CityLands_12 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_12.md (CL51–CL54)** — CL47–CL50 complete; sequel focuses land→City food/mat sinks (cook_fish/stew/wheat), social visit/trade + scarce contention, Explore thicket claim + land tree→crate chain, portal/warrior fidelity. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL48.2–CL49.2 shipped** — Explore trail leather → land loom (`explore-leather-weave-cl482`): hunt both Explore `game_trail`s (2× leather for `weave_cloth`) → land loom + weaver XP (not hunter); homestead `huntExploreOnly` holds; missing-leather refuse. Land mill→bake→ration (`land-mill-bake-ration-cl483`): mill×2 → `bake_bread` → `cook_meat` → `pack_travel_ration` (cook ≥25) → eat energy; missing-mats refuse. Visit + trade nearby (`visit-trade-nearby-cl491`): visit other empty `player_land` + same-land presence ping; different-land edge; own-visit + too-far refuse. Housing banner (`housing-banner-decor-cl492`): L5 pad → second catalog `banner` @18c (no combat); city refuse. Choice: assert-only chains (recipes exist); dual-trail hunt over hammer bonus; visit empty land (no starter-yard seed); banner as second SKU over second pad. Next pending: CL49.3 Breeder tutor claim after pen care.
- 2026-08-01: **CL47.2–CL48.1 shipped** — Land alchemy brew → City vendor/market (`land-alchemy-tonic-sink-cl472`): assert-only alchemist XP brew + sell @4 + market list; empty tonic refuse. Bread NPC sink (`land-bread-vendor-sell-cl473`): `VENDOR.sell.bread` = 3 (below flour 5 / stew 5); land bake → City sell; empty-bag refuse; market list still OK (CL35.2). Land workshop saw→crate (`land-workshop-saw-crate-cl481`): `saw_planks`×2 → `assemble_wood_crate` + carpenter XP (not forester); missing-plank refuse. Choice: add low NPC bread rate (plan asked `vendorSell`) over market-only replay; assert-only saw→crate chain. Next pending: CL48.2 Explore leather → land loom weave e2e.
- 2026-08-01: **CL47.1 shipped** — Land dock catch → kitchen `cook_fish` e2e (`land-dock-cook-fish-cl471`): fisher XP on catch, cook XP on cook (not fisher); missing-fish refuse. Choice: assert-only chain (recipes already exist). Next pending: CL47.2 Land alchemy brew → vendor/market sink.
- 2026-08-01: **CL46.2–CL46.3 shipped** — Min HUD fidelity (`min-hud-panels-cl462`): `defaultClosedPanelIds` equals full panel set (notice+craft); craft walk-up-only (KeyC=chat); walk-away closes craft/notice; `formatMinimalHudHint` short without craft/market/quest. Regression (`citylands-smoke-cl8` CL46.3): land mill→bake + forge hammer + loom bandage + dock catch; Explore ore premium sell; pen under-gate refuse; closed craft/notice + min hint edge. cl7 closed list adds craft+vendor. Choice: tests-only for CL46.2 (behavior already CL6.1/6.2); extend cl8 companion (not new file). Queue emptied → CityLands_11 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_11.md (CL47–CL50)** — CL43–CL46 complete; sequel focuses land→City outlets (fish cook, alchemy sink, bread sell), Explore→land craft (leather weave, ration chain), visit/trade + second decor + Breeder claim, interact-prompt fidelity. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL45.1–CL46.1 shipped** — Breeder dual-care e2e (`breeder-feed-clean-cl451`): land pen wheat feed → wood clean (+ reverse after CD); `animal_breeder_xp` both beats; CD + missing-wheat refuse; no livestock combat. Market cross-buy (`market-cross-buy-cl452`): land `wood_crate` list → second account buys; cancel-not-yours holds. Travel ration tip fidelity (`travel-ration-tip-cl453`): tip `travel_circuit` id stable; body clarifies ration = kitchen energy food, free travel fare-free; panel intro + README aligned. Builder gate (`builder-xp-gate-cl461`): `animal_pen.minBuilderXp` = 8 (sixth costly); crop/workshop/kitchen bootstrap; under-gated refuse; Content Lock + prior pen tests updated. Choice: ship gate with CL45 polish (same tick) over deferring to alone; crate as land-craft SKU for market buy over plank-only replay. Next pending: CL46.2 Min HUD walk-up panel fidelity.
- 2026-08-01: **CL44.1–CL44.3 shipped** — Explore ore premium: `iron_ore` Explore sell **2** (> City/Land 1); chip→`vendorSell` e2e (`explore-ore-sell-cl441`); tip/README/Content Lock + `EXPLORE_VENDOR_PREMIUM_SELL_ITEMS`. Land dock catch after builder gate (`land-dock-catch-cl442`): place→`gatherFish`+fisher XP; cooldown refuse (under-gate already CL41.2). Explore hunt→land cook (`explore-hunt-cook-cl443`): trail meat→land kitchen `cook_meat`+cook XP; homestead hunt refuse. Choice: +1 Explore ore premium (parity with wood delta) over assert-only flat rate. Next pending: CL45.1 Breeder feed + clean XP e2e smoke.
- 2026-08-01: **CL43.1–CL43.3 shipped** — Assert-only land craft e2e: mill→flour→kitchen `bake_bread` (farmer/cook XP; `land-mill-bake-bread-cl431`); forge `smelt_iron_bar`→`forge_iron_hammer` (blacksmith not miner; `land-forge-smelt-hammer-cl432`); loom `weave_cloth_bandage`→City vendor sell @2 + market list (`land-loom-bandage-sink-cl433`). Choice: vendor primary sink for bandage (market as edge) over market-only; no Content Lock number changes. Next pending: CL44.1 Explore ore chip → premium sell e2e.
- 2026-08-01: **CL42.3 shipped** — Extended `citylands-smoke-cl8` for CL39–CL42: crate vendor sink (3c), land mill flour + farmer XP, Explore stump→premium wood sell, fishing_dock under-gate refuse, L5 decor planter + city refuse; scarce tip + flat crate rate edge. Choice: extend cl8 companion (not new cl9 file). Queue emptied → CityLands_10 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_10.md (CL43–CL46)** — CL39–CL42 complete; sequel focuses land craft e2e (bake/forge/loom), Explore ore premium sell, land dock catch, Breeder/market polish, sixth builder gate (`animal_pen`). NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL41.2–CL42.2 shipped** — Fishing dock builder gate (`builder-xp-gate-cl412`): `fishing_dock.minBuilderXp` = 8 (fifth costly after forge/mill/loom/alchemy); crop_plot / workshop / kitchen stay ungated; under-gated refuse. Housing decor smoke (`housing-decor-cl413`): L5 soft-unlock `decor_pad` → planter coin sink; no combat; city refuse. Warrior tip/plaque fidelity (`warrior-tip-plaque-cl421`): tip id stable, optional copy, no balance numbers, training off homestead. Four-map free travel smoke (`four-map-travel-cl422`): full circuit instant, no fare, already-here refuse. Choice: L5 pad path over `PLAYER_LAND_BUILDINGS` pads; assert-only warrior + travel (no copy rewrite). Next pending: CL42.3 Regression smoke after CL39–CL42.
- 2026-08-01: **CL40.2–CL41.1 shipped** — Travel ration craft/eat (`travel-ration-craft-cl402`): kitchen `pack_travel_ration` → cook XP + eat energy restore (no combat); missing mats refuse; free travel tip still fare-free (ration is energy food, not fare). Tip `scarce_stations` fidelity (`scarce-stations-tip-cl403`): shared scarce vs unlimited land; body adds alchemy bench; notice default-closed. Breeder quest blurb (`breeder-quest-blurb-cl411`) names feed + wood bedding; objective `feed_animal_pen` stable. Choice: assert craft/eat only (no paid travel); tip id stable with alchemy listed. Next pending: CL41.2 Gate fishing_dock on builder XP.
- 2026-08-01: **CL39.2–CL40.1 shipped** — Land plant→harvest→mill flour smoke (`land-plant-mill-flour-cl392`): player_land crop_plot + mill → farmer XP; no-wheat + cropNotReady refuse. Carpenter tutor basics/toolsNeeded name `assemble_wood_crate` / plank sink (quest `craft_plank` id stable; no new tip id). Explore gather→sell e2e (`explore-gather-sell-cl401`): live stump chop → `vendorSell` wood at Explore premium (> City/Land); empty-bag refuse. Choice: tutor-only for CL39.3 (no new notice tip); assert-only gather→sell (rates already Content Lock). Next pending: CL40.2 Travel ration craft assert.
- 2026-08-01: **CL39.1 shipped** — `VENDOR.sell.wood_crate` = 3 (city/explore/land; below 2× plank); market list OK; empty-bag refuse. Choice: low NPC + market (tonic pattern) over market-only. Next pending: CL39.2 Land plant → harvest → mill flour smoke.
- 2026-08-01: **CL38.2 shipped** — Phase-8 regression `citylands-smoke-cl8` (companion; cl7 already ~900 lines): mill→bread, cook meat, tonic eat, Explore premium sell vs City, alchemy_bench builder gate refuse. Choice: new cl8 smoke file vs further bloating cl7. Queue emptied → CityLands_9 rollover.
- 2026-08-01: **CL38.1 shipped** — Chose tonic eat assert over second brew SKU: `eatFood(herbal_tonic)` restores 45 energy, no combat buff / no XP; kitchen cook crafts unchanged. Next pending: CL38.2 Regression smoke after CL35–CL38.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_9.md (CL39–CL42)** — CL35–CL38 complete; sequel focuses crate sink, land farmer mill, Explore gather→sell e2e, travel ration, scarce tip, dock builder gate, decor, warrior copy. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL37.1–CL37.3 shipped** — Explore premium sell smoke: live `vendorSell` leather at Explore > City rate (existing regional book); empty-bag refuse. Tip `explore_mats_craft` fidelity (woodland/mines/hunt → craft; id stable). Animal Breeder tutor basics + toolsNeeded name wheat feed + wood bedding to match tip `animal_breeder_path` (quest still `feed_animal_pen`). Choice: assert-only premium sell (no price change); tutor copy update only for CL37.3. Next pending: CL38.1 Alchemist second light brew OR tonic eat assert.
- 2026-08-01: **CL36.1–CL36.3 shipped** — Workshop `assemble_wood_crate` (2× plank → `wood_crate`) carpenter XP sink; SKU cap 23→24 (new light housing-adjacent SKU over assert-only `craft_wooden_hoe`). Land forge smoke: `forge_iron_hammer` + `forge_iron_hoe` → blacksmith XP not miner. `alchemy_bench.minBuilderXp` = 8 (4th costly after forge/mill/loom); kitchen stays cook bootstrap. Choice: gate alchemy_bench not kitchen; crate not edible (carpenter ≠ cook). Next pending: CL37.1 Explore vendor premium sell smoke.
- 2026-08-01: **CL35.1–CL35.3 shipped** — Assert mill→flour (farmer) → bake bread (cook) on city stations; flour vendor Content Lock rates (5 city/land, Explore 3) + bread/flour market list (no NPC bread sell — energy food); `cook_meat` → cook XP with `meat_to_kitchen` tip. Content Lock recipe table `bake_bread` profession corrected farmer→cook. Choice: bread via market not vendor (no Sell bread rate in Lock). Next pending: CL36.1 Carpenter second light recipe OR plank sink.
- 2026-08-01: **CL34.2–CL34.3 shipped** — Pen second care beat: `cleanAnimalPen` spends 1× wood (bedding), shared 45s CD / +5 animal_breeder XP with wheat feed; gather auto-prefers wheat then wood; tip `animal_breeder_path` names both; no livestock combat. Choice: wood bedding (existing mat) over defer tip-only. Smoke CL34.3: dual hunter columns, alchemist brew XP, land tree/ore, tonic/bandage vendor+market, pen clean, loom/city tree refuse. Queue emptied → CityLands_8 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_8.md (CL35–CL38)** — CL31–CL34 complete; sequel focuses Farmer mill→bread, Cook meat, carpenter/smith depth, fourth builder gate, Explore vendor premium, Alchemist second beat. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL33.1–CL34.1 shipped** — `VENDOR.sell` adds `herbal_tonic` @ 4 / `cloth_bandage` @ 2 (same city/explore/land; below mat coin value). Market smoke: land brew/sew → City list both; bad qty refuse. Notice tip `meat_to_kitchen` + Kitchen panel (parallel to `fish_to_kitchen`). `loom.minBuilderXp` = 8 (3rd costly after forge/mill); kitchen stays cook bootstrap. Choice: flat regional vendor rates (no Explore premium) for crafted sinks; gate loom not kitchen. Next pending: CL34.2 Animal Breeder light second beat.
- 2026-08-01: **CL32.1–CL32.3 shipped** — Land `tree_stump` / `ore_node` already in `PLAYER_LAND_STATIONS` (CL3.2 costs); assert place+chop → forester and place+chip → miner (hammer); city place refuse. Choice: dedicated tip id `land_gather_practice` (not only extend `scarce_stations`) + Build Board panel copy. Next pending: CL33.1 Vendor sell tonic + bandage.
- 2026-08-01: **CL31.1–CL31.3 shipped** — Dual hunter XP (`animal_hunter_xp` / `monster_hunter_xp` schema v29); trail ≠ thicket columns; legacy `hunter_xp` migrates into Animal Hunter (not 50/50). Tip + tutor copy name both ladders (tip id stable). `alchemist_xp` schema v30; `brew_herbal_tonic` grants alchemist (not cook); stew/fish stay cook. DTO `hunterXp` aliases `animalHunterXp` for legacy UI. Next pending: CL32.1 Placeable land tree stump.
- 2026-08-01: **CL30.1–CL30.3 shipped** — Assert Explore trail/thicket → hunter XP (not cook); tip `explore_mats_craft` body; Monster Hunter tutor still `hold_boar_tusk`; smoke covers pen feed, mill/alchemy, market buy/cancel, hunt XP. Choice: assert-only + tip body (shared `hunter` column stays until CL31 split). Queue emptied → CityLands_7 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_7.md (CL31–CL34)** — CL27–CL30 complete; sequel focuses dual Animal/Monster Hunter XP, Alchemist XP off cook, land tree/ore stations, tonic/bandage sinks, more builder gates. NFT lands / dungeons / wars stay in FutureIdeas.

- 2026-08-01: **CL29.1–CL29.3 shipped** — Market smoke: land craft→City list→buyer buys one / seller cancels other; fail cancel-not-yours; TTL buy refuse. Loom `weave_cloth_bandage` (1× cloth → `cloth_bandage` +20E edible) weaver XP sink; SKU cap 22→23. Assert `fish_to_kitchen` + cook fish/stew paths. Choice: edible bandage (food-adjacent) over decor mat (no new housing pad). Next pending: CL30.1 Animal Hunter XP assert.
- 2026-08-01: **CL28.1–CL28.3 shipped** — Mill builder gate (`minBuilderXp` = 8, workshop stays bootstrap); `alchemy_bench` land + city×1; `brew_herbal_tonic` (2× wheat + 1× leather → herbal_tonic +45E); practice → bench + `hold_herbal_tonic`; stew stays cook. Choice: gate mill (2nd costliest) not workshop; cook XP on brew until alchemist column; both land+city bench (loom/dock pattern); SKU cap 21→22. Next pending: CL29.1 Market cancel + buy smoke.
- 2026-08-01: **CL27.1–CL27.3 shipped** — Pen wheat feed (`ANIMAL_PEN`: 1× wheat, 8 energy, 45s CD, +5 XP); schema v28 `animal_breeder_xp` + ProfessionId/gate; city tutor slot 28 objective `feed_animal_pen`; practice map null (land pens only). Choice: ship XP column with feed (not builder-adjacent temp); wheat as feed (no new feed SKU); same gather E-key dispatch as dock. Next pending: CL28.1 Gate mill/workshop on builder XP.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_6.md (CL27–CL30)** — CL23–CL26 complete; sequel focuses Animal Breeder feed/XP/tutor, more builder gates, alchemy bench, market buy/cancel, weaver sink, Explore hunter XP. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL26.3 shipped** — Extended `citylands-smoke-cl7` for CL23–CL26: fisher XP, fish vendor/cook, explore forester/miner, land craft→market list, forge builder gate, animal_pen, fish_to_kitchen tip; failures for city pen, bad qty, under-gated forge. Queue emptied → CityLands_6 rollover.
- 2026-08-01: **CL26.2 shipped** — Light `animal_pen` in `PLAYER_LAND_STATIONS` (26c, wood+plank); land place OK / city blocked; notice tip notes pens exist but Breeder/livestock still deferred. Choice: placeable shell (no gather/combat) over tip-only defer. Next pending: CL26.3 Regression smoke after CL23–CL26.
- 2026-08-01: **CL26.1 shipped** — Gate forge place on `builderXp` (`minBuilderXp` = `BUILDER_PLACE_XP` 8). Choice: only forge (costliest) so crop_plot/mill/workshop stay bootstrap-friendly; one prior place unlocks forge. Next pending: CL26.2 Animal pen stub (land) or defer note.
- 2026-08-01: **CL25.1–CL25.3 shipped** — Land craft→City market smoke (`land-craft-city-market-cl251`); city buy book completeness assert vs Content Lock; notice + Kitchen panel tip `fish_to_kitchen`. Choice: `createMarketListing` stays global (not city-gated) — walk-up board is UX; failure = bad qty. Buy book already complete — no new SKUs. Next pending: CL26.1 Builder XP gate on expensive station.
- 2026-08-01: **CL24.1–CL24.3 shipped** — Explore `tree_stump` → forester XP assert; Explore `ore_node` → miner XP + hammer gate; extended notice tip `explore_mats_craft` (id stable) for woodland wood / mine ore → carpenter & forge. Choice: assert-only for XP (gather already correct); tip body update not a new tip id. Next pending: CL25.1 List land craft on City market smoke.
- 2026-08-01: **CL23.2–CL23.3 shipped** — `VENDOR.sell.fish` = 2 (spread to city/explore/land); market already accepts stackable fish — asserted list. Choice: new `cooked_fish` SKU (+40 energy, same tier as cooked meat) rather than mapping grill→`cooked_meat`; catalog cap 21. `cook_fish` is cook profession at kitchen (not alchemy).
- 2026-08-01: **CL23.1 shipped** — `fisher_xp` additive v26→v27; `gatherFish` grants fisher XP (+5); cook craft XP unchanged; fisher gate wired in `meetsRecipeXpGate`. Choice: keep tutor objective `hold_fish` (inventory) rather than XP threshold. Next pending: CL23.2 Fish vendor/market sink.
- 2026-08-01: **CL22.1 shipped** — Extended `citylands-smoke-cl7` for CL18–CL21: forester/miner/builder XP columns, city dock catch + fisher claim, alchemist Kitchen practice, `explore_mats_craft` + `post_craft_market` tips, XP gates, city dock place refuse + cooldown. Queue emptied → CityLands_5 rollover.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_5.md (CL23–CL26)** — CL18–CL22 complete; sequel focuses Fisher XP + fish sinks, Explore woodland/mines XP fidelity, market list smoke, builder XP gates, light animal pen prep. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL21.1–CL21.2 shipped** — Choice: post-craft tip as dismissible onboarding `post_craft_market` (not a new HUD column); clears on City/vendor. Broadened `hasCrafted` for plank/cloth/stew + cook/carpenter/weaver XP. Notice tip `explore_mats_craft` documents Explore mats → weave/cook/carpenter. Next pending: CL22.1 Regression smoke.
- 2026-08-01: **CL20.1–CL20.2 shipped** — `CITY_PRACTICE_STATIONS.alchemist = ["kitchen"]` (shared with Cook); notice tip + Alchemist tutor copy clarify Kitchen brew stand-in; `cook_stew` stays cook craft; no alchemy combat. Next pending: CL21.1 Post-craft market tip.
- 2026-08-01: **CL19.1–CL19.3 shipped** — `fish` + `fishing_dock` (land unlimited / city ×1 slot 27); catch gather 8 energy + 60s CD, no rod; Fisher tutor `hold_fish`; practice map + notice tip updated. Choice: defer fisher XP column. Next pending: CL20.1 Alchemist → Kitchen.
- 2026-08-01: **CL18.2–CL18.3 shipped** — `miner_xp` v25 + `builder_xp` v26; ore → miner (not blacksmith); `placeLandStation` → builder XP; city place still blocked. Next pending: CL19.1 Fish item + fishing dock.
- 2026-08-01: **CL18.1 shipped** — `forester_xp` additive v23→v24; tree chop grants forester (not carpenter); `focusedEnergyCost` treats forester like other non-farm/smith crafts; Forester tutor `gather_wood` checks foresterXp. Next pending: CL18.2 Miner XP.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_4.md (CL18–CL22)** — CL13–CL17 complete; sequel focuses Forester/Miner/Builder XP fidelity, light Fisher catch loop, Alchemist kitchen practice wiring, land→market / explore craft tips. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL17.1 shipped** — Extended `citylands-smoke-cl7` for CL13–CL16: seeded tutors (weaver→builder), weaver XP ≠ carpenter, builder ready after place, practice nulls + empty_land tip, failures for city place / stub breeder / double-claim. Queue emptied → CityLands_4 rollover.
- 2026-08-01: **CL16.1–CL16.2 shipped** — Empty-land tip: shared `emptyLandBuildBoardTip` on BuildPanel walk-up + dismissible onboarding `empty_land` (clears on City or after placing a station). Animal Breeder: no pens/livestock in catalog → choice = keep stub unseeded + notice tip `animal_breeder_path` (same pattern as fisher/alchemist defer); no invented livestock combat.
- 2026-08-01: **CL15.1–CL15.2 shipped** — Animal Hunter + Monster Hunter + Builder tutors on City (`buildSlots` 24→27). Hunter objectives = Explore loot only (`leather` trail / `boar_tusk` thicket); homestead hunt still `huntExploreOnly`. Builder completes after `placeLandStation` on owned land; claim at City walk-up (no forced HUD). `CITY_PRACTICE_STATIONS` null for hunters (Explore practice) + builder (land board). Remaining stub: animal_breeder (CL16.2).
- 2026-08-01: **CL14.1–CL14.2 shipped** — Fisher + Alchemist tutors on City (`buildSlots` 22→24). No fish/alchemy catalog items or stations → objectives use existing loops: Explore `raw_meat` (catch stand-in) and Kitchen `stew` (brew stand-in). Choice: leave `CITY_PRACTICE_STATIONS` null + notice tip rather than invent docks/benches. Remaining stubs: animal_breeder / animal_hunter / monster_hunter / builder.
- 2026-08-01: **CL13.2–CL13.3 shipped** — City loom at (−4,3) near Weaver tutor; `buildSlots` 21→22. Weaver XP additive v22→v23 (same pattern as carpenter). Choice: keep `weave_cloth` minProfessionXp at 0; gate wiring tested via `meetsRecipeXpGate` with raised min.
- 2026-08-01: **CL13.1 shipped** — Choice: Weaver quest completes on cloth inventory (land loom OK) so CL13.2 can add scarce city loom without blocking the tutor. City `buildSlots` 20→21.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_3.md (CL13–CL17)** — CL8–CL12 complete; sequel seeds remaining tutors (Weaver/Fisher/Alchemist/Hunters/Builder), weaver XP, empty-land tip. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL12.2 shipped** — Extended CL7.2 smoke for CL8–CL11 template depth + CL12.1 tip assertion; suite still `citylands-smoke-cl7.test.ts`.
- 2026-08-01: **CL12.1 shipped** — Choice: first onboarding tip (not a new HUD column); clears on dismiss or when already on City. Default spawn stays empty `player_land`.
- 2026-08-01: **CL11.2 shipped** — Choice: explicit `WARRIOR_TRAINING_BUILDING_TYPES` + dedicated error (not only `unknownStation`) so future arena furniture cannot slip into `PLAYER_LAND_STATIONS` unnoticed. BuildPanel already lists stations catalog only.
- 2026-08-01: **CL11.1 shipped** — Choice: shared `arenaPlaqueCopy` + warrior-specific `freeTravelPortalPrompt("warrior")` + Html Exit label over north portal (same pattern as explore section labels). No combat balance invented.
- 2026-08-01: **CL10.2 shipped** — Regional books already favored Explore for wood/hunt mats (F11.3); added `exploreRegionalVendorTip` + notice tip `explore_vendor_value` so README/board copy cannot drift from tests. City sell book unchanged (same as homestead base).
- 2026-08-01: **CL10.1 shipped** — Choice: shared `EXPLORE_SECTIONS` drive floor tints + Html labels + explore-only prompt prefixes (city scarce trees/ore stay unprefixed). No minimap. Hunt hint still says Exploration only. Fixed `oreNodeReady` to accept `tree_stump` (stumps always showed “recovering”).
- 2026-08-01: **CL9.2 shipped** — Choice: tip on city notice board (not a post-craft modal) so HUD stays walk-up-only. Copy covers Vendor + Market list; no forced quest.
- 2026-08-01: **CL9.1 shipped** — Next missing craft station = Loom (Weaver). No weaver XP column yet → `weave_cloth` uses carpenter XP gate (logged). Cloth item added; city has no loom (player-land only).
- 2026-08-01: **CL8.3 shipped** — Static `notice_board` (no live-ops). Tips: travel circuit, scarce stations, warrior optional (+ land→city in CL9.2). Panel `notice` closed by default; walk-away closes.
- 2026-08-01: **CL8.2 shipped** — CL8.1 tutors reuse existing scarce city nodes (ore×2, forge×1, kitchen×1); `CITY_PRACTICE_STATIONS` + tests assert no homestead refill / no city place. Remaining unseeded tutors still need stations when seeded later.
- 2026-08-01: **CL8.1 shipped** — Choice: next batch = Miner / Blacksmith / Cook (stations already on city → pairs with CL8.2). Quest claims via same `quest_claims` table. Warrior never on `ECONOMY_PROFESSIONS` / `SEEDED_CITY_TUTORIAL_NPCS`.
- 2026-08-01: **Plan rollover → FullGameBuildPlan_CityLands_2.md (CL8–CL12)** — CL1–CL7 complete; sequel focuses city tutors/stations, land→city loop, explore wayfinding, warrior guards, hub tip. NFT lands / dungeons / wars stay in FutureIdeas.
- 2026-08-01: **CL7.2 shipped** — Consolidated smoke covers CityLands acceptance matrix.
- 2026-08-01: **CL7.1 shipped** — Travel UX states free City↔Land↔Explore↔Warrior circuit; explicit caravan disclaimer. Choice: keep TRAVEL constants for ration recipe history; never surface timer/fare in map UI.
- 2026-08-01: **CL6.2 shipped** — Panel/hotkey/walk-away/prompt extracted from GameApp; `GameHudShell` owns chrome. Panel action callbacks stay in GameApp (parity). Choice: pure helpers under `apps/web/lib/hud/` for testability without mounting React.
- 2026-08-01: **CL6.1 shipped** — Walking chrome stripped to identity + energy + coins + HP + short hint. Profession XP / DMG·DEF / full keybind strip removed from TopBar (still in Settings H / state DTO). Panels were already closed-by-default; walk-up unchanged.
- 2026-08-01: **CL5.1 shipped** — Warrior map is a real placeholder arena (ring env + portal + arena_board plaques). Choice: no combat fights yet — plaque panel only. Backfill upgrades CL1.2 portal-only rows. Not on ECONOMY_PROFESSIONS; never on player land template.
- 2026-08-01: **CL4.2 shipped** — Main hunt loop explore-only. Choice: keep STARTER_BUILDINGS as non-hunt packed seed (trails stripped); legacy DBs with homestead trails still fail hunt via kind guard. Edge thicket (boar) stays on explore with game trail.
- 2026-08-01: **CL4.1 shipped** — Replaced F11.1 glade (crops+tiny yard) with multi-section EXPLORE_* template; FOREST_* aliases retained. Backfill by slotIndex (like city) so multi-of-type nodes fill. Legacy explore rows may keep old crop_plot leftovers at occupied slots until wipe.
- 2026-08-01: **CL3.2 shipped** — Unlimited per-type stations on player land via build board (`PLAYER_LAND_STATIONS` costs in Content Lock). City place blocked (`buildPlayerLandOnly`). Slots ≥100 for player-built.
- 2026-08-01: **CL3.1 shipped** — Fresh land = `build_board` only (non-production). `ensurePlayerLandYardBuildings` never inserts production; `ensureStarterYardBuildings` remains test-only. Choice: keep legacy expand pads (P0.3) alongside new place flow.
- 2026-08-01: **CL2.3 shipped** — City template gains `vendor_stall` + `market_board`. City vendor buy book: wheat_seed 8 / wooden_hoe 12 / iron_hammer 28 (Content Lock amended). Market board walk-up opens MarketPanel; M hotkey still works without requiring the board.
- 2026-08-01: **CL2.2 shipped** — Framework = `TUTORIAL_NPCS` for every Professions.md economy id (stubs for unseeded). City seeds farmer/forester/carpenter as `tutorial_npc` buildings; interact opens contextual panel only. Quest ids `tutorial_*` share `quest_claims`. Warrior not on this ladder.
- 2026-08-01: **CL2.1 shipped** — Choice: one global shared `city` land (first visitor creates; others join) so stations are contendable. Per-player portal-only city rows from CL1.2 are superseded on next travel (orphans ignored). Expand remains player_land-only.
- 2026-08-01: **CL1.3 shipped** — Four scene templates; GameApp remounts LandScene on `landId`; presence list cleared on map switch; WS/HTTP presence still scoped to active land. Day-night accepts city/warrior kinds.
- 2026-08-01: **CL1.2 shipped** — Free instant map travel; city/warrior are per-player portal stubs (true shared scarce city stations deferred to CL2.1). Legacy F11.2 caravan timer/fare inert for CityLands routes; TRAVEL constants kept for ration recipes. Stale en-route caravan rows are cancelled on next free travel.
- 2026-08-01: **CL1.1 shipped** — Choice vs PlayerVision: default map = empty `player_land` (city as session hub waits for land rows in CL1.2 / scarce stations in CL2.1). Legacy `STARTER_BUILDINGS` kept as explicit test seed only; load/visit no longer refill. Existing DB buildings preserved on kind rename.
- 2026-08-01: **Loop retargeted to CityLands** — autonomous ticks (`AGENT_LOOP_TICK_full_game`) now drive `TASKS.md` **CityLands queue (CL*) — NEXT** via `AgentAutonomousLoop.md`; F16.2–F17.5 stay deferred; wake shell left running (docs alignment only).
- 2026-08-01: **CityLands redesign plan authored** — `docs/19_development_plan/FullGameBuildPlan_CityLands.md` (CL1–CL7, 15 tasks). F16.2–F17.5 marked deferred/superseded; live queue is CityLands. No gameplay implementation in the planning pass.
- 2026-08-01: Vision answer closed OQ-PV-005 — limited city production = scarce shared workstations (no abstract daily/qty caps); player land = as many stations of each type as wanted. See `PlayerVision_CityLands.md` v1.3.0.
- 2026-08-01: Vision answer closed OQ-PV-002 — warrior = optional parallel combat path (arena/wars), independent of profession dedication; not a required class, not on the economy profession ladder. See `PlayerVision_CityLands.md` v1.2.0.
- 2026-08-01: Vision answers closed OQ-PV-001/003/004 — professions = `docs/06_character_systems/Professions.md`; free travel City↔Lands↔Explore↔Warrior; absolute-min HUD (panels on walk-up/context). See `PlayerVision_CityLands.md` v1.1.0.
- 2026-08-01: Vision redirect — city / lands / explore / warrior as separate maps (not one starter yard); see `docs/19_development_plan/PlayerVision_CityLands.md`. Freeze F16+ content queue pending redesign; autonomous loop process kept, content refill blocked until redesign plan.
- 2026-08-01: F16.1 — Postgres boots at current schema version only (no SQLite history replay); sync `migrateSqlite()` is SQLite-only, startup uses `migrateDatabase()`.
- 2026-08-01: F15.5 — migrateSqlite early-return skipped deed column ensures; always call ensureDeedMarketV21 when version matches.
- 2026-08-01: ChatPanel `onChannelChange` prop type was `(channel: ChatChannel)` (syntax error); fixed to `=> void`.
- Content Lock is mandatory for economy numbers unless FullGameBuildPlan amends them.  
- Schema: prefer additive migrations (v3→v5 pattern).  
- One `npm run dev` only — avoid duplicate :8787 watchers.  
- Autonomous loop: if CityLands CL\* queue empty → write next CityLands appendix (e.g. `FullGameBuildPlan_CityLands_4.md`), refill TASKS pending under **CityLands queue**, continue (never idle; never resume F16.2–F17.5).  
- Loop only stops when a human kills it. Sentinel `AGENT_LOOP_TICK_full_game` = CityLands CL\* work.  
- Schema v6: combat columns additive from v5; do not wipe on 5→6.
- Schema v7: hunter_xp additive from v6.
- Schema v8: carpenter_xp + wood/plank workshop chain.
- Schema v24: forester_xp additive; chop no longer increments carpenter_xp.
- Schema v27: fisher_xp additive; gatherFish grants fisher XP (+5).
- Schema v25: miner_xp additive; ore no longer increments blacksmith_xp.
- Schema v26: builder_xp additive; placeLandStation grants builder XP.
- Schema v9: buildings.tier (default 1); mill/forge T2 upgrades.
- Schema v10: multi-land (no unique player_id); active_land_id; forest travel.
- Schema v11: travel_destination_kind + travel_arrive_at caravan timer.
- Loop must use Shell `notify_on_output` for `AGENT_LOOP_TICK_full_game` or ticks print without waking the agent.
out waking the agent.
