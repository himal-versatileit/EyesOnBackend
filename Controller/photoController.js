import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/incidents'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `incident-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

class PhotoController {
    static async uploadPhoto(req, res) {
        try {
            // The file will be uploaded to the uploads/incidents folder
            const photoPath = req.file.path;
            const relativePath = path.relative(path.join(__dirname, '../'), photoPath);

            return res.status(200).json({
                success: true,
                message: 'Photo uploaded successfully',
                data: { photoUrl: relativePath }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error uploading photo'
            });
        }
    }
}

export { upload, PhotoController as default };

// Export the upload middleware for use in routes
export const photoUpload = upload.single('photo');

// Export the full middleware chain for use in routes
export const photoUploadRoute = [
    photoUpload,
    async (req, res) => {
        try {
            // The file will be uploaded to the uploads/incidents folder
            const photoPath = req.file.path;
            const relativePath = path.relative(path.join(__dirname, '../'), photoPath);

            return res.status(200).json({
                success: true,
                message: 'Photo uploaded successfully',
                data: { photoUrl: relativePath }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error uploading photo'
            });
        }
    }
];
