 import express from 'express';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên Render.'
      });
    }

    const messages = Array.isArray(req.body.messages)
      ? req.body.messages
      : [];

    const safeMessages = messages
      .slice(-16)
      .filter(m =>
        ['user', 'assistant'].includes(m?.role) &&
        typeof m?.content === 'string'
      )
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content.slice(0, 5000) }]
      }));

    if (
      !safeMessages.length ||
      safeMessages.at(-1).role !== 'user'
    ) {
      return res.status(400).json({
        error: 'Hãy gửi tin nhắn trước nhé.'
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'Bạn là Team VNCS AI Chat, trợ lý AI thân thiện, hữu ích, nói tiếng Việt tự nhiên. Hỗ trợ học tập, sáng tạo, âm nhạc, Geometry Dash và các chủ đề phù hợp.'
            }]
          },
          contents: safeMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({
        error: 'Gemini API gặp lỗi. Kiểm tra API key hoặc cấu hình.'
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('') ||
      'Gemini chưa tạo được câu trả lời.';

    res.json({ reply });

  } catch (error) {
    console.error('Gemini server error:', error.message);

    res.status(500).json({
      error: 'AI gặp lỗi khi trả lời. Hãy thử lại.'
    });
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Team VNCS AI Chat listening on port ${port}`);
});
