import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();
const PORT = Number(process.env.PORT ?? 3000);
app.use(cors());
app.use(express.json());
/**
 * Endpoint para verificar que el servidor
 * HTTP se encuentra funcionando.
 */
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "projection-server"
    });
});
/**
 * Inicia el servidor HTTP.
 */
app.listen(PORT, () => {
    console.log(`[SERVER] Servidor disponible en http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map