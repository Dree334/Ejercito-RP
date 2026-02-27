export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        // Consultamos los últimos 10 movimientos globales
        // Nota: Asumo que usas una tabla 'actividad' o 'personal' con columna 'tipo'
        const { results } = await env.DB.prepare(`
            SELECT tipo, nombre_ic, rango, placa, descripcion, strftime('%H:%M', fecha_ingreso) as hora 
            FROM personal 
            ORDER BY id DESC LIMIT 10
        `).all();

        return new Response(JSON.stringify(results), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
