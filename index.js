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
    Events
} = require("discord.js");

const ms = require("ms");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.User
    ]
});

const PREFIX = "!";

/* =========================
         AYARLAR
========================= */

const SUGGESTION_CHANNEL = "1506325269504458917";
const AUTOROLE_ID = "1515708868120936518";

const ANNOUNCE_CHANNEL = "1506325268900483183";
const CHAT_CHANNEL = "1506325269504458914";

const OWNER_ID = "1003708560728920165";
const LOG_CHANNEL = 
"1506325269948928051";
const TICKET_LOG_CHANNEL = "1515709726355226686";

/* =========================
      HAFIZA VERİLERİ
========================= */

const giveaways = new Map();
const drops = new Map();
const tickets = new Map();

const inviteCache = new Map();
const inviteStats = new Map();

/* =========================
        READY
========================= */

client.once(Events.ClientReady, async () => {

    console.log(`${client.user.tag} aktif!`);

    client.user.setPresence({
        activities: [
            {
                name: "LynoxNW ❤️"
            }
        ],
        status: "online"
    });

    for (const guild of client.guilds.cache.values()) {

        const invites = await guild.invites.fetch().catch(() => null);

        if (invites)
            inviteCache.set(guild.id, invites);

    }

});
/* =========================
        OTOROL
========================= */

client.on(Events.GuildMemberAdd, async (member) => {

    if (AUTOROLE_ID) {
        member.roles.add(AUTOROLE_ID).catch(() => {});
    }

});

/* =========================
      INVITE GÜNCELLE
========================= */

client.on(Events.InviteCreate, async (invite) => {

    const invites = await invite.guild.invites.fetch().catch(() => null);

    if (invites)
        inviteCache.set(invite.guild.id, invites);

});

client.on(Events.InviteDelete, async (invite) => {

    const invites = await invite.guild.invites.fetch().catch(() => null);

    if (invites)
        inviteCache.set(invite.guild.id, invites);

});

/* =========================
      DAVET SAYMA
========================= */

client.on(Events.GuildMemberAdd, async member => {

    const oldInvites = inviteCache.get(member.guild.id);

    const newInvites = await member.guild.invites.fetch().catch(() => null);

    if (!oldInvites || !newInvites) return;

    inviteCache.set(member.guild.id, newInvites);

    const usedInvite = newInvites.find(i => {
        const old = oldInvites.get(i.code);
        return old && i.uses > old.uses;
    });

    if (!usedInvite) return;

    const inviter = usedInvite.inviter;

    if (!inviteStats.has(inviter.id)) {
        inviteStats.set(inviter.id, {
            invites: 0
        });
    }

    inviteStats.get(inviter.id).invites++;

});

/* =========================
      !INVITE
========================= */

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!invite") {

        const data = inviteStats.get(message.author.id) || {
            invites: 0
        };

        const embed = new EmbedBuilder()

            .setColor("#5865F2")

            .setTitle("📨 Davet İstatistiklerin")

            .setDescription(
`👤 Kullanıcı : ${message.author}

🎉 Toplam Davet : **${data.invites}**`
)

            .setThumbnail(message.author.displayAvatarURL())

            .setTimestamp();

        message.reply({
            embeds: [embed]
        });

    }

});
/* =========================
         !ÖNERİ
========================= */

client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!öneri")) return;

    if (message.channel.id !== SUGGESTION_CHANNEL) {

        return message.reply({
            content: `❌ Bu komut sadece <#${SUGGESTION_CHANNEL}> kanalında kullanılabilir.`
        });

    }

    const suggestion = message.content.slice(7).trim();

    if (!suggestion) {

        return message.reply("❌ Bir öneri yazmalısın.");

    }

    const embed = new EmbedBuilder()

        .setColor("#5865F2")

        .setAuthor({
            name: `${message.author.username} bir öneri oluşturdu`,
            iconURL: message.author.displayAvatarURL()
        })

        .setTitle("💡 Yeni Öneri")

        .setDescription(`>>> ${suggestion}`)

        .addFields(

            {
                name: "👍 Kabul",
                value: "`0`",
                inline: true
            },

            {
                name: "👎 Red",
                value: "`0`",
                inline: true
            }

        )

        .setFooter({
            text: "PL • Öneri Sistemi"
        })

        .setTimestamp();

    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("suggest_yes")

            .setEmoji("👍")

            .setStyle(ButtonStyle.Success),

            new ButtonBuilder()

            .setCustomId("suggest_no")

            .setEmoji("👎")

            .setStyle(ButtonStyle.Danger)

        );

    await message.delete().catch(() => {});

    message.channel.send({

        embeds: [embed],

        components: [row]

    });

});
/* =========================
      ÖNERİ BUTONLARI
========================= */

