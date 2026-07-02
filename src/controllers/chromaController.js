const Product = require("../models/Product");
const { getProductCollection } = require("../configs/chroma");

const syncProductsToChroma = async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Thiếu OPENAI_API_KEY để tạo embedding" });
        }

        const products = await Product.find({});
        if (products.length === 0) {
            return res.status(200).json({ message: "Không có sản phẩm nào để đồng bộ" });
        }

        const collection = await getProductCollection();

        const ids = products.map(p => p.id.toString());
        const documents = products.map(p =>
            `${p.name}. Danh mục: ${p.category}. Giá: ${p.price}. Mô tả: ${p.description}. ${p.badge ? `Nhãn: ${p.badge}` : ''}`
        );
        const metadatas = products.map(p => ({
            name: p.name,
            price: p.price,
            category: p.category
        }));

        // Upsert (Insert or Update)
        await collection.upsert({
            ids,
            documents,
            metadatas
        });

        res.status(200).json({ message: `Đã đồng bộ thành công ${products.length} sản phẩm vào ChromaDB` });
    } catch (error) {
        console.error("Error syncing to ChromaDB:", error);
        res.status(500).json({ message: "Lỗi đồng bộ ChromaDB", error: error.message });
    }
};

module.exports = {
    syncProductsToChroma
};
