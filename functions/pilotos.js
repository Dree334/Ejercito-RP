export async function onRequestPost(context) {
  const { request, env } = context;

  const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1476777629355999404/F_xJlgg52JDIGIJlBOATF3KwM8cu4jAOR9TO-ECeaW6bp1132om0N_pVemZ3xD6rIQZl";

  try {
    const data = await request.json();
    const { nombre_ic, rango, pais, nombre_discord } = data;

    if (!nombre_ic) {
      return new Response(JSON.stringify({
        success: false,
        error: "Nombre IC es obligatorio"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ==============================
    // GENERAR PLACA AUTOMÁTICA (ANTI-DUPLICADOS)
    // ==============================

    const { results } = await env.DB
      .prepare("SELECT placa FROM pilotos ORDER BY id DESC LIMIT 1")
      .all();

    let numero = 10;

    if (results.length > 0) {
      const ultimaPlaca = results[0].placa;
      const ultimoNumero = parseInt(ultimaPlaca.split("-")[1]);
      numero = ultimoNumero + 1;
    }

    const placaAuto = `CDT-${String(numero).padStart(3, "0")}`;

    // ==============================
    // GUARDAR EN D1
    // ==============================

    await env.DB.prepare(`
      INSERT INTO pilotos 
      (nombre_ic, rango, placa, pais, estado, fecha_ingreso, nombre_discord)
      VALUES (?, ?, ?, ?, 'Activo', datetime('now'), ?)
    `)
      .bind(
        nombre_ic,
        rango || "Aspirante",
        placaAuto,
        pais || "Colombia",
        nombre_discord || "No especificado"
      )
      .run();

    // ==============================
    // ENVIAR EMBED ULTRA PROFESIONAL
    // ==============================

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Comando General",
        embeds: [
          {
            color: 0x145A32,

            author: {
              name: "FUERZA AÉREA • SISTEMA CENTRAL",
            },

            title: "🎖 NUEVA INCORPORACIÓN OFICIAL",

            description:
`══════════════════════════════
Se ha aprobado una nueva incorporación
a la división aérea militar.
══════════════════════════════`,

            fields: [
              {
                name: "👤 IDENTIDAD",
                value:
`**Nombre IC:** ${nombre_ic}
**Discord:** ${nombre_discord || "No especificado"}`,
                inline: false
              },
              {
                name: "🛩 INFORMACIÓN OPERATIVA",
                value:
`**Placa:** ${placaAuto}
**Rango:** ${rango || "Aspirante"}
**Unidad:** Aviación Militar`,
                inline: false
              },
              {
                name: "🌎 ESTADO GENERAL",
                value:
`**País:** ${pais || "Colombia"}
**Estado:** Activo`,
                inline: false
              }
            ],

            footer: {
              text: "Sistema de Reclutamiento Automático • v2.0"
            },

            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    return new Response(JSON.stringify({
      success: true,
      placa: placaAuto
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