const suggestionVotes = new Map();

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    if (
        interaction.customId !== "suggest_yes" &&
        interaction.customId !== "suggest_no"
    ) return;

    const key = interaction.message.id;

    if (!suggestionVotes.has(key)) {

        suggestionVotes.set(key, {

            yes: new Set(),

            no: new Set()

        });

    }

    const vote = suggestionVotes.get(key);

    vote.yes.delete(interaction.user.id);
    vote.no.delete(interaction.user.id);

    if (interaction.customId === "suggest_yes")
        vote.yes.add(interaction.user.id);

    if (interaction.customId === "suggest_no")
        vote.no.add(interaction.user.id);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    embed.setFields(

        {

            name: "👍 Kabul",

            value: `\`${vote.yes.size}\``,

            inline: true

        },

        {

            name: "👎 Red",

            value: `\`${vote.no.size}\``,

            inline: true

        }

    );

    await interaction.update({

        embeds: [embed]

    });

});
/* =========================
         !TICKET
========================= */

client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;
    if (message.content !== "!ticket") return;

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return;

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🎫 PL Destek Merkezi")
        .setDescription(
`Aşağıdaki butonlardan birini seçerek destek talebi oluşturabilirsiniz.

🐞 Bug Bildirme
🚨 Küfür / Hile Bildirme
💬 Genel Destek
🎁 Ödül Talep`
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: "AEGISNW Ticket Sistemi" })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
        .setCustomId("ticket_bug")
        .setLabel("Bug Bildir")
        .setEmoji("🐞")
        .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
        .setCustomId("ticket_report")
        .setLabel("Küfür/Hile")
        .setEmoji("🚨")
        .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("Genel Destek")
        .setEmoji("💬")
        .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
        .setCustomId("ticket_reward")
        .setLabel("Ödül Talep")
        .setEmoji("🎁")
        .setStyle(ButtonStyle.Secondary)

    );

    message.channel.send({
        embeds: [embed],
        components: [row]
    });

});
/* ===========================
      TICKET OLUŞTURMA
=========================== */

client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;

    const buttons = [
        "ticket_bug",
        "ticket_report",
        "ticket_support",
        "ticket_reward"
    ];

    if (!buttons.includes(interaction.customId)) return;

    if (tickets.has(interaction.user.id)) {

        return interaction.reply({
            content: "❌ Zaten açık bir ticketın bulunuyor.",
            ephemeral: true
        });

    }

    let kategori = "Destek";

    if (interaction.customId === "ticket_bug")
        kategori = "Bug";

    if (interaction.customId === "ticket_report")
        kategori = "Küfür-Hile";

    if (interaction.customId === "ticket_support")
        kategori = "Genel Destek";

    if (interaction.customId === "ticket_reward")
        kategori = "Ödül";

    const channel = await interaction.guild.channels.create({

        name: `ticket-${interaction.user.username}`,

        type: ChannelType.GuildText,

        topic: interaction.user.id,

        permissionOverwrites: [

            {
                id: interaction.guild.roles.everyone,
                deny: [
                    PermissionsBitField.Flags.ViewChannel
                ]
            },

            {
                id: interaction.user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory
                ]
            }

        ]

    });

    tickets.set(interaction.user.id, channel.id);

    const embed = new EmbedBuilder()

        .setColor("Green")

        .setTitle("🎫 Ticket Oluşturuldu")

        .setDescription(
`Hoş geldin ${interaction.user}

📂 **Kategori**
${kategori}

Yetkililer en kısa sürede seninle ilgilenecektir.`
        )

        .setTimestamp();

    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("ticket_close")

            .setLabel("Ticket Kapat")

            .setEmoji("🔒")

            .setStyle(ButtonStyle.Danger)

        );

    await channel.send({

        content: `${interaction.user}`,

        embeds: [embed],

        components: [row]

    });

    interaction.reply({

        content: `✅ Ticketın oluşturuldu: ${channel}`,

        ephemeral: true

    });

});
/* ===========================
       TICKET KAPAT
=========================== */

client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId !== "ticket_close") return;

    const ownerId = interaction.channel.topic;

    if (
        interaction.user.id !== ownerId &&
        !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {

        return interaction.reply({
            content: "❌ Bu ticketı kapatamazsın.",
            ephemeral: true
        });

    }

    tickets.delete(ownerId);

    const embed = new EmbedBuilder()

        .setColor("Red")

        .setTitle("🔒 Ticket Kapatılıyor")

        .setDescription("Bu ticket **5 saniye** içerisinde silinecek.")

        .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });

    setTimeout(async () => {

        interaction.channel.delete().catch(() => {});

    }, 5000);

});
/* ===========================
      TICKET TEMİZLE
=========================== */

