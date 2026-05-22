const Conversation = require("../model/conversation.model");
const Message = require("../model/message.model");

// @desc  Get or create a conversation between two users
// @route POST /api/conversations
const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user._id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name" },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
      });
      conversation = await conversation.populate("participants", "-password");
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all conversations for logged-in user
// @route GET /api/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name" },
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get messages for a conversation
// @route GET /api/conversations/:id/messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.id,
        sender: { $ne: req.user._id },
        status: { $ne: "read" },
      },
      { status: "read" }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Send a message
// @route POST /api/conversations/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.id;

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text,
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populated = await message.populate("sender", "name avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
};
