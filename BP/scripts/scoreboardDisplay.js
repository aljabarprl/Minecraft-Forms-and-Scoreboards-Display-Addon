import { world, system } from "@minecraft/server"; // modul server

const tickInterval = 20; // 1 detik
let tickCount = 0;

// --- FORMATTER ---

function formatMoney(value) {
    if (value >= 1_000_000_000) {
        let num = Math.floor(value / 100_000_000) / 10;
        return `${num % 1 === 0 ? num.toFixed(0) : num}B`;
    }
    if (value >= 1_000_000) {
        let num = Math.floor(value / 100_000) / 10;
        return `${num % 1 === 0 ? num.toFixed(0) : num}M`;
    }
    if (value >= 1_000) {
        let num = Math.floor(value / 100) / 10;
        return `${num % 1 === 0 ? num.toFixed(0) : num}K`;
    }
    return `${value}`;
}

// Format playtime (dinamis)
function formatPlaytime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (d > 0) {
        return `${d}d ${h}h`;
    }
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    if (m > 0) {
        return `${m}m`;
    }
    return `${s}s`;
}

// Format Kills/Deaths: hanya format B jika >= 1B
function formatScore(value) {
    if (value >= 1_000_000_000) {
        let num = Math.floor(value / 100_000_000) / 10;
        return `${num % 1 === 0 ? num.toFixed(0) : num}B`;
    }
    return value.toString();
}

// Role custom warna
const roleColorMap = {
    "Military": "§g",
    "Pilot": "§f",
    "Warrent": "§t",
    "Raptor": "§b§l",
    "Pyro": "§v§l",
    "SpecOps": "§7",
    "Secret_Service": "§8",
    "Deputy_Sheriff": "§t",
    "Head Leader": "§eHead §4Leader",
    "Vice_GrandMarshal": "§eVice §6GrandMarshal",
    "Sergeant": "§rSerg§feant",
    "Sorcerer": "§1",
    "Professor": "§f",
    "Attorney": "§e",
    "Wizzard": "§d",
    "Leader": "§4",
    "Medic": "§b",
    "CIA": "§f",
    "UIU FBI": "§g",
    "Professional_FIB": "§g",
    "Agency_Patrol_Military": "§f",
    "SWAT": "§1",
    "RAMBOO": "§a",
    "DEA": "§g",
    "Fugitive": "§e",
    "The Doctor": "§u§l",
    "Mafia": "§j",
    "Hitman": "§8",
    "Witch": "§5",
    "DeathBringer": "§4Death§8Bringer",
    "The Godfather": "§7",
    "Pirate": "§r",
    "Spy": "§3",
    "Phoveus": "§5Phov§deus",
    "Serpent_Hands": "§4",
    "Rippo": "§9",
    "Chaos_Insurgency": "§f",
    "Council_Hunter": "§7",
    "Haste_Paste": "§a",
    "Raider Seas": "§4Raider §bSeas",
    "Raider Sky": "§4Raider §7Sky",
    "Judge": "§f",
    "Lawyer": "§t",
    "Analyst": "§f",
    "Admin": "§l§d",
    "Admin+": "§l§9",
    "MOD": "§l§p",
    "Head_Admin": "§l§5",
    "Staff": "§a",
    "FBI": "§g",
    "Scripter": "§1",
    "Administrator": "§f",
    "DEV": "§l§g",
    "Creator": "§g",
    "Owner": "§e"
};

