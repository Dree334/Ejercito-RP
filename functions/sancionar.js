export async function onRequest(context) {
    const { request, env } = context;
    const DISCORD_URL = "https://discord.com/api/webhooks/1476777633839845407/_wCIOm_jOpABCju8h8ZnSxd6c9lICJrUKnuJz6kwTQgam9MuaCaXknQsBPyHQlnJtJK9";

    // CARGAR DATOS (GET)
    if (request.method === "GET") {
        try {
            const { results } = await env.DB.prepare("SELECT * FROM sanciones ORDER BY id DESC").all();
            return new Response(JSON.stringify(results), { 
                headers: { "Content-Type": "application/json" } 
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // GUARDAR DATOS (POST)
    if (request.method === "POST") {
        try {
            const sancion = await request.json();
            
            // 1. Guardar en D1 (Usando 'nombre_discord' como en tu tabla)
            await env.DB.prepare(`
                INSERT INTO sanciones (nombre_ic, placa, nombre_discord, nivel, motivo, fecha) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
                sancion.nombre_ic, 
                sancion.placa, 
                sancion.discord, 
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
                    embeds: [{
                        title: "🚫 PROTOCOLO DE SANCIÓN EJECUTADO",
                        color: 16711680,
                        fields: [
                            { name: "🪖 SOLDADO", value: sancion.nombre_ic, inline: true },
                            { name: "📌 PLACA", value: sancion.placa, inline: true },
                            { name: "⚠️ NIVEL", value: `STRIKE ${sancion.nivel}`, inline: true },
                            { name: "📝 MOTIVO", value: sancion.motivo }
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
}
