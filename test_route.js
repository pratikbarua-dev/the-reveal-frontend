import { GET } from './src/app/api/admin/users/[id]/route.js';

async function test() {
  try {
    const req = new Request('http://localhost:3000/api/admin/users/6a4a61719d088d586873e8e2');
    const params = Promise.resolve({ id: '6a4a61719d088d586873e8e2' });
    const res = await GET(req, { params });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
