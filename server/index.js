const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));


// Conexión a PostgreSQL
const pool = new Pool({
  user: "postgres", // o tu usuario de pgAdmin
  host: "localhost",
  database: "excel_envios",
  password: "postgre",
  port: 5432,
});

const ensureTableExistsAndClean = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS envios (
      numero_tracking TEXT,
      id_venta_ml TEXT,
      usuario_ml_id TEXT,
      fecha_venta TEXT,
      fecha_colecta TEXT,
      fecha_wyn_flex TEXT,
      metodo_envio TEXT,
      cod_cliente TEXT,
      razon_social TEXT,
      nombre_fantasia TEXT,
      nombre_destinatario TEXT,
      tel_destinatario TEXT,
      email_destinatario TEXT,
      comentario_destino TEXT,
      direccion TEXT,
      cp TEXT,
      localidad TEXT,
      provincia TEXT,
      latitud TEXT,
      longitud TEXT,
      estado TEXT,
      fecha_estado TEXT,
      quien_estado TEXT,
      costo_envio TEXT,
      cadete TEXT,
      fecha_asignacion TEXT,
      zonas TEXT,
      zonas_costos TEXT,
      observaciones TEXT,
      url_tracking TEXT,
      origen TEXT,
      total TEXT,
      zona TEXT,
      precio_cliente TEXT,
      precio_chofer TEXT,
      porcentaje_chofer TEXT,
      neto_chofer TEXT,
      ganancia TEXT,
      descuento TEXT,
      ganancia_real TEXT
    );
  `;

  try {
    await pool.query(createTableSQL);
    await pool.query("DELETE FROM envios");
    console.log("✔️ Tabla 'envios' asegurada y vaciada.");
  } catch (err) {
    console.error("❌ Error asegurando tabla:", err);
    throw err;
  }
};


// Ruta para insertar datos
app.post("/api/envios", async (req, res) => {
  const rows = req.body;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    await ensureTableExistsAndClean(); // 🧼 Ensures table is ready and clean

    for (const row of rows) {
        const values = Object.values(row);


      await pool.query(
        `INSERT INTO envios (
          numero_tracking, id_venta_ml, usuario_ml_id, fecha_venta, fecha_colecta,
          fecha_wyn_flex, metodo_envio, cod_cliente, razon_social, nombre_fantasia,
          nombre_destinatario, tel_destinatario, email_destinatario, comentario_destino,
          direccion, cp, localidad, provincia, latitud, longitud, estado, fecha_estado,
          quien_estado, costo_envio, cadete, fecha_asignacion, zonas, zonas_costos,
          observaciones, url_tracking, origen, total, zona, precio_cliente, precio_chofer,
          porcentaje_chofer, neto_chofer, ganancia, descuento, ganancia_real
        ) VALUES (${Array.from({ length: 40 }, (_, i) => `$${i + 1}`).join(", ")})`,
        Object.values(row)
      );
    }

    await client.query("COMMIT");
    client.release();
    res.status(200).json({ message: "Datos insertados correctamente" });
  } catch (err) {
    console.error("❌ Error insertando datos:", err);
    res.status(500).json({ error: "Error en el servidor" });
    await client.query("ROLLBACK");
    client.release();
  }
});

app.post("/cargar-excel", async (req, res) => {
  const filas = req.body;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    for (const row of filas) {
      await client.query(
        `INSERT INTO envios (
          numero_tracking, id_venta_ml, usuario_ml_id, fecha_venta, fecha_colecta,
          fecha_wynflex, metodo_envio, cod_cliente, razon_social, nombre_fantasia,
          nombre_destinatario, tel_destinatario, email_destinatario, comentario_destino,
          direccion, cp, localidad, provincia, latitud, longitud, estado, fecha_estado,
          quien_estado, costo_envio, cadete, fecha_asignacion, zonas, zonas_costos,
          observaciones, url_tracking, origen, total, zona, precio_cliente, precio_chofer,
          porcentaje_chofer, neto_chofer, ganancia, descuento, ganancia_real
        ) VALUES (${Array.from({ length: 40 }, (_, i) => `$${i + 1}`).join(", ")})`,
        row
      );
    }

    await client.query("COMMIT");
    client.release();
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error insertando datos:", err);
    res.status(500).json({ ok: false, error: err.message });
    await client.query("ROLLBACK");
    client.release();
  }
});

app.get("/driver/me", async (req, res) => {
  const name = req.body.name;
  

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `SELECT * FROM envios WHERE cadete = $1`,
      [name]
    )

    console.log(result.rows);
    
    
    await client.query("COMMIT");
    client.release();
    res.json({status: 'ok',result: result.rows});
  } catch (err) {
    console.error("❌ Error trayendo datos:", err);
    res.status(500).json({ ok: false, error: err.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

app.get("/client/me", async (req, res) => {
  const name = req.body.name;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `SELECT * FROM envios WHERE nombre_fantasia = $1`,
      [name]
    )

    console.log(result.rows);
    
    
    await client.query("COMMIT");
    client.release();
    res.json({status: 'ok',result: result.rows});
  } catch (err) {
    console.error("❌ Error trayendo datos:", err);
    res.status(500).json({ ok: false, error: err.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
