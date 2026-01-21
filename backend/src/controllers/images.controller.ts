// Author: Florian Rischer
import { Request, Response } from 'express';
import Image from '../models/Image';

// Get all images (metadata only, without data for listing)
export const getAllImages = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    // Exclude the data field for listing (it's too large)
    const images = await Image.find(filter).select('-data');
    
    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images',
    });
  }
};

// Get single image by slug (returns actual image)
export const getImageBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const image = await Image.findOne({ slug });
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }
    
    // Return the image as binary data
    const imageBuffer = Buffer.from(image.data, 'base64');
    
    res.set({
      'Content-Type': image.mimeType,
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    });
    
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch image',
    });
  }
};

// Get image metadata by slug
export const getImageMetadata = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const image = await Image.findOne({ slug }).select('-data');
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }
    
    res.json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch image metadata',
    });
  }
};

// Upload new image (Base64)
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { name, slug, category, mimeType, data } = req.body;
    
    if (!name || !slug || !category || !mimeType || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, slug, category, mimeType, data',
      });
    }
    
    // Check if image with slug already exists
    const existing = await Image.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Image with this slug already exists',
      });
    }
    
    const size = Buffer.from(data, 'base64').length;
    
    const image = new Image({
      name,
      slug,
      category,
      mimeType,
      data,
      size,
    });
    
    await image.save();
    
    res.status(201).json({
      success: true,
      data: {
        _id: image._id,
        name: image.name,
        slug: image.slug,
        category: image.category,
        mimeType: image.mimeType,
        size: image.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
    });
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const image = await Image.findOneAndDelete({ slug });
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
    });
  }
};
