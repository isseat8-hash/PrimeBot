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
    intents: [
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

    ONERI_KANAL_ID: "1534594853751492832",

    OTOROL_ID: "1534594823686717733",

    KURUCU_ID: "1339146423433953300",

    DUYURU_KANAL_ID: "1535026905575723068",

    SOHBET_KANAL_ID: "1534594846445146193",


    // TICKET
    TICKET_CATEGORY_ID: "KATEGORI_ID",

    TICKET_SUPPORT_ROLE: "YETKILI_ROLE_ID",

    TICKET_LOG_CHANNEL: "LOG_KANAL_ID"

};


// =====================
// STORAGE
// =====================

const invites = new Collection();

const activeTickets = new Map();

const suggestionVotes = new Map();

const giveaways = new Map();


// =====================
// READY
// =====================

client.once("ready", async()=>{

    console.log(`✅ ${client.user.tag} aktif!`);

    client.user.setActivity(
        "AEGISNW | !ip",
        {
            type:0
        }
    );


    for(const guild of client.guilds.cache.values()){

        try{

            const inv = await guild.invites.fetch();

            invites.set(
                guild.id,
                new Collection(
                    inv.map(x=>[
                        x.code,
                        x.uses
                    ])
                )
            );

        }catch(err){

            console.log(
                "Invite alınamadı:",
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

    }
    catch(err){

        console.log(
            "Otorol hatası:",
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
.split(/ +/);



const command =
args.shift()
.toLowerCase();



// TEST

if(command==="!ping"){

return message.reply(
`🏓 Pong ${client.ws.ping}ms`
);

}



if(command==="!ip"){

const embed =
new EmbedBuilder()

.setTitle(
"🌐 AEGISNW Sunucu Bilgileri"
)

.setColor("#5865F2")

.addFields(

{
name:"☕ Java",
value:"`Yakında`"
},

{
name:"📱 Bedrock",
value:"`Yakında`"
},

{
name:"🔌 Port",
value:"`Yakında`"
}

);


return message.channel.send({
embeds:[embed]
});

}
// ===============================
// 🎫 TICKET PANEL
// ===============================

if(command === "!ticketpanel"){

    if(!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply("❌ Yetkin yok.");


    const embed = new EmbedBuilder()
    .setTitle("🎫 AEGISNW Destek Sistemi")
    .setDescription(
`Destek almak için aşağıdaki kategorilerden birini seçin.

🐛 Bug Bildirme
💳 Ödeme / Muhasebe
🤝 Partnerlik
🎁 Çekiliş Ödülü
❓ Diğer`
    )
    .setColor("#5865F2");


    const row = new ActionRowBuilder()
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



// ===============================
// INTERACTION SYSTEM
// ===============================

client.on(
"interactionCreate",
async(interaction)=>{


if(!interaction.isButton())
return;



// ===============================
// TICKET AÇMA
// ===============================


if(
interaction.customId.startsWith("ticket_")
&&
interaction.customId !== "ticket_close"
){


const userID = interaction.user.id;



if(activeTickets.has(userID)){

return interaction.reply({

content:
"❌ Zaten açık bir ticketiniz var.",

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

},


{

id:
CONFIG.TICKET_SUPPORT_ROLE,

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

Yetkililer en kısa sürede ilgilenecektir.

Ticket kapatmak için butona basabilirsiniz.`

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

content:
`<@&${CONFIG.TICKET_SUPPORT_ROLE}> ${interaction.user}`,

embeds:[embed],

components:[row]

});



return interaction.reply({

content:
`✅ Ticket oluşturuldu: ${channel}`,

ephemeral:true

});


}



// ===============================
// TICKET KAPAT
// ===============================


if(interaction.customId==="ticket_close"){


if(
!interaction.member.permissions.has(
PermissionFlagsBits.ManageChannels
)

&&

!activeTickets.has(interaction.user.id)

){

return interaction.reply({

content:
"❌ Bu ticketi kapatamazsın.",

ephemeral:true

});

}



await interaction.reply(
"🔒 Ticket kapatılıyor..."
);



const log =
interaction.guild.channels.cache.get(
CONFIG.TICKET_LOG_CHANNEL
);



if(log){

const embed =
new EmbedBuilder()

.setTitle(
"🔒 Ticket Kapatıldı"
)

.addFields(

{
name:"Kapatan",
value:`${interaction.user}`
},

{
name:"Kanal",
value:interaction.channel.name
}

)

.setColor("Red");


log.send({
embeds:[embed]
});

}



for(
const [user,channel]
of activeTickets
){

if(
channel === interaction.channel.id
){

activeTickets.delete(user);

}

}



setTimeout(()=>{

interaction.channel.delete()
.catch(()=>{});

},5000);



}



});

// ===============================
// 🎯 ÖNERİ SİSTEMİ
// ===============================

if(command === "!öneri" || command === "!oneri"){

    if(message.channel.id !== CONFIG.ONERI_KANAL_ID)
        return message.reply("❌ Bu komut burada kullanılamaz.");

    const text = args.join(" ");

    if(!text)
        return message.reply("Bir öneri yaz.");

    message.delete().catch(()=>{});


    const embed = new EmbedBuilder()
    .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL()
    })
    .setDescription(text)
    .setColor("#5865F2")
    .setTimestamp();


    const row = new ActionRowBuilder()
    .addComponents(

        new ButtonBuilder()
        .setCustomId("oy_evet")
        .setLabel("✅ Evet (0)")
        .setStyle(ButtonStyle.Success),


        new ButtonBuilder()
        .setCustomId("oy_hayir")
        .setLabel("❌ Hayır (0)")
        .setStyle(ButtonStyle.Danger)

    );


    const msg = await message.channel.send({

        embeds:[embed],
        components:[row]

    });


    suggestionVotes.set(msg.id,new Set());

}



// ===============================
// ÇEKİLİŞ
// ===============================

if(command==="!cekilis"){

if(!message.member.permissions.has(PermissionFlagsBits.Administrator))
return;


const time = args[0];
const winners = Number(args[1]);
const prize = args.slice(2).join(" ");


if(!time || !winners || !prize)
return message.reply(
"`!cekilis 1h 1 Nitro`"
);


const duration = ms(time);


const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("give_join")
.setLabel("🎉 Katıl (0)")
.setStyle(ButtonStyle.Primary)

);



const embed =
new EmbedBuilder()

.setTitle(
`🎉 ${prize}`
)

.setDescription(
`Katılmak için butona basın.\n\nKazanan: ${winners}\nSüre: ${time}`
)

.setColor("Yellow");



const msg =
await message.channel.send({

embeds:[embed],
components:[row]

});



const users=new Set();



const collector =
msg.createMessageComponentCollector({
time:duration
});


collector.on("collect",async(i)=>{


if(users.has(i.user.id)){

users.delete(i.user.id);

await i.reply({
content:"Çekilişten ayrıldın.",
ephemeral:true
});

}

else{

users.add(i.user.id);

await i.reply({
content:"Katıldın!",
ephemeral:true
});

}


row.components[0]
.setLabel(`🎉 Katıl (${users.size})`);


msg.edit({
components:[row]
});


});



collector.on("end",()=>{


let list=[...users];


if(!list.length)
return message.channel.send(
"Kimse katılmadı."
);


let winners=[];


for(let i=0;i<Math.min(
Number(args[1]),
list.length
);i++){

winners.push(
list.splice(
Math.floor(Math.random()*list.length),
1
)[0]
);

}


message.channel.send(
`🎉 Kazananlar: ${winners.map(x=>`<@${x}>`).join(", ")}\n🎁 Ödül: ${prize}`
);


});

}



// ===============================
// DROP
// ===============================

if(command==="!drop"){

if(!message.member.permissions.has(PermissionFlagsBits.Administrator))
return;


const prize=args.join(" ");


if(!prize)
return message.reply("Ödül yaz.");


const row =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("drop")
.setLabel("🎁 KAP")
.setStyle(ButtonStyle.Success)

);



const msg =
await message.channel.send({

embeds:[

new EmbedBuilder()

.setTitle("🎁 DROP")

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
.on("collect",async i=>{


row.components[0]
.setDisabled(true)
.setLabel("Kazanıldı");


await msg.edit({
components:[row]
});


i.reply(
`🎉 ${i.user} kazandı! Ödül: ${prize}`
);


});


}



// ===============================
// MOD KOMUTLARI
// ===============================

if(command==="!kick"){

if(!message.member.permissions.has(PermissionFlagsBits.KickMembers))
return;


const user=message.mentions.members.first();

if(!user)return;


await user.kick();


message.reply(
"Üye atıldı."
);

}



if(command==="!ban"){

if(!message.member.permissions.has(PermissionFlagsBits.BanMembers))
return;


const user=message.mentions.members.first();

if(!user)return;


await user.ban();


message.reply(
"Üye banlandı."
);

}



});



// ===============================
// LOGIN
// ===============================

client.login(process.env.TOKEN);