// Rank custom warna
const rankColorMap = {
    "Major": "§f",
    "Kopassus": "§f",
    "Agent": "§g",
    "Special_Agent": "§g",
    "Secret_Agent": "§g",
    "Double_Agent": "§g",
    "ASAC": "§g",
    "SAC": "§g",
    "Assistant_Director": "§g",
    "Officer": "§f",
    "Leuntnant": "§7",
    "Sea_Leuntnant": "§b",
    "Sky_Leuntnant": "§8",
    "Invi_Leuntnant": "§n",
    "Aero_Leuntnant": "§f",
    "Jendral": "§8",
    "Gargantua_Military": "§4Gargantua",
    "Private_Pilot": "§f",
    "Commercial_Pilot": "§f",
    "Airline_Transport_Pilot": "§f",
    "Commander_Gargantua_Military": "§6Commander §4Gargantua",
    "Military_Commander": "§6",
    "Commander": "§g",
    "Chieftain": "§g",
    "GrandMarshal": "§g",
    "Fire_Chieftain": "§v",
    "Fire_Leuntnant": "§v",
    "Sorcerer_Supreme": "§u",
    "Mafia_Boss": "§t",
    "Dark_DeathBringer": "§8Dark §4Death§8Bringer",
    "Gargantua_Mafia": "§6Gargantua §8Mafia",
    "Pirate_Commander": "§6",
    "Spy_Chieftain": "§6",
    "Black_DeathBringer": "§0Black §4Death§8Bringer",
    "Demon_DeathBringer": "§5Demon §4Death§8Bringer",
    "Dangerous_DeathBringer": "§6Dangerous §4Death§8Bringer",
    "Defacement_DeathBringer": "§rDefacement §4Death§8Bringer",
    "DeathBringer+": "§cDeath§8Bringer+",
    "KODB": "§l§gKO§4D§8B"
};

// List pengecualian role/rank yang sudah diformat manual
const formattedOverrides = {
    "Head Leader": "§eHead §4Leader",
    "Vice_GrandMarshal": "§gVice GrandMarshal      ",
    "GrandMarshal": "§gGrandMarshal       ",
    "The Godfather": "§7The Godfather      ",
    "Sergeant": "§8Sergeant",
    "DeathBringer": "§4Death§8Bringer",
    "DeathBringer+": "§cDeath§8Bringer+     ",
    "Phoveus": "§5Phov§deus",
    "Sorcerer_Supreme": "§uSorcerer Supreme       ",
    "Serpent_Hands": "§4Serpent Hands      ",
    "Chaos_Insurgency": "§fChaos Insurgency       ",
    "Council_Hunter": "§7Council Hunter     ",
    "Secret_Service": "§8Secret Service     ",
    "Deputy_Sheriff": "§tDeputy Sheriff     ",
    "Special_Agent": "§gSpecial Agent      ",
    "Secret_Agent": "§gSecret Agent       ",
    "Double_Agent": "§gDouble Agent       ",
    "Agency_Patrol_Military": "§fAgency Patrol      \nMilitary",
    "Haste_Paste": "§aHaste Paste",
    "Raider Seas": "§4Raider §bSeas",
    "Raider Sky": "§4Raider §7Sky",
    "Military_Commander": "§gCommander",
    "Pirate_Commander": "§gCommander",
    "Spy_Chieftain": "§gChieftain",
    "Gargantua_Military": "§4Gargantua",
    "Commander_Gargantua_Military": "§gCommander\n§4Gargantua",
    "Dark_DeathBringer": "§0Dark §4Death§8Bringer      ",
    "Gargantua_Mafia": "§4Gargantua",
    "Black_DeathBringer": "§0Black §4Death§8Bringer       ",
    "Demon_DeathBringer": "§5Demon §4Death§8Bringer       ",
    "Dangerous_DeathBringer": "§6Dangerous\n§4Death§8Bringer",
    "Defacement_DeathBringer": "§rDefacement\n§4Death§8Bringer",
    "Sea_Leuntnant": "§bSea Leuntnant      ",
    "Sky_Leuntnant": "§fSky Leuntnant      ",
    "Invi_Leuntnant": "§nInvi Leuntnant     ",
    "Aero_Leuntnant": "§fAero Leuntnant     ",
    "Mafia_Boss": "§tMafia Boss",
    "Admin": "§l§dADMIN",
    "Administrator": "§fAdministrator      ",
    "Admin+": "§9ADMIN+",
    "Head_Admin": "§l§5HEAD ADMIN",
    "Staff": "§aSTAFF",
    "KODB": "§l§gKO§4D§8B"
};

