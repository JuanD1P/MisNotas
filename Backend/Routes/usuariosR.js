import express from 'express';
import con from '../utils/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import axios from 'axios';

const router = express.Router();



// 🚀 REGISTRO DE USUARIOS
router.post('/register', async (req, res) => {
    const { email, password, nombre_completo } = req.body;

    if (!email || !password || !nombre_completo) {
        return res.json({ registrationStatus: false, Error: "Faltan datos" });
    }

    try {
        con.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.json({ registrationStatus: false, Error: "Error en la base de datos" });
            }
            if (result.length > 0) {
                return res.json({ registrationStatus: false, Error: "El email ya está registrado" });
            }

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar usuario con rol 'USER' por defecto
            const sql = "INSERT INTO usuarios (email, password, nombre_completo, rol) VALUES (?, ?, ?, 'USER')";
            con.query(sql, [email, hashedPassword, nombre_completo], (err, result) => {
                if (err) {
                    console.error("Error al insertar usuario:", err);
                    return res.json({ registrationStatus: false, Error: "Error de inserción" });
                }
                console.log("Usuario registrado correctamente");
                return res.json({ registrationStatus: true });
            });
        });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ registrationStatus: false, Error: "Error interno" });
    }
});

// 🚀 LOGIN DE USUARIOS
router.post('/userlogin', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";
    con.query(sql, [email], async (err, result) => {
        if (err) {
            console.error("❌ Error en la consulta:", err);
            return res.json({ loginStatus: false, Error: "Error en la base de datos" });
        }
        if (result.length === 0) {
            return res.json({ loginStatus: false, Error: "Usuario no encontrado" });
        }

        try {
            const validPassword = await bcrypt.compare(password, result[0].password);
            if (!validPassword) {
                return res.json({ loginStatus: false, Error: "Contraseña incorrecta" });
            }

            // Crear el token con el rol
            const token = jwt.sign({ role: result[0].rol, email: email }, "jwt_secret_key", { expiresIn: '1d' });
            res.cookie('token', token); 
                return res.json({
                loginStatus: true,
                role: result[0].rol,
                id: result[0].id,
                token 
                });


        } catch (error) {
            console.error("❌ Error en login:", error);
            return res.json({ loginStatus: false, Error: "Error interno" });
        }
    });
});


// 🧾 OBTENER TODOS LOS USUARIOS
router.get('/usuarios', (req, res) => {
    con.query("SELECT id, nombre_completo, email, rol FROM usuarios", (err, result) => {
        if (err) {
            console.error("Error al obtener usuarios:", err);
            return res.status(500).json({ error: "Error al obtener usuarios" });
        }
        res.json(result);
    });
});

// 🛠️ ACTUALIZAR ROL DE USUARIO
router.put('/usuarios/:id/rol', (req, res) => {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['USER', 'ADMIN'].includes(rol)) {
        return res.status(400).json({ error: "Rol inválido" });
    }

    con.query("UPDATE usuarios SET rol = ? WHERE id = ?", [rol, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar rol:", err);
            return res.status(500).json({ error: "Error al actualizar el rol" });
        }
        res.json({ message: "Rol actualizado correctamente" });
    });
});


// 🗑️ ELIMINAR USUARIO POR ID
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    con.query("DELETE FROM usuarios WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("❌ Error al eliminar usuario:", err);
            return res.status(500).json({ error: "Error al eliminar el usuario" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    });
});

