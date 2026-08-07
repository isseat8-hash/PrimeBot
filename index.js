require("dotenv").config();

const {
Client,
GatewayIntentBits,
Partials,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
ChannelType,
Collection
} = require("discord.js");


const client = new Client({

intents:[

GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildInvites,
GatewayIntentBits.GuildModeration

],

partials:[
Partials.Channel,
Partials.Message,
Partials.User,
Partials.GuildMember
]

});


// PREFIX

const prefix = "!";


// ==========================
// AEGISNW AYARLAR
// ==========================


const config = {


owner:
"1339146423433953300",


suggestChannel:
"1534594853751492832",


autoRole:
"1534594823686717733",


announceChannel:
"1535026905575723068",


chatChannel:
"1534594846445146193",


ticketCategory:
null,


logs:
null,


mc:{

java:
"Yakında",

bedrock:
"Yakında",

port:
"Yakında"

}


};


// ==========================
// SİSTEM HAFIZALARI
// ==========================


client.tickets = new Map();

client.giveaways = new Map();

client.drops = new Map();

client.invites = new Map();

client.warns = new Map();

client.inviteCache = new Map();


// ==========================
// READY
// ==========================


client.once("ready",async()=>{


console.log(
`⚔️ AEGISNW aktif: ${client.user.tag}`
);



client.guilds.cache.forEach(async guild=>{


try{


const invites =
await guild.invites.fetch();


client.inviteCache.set(
guild.id,
invites
);


}catch(err){}


});


client.user.setActivity(
"⚔️ AEGISNW | !yardım",
{
type:3
}
);


});



// ==========================
// BOT HATA KORUMA
// ==========================


process.on(
"unhandledRejection",
err=>{
console.log(
"Hata:",
err
);
});


process.on(
"uncaughtException",
err=>{
console.log(
"Kritik hata:",
err
);
});



// ==========================
// LOGIN
// ==========================


client.login(
process.env.TOKEN
);
// ==========================
// MESSAGE CREATE
// ==========================

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ==========================
    // PING
    // ==========================

    if (command === "ping") {

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("🏓 Pong!")
                    .setDescription(`Bot Gecikmesi: **${client.ws.ping}ms**`)
            ]
        });

    }

    // ==========================
    // CLEAR
    // ==========================

    if (command === "clear") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            return message.reply("❌ Yetkin yok.");

        const amount = parseInt(args[0]);

        if (!amount || amount < 1 || amount > 100)
            return message.reply("1-100 arası sayı gir.");

        await message.channel.bulkDelete(amount, true);

        return message.channel.send(`🗑️ ${amount} mesaj silindi.`)
            .then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000));

    }

    // ==========================
    // LOCK
    // ==========================

    if (command === "lock") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
            return;

        await message.channel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                SendMessages: false
            }
        );

        return message.reply("🔒 Kanal kilitlendi.");

    }

    // ==========================
    // UNLOCK
    // ==========================

    if (command === "unlock") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
            return;

        await message.channel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                SendMessages: null
            }
        );

        return message.reply("🔓 Kanal açıldı.");

    }

    // ==========================
    // AVATAR
    // ==========================

    if (command === "avatar") {

        const user = message.mentions.users.first() || message.author;

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Blurple")
                    .setTitle(`${user.username} Avatarı`)
                    .setImage(user.displayAvatarURL({
                        size: 4096
                    }))
            ]
        });

    }

    // ==========================
    // SERVER INFO
    // ==========================

    if (command === "serverinfo") {

        const online = message.guild.members.cache.filter(
            m => m.presence?.status !== "offline"
        ).size;

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("⚔️ AEGISNW Sunucu Bilgisi")
                    .addFields(
                        {
                            name: "👑 Kurucu",
                            value: `<@1339146423433953300>`
                        },
                        {
                            name: "👥 Toplam Üye",
                            value: `${message.guild.memberCount}`
                        },
                        {
                            name: "🟢 Aktif Üye",
                            value: `${online}`
                        }
                    )
            ]
        });

    }

    // ==========================
    // USER INFO
    // ==========================

    if (command === "userinfo") {

        const member =
            message.mentions.members.first() ||
            message.member;

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(member.user.username)
                    .setThumbnail(member.user.displayAvatarURL())
                    .addFields(
                        {
                            name: "ID",
                            value: member.id
                        },
                        {
                            name: "Hesap Oluşturma",
                            value: `<t:${parseInt(member.user.createdTimestamp / 1000)}:F>`
                        },
                        {
                            name: "Sunucuya Katılım",
                            value: `<t:${parseInt(member.joinedTimestamp / 1000)}:F>`
                        }
                    )
            ]
        });

    }

    // ==========================
    // IP
    // ==========================

    if (command === "ip") {

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("DarkBlue")
                    .setTitle("⚔️ AEGISNW")
                    .setDescription(
`🌐 **Java IP**
Yakında

📱 **Bedrock IP**
Yakında

🔌 **Port**
Yakında`
                    )
            ]
        });

    }

});
// ==========================
// ÖNERİ KOMUTU
// ==========================

