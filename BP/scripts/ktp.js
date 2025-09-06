import { world } from "@minecraft/server"; // modul server
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui"; // modul server

let playerData = new Map(); // Menyimpan data pemain sementara

// KTP Forms
const ui = new ActionFormData()
    .title("Identity Card")
    .body("Select an option")
    .button("Show Identity")
    .button("Input Data")
    .button("Show to Player")
    .button("Instructions");

// Custom UI Forms Credit to @Dingsel for the assets
const customUi = new ActionFormData()
    .title("Custom Form")
    .body("Select Something Here")
    .button("Rewards", "textures/ui/promo_holiday_gift_small")
    .button("Shop", "textures/ui/icon_deals")
    .button("Ban Tool", "textures/ui/hammer_l")
    .button("Skins", "textures/ui/icon_hangar");

world.afterEvents.itemUse.subscribe(async (event) => {
    const { source, itemStack } = event;

    if (!source || !source.id) return;

    switch (itemStack.typeId) {
        // trigger forms dengan item "Identification Card"
        case "skill:card_ktp": {
            let res = await ui.show(source);
            if (res.canceled) return;

            switch (res.selection) {
                case 0: showIdentity(source); break;
                case 1: inputData(source); break;
                case 2: showToPlayer(source); break;
                case 3: showInstructions(source); break;
            }
            break;
        }
        // trigger forms dengan item "Clock"
        case "minecraft:clock": {
            const res = await customUi.show(source);
            res.selection;
            world.sendMessage(`Button ${res.selection} Has Been Pressed!`);
            break;
        }
    }
});

// Button 1: Menampilkan Identitas Pemain (ActionForm)
function showIdentity(player, target = null) {
    let storedData = world.getDynamicProperty(`ktp_${player.id}`);
    let data = storedData ? JSON.parse(storedData) : playerData.get(player.id) || generateDefaultIdentity(player);
    let targetName = target ? `Sent by: ${player.name}\n\n` : "";

    let job = getJob(player) || "None";   // Ambil dari tag, jika tidak ada pakai "None"
    let role = getRole(player) || "None"; // Ambil dari tag, jika tidak ada pakai "None"
    let rank = getRank(player) || "None"; // Ambil dari tag, jika tidak ada pakai "None"

    let idCard = `INDONESIAN\n\n` +
                 `${targetName}` +
                 `Nationality : ${data.nationality}\n` +
                 `ID : ${data.id}\n` +
                 `Name : ${data.name}\n` +
                 `Location : ${data.location}\n` +
                 `DOB : ${data.dob}\n` +
                 `Gender : ${data.gender}\n` +
                 `Hair : ${data.hair}\n` +
                 `Eyes : ${data.eyes}\n` +
                 `HGT : ${data.height}\n` +
                 `WGT : ${data.weight}\n` +
                 `RSTR : ${data.restriction}\n` +
                 `Exp/ISS : ${data.expiration}\n\n` +
                 `Job  : ${job}\n` +   
                 `Role : ${role}\n` +  
                 `Rank : ${rank}\n`; 

    // Kategori tim
    if (isGoodTeam(data.role)) idCard += `\n[Good Team]\n\n`;
    if (isBadTeam(data.role)) idCard += `\n[Bad Team]\n\n`;

    let form = new ActionFormData()
        .title("Identity Card")
        .body(idCard)
        .button("Close");

    form.show(target || player);
}

// Button 2: Memasukkan Data Identitas (Modalform)
function inputData(player) {
    let defaultData = playerData.get(player.id) || generateDefaultIdentity(player);

    let form = new ModalFormData()
        .title("Input Your Data")
        .textField("ID", "", defaultData.id)
        .textField("Name", "", defaultData.name)
        .textField("Location", "xxxx xxxx xxxx", defaultData.location)
        .textField("DOB (DD/MM/YYYY)", "xx/xx/199x", defaultData.dob)
        .dropdown("Gender", ["M", "F"], defaultData.gender === "M" ? 0 : 1)
        .textField("Hair Color", "BLK", defaultData.hair)
        .textField("Eye Color", "BRN", defaultData.eyes)
        .textField("Height (ft)", "1.75 ft", defaultData.height)
        .textField("Weight (lb)", "168 lb", defaultData.weight)
        .textField("Restriction", "None", defaultData.restriction);

    form.show(player).then(res => {
        if (res.canceled) return;

        let updatedData = {
            ...defaultData, // rank, role, dan job tetap ada (data default)
            location: res.formValues[2],
            dob: res.formValues[3],
            gender: ["M", "F"][res.formValues[4]],
            hair: res.formValues[5],
            eyes: res.formValues[6],
            height: res.formValues[7],
            weight: res.formValues[8],
            restriction: res.formValues[9],
            job: getJob(player) || "None",    // Tetap menyimpan job
            role: getRole(player) || "None",   // Tetap menyimpan role
            rank: getRank(player) || "None",  // Tetap menyimpan rank
        };

        playerData.set(player.id, updatedData);
        world.setDynamicProperty(`ktp_${player.id}`, JSON.stringify(updatedData));
        player.sendMessage("Data saved!");
    });
}

// Button 3: Menunjukkan Identitas ke Pemain Lain
function showToPlayer(player) {
    let allPlayers = world.getPlayers().filter(p => 
        p.id !== player.id && distance(player, p) <= 2
    );

    if (allPlayers.length === 0) {
        player.sendMessage("No players nearby.");
        return;
    }

    let selectForm = new ActionFormData()
        .title("Show ID to Player")
        .body("Select a player to show your ID:");

    allPlayers.forEach(p => selectForm.button(p.name));

    selectForm.show(player).then(res => {
        if (res.canceled) return;

        let targetPlayer = allPlayers[res.selection];
        showIdentity(player, targetPlayer);
        player.sendMessage(`You showed your ID to ${targetPlayer.name}`);
    });
}

