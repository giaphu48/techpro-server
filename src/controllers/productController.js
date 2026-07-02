const Product = require("../models/Product");

const createProduct = async (req, res) => {
    try {
        const { id, name, description, price, imageUrl, category, badge, rating, reviews } = req.body;

        // Check if product already exists
        const productExists = await Product.findOne({ id });

        if (productExists) {
            return res.status(400).json({ message: "Sản phẩm với ID này đã tồn tại" });
        }

        const product = await Product.create({
            id,
            name,
            description,
            price,
            imageUrl,
            category,
            badge,
            rating,
            reviews,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
}

module.exports = {
    createProduct,
    getAllProducts,
};
