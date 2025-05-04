const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'assets',
            public_id: `${Date.now()}-${file.originalname}`,
            resource_type: isPdf ? 'raw' : 'image',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
            access_mode: 'public',
        };
    }
});


const upload = multer({ storage });

module.exports = upload;
