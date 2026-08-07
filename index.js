require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ChannelType,
    Collection
} = require("discord.js");

const ms = require("ms");


const client = new Client({

    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites
    ]

});


// =====================
// CONFIG
// =====================

const CONFIG = {

    ONERI_KANAL:
    "1534594853751492832",

    OTOROL:
    "1534594823686717733",

    OWNER:
    "1339146423433953300",

    DUYURU:
    "1535026905575723068",

    SOHBET:
    "1534594846445146193",

    TICKET_CATEGORY:
    "1534594837884698814",

    MC_IP:
    "Yakında"

};


// =====================
// STORAGE
// =====================

const activeTickets = new Map();

const warns = new Collection();

const inviteCache = new Collection();


// =====================
// READY
// =====================

client.once("ready", async()=>{

    console.log(
        `✅ ${client.user.tag} aktif`
    );


    client.user.setActivity(
        "AEGISNW | !ip",
        {
            type:0
        }
    );


    for(const guild of client.guilds.cache.values()){

        try{

            const invites =
            await guild.invites.fetch();


            inviteCache.set(
                guild.id,
                new Collection(
                    invites.map(
                        x=>[
                            x.code,
                            x.uses
                        ]
                    )
                )
            );


        }catch(err){

            console.log(
                "Invite alınamadı"
            );

        }

    }

});


// =====================
// OTOROL
// =====================