if (command === "öneri") {

    if (message.channel.id !== config.suggestChannel)
        return message.reply("❌ Bu komut sadece öneri kanalında kullanılabilir.");

    const text = args.join(" ");

    if (!text)
        return message.reply("Bir öneri yaz.");

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("suggest_yes")
            .setLabel("0")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("suggest_no")
            .setLabel("0")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)

    );

    const embed = new EmbedBuilder()

        .setColor("Blue")

        .setTitle("💡 Yeni Öneri")

        .setDescription(text)

        .addFields(
            {
                name: "Gönderen",
                value: `${message.author}`
            }
        )

        .setTimestamp();

    await message.channel.send({

        embeds: [embed],

        components: [row]

    });

    return message.delete().catch(() => {});

}



// ==========================
// TICKET PANELİ
// ==========================

if (command === "ticketpanel") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return;

    const row1 = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_bug")
                .setLabel("Bug Bildirme")
                .setEmoji("🐞")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_hile")
                .setLabel("Küfür / Hile")
                .setEmoji("🚫")
                .setStyle(ButtonStyle.Danger)

        );

    const row2 = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()
                .setCustomId("ticket_destek")
                .setLabel("Genel Destek")
                .setEmoji("💬")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_odul")
                .setLabel("Ödül Talep")
                .setEmoji("🎁")
                .setStyle(ButtonStyle.Secondary)

        );

    const embed = new EmbedBuilder()

        .setColor("#2b2d31")

        .setTitle("🎫 AEGISNW Destek Sistemi")

        .setDescription(
`Aşağıdaki butonlardan uygun olanı seçerek ticket oluşturabilirsiniz.

🐞 Bug Bildirme
🚫 Küfür / Hile Bildirme
💬 Genel Destek
🎁 Ödül Talep`
        );

    return message.channel.send({

        embeds: [embed],

        components: [row1, row2]

    });

        }
// ==========================
// TICKET BUTTONS
// ==========================

if (!interaction.isButton()) return;

if (
    interaction.customId !== "ticket_bug" &&
    interaction.customId !== "ticket_hile" &&
    interaction.customId !== "ticket_destek" &&
    interaction.customId !== "ticket_odul" &&
    interaction.customId !== "ticket_close"
) return;

