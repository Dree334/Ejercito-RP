export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Leemos los datos que vienen desde tu formulario web
    const data = await request.json();

    // Insertamos los datos en la tabla 'soldados' con los campos que pediste
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
      "Recluta", // Rango por defecto
      data.placa    // La placa que asigne el sistema o el usuario
    ).run();

    return new Response(JSON.stringify({ mensaje: "¡Soldado registrado con éxito!" }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error: " + error.message }), {
      status: 400,
    });
  }
}
