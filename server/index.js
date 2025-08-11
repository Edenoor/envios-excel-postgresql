const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs')
const { Pool } = require("pg");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.disable('x-powered-by')

// Conexión a PostgreSQL
const pool = new Pool({
  user: "postgres", // o tu usuario de pgAdmin
  host: "localhost",
  database: "excel_envios",
  password: "lynx",
  port: 5432,
});

const createDB = async () => {
  const createTableEnviosSQL = `
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
  const createTableUsersSQL = `
    CREATE TABLE IF NOT EXISTS users(
      username TEXT,
      password TEXT,
      rol TEXT
    );
  `;
  try {
    await pool.query(createTableEnviosSQL);
    await pool.query(createTableUsersSQL);
    console.log("✔️ Tabla 'envios' creada.");
    console.log("✔️ Tabla 'users' creada.");

    // --------- Usuarios por defecto ---------
    const defaultUsers = [
      { username: 'admin', password: 'admin123', rol: 'admin' },
      { username: 'lithium', password: '1234', rol: 'seller' },
      { username: 'daniela ancona', password: '1234', rol: 'driver' },
    ];

    for (const u of defaultUsers) {
      const exists = await pool.query(
        'SELECT 1 FROM users WHERE username = $1',
        [u.username]
      );
      if (exists.rowCount === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        await pool.query(
          'INSERT INTO users(username, password, rol) VALUES ($1, $2, $3)',
          [u.username, hash, u.rol]
        );
        console.log(`✅ Usuario creado: ${u.username} (${u.rol})`);
      }
    }
    // ----------------------------------------

  } catch (err) {
    console.error("❌ Error creando tabla:", err);
    throw err;
  }
}

// Ruta para insertar datos
app.post("/api/envios", async (req, res) => {
  const rows = req.body;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    await createDB();
    await pool.query("DELETE FROM envios");

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

// app.post("/driver/me", async (req, res) => {
//   const name = req.body.username;
//   console.log(name);
  
//   try {
//     const client = await pool.connect();
//     await client.query("BEGIN");

//     const result = await pool.query(
//       `SELECT  
//       numero_tracking,
//       fecha_colecta,
//       nombre_fantasia,
//       direccion,
//       cp,
//       estado,
//       cadete,
//       total,
//       zona,
//       precio_chofer
//       FROM envios WHERE cadete = $1`,
//       [name]
//     )

//     console.log(result.rows);
    
//     await client.query("COMMIT");
//     client.release();
//     res.json({status: 'ok',result: result.rows});
//   } catch (err) {
//     console.error("❌ Error trayendo datos:", err);
//     res.status(500).json({ ok: false, error: err.message });
//     await client.query("ROLLBACK");
//     client.release();
//   }
// })

// app.post("/client/me", async (req, res) => {
//   const name = req.body.username;

//   try {
//     const client = await pool.connect();
//     await client.query("BEGIN");

//     const result = await client.query(
//       `SELECT  
//       numero_tracking,
//       fecha_colecta,
//       nombre_fantasia,
//       direccion,
//       cp,
//       estado,
//       cadete,
//       total,
//       zona,
//       precio_cliente
//       FROM envios WHERE nombre_fantasia = $1`,
//       [name]
//     )

//     console.log(result.rows);
    
//     await client.query("COMMIT");
//     client.release();
//     res.json({status: 'ok',result: result.rows});
//   } catch (err) {
//     console.error("❌ Error trayendo datos:", err);
//     res.status(500).json({ ok: false, error: err.message });
//     await client.query("ROLLBACK");
//     client.release();
//   }
// })

app.post("/client/me", async (req, res) => {
  const { username } = req.body;
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const q = `
      SELECT
        numero_tracking,
        fecha_colecta,
        nombre_fantasia,
        direccion,
        cp,
        estado,
        cadete,
        total,
        zona,
        precio_cliente,
        COALESCE(descuento, '0')::float AS descuento
      FROM envios
      WHERE 
        LOWER(usuario_ml_id) = LOWER($1)
        OR LOWER(cod_cliente) = LOWER($1)
        OR LOWER(razon_social) = LOWER($1)
        OR LOWER(nombre_fantasia) = LOWER($1)
    `;

    const result = await client.query(q, [username]);
    const rows = result.rows;

    // ✅ Calcular totales
    const totalEnvios = rows.length;
    const montoTotal = rows.reduce((acc, r) => acc + Number(r.precio_cliente || 0), 0);
    const totalDescuento = rows.reduce((acc, r) => acc + (Number(r.precio_cliente) * Number(r.descuento)), 0);
    const netoFinal = montoTotal - totalDescuento;
    const descuentoPromedio = rows.length ? totalDescuento / montoTotal : 0;

    await client.query("COMMIT");
    client.release();

    return res.json({
      status: "ok",
      result: rows,
      totales: {
        totalEnvios,
        montoTotal,
        netoFinal,
      },
      discount: descuentoPromedio,
    });
  } catch (err) {
    console.error("❌ Error trayendo datos /client/me:", err);
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
      client.release();
    }
    return res.status(500).json({ ok: false, error: err.message });
  }
});



