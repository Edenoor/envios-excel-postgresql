const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs')
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

const createDB = async () => {
    const createTableEnviosSQL = `
    CREATE TABLE IF NOT EXISTS envios (
      numero_tracking NUMBER,
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
  const createTableUsersSQL = `
  CREATE TABLE IF NOT EXISTS users(
  username TEXT,
  password TEXT,
  rol TEXT
  );
  `
  try {
    await pool.query(createTableEnviosSQL);
    await pool.query(createTableUsersSQL);
    console.log("✔️ Tabla 'envios' creada.");
    console.log("✔️ Tabla 'users' creada.");
  } catch (err) {
    console.error("❌ Error creando tabla:", err);
    throw err;
  }
}

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

app.post("/login", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const hash = await bcrypt.hash(password, 10);

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    )
    
    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password)
    await client.query("COMMIT");
    client.release();
    if(isPasswordValid){
      res.json({status: 'ok'});
    }
    else throw Error ('ERROR CONTRASEÑA INCORRECTA')
  } catch (error) {
    console.error("❌ Error haciendo login:", error);
    res.status(500).json({ ok: false, error: error.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

app.post("/register", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const rol = req.body.rol
  const hash = await bcrypt.hash(password, 10);

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `INSERT INTO users(username, password, rol) VALUES ($1, $2, $3)`,
      [username,hash,rol]
    )

    await client.query("COMMIT");
    client.release();
    res.json({status: 'ok'});
  } catch (error) {
    console.error("❌ Error creando usuario:", error);
    res.status(500).json({ ok: false, error: error.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

app.post("/recovery", async (req, res) => {
  const username = req.body.username
  const hash = await bcrypt.hash('0000', 10);

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `UPDATE users SET password = $1 WHERE username = $2`,
      [hash, username]
    )

    await client.query("COMMIT");
    client.release();
    res.json({status: 'ok', message: 'Su nueva contraseña es 0000'});
  } catch (error) {
    console.error("❌ Error recuperando contraseña:", error);
    res.status(500).json({ ok: false, error: error.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

createDB()
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


