// Load env before anything else
try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch (_) {}
const express = require('express');
const precoDinamicoRoutes = require('./routes/precoDinamicoRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const jobRoutes = require('./routes/jobRoutes');
const alertaRoutes = require('./routes/alertaRoutes');

const app = express();
app.use(express.json());

app.use('/api', precoDinamicoRoutes);
app.use('/api', produtoRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/alertas', alertaRoutes);

// Use 4000 by default to avoid conflict with frontend dev server on 3000
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;