client.on("channelDelete", channel => {

    if (!channel.topic) return;

    tickets.delete(channel.topic);

});
/* ===========================
         !ÇEKİLİŞ
=========================== */

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!cekilis")) return;

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return;

    const args = message.content.split(" ");

    const süre = args[1];
    const kazanan = Number(args[2]);

    const ödül = args.slice(3).join(" ");

    if (!süre || !kazanan || !ödül)
        return message.reply(
            "Kullanım: `!cekilis 1d 2 Nitro`"
        );

    const embed = new EmbedBuilder()

        .setColor("#5865F2")

        .setTitle("🎉 PL Çekilişi")

        .setDescription(
`🎁 **Ödül**
${ödül}

👑 **Kazanan**
${kazanan}

⏳ **Süre**
${süre}

Butona basarak katılabilirsin.`
        )

        .setTimestamp();

    const row = new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("giveaway_join")

            .setLabel("Katıl")

            .setEmoji("🎉")

            .setStyle(ButtonStyle.Success)

        );

    const msg = await message.channel.send({

        embeds: [embed],

        components: [row]

    });

    giveaways.set(msg.id, {

        prize: ödül,

        winners: kazanan,

        users: [],

        message: msg

    });

    setTimeout(async () => {

        const data = giveaways.get(msg.id);

        if (!data) return;

        if (data.users.length === 0) {

            return message.channel.send(
                "❌ Çekilişe kimse katılmadı."
            );

        }

        const shuffled = data.users.sort(() => Math.random() - 0.5);

        const winners = shuffled.slice(0, data.winners);

        message.channel.send(

`🎉 Tebrikler ${winners.map(x=>`<@${x}>`).join(", ")}

**${data.prize}** kazandınız.

🎫 Ticket açarak ödülünüzü alabilirsiniz.`

        );

        giveaways.delete(msg.id);

    }, ms(süre));

});
/* ===========================
      ÇEKİLİŞ BUTONU
=========================== */

client.on("interactionCreate", async interaction => {

    if (!interaction.isButton()) return;

    if (interaction.customId !== "giveaway_join") return;

    const data = giveaways.get(interaction.message.id);

    if (!data) {

        return interaction.reply({

            content: "Çekiliş sona ermiş.",

            ephemeral: true

        });

    }

    if (data.users.includes(interaction.user.id)) {

        return interaction.reply({

            content: "❌ Zaten katıldın.",

            ephemeral: true

        });

    }

    data.users.push(interaction.user.id);

    interaction.reply({

        content: "🎉 Çekilişe katıldın.",

        ephemeral: true

    });

});
/* ===========================
            !DROP
=========================== */

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!drop")) return;

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return;

    const prize = message.content.slice(6).trim();

    if (!prize)
        return message.reply("Kullanım: `!drop <ödül>`");

    const embed = new EmbedBuilder()

        .setColor("#57F287")

        .setTitle("🎁 PL DROP")

        .setDescription(
`İlk butona basan kişi aşağıdaki ödülü kazanacaktır!

🏆 **Ödül**
${prize}

⚡ İlk tıklayan kazanır!`
        )

        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()

        .setCustomId("drop_claim")

        .setLabel("Ödülü Kap")

        .setEmoji("🎁")

        .setStyle(ButtonStyle.Success)

    );

    const msg = await message.channel.send({
        embeds: [embed],
        components: [row]
    });

    drops.set(msg.id, {
        prize,
        claimed: false
    });

});
/* ===========================
        DROP BUTONU
=========================== */

client.on("interactionCreate", async interaction => {

    if (!interaction.isButton()) return;

    if (interaction.customId !== "drop_claim") return;

    const data = drops.get(interaction.message.id);

    if (!data)
        return interaction.reply({
            content: "❌ Bu drop artık aktif değil.",
            ephemeral: true
        });

    if (data.claimed)
        return interaction.reply({
            content: "❌ Bu ödül daha önce alındı.",
            ephemeral: true
        });

    data.claimed = true;

    const disabledRow = new ActionRowBuilder().addComponents(

        new ButtonBuilder()

        .setCustomId("drop_claimed")

        .setLabel("Alındı")

        .setEmoji("✅")

        .setDisabled(true)

        .setStyle(ButtonStyle.Secondary)

    );

    await interaction.update({
        components: [disabledRow]
    });

    await interaction.followUp({

        content:
`🎉 Tebrikler ${interaction.user}!

**${data.prize}** ödülünü kazandın.

🎫 Lütfen bir **ticket açarak** ödülünü talep et.`

    });

    drops.delete(interaction.message.id);

});
/* =========================
       👑 ADMIN PANEL
========================= */

