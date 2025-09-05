import { world } from "@minecraft/server"; // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

const judgeUI = new ActionFormData()
    .title("Judge License")
    .body("Select an option")
    .button("Show License")
    .button("Show To Player");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id) return;

    if (itemStack.typeId === "skill:card_judge") { // item dari BP project Scripts & Functions
        let res = await judgeUI.show(source);
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showJudgeLicense(source); break;
            case 1: showToPlayer(source); break;
        }
    }
});

function showJudgeLicense(player, targetPlayer = null) {
    const storedData = world.getDynamicProperty(`ktp_${player.id}`);
    if (!storedData) {
        player.sendMessage("You're not set KTP yet");
        return;
    }

    const ktpData = JSON.parse(storedData);
    const hasTag = player.hasTag("Judge");
    const displayName = hasTag ? `JUDGE ${ktpData.name.toUpperCase()}` : ktpData.name.toUpperCase();
    const status = hasTag ? "ACTIVE" : "INACTIVE";

    let judgeInfo = `THE STATE BAR OF INDONESIAN\n\n` +
                    `NAME: ${displayName}\n` +
                    `ADDRESS: ${ktpData.location.toUpperCase()}\n` +
                    `LICENSE #${ktpData.id}\n` +
                    `DOB: ${ktpData.dob}\n` +
                    `EXP: 29/12/2055\n` +
                    `CLASS: ARBITRATOR\n` +
                    `RSTR: SASS\n\n` +
                    `GENDER: ${ktpData.gender}\n` +
                    `HAIR: ${ktpData.hair}\n` +
                    `EYES: ${ktpData.eyes}\n` +
                    `HGT: ${ktpData.height}\n` +
                    `WGT: ${ktpData.weight}\n\n` +
                    `STATUS: ${status}\n` +
                    `This license entitles the bearer the ability to declare judgement upon friends and family with sass and vigor.\n\n\n`;

    let licenseUI = new ActionFormData()
        .title("Judge License")
        .body(judgeInfo)
        .button("Close", "textures/ui/sign_text");    

    if (targetPlayer) {
        licenseUI.show(targetPlayer);
        player.sendMessage(`You showed your Judge License to ${targetPlayer.name}`);
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
        .body("Select a player to show your Judge License:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showJudgeLicense(player, targetPlayer);
    });
}

// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}