import Message from '../models/Message.js';

// @desc    Create contact message
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const senderId = req.user ? req.user._id : null;

    const newMessage = await Message.create({
      sender: senderId,
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you shortly.',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/messages
// @access  Private (Admin)
export const getAllMessages = async (req, res, next) => {
  try {
    const { isRead, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (isRead !== undefined && isRead !== 'all') {
      query.isRead = isRead === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const count = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total: count,
      page: Number(page),
      pages: Math.ceil(count / limit),
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message by ID & mark read (Admin)
// @route   GET /api/messages/:id
// @access  Private (Admin)
export const getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to message (Admin)
// @route   PUT /api/messages/:id/reply
// @access  Private (Admin)
export const replyMessage = async (req, res, next) => {
  try {
    const { replyText } = req.body;

    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply text cannot be empty',
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    message.replyMessage = replyText;
    message.repliedAt = new Date();
    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reply recorded successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (Admin)
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