client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;
    if (message.content !== "!panel") return;

    // Sadece Administrator
    if (!message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )) {
        return message.reply({
            content: "❌ Bu paneli kullanmak için Administrator yetkisine sahip olmalısın.",
            allowedMentions: { repliedUser: false }
        });
    }

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("👑 PrimeLegacy Yönetici Paneli")
        .setDescription(
`Sunucu yönetim işlemlerini aşağıdaki butonlardan gerçekleştirebilirsin.

🎫 **Ticket Paneli**
Ticket panelinin gönderileceği kanalı seç.

📢 **Duyuru**
Duyuru mesajı oluştur ve otomatik olarak gerekli kanallara gönder.

🧹 **Mesaj Temizle**
Kanal seçerek belirlediğin miktarda mesaj sil.

🔒 **Kanal Kilitle**
Seçilen kanalı üyelerin mesaj göndermesine kapat.

🔓 **Kanal Aç**
Seçilen kanalın kilidini kaldır.

🎉 **Çekiliş**
Kanal, ödül, süre ve kazanan sayısını belirle.

🎁 **Drop**
Kanal, ödül ve süre belirle.`)
        .setFooter({
            text: "PrimeLegacy • Yönetici Paneli"
        })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("admin_ticket")
                .setLabel("Ticket Paneli")
                .setEmoji("🎫")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("admin_announce")
                .setLabel("Duyuru")
                .setEmoji("📢")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("admin_clear")
                .setLabel("Mesaj Temizle")
                .setEmoji("🧹")
                .setStyle(ButtonStyle.Danger)

        );

    const row2 = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId("admin_lock")
                .setLabel("Kanal Kilitle")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("admin_unlock")
                .setLabel("Kanal Aç")
                .setEmoji("🔓")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("admin_giveaway")
                .setLabel("Çekiliş")
                .setEmoji("🎉")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("admin_drop")
                .setLabel("Drop")
                .setEmoji("🎁")
                .setStyle(ButtonStyle.Secondary)

        );

    await message.channel.send({
        embeds: [embed],
        components: [row1, row2]
    });

client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isButton()) return;

    if (!interaction.customId.startsWith("admin_")) return;

    if (!interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )) {
        return interaction.reply({
            content: "❌ Administrator yetkin yok.",
            ephemeral: true
        });
    }

    const messages = {
        admin_ticket: "🎫 Ticket Panel butonuna bastın.",
        admin_announce: "📢 Duyuru butonuna bastın.",
        admin_clear: "🧹 Mesaj Temizle butonuna bastın.",
        admin_lock: "🔒 Kanal Kilitle butonuna bastın.",
        admin_unlock: "🔓 Kanal Aç butonuna bastın.",
        admin_giveaway: "🎉 Çekiliş butonuna bastın.",
        admin_drop: "🎁 Drop butonuna bastın."
    };

    const response = messages[interaction.customId];

    if (!response) return;

    await interaction.reply({
        content: response,
        ephemeral: true
    });

});
/* ===========================
       !TICKETPANEL
=========================== */


client.on("messageCreate", async (message)=>{


    if(message.author.bot) return;


    if(message.content !== "!ticketpanel")
        return;


    if(!message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )) return;



    const embed = new EmbedBuilder()

    .setColor("#57F287")

    .setTitle("🎫 Destek Talebi")

    .setDescription(
`Destek almak için aşağıdaki butonlardan uygun olanı seç.

🐞 Bug Bildirme

🚨 Küfür/Hile Bildirme

💬 Genel Destek

🎁 Ödül Talep`
    )

    .setTimestamp();



    const row = new ActionRowBuilder()

    .addComponents(

        new ButtonBuilder()
        .setCustomId("ticket_bug")
        .setLabel("Bug")
        .setEmoji("🐞")
        .setStyle(ButtonStyle.Primary),


        new ButtonBuilder()
        .setCustomId("ticket_report")
        .setLabel("Küfür/Hile")
        .setEmoji("🚨")
        .setStyle(ButtonStyle.Danger),


        new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("Destek")
        .setEmoji("💬")
        .setStyle(ButtonStyle.Success),


        new ButtonBuilder()
        .setCustomId("ticket_reward")
        .setLabel("Ödül")
        .setEmoji("🎁")
        .setStyle(ButtonStyle.Secondary)

    );



    message.channel.send({

        embeds:[embed],

        components:[row]

    });


});
/* ===========================
          !CLEAR
=========================== */

client.on("messageCreate", async message=>{


if(message.author.bot) return;


if(!message.content.startsWith("!clear"))
return;


if(!message.member.permissions.has(
PermissionsBitField.Flags.ManageMessages
)) return;



const amount = Number(
message.content.split(" ")[1]
);



if(!amount)
return message.reply("❌ Sayı yazmalısın.");



await message.channel.bulkDelete(amount,true);


message.channel.send(
`🧹 ${amount} mesaj silindi.`
).then(msg=>{

setTimeout(()=>msg.delete(),3000);

});


});
/* ===========================
       LOCK UNLOCK
=========================== */


