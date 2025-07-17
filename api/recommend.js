export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { emotions, goal, quantity } = req.body;

  const picks = [
    { title: "The Secret Life of Walter Mitty", type: "movie" },
    { title: "The Midnight Library", type: "book" },
    { title: "Fleabag", type: "show" },
    { title: "Everything Everywhere All At Once", type: "movie" },
    { title: "The Alchemist", type: "book" },
    { title: "BoJack Horseman", type: "show" }
  ];

  const shuffled = picks.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Number(quantity));

  res.status(200).json({ picks: selected });
}
