// Author: Florian Rischer
import { Request, Response } from 'express';
import Message from '../models/Message';

// GET all messages
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { read } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (read === 'true') filter.read = true;
    if (read === 'false') filter.read = false;
    
    const messages = await Message.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching messages'
    });
  }
};

// GET single message
export const getMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching message'
    });
  }
};

// POST create new message (contact form submission)
export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, subject, and message'
      });
    }
    
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while sending message'
    });
  }
};

// PUT mark message as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating message'
    });
  }
};

// DELETE message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting message'
    });
  }
};