// Button 4: Intruksi
function showInstructions(player) {
    let form = new MessageFormData()
        .title("Form Instructions")
        .body(
            " Petunjuk Pengisian Data KTP\n\n" +
            "- ID: gunakan 6 digit angka unik\n" +
            "- Nama: isi sesuai identitas\n" +
            "- Location: tulis alamat/kota\n" +
            "- DOB: gunakan format DD/MM/YYYY\n" +
            "- Gender: pilih M atau F\n\n" +
            " Data ini memiliki mekanisme yang mirip sistem Dukcapil)."
        )
        .button1("Confirm")
        .button2("Back");

    form.show(player).then(res => {
        if (res.canceled) return;

        if (res.selection === 0) {
            player.sendMessage("Silakan lanjutkan pengisian data.");
        } else {
            player.sendMessage("Kembali ke menu utama.");
        }
    });
}


// Membuat Identitas Default
function generateDefaultIdentity(player) {
    return {
        nationality: "Djakarta",
        id: `${Math.floor(100000 + Math.random() * 900000)}`,
        name: player.name,
        location: "xxxx xxxx xxxx",
        dob: "xx/xx/199x",
        gender: "M",
        hair: "BLK",
        eyes: "BRN",
        height: "1.75 ft",
        weight: "168 lb",
        restriction: "None",
        expiration: "03/12/2030"
    };
}

// Fungsi Mendapatkan Rank, Job, dan Role berdasarkan Tag
function getRank(player) {
    let rankTags = ["Major", "Kopassus", "Agent", "Special_Agent", "Secret_Agent", "Double_Agent", "ASAC", "SAC", "Assistant_Director", "Officer", "Leuntnant", "Sea_Leuntnant", "Sky_Leuntnant",
    "Invi_Leuntnant", "Aero_Leuntnant", "Jendral", "Gargantua_Military", "Private_Pilot", "Commercial_Pilot", "Airline_Transport_Pilot",
    "Commander_Gargantua_Military", "Military_Commander", "GrandMarshal", "Fire_Chieftain", "Commander", "Chieftain",
    "Fire_Leuntnant", "Sorcerer_Supreme", "Mafia_Boss", "Dark_DeathBringer", "Gargantua_Mafia", "Pirate_Commander",
    "Spy_Chieftain", "Black_DeathBringer", "Demon_DeathBringer", "Dangerous_DeathBringer",
    "Defacement_DeathBringer", "DeathBringer+", "KODB"];
    return rankTags.find(tag => player.hasTag(tag)) || "None";
}

function getJob(player) {
    let jobTags = ["Pegawai_indomart", "Tukang_ice_crim", "Police", "Detective", "Tukang_sampah", "Public_Service",
    "Pembersih_rumput", "Law_Enforcement", "Government_Agency", "Pencuci_rumah", "Penggangguran_di_gaji",
    "Dokter", "Pegawai_mc_donalds", "Guru", "Firefighter"];
    return jobTags.find(tag => player.hasTag(tag)) || "None";
}

function getRole(player) {
    let roleTags = ["Military", "Pilot", "Warrent", "Raptor", "Pyro", "SpecOps", "Secret_Service",
    "Deputy_Sheriff", "Head Leader", "Vice_GrandMarshal", "Sergeant", "Sorcerer",
    "Professor", "Attorney", "Wizzard", "Leader", "Medic", "CIA", "UIU FBI", "Professional_FIB",
    "Agency_Patrol_Military", "SWAT", "RAMBOO", "DEA", "Fugitive", "The Doctor", "Mafia", "Hitman", "Witch", "DeathBringer",
    "The Godfather", "Pirate", "Spy", "Phoveus", "Serpent_Hands", "Rippo",
    "Chaos_Insurgency", "Council_Hunter", "Haste_Paste", "Raider Seas", "Raider Sky", "Judge", "Lawyer", "Analyst", "Admin", 
    "Admin+", "MOD", "Head_Admin", "Staff", "FBI",
    "Scripter", "Administrator", "DEV", "Creator", "Owner"];
    return roleTags.find(tag => player.hasTag(tag)) || "None";
}

// Fungsi Mengecek Tim Role
function isGoodTeam(role) {
    const goodTeam = ["Military", "Pilot", "Warrent", "Raptor", "Pyro", "SpecOps", "Secret_Service",
    "Deputy_Sheriff", "Head Leader", "Vice_GrandMarshal ", "Sergeant", "Sorcerer",
    "Professor", "Attorney", "Wizzard", "Leader", "Medic", "CIA", "UIU FBI", "FBI", "DEA", "Professional_FIB",
    "Agency_Patrol_Military", "SWAT", "RAMBOO", "DEA"];
    return goodTeam.includes(role);
}

function isBadTeam(role) {
    const badTeam = ["Fugitive", "The Doctor", "Mafia", "Hitman", "Witch", "DeathBringer",
    "The Godfather", "Pirate", "Spy", "Phoveus", "Serpent_Hands", "Rippo",
    "Chaos_Insurgency", "Council_Hunter", "Haste_Paste", "Raider Seas", "Raider Sky"];
    return badTeam.includes(role);
}

// Fungsi Menghitung Jarak Antar Pemain
function distance(p1, p2) {
    let dx = p1.location.x - p2.location.x;
    let dy = p1.location.y - p2.location.y;
    let dz = p1.location.z - p2.location.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
