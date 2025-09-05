import { world, system } from "@minecraft/server"; // modul server

system.runInterval(() => { 
    for (const player of world.getPlayers()) {
        const inventory = player.getComponent("minecraft:inventory").container; // mengecek iventory player

        for (let i = 0; i < inventory.size; i++) { // mengecek apakah player memiliki item nya
            const item = inventory.getItem(i);
            if (!item) continue;

            if (item.typeId === "skill:card_ktp") { // menentukan lore yang sesuai dengan item id (item dari BP project Scripts & Functions)
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this card for personal identification\ncivilian constitutional rights"]); // isi text lore nya
                    inventory.setItem(i, item); // menaruh item ke inventory
                }
            }

            if (item.typeId === "skill:card_pilot") {   
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for aviation authorization\ncertifying the right to operate aircraft safely"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_red") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Authorized access departure from restricted areas\n§r§5Authorized Personel Only"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_green") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Authorized access to restricted areas\n§r§5Authorized Personel Only"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_fbi") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Badge insignia of special agents\ngranting authority for classified operations"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:police_badge") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Badge for law enforcement identification\ngranting authority to uphold public order"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:detective_badge") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Badge for investigative identification\npermitting access to case-sensitive information"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:military_badge") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Badge for military identification\nconfirming rank and operational clearance"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:velocium") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Super Speed"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:aerofero") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Aerokinesis"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:flamverto") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Pyrokinesis"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:aquarius") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Hydrokinesis"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:limitless") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Limitless"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:sanatio") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Healness"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:life_drain") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Lifekinesis"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:tenebris") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Nightness"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:luminis") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of Sunrises"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:angelic") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of §r§gHeavenly"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:gabriel_horn") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of §r§gHeavenly\n§r§9+Can Resurrect The Dead\n§r§9+Slowdown Entities\n§r§9+Truth Telling\n\n§r§5Horn of Truth is an\nangelic instrument created by God"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:sandalphon_crown") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Ability Of §r§gHeavenly\n§r§9+Divine Harmonization\n§r§9+Stun Entities\n§r§9+Ascension\n\n§r§5Crown of Harmony is a melodies\nof the heavens created by God"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:flaming_sword") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Can Burning Eternally"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:battle_axe_heaven") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Pasif Effect §r§gHeavenly"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:battle_axe_limitless") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9+Pasif Effect §r§uDarkness"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_badge") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Unused FBI Badge"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_weapon") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for legal firearm possession\ngranting the right to own and carry firearms"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_lawyer") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for legal practice authorization\ncertifying knowledge of statutory law"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_attorney") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for legal practice authorization\ncertifying knowledge of statutory law"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_judge") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for judicial authorization\nempowering legal decision-making in court"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:card_drive") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this license for authorized vehicle operation"]);
                    inventory.setItem(i, item);
                }
            }

            if (item.typeId === "skill:acc_permit") {
                const lore = item.getLore();
                if (lore.length === 0) {
                    item.setLore(["§r§9Use this permit for authorized firearm access\n§r§5Authorized Personel Only"]);
                    inventory.setItem(i, item);
                }
            }
        }
    }
}, 20); // update setiap 1 detik
