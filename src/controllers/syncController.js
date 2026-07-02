const Product = require("../models/Product");
const { upsertProductToChroma } = require("../configs/chroma");

const syncProductsToChroma = async (req, res) => {
    try {
        const products = await Product.find({});

        let successCount = 0;
        let failCount = 0;

        for (const product of products) {
            try {
                await upsertProductToChroma(product);
                successCount++;
            } catch (error) {
                console.error(`Failed to sync product ${product.id}:`, error);
                failCount++;
            }
        }

        res.status(200).json({
            message: "Đồng bộ hóa dữ liệu hoàn tất",
            totalProducts: products.length,
            successCount,
            failCount
        });
    } catch (error) {
        console.error("Error in syncProductsToChroma:", error);
        res.status(500).json({ message: "Lỗi server khi đồng bộ", error: error.message });
    }
};

module.exports = {
    syncProductsToChroma
};