client.on(
"guildMemberAdd",
async(member)=>{

    try{

        const role =
        member.guild.roles.cache.get(
            CONFIG.OTOROL
        );


        if(role){

            await member.roles.add(role);

        }


    }catch(err){

        console.log(
            "Otorol hatası:",
            err.message
        );

    }

});
client.on(
"messageCreate",
async(message)=>{

    if(
        message.author.bot ||
        !message.guild
    ) return;


    const args =
    message.content
    .trim()
    .split(/ +/);


    const command =
    args.shift()
    .toLowerCase();



    // =====================
    // PING
    // =====================

    if(command === "!ping"){

        return message.reply(
            `🏓 Pong! ${client.ws.ping}ms`
        );

    }



    // =====================
    // IP
    // =====================

    if(command === "!ip"){

        const embed =
        new EmbedBuilder()

        .setTitle(
            "⚔️ AEGISNW Network"
        )

        .setDescription(`
☕ **Java Sunucusu**

📡 IP:
\`Yakında\`

📱 **Bedrock Sunucusu**

📡 IP:
\`Yakında\`

🔌 Port:
\`Yakında\`
        `)

        .setColor("#5865F2");


        return message.channel.send({
            embeds:[embed]
        });

    }



    // =====================
    // AVATAR
    // =====================

    if(command === "!avatar"){

        const user =
        message.mentions.users.first()
        ||
        message.author;


        return message.channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle(
                    `${user.username} Avatar`
                )

                .setImage(
                    user.displayAvatarURL({
                        size:1024
                    })
                )

                .setColor("#5865F2")

            ]

        });

    }



    // =====================
    // CLEAR
    // =====================

    if(command === "!clear"){

        if(
            !message.member.permissions.has(
                PermissionFlagsBits.ManageMessages
            )
        ) return;


        const amount =
        Number(args[0]);


        if(!amount)
        return message.reply(
            "❌ Sayı gir."
        );


        await message.channel.bulkDelete(
            amount,
            true
        );


        return message.reply(
            `🗑️ ${amount} mesaj silindi.`
        );

    }



    // =====================
    // LOCK
    // =====================

    if(command === "!lock"){

        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) return;


        await message.channel.permissionOverwrites.edit(

            message.guild.roles.everyone,

            {
                SendMessages:false
            }

        );


        return message.reply(
            "🔒 Kanal kilitlendi."
        );

    }



    // =====================
    // UNLOCK
    // =====================

    if(command === "!unlock"){

        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) return;


        await message.channel.permissionOverwrites.edit(

            message.guild.roles.everyone,

            {
                SendMessages:true
            }

        );


        return message.reply(
            "🔓 Kanal açıldı."
        );

    }



    // =====================
    // BAN
    // =====================

    if(command === "!ban"){

        if(
            !message.member.permissions.has(
                PermissionFlagsBits.BanMembers
            )
        ) return;


        const member =
        message.mentions.members.first();


        if(!member)
        return;


        await member.ban();


        return message.reply(
            "🔨 Üye banlandı."
        );

    }



    // =====================
    // KICK
    // =====================

    if(command === "!kick"){

        if(
            !message.member.permissions.has(
                PermissionFlagsBits.KickMembers
            )
        ) return;


        const member =
        message.mentions.members.first();


        if(!member)
        return;


        await member.kick();


        return message.reply(
            "👢 Üye atıldı."
        );

    }
        // =====================
    // TICKET PANEL
    // =====================

    if(command === "!ticket" || command === "!ticketpanel"){


        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        )
        return message.reply(
            "❌ Yetkin yok."
        );


        const embed =
        new EmbedBuilder()

        .setTitle(
            "🎫 AEGISNW Destek Merkezi"
        )

        .setDescription(`
Destek almak için kategori seç:

🐛 Bug Bildirme
⚔️ Küfür / Hile
💬 Genel Destek
🎁 Ödül Talep
        `)

        .setColor("#5865F2");



        const row =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()
            .setCustomId("ticket_bug")
            .setLabel("🐛 Bug")
            .setStyle(ButtonStyle.Danger),


            new ButtonBuilder()
            .setCustomId("ticket_report")
            .setLabel("⚔️ Küfür/Hile")
            .setStyle(ButtonStyle.Danger),


            new ButtonBuilder()
            .setCustomId("ticket_support")
            .setLabel("💬 Destek")
            .setStyle(ButtonStyle.Primary),


            new ButtonBuilder()
            .setCustomId("ticket_reward")
            .setLabel("🎁 Ödül")
            .setStyle(ButtonStyle.Success)

        );


        return message.channel.send({

            embeds:[embed],

            components:[row]

        });

    }



    // =====================
    // PANEL
    // =====================

    if(command === "!panel"){


        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        )
        return;


        const embed =
        new EmbedBuilder()

        .setTitle(
            "⚔️ AEGISNW Yönetim Paneli"
        )

        .setDescription(`
🗑️ Clear
🔒 Lock
🔓 Unlock
🎫 Ticket
🎉 Çekiliş
🎁 Drop
👥 Rol Yönetimi
        `)

        .setColor("#5865F2");


        return message.channel.send({

            embeds:[embed]

        });

    }



    // =====================
    // ÇEKİLİŞ
    // =====================

    if(command === "!cekilis"){


        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        )
        return;


        const time = args[0];
        const winnerCount = Number(args[1]);
        const prize = args.slice(2).join(" ");



        if(!time || !winnerCount || !prize)
        return message.reply(
            "!cekilis 1d 1 Nitro"
        );


        const users = new Set();



        const row =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("giveaway_join")

            .setLabel("🎉 Katıl (0)")

            .setStyle(ButtonStyle.Primary)

        );



        const msg =
        await message.channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle("🎉 AEGISNW Çekiliş")

                .setDescription(
`
🎁 Ödül:
**${prize}**

🏆 Kazanan:
${winnerCount}

⏳ Süre:
${time}
`
                )

                .setColor("#FEE75C")

            ],

            components:[row]

        });



        const collector =
        msg.createMessageComponentCollector({

            time:ms(time)

        });


        collector.on("collect",async(i)=>{

            users.add(i.user.id);


            await i.reply({

                content:"🎉 Katıldın!",

                ephemeral:true

            });


        });



        collector.on("end",()=>{


            const list=[...users];


            if(!list.length)
            return;


            const winner =
            list[Math.floor(Math.random()*list.length)];



            message.channel.send(

`
🎊 Kazanan:
<@${winner}>

🎁 Ödül:
${prize}

🎫 Ödül için ticket açınız.
`

            );


        });


    }



    // =====================
    // DROP
    // =====================

    if(command === "!drop"){


        if(
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        )
        return;


        const prize =
        args.join(" ");


        if(!prize)
        return;


        const row =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("drop_win")

            .setLabel("🎁 Al")

            .setStyle(ButtonStyle.Success)

        );



        const msg =
        await message.channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle("🎁 AEGISNW DROP")

                .setDescription(
                    `Ödül: **${prize}**`
                )

                .setColor("#00FF00")

            ],

            components:[row]

        });



        const collector =
        msg.createMessageComponentCollector({

            max:1

        });



        collector.on("collect",async(i)=>{


            await i.reply(

`
🎉 ${i.user} kazandı!

🎁 Ödül:
${prize}

🎫 Ticket açarak alabilirsiniz.
`

            );


        });


    }
    });