if (interaction.customId !== "ticket_close") {

    if (client.tickets.has(interaction.user.id))
        return interaction.reply({
            content: "❌ Zaten açık bir ticketın var.",
            ephemeral: true
        });

    let kategori = "destek";

    if (interaction.customId === "ticket_bug")
        kategori = "bug";

    if (interaction.customId === "ticket_hile")
        kategori = "hile";

    if (interaction.customId === "ticket_destek")
        kategori = "genel";

    if (interaction.customId === "ticket_odul")
        kategori = "odul";

    const channel =
        await interaction.guild.channels.create({

            name: `ticket-${kategori}-${interaction.user.username}`,

            type: ChannelType.GuildText,

            permissionOverwrites: [

                {

                    id: interaction.guild.roles.everyone.id,

                    deny: ["ViewChannel"]

                },

                {

                    id: interaction.user.id,

                    allow: [

                        "ViewChannel",

                        "SendMessages",

                        "ReadMessageHistory"

                    ]

                },

                {

                    id: interaction.guild.members.me.id,

                    allow: [

                        "ViewChannel",

                        "SendMessages",

                        "ManageChannels",

                        "ManageMessages"

                    ]

                }

            ]

        });

    client.tickets.set(
        interaction.user.id,
        channel.id
    );

    const closeRow =
        new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId("ticket_close")

                    .setEmoji("🔒")

                    .setLabel("Ticket Kapat")

                    .setStyle(ButtonStyle.Danger)

            );

    const embed =
        new EmbedBuilder()

            .setColor("Green")

            .setTitle("🎫 Ticket Oluşturuldu")

            .setDescription(

`Merhaba ${interaction.user}

Destek ekibi en kısa sürede ilgilenecektir.

Kategori:
**${kategori}**`

            )

            .setTimestamp();

    await channel.send({

        content: `${interaction.user}`,

        embeds: [embed],

        components: [closeRow]

    });

    return interaction.reply({

        content: `✅ Ticketın oluşturuldu: ${channel}`,

        ephemeral: true

    });

}
// ==========================
// TICKET KAPAT
// ==========================

if (interaction.customId === "ticket_close") {

    await interaction.reply({
        content: "🔒 Ticket 5 saniye sonra kapatılacak...",
        ephemeral: true
    });

    const channel = interaction.channel;

    const owner = [...client.tickets.entries()]
        .find(([id, ch]) => ch === channel.id);

    if (owner)
        client.tickets.delete(owner[0]);

    const transcript = channel.messages.cache
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map(msg =>
            `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content}`
        )
        .join("\n");

    const logEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("📁 Ticket Kapatıldı")
        .addFields(
            {
                name: "Kanal",
                value: channel.name
            },
            {
                name: "Kapatan",
                value: `${interaction.user}`
            }
        )
        .setTimestamp();

    if (config.logs) {

        const log = interaction.guild.channels.cache.get(config.logs);

        if (log) {

            await log.send({
                embeds: [logEmbed]
            });

            if (transcript.length > 0) {

                await log.send({
                    content:
                        "```" +
                        transcript.substring(0, 3900) +
                        "```"
                });

            }

        }

    }

    setTimeout(async () => {

        await channel.delete().catch(() => {});

    }, 5000);

}
// ==========================
// ÇEKİLİŞ SİSTEMİ
// ==========================

if (command === "cekilis") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply("❌ Bu komutu sadece yöneticiler kullanabilir.");

    const time = args[0];
    const winnerCount = parseInt(args[1]);
    const prize = args.slice(2).join(" ");

    if (!time || !winnerCount || !prize)
        return message.reply("Kullanım: !cekilis 1d 2 Nitro");

    const ms = require("ms");
    const duration = ms(time);

    if (!duration)
        return message.reply("❌ Geçerli süre gir. (1m, 1h, 1d)");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`gw_${Date.now()}`)
            .setLabel("Katıl")
            .setEmoji("🎉")
            .setStyle(ButtonStyle.Success)
    );

    const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎉 Yeni Çekiliş")
        .addFields(
            {
                name: "🎁 Ödül",
                value: prize
            },
            {
                name: "🏆 Kazanan",
                value: `${winnerCount} kişi`
            },
            {
                name: "⏳ Süre",
                value: time
            }
        )
        .setFooter({
            text: `Başlatan: ${message.author.tag}`
        });

    const giveawayMessage = await message.channel.send({
        embeds: [embed],
        components: [row]
    });

    client.giveaways.set(giveawayMessage.id, {
        users: [],
        winners: winnerCount,
        prize: prize,
        button: row.components[0].data.custom_id
    });

    setTimeout(async () => {

        const data = client.giveaways.get(giveawayMessage.id);

        if (!data) return;

        if (data.users.length === 0) {

            await message.channel.send("❌ Çekilişe katılan olmadı.");

            client.giveaways.delete(giveawayMessage.id);

            return;

        }

        const shuffled = [...data.users].sort(() => Math.random() - 0.5);

        const winners = shuffled.slice(0, data.winners);

        await message.channel.send(
            `🎉 Tebrikler ${winners.map(id => `<@${id}>`).join(", ")}\n\n🎁 **${data.prize}** kazandınız!\n\nTicket açarak ödülünüzü alabilirsiniz.`
        );

        client.giveaways.delete(giveawayMessage.id);

    }, duration);

}
// ==========================
// ÇEKİLİŞ BUTONU
// ==========================

