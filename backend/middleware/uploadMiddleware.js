const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Allowed MIME types whitelist
const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',                                                            // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',      // .docx
    'application/vnd.ms-excel',                                                      // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',            // .xlsx
    'text/plain',                                                                    // .txt
];

// File filter
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt)$/i;
    const extValid = allowedExtensions.test(path.extname(file.originalname));
    const mimeValid = allowedMimeTypes.includes(file.mimetype);

    if (extValid && mimeValid) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: images, PDF, Word documents, Excel spreadsheets, and text files.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;