const { ChromaClient } = require("chromadb");
const { OpenAI } = require("openai");

const client = new ChromaClient({
    path: process.env.CHROMA_URL || "http://localhost:8000"
});

const getEmbedder = () => {
    return {
        generate: async (texts) => {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: texts,
            });
            return response.data.map((d) => d.embedding);
        }
    };
};

const getProductCollection = async () => {
    return await client.getOrCreateCollection({
        name: "techpro_products",
        embeddingFunction: getEmbedder()
    });
};

const addProductToChroma = async (product) => {
    const collection = await getProductCollection();
    const content = `Tên sản phẩm: ${product.name}\nMô tả: ${product.description}\nGiá: ${product.price} VNĐ\nDanh mục: ${product.category}`;

    await collection.upsert({
        ids: [product.id.toString()],
        documents: [content],
        metadatas: [{
            name: product.name,
            price: product.price,
            category: product.category
        }]
    });
};
module.exports = { getProductCollection, addProductToChroma };
