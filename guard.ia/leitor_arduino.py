import time

import requests
import serial


PORTA_SERIAL = 'COM5'
BAUD_RATE = 9600
URL_API = 'http://localhost:3000/estacao/leituras'

print(f"Conectando ao Arduino na porta {PORTA_SERIAL}...")

try:
    conexao = serial.Serial(PORTA_SERIAL, BAUD_RATE, timeout=1)
    time.sleep(2)  # Aguarda a placa estabilizar
    print("Conexão estabelecida com sucesso! Ouvindo os dados...")
except serial.SerialException as erro:
    print(f"Erro ao abrir a porta serial: {erro}")
    raise SystemExit(1)

while True:
    try:
        linha = conexao.readline().decode('utf-8', errors='ignore').strip()
        if not linha.startswith('TEMP:'):
            continue

        try:
            # Formato: TEMP:27.3,UMID:55.2,MOTOR:LIGADO
            partes = dict(item.split(':', 1) for item in linha.split(','))
            dados = {
                'temperatura': float(partes['TEMP']),
                'umidade_ar': float(partes['UMID']),
                'motor_ligado': partes['MOTOR'].strip().upper() == 'LIGADO',
            }

            resposta = requests.post(URL_API, json=dados, timeout=10)
            if resposta.ok:
                print(f"Leitura salva: {dados} (HTTP {resposta.status_code})")
            else:
                print(f"Falha ao salvar (HTTP {resposta.status_code}): {resposta.text}")
        except (KeyError, ValueError) as erro:
            print(f"Linha serial inválida: {linha} ({erro})")
        except requests.RequestException as erro:
            print(f"Erro ao enviar para a API: {erro}")
    except serial.SerialException as erro:
        print(f"Erro na leitura da porta serial: {erro}")
        time.sleep(2)
