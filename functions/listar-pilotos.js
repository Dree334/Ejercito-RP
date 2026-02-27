export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB
      .prepare(`
        SELECT id, nombre_ic, rango, placa, pais, estado, fecha_ingreso
        FROM pilotos
        ORDER BY id DESC
      `)
      .all();

    return new Response(JSON.stringify({
      success: true,
      pilotos: results
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
