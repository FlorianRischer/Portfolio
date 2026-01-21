// Author: Florian Rischer
import { Router } from 'express';
import {
  getAllImages,
  getImageBySlug,
  getImageMetadata,
  uploadImage,
  deleteImage,
} from '../controllers/images.controller';

const router = Router();

// GET /api/images - Get all images (metadata only)
router.get('/', getAllImages);

// GET /api/images/:slug/metadata - Get image metadata
router.get('/:slug/metadata', getImageMetadata);

// GET /api/images/:slug - Get actual image file
router.get('/:slug', getImageBySlug);

// POST /api/images - Upload new image
router.post('/', uploadImage);

// DELETE /api/images/:slug - Delete image
router.delete('/:slug', deleteImage);

export default router;
