import { world } from "@minecraft/server"; // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

const driveUI = new ActionFormData()
    .title("Driver License")
    .body("Select an option")
    .button("Show License")
    .button("Show To Player");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id) return;

    if (itemStack.typeId === "skill:card_drive") { // item dari BP project Scripts & Functions
        let res = await driveUI.show(source);
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showDriverLicense(source); break;
            case 1: showToPlayer(source); break;
        }
    }
});

function showDriverLicense(player, targetPlayer = null) {
    const storedData = world.getDynamicProperty(`ktp_${player.id}`);
    if (!storedData) {
        player.sendMessage("You're not set KTP yet");
        return;
    }

    const ktpData = JSON.parse(storedData);
    const classType = getDrivingClass(player);
    const hasPermit = player.hasTag("Driver_Permit");
    const status = hasPermit ? "ACTIVE" : "INACTIVE";

    let driverInfo = `DRIVING LICENSE\n\n` +
                     `CLASS: ${classType.toUpperCase()}\n` +
                     `NAME: ${ktpData.name.toUpperCase()}\n` +
                     `ADDRESS: ${ktpData.location.toUpperCase()}\n` +
                     `ID : ${ktpData.id}\n` +
                     `DOB: ${ktpData.dob}\n` +
                     `NATIONALITY: ${ktpData.nationality.toUpperCase()}\n` +
                     `EXP: 06/12/2030\n\n` +
                     `GENDER: ${ktpData.gender}\n` +
                     `HAIR: ${ktpData.hair}\n` +
                     `EYES: ${ktpData.eyes}\n` +
                     `HGT: ${ktpData.height}\n` +
                     `WGT: ${ktpData.weight}\n\n` +
                     `STATUS: ${status}\n`;

    let licenseUI = new ActionFormData()
        .title("Driver License")
        .body(driverInfo)
        .button("Close", "textures/ui/sign_text");    

    if (targetPlayer) {
        licenseUI.show(targetPlayer);
        player.sendMessage(`You showed your Driver License to ${targetPlayer.name}`);
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
        .body("Select a player to show your Driver License:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showDriverLicense(player, targetPlayer);
    });
}

function getDrivingClass(player) {
    const classTags = [
        { tag: "First_Class", label: "First Class" },
        { tag: "Executive_Class", label: "Executive Class" },
        { tag: "Class_A", label: "Class A" },
        { tag: "Class_B", label: "Class B" },
        { tag: "Class_C", label: "Class C" },
        { tag: "Class_D", label: "Class D" }
    ];

    for (const entry of classTags) {
        if (player.hasTag(entry.tag)) return entry.label;
    }

    return "None";
}

// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}