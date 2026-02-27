export async function onRequestPost(context) {
  const { request, env } = context;

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

    // 🔢 Generar placa automática CDT-010 en adelante
    const { results } = await env.DB
      .prepare("SELECT COUNT(*) as total FROM pilotos")
      .all();

    const total = results[0].total || 0;
    const numero = 10 + total;
    const placaAuto = `CDT-${String(numero).padStart(3, "0")}`;

    // 💾 Guardar en D1
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

    // 📢 Enviar a Discord
    await fetch(env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content:
`𝐀𝐕𝐈𝐀𝐂𝐈𝐎́𝐍 𝐌𝐈𝐋𝐈𝐓𝐀𝐑
╔═════════════✦═════════════╗
  𝐎𝐅𝐈𝐂𝐈𝐀𝐋: 「 ${nombre_ic} 」
  𝐏𝐋𝐀𝐂𝐀: / ${placaAuto}
  𝐑𝐀𝐍𝐆𝐎: 「 ${rango || "Aspirante"} 」
  𝐑𝐎𝐋: Piloto F-16
  𝐔𝐍𝐈𝐃𝐀𝐃: Aviación Militar
╚═════════════✦═════════════╝
Honor • Disciplina • Lealtad`
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
