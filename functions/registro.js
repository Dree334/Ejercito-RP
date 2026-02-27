export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    // Guardamos al soldado en la DB que vinculaste
    await env.DB.prepare(`
      INSERT INTO soldados (correo, password, nombre_discord, nombre_ic, edad, pais, rango, placa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.correo, 
      data.password, 
      data.discord, 
      data.nombre_ic, 
      data.edad, 
      data.pais, 
      "Recluta", 
      data.placa
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}