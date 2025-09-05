import { world } from "@minecraft/server";  // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

const weaponUI = new ActionFormData()
    .title("Firearms License")
    .body("Select an option")
    .button("Show License")
    .button("Show To Player")
    .button("Apply Permit");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id) return;

    if (itemStack.typeId === "skill:card_weapon") { // item dari BP project Scripts & Functions
        let res = await weaponUI.show(source);
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showFirearmsLicense(source); break;
            case 1: showToPlayer(source); break;
            case 2: applyPermit(source); break;
        }
    }
});

function showFirearmsLicense(player, targetPlayer = null) {
    const storedData = world.getDynamicProperty(`ktp_${player.id}`);
    if (!storedData) {
        player.sendMessage("You're not set KTP yet");
        return;
    }

    const ktpData = JSON.parse(storedData);

    // Nama & Status
    const status = hasGunPermit(player) ? "ACTIVE" : "NON-REGISTERED";
    const weaponList = getWeaponList(player);
    
    let weaponinfo =`INDONESIAN FIREARMS LICENSE\nPOSSESION ONLY\n\n` +
                    `NAME: ${ktpData.name.toUpperCase()}\n` +
                    `NUMBER: ${ktpData.id}\n` +
                    `ADDRESS: ${ktpData.location.toUpperCase()}\n` +
                    `DOB: ${ktpData.dob}\n` +
                    `NATIONALITY: ${ktpData.nationality.toUpperCase()}\n` +
                    `GENDER: ${ktpData.gender}\n` +
                    `HAIR: ${ktpData.hair}\n` +
                    `EYES: ${ktpData.eyes}\n` +
                    `HGT: ${ktpData.height}\n` +
                    `WGT: ${ktpData.weight}\n\n` +
                    `STANDARD\nCONDITIONS ARE ATTACHED\nTO THIS LICENSE\n` +
                    `LICENSED WEAPONS:\n${weaponList.toUpperCase()}\n` +
                    `ISSUED BY: POLICE DEPARTMENT\n` +
                    `STATUS: ${status}\n` +
                    `EXP/ISS: 20/10/2045\n\n`;

    let licenseUI = new ActionFormData()
        .title("Firearms License")
        .body(weaponinfo)
        .button("Close", "textures/ui/sign_text");    

    if (targetPlayer) {
        licenseUI.show(targetPlayer);
        player.sendMessage(`You showed your Firearms License to ${targetPlayer.name}`);
    } else {
        licenseUI.show(player);
    }
}

function showToPlayer(player) {
    let allPlayers = world.getPlayers().filter(p => 
        p.id !== player.id && distance(player, p) <= 2
    );

    if (allPlayers.length === 0) {
        player.sendMessage("No players nearby.");
        return;
    }

    let selectForm = new ActionFormData()
        .title("Show License to Player")
        .body("Select a player to show your Firearms License:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showFirearmsLicense(player, targetPlayer);
    });
}
  
// Cek apakah pemain memiliki tag izin senjata
function hasGunPermit(player) {
    return player.hasTag("gun_permit");
}
  
// Format daftar senjata
// Ambil daftar senjata yang sudah di-ACC oleh polisi
function getWeaponList(player) {
    let approvedWeaponsRaw = world.getDynamicProperty(`weapon_approved_${player.id}`);
    let weaponList = "None";

    if (approvedWeaponsRaw) {
        try {
            let approvedWeapons = JSON.parse(approvedWeaponsRaw);
            weaponList = approvedWeapons.length > 0
                ? approvedWeapons.map(w => `- ${w.name.split(":")[1].replace(/_/g, " ").toUpperCase()} (${w.category})`).join("\n")
                : "None";
        } catch (e) {
            weaponList = "None";
        }
    }

    return weaponList;
}

function getWeaponItems(player) {
    const inventory = player.getComponent("inventory").container;
    const found = [];
  
    const weaponTypes = {
      melee: [
        "minecraft:wooden_sword", "minecraft:stone_sword", "minecraft:iron_sword", "skill:battle_axe_limitless", "skill:battle_axe_hydro",
        "minecraft:golden_sword", "minecraft:diamond_sword", "minecraft:netherite_sword", "skill:emerald_sword", "skill:lapis_sword", "skill:amethyst_sword", 
        "skill:obsidian_sword", "skill:dark_sword", "skill:glowing_sword", "skill:flaming_sword", "skill:azrael_blade", "skill:katana", "skill:ultimate_emerald_sword",
        "skill:ultimate_diamond_sword", "skill:battle_axe_iron", "skill:ruby_sword", "skill:battle_axe_astral", "skill:battle_hamma", "skill:battle_axe_fire",
        "skill:battle_axe_blast", "skill:battle_axe_diamond", "skill:battle_hamma_fire", "skill:sakura_sword", "skill:thunder_sword", "skill:battle_axe_heaven"
      ],
      projectile: [
        "minecraft:bow", "minecraft:crossbow", "minecraft:splash_potion",
        "minecraft:lingering_potion", "minecraft:fire_charge", "minecraft:wind_charge"
      ],
      semiProjectile: [
        "minecraft:trident"
      ],
      biologics: [
        "minecraft:poisonous_potato", "minecraft:pufferfish", "skill:battle_axe_emerald", "minecraft:suspicious_stew"
      ],
      explosive: [
        "minecraft:end_crystal",
        "minecraft:tnt",
        "minecraft:respawn_anchor"
      ]
    };
  
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;
  
      for (const [category, list] of Object.entries(weaponTypes)) {
        if (list.includes(item.typeId)) {
          found.push({ name: item.typeId, type: category });
          break;
        }
      }
    }
  
    return found;
}
//
function applyPermit(player) {
    const weaponItems = getWeaponItems(player);

    if (weaponItems.length === 0) {
        player.sendMessage("§cTidak ada senjata yang tersedia untuk diajukan.");
        return;
    }

    const form = new ActionFormData()
        .title("Apply Weapon Permit")
        .body("Pilih senjata dari inventory untuk diajukan:");

    weaponItems.forEach(w => {
        const formatted = w.name.split(":")[1].replace(/_/g, " ").toUpperCase();
        form.button(`${formatted} (${w.category})`);
    });

    form.show(player).then(res => {
        if (res.canceled) return;

        const selected = weaponItems[res.selection];
        if (!selected) return;

        // Ambil daftar sebelumnya (kalau ada)
        const key = `weapon_request_${player.id}`;
        let stored = world.getDynamicProperty(key);
        let permitList = [];

        if (stored) {
            try {
                permitList = JSON.parse(stored);
            } catch {
                permitList = [];
            }
        }

        // Hindari duplikat
        if (permitList.some(p => p.name === selected.name)) {
            player.sendMessage("§eSenjata ini sudah ada di daftar pengajuan Anda.");
            return;
        }

        // Tambah dan simpan
        permitList.push(selected);
        world.setDynamicProperty(key, JSON.stringify(permitList));

        const readable = selected.name.split(":")[1].replace(/_/g, " ").toUpperCase();
        player.sendMessage(`§aIzin senjata untuk '${readable}' telah diajukan!`);
    });
}
  
// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}