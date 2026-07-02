const { ChromaClient } = require("chromadb");
const OpenAI = require("openai");

const client = new ChromaClient({
    path: process.env.CHROMA_URL || "http://localhost:8000"
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const COLLECTION_NAME = "techpro_products";

async function embedText(text) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return response.data[0].embedding;
}

const customEmbeddingFunction = {
    generate: async (texts) => {
        const embeddings = [];
        for (const text of texts) {
            const embedding = await embedText(text);
            embeddings.push(embedding);
        }
        return embeddings;
    }
};

async function getCollection() {
    return await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: customEmbeddingFunction
    });
}



// Lưu sản phẩm vào VectorDB
async function upsertProductToChroma(product) {
    const collection = await getCollection();
    
    // Tạo nội dung phong phú để nhúng (embed)
    const contentToEmbed = `Tên sản phẩm: ${product.name}. 
Giá: ${product.price} VND. 
Danh mục: ${product.category}. 
Mô tả chi tiết: ${product.description}. 
Đánh giá: ${product.rating} sao (${product.reviews} lượt đánh giá).`;

    const embedding = await embedText(contentToEmbed);

    await collection.upsert({
        ids: [product.id],
        embeddings: [embedding],
        metadatas: [{ 
            name: product.name, 
            price: product.price, 
            category: product.category,
            description: product.description 
        }],
        documents: [contentToEmbed]
    });
}

// Tìm kiếm sản phẩm tương tự dựa trên câu hỏi
async function searchSimilarProducts(queryText, nResults = 3) {
    try {
        const collection = await getCollection();
        const queryEmbedding = await embedText(queryText);

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: nResults,
        });

        // Kết quả trả về chứa metadatas và documents
        if (results && results.metadatas && results.metadatas[0]) {
            return results.metadatas[0].map((meta, index) => ({
                id: results.ids[0][index],
                name: meta.name,
                price: meta.price,
                category: meta.category,
                description: meta.description
            }));
        }
        return [];
    } catch (error) {
        console.error("Error searching in Chroma:", error);
        return [];
    }
}

module.exports = {
    getCollection,
    upsertProductToChroma,
    searchSimilarProducts
};
