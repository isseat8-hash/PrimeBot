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
        GatewayIntentBits.GuildInvites,

    ]

});


// =====================
// CONFIG
// =====================

const CONFIG = {


    PREFIX:"!",


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


    LOG_CHANNEL:
    "",


    MC_IP:
    "Yakında"

};



// =====================
// STORAGE
// =====================

const activeTickets =
new Map();


const warns =
new Collection();


const inviteCache =
new Collection();


const giveawayUsers =
new Map();



// =====================
// READY
// =====================


client.once("ready",async()=>{


    console.log(
        `✅ ${client.user.tag} aktif`
    );


    client.user.setActivity(
        "AEGISNW | !ip",
        {
            type:0
        }
    );


    for(
        const guild of client.guilds.cache.values()
    ){

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


        }catch(e){

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


        if(role)
        await member.roles.add(role);


    }catch(err){

        console.log(
            "Otorol:",
            err.message
        );

    }


});




// =====================
// MESSAGE CREATE
// =====================


client.on(
"messageCreate",
async(message)=>{


    if(
        message.author.bot ||
        !message.guild
    )
    return;



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


        .setDescription(

`
☕ **Java Sunucusu**

📡 IP:
\`Yakında\`


📱 **Bedrock Sunucusu**

📡 IP:
\`Yakında\`


🔌 **Port**

\`Yakında\`
`

        )


        .setColor("#5865F2")


        .setTimestamp();



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



        const embed =
        new EmbedBuilder()

        .setTitle(
            `${user.username} Avatar`
        )

        .setImage(
            user.displayAvatarURL({
                size:1024
            })
        )

        .setColor("#5865F2");


        return message.channel.send({

            embeds:[embed]

        });


    }
    // =====================
// SERVER INFO
// =====================

if(command === "!serverinfo"){


    const owner =
    await message.guild.fetchOwner();


    const embed =
    new EmbedBuilder()

    .setTitle(
        "🌐 AEGISNW Sunucu Bilgileri"
    )

    .addFields(

        {
            name:"👑 Kurucu",
            value:`<@${CONFIG.OWNER}>`,
            inline:true
        },

        {
            name:"👥 Üye Sayısı",
            value:`${message.guild.memberCount}`,
            inline:true
        },

        {
            name:"🟢 Aktif Üye",
            value:
            `${message.guild.presences.cache.size}`,
            inline:true
        },

        {
            name:"📅 Kuruluş",
            value:
            `<t:${Math.floor(message.guild.createdTimestamp/1000)}:R>`,
            inline:true
        }

    )

    .setColor("#5865F2")
    .setTimestamp();



    return message.channel.send({

        embeds:[embed]

    });

}



// =====================
// USER INFO
// =====================

if(command === "!userinfo"){


    const member =
    message.mentions.members.first()
    ||
    message.member;



    const embed =
    new EmbedBuilder()

    .setTitle(
        `👤 ${member.user.username}`
    )

    .setThumbnail(
        member.user.displayAvatarURL()
    )

    .addFields(

        {
            name:"🆔 ID",
            value:member.id,
            inline:true
        },

        {
            name:"📅 Katılma",
            value:
            `<t:${Math.floor(member.joinedTimestamp/1000)}:R>`,
            inline:true
        },

        {
            name:"🎭 Roller",
            value:
            member.roles.cache
            .filter(r=>r.id !== message.guild.id)
            .map(r=>r)
            .join(" ") || "Yok"
        }

    )

    .setColor("#5865F2");


    return message.channel.send({

        embeds:[embed]

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
    )
    return;


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


    const msg =
    await message.channel.send(
        `🗑️ ${amount} mesaj silindi.`
    );


    setTimeout(()=>{

        msg.delete()
        .catch(()=>{});

    },3000);


}



// =====================
// LOCK
// =====================

if(command === "!lock"){


    if(
        !message.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    )
    return;


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
    )
    return;


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
// KICK
// =====================

if(command === "!kick"){


    if(
        !message.member.permissions.has(
            PermissionFlagsBits.KickMembers
        )
    )
    return;


    const member =
    message.mentions.members.first();


    if(!member)
    return;


    await member.kick();


    return message.reply(
        "✅ Üye atıldı."
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
    )
    return;


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
// WARN
// =====================

if(command === "!warn"){


    const member =
    message.mentions.members.first();


    if(!member)
    return;


    if(!warns.has(member.id))
    warns.set(member.id,0);



    warns.set(
        member.id,
        warns.get(member.id)+1
    );


    return message.reply(

        `⚠️ ${member} uyarıldı.
Toplam warn: ${warns.get(member.id)}`

    );


}



// =====================
// MUTE
// =====================

if(command === "!mute"){


    const member =
    message.mentions.members.first();


    if(!member)
    return;


    let role =
    message.guild.roles.cache.find(
        r=>r.name==="Muted"
    );



    if(!role){

        role =
        await message.guild.roles.create({

            name:"Muted",

            permissions:[]

        });


        message.guild.channels.cache.forEach(
            async(channel)=>{

                await channel.permissionOverwrites.create(
                    role,
                    {
                        SendMessages:false
                    }
                );

            }
        );

    }



    await member.roles.add(role);


    return message.reply(
        `🔇 ${member} susturuldu.`
    );


}



// =====================
// UNMUTE
// =====================

if(command === "!unmute"){


    const member =
    message.mentions.members.first();


    if(!member)
    return;


    const role =
    message.guild.roles.cache.find(
        r=>r.name==="Muted"
    );


    if(role)
    await member.roles.remove(role);


    return message.reply(
        `🔊 ${member} susturması kaldırıldı.`
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
        "❌ Bu komut sadece yöneticiler içindir."
    );



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🎫 AEGISNW Destek Merkezi"
    )

    .setDescription(

`Destek almak için aşağıdaki butonlardan kategori seçin.

🐛 Bug Bildirme
⚔️ Küfür / Hile Bildirme
💬 Genel Destek
🎁 Ödül Talep`

    )

    .setColor("#5865F2")
    .setFooter({
        text:"AEGISNW Support"
    });



    const row =
    new ActionRowBuilder()

    .addComponents(

        new ButtonBuilder()
        .setCustomId("ticket_bug")
        .setLabel("🐛 Bug Bildirme")
        .setStyle(ButtonStyle.Danger),


        new ButtonBuilder()
        .setCustomId("ticket_report")
        .setLabel("⚔️ Küfür/Hile")
        .setStyle(ButtonStyle.Danger),


        new ButtonBuilder()
        .setCustomId("ticket_support")
        .setLabel("💬 Genel Destek")
        .setStyle(ButtonStyle.Primary),


        new ButtonBuilder()
        .setCustomId("ticket_reward")
        .setLabel("🎁 Ödül Talep")
        .setStyle(ButtonStyle.Success)

    );



    return message.channel.send({

        embeds:[embed],
        components:[row]

    });


}




// =====================
// ANNOUNCE
// =====================

if(command === "!announce"){


    if(
        !message.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    )
    return;



    const text =
    args.join(" ");



    if(!text)
    return message.reply(
        "❌ Duyuru yaz."
    );



    const embed =
    new EmbedBuilder()

    .setTitle(
        "📢 AEGISNW DUYURU"
    )

    .setDescription(text)

    .setColor("#FEE75C")

    .setTimestamp();



    const duyuru =
    message.guild.channels.cache.get(
        CONFIG.DUYURU
    );


    const sohbet =
    message.guild.channels.cache.get(
        CONFIG.SOHBET
    );



    if(duyuru){

        duyuru.send({

            content:
            "@everyone @here",

            embeds:[embed]

        });

    }



    if(sohbet){

        sohbet.send({

            embeds:[embed]

        });

    }



    return message.reply(
        "✅ Duyuru gönderildi."
    );


}





// =====================
// INVITE
// =====================

if(command === "!invite"){


    let total = 0;


    const invites =
    await message.guild.invites.fetch();


    invites.forEach(inv=>{


        if(
            inv.inviter?.id === message.author.id
        ){

            total += inv.uses || 0;

        }


    });



    const embed =
    new EmbedBuilder()

    .setTitle(
        "📨 Davet İstatistikleri"
    )

    .setDescription(

`👤 Kullanıcı:
${message.author}

📨 Toplam Davet:
**${total}**`

    )

    .setColor("#5865F2");



    return message.channel.send({

        embeds:[embed]

    });


}






// =====================
// ROLE ALL
// =====================

if(command === "!roleall"){


    if(
        !message.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    )
    return;



    const role =
    message.mentions.roles.first();



    if(!role)
    return message.reply(
        "Rol etiketle."
    );



    await message.guild.members.fetch();



    message.guild.members.cache.forEach(
        async(member)=>{


            if(!member.user.bot){

                await member.roles.add(role)
                .catch(()=>{});

            }


        }
    );


    return message.reply(
        "✅ Rol dağıtımı başladı."
    );


}



// =====================
// UNROLE ALL
// =====================

if(command === "!unroleall"){


    if(
        !message.member.permissions.has(
            PermissionFlagsBits.Administrator
        )
    )
    return;



    const role =
    message.mentions.roles.first();



    if(!role)
    return;



    await message.guild.members.fetch();



    message.guild.members.cache.forEach(
        async(member)=>{


            await member.roles.remove(role)
            .catch(()=>{});


        }
    );


    return message.reply(
        "✅ Rol alma başladı."
    );


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
    // TICKET OPEN
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



        const embed =
        new EmbedBuilder()

        .setTitle(
            `🎫 ${type} Ticket`
        )

        .setDescription(

`Merhaba ${interaction.user}

Yetkililer en kısa sürede ilgilenecek.`

        )

        .setColor("#5865F2");



        const row =
        new ActionRowBuilder()

        .addComponents(

            new ButtonBuilder()

            .setCustomId("ticket_close")

            .setLabel("🔒 Ticket Kapat")

            .setStyle(ButtonStyle.Danger)

        );



        await channel.send({

            embeds:[embed],
            components:[row]

        });



        return interaction.reply({

            content:
            `✅ Ticket oluşturuldu: ${channel}`,

            ephemeral:true

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
    const winners = Number(args[1]);
    const prize = args.slice(2).join(" ");



    if(
        !time ||
        !winners ||
        !prize
    )
    return message.reply(
        "Kullanım: !cekilis 1d 1 Nitro"
    );



    const joined = new Set();



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🎉 AEGISNW Çekiliş"
    )

    .setDescription(

`🎁 Ödül:
**${prize}**

🏆 Kazanan:
${winners}

⏳ Süre:
${time}

Katılmak için butona basın.`

    )

    .setColor("#FEE75C");



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

        embeds:[embed],

        components:[row]

    });



    const collector =
    msg.createMessageComponentCollector({

        time:ms(time)

    });



    collector.on(
    "collect",
    async(i)=>{


        if(joined.has(i.user.id)){

            return i.reply({

                content:
                "❌ Zaten katıldın.",

                ephemeral:true

            });

        }


        joined.add(i.user.id);



        row.components[0]
        .setLabel(
            `🎉 Katıl (${joined.size})`
        );


        await msg.edit({

            components:[row]

        });


        i.reply({

            content:
            "🎉 Çekilişe katıldın!",

            ephemeral:true

        });


    });



    collector.on(
    "end",
    ()=>{


        if(joined.size === 0){

            return message.channel.send(
                "❌ Katılan olmadı."
            );

        }



        const users =
        [...joined];


        const win = [];


        for(
            let i=0;
            i<Math.min(
                winners,
                users.length
            );
            i++
        ){

            win.push(

                users.splice(

                    Math.floor(
                        Math.random()*users.length
                    ),

                    1

                )[0]

            );

        }



        message.channel.send(

`🎊 **Çekiliş Bitti!**

🏆 Kazananlar:
${win.map(x=>`<@${x}>`).join(", ")}

🎁 Ödül:
${prize}

🎫 Ödülünüzü almak için ticket açınız.`

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
    return message.reply(
        "Ödül yaz."
    );



    const row =
    new ActionRowBuilder()

    .addComponents(

        new ButtonBuilder()

        .setCustomId("drop_button")

        .setLabel("🎁 Ödülü Al")

        .setStyle(ButtonStyle.Success)

    );



    const embed =
    new EmbedBuilder()

    .setTitle(
        "🎁 AEGISNW DROP"
    )

    .setDescription(

`Ödül:

**${prize}**

İlk basan kişi kazanır!`

    )

    .setColor("#00FF00");



    const msg =
    await message.channel.send({

        embeds:[embed],

        components:[row]

    });



    const collector =
    msg.createMessageComponentCollector({

        max:1

    });



    collector.on(
    "collect",
    async(i)=>{


        row.components[0]
        .setDisabled(true);



        await msg.edit({

            components:[row]

        });



        i.reply(

`🎉 Tebrikler ${i.user}!

🎁 Ödül:
**${prize}**

🎫 Ödülünüzü almak için ticket açınız.`

        );


    });


}





// =====================
// BUTTON SYSTEM CLOSE
// =====================

});



// =====================
// LOGIN
// =====================

client.login(
    process.env.TOKEN
);