// =====================
// BUTTON SYSTEM
// =====================

client.on(
"interactionCreate",
async(interaction)=>{


    if(!interaction.isButton())
    return;



    // =====================
    // TICKET AÇMA
    // =====================

    if(
        interaction.customId.startsWith("ticket_")
    ){


        if(
            activeTickets.has(
                interaction.user.id
            )
        ){

            return interaction.reply({

                content:
                "❌ Zaten açık ticketin var.",

                ephemeral:true

            });

        }



        const type =
        interaction.customId
        .replace("ticket_","")
        .toUpperCase();



        const channel =
        await interaction.guild.channels.create({

            name:
            `ticket-${interaction.user.username}`,

            type:
            ChannelType.GuildText,

            parent:
            CONFIG.TICKET_CATEGORY,


            permissionOverwrites:[

                {

                    id:
                    interaction.guild.id,

                    deny:[
                        PermissionFlagsBits.ViewChannel
                    ]

                },


                {

                    id:
                    interaction.user.id,

                    allow:[

                        PermissionFlagsBits.ViewChannel,

                        PermissionFlagsBits.SendMessages,

                        PermissionFlagsBits.ReadMessageHistory

                    ]

                }

            ]

        });



        activeTickets.set(
            interaction.user.id,
            channel.id
        );



        await channel.send({

            embeds:[

                new EmbedBuilder()

                .setTitle(
                    `🎫 ${type} Ticket`
                )

                .setDescription(
                    `Merhaba ${interaction.user}\n\nYetkililer ilgilenecek.`
                )

                .setColor("#5865F2")

            ],

            components:[

                new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                    .setCustomId("ticket_close")

                    .setLabel("🔒 Kapat")

                    .setStyle(ButtonStyle.Danger)

                )

            ]

        });



        return interaction.reply({

            content:
            `✅ Ticket açıldı: ${channel}`,

            ephemeral:true

        });


    }



    // =====================
    // TICKET KAPAT
    // =====================

    if(
        interaction.customId === "ticket_close"
    ){

        activeTickets.forEach(
            (channel,user)=>{

                if(
                    channel === interaction.channel.id
                ){

                    activeTickets.delete(user);

                }

            }
        );


        await interaction.reply(
            "🔒 Ticket kapanıyor..."
        );


        setTimeout(()=>{

            interaction.channel.delete()
            .catch(()=>{});

        },3000);


    }



    // =====================
    // ÇEKİLİŞ BUTONU
    // =====================

    if(
        interaction.customId === "giveaway_join"
    ){

        return interaction.reply({

            content:
            "🎉 Çekilişe katıldın!",

            ephemeral:true

        });

    }



    // =====================
    // DROP BUTONU
    // =====================

    if(
        interaction.customId === "drop_win"
    ){

        return interaction.reply({

            content:
            `🎁 ${interaction.user} kazandı!\n\n🎫 Ödül için ticket açınız.`,

            ephemeral:false

        });

    }


});


client.login(
process.env.TOKEN
);
