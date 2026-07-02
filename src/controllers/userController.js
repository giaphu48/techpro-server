const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isValidEmail, isValidPassword } = require("../utils/validation");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        if (name.length < 3 || name.length > 50) {
            return res.status(400).json({ message: "Tên phải có từ 3 đến 50 ký tự" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự và bao gồm ít nhất một chữ hoa, một chữ thường, một chữ số và một ký tự đặc biệt." });
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
                favorites: newUser.favorites || [],
            },
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || "default_secret_key",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                favorites: user.favorites || [],
            },
            token,
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
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

const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        const isFavorited = user.favorites.includes(productId);

        if (isFavorited) {
            user.favorites = user.favorites.filter((id) => id !== productId);
        } else {
            user.favorites.push(productId);
        }

        await user.save();

        res.status(200).json({
            message: isFavorited ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích",
            favorites: user.favorites,
        });
    } catch (error) {
        console.error("Error in toggleFavorite:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        res.status(200).json({
            favorites: user.favorites,
        });
    } catch (error) {
        console.error("Error in getFavorites:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    deleteAllUser,
    toggleFavorite,
    getFavorites,
};