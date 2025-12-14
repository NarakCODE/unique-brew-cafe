import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';

const configureCloudinary = () => {
  // Check if user accidentally pasted the full Cloudinary URL into one of the fields
  const credentials = [
    config.cloudinaryApiKey,
    config.cloudinaryCloudName,
    config.cloudinaryApiSecret,
    process.env.CLOUDINARY_URL,
  ].find((val) => val && val.startsWith('cloudinary://'));

  if (credentials) {
    // Parse: cloudinary://<api_key>:<api_secret>@<cloud_name>
    const matches = credentials.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (matches) {
      cloudinary.config({
        cloud_name: matches[3] || '',
        api_key: matches[1] || '',
        api_secret: matches[2] || '',
      });
      return;
    }
  }

  // Standard configuration
  if (
    config.cloudinaryCloudName &&
    config.cloudinaryApiKey &&
    config.cloudinaryApiSecret
  ) {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
  }
};

configureCloudinary();

export default cloudinary;