app.get("/admin", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    // Cadete summary with sum(precio_chofer), porcentaje_chofer, and sum(neto_chofer)
    const choferResult = await client.query(`
      SELECT 
        cadete AS chofer,
        SUM(precio_chofer::numeric) AS semanal,
        porcentaje_chofer AS "%", 
        SUM(neto_chofer::numeric) AS parcial
      FROM envios
      WHERE 
        cadete IS NOT NULL
        AND precio_chofer ~ '^\\d+(\\.\\d+)?$'
        AND neto_chofer ~ '^\\d+(\\.\\d+)?$'
        AND porcentaje_chofer ~ '^\\d+(\\.\\d+)?$'
      GROUP BY cadete, porcentaje_chofer
    `);

    // Cliente summary with sum(precio_cliente), descuento, and parcial = semanal - (semanal * descuento)
    const clienteResult = await client.query(`
      SELECT 
        nombre_fantasia AS cliente,
        SUM(precio_cliente::numeric) AS semanal,
        descuento AS "%", 
        ROUND(SUM(precio_cliente::numeric) * (1 - descuento::numeric), 2) AS parcial
      FROM envios
      WHERE 
        nombre_fantasia IS NOT NULL
        AND precio_cliente ~ '^\\d+(\\.\\d+)?$'
        AND descuento ~ '^\\d+(\\.\\d+)?$'
      GROUP BY nombre_fantasia, descuento
    `);

    await client.query("COMMIT");
    client.release();

    res.json({
      status: 'ok',
      resumen_cadetes: choferResult.rows,
      resumen_clientes: clienteResult.rows
    });

  } catch (err) {
    console.error("❌ Error trayendo resumen:", err);
    res.status(500).json({ ok: false, error: err.message });

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error al hacer rollback:", rollbackError);
    }

    if (client) client.release();
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    )
    
    const isPasswordValid = await bcrypt.compare(password, result.rows[0].password)
    await client.query("COMMIT");
    
    client.release();
    data = {
      username: result.rows[0].username, 
      rol: result.rows[0].rol
    }
    if(isPasswordValid){
      return res.status(200).json({status: 'ok', user: data});
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

app.post("/update", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const hash = await bcrypt.hash(password, 10);

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const result = await pool.query(
      `UPDATE users SET password = $1 WHERE username = $2`,
      [hash, username]
    )

    await client.query("COMMIT");
    client.release();
    res.json({status: 'ok', message: 'Su nueva contraseña es ' + password});
  } catch (error) {
    console.error("❌ Error actualizar contraseña:", error);
    res.status(500).json({ ok: false, error: error.message });
    await client.query("ROLLBACK");
    client.release();
  }
})

app.post("/reset-db", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    // Borrar todos los datos de envios y users
    await client.query("DELETE FROM envios");
    await client.query("DELETE FROM users");

    // Crear nuevamente las tablas si no existen
    await createDB();

    await client.query("COMMIT");
    client.release();

    res.status(200).json({ status: "ok", message: "Base de datos reiniciada correctamente." });
  } catch (err) {
    console.error("❌ Error reiniciando base de datos:", err);
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("❌ Error haciendo rollback:", rollbackError);
    }
    if (client) client.release();
    res.status(500).json({ ok: false, error: "Error reiniciando base de datos" });
  }
});

// En tu archivo index.js o donde manejás las rutas
app.post("/driver/porcentaje", async (req, res) => {
  const { username } = req.body;

  try {
    const result = await pool.query(
      "SELECT porcentaje_chofer FROM users WHERE username = $1 LIMIT 1",
      [username]
    );

    if (result.rows.length > 0) {
      res.json({ porcentaje: result.rows[0].porcentaje_chofer });
    } else {
      res.status(404).json({ error: "No se encontró el chofer" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


app.post("/driver/me", async (req, res) => {
  const name = req.body.username;

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT  
        numero_tracking,
        fecha_colecta,
        nombre_fantasia,
        direccion,
        cp,
        estado,
        cadete,
        total,
        zona,
        precio_chofer,
        porcentaje_chofer
      FROM envios 
      WHERE cadete = $1`,
      [name]
    );

    await client.query("COMMIT");
    client.release();

    const rows = result.rows;

    const totalEnvios = rows.length;
    const montoTotal = rows.reduce((sum, r) => sum + Number(r.precio_chofer || 0), 0);
    const porcentaje = rows[0]?.porcentaje_chofer ? parseFloat(rows[0].porcentaje_chofer) : 0;
    const netoFinal = montoTotal * (1 - porcentaje);

    return res.json({
      status: 'ok',
      result: rows,
      totales: { totalEnvios, montoTotal, netoFinal },
      discount: porcentaje,
    });

  } catch (err) {
    console.error("❌ Error trayendo datos /driver/me:", err);
    if (client) {
      try { await client.query("ROLLBACK"); } catch {}
      client.release();
    }
    return res.status(500).json({ ok: false, error: err.message });
  }
});




createDB()
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});



