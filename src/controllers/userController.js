const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Đăng ký thành công",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
}

const deleteAllUser = async (req, res) => {
    try {
        await User.deleteMany();
        res.status(200).json({ message: "Xóa tất cả người dùng thành công" });
    } catch (error) {
        console.error("Error in deleteAllUser:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
}

module.exports = {
    registerUser,
    getAllUsers,
    deleteAllUser,
};