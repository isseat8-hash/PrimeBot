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
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences
    ]
});

const CONFIG = {
    ONERI_KANAL_ID: "1534594853751492832",
    OTOROL_ID: "1534594823686717733",
    DUYURU_KANAL_ID: "1535026905575723068",
    SOHBET_KANAL_ID: "1534594846445146193",
    KURUCU_ID: "1339146423433953300"
};

const invites = new Collection();

client.once("ready", async () => {
    console.log(`[BOT] ${client.user.tag} aktif!`);
    client.user.setActivity("AEGISNW | !ip", { type: 0 });

    client.guilds.cache.forEach(async (guild) => {
        try {
            const firstInvites = await guild.invites.fetch();
            invites.set(guild.id, new Collection(firstInvites.map((inv) => [inv.code, inv.uses])));
        } catch (e) {
            console.log("Davetler çekilemedi:", e.message);
        }
    });
});

client.on("guildMemberAdd", async (member) => {
    try {
        const role = member.guild.roles.cache.get(CONFIG.OTOROL_ID);
        if (role) await member.roles.add(role);
    } catch (err) {
        console.error("Otorol verilemedi:", err);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "!ip") {
        const embed = new EmbedBuilder()
            .setTitle("🌐 AEGISNW Sunucu Bilgileri")
            .setColor("#2b2d31")
            .setDescription("Aşağıda sunucumuza katılmak için gerekli IP bilgileri yer almaktadır.")
            .addFields(
                { name: "☕ Java IP", value: "`AEGISNW` (Yakında)", inline: true },
                { name: "📱 Bedrock IP", value: "`Yakında`", inline: true },
                { name: "🔌 Port", value: "`Yakında`", inline: true }
            )
            .setFooter({ text: "AEGISNW Oyun Sunucusu" })
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    if (command === "!öneri" || command === "!oneri") {
        if (message.channel.id !== CONFIG.ONERI_KANAL_ID) {
            return message.reply(`Bu komut sadece <#${CONFIG.ONERI_KANAL_ID}> kanalında kullanılabilir!`);
        }
        const oneriText = args.join(" ");
        if (!oneriText) return message.reply("Lütfen bir öneri yazın! Örn: `!öneri Sunucuya yeni rütbeler gelsin.`");

        message.delete().catch(() => {});

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${message.author.tag} Önerisi`, iconURL: message.author.displayAvatarURL() })
            .setColor("#5865F2")
            .setDescription(oneriText)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("oneri_evet").setLabel("Evet (0)").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("oneri_hayir").setLabel("Hayır (0)").setStyle(ButtonStyle.Danger)
        );

        return message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === "!ticketpanel") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        
        const embed = new EmbedBuilder()
            .setTitle("🎫 AEGISNW Destek Talebi")
            .setDescription("Destek almak istediğiniz kategoriyi aşağıdaki butonlardan seçerek bilet oluşturabilirsiniz.")
            .setColor("#2f3136");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ticket_bug").setLabel("Bug Bildirme").setStyle(ButtonStyle.Primary).setEmoji("🐛"),
            new ButtonBuilder().setCustomId("ticket_kufur").setLabel("Küfür/Hile Bildirme").setStyle(ButtonStyle.Danger).setEmoji("🛡️"),
            new ButtonBuilder().setCustomId("ticket_genel").setLabel("Genel Destek").setStyle(ButtonStyle.Secondary).setEmoji("❓"),
            new ButtonBuilder().setCustomId("ticket_odul").setLabel("Ödül Talep").setStyle(ButtonStyle.Success).setEmoji("🎁")
        );

        return message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === "!panel") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embed = new EmbedBuilder()
            .setDescription("Bu panel üzerinden sunucu genelinde kritik işlemleri hızlıca gerçekleştirebilirsiniz. Lütfen dikkatli kullanın.")
            .setColor("#2b2d31");

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("p_dm").setLabel("DM Gönder").setStyle(ButtonStyle.Primary).setEmoji("👤"),
            new ButtonBuilder().setCustomId("p_roleall").setLabel("Toplu Rol Ver").setStyle(ButtonStyle.Success).setEmoji("🟩"),
            new ButtonBuilder().setCustomId("p_unroleall").setLabel("Toplu Rol Al").setStyle(ButtonStyle.Danger).setEmoji("🟥")
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("p_announce").setLabel("Duyuru Gönder").setStyle(ButtonStyle.Primary).setEmoji("✨"),
            new ButtonBuilder().setCustomId("p_clear").setLabel("Mesaj Sil").setStyle(ButtonStyle.Danger).setEmoji("🗑️"),
            new ButtonBuilder().setCustomId("p_lock").setLabel("Kanal Kilitle").setStyle(ButtonStyle.Danger).setEmoji("🚫")
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("p_unban").setLabel("Banları Kaldır").setStyle(ButtonStyle.Success).setEmoji("🟩"),
            new ButtonBuilder().setCustomId("p_bakim").setLabel("Bakım Modu").setStyle(ButtonStyle.Secondary).setEmoji("🛠️"),
            new ButtonBuilder().setCustomId("p_stats").setLabel("İstatistikler").setStyle(ButtonStyle.Secondary).setEmoji("📊"),
            new ButtonBuilder().setCustomId("p_poll").setLabel("Oylama Oluştur").setStyle(ButtonStyle.Primary).setEmoji("🗳️")
        );

        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("p_kate_ekle").setLabel("Kategori Ekle").setStyle(ButtonStyle.Success).setEmoji("📁"),
            new ButtonBuilder().setCustomId("p_kate_sil").setLabel("Kategori Sil").setStyle(ButtonStyle.Danger).setEmoji("📁"),
            new ButtonBuilder().setCustomId("p_wiki_ekle").setLabel("Wiki Ekle").setStyle(ButtonStyle.Success).setEmoji("➕"),
            new ButtonBuilder().setCustomId("p_wiki_sil").setLabel("Wiki Sil").setStyle(ButtonStyle.Danger).setEmoji("🗑️")
        );

        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("p_wiki_panel").setLabel("Wiki Paneli Gönder").setStyle(ButtonStyle.Primary).setEmoji("📤")
        );

        return message.channel.send({ embeds: [embed], components: [row1, row2, row3, row4, row5] });
    }

    if (command === "!cekilis") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const sürestraz = args[0];
        const kazananSayisi = parseInt(args[1]);
        const odul = args.slice(2).join(" ");

        if (!sürestraz || isNaN(kazananSayisi) || !odul) {
            return message.reply("Kullanım: `!cekilis <süre: 1m/1h/1d> <kazanan_sayısı> <ödül>`");
        }

        const duration = ms(sürestraz);
        if (!duration) return message.reply("Geçerli bir süre girin! (Örn: 1m, 1h, 1d)");

        const embed = new EmbedBuilder()
            .setTitle(`🎉 ÇEKİLİŞ: ${odul}`)
            .setDescription(`Katılmak için aşağıdaki **Katıl** butonuna basın!\n\n**Kazanan Sayısı:** ${kazananSayisi}\n**Süre:** ${sürestraz}`)
            .setColor("#FEE75C")
            .setTimestamp(Date.now() + duration);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("cekilis_katil").setLabel("🎉 Katıl (0)").setStyle(ButtonStyle.Primary)
        );

        const msg = await message.channel.send({ embeds: [embed], components: [row] });
        const katilanlar = new Set();

        const collector = msg.createMessageComponentCollector({ time: duration });

        collector.on("collect", async (i) => {
            if (i.customId === "cekilis_katil") {
                if (katilanlar.has(i.user.id)) {
                    katilanlar.delete(i.user.id);
                    await i.reply({ content: "Çekilişten ayrıldınız.", ephemeral: true });
                } else {
                    katilanlar.add(i.user.id);
                    await i.reply({ content: "Çekilişe katıldınız!", ephemeral: true });
                }
                
                row.components[0].setLabel(`🎉 Katıl (${katilanlar.size})`);
                await msg.edit({ components: [row] });
            }
        });

        collector.on("end", async () => {
            const arr = Array.from(katilanlar);
            if (arr.length === 0) {
                return message.channel.send("Çekilişe kimse katılmadığı için kazanan olmadı.");
            }

            const kazananlar = [];
            for (let i = 0; i < Math.min(kazananSayisi, arr.length); i++) {
                const rand = Math.floor(Math.random() * arr.length);
                kazananlar.push(arr.splice(rand, 1)[0]);
            }

            const kazananEtiketler = kazananlar.map(id => `<@${id}>`).join(", ");
            message.channel.send(`🎉 **Tebrikler** ${kazananEtiketler}!\n**Ödül:** ${odul}\n\n⚠️ Ticket açarak ödülünüzü alınız!`);
        });
    }

    if (command === "!drop") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const odul = args.join(" ");
        if (!odul) return message.reply("Kullanım: `!drop <ödül>`");

        const embed = new EmbedBuilder()
            .setTitle("🎁 HIZLI DROP!")
            .setDescription(`Ödül: **${odul}**\nAşağıdaki butona ilk basan ödülü kapar!`)
            .setColor("#57F287");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("drop_kap").setLabel("🎁 Ödülü Kap!").setStyle(ButtonStyle.Success)
        );

        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = i => i.customId === "drop_kap";
        const collector = msg.createMessageComponentCollector({ filter, max: 1 });

        collector.on("collect", async i => {
            row.components[0].setDisabled(true).setLabel("Kazanıldı!");
            await msg.edit({ components: [row] });
            await i.reply({ content: `🎉 Tebrikler ${i.user}! Ödülü kaptın: **${odul}**\n⚠️ Ticket açarak ödülünüzü alınız!` });
        });
    }

    if (command === "!announce" || command === "!duyuru") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const duyuruText = args.join(" ");
        if (!duyuruText) return message.reply("Duyuru metnini yazmalısın.");

        const duyuruKanal = message.guild.channels.cache.get(CONFIG.DUYURU_KANAL_ID);
        const sohbetKanal = message.guild.channels.cache.get(CONFIG.SOHBET_KANAL_ID);

        const embed = new EmbedBuilder()
            .setTitle("📢 YENİ DUYURU")
            .setDescription(duyuruText)
            .setColor("#ED4245")
            .setTimestamp();

        if (duyuruKanal) {
            await duyuruKanal.send({ content: "@everyone @here", embeds: [embed] });
        }
        if (sohbetKanal) {
            await sohbetKanal.send({ embeds: [embed] });
        }
        return message.reply("Duyuru başarıyla gönderildi!");
    }

    if (command === "!clear") {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("1-100 arası sayı girin.");
        await message.channel.bulkDelete(amount, true);
        return message.channel.send(`${amount} mesaj silindi.`).then(m => setTimeout(() => m.delete(), 3000));
    }

    if (command === "!lock") {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        return message.reply("🔒 Kanal kilitlendi.");
    }

    if (command === "!unlock") {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        return message.reply("🔓 Kanal kilit açıldı.");
    }

    if (command === "!ban") {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Bir üye etiketleyin.");
        await target.ban();
        return message.reply(`${target.user.tag} banlandı.`);
    }

    if (command === "!kick") {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Bir üye etiketleyin.");
        await target.kick();
        return message.reply(`${target.user.tag} atıldı.`);
    }

    if (command === "!mute") {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Bir üye etiketleyin.");
        await target.timeout(10 * 60 * 1000);
        return message.reply(`${target.user.tag} 10 dakika susturuldu.`);
    }

    if (command === "!unmute") {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        const target = message.mentions.members.first();
        if (!target) return message.reply("Bir üye etiketleyin.");
        await target.timeout(null);
        return message.reply(`${target.user.tag} susturması kaldırıldı.`);
    }

    if (command === "!roleall") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const role = message.mentions.roles.first();
        if (!role) return message.reply("Bir rol etiketleyin.");
        const members = await message.guild.members.fetch();
        members.forEach(m => m.roles.add(role).catch(() => {}));
        return message.reply(`Tüm üyelere ${role.name} rolü verilmeye başlandı.`);
    }

    if (command === "!unroleall") {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const role = message.mentions.roles.first();
        if (!role) return message.reply("Bir rol etiketleyin.");
        const members = await message.guild.members.fetch();
        members.forEach(m => m.roles.remove(role).catch(() => {}));
        return message.reply(`Tüm üyelerden ${role.name} rolü alınmaya başlandı.`);
    }

    if (command === "!serverinfo") {
        const guild = message.guild;
        const members = await guild.members.fetch();
        const onlineCount = members.filter(m => m.presence?.status && m.presence.status !== "offline").size;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Bilgileri`)
            .addFields(
                { name: "Kurucu", value: `<@${CONFIG.KURUCU_ID}>`, inline: true },
                { name: "Toplam Üye", value: `${guild.memberCount}`, inline: true },
                { name: "Aktif Üye", value: `${onlineCount}`, inline: true }
            )
            .setColor("#2b2d31");
        return message.channel.send({ embeds: [embed] });
    }

    if (command === "!userinfo") {
        const member = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .addFields(
                { name: "Hesap Oluşturma", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: "Katılma Tarihi", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
            )
            .setColor("#2b2d31");
        return message.channel.send({ embeds: [embed] });
    }

    if (command === "!avatar") {
        const user = message.mentions.users.first() || message.author;
        return message.channel.send(user.displayAvatarURL({ size: 1024, dynamic: true }));
    }

    if (command === "!ping") {
        return message.reply(`🏓 Pong! Bot Gecikmesi: ${client.ws.ping}ms`);
    }

    if (command === "!invite") {
        return message.reply("Davetlerinizi kontrol etmek için davet panelinizi kullanabilirsiniz.");
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith("ticket_")) {
        const type = interaction.customId.replace("ticket_", "").toUpperCase();
        
        const channel = await interaction.guild.channels.create({
            name: `ticket-${type.toLowerCase()}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle(`🎫 ${type} Destek Talebi`)
            .setDescription(`Merhaba ${interaction.user}, yetkililer en kısa sürede sizinle ilgilenecektir.\nBileti kapatmak için aşağıdaki butona basın.`)
            .setColor("#5865F2");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("ticket_close").setLabel("Bileti Kapat").setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: `Ticket oluşturuldu: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === "ticket_close") {
        await interaction.reply("Bilet 5 saniye içinde kapatılıyor...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }

    if (interaction.customId === "oneri_evet" || interaction.customId === "oneri_hayir") {
        const message = interaction.message;
        
        let evetCount = parseInt(message.components[0].components[0].label.match(/\d+/)[0]);
        let hayirCount = parseInt(message.components[0].components[1].label.match(/\d+/)[0]);

        if (interaction.customId === "oneri_evet") evetCount++;
        if (interaction.customId === "oneri_hayir") hayirCount++;

        const newRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("oneri_evet").setLabel(`Evet (${evetCount})`).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("oneri_hayir").setLabel(`Hayır (${hayirCount})`).setStyle(ButtonStyle.Danger)
        );

        await message.edit({ components: [newRow] });
        return interaction.reply({ content: "Oyunuz kaydedildi!", ephemeral: true });
    }

    if (interaction.customId.startsWith("p_")) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Bu butonu kullanma yetkiniz yok!", ephemeral: true });
        }
        return interaction.reply({ content: `🔧 **${interaction.customId}** işlemi tetiklendi.`, ephemeral: true });
    }
});

client.login(process.env.DIS