// Format Role
function formatRole(player) {
    const role = getRole(player);
    
    // Jika ada dalam override, pakai langsung
    if (formattedOverrides[role]) {
        return formattedOverrides[role];
    }

    // Jika tidak, pakai warna dari map dan ubah _ jadi \n
    return roleColorMap[role] 
        ? roleColorMap[role] + role.replace(/_/g, "\n") 
        : role.replace(/_/g, "\n");
}

// Format Rank
function formatRank(player) {
    const rank = getRank(player);

    if (formattedOverrides[rank]) {
        return formattedOverrides[rank];
    }

    return rankColorMap[rank] 
        ? rankColorMap[rank] + rank.replace(/_/g, "\n") 
        : rank.replace(/_/g, "\n");
}

// --- SCOREBOARD UTILS ---

function getScore(player, objective) {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (!obj) return 0;
        return obj.getScore(player.scoreboardIdentity) || 0;
    } catch {
        return 0;
    }
}

// --- ROLE / RANK ---

function getRole(player) {
    const tags = [
        "Military", "Pilot", "Warrent", "Raptor", "Pyro", "SpecOps", "Secret_Service",
        "Deputy_Sheriff", "Head Leader", "Vice_GrandMarshal", "Sergeant", "Sorcerer",
        "Professor", "Attorney", "Wizzard", "Leader", "Medic", "CIA", "UIU FBI", "Professional_FIB",
        "Agency_Patrol_Military", "SWAT", "RAMBOO", "DEA", "Fugitive", "The Doctor", "Mafia", "Hitman", "Witch", "DeathBringer",
        "The Godfather", "Pirate", "Spy", "Phoveus", "Serpent_Hands", "Rippo",
        "Chaos_Insurgency", "Council_Hunter", "Haste_Paste", "Raider Seas", "Raider Sky", "Judge", "Lawyer", "Analyst", "Admin", 
        "Admin+", "MOD", "Head_Admin", "Staff", "FBI",
        "Scripter", "Administrator", "DEV", "Creator", "Owner"
    ];
    return tags.find(t => player.hasTag(t)) || "-";
}

function getRank(player) {
    const tags = [
        "Major", "Kopassus", "Agent", "Special_Agent", "Secret_Agent", "Double_Agent", "ASAC", "SAC", "Assistant_Director", "Officer", "Leuntnant", "Sea_Leuntnant", "Sky_Leuntnant",
        "Invi_Leuntnant", "Aero_Leuntnant", "Jendral", "Gargantua_Military", "Private_Pilot", "Commercial_Pilot", "Airline_Transport_Pilot",
        "Commander_Gargantua_Military", "Military_Commander", "GrandMarshal", "Fire_Chieftain", "Commander", "Chieftain",
        "Fire_Leuntnant", "Sorcerer_Supreme", "Mafia_Boss", "Dark_DeathBringer", "Gargantua_Mafia", "Pirate_Commander",
        "Spy_Chieftain", "Black_DeathBringer", "Demon_DeathBringer", "Dangerous_DeathBringer",
        "Defacement_DeathBringer", "DeathBringer+", "KODB"
    ];
    return tags.find(t => player.hasTag(t)) || "-";
}

function isGoodTeam(role) {
    const good = ["Military", "Pilot", "Warrent", "Raptor", "Pyro", "SpecOps", "Secret_Service",
    "Deputy_Sheriff", "Head Leader", "Vice_GrandMarshal", "Sergeant", "Sorcerer",
    "Professor", "Attorney", "Wizzard", "Leader", "Medic", "CIA", "UIU FBI", "FBI", "DEA", "Professional_FIB",
    "Agency_Patrol_Military", "SWAT", "RAMBOO", "DEA"];
    return good.includes(role);
}

