import { type SQLiteDatabase } from 'expo-sqlite';

// Ya no abrimos la conexión aquí. Esta función solo recibe
// la conexión que el SQLiteProvider crea y la usa para
// inicializar la tabla.
export const initDatabase = async (db: SQLiteDatabase) => {

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            calificacion INTEGER NOT NULL,
            comentarios TEXT NOT NULL,
            fotoBase64 TEXT NOT NULL,
            fecha TEXT NOT NULL
        );
    `);

    console.log("Base de datos local lista");
};