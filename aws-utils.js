const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Lists all S3 buckets
 * @returns {Promise} Promise object representing the S3 buckets
 */
const listBuckets = async () => {
  try {
    const data = await s3.listBuckets().promise();
    console.log('Success: Buckets retrieved', data.Buckets);
    return data.Buckets;
  } catch (err) {
    console.log('Error', err);
    throw err;
  }
};

/**
 * Lists objects in an S3 bucket
 * @param {string} bucketName - The name of the S3 bucket
 * @returns {Promise} Promise object representing the objects in the bucket
 */
const listObjects = async (bucketName) => {
  try {
    const data = await s3.listObjects({ Bucket: bucketName }).promise();
    console.log('Success: Objects retrieved', data.Contents);
    return data.Contents;
  } catch (err) {
    console.log('Error', err);
    throw err;
  }
};

/**
 * Uploads an object to S3
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} key - The key under which to store the object
 * @param {Buffer|Typed Array|Blob|String|ReadableStream} body - The object data
 * @returns {Promise} Promise object representing the upload operation
 */
const uploadObject = async (bucketName, key, body) => {
  try {
    const data = await s3.upload({
      Bucket: bucketName,
      Key: key,
      Body: body
    }).promise();
    console.log('Success: Object uploaded', data);
    return data;
  } catch (err) {
    console.log('Error', err);
    throw err;
  }
};

module.exports = {
  listBuckets,
  listObjects,
  uploadObject
}; 