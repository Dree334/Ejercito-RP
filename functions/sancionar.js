export async function onRequest(context) {
    const { request, env } = context;
    const DISCORD_URL = "https://discord.com/api/webhooks/1476777633839845407/_wCIOm_jOpABCju8h8ZnSxd6c9lICJrUKnuJz6kwTQgam9MuaCaXknQsBPyHQlnJtJK9";

    // 1. CARGAR DATOS (GET)
    if (request.method === "GET") {
        try {
            // Verifica que el Binding 'DB' esté activo
            const { results } = await env.DB.prepare("SELECT * FROM sanciones ORDER BY id DESC").all();
            return new Response(JSON.stringify(results), { 
                headers: { "Content-Type": "application/json" } 
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: "Error de DB: " + e.message }), { status: 500 });
        }
    }

    // 2. GUARDAR DATOS (POST)
    if (request.method === "POST") {
        try {
            const data = await request.json();
            
            // Insertamos usando los nombres exactos de tu Studio D1
            await env.DB.prepare(`
                INSERT INTO sanciones (nombre_ic, placa, nombre_discord, nivel, motivo, fecha) 
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(data.nombre_ic, data.placa, data.discord, 3, data.motivo, data.fecha).run();
            
            // Notificar a Discord
            await fetch(DISCORD_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: "⚖️ TRIBUNAL MILITAR",
                    embeds: [{
                        title: "🚫 PROTOCOLO DE SANCIÓN EJECUTADO",
                        color: 16711680,
                        fields: [
                            { name: "🪖 Soldado", value: data.nombre_ic, inline: true },
                            { name: "📌 Placa", value: data.placa, inline: true },
                            { name: "📝 Motivo", value: data.motivo }
                        ],
                        timestamp: new Date().toISOString()
                    }]
                })
            });

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: "Fallo al guardar: " + e.message }), { status: 500 });
        }
    }
}
