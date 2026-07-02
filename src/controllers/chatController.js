const OpenAI = require("openai");
const ChatSession = require("../models/ChatSession");

// Cấu hình OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Prompt hệ thống
const SYSTEM_PROMPT = `Bạn là trợ lý ảo AI của cửa hàng tai nghe chính hãng TechPro. 
Hãy tư vấn nhiệt tình, thân thiện và chuyên nghiệp về các sản phẩm tai nghe SONY.
Hãy trả lời ngắn gọn, súc tích bằng tiếng Việt.`;

const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const session = await ChatSession.findOne({ userId });
        
        if (!session) {
            return res.status(200).json({ messages: [] });
        }

        res.status(200).json({ messages: session.messages });
    } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Tin nhắn không được để trống" });
        }

        // Tìm hoặc tạo session
        let session = await ChatSession.findOne({ userId });
        if (!session) {
            session = new ChatSession({ userId, messages: [] });
        }

        // Thêm tin nhắn của user vào DB
        const userMessage = { role: "user", content };
        session.messages.push(userMessage);
        await session.save();

        // Chuẩn bị lịch sử tin nhắn cho OpenAI
        const messagesForOpenAI = [
            { role: "system", content: SYSTEM_PROMPT },
            ...session.messages.map(msg => ({ role: msg.role, content: msg.content }))
        ];

        // Gọi OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // hoặc gpt-3.5-turbo
            messages: messagesForOpenAI,
            temperature: 0.7,
        });

        const assistantResponse = completion.choices[0].message.content;

        // Lưu phản hồi của bot vào DB
        const assistantMessage = { role: "assistant", content: assistantResponse };
        session.messages.push(assistantMessage);
        await session.save();

        res.status(200).json({ message: assistantMessage });
    } catch (error) {
        console.error("Lỗi gửi tin nhắn OpenAI:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xử lý chat", error: error.message });
    }
};

const clearChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await ChatSession.findOneAndDelete({ userId });
        
        res.status(200).json({ message: "Đã làm mới cuộc trò chuyện thành công" });
    } catch (error) {
        console.error("Lỗi xóa lịch sử chat:", error);
        res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
};

module.exports = {
    getChatHistory,
    sendMessage,
    clearChatHistory
};
