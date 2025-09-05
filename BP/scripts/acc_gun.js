import { world } from "@minecraft/server"; // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

const PERMIT_ITEM = "skill:acc_permit"; // item dari BP project Scripts & Functions

// Fungsi hitung jarak antar pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id || itemStack.typeId !== PERMIT_ITEM) return;

    let nearbyPlayers = world.getPlayers().filter(p => 
        p.id !== source.id && distance(p, source) <= 2
    );

    if (nearbyPlayers.length === 0) {
        source.sendMessage("§cNo players nearby to process permit.");
        return;
    }

    const targetPlayer = nearbyPlayers[0];

    const form = new ActionFormData()
        .title("Permit Review")
        .body(`Process permit for:\n§e${targetPlayer.name}`)
        .button("Accept Permit")
        .button("Decline Permit")
        .button("Remove Permit");

    const res = await form.show(source);
    if (res.canceled) return;

    switch (res.selection) {
        case 0: { // Accept Permit (dengan selector)
            let weaponDataRaw = world.getDynamicProperty(`weapon_request_${targetPlayer.id}`);
            if (!weaponDataRaw) {
                source.sendMessage("§cNo permit request found.");
                return;
            }

            let weaponData;
            try {
                weaponData = JSON.parse(weaponDataRaw);
            } catch {
                source.sendMessage("§cFailed to read permit data.");
                return;
            }

            if (weaponData.length === 0) {
                source.sendMessage("§eNo weapons to approve.");
                return;
            }

            const selectForm = new ActionFormData()
                .title("Approve Weapon")
                .body(`Select weapon to approve:\n§e${targetPlayer.name}`);
            
            weaponData.forEach(w => {
                const name = w.name?.split(":")[1]?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";
                const type = w.category || w.type || "UNKNOWN";
                selectForm.button(`${name} (${type})`);
            });

            const selRes = await selectForm.show(source);
            if (selRes.canceled) return;

            const selectedWeapon = weaponData[selRes.selection];
            if (!selectedWeapon) return;

            let approvedRaw = world.getDynamicProperty(`weapon_approved_${targetPlayer.id}`);
            let approvedList = [];

            if (approvedRaw) {
                try {
                    approvedList = JSON.parse(approvedRaw);
                } catch {
                    approvedList = [];
                }
            }

            approvedList.push(selectedWeapon);
            world.setDynamicProperty(`weapon_approved_${targetPlayer.id}`, JSON.stringify(approvedList));
            targetPlayer.addTag("gun_permit");

            const readable = selectedWeapon.name.split(":")[1].replace(/_/g, " ").toUpperCase();
            source.sendMessage(`§aApproved '${readable}' for ${targetPlayer.name}.`);
            targetPlayer.sendMessage(`§aYour firearms permit for '${readable}' was approved!`);

            break;
        }

        case 1: { // Decline
            source.sendMessage(`§cYou declined ${targetPlayer.name}'s permit.`);
            targetPlayer.sendMessage(`§cYour firearms permit was declined.`);
            break;
        }

        case 2: { // Remove (pilih senjata)
            let rawData = world.getDynamicProperty(`weapon_approved_${targetPlayer.id}`);
            if (!rawData) {
                source.sendMessage("§eThis player has no approved weapons.");
                return;
            }

            let approvedWeapons;
            try {
                approvedWeapons = JSON.parse(rawData);
            } catch {
                source.sendMessage("§cFailed to read permit data.");
                return;
            }

            if (approvedWeapons.length === 0) {
                source.sendMessage("§eNo weapons to revoke.");
                return;
            }

            const revokeForm = new ActionFormData()
                .title("Revoke Weapon")
                .body(`Select weapon to revoke from:\n§e${targetPlayer.name}`);

            approvedWeapons.forEach(w => {
                const name = w.name?.split(":")[1]?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";
                const type = w.category || w.type || "UNKNOWN";
                revokeForm.button(`${name} (${type})`);
            });

            const revokeRes = await revokeForm.show(source);
            if (revokeRes.canceled) return;

            const selected = approvedWeapons[revokeRes.selection];
            if (!selected) return;

            const updated = approvedWeapons.filter(w => w.name !== selected.name);
            world.setDynamicProperty(`weapon_approved_${targetPlayer.id}`, JSON.stringify(updated));

            const readable = selected.name.split(":")[1].replace(/_/g, " ").toUpperCase();
            source.sendMessage(`§cRevoked '${readable}' from ${targetPlayer.name}.`);
            targetPlayer.sendMessage(`§cYour weapon permit for '${readable}' has been revoked.`);

            if (updated.length === 0) {
                targetPlayer.removeTag("gun_permit");
                source.sendMessage(`§eNo more weapons permitted. Tag 'gun_permit' removed.`);
            }

            break;
        }
    }
});