client.on("messageCreate", async message=>{


if(message.author.bot) return;



if(
message.content !== "!lock" &&
message.content !== "!unlock"
) return;



if(!message.member.permissions.has(
PermissionsBitField.Flags.Administrator
)) return;



if(message.content === "!lock"){


message.channel.permissionOverwrites.edit(
message.guild.roles.everyone,
{
SendMessages:false
});


message.reply("🔒 Kanal kilitlendi.");


}



if(message.content === "!unlock"){


message.channel.permissionOverwrites.edit(
message.guild.roles.everyone,
{
SendMessages:true
});


message.reply("🔓 Kanal açıldı.");


}



});
/* ===========================
          !ANNOUNCE
=========================== */

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (!message.content.startsWith("!announce"))
        return;


    if (!message.member.permissions.has(
        PermissionsBitField.Flags.Administrator
    )) return;


    const text = message.content
        .slice("!announce".length)
        .trim();


    if (!text)
        return message.reply(
            "❌ Duyuru mesajı yazmalısın."
        );


    const embed = new EmbedBuilder()

        .setColor("#FEE75C")

        .setTitle("📢 PL Duyuru")

        .setDescription(text)

        .setAuthor({

            name: message.guild.name,

            iconURL: message.guild.iconURL()

        })

        .setFooter({

            text: "PL Yönetim"

        })

        .setTimestamp();



    // Duyuru Kanalı

    const announceChannel =
        message.guild.channels.cache.get(
            ANNOUNCE_CHANNEL
        );


    if (announceChannel) {

        announceChannel.send({

            content:
            "@everyone @here",

            embeds:[
                embed
            ]

        });

    }



    // Sohbet Kanalı

    const chatChannel =
        message.guild.channels.cache.get(
            CHAT_CHANNEL
        );


    if (chatChannel) {

        chatChannel.send({

            embeds:[
                embed
            ]

        });

    }



    message.reply(
        "✅ Duyuru başarıyla gönderildi."
    );


});
/* ===========================
        WARN VERİLERİ
=========================== */

const warns = new Map();


/* ===========================
             !BAN
=========================== */

client.on("messageCreate", async message => {

    if(message.author.bot) return;

    if(!message.content.startsWith("!ban"))
        return;


    if(!message.member.permissions.has(
        PermissionsBitField.Flags.BanMembers
    )) return;


    const user =
    message.mentions.members.first();


    if(!user)
        return message.reply(
            "❌ Bir kullanıcı etiketlemelisin."
        );


    await user.ban({

        reason:
        `${message.author.tag} tarafından banlandı`

    });


    message.reply(
        `🔨 ${user.user.tag} banlandı.`
    );


});
/* ===========================
             !KICK
=========================== */

client.on("messageCreate", async message => {

    if(message.author.bot) return;

    if(message.content.startsWith("!kick")){


        if(!message.member.permissions.has(
            PermissionsBitField.Flags.KickMembers
        )) return;


        const user =
        message.mentions.members.first();


        if(!user)
        return message.reply(
            "❌ Kullanıcı etiketle."
        );


        await user.kick(
            `${message.author.tag} tarafından atıldı`
        );


        message.reply(
            `👢 ${user.user.tag} sunucudan atıldı.`
        );

    }

});

/* ===========================
             !WARN
=========================== */

client.on("messageCreate", async message => {

    if(message.author.bot) return;

    if(!message.content.startsWith("!warn"))
        return;


    if(!message.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
    )) return;


    const user =
    message.mentions.members.first();


    if(!user)
        return message.reply(
            "❌ Kullanıcı etiketle."
        );


    const reason =
    message.content.split(" ").slice(2).join(" ")
    || "Sebep belirtilmedi";


    if(!warns.has(user.id))
        warns.set(user.id,[]);



    warns.get(user.id).push({

        reason,

        moderator:message.author.id

    });



    message.reply(
`⚠️ ${user.user.tag} uyarıldı.

Sebep: ${reason}`
    );


});
/* ===========================
          !MUTE
=========================== */

client.on("messageCreate", async message=>{

if(message.author.bot) return;


if(!message.content.startsWith("!mute"))
return;



if(!message.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)) return;



const user =
message.mentions.members.first();



if(!user)
return message.reply(
"❌ Kullanıcı etiketle."
);



await user.timeout(

10 * 60 * 1000,

"Yetkili susturması"

);



message.reply(
`🔇 ${user.user.tag} 10 dakika susturuldu.`
);



});
/* ===========================
          !UNMUTE
=========================== */

client.on("messageCreate", async message=>{


if(message.author.bot) return;


if(message.content.startsWith("!unmute")){


if(!message.member.permissions.has(
PermissionsBitField.Flags.ModerateMembers
)) return;



const user =
message.mentions.members.first();



if(!user)
return message.reply(
"❌ Kullanıcı etiketle."
);



await user.timeout(null);



message.reply(
`🔊 ${user.user.tag} susturması kaldırıldı.`
);



}


});
/* ===========================
             !PING
=========================== */

