const { OpenAI } = require("openai");
const { getProductCollection } = require("../configs/chroma");
const ChatSession = require("../models/ChatSession");

const handleChat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ message: "Vui lòng cung cấp tin nhắn" });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: "Lỗi cấu hình server: Thiếu OPENAI_API_KEY" });
        }

        // Initialize OpenAI client
        const openai = new OpenAI({ apiKey });

        // Retrieve or create ChatSession
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
            if (!session) {
                return res.status(404).json({ message: "Không tìm thấy phiên trò chuyện" });
            }
        } else {
            // Create a new session. Set title using the first 30 chars of the first message
            const title = message.length > 30 ? `${message.substring(0, 30)}...` : message;
            session = await ChatSession.create({
                userId,
                title,
                messages: []
            });
        }

        // Query ChromaDB for top relevant products using current message
        let productContext = "Không tìm thấy sản phẩm liên quan.";
        try {
            const collection = await getProductCollection();
            const results = await collection.query({
                queryTexts: [message],
                nResults: 3 // Get top 3 matches
            });

            if (results.documents && results.documents[0] && results.documents[0].length > 0) {
                productContext = results.documents[0].map(doc => `- ${doc}`).join("\n");
            }
        } catch (chromaError) {
            console.warn("ChromaDB query failed (fallback to empty context):", chromaError.message);
        }

        // System prompt
        const systemInstruction = `Bạn là trợ lý ảo thân thiện của cửa hàng TechPro, chuyên tư vấn về các thiết bị điện tử. 
Bạn CHỈ tư vấn dựa trên danh sách sản phẩm hiện có của cửa hàng sau đây:

${productContext}

QUY TẮC:
1. Nếu khách hàng hỏi về sản phẩm có trong danh sách trên, hãy tư vấn nhiệt tình, cung cấp thông tin chi tiết (giá, tính năng) dựa VÀO MÔ TẢ TRÊN.
2. Nếu khách hàng hỏi về sản phẩm không có trong danh sách, hãy xin lỗi và nói rằng cửa hàng hiện chưa kinh doanh sản phẩm này, đồng thời gợi ý sản phẩm tương tự nếu có.
3. Luôn định dạng giá tiền theo chuẩn VNĐ (ví dụ: 2.190.000 VNĐ).
4. Trả lời bằng tiếng Việt, ngắn gọn, lịch sự, dễ đọc.
5. Chỉ tập trung tư vấn sản phẩm, không trả lời các câu hỏi ngoài lề (chính trị, code, toán học...)
`;

        // Format history from DB
        const formattedHistory = session.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Get completions
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemInstruction },
                ...formattedHistory,
                { role: "user", content: message }
            ],
        });

        const assistantMessage = response.choices[0].message.content;

        // Save messages to DB
        session.messages.push({ role: "user", content: message });
        session.messages.push({ role: "assistant", content: assistantMessage });
        await session.save();

        res.status(200).json({
            sessionId: session._id,
            response: assistantMessage
        });

    } catch (error) {
        console.error("Error in chatController:", error);
        res.status(500).json({ message: "Lỗi khi kết nối với AI", error: error.message });
    }
};

const getUserSessions = async (req, res) => {
    try {
        const userId = req.user._id;
        const sessions = await ChatSession.find({ userId }).select("title createdAt updatedAt").sort({ updatedAt: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error in getUserSessions:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await ChatSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: "Không tìm thấy phiên trò chuyện" });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error("Error in getSessionDetails:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await ChatSession.findOneAndDelete({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: "Không tìm thấy phiên trò chuyện" });
        }

        res.status(200).json({ message: "Đã xóa phiên trò chuyện thành công" });
    } catch (error) {
        console.error("Error in deleteSession:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    handleChat,
    getUserSessions,
    getSessionDetails,
    deleteSession
};