router.post('/recordatorios', (req, res) => {
  const { usuario_id, materia_id, titulo, descripcion, fecha_entrega } = req.body;

  con.query(
    'INSERT INTO recordatorios (usuario_id, materia_id, titulo, descripcion, fecha_entrega) VALUES (?, ?, ?, ?, ?)',
    [usuario_id, materia_id, titulo, descripcion, fecha_entrega],
    (err, result) => {
      if (err) {
        console.error('Error al insertar recordatorio:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

router.get('/materias', (req, res) => {
  const usuario_id = req.query.usuario_id;

  con.query(
    'SELECT id, nombre, descripcion FROM materias WHERE usuario_id = ?',
    [usuario_id],
    (err, result) => {
      if (err) {
        console.error('Error al obtener materias:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(result);
    }
  );
});


router.get('/recordatorios', (req, res) => {
  const usuario_id = req.query.usuario_id;

  con.query(
    'SELECT * FROM recordatorios WHERE usuario_id = ?',
    [usuario_id],
    (err, result) => {
      if (err) {
        console.error('Error al obtener recordatorios:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(result);
    }
  );
});

// Cambiar estado de enviado a 1
router.put('/recordatorios/:id/entregar', (req, res) => {
  const { id } = req.params;
  con.query(
    'UPDATE recordatorios SET enviado = 1 WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error al marcar como entregado:', err);
        return res.status(500).json({ error: 'Error al actualizar' });
      }
      res.json({ message: 'Estado actualizado a entregado' });
    }
  );
});

// Eliminar recordatorio
router.delete('/recordatorios/:id', (req, res) => {
  const { id } = req.params;
  con.query(
    'DELETE FROM recordatorios WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('Error al eliminar:', err);
        return res.status(500).json({ error: 'Error al eliminar' });
      }
      res.json({ message: 'Recordatorio eliminado' });
    }
  );
});


export { router as userRouter };


router.post('/materias', (req, res) => {
  const { usuario_id, nombre, descripcion } = req.body;

  if (!usuario_id || !nombre) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  con.query(
    'INSERT INTO materias (usuario_id, nombre, descripcion) VALUES (?, ?, ?)',
    [usuario_id, nombre, descripcion],
    (err, result) => {
      if (err) {
        console.error('Error al insertar materia:', err);
        return res.status(500).json({ error: 'Error al insertar materia' });
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});


router.delete('/materias/:id', (req, res) => {
  const { id } = req.params;

  con.query('DELETE FROM materias WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar materia:', err);
      return res.status(500).json({ error: 'Error al eliminar materia' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.json({ message: 'Materia eliminada correctamente' });
  });
});


router.get('/notas', (req, res) => {
  const { materia_id } = req.query;

  con.query(
    'SELECT id, titulo, valor, porcentaje FROM notas WHERE materia_id = ?',
    [materia_id],
    (err, result) => {
      if (err) {
        console.error('Error al obtener notas:', err);
        return res.status(500).json({ error: 'Error al obtener notas' });
      }
      res.json(result);
    }
  );
});


router.post('/notas', (req, res) => {
  const { materia_id, titulo, valor, porcentaje } = req.body;

  if (!materia_id || !titulo || !porcentaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Sumar porcentajes existentes para validar
  con.query('SELECT SUM(porcentaje) AS total FROM notas WHERE materia_id = ?', [materia_id], (err, result) => {
    if (err) {
      console.error('Error al sumar porcentajes:', err);
      return res.status(500).json({ error: 'Error interno' });
    }

    const totalActual = result[0].total || 0;
    const nuevoTotal = totalActual + parseFloat(porcentaje);

    if (nuevoTotal > 100) {
      return res.status(400).json({ error: `La suma total de porcentajes excede 100% (actual: ${totalActual}%)` });
    }

    // Insertar nota
    con.query(
      'INSERT INTO notas (materia_id, titulo, valor, porcentaje) VALUES (?, ?, ?, ?)',
      [materia_id, titulo, valor, porcentaje],
      (err, result) => {
        if (err) {
          console.error('Error al insertar nota:', err);
          return res.status(500).json({ error: 'Error al insertar nota' });
        }
        res.status(201).json({ id: result.insertId });
      }
    );
  });
});



router.put('/notas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, valor, porcentaje, materia_id } = req.body;

  if (!titulo || valor === undefined || porcentaje === undefined || !materia_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Verificar que el nuevo porcentaje no exceda el 100% sumando los otros registros
  const sqlSuma = 'SELECT SUM(porcentaje) AS total FROM notas WHERE materia_id = ? AND id != ?';

  con.query(sqlSuma, [materia_id, id], (err, result) => {
    if (err) {
      console.error('Error al verificar porcentajes:', err);
      return res.status(500).json({ error: 'Error al validar porcentaje' });
    }

    const totalActual = result[0].total || 0;
    const nuevoTotal = totalActual + parseFloat(porcentaje);

    if (nuevoTotal > 100) {
      return res.status(400).json({ error: `La suma de porcentajes excede el 100% (actual: ${totalActual}%)` });
    }

    // Actualizar la nota
    const sqlUpdate = 'UPDATE notas SET titulo = ?, valor = ?, porcentaje = ? WHERE id = ?';

    con.query(sqlUpdate, [titulo, valor, porcentaje, id], (err, result) => {
      if (err) {
        console.error('Error al actualizar nota:', err);
        return res.status(500).json({ error: 'Error al actualizar nota' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      res.json({ message: 'Nota actualizada correctamente' });
    });
  });
});


router.delete('/notas/:id', (req, res) => {
  const { id } = req.params;

  con.query('DELETE FROM notas WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar nota:', err);
      return res.status(500).json({ error: 'Error al eliminar nota' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    res.json({ message: 'Nota eliminada correctamente' });
  });
});
