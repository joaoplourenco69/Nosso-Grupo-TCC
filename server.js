require('dotenv').config(); // Lê as chaves do teu .env automaticamente
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Conexão com o Supabase usando o .env da raiz
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rota que o teu Python (detector.py) vai chamar via POST
app.post('/ia/ocorrencias', async (req, res) => {
    try {
        const { id_empresa, id_camera, nivel_risco, confianca_ia, imagem_url, observacao } = req.body;

        const { data, error } = await supabase
            .from('ocorrencia')
            .insert([
                {
                    id_empresa: id_empresa,
                    id_camera: id_camera,
                    origem: 'IA_YOLO',
                    data_hora: new Date(),
                    nivel_risco: nivel_risco || 'ALTO',
                    status: 'Pendente',
                    confianca_ia: confianca_ia,
                    imagem_url: imagem_url,
                    observacao: observacao
                }
            ])
            .select();

        if (error) {
            console.error('Erro ao inserir no Supabase:', error);
            return res.status(400).json({ sucesso: false, erro: error.message });
        }

        console.log('Ocorrência guardada no Supabase com sucesso!');
        return res.status(201).json({ sucesso: true, ocorrencia: data[0] });

    } catch (err) {
        console.error('Erro no servidor:', err);
        return res.status(500).json({ sucesso: false, erro: err.message });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor Node.js a correr na porta 3000');
});