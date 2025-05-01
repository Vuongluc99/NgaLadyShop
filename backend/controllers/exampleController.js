const getExample = (req, res) => {
  res.json({ message: 'Example route working!' });
};

module.exports = { getExample };