if (interaction.isButton() && interaction.customId.startsWith("gw_")) {

    const giveaway = [...client.giveaways.values()]
        .find(g => g.button === interaction.customId);

    if (!giveaway)
        return interaction.reply({
            content: "❌ Bu çekiliş sona ermiş.",
            ephemeral: true
        });

    if (giveaway.users.includes(interaction.user.id))
        return interaction.reply({
            content: "❌ Zaten katıldın.",
            ephemeral: true
        });

    giveaway.users.push(interaction.user.id);

    return interaction.reply({
        content: "🎉 Çekilişe başarıyla katıldın!",
        ephemeral: true
    });

}



// ==========================
// DROP KOMUTU
// ==========================

if (command === "drop") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply("❌ Yetkin yok.");

    const prize = args.join(" ");

    if (!prize)
        return message.reply("Kullanım: !drop Nitro");

    const id = `drop_${Date.now()}`;

    client.drops.set(id, {

        prize: prize,

        claimed: false

    });

    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

                .setCustomId(id)

                .setLabel("Ödülü Al")

                .setEmoji("🎁")

                .setStyle(ButtonStyle.Success)

        );

    const embed = new EmbedBuilder()

        .setColor("Purple")

        .setTitle("🎁 DROP!")

        .setDescription(

`İlk butona basan kazanır!

🎁 Ödül:
**${prize}**`

        );

    return message.channel.send({

        embeds: [embed],

        components: [row]

    });

}



// ==========================
// DROP BUTONU
// ==========================

if (interaction.isButton() && interaction.customId.startsWith("drop_")) {

    const data = client.drops.get(interaction.customId);

    if (!data)
        return interaction.reply({

            content: "❌ Drop bulunamadı.",

            ephemeral: true

        });

    if (data.claimed)
        return interaction.reply({

            content: "❌ Bu ödül alındı.",

            ephemeral: true

        });

    data.claimed = true;

    await interaction.update({

        components: []

    });

    await interaction.followUp({

        content:
`🎉 Tebrikler ${interaction.user}

**${data.prize}** ödülünü kazandın!

Lütfen bir ticket açarak ödülünü teslim al.`

    });

}
// ==========================
// INVITE CACHE
// ==========================

client.invites = new Collection();
client.inviteData = new Collection();

client.on("ready", async () => {

    for (const guild of client.guilds.cache.values()) {

        const invites = await guild.invites.fetch().catch(() => null);

        if (invites)
            client.invites.set(guild.id, invites);

    }

});

// ==========================
// OTOROL + INVITE
// ==========================

client.on("guildMemberAdd", async member => {

    // OTOROL

    const role = member.guild.roles.cache.get(config.autoRole);

    if (role)
        await member.roles.add(role).catch(() => {});



    // INVITE

    const oldInvites =
        client.invites.get(member.guild.id);

    const newInvites =
        await member.guild.invites.fetch().catch(() => null);

    if (!oldInvites || !newInvites) return;

    client.invites.set(
        member.guild.id,
        newInvites
    );

    const invite =
        newInvites.find(i =>
            oldInvites.get(i.code)?.uses < i.uses
        );

    if (!invite) return;

    const inviter = invite.inviter.id;

    if (!client.inviteData.has(inviter)) {

        client.inviteData.set(inviter, {

            regular:0,

            leaves:0,

            fake:0

        });

    }

    const data =
        client.inviteData.get(inviter);

    const accountAge =
        Date.now() -
        member.user.createdTimestamp;

    if (accountAge < 1000*60*60*24*7) {

        data.fake++;

    } else {

        data.regular++;

    }

});



// ==========================
// AYRILAN ÜYE
// ==========================

client.on("guildMemberRemove", member=>{

    const inviter =
        [...client.inviteData.entries()]
        .find(()=>true);

    if(!inviter) return;

    inviter[1].leaves++;

});



// ==========================
// INVITE KOMUTU
// ==========================

