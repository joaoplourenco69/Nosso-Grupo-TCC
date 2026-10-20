
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(express.json());


// ==========================================
// CONEXÃO COM SUPABASE
// ==========================================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);


// ==========================================
// TESTE DO SERVIDOR
// ==========================================

app.get('/teste', (req, res) => {

    res.json({
        sucesso: true,
        mensagem: 'Servidor funcionando'
    });

});


// ==========================================
// TESTE DO SUPABASE
// ==========================================

app.get('/teste-supabase', async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('ocorrencia')
            .select('*');

        console.log('DATA:', data);
        console.log('ERROR:', error);

        res.json({
            data,
            error
        });

    } catch (err) {

        console.error('Erro:', err);

        res.status(500).json({
            sucesso: false,
            erro: err.message
        });

    }

});


// ==========================================
// BUSCAR OCORRÊNCIAS
// ==========================================

app.get('/ocorrencias', async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('ocorrencia')
            .select('*')
            .order('data_hora', { ascending: false });


        if (error) {

            console.error('Erro ao buscar ocorrências:', error);

            return res.status(400).json({
                sucesso: false,
                erro: error.message
            });

        }


        console.log('Ocorrências encontradas:', data);

        return res.json(data);

    } catch (err) {

        console.error('Erro no servidor:', err);

        return res.status(500).json({
            sucesso: false,
            erro: err.message
        });

    }

});


// ==========================================
// INSERIR OCORRÊNCIA DA IA
// ==========================================

app.post('/ia/ocorrencias', async (req, res) => {

    try {

        const {
            id_empresa,
            id_camera,
            nivel_risco,
            confianca_ia,
            imagem_url,
            observacao
        } = req.body;


        const { error } = await supabase
        .from('ocorrencia')
        .insert([
            {
                id_empresa: id_empresa,
                id_camera: id_camera,
                origem: 'IA',
                data_hora: new Date(),
                nivel_risco: nivel_risco || 'ALTO',
                status: 'DETECTADA',
                confianca_ia: confianca_ia,
                imagem_url: imagem_url,
                observacao: observacao
            }
        ]);


        if (error) {

            console.error('Erro ao inserir no Supabase:', error);

            return res.status(400).json({
                sucesso: false,
                erro: error.message
            });

        }


        console.log('🔥 Ocorrência da IA guardada no Supabase!');

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Ocorrência criada com sucesso'
        });


    } catch (err) {

        console.error('Erro no servidor:', err);

        return res.status(500).json({
            sucesso: false,
            erro: err.message
        });

    }

});

// ==========================================
// INSERIR DADOS DA ESTAÇÃO METEOROLÓGICA
// ==========================================

app.post('/estacao/leituras', async (req, res) => {
    try {
        const {
            id_area,
            temperatura,
            umidade_ar
        } = req.body;

        const { error } = await supabase
        .from('dados_sensor') // Nome exato da tabela no seu print do Supabase
        .insert([
            {
                data_hora: new Date(),
                temperatura: temperatura,
                umidade: umidade_ar // Coluna de umidade da sua tabela
            }
        ]);

        if (error) {
            console.error('Erro ao inserir leitura:', error);
            return res.status(400).json({
                success: false,
                erro: error.message
            });
        }

        console.log('🌦️ Dados da estação salvos com sucesso!');
        return res.status(201).json({
            success: true,
            mensagem: 'Leitura guardada com sucesso'
        });
    } catch (err) {
        console.error('Erro no servidor:', err);
        return res.status(500).json({
            success: false,
            erro: err.message
        });
    }
});


// ==========================================
// INICIAR SERVIDOR
// ==========================================

const servidor = app.listen(3000, () => {

    console.log('=================================');
    console.log('🔥 FIREGUARD BACKEND');
    console.log('🚀 Servidor rodando na porta 3000');
    console.log('=================================');

});


servidor.on('error', (erro) => {

    console.error('Erro no servidor:', erro);

});