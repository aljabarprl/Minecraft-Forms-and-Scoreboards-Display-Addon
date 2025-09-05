import { world } from "@minecraft/server"; // modul server
import { ActionFormData } from "@minecraft/server-ui"; // modul server-ui

let badgeData = new Map(); // Menyimpan data sementara untuk CIA Badge

const ui = new ActionFormData()
    .title("Badge")
    .body("Select an option")
    .button("Show Badge")
    .button("Show To Player");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;
    if (!source || !source.id) return;

    if (itemStack.typeId === "skill:card_fbi") { // item dari BP project Scripts & Functions
        let res = await ui.show(source);
        if (res.canceled) return;

        switch (res.selection) {
            case 0: showBadge(source); break;
            case 1: showToPlayer(source); break;
        }
    }
});

// Button 1: Menampilkan CIA Badge
function showBadge(player, target = null) {
    let data = badgeData.get(player.id) || generateDefaultBadge(player);
    let targetName = target ? `Sent by: ${player.name}\n\n` : "";

    // Menentukan lembaga berdasarkan tag
    let agencyInfo = getAgencyInfo(player);

    let badgeInfo = `${agencyInfo.header}\n${agencyInfo.subHeader}\n\n` +
                    `${targetName}` +
                    `EMPLOYEE ID NO: ${data.idNumber}\n` +
                    `STATUS: ${data.status}\n` +
                    `${agencyInfo.field}\n\n` +
                    `${(data.agentLevel + " " + player.name).toUpperCase()}\n` +  // Huruf kapital semua
                    `ID CLASS: ${data.idClass}\n` +
                    `SECURITY CLEARANCE: LEVEL ${data.clearanceLevel}\n` +
                    `DIRECTOR: ${agencyInfo.director}\n` +
                    `EXP/ISS: 31/12/2040\n` +
                    `CB71/C014\n\n\n\n` +
                    `This certifies that the signature and photograph hereon is an appointed special agent is charged with duty of investigation violations of the laws.\n\n\n`;
                 
                    
    let form = new ActionFormData()
        .title("Badge ID")
        .body(badgeInfo)
        .button("Close", agencyInfo.texture);

    form.show(target || player);
}

// Button 2: Menunjukkan CIA Badge ke Pemain Lain
function showToPlayer(player) {
    let allPlayers = world.getPlayers().filter(p => 
        p.id !== player.id && distance(player, p) <= 2
    );

    if (allPlayers.length === 0) {
        player.sendMessage("No players nearby.");
        return;
    }

    let selectForm = new ActionFormData()
        .title("Show Badge to Player")
        .body("Select a player to show your Badge:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showBadge(player, targetPlayer);
        player.sendMessage(`You showed your Badge to ${targetPlayer.name}`);
    });
}

// Fungsi Membuat Data Default untuk CIA Badge
function generateDefaultBadge(player) {
    return {
        idNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
        status: player.hasTag("CIA") || player.hasTag("FBI") || player.hasTag("Professional_FIB") || player.hasTag("Secret_Service") || player.hasTag("DEA") || player.hasTag("UIU_FBI") ? "ACTIVE" : "OFF-DUTY",
        agentLevel: getAgentLevel(player),
        idClass: generateIdClass(),
        clearanceLevel: getClearanceLevel(player),
    };
}

// Fungsi Menentukan Level Agen berdasarkan Tag
function getAgentLevel(player) {
    if (player.hasTag("Assistant_Director")) return "Assistant Director";
    if (player.hasTag("SAC")) return "SAC";
    if (player.hasTag("ASAC")) return "ASAC";
    if (player.hasTag("Double_Agent")) return "Double Agent";
    if (player.hasTag("Secret_Agent")) return "Secret Agent";
    if (player.hasTag("Special_Agent")) return "Special Agent";
    if (player.hasTag("Agent")) return "Agent";
    return "Non-Agent";
}

// Fungsi Menentukan Level Keamanan berdasarkan Rank
function getClearanceLevel(player) {
    if (player.hasTag("Assistant_Director")) return 5;
    if (player.hasTag("SAC")) return 5;
    if (player.hasTag("ASAC")) return 5;
    if (player.hasTag("Double_Agent")) return 4;
    if (player.hasTag("Secret_Agent")) return 4;
    if (player.hasTag("Special_Agent")) return 3;
    if (player.hasTag("Agent")) return 2;
    return 1; // Jika tidak memiliki rank, dianggap level clearance paling rendah
}

// Fungsi Membuat ID CLASS Acak dengan 9 Digit
function generateIdClass() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    let part1 = "";
    for (let i = 0; i < 3; i++) part1 += letters.charAt(Math.floor(Math.random() * letters.length));
    let part2 = letters.charAt(Math.floor(Math.random() * letters.length));
    let part3 = "";
    for (let i = 0; i < 9; i++) part3 += numbers.charAt(Math.floor(Math.random() * numbers.length));

    return `${part1}-${part2}-${part3}`;
}

// Fungsi Menentukan Informasi Badge berdasarkan Lembaga
function getAgencyInfo(player) {
    if (player.hasTag("FBI")) {
        return {
            header: "FEDERAL BUREAU OF INVESTIGATION",
            subHeader: "FEDERAL GOVERNMENT AGENCY - PLANT A+.",
            field: "FBI FIELD",
            director: "ROBERT LAWRENCE",
            texture: "textures/ui/fbi_text"
        };
    }
    if (player.hasTag("Professional_FIB")) {
        return {
            header: "FEDERAL BUREAU OF INVESTIGATION",
            subHeader: "FEDERAL GOVERNMENT AGENCY - PLANT SS+.",
            field: "PROFESSIONAL FIB FIELD",
            director: "ROBERT LAWRENCE",
            texture: "textures/ui/pro_fib_text"
        };
    }
    if (player.hasTag("UIU_FBI")) {
        return {
            header: "FEDERAL BUREAU OF INVESTIGATION",
            subHeader: "UNUSUAL INCIDENTS UNIT",
            field: "UIU FBI FIELD",
            director: "J.EDGAR HOOVER",
            texture: "textures/ui/uiu_fbi_text"
        };
    }
    if (player.hasTag("DEA")) {
        return {
            header: "DRUG ENFORCEMENT ADMINISTRATION",
            subHeader: "FEDERAL LAW ENFORCEMENT AGENCY",
            field: "DEA FIELD",
            director: "HANK SCHRADER",
            texture: "textures/ui/dea_text"
        };
    }
    if (player.hasTag("Secret_Service")) {
        return {
            header: "SECRET SERVICE",
            subHeader: "SECRET GOVERMENT AGENCY OF PRESIDENTIONAL EVENT",
            field: "SECRET SERVICE FIELD",
            director: "MIKE TORENO",
            texture: "textures/ui/ss_text"
        };
    }
    // Default ke CIA
    return {
        header: "CENTRAL INTELLIGENCE AGENCY",
        subHeader: "INTELLIGENCE SERVICE OF FEDERAL GOVERMENT",
        field: "CIA FIELD",
        director: "STEVEN HAINES",
        texture: "textures/ui/cia_text"
    };
}

// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
