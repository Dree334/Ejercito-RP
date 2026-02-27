
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === "GET") {
        try {
            // Traemos todos los datos relevantes para el escalafón militar
            const { results } = await env.DB.prepare("SELECT id, nombre_ic, placa, rango, division FROM soldados ORDER BY rango DESC").all();
            return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    if (request.method === "POST") {
        try {
            const data = await request.json();
            // Insertamos incluyendo la nueva columna de división
            await env.DB.prepare(`
                INSERT INTO soldados (nombre_ic, placa, rango, division, password) 
                VALUES (?, ?, ?, ?, ?)
            `).bind(data.nombre_ic, data.placa, data.rango, data.division, '12345').run();
            
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    if (request.method === "DELETE") {
        try {
            const { id } = await request.json();
            await env.DB.prepare("DELETE FROM soldados WHERE id = ?").bind(id).run();
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }
}
