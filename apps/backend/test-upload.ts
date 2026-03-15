import axios from 'axios';
import FormData from 'form-data';

// Valid 1x1 PNG Buffer
const PNG_BUFFER = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2D340000000049454E44AE426082',
  'hex'
);

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'channarakluy@gmail.com';
const ADMIN_PASSWORD = 'password123';

async function testUpload() {
  try {
    console.log('🚀 Starting Store Upload Test...');

    // 1. Login to get Access Token
    console.log('\n🔑 Logging in as Admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login successful!');

    // 2. Prepare Form Data
    console.log('\n📦 Preparing Multipart Form Data...');
    const form = new FormData();

    // Append fields
    form.append('name', 'Test Store with Image');
    form.append('slug', `test-store-img-${Date.now()}`);
    form.append('description', 'A test store with an uploaded image');
    form.append('address', '123 Test St');
    form.append('city', 'Phnom Penh');
    form.append('state', 'Phnom Penh');
    form.append('phone', '012345678');
    form.append('latitude', '11.5564');
    form.append('longitude', '104.9282');
    form.append('isActive', 'true');

    // Append JSON fields (as strings, handled by our middleware)
    const openingHours = {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '09:00', close: '21:00' },
    };
    form.append('openingHours', JSON.stringify(openingHours));

    const features = {
      parking: true,
      wifi: true,
      outdoorSeating: false,
      driveThrough: false,
    };
    form.append('features', JSON.stringify(features));

    // Append Image
    // We create a temporary file to stream properly if using fs, or use buffer directly with known length
    form.append('image', PNG_BUFFER, {
      filename: 'test-image.png',
      contentType: 'image/png',
    });

    // 3. Send Request
    console.log('\n📤 Sending POST /api/stores request...');
    const uploadRes = await axios.post(`${API_URL}/stores`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    // 4. Verify Result
    console.log('\n✅ Store Created Successfully!');
    console.log('🆔 Store ID:', uploadRes.data.data.id);
    console.log('🖼️ Image URL:', uploadRes.data.data.imageUrl);

    if (
      uploadRes.data.data.imageUrl &&
      uploadRes.data.data.imageUrl.includes('res.cloudinary.com')
    ) {
      console.log('🎉 Verification Passed: Image URL is from Cloudinary!');
    } else {
      console.warn(
        '⚠️ Verification Warning: Image URL might not be from Cloudinary or is missing.'
      );
    }
  } catch (error) {
    console.error('\n❌ Test Failed!');

    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

testUpload();
