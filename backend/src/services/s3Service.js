const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Upload file to S3
 */
const uploadToS3 = async (file, folder = 'profile-pictures') => {
  try {
    const fileContent = fs.readFileSync(file.path);
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    
    // Delete local file after upload
    fs.unlinkSync(file.path);
    
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const key = fileUrl.split('.com/')[1];
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3
};
