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


const inviteStats =
new Collection();


const giveaways =
new Map();



// =====================
// READY
// =====================

client.once(
"ready",
async()=>{


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


        }catch(err){

            console.log(
                "Invite cache alınamadı"
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
            "Otorol hata:",
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
.split(/ +);



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
// SERVER INFO
// =====================

if(command === "!serverinfo"){


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
name:"👥 Üye",
value:`${message.guild.memberCount}`,
inline:true
},

{
name:"🟢 Aktif",
value:`${message.guild.presences.cache.size}`,
inline:true
}

)

.setColor("#5865F2");



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
value:member.id
},

{
name:"📅 Katılma",
value:
`<t:${Math.floor(member.joinedTimestamp/1000)}:R>`
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
return message.reply(
"Üye etiketle."
);


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
)
return;


const member =
message.mentions.members.first();


if(!member)
return message.reply(
"Üye etiketle."
);


await member.kick();


return message.reply(
"👢 Üye atıldı."
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
// 🛠 BUTONLU ADMIN PANEL
// =====================

if(command === "!panel"){


if(
!message.member.permissions.has(
PermissionFlagsBits.Administrator
)
)
return message.reply(
"❌ Bu panel sadece Administrator."
);



const embed =
new EmbedBuilder()

.setTitle(
"⚔️ AEGISNW Yönetim Paneli"
)

.setDescription(`

Sunucu yönetim paneli

📢 Duyuru
🗑️ Mesaj Temizleme
🔒 Kanal Yönetimi
📊 İstatistik
🎭 Rol Yönetimi
🎫 Ticket Yönetimi

`)

.setColor("#5865F2")

.setFooter({
text:"AEGISNW ADMIN PANEL"
});



const row1 =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("panel_clear")

.setLabel("🗑️ Temizle")

.setStyle(ButtonStyle.Danger),


new ButtonBuilder()

.setCustomId("panel_lock")

.setLabel("🔒 Kilitle")

.setStyle(ButtonStyle.Danger),


new ButtonBuilder()

.setCustomId("panel_unlock")

.setLabel("🔓 Aç")

.setStyle(ButtonStyle.Success)

);



const row2 =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("panel_stats")

.setLabel("📊 İstatistik")

.setStyle(ButtonStyle.Primary),


new ButtonBuilder()

.setCustomId("panel_announce")

.setLabel("📢 Duyuru")

.setStyle(ButtonStyle.Secondary),


new ButtonBuilder()

.setCustomId("panel_ticket")

.setLabel("🎫 Ticket")

.setStyle(ButtonStyle.Primary)

);



return message.channel.send({

embeds:[embed],

components:[
row1,
row2
]

});

}




// =====================
// 🎫 TICKET PANEL
// =====================

if(
command === "!ticket" ||
command === "!ticketpanel"
){


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

Destek almak için kategori seçin:

🐛 Bug Bildirme

⚔️ Küfür / Hile Bildirme

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
// TICKET AÇMA
// =====================

if(
command === "tickettest"
){
return;
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
"✅ Rol verme başladı."
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
    
// =====================
// BUTTON SYSTEM
// =====================

client.on(
"interactionCreate",
async(interaction)=>{


if(!interaction.isButton())
return;



// =====================
// TICKET AÇ
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

`Merhaba ${interaction.user}

Yetkililer kısa sürede ilgilenecek.`

)

.setColor("#5865F2")

],

components:[

new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId(
"ticket_close"
)

.setLabel(
"🔒 Kapat"
)

.setStyle(
ButtonStyle.Danger
)

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
(id,user)=>{


if(
id === interaction.channel.id
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
// DROP
// =====================

if(
interaction.customId === "drop_button"
){


return interaction.reply({

content:

`🎁 ${interaction.user} kazandı!

🎫 Ödülü almak için ticket açınız.`,

ephemeral:false

});


}




// =====================
// ÇEKİLİŞ KATIL
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


});
    
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



const time =
args[0];

const winnerCount =
Number(args[1]);

const prize =
args.slice(2).join(" ");



if(
!time ||
!winnerCount ||
!prize
)
return message.reply(
"!cekilis 1d 1 Nitro"
);



const users =
new Set();



const row =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId(
"giveaway_join"
)

.setLabel(
"🎉 Katıl (0)"
)

.setStyle(
ButtonStyle.Primary
)

);



const msg =
await message.channel.send({

embeds:[

new EmbedBuilder()

.setTitle(
"🎉 AEGISNW Çekiliş"
)

.setDescription(`

🎁 Ödül:
**${prize}**

🏆 Kazanan:
${winnerCount}

⏳ Süre:
${time}

Katılmak için butona bas.

`)

.setColor("#FEE75C")

],

components:[row]

});



const collector =
msg.createMessageComponentCollector({

time:ms(time)

});



collector.on(
"collect",
async(i)=>{


users.add(i.user.id);


row.components[0]
.setLabel(
`🎉 Katıl (${users.size})`
);



await msg.edit({

components:[row]

});


i.reply({

content:
"🎉 Katıldın!",

ephemeral:true

});


});



collector.on(
"end",
()=>{


const list =
[...users];


if(!list.length)
return;



const winners=[];



for(
let i=0;
i<Math.min(
winnerCount,
list.length
);
i++
){


winners.push(

list.splice(

Math.floor(
Math.random()*list.length
),

1

)[0]

);


}



message.channel.send(`

🎊 **Çekiliş Bitti**

🏆 Kazanan:

${winners.map(x=>`<@${x}>`).join(", ")}


🎁 Ödül:
${prize}


🎫 Ödül için ticket açınız.

`);

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

.setCustomId(
"drop_button"
)

.setLabel(
"🎁 Ödülü Al"
)

.setStyle(
ButtonStyle.Success
)

);



await message.channel.send({

embeds:[

new EmbedBuilder()

.setTitle(
"🎁 AEGISNW DROP"
)

.setDescription(

`Ödül:

**${prize}**

İlk basan kazanır.`

)

.setColor("#00FF00")

],

components:[row]

});


}



// =====================
// DUYURU
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
return;



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



message.reply(
"✅ Duyuru gönderildi."
);


}



// =====================
// INVITE
// =====================

if(command === "!invite"){


const invites =
await message.guild.invites.fetch();


let count=0;



invites.forEach(inv=>{


if(
inv.inviter &&
inv.inviter.id === message.author.id
){

count += inv.uses || 0;

}


});



return message.channel.send({

embeds:[

new EmbedBuilder()

.setTitle(
"📨 Davet İstatistik"
)

.setDescription(

`👤 Kullanıcı:
${message.author}


📨 Davet:
**${count}**`

)

.setColor("#5865F2")

]

});


}



// =====================
// LOGIN
// =====================

client.login(
process.env.TOKEN
);
