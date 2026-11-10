
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(express.json());


// ==========================================
// CONEXÃO COM SUPABASE
// ==========================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Faltando SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY no .env');
}

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
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
            observacao,
            tipo_alerta,
            mensagem,
            id_destinatario
        } = req.body;

        const ocorrenciaPayload = {
            id_empresa: id_empresa,
            id_camera: id_camera,
            origem: 'IA',
            data_hora: new Date(),
            nivel_risco: nivel_risco || 'ALTO',
            status: 'DETECTADA',
            confianca_ia: confianca_ia,
            imagem_url: imagem_url,
            observacao: observacao
        };

        const { data: ocorrenciaData, error: ocorrenciaError } = await supabase
            .from('ocorrencia')
            .insert([ocorrenciaPayload])
            .select();

        if (ocorrenciaError) {
            console.error('Erro ao inserir ocorrência no Supabase:', ocorrenciaError);
            return res.status(400).json({
                sucesso: false,
                erro: ocorrenciaError.message
            });
        }

        const ocorrenciaId = ocorrenciaData?.[0]?.id_ocorrencia || ocorrenciaData?.[0]?.id;

        const alertaPayload = {
            id_ocorrencia: ocorrenciaId,
            id_destinatario: id_destinatario || null,
            tipo_alerta: tipo_alerta || 'FIRE_DETECTED',
            mensagem: mensagem || 'Fogo detectado automaticamente pela IA YOLO',
            data_hora: new Date(),
            visualizado: false
        };

        const { error: alertaError } = await supabase
            .from('alerta')
            .insert([alertaPayload]);

        if (alertaError) {
            console.error('Erro ao inserir alerta no Supabase:', alertaError);
            return res.status(400).json({
                sucesso: false,
                erro: alertaError.message,
                ocorrencia: ocorrenciaData
            });
        }

        console.log('🔥 Ocorrência da IA e alerta registrados no Supabase!');

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Ocorrência e alerta criados com sucesso',
            ocorrencia: ocorrenciaData?.[0] || null
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
            umidade_ar,
            motor_ligado
        } = req.body;

        const temperaturaNumero = Number(temperatura);
        const umidadeNumero = Number(umidade_ar);
        if (!Number.isFinite(temperaturaNumero) || !Number.isFinite(umidadeNumero)) {
            return res.status(400).json({
                success: false,
                erro: 'temperatura e umidade_ar devem ser valores numéricos'
            });
        }
        if (motor_ligado !== undefined && typeof motor_ligado !== 'boolean') {
            return res.status(400).json({
                success: false,
                erro: 'motor_ligado deve ser boolean (true/false)'
            });
        }

        const leitura = {
            temperatura: temperaturaNumero,
            umidade: umidadeNumero,
            fumaca: null
        };

        // Se a tabela tiver essas colunas no seu Supabase, descomente e ajuste os valores:
        // leitura.id_area = null;
        // leitura.id_camera = null;
        // leitura.data_hora = new Date().toISOString();

        const { error } = await supabase
        .from('dados_sensor')
        .insert([leitura]);

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
