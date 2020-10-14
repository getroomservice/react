// server.js

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors());

const API_KEY = 'XYEni4263vYFSPBMp345o';

app.post('/roomservice', async (req, res) => {
  // In practice, this should be whatever user id YOU use.
  const user = Math.random()
    .toString(36)
    .substr(2, 9);

  const body = req.body;

  const r = await fetch('https://super.roomservice.dev/provision', {
    method: 'post',

    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      user: user,
      resources: body.resources,
    }),
  });

  return res.json(await r.json());
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
