const express = require('express');
const precoDinamicoRoutes = require('./routes/precoDinamicoRoutes');

const app = express();
app.use(express.json());

app.use('/preco-dinamico', precoDinamicoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;