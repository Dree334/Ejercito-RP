export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { correo, password, discord, nombre_ic, edad, pais, placa } = data;

    // 1. Guardamos al soldado en la DB (Asegúrate que la columna sea 'nombre_discord' o 'discord')
    await env.DB.prepare(`
      INSERT INTO soldados (correo, password, nombre_discord, nombre_ic, edad, pais, rango, placa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      correo, 
      password, 
      discord, 
      nombre_ic, 
      edad, 
      pais, 
      "Recluta", 
      placa
    ).run();

    // 2. Enviamos la notificación al Webhook de Discord
    const webhookUrl = "https://discord.com/api/webhooks/1476777653418590289/LXUCVO-L6eRDMxvnB5UIHpqg4FfrYm7DI_01222jszT5TWNOhfhkf9TxaV8dhOQcjFiy";

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Reclutamiento Militar",
        embeds: [{
          title: "🎖️ NUEVO ALTA EN EL EJÉRCITO",
          description: `Se ha registrado un nuevo soldado para el frente de batalla de **Guerras Mundiales RP**.`,
          color: 39168, // Verde militar oscuro
          fields: [
            { name: "👤 Nombre IC", value: `**${nombre_ic}**`, inline: true },
            { name: "🆔 Placa", value: `\`${placa}\``, inline: true },
            { name: "🎮 Discord", value: discord, inline: true },
            { name: "🌍 País", value: pais, inline: true },
            { name: "🎂 Edad", value: edad.toString(), inline: true },
            { name: "🎖️ Rango", value: "Recluta", inline: true }
          ],
          footer: { text: "Sistema de Registro Automático v1.0" },
          timestamp: new Date().toISOString()
        }]
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    // Si hay un error (ej. correo duplicado), lo enviamos de vuelta
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