client.on("messageCreate", async message => {

    if(message.author.bot) return;

    if(message.content !== "!ping")
        return;


    const msg = await message.reply("🏓 Ölçülüyor...");


    msg.edit(
`🏓 Pong!

Gecikme:
**${client.ws.ping}ms**`
    );


});
/* ===========================
            !AVATAR
=========================== */

client.on("messageCreate", async message=>{


if(message.author.bot) return;


if(!message.content.startsWith("!avatar"))
return;



const user =
message.mentions.users.first()
|| message.author;



const embed = new EmbedBuilder()

.setColor("#5865F2")

.setTitle(`🖼️ ${user.username} Avatar`)

.setImage(
user.displayAvatarURL({
size:1024,
dynamic:true
})
)

.setTimestamp();



message.reply({

embeds:[embed]

});



});
/* ===========================
          !USERINFO
=========================== */

client.on("messageCreate", async message=>{


if(message.author.bot) return;


if(!message.content.startsWith("!userinfo"))
return;



const user =
message.mentions.members.first()
|| message.member;



const embed = new EmbedBuilder()

.setColor("#5865F2")

.setTitle("👤 Kullanıcı Bilgileri")

.setThumbnail(
user.user.displayAvatarURL()
)

.addFields(

{
name:"👤 Kullanıcı",
value:`${user}`,
inline:true
},

{
name:"🆔 ID",
value:user.id,
inline:true
},

{
name:"📅 Katılma Tarihi",
value:
`<t:${Math.floor(user.joinedTimestamp/1000)}:R>`,
inline:false
},

{
name:"📌 Hesap Tarihi",
value:
`<t:${Math.floor(user.user.createdTimestamp/1000)}:R>`,
inline:false
}

)

.setTimestamp();



message.reply({

embeds:[embed]

});


});
/* ===========================
        !SERVERINFO
=========================== */

client.on("messageCreate", async message=>{


if(message.author.bot) return;


if(message.content !== "!serverinfo")
return;



const guild = message.guild;



const online =
guild.members.cache.filter(
m=>m.presence?.status !== "offline"
).size;



const embed = new EmbedBuilder()

.setColor("#5865F2")

.setTitle("🌐 Sunucu Bilgileri")

.setThumbnail(
guild.iconURL()
)

.addFields(

{
name:"👑 Kurucu",
value:`<@${OWNER_ID}>`,
inline:false
},

{
name:"👥 Toplam Üye",
value:`${guild.memberCount}`,
inline:true
},

{
name:"🟢 Aktif Üye",
value:`${online}`,
inline:true
},

{
name:"💬 Kanal",
value:`${guild.channels.cache.size}`,
inline:true
},

{
name:"🎭 Rol",
value:`${guild.roles.cache.size}`,
inline:true
},

{
name:"📅 Oluşturulma",
value:
`<t:${Math.floor(guild.createdTimestamp/1000)}:R>`,
inline:false
}

)

.setTimestamp();



message.reply({

embeds:[embed]

});


});
/* ===========================
          !ROLEALL
=========================== */

client.on("messageCreate", async message => {

    if(message.author.bot) return;


    if(message.content.startsWith("!roleall")) {


        if(!message.member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )) return;



        const role =
        message.mentions.roles.first();



        if(!role)
            return message.reply(
                "❌ Kullanım: `!roleall @rol`"
            );



        await message.guild.members.fetch();



        let count = 0;



        for(const member of message.guild.members.cache.values()){


            if(member.user.bot) continue;


            await member.roles.add(role)
            .catch(()=>{});


            count++;

        }



        message.reply(
`✅ **${role.name}** rolü verildi.

👥 İşlem yapılan kişi:
**${count}**`
        );

    }


});
/* ===========================
        !UNROLEALL
=========================== */

client.on("messageCreate", async message => {


    if(message.author.bot) return;


    if(message.content.startsWith("!unroleall")) {



        if(!message.member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )) return;




        const role =
        message.mentions.roles.first();




        if(!role)

            return message.reply(
                "❌ Kullanım: `!unroleall @rol`"
            );




        await message.guild.members.fetch();




        let count = 0;




        for(const member of message.guild.members.cache.values()){


            if(member.user.bot) continue;



            await member.roles.remove(role)
            .catch(()=>{});



            count++;

        }




        message.reply(
`✅ **${role.name}** rolü alındı.

👥 İşlem yapılan kişi:
**${count}**`
        );


    }


});
/* ===========================
              !IP
=========================== */

