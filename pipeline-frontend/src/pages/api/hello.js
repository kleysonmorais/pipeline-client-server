// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  res.statusCode = 200;
  res.json({ name: 'John Doe' });
};
