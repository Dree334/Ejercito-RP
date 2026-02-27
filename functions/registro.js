export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { correo, password, discord, nombre_ic, edad, pais } = data;

    // ── 1. GENERAR PLACA SECUENCIAL ──
    // Contamos cuántos soldados hay actualmente en la BD
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM soldados`
    ).first();

    const total = countResult?.total ?? 0;
    // Empieza en REC-023, sube de uno en uno
    const numero = 23 + total;
    const placa = "INF-" + String(numero).padStart(3, "0");

    // ── 2. INSERTAR EN BD ──
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

    // ── 3. NOTIFICACIÓN DISCORD WEBHOOK ──
    const webhookUrl = "https://discord.com/api/webhooks/1476777653418590289/LXUCVO-L6eRDMxvnB5UIHpqg4FfrYm7DI_01222jszT5TWNOhfhkf9TxaV8dhOQcjFiy";

    const fecha = new Date().toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "🇨🇴 Sistema de Reclutamiento",
        avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png",
        content: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🚨 **NUEVO ALISTAMIENTO — BANDO COLOMBIA**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        embeds: [{
          title: "🎖️  ALTA MILITAR REGISTRADA",
          description: [
            "```",
            "╔══════════════════════════════════╗",
            "║   REPÚBLICA DE COLOMBIA — RP     ║",
            "║   FUERZAS MILITARES UNIFICADAS   ║",
            "╚══════════════════════════════════╝",
            "```",
            `> Un nuevo soldado ha jurado lealtad a la bandera y se ha incorporado a las filas del **Bando Colombia** en **Guerras Mundiales RP**.`
          ].join("\n"),
          color: 0x003893,
          thumbnail: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png"
          },
          fields: [
            {
              name: "​",
              value: "**━━━━━━━  DATOS DEL SOLDADO  ━━━━━━━**",
              inline: false
            },
            {
              name: "🪖  Nombre IC",
              value: `\`\`${nombre_ic}\`\``,
              inline: true
            },
            {
              name: "🆔  Placa Militar",
              value: `\`\`${placa}\`\``,
              inline: true
            },
            {
              name: "🎖️  Rango Inicial",
              value: "``Recluta``",
              inline: true
            },
            {
              name: "🎮  Discord",
              value: `${discord}`,
              inline: true
            },
            {
              name: "🌍  País de Origen",
              value: `${pais}`,
              inline: true
            },
            {
              name: "🎂  Edad",
              value: `${edad} años`,
              inline: true
            },
            {
              name: "​",
              value: "**━━━━━━━  ESTADO DEL SISTEMA  ━━━━━━━**",
              inline: false
            },
            {
              name: "📅  Fecha de Alistamiento",
              value: `${fecha} (COL)`,
              inline: true
            },
            {
              name: "✅  Estado",
              value: "``ACTIVO EN SISTEMA``",
              inline: true
            },
            {
              name: "🔢  Número de Registro",
              value: `\`\`#${numero}\`\``,
              inline: true
            },
            {
              name: "​",
              value: [
                "```yaml",
                `Bienvenido a las Fuerzas Militares, ${nombre_ic}.`,
                `Tu placa de identificación es: ${placa}`,
                "Defiende la patria con honor.",
                "```"
              ].join("\n"),
              inline: false
            }
          ],
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/800px-Flag_of_Colombia.svg.png"
          },
          footer: {
            text: "🇨🇴 Colombia Wars RP  •  Sistema de Registro Automático v2.0  •  Ficción / Roleplay",
            icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png"
          },
          timestamp: new Date().toISOString()
        }]
      })
    });

    // ── 4. RESPUESTA AL FRONTEND (incluye placa generada) ──
    return new Response(JSON.stringify({ success: true, placa, nombre_ic }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}


