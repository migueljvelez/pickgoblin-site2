export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { emotions, goal, quantity } = req.body;

  const prompt = `Given the emotions: ${emotions}, the goal: ${goal}, and the number of suggestions requested: ${quantity}, recommend ${
    quantity == 1 ? 'one perfect' : `${quantity} powerful`
  } book, movie, or show, and include where to watch or read it.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Something went wrong.";

  res.status(200).json({ reply });
}
