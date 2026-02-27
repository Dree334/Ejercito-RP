export async function onRequest(context) {
    const { request, env } = context;
    const DISCORD_URL = "https://discord.com/api/webhooks/1476777633839845407/_wCIOm_jOpABCju8h8ZnSxd6c9lICJrUKnuJz6kwTQgam9MuaCaXknQsBPyHQlnJtJK9";

    if (request.method === "GET") {
        try {
            const { results } = await env.DB.prepare("SELECT * FROM sanciones ORDER BY id DESC").all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    if (request.method === "POST") {
        try {
            const data = await request.json();
            
            // Colores dinámicos para Discord: Strike 1 (Amarillo), 2 (Naranja), 3 (Rojo)
            let colorDiscord = data.nivel == 1 ? 16776960 : data.nivel == 2 ? 16753920 : 16711680;

            await env.DB.prepare(`
                INSERT INTO sanciones (nombre_ic, placa, nombre_discord, nivel, motivo, fecha) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(data.nombre_ic, data.placa, data.discord, data.nivel, data.motivo, data.fecha).run();
            
            await fetch(DISCORD_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: "⚖️ TRIBUNAL MILITAR",
                    embeds: [{
                        title: "🚫 PROTOCOLO DE SANCIÓN EJECUTADO",
                        color: colorDiscord,
                        fields: [
                            { name: "🪖 Soldado", value: `**${data.nombre_ic}**`, inline: true },
                            { name: "📌 Placa", value: `\`${data.placa}\``, inline: true },
                            { name: "⚠️ Estado", value: `**STRIKE ${data.nivel}**`, inline: true },
                            { name: "📝 Motivo", value: `\`\`\`${data.motivo}\`\`\`` }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // NUEVO: Método para eliminar desde la web
    if (request.method === "DELETE") {
        try {
            const { id, tabla } = await request.json();
            const targetTable = tabla === 'soldados' ? 'soldados' : 'sanciones';
            await env.DB.prepare(`DELETE FROM ${targetTable} WHERE id = ?`).bind(id).run();
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }
}