client.on("messageCreate", async message => {


    if(message.author.bot) return;


    if(message.content !== "!ip")
        return;



    const embed = new EmbedBuilder()

    .setColor("#00FF88")

    .setTitle("🌐 PL Minecraft Sunucusu")

    .setDescription(
`━━━━━━━━━━━━━━━━

☕ **Java Edition**

🔗 IP:
**Yakında**

━━━━━━━━━━━━━━━━

📱 **Bedrock Edition**

🔗 IP:
**Yakında**

🔌 Port:
**Yakında**

━━━━━━━━━━━━━━━━

⭐ Sunucu:
**PL**

🎮 Oyun Modu:
**Yakında**

━━━━━━━━━━━━━━━━`
    )


    .setThumbnail(
        client.user.displayAvatarURL()
    )


    .setFooter({

        text:"AEGISNW Network"

    })


    .setTimestamp();



    message.reply({

        embeds:[embed]

    });



});
/* ===========================
       HOŞGELDİN SİSTEMİ
=========================== */

client.on("guildMemberAdd", async member => {


    const channel =
    member.guild.channels.cache.find(
        ch => ch.name === "💬・sohbet"
    );


    if(!channel) return;



    const embed = new EmbedBuilder()

    .setColor("#5865F2")

    .setTitle("👋 Yeni Üye Katıldı")

    .setDescription(
`Hoş geldin ${member}!

🎉 Aramıza katıldığın için mutluyuz.

👥 Sunucumuzda:
**${member.guild.memberCount}** kişi bulunuyor.`
    )


    .setThumbnail(
        member.user.displayAvatarURL()
    )


    .setTimestamp();



    channel.send({

        embeds:[embed]

    });



});
/* ===========================
          SELAM SİSTEMİ
=========================== */

client.on("messageCreate", async message=>{


    if(message.author.bot)
        return;



    const text =
    message.content.toLowerCase();



    const greetings = [

        "sa",

        "selam",

        "selamün aleyküm",

        "selamun aleykum",

        "s.a"

    ];



    if(greetings.includes(text)){


        message.reply({

            content:
            `👋 Aleyküm selam ${message.author}! Hoş geldin.`

        });


    }


});
/* ===========================
        SPAM SİSTEMİ
=========================== */


const spamUsers = new Map();



client.on("messageCreate", async message => {


    if(message.author.bot)
        return;


    if(
        message.member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    )
        return;



    const userId = message.author.id;



    if(!spamUsers.has(userId)){

        spamUsers.set(userId, []);

    }



    const messages = spamUsers.get(userId);



    messages.push(Date.now());



    const recentMessages =
    messages.filter(
        time => Date.now() - time < 5000
    );



    spamUsers.set(
        userId,
        recentMessages
    );



    if(recentMessages.length >= 6){


        await message.channel.bulkDelete(6)
        .catch(()=>{});



        await message.member.timeout(

            60 * 1000,

            "Spam koruması"

        )
        .catch(()=>{});



        const warn =
        await message.channel.send(

`🚨 ${message.author}

Spam yaptığın için **1 dakika susturuldun**.`

        );



        setTimeout(()=>{

            warn.delete()
            .catch(()=>{});

        },5000);



        spamUsers.delete(userId);


    }



});
/* ===========================
       KÜFÜR FİLTRESİ
=========================== */


const badWords = [

    "amk",
    "aq",
    "orospu",
    "siktir",
    "yarrak"

];



client.on("messageCreate", async message=>{


    if(message.author.bot)
        return;



    const content =
    message.content.toLowerCase();



    if(
        badWords.some(
            word => content.includes(word)
        )
    ){


        await message.delete()
        .catch(()=>{});



        message.channel.send(

`⚠️ ${message.author}

Lütfen küfür kullanma.`

        )
        .then(msg=>{

            setTimeout(()=>{

                msg.delete()
                .catch(()=>{});

            },4000);

        });


    }


});
/* ===========================
        MESAJ SİLME LOG
=========================== */


client.on("messageDelete", async message => {


    if(!message.guild)
        return;


    if(message.author?.bot)
        return;



    const channel =
    message.guild.channels.cache.get(
        LOG_CHANNEL
    );


    if(!channel)
        return;



    const embed = new EmbedBuilder()

    .setColor("Red")

    .setTitle("🗑️ Mesaj Silindi")

    .addFields(

        {
            name:"👤 Kullanıcı",
            value:`${message.author || "Bilinmiyor"}`,
            inline:true
        },

        {
            name:"📌 Kanal",
            value:`${message.channel}`,
            inline:true
        },

        {
            name:"💬 Mesaj",
            value:
            message.content || "İçerik yok"
        }

    )

    .setTimestamp();



    channel.send({

        embeds:[embed]

    });


});
/* ===========================
       MESAJ EDİT LOG
=========================== */


