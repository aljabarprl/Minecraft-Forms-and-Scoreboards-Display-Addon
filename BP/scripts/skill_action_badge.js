import { world, system } from "@minecraft/server"; // modul server

const cooldowns = new Map(); // 
const cooldownsSneak = new Map(); // 

// Script untuk menjalankan animasi ketika item di gunakan

const COOLDOWN_TIME_NORMAL = 4000; // 4 detik
const COOLDOWN_TIME_SNEAK = 4000; // 4 detik
const ITEM_ID = [ // item dari BP project Scripts & Functions
    "skill:police_badge",
    "skill:military_badge",
    "skill:detective_badge"
];

// Event saat item digunakan
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    const now = Date.now();

    if (!ITEM_ID.includes(item.typeId)) return; {
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
            
            // Jalankan countdown di action bar
            startCooldownCountdown(player, cooldownTime - (now - lastUse), isSneaking);
            return;
        }

        // Set cooldown baru
        cooldownMap.set(player.name, now);

        player.runCommand("execute as @p run function badge");
        system.runTimeout(() => {
            player.runCommand("execute as @p run function badge_done");
        }, 60); // 60 tick = 3 detik

        if (isSneaking) {
            player.runCommand("execute as @p run function badge");
            // 
            system.runTimeout(() => {
                player.runCommand("execute as @p run function badge_done");
            }, 60); // 60 tick = 3 detik
        }

        // Jalankan countdown di action bar
        startCooldownCountdown(player, cooldownTime, isSneaking);
    }
});

// Fungsi untuk countdown di action bar (dari 5 ke 0 atau 50 ke 0)
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