if(command==="invite"){

    const user=
    message.mentions.users.first()||
    message.author;

    const data=
    client.inviteData.get(user.id)||{

        regular:0,

        leaves:0,

        fake:0

    };

    return message.reply({

        embeds:[

            new EmbedBuilder()

            .setColor("Blue")

            .setTitle("📨 Davet İstatistikleri")

            .addFields(

                {

                    name:"✅ Gerçek",

                    value:String(data.regular),

                    inline:true

                },

                {

                    name:"❌ Fake",

                    value:String(data.fake),

                    inline:true

                },

                {

                    name:"📤 Ayrılan",

                    value:String(data.leaves),

                    inline:true

                }

            )

        ]

    });

}
// ==========================
// ÖNERİ OYLAMA SİSTEMİ
// ==========================

if (!client.suggestionVotes)
    client.suggestionVotes = new Map();

if (
    interaction.isButton() &&
    (interaction.customId === "suggest_yes" ||
     interaction.customId === "suggest_no")
) {

    const messageId = interaction.message.id;

    if (!client.suggestionVotes.has(messageId)) {

        client.suggestionVotes.set(messageId, {

            yes: [],

            no: []

        });

    }

    const vote =
        client.suggestionVotes.get(messageId);

    // =====================
    // DESTEK
    // =====================

    if (interaction.customId === "suggest_yes") {

        if (vote.yes.includes(interaction.user.id))
            return interaction.reply({

                content:"❌ Bu öneriyi zaten destekledin.",

                ephemeral:true

            });

        vote.no =
            vote.no.filter(id=>id!==interaction.user.id);

        vote.yes.push(interaction.user.id);

    }

    // =====================
    // REDDET
    // =====================

    if (interaction.customId === "suggest_no") {

        if (vote.no.includes(interaction.user.id))
            return interaction.reply({

                content:"❌ Bu öneriyi zaten reddettin.",

                ephemeral:true

            });

        vote.yes =
            vote.yes.filter(id=>id!==interaction.user.id);

        vote.no.push(interaction.user.id);

    }

    // =====================
    // BUTONLARI GÜNCELLE
    // =====================

    const row =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("suggest_yes")

            .setEmoji("✅")

            .setLabel(String(vote.yes.length))

            .setStyle(ButtonStyle.Success),

            new ButtonBuilder()

            .setCustomId("suggest_no")

            .setEmoji("❌")

            .setLabel(String(vote.no.length))

            .setStyle(ButtonStyle.Danger)

        );

    await interaction.update({

        components:[row]

    });

}
// ==========================
// !panel
// ==========================

if (command === "panel") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply("❌ Bu komutu sadece yöneticiler kullanabilir.");

    const row1 = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("panel_dm")
            .setLabel("DM Gönder")
            .setEmoji("📩")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("panel_roleall")
            .setLabel("Toplu Rol")
            .setEmoji("👥")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("panel_unroleall")
            .setLabel("Rol Al")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)

    );

    const row2 = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("panel_announce")
            .setLabel("Duyuru")
            .setEmoji("📢")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("panel_clear")
            .setLabel("Mesaj Sil")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("panel_lock")
            .setLabel("Kilitle")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)

    );

    const row3 = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId("panel_unlock")
            .setLabel("Aç")
            .setEmoji("🔓")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("panel_stats")
            .setLabel("İstatistik")
            .setEmoji("📊")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("panel_maintenance")
            .setLabel("Bakım")
            .setEmoji("🛠️")
            .setStyle(ButtonStyle.Secondary)

    );

    const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle("🛡️ AEGISNW Yönetici Paneli")
        .setDescription(
`Aşağıdaki butonlardan yönetim işlemlerini gerçekleştirebilirsiniz.

📩 DM Gönder
👥 Toplu Rol Ver
❌ Toplu Rol Al
📢 Duyuru
🗑️ Mesaj Sil
🔒 Kanal Kilitle
🔓 Kanal Aç
📊 İstatistik
🛠️ Bakım Modu`
        )
        .setFooter({
            text: "AEGISNW Yönetim Sistemi"
        })
        .setTimestamp();

    return message.channel.send({
        embeds: [embed],
        components: [row1, row2, row3]
    });

                      }
