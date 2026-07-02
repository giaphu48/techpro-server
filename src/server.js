const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/database");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const dotenv = require("dotenv");

dotenv.config();


const app = express();

const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});