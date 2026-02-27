export async function onRequest(context) {
    const { request, env } = context;
    // USAMOS EL LINK QUE ME PASASTE
    const DISCORD_URL = "https://discord.com/api/webhooks/1476777633839845407/_wCIOm_jOpABCju8h8ZnSxd6c9lICJrUKnuJz6kwTQgam9MuaCaXknQsBPyHQlnJtJK9";

    if (request.method === "GET") {
        const { results } = await env.DB.prepare("SELECT * FROM sanciones ORDER BY id DESC").all();
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "POST") {
        const sancion = await request.json();
        try {
            // 1. Guardar en la Base de Datos D1
            await env.DB.prepare(`INSERT INTO sanciones (nombre_ic, placa, discord, nivel, motivo, fecha) VALUES (?, ?, ?, ?, ?, ?)`).bind(sancion.nombre_ic, sancion.placa, sancion.discord, sancion.nivel, sancion.motivo, sancion.fecha).run();
            
            // 2. Notificar a Discord (Tu versión decorada)
            await fetch(DISCORD_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: "⚖️ TRIBUNAL MILITAR",
                    avatar_url: "https://i.imgur.com/vHqB3qQ.png",
                    embeds: [{
                        title: "🚫 ═══ PROTOCOLO DE SANCIÓN EJECUTADO ═══ 🚫",
                        description: "```Sistema disciplinario interno activado correctamente```",
                        color: sancion.nivel == 3 ? 16711680 : sancion.nivel == 2 ? 16753920 : 15844367,
                        thumbnail: { url: "https://i.imgur.com/vHqB3qQ.png" },
                        fields: [
                            { name: "🪖 SOLDADO SANCIONADO", value: `╔════════════════╗\n**${sancion.nombre_ic}**\n╚════════════════╝`, inline: false },
                            { name: "📌 PLACA", value: `\`${sancion.placa}\``, inline: true },
                            { name: "🎖️ NIVEL DE STRIKE", value: `⚠️ **STRIKE ${sancion.nivel}**`, inline: true },
                            { name: "💬 DISCORD", value: `<@${sancion.discord}>`, inline: false },
                            { name: "📝 MOTIVO OFICIAL", value: `\`\`\`${sancion.motivo}\`\`\``, inline: false },
                            { name: "📅 FECHA DE REGISTRO", value: `📆 ${sancion.fecha}`, inline: false }
                        ],
                        footer: { 
                            text: "Colombia Wars RP | Sistema Operativo S.U.K.V. • Tribunal Militar",
                            icon_url: "https://i.imgur.com/vHqB3qQ.png"
                        },
                        timestamp: new Date().toISOString()
                    }]
                })
            });

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }
}
