require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Need to match exactly what Next.js does
const UserSchema = new mongoose.Schema({
    // We only care if it can find it, but maybe _id type was altered in hybrid auth?
}, { strict: false });

// Let's see if User._id has been modified to a string type in User.ts!
