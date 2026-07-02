const Product = require("../models/Product");
const { addProductToChroma } = require("../configs/chroma");

// Core logic - gọi được mà không cần req/res
const runSync = async () => {
    const products = await Product.find({});

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
        try {
            await addProductToChroma(product);
            successCount++;
        } catch (error) {
            console.error(`Failed to sync product ${product.id}:`, error);
            failCount++;
        }
    }

    return { totalProducts: products.length, successCount, failCount };
};

// Express route handler
const syncProductsToChroma = async (req, res) => {
    try {
        const result = await runSync();
        res.status(200).json({
            message: "Đồng bộ hóa dữ liệu hoàn tất",
            ...result
        });
    } catch (error) {
        console.error("Error in syncProductsToChroma:", error);
        res.status(500).json({ message: "Lỗi server khi đồng bộ", error: error.message });
    }
};

module.exports = {
    syncProductsToChroma,
    runSync
};