client.on("messageUpdate", async (oldMessage,newMessage)=>{


    if(!oldMessage.guild)
        return;


    if(oldMessage.author?.bot)
        return;



    if(
        oldMessage.content === newMessage.content
    )
        return;



    const channel =
    oldMessage.guild.channels.cache.get(
        LOG_CHANNEL
    );



    if(!channel)
        return;



    const embed = new EmbedBuilder()


    .setColor("Yellow")


    .setTitle("✏️ Mesaj Düzenlendi")


    .addFields(

    {

        name:"👤 Kullanıcı",

        value:`${oldMessage.author}`

    },

    {

        name:"📍 Kanal",

        value:`${oldMessage.channel}`

    },

    {

        name:"⌛ Eski Mesaj",

        value:
        oldMessage.content || "Yok"

    },

    {

        name:"🆕 Yeni Mesaj",

        value:
        newMessage.content || "Yok"

    }

    )


    .setTimestamp();



    channel.send({

        embeds:[embed]

    });



});
/* ===========================
          BAN LOG
=========================== */

client.on("guildBanAdd", async ban => {


    const channel =
    ban.guild.channels.cache.get(
        LOG_CHANNEL
    );


    if(!channel) return;



    const embed = new EmbedBuilder()

    .setColor("Red")

    .setTitle("🔨 Üye Banlandı")

    .setDescription(
`👤 Kullanıcı:

${ban.user}

🆔 ID:
${ban.user.id}`
    )

    .setTimestamp();



    channel.send({

        embeds:[embed]

    });



});
/* ===========================
          KICK LOG
=========================== */


client.on("guildMemberRemove", async member=>{


    const channel =
    member.guild.channels.cache.get(
        LOG_CHANNEL
    );


    if(!channel) return;



    const embed = new EmbedBuilder()

    .setColor("Orange")

    .setTitle("👢 Üye Ayrıldı / Kick olabilir")

    .setDescription(
`👤 Kullanıcı:

${member.user}

🆔 ID:
${member.id}`
    )

    .setTimestamp();



    channel.send({

        embeds:[embed]

    });


});
/* ===========================
          MUTE LOG
=========================== */


client.on("guildMemberUpdate",
async (oldMember,newMember)=>{


    if(
        !oldMember.communicationDisabledUntil &&
        newMember.communicationDisabledUntil
    ){


        const channel =
        newMember.guild.channels.cache.get(
            LOG_CHANNEL
        );


        if(!channel) return;



        const embed = new EmbedBuilder()

        .setColor("DarkRed")

        .setTitle("🔇 Kullanıcı Susturuldu")

        .setDescription(
`${newMember.user}

⏳ Süre:
${newMember.communicationDisabledUntil}`
        )

        .setTimestamp();



        channel.send({

            embeds:[embed]

        });


    }


});
/* ===========================
        UNMUTE LOG
=========================== */


client.on("guildMemberUpdate",
async (oldMember,newMember)=>{


if(
oldMember.communicationDisabledUntil &&
!newMember.communicationDisabledUntil
){


const channel =
newMember.guild.channels.cache.get(
LOG_CHANNEL
);



if(!channel) return;



const embed = new EmbedBuilder()

.setColor("Green")

.setTitle("🔊 Susturma Kaldırıldı")

.setDescription(
`${newMember.user} artık konuşabilir.`
)

.setTimestamp();



channel.send({

embeds:[embed]

});



}



});
/* ===========================
       TICKET TRANSCRIPT
=========================== */


client.on("interactionCreate", async interaction => {


    if(!interaction.isButton())
        return;


    if(interaction.customId !== "ticket_close")
        return;



    const channel = interaction.channel;



    const ownerId = channel.topic;



    const messages =
    await channel.messages.fetch({
        limit:100
    });



    let transcript = "";



    messages
    .reverse()
    .forEach(msg=>{


        transcript +=
`${msg.author.tag}: ${msg.content || "[Embed / Dosya]"}

`;


    });



    const logChannel =
    interaction.guild.channels.cache.get(
        TICKET_LOG_CHANNEL
    );



    const embed = new EmbedBuilder()

    .setColor("Red")

    .setTitle("🎫 Ticket Kapatıldı")

    .addFields(

        {
            name:"👤 Ticket Sahibi",
            value:`<@${ownerId}>`,
            inline:true
        },

        {
            name:"🔒 Kapatan",
            value:`${interaction.user}`,
            inline:true
        },

        {
            name:"📌 Kanal",
            value:channel.name,
            inline:true
        }

    )

    .setTimestamp();



    if(logChannel){


        logChannel.send({

            embeds:[embed]

        });


    }



    // Kurucuya DM

    const owner =
    await client.users.fetch(
        OWNER_ID
    ).catch(()=>null);



    if(owner){


        owner.send({

            embeds:[embed],

            content:
`📄 Ticket Transcript:

\`\`\`
${transcript.slice(0,3500)}
\`\`\``

        }).catch(()=>{});


    }



});
/* ===========================
          BOT LOGIN
=========================== */

client.login(process.env.TOKEN);
