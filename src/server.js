const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/database");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const chatRoutes = require("./routes/chatRoutes");
const syncRoutes = require("./routes/syncRoutes");
const { runSync } = require("./controllers/syncController");
const dotenv = require("dotenv");

dotenv.config();


const app = express();

connectDB();

app.use(cors({ origin: process.env.CORS_URL, credentials: true }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sync", syncRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    try {
        console.log("🔄 Đang đồng bộ sản phẩm vào ChromaDB...");
        const result = await runSync();
        console.log(`✅ Đồng bộ hoàn tất: ${result.successCount}/${result.totalProducts} sản phẩm`);
    } catch (error) {
        console.error("❌ Lỗi đồng bộ ChromaDB:", error.message);
    }
});