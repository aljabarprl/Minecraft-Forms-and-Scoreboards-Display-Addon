import { world } from "@minecraft/server"; // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

const pilotUI = new ActionFormData()
    .title("Pilot License")
    .body("Select an option")
    .button("Show License")
    .button("Show To Player");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id) return;

    if (itemStack.typeId === "skill:card_pilot") { // item dari BP project Scripts & Functions
        let res = await pilotUI.show(source);
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showPilotLicense(source); break;
            case 1: showToPlayer(source); break;
        }
    }
});

function showPilotLicense(player, targetPlayer = null) {
    const storedData = world.getDynamicProperty(`ktp_${player.id}`);
    if (!storedData) {
        player.sendMessage("You're not set KTP yet");
        return;
    }

    const ktpData = JSON.parse(storedData);

    const pilotRank = getPilotRank(player);
    const role = getPlayerRole(player);

    // Nama & Status
    const displayName = role === "Pilot" ? `CAPTAIN ${ktpData.name.toUpperCase()}` : ktpData.name.toUpperCase();
    let status = "OFF-DUTY";
    let rankCode = "";

    if (role === "Pilot") {
        status = "ACTIVE";
        if (pilotRank === "Private Pilot") rankCode = "PPL";
        else if (pilotRank === "Commercial Pilot") rankCode = "CPL";
        else if (pilotRank === "Airline Transport Pilot") rankCode = "ATPL";
        status += ` - ${rankCode}`;
    }

    let pilotInfo = `INDONESIAN\nDEPARTMENT OF TRANSPORTATION\nFEDERAL AVIATION ADMINISTRATION\n\n` +
                    `NAME: ${displayName}\n` +
                    `ADDRESS: ${ktpData.location.toUpperCase()}\n` +
                    `NATIONALITY: ${ktpData.nationality.toUpperCase()}\n` +
                    `DOB: ${ktpData.dob}\n\n` +
                    `HAS BEEN FOUND TO BE PROPERLY QUALIFIED FOR THE PRIVILEGES OF:\n` +
                    `${pilotRank.toUpperCase()}\n` +
                    `CERTIFICATE NUMBER: ${ktpData.id}\n` +
                    `DATE OF ISSUE: APR 2015\n\n` +
                    `GENDER: ${ktpData.gender}\n` +
                    `HAIR: ${ktpData.hair}\n` +
                    `EYES: ${ktpData.eyes}\n` +
                    `HGT: ${ktpData.height}\n` +
                    `WGT: ${ktpData.weight}\n\n` +
                    `STATUS: ${status}\n` +
                    `EXP/ISS: 31/12/2040\n\n`;

    let licenseUI = new ActionFormData()
        .title("Pilot License")
        .body(pilotInfo)
        .button("Close", "textures/ui/sign_text");    

    if (targetPlayer) {
        licenseUI.show(targetPlayer);
        player.sendMessage(`You showed your Pilot License to ${targetPlayer.name}`);
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
        .body("Select a player to show your Pilot License:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showPilotLicense(player, targetPlayer);
    });
}

function getPilotRank(player) {
    if (player.hasTag("Airline_Transport_Pilot")) return "Airline Transport Pilot";
    if (player.hasTag("Commercial_Pilot")) return "Commercial Pilot";
    if (player.hasTag("Private_Pilot")) return "Private Pilot";
    return "Non-Pilot";
}

function getPlayerRole(player) {
    const goodRoles = ["Pilot"];
    return goodRoles.find(tag => player.hasTag(tag)) || "None";
}
  
// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}