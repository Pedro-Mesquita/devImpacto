// Load env before anything else
try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch (_) {}
const express = require('express');
const precoDinamicoRoutes = require('./routes/precoDinamicoRoutes');
const jobRoutes = require('./routes/jobRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const predictRoutes = require('./routes/predictRoutes');

const app = express();
app.use(express.json());

app.use('/api', precoDinamicoRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/predict', predictRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;