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


    ONERI_KANAL_ID:
    "1534594853751492832",


    OTOROL_ID:
    "1534594823686717733",


    KURUCU_ID:
    "1339146423433953300",


    DUYURU_KANAL_ID:
    "1535026905575723068",


    SOHBET_KANAL_ID:
    "1534594846445146193",



    // 🎫 TICKET

    TICKET_CATEGORY_ID:
    "1534594837884698814",


    TICKET_SUPPORT_ROLE:
    "",


    TICKET_LOG_CHANNEL:
    "",



    // 🛠 PANEL

    PANEL_ROLE:
    PermissionFlagsBits.Administrator

};




// =====================
// STORAGE
// =====================


const invites =
new Collection();


const activeTickets =
new Map();


const suggestionVotes =
new Map();


const giveaways =
new Map();




// =====================
// READY
// =====================


client.once(
"ready",
async()=>{


console.log(
`✅ ${client.user.tag} aktif!`
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


const inv =
await guild.invites.fetch();


invites.set(

guild.id,

new Collection(

inv.map(
(x)=>[
x.code,
x.uses
]
)

)

);


}catch(err){


console.log(
"Invite hatası:",
err.message
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
CONFIG.OTOROL_ID
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
// =====================
// MESSAGE SYSTEM
// =====================

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
"🌐 AEGISNW Sunucu Bilgileri"
)

.setColor("#5865F2")

.addFields(

{
name:"☕ Java IP",
value:"`Yakında`",
inline:true
},

{
name:"📱 Bedrock",
value:"`Yakında`",
inline:true
},

{
name:"🔌 Port",
value:"`Yakında`",
inline:true
}

)

.setTimestamp();



return message.channel.send({
embeds:[embed]
});

}




// =====================
// 🎫 TICKET PANEL
// =====================

if(command === "!ticketpanel"){


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

.setDescription(

`Destek almak için kategori seçin.

🐛 Bug Bildirme
💳 Ödeme
🤝 Partner
🎁 Ödül
❓ Diğer`

)

.setColor("#5865F2");



const row =
new ActionRowBuilder()

.addComponents(


new ButtonBuilder()

.setCustomId("ticket_bug")

.setLabel("🐛 Bug")

.setStyle(ButtonStyle.Danger),



new ButtonBuilder()

.setCustomId("ticket_payment")

.setLabel("💳 Ödeme")

.setStyle(ButtonStyle.Success),



new ButtonBuilder()

.setCustomId("ticket_partner")

.setLabel("🤝 Partner")

.setStyle(ButtonStyle.Primary),



new ButtonBuilder()

.setCustomId("ticket_prize")

.setLabel("🎁 Ödül")

.setStyle(ButtonStyle.Secondary),



new ButtonBuilder()

.setCustomId("ticket_other")

.setLabel("❓ Diğer")

.setStyle(ButtonStyle.Secondary)


);



return message.channel.send({

embeds:[embed],

components:[row]

});


}




// =====================
// 🛠 ADMIN PANEL
// =====================


if(command === "!panel"){


if(
!message.member.permissions.has(
CONFIG.PANEL_ROLE
)

)

return message.reply(
"❌ Bu panel sadece adminler içindir."
);



const embed =
new EmbedBuilder()

.setTitle(
"⚔️ AEGISNW Yönetim Paneli"
)

.setDescription(

`Sunucu yönetim işlemleri:

📢 Duyuru
🗑️ Mesaj Silme
🔒 Kanal Kilitleme
📊 İstatistik
👤 DM Gönderme
🎭 Rol Yönetimi`

)

.setColor("#2b2d31");




const row1 =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("panel_duyuru")

.setLabel("📢 Duyuru")

.setStyle(ButtonStyle.Primary),



new ButtonBuilder()

.setCustomId("panel_clear")

.setLabel("🗑️ Temizle")

.setStyle(ButtonStyle.Danger),



new ButtonBuilder()

.setCustomId("panel_lock")

.setLabel("🔒 Kilitle")

.setStyle(ButtonStyle.Danger)

);



const row2 =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("panel_stats")

.setLabel("📊 İstatistik")

.setStyle(ButtonStyle.Secondary),



new ButtonBuilder()

.setCustomId("panel_dm")

.setLabel("👤 DM")

.setStyle(ButtonStyle.Primary),



new ButtonBuilder()

.setCustomId("panel_role")

.setLabel("🎭 Rol Ver")

.setStyle(ButtonStyle.Success)

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
// INTERACTION SYSTEM
// =====================

client.on(
"interactionCreate",
async(interaction)=>{


if(!interaction.isButton())
return;




// =====================
// 🎫 TICKET AÇMA
// =====================


if(
interaction.customId.startsWith("ticket_")
&&
interaction.customId !== "ticket_close"
){


const userID =
interaction.user.id;



if(activeTickets.has(userID)){


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
CONFIG.TICKET_CATEGORY_ID,


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

userID,

channel.id

);




const embed =
new EmbedBuilder()

.setTitle(
`🎫 ${type} Ticket`
)

.setDescription(

`Merhaba ${interaction.user}

Yetkililer en kısa sürede ilgilenecek.

Kapatmak için butona bas.`

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
// 🎫 TICKET KAPAT
// =====================


if(
interaction.customId === "ticket_close"
){


await interaction.reply(
"🔒 Ticket kapatılıyor..."
);



activeTickets.forEach(
(id,user)=>{

if(id === interaction.channel.id){

activeTickets.delete(user);

}

});



setTimeout(()=>{

interaction.channel.delete()
.catch(()=>{});

},5000);



}




// =====================
// 🛠 PANEL BUTONLARI
// =====================


if(
interaction.customId.startsWith("panel_")
){



if(
!interaction.member.permissions.has(
PermissionFlagsBits.Administrator
)

){

return interaction.reply({

content:
"❌ Yetkin yok.",

ephemeral:true

});

}




if(
interaction.customId === "panel_stats"
){


const embed =
new EmbedBuilder()

.setTitle(
"📊 Sunucu İstatistikleri"
)

.addFields(

{
name:"Üye",
value:
`${interaction.guild.memberCount}`,
inline:true
},


{
name:"Kanal",
value:
`${interaction.guild.channels.cache.size}`,
inline:true
}


)

.setColor("#5865F2");



return interaction.reply({

embeds:[embed],

ephemeral:true

});


}




if(
interaction.customId === "panel_lock"
){


await interaction.channel.permissionOverwrites.edit(

interaction.guild.roles.everyone,

{

SendMessages:false

}

);



return interaction.reply({

content:
"🔒 Kanal kilitlendi.",

ephemeral:true

});


}




if(
interaction.customId === "panel_clear"
){


await interaction.channel.bulkDelete(
50,
true
);


return interaction.reply({

content:
"🗑️ Mesajlar temizlendi.",

ephemeral:true

});


}




if(
interaction.customId === "panel_duyuru"
){


return interaction.reply({

content:
"📢 Duyuru sistemi hazır.",

ephemeral:true

});


}




if(
interaction.customId === "panel_dm"
){


return interaction.reply({

content:
"👤 DM sistemi hazır.",

ephemeral:true

});


}




if(
interaction.customId === "panel_role"
){


return interaction.reply({

content:
"🎭 Rol sistemi hazır.",

ephemeral:true

});


}



}



});
    // =====================
// 💡 ÖNERİ SİSTEMİ
// =====================

if(command === "!öneri" || command === "!oneri"){


if(
message.channel.id !== CONFIG.ONERI_KANAL_ID
)

return message.reply(
"❌ Bu komut öneri kanalında kullanılabilir."
);



const text =
args.join(" ");



if(!text)
return message.reply(
"Bir öneri yaz."
);



message.delete()
.catch(()=>{});



const embed =
new EmbedBuilder()

.setAuthor({

name:
message.author.tag,

iconURL:
message.author.displayAvatarURL()

})

.setDescription(text)

.setColor("#5865F2")

.setTimestamp();



const row =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("oneri_evet")

.setLabel("✅ Evet (0)")

.setStyle(ButtonStyle.Success),


new ButtonBuilder()

.setCustomId("oneri_hayir")

.setLabel("❌ Hayır (0)")

.setStyle(ButtonStyle.Danger)

);



return message.channel.send({

embeds:[embed],

components:[row]

});


}





// =====================
// 🎉 ÇEKİLİŞ
// =====================

if(command==="!cekilis"){


if(
!message.member.permissions.has(
PermissionFlagsBits.Administrator
)

)
return;



const time=args[0];

const winnerCount=
Number(args[1]);

const prize=
args.slice(2).join(" ");



if(
!time ||
!winnerCount ||
!prize
)

return message.reply(
"`!cekilis 1h 1 Nitro`"
);



const embed =
new EmbedBuilder()

.setTitle(
`🎉 ${prize}`
)

.setDescription(

`Katılmak için butona basın.

Kazanan: ${winnerCount}

Süre: ${time}`

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



const users =
new Set();



msg.createMessageComponentCollector({

time:ms(time)

})

.on("collect",async(i)=>{


users.add(i.user.id);



await i.reply({

content:
"🎉 Çekilişe katıldın!",

ephemeral:true

});


row.components[0]
.setLabel(
`🎉 Katıl (${users.size})`
);



msg.edit({

components:[row]

});


})

.on("end",()=>{


const list =
[...users];



if(!list.length)

return message.channel.send(
"Kimse katılmadı."
);



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



message.channel.send(

`🎊 Kazananlar:
${winners.map(x=>`<@${x}>`).join(", ")}

🎁 Ödül:
${prize}`

);



});


}





// =====================
// 🎁 DROP
// =====================

if(command==="!drop"){


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

.setCustomId("drop_win")

.setLabel("🎁 Kap")

.setStyle(ButtonStyle.Success)

);



const msg =
await message.channel.send({

embeds:[

new EmbedBuilder()

.setTitle(
"🎁 DROP"
)

.setDescription(
`Ödül: **${prize}**`
)

.setColor("Green")

],

components:[row]

});



msg.createMessageComponentCollector({

max:1

})

.on("collect",async(i)=>{


await i.reply(

`🎉 ${i.user} kazandı!
Ödül: **${prize}**`

);



});


}





// =====================
// 🛡️ MODERASYON
// =====================

if(command==="!kick"){


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



message.reply(
"✅ Üye atıldı."
);


}




if(command==="!ban"){


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



message.reply(
"✅ Üye banlandı."
);


}





// =====================
// LOGIN
// =====================

client.login(
process.env.TOKEN
);
