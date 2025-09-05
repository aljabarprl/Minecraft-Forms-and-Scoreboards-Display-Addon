import { world, system } from "@minecraft/server";

const cooldowns = new Map(); // Cooldown normal (5 detik)
const cooldownsSneak = new Map(); // Cooldown jongkok (5 detik)

const COOLDOWN_TIME_NORMAL = 5000; // 5 detik
const COOLDOWN_TIME_SNEAK = 5000; // 5 detik
const ITEM_ID = "skill:velocium"; // item dari BP project Scripts & Functions

// Event saat item digunakan
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    const now = Date.now();

    if (item.typeId === ITEM_ID) {
        const isSneaking = player.isSneaking;

        // Pilih cooldown berdasarkan kondisi jongkok atau tidak
        const cooldownMap = isSneaking ? cooldownsSneak : cooldowns;
        const cooldownTime = isSneaking ? COOLDOWN_TIME_SNEAK : COOLDOWN_TIME_NORMAL;

        // Ambil waktu terakhir pemakaian
        const lastUse = cooldownMap.get(player.name) || 0;

        if (now - lastUse < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
            
            // Format teks sesuai jenis cooldown
            const cooldownText = isSneaking 
                ? `CD: ${remainingTime}`
                : `CD: ${remainingTime}`;

            player.sendMessage(`⏳ ${cooldownText}`);
            
            // Jalankan countdown di chat
            startCooldownCountdown(player, cooldownTime - (now - lastUse), isSneaking);
            return;
        }

        // Set cooldown baru
        cooldownMap.set(player.name, now);

        if (isSneaking) {
            // **Skill Ultimate
            player.runCommand("execute as @p run function velocium_skill");
        } else {
            // **Skill Biasa
            player.runCommand("execute as @p run function velocium_skill");
        }

        // Jalankan countdown di action bar
        startCooldownCountdown(player, cooldownTime, isSneaking);
    }
});

// **Fungsi untuk countdown di action bar (dari 5 ke 0 atau 50 ke 0)**
function startCooldownCountdown(player, cooldownTime, isSneaking) {
    let remainingSeconds = Math.ceil(cooldownTime / 1000);

    const interval = setInterval(() => {
        const heldItem = player.getComponent("minecraft:equippable")?.getEquipment("mainhand")?.typeId;

        if (remainingSeconds > 0 && heldItem === ITEM_ID) {
            const countdownText = isSneaking 
                ? `Cooldown Ultimate: ${remainingSeconds}`
                : `Cooldown: ${remainingSeconds}`;

            player.runCommand(`title @s actionbar ${countdownText}`);
            remainingSeconds--;
        } else {
            clearInterval(interval); // Hentikan loop saat cooldown habis atau item diganti
        }
    }, 1000); // Update setiap 1 detik
}