function isBadTeam(role) {
    const bad = ["Fugitive", "The Doctor", "Mafia", "Hitman", "Witch", "DeathBringer",
    "The Godfather", "Pirate", "Spy", "Phoveus", "Serpent_Hands", "Rippo",
    "Chaos_Insurgency", "Council_Hunter", "Haste_Paste", "Raider Seas", "Raider Sky"];
    return bad.includes(role);
}

// --- UPDATE PLAYTIME SETIAP DETIK ---

system.runInterval(() => {
    tickCount++;
    if (tickCount % tickInterval === 0) {
        for (const player of world.getPlayers()) {
            const key = `playtime_${player.id}`;
            let storedTime = parseInt(world.getDynamicProperty(key)) || 0;
            world.setDynamicProperty(key, storedTime + 1);
        }
    }
}, 1);

// --- EVENT KILL & DEATH ---

// Death/Kill detection
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
    if (deadEntity?.typeId !== "minecraft:player") return;

    const target = deadEntity;
    const killer = damageSource?.damagingEntity;
    if (!killer || killer.id === target.id) return;

    const killerName = `"${killer.name}"`;
    const targetName = `"${target.name}"`;

    killer.runCommandAsync(`scoreboard players add ${killerName} Kills 1`);
    killer.runCommandAsync(`scoreboard players add ${killerName} Money 50`);
    killer.runCommandAsync(`title ${killerName} actionbar §a+$50`);
    killer.runCommandAsync(`playsound random.orb ${killerName}`);
    killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 25`);
    target.runCommandAsync(`scoreboard players add ${targetName} Deaths 1`);

    const bounty = getScore(target, "Bounty");
    const killerRole = getRole(killer);
    const targetRole = getRole(target);

    if (isGoodTeam(killerRole) && isBadTeam(targetRole) && bounty > 0) {
        killer.runCommandAsync(`scoreboard players add ${killerName} Money ${bounty}`);
        world.scoreboard.getObjective("Bounty")?.setScore(target.scoreboardIdentity, 0);
        killer.sendMessage(`§aYou claimed $${formatMoney(bounty)} bounty from ${target.name}`);
        system.runTimeout(() => {
            target.runCommandAsync(`title ${targetName} actionbar §cYour bounty was claimed!`);
        }, 20); // 20 tick = 1 detik
    }

    if (["DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound mob.wither.spawn @s`);
        killer.runCommandAsync(`xp 3 ${killerName}`);
        killer.runCommandAsync(`particle minecraft:knockback_roar_particle ~~1.5~`);
        killer.runCommandAsync(`effect ${killerName} blindness 2 1 true`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §4Death§8Bringer§r! §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["GrandMarshal"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`xp 8 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 30000`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 29975`);
        killer.runCommandAsync(`playsound horn.call.4 @s`);
        killer.runCommandAsync(`particle minecraft:knockback_roar_particle ~~1.5~`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        world.sendMessage(`§gGrandMarshal§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gGrandMarshal§r! §b+8 XP§r & §a$30K Reward`);
            target.runCommandAsync(`effect ${targetName} resistance 2 3 true`);
            target.runCommandAsync(`effect ${targetName} absorption 3 4 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["KODB"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`xp 6 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 30000`);
        killer.runCommandAsync(`playsound mob.enderdragon.hit @s`);
        killer.runCommandAsync(`effect ${killerName} darkness 3 1 true`);
        killer.runCommandAsync(`damage ${killerName} 6 magic`);
        killer.runCommandAsync(`particle minecraft:knockback_roar_particle ~~1.5~`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        world.sendMessage(`§l§gKO§4D§8B§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} resistance 2 3 true`);
            target.runCommandAsync(`effect ${targetName} absorption 3 4 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §l§gKO§4D§8B§r! §b+6 XP§r & §a$30K Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Dark_DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound mob.wither.spawn @s`);
        killer.runCommandAsync(`playsound shriek.sculk_shrieker @s`);
        killer.runCommandAsync(`playsound mob.evocation_illager.prepare_attack @s`);
        killer.runCommandAsync(`effect ${killerName} blindness 3 4 true`);
        killer.runCommandAsync(`effect ${killerName} slowness 3 2 true`);
        killer.runCommandAsync(`particle minecraft:knockback_roar_particle ~~1.5~`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Black_DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound shriek.sculk_shrieker @s`);
        killer.runCommandAsync(`playsound mob.evocation_illager.prepare_attack @s`);
        killer.runCommandAsync(`effect ${killerName} blindness 3 2 true`);
        killer.runCommandAsync(`effect ${killerName} slowness 3 2 true`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`camera ${killerName} fade time 0.3 0.1 0.4 color 0 0 0`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Demon_DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound conduit.attack @s`);
        killer.runCommandAsync(`playsound mob.allay.idle @s`);
        killer.runCommandAsync(`playsound bloom.sculk_catalyst @s`);
        killer.runCommandAsync(`effect ${killerName} fatal_poison 10 5 true`);
        killer.runCommandAsync(`effect ${killerName} hunger 20 5 true`);
        killer.runCommandAsync(`effect ${killerName} oozing 15 5 true`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            target.runCommandAsync(`effect ${targetName} health_boost 3 5 true`);
            target.runCommandAsync(`effect ${targetName} instant_health 2 1 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Dangerous_DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound random.explode @s`);
        killer.runCommandAsync(`playsound random.fizz @s`);
        killer.runCommandAsync(`execute as @a[tag=Dangerous_DeathBringer] at @s run effect @a[tag=!Dangerous_DeathBringer,r=8,c=10] slowness 2 2 true`);
        killer.runCommandAsync(`execute as @a[tag=!Dangerous_DeathBringer,r=8] run damage @s 15 entity_explosion`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`particle minecraft:large_explosion ~ ~1 ~`);
        killer.runCommandAsync(`particle minecraft:huge_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`particle minecraft:smash_ground_particle_center ~ ~ ~`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Defacement_DeathBringer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`playsound random.levelup @s`);
        killer.runCommandAsync(`playsound shriek.sculk_shrieker @s`);
        killer.runCommandAsync(`playsound mob.evocation_illager.prepare_attack @s`);
        killer.runCommandAsync(`effect ${killerName} wither 3 3 true`);
        killer.runCommandAsync(`effect ${killerName} weakness 7 3 true`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:wax_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["DeathBringer+"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 7 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 4 3 true`);
            target.runCommandAsync(`effect ${targetName} health_boost 4 3 true`);
        }, 20); // 20 tick = 1 detik
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar Awesome! You killed §cDeath§8Bringer+§r §b+10 XP`);
        }, 60); // 60 tick = 3 detik
    }
    if (["Commander_Gargantua_Military"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 4 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §4Gargantua §gCommander§r! §b+4 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Military_Commander"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gCommander§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Pirate_Commander"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gPirate Commander§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Chieftain"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 1 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gChieftain§r! §b+1 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Spy_Chieftain"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §3Spy §gChieftain§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Gargantua_Military"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §4Gargantua§r! §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Gargantua_Mafia"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 4 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §6Gargantua §8Mafia§r! §b+4 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Mafia_Boss"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 6 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §tMafia Boss§r! §b+6 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Leader"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 6 ${killerName}`);
        killer.runCommandAsync(`playsound random.levelup ${killerName}`)
        killer.runCommandAsync(`playsound horn.call.4 @a`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 1000`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 975`);
        killer.runCommandAsync(`particle random.totem ~~1.5~`);
        world.sendMessage(`§4Leader§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar You killed §4Leader§r! §b+6 XP§r & §a$1K Reward`);
            target.runCommandAsync(`effect ${targetName} absorption 7 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Head Leader"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 6 ${killerName}`);
        killer.runCommandAsync(`playsound random.levelup ${killerName}`)
        killer.runCommandAsync(`playsound horn.call.4 @a`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 10000`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 9975`);
        killer.runCommandAsync(`particle random.totem ~~1.5~`);
        world.sendMessage(`§eHead §4Leader§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar You killed §eHead §4Leader§r! §b+6 XP§r & §a$10K Reward`);
            target.runCommandAsync(`effect ${targetName} absorption 7 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Leuntnant"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 1 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §7Leuntnant§r! §b+1 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Sea_Leuntnant"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Ocean! You killed §bSea Leuntnant§r §b+5 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Invi_Leuntnant"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Cool! You killed §nInvi Leuntnant§r §b+5 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Sky_Leuntnant"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Abort! You killed §fSky Leuntnant§r §b+5 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Aero_Leuntnant"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 6 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Whoosh! You killed §fAero Leuntnant§r §b+6 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Pyro"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:basic_flame_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Hot! You killed §vPyro§r §b+5 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["UIU FBI"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Unusual Feds! You killed §gUIU FBI§r §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["DEA"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gDEA§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["FBI"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar The Federales! You killed §gFBI§r §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["CIA"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Government Agency! You killed §fCIA§r §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Professional_FIB"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Cool! You killed §gProfessional FIB§r §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["RAMBOO"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Alululu! You killed §aRAMBOO§r §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Council_Hunter"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 4 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 100`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Leader very thankful for this!\nYou killed §7Council Hunter§r §b+4 XP§r & §a$100 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Hitman"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §8Hitman§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Witch"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §5Witch§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Sorcerer"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §1Sorcerer§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Sorcerer_Supreme"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 4 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            target.runCommandAsync(`effect ${targetName} regeneration 3 4 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §uSorcerer Supreme§r! §b+4 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Wizzard"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        killer.runCommandAsync(`particle random.totem ~~1.5~`);
        killer.runCommandAsync(`playsound random.levelup ${killerName}`)
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 200`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 175`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            target.runCommandAsync(`effect ${targetName} regeneration 3 4 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §dWizzard§r! §b+5 XP§r & §a$200 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Medic"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 60`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 35`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~~1~1`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~.7~1~.7`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~~1~-1`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~-.7~1~-.7`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~-1~1~`);
        killer.runCommandAsync(`particle minecraft:heart_particle ~.7~1~-.7`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            target.runCommandAsync(`effect ${targetName} regeneration 3 6 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §bMedic§r! §b+5 XP§r & §a$60 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["SWAT"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 30`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 5`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            target.runCommandAsync(`effect ${targetName} regeneration 3 4 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Tactical! You killed §1SWAT§r §b+3 XP§r & §a$30 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Raptor"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 5 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 300`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 275`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Sheesh! You killed §bRaptor§r §b+5 XP§r & §a$300 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["SpecOps"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 100`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 75`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Operation Failed! You killed §7SpecOps§r §b+3 XP§r & §a$100 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Secret_Service"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 150`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 125`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 1 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Very Secret! You killed §8Secret Service§r §b+3 XP§r & §a$150 Reward`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Spy"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar Cool! You killed §3Spy§r §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Phoveus"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 4 ${killerName}`);
        killer.runCommandAsync(`effect ${killerName} nausea`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §5Phov§deus§r! §b+4 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Serpent_Hands"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §4Serpent Hands§r! §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Rippo"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 2 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §9Rippo§r! §b+2 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Chaos_Insurgency"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §fChaos Insurgency§r! §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Haste_Paste"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 3 ${killerName}`);
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §aHaste Paste§r! §b+3 XP`);
        }, 20); // 20 tick = 1 detik
    }
    if (["The Godfather"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 7 ${killerName}`);
        killer.runCommandAsync(`playsound random.levelup ${killerName}`)
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 5000`);
        world.sendMessage(`§7The Godfather§r has fallen`);
        world.sendMessage(`§7The Godfather§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar You killed §7The Godfather§r! §b+7 XP§r & §a$5K Reward`);
            target.runCommandAsync(`effect ${targetName} absorption 4 2 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["The Doctor"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 7 ${killerName}`);
        killer.runCommandAsync(`playsound random.levelup ${killerName}`)
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 15000`);
        killer.runCommandAsync(`effect ${killerName} fatal_poison 6 5 true`);
        killer.runCommandAsync(`effect ${killerName} hunger 16 5 true`);
        killer.runCommandAsync(`effect ${killerName} oozing 6 5 true`);
        killer.runCommandAsync(`effect ${killerName} slowness 6 1 true`);
        killer.runCommandAsync(`effect ${killerName} mining_fatigue 6 3 true`);
        killer.runCommandAsync(`effect ${killerName} weakness 6 3 true`);
        killer.runCommandAsync(`effect ${killerName} wither 6 3 true`);
        killer.runCommandAsync(`effect ${killerName} nausea 6 3 true`);
        killer.runCommandAsync(`effect ${killerName} levitation 5 3 true`);
        killer.runCommandAsync(`execute as @a[tag=!The Doctor,r=8] run damage @s 15 magic`);
        killer.runCommandAsync(`particle minecraft:dragon_death_explosion_emitter ~ ~ ~`);
        world.sendMessage(`§u§lThe Doctor§r has fallen`);
        world.sendMessage(`§u§lThe Doctor§r has been eliminated by ${killer.name}`);
        system.runTimeout(() => {
            killer.runCommandAsync(`title ${killerName} actionbar You killed §u§lThe Doctor§r! §b+7 XP§r & §a$15K Reward`);
            target.runCommandAsync(`effect ${targetName} absorption 4 2 true`);
            target.runCommandAsync(`effect ${targetName} regeneration 20 5 true`);
        }, 20); // 20 tick = 1 detik
    }
    if (["Vice_GrandMarshal"].some(tag => target.hasTag(tag))) {
        killer.runCommandAsync(`xp 7 ${killerName}`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Money 3000`);
        killer.runCommandAsync(`scoreboard players add ${killerName} Bounty 2975`);
        world.sendMessage(`§gVice GrandMarshal§r has been eliminated by ${killer.name}`)
        system.runTimeout(() => {
            target.runCommandAsync(`effect ${targetName} absorption 3 2 true`);
            killer.runCommandAsync(`title ${killerName} actionbar You killed §gVice GrandMarshal§r! §b+7 XP§r & §a$3K Reward`);
        }, 20); // 20 tick = 1 detik
    }
});
// --- DISPLAY TIAP 0.85 DETIK ---

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const money = getScore(player, "Money");
        const kills = getScore(player, "Kills");
        const deaths = getScore(player, "Deaths");
        const bounty = getScore(player, "Bounty");
        const playtime = parseInt(world.getDynamicProperty(`playtime_${player.id}`)) || 0;

        const ping = Math.floor(Math.random() * 40 + 10);
        const region = "NA East";

        const title = {
            rawtext: [
                { text: `      ||§b§lBEKASI§r||           §r§d` },
                { text: `\n\n§fRole: ${formatRole(player)}§r` },
                { text: `\n§fRank: ${formatRank(player)}§r` },
                { text: `\n§fMoney: §a$${formatMoney(money)}` },
                { text: `\n§fKills:§c ${formatScore(kills)}` },
                { text: `\n§fDeaths:§6 ${formatScore(deaths)}` },
                { text: `\n§fPlaytime:§e ${formatPlaytime(playtime)}` },
                { text: `\n§fBounty: §c$${formatMoney(bounty)}` },
                { text: `\n\n§f${region} (§3${ping}ms§r)` }
            ]
        };

        player.runCommandAsync(`titleraw @s title ${JSON.stringify(title)}`);
    }
}, 17); // update tiap 0.85 detik
