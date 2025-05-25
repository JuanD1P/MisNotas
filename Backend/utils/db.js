import mysql from 'mysql';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "proyectoi"
});

con.connect((err) => {
  if (err) {
    console.log("❌ Conexión errónea:", err);
  } else {
    console.log("✅ Conexión exitosa a la base de datos");
  }
});

// Transportador de correo 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contacto.coneycloud@gmail.com',
    pass: 'zykbnfqrpfiazzli' 
  }
});

cron.schedule('0 7 * * *', () => {
  console.log("📬 Revisando recordatorios que vencen mañana...");

  const query = `
    SELECT 
      r.titulo, 
      r.descripcion, 
      r.fecha_entrega, 
      r.usuario_id,
      u.email, 
      u.nombre_completo, 
      m.nombre AS materia
    FROM recordatorios r
    INNER JOIN usuarios u ON r.usuario_id = u.id
    INNER JOIN materias m ON r.materia_id = m.id
    WHERE DATE(r.fecha_entrega) = CURDATE() + INTERVAL 1 DAY
      AND r.enviado = 0;
  `;

  con.query(query, (err, resultados) => {
    if (err) {
      return console.error("❌ Error consultando recordatorios que vencen mañana:", err);
    }

    resultados.forEach((r) => {
      const mailOptions = {
        from: '"MisNotas" <contacto.coneycloud@gmail.com>',
        to: r.email,
        subject: `🔔 Recordatorio académico: actividad vence mañana`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
            <h2 style="color:#6c5ce7;">Hola ${r.nombre_completo} 👋</h2>
            <p>Este es un recordatorio amigable de que tienes una actividad pendiente para mañana:</p>
            <ul>
              <li><strong>📘 Materia:</strong> ${r.materia}</li>
              <li><strong>📝 Título:</strong> ${r.titulo}</li>
              <li><strong>🗒 Descripción:</strong> ${r.descripcion}</li>
              <li><strong>📅 Fecha de entrega:</strong> ${new Date(r.fecha_entrega).toLocaleDateString()}</li>
            </ul>
            <p style="margin-top:20px;">¡Ánimo! Aún estás a tiempo para completarla. 💪</p>
            <p style="text-align:center; margin-top:30px; font-size:12px; color:#888;">Tu app académica MisNotas</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error(`❌ Error enviando correo a ${r.email}:`, error);
        }

        console.log(`✅ Correo enviado a ${r.email}: ${info.response}`);

        con.query(
          `UPDATE recordatorios SET enviado = 1 WHERE titulo = ? AND usuario_id = ?`,
          [r.titulo, r.usuario_id],
          (err2) => {
            if (err2) {
              console.error("❌ Error actualizando campo enviado:", err2);
            }
          }
        );
      });
    });
  });
});

export default con;
