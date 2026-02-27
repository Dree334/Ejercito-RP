export async function onRequest(context) {
    const { request, env } = context;
    const DISCORD_URL = "https://discord.com/api/webhooks/1476777633839845407/_wCIOm_jOpABCju8h8ZnSxd6c9lICJrUKnuJz6kwTQgam9MuaCaXknQsBPyHQlnJtJK9";

    if (request.method === "GET") {
        try {
            // Intenta leer de la tabla 'sanciones'
            const { results } = await env.DB.prepare("SELECT * FROM sanciones ORDER BY id DESC").all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error al leer DB: " + e.message }), { status: 500 });
        }
    }

    if (request.method === "POST") {
        try {
            const sancion = await request.json();
            
            // 1. Guardar en D1 (Ajustado a tu columna 'nombre_discord')
            await env.DB.prepare(`
                INSERT INTO sanciones (nombre_ic, placa, nombre_discord, nivel, motivo, fecha) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
                sancion.nombre_ic, 
                sancion.placa, 
                sancion.discord, // Este es el dato que viene del formulario
                sancion.nivel, 
                sancion.motivo, 
                sancion.fecha
            ).run();
            
            // 2. Notificar a Discord
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
                            { name: "🪖 SOLDADO SANCIONADO", value: `**${sancion.nombre_ic}**`, inline: false },
                            { name: "📌 PLACA", value: `\`${sancion.placa}\``, inline: true },
                            { name: "🎖️ NIVEL DE STRIKE", value: `⚠️ **STRIKE ${sancion.nivel}**`, inline: true },
                            { name: "📝 MOTIVO OFICIAL", value: `\`\`\`${sancion.motivo}\`\`\``, inline: false }
                        ],
                        footer: { text: "S.U.K.V. • Tribunal Militar" },
                        timestamp: new Date().toISOString()
                    }]
                })
            });

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            // Esto devolverá el error exacto (ej: "no such table" o "column mismatch")
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }
}
