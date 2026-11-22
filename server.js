import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'Chưa cấu hình API key. Người quản lý website cần thêm OPENAI_API_KEY vào môi trường máy chủ.' });
    }
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const safeMessages = messages.slice(-16).filter(m => ['user', 'assistant'].includes(m?.role) && typeof m?.content === 'string').map(m => ({ role: m.role, content: m.content.slice(0, 5000) }));
    if (!safeMessages.length || safeMessages.at(-1).role !== 'user') return res.status(400).json({ error: 'Hãy gửi tin nhắn trước nhé.' });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: 'gpt-5.5',
      instructions: 'Bạn là Team VNCS AI Chat, trợ lý AI thân thiện, hữu ích, nói tiếng Việt tự nhiên. Hỗ trợ học tập, sáng tạo, âm nhạc, Geometry Dash và các chủ đề thông thường. Trả lời rõ ràng, trung thực; nếu không biết thì nói không chắc. Không tự nhận là người thật hay thành viên Team VNCS.',
      input: safeMessages
    });
    res.json({ reply: response.output_text || 'Mình chưa tạo được câu trả lời, thử lại nhé.' });
  } catch (err) {
    console.error('Chat API error:', err?.message || err);
    res.status(500).json({ error: 'AI gặp lỗi khi trả lời. Kiểm tra cấu hình API hoặc thử lại sau.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Team VNCS AI Chat listening on http://localhost:${port}`));
