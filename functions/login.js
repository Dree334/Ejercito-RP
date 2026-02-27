export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { correo, password } = await request.json();

    // Buscamos al soldado por correo y password
    const soldado = await env.DB.prepare(`
      SELECT * FROM soldados WHERE correo = ? AND password = ?
    `).bind(correo, password).first();

    if (!soldado) {
      return new Response(JSON.stringify({ error: "No encontrado" }), { status: 401 });
    }

    // Si todo está bien, devolvemos sus datos de rol
    return new Response(JSON.stringify(soldado), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
