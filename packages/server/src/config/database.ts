
import "dotenv/config";
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "projection_mapping",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function testDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query("SELECT DATABASE() AS database_name");

    console.log("[DATABASE] Conexión establecida correctamente");
    console.log("[DATABASE] Base de datos:", rows);
  } finally {
    connection.release();
  }
}
