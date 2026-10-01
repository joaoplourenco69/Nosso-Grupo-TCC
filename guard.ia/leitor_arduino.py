import serial
import requests
import time

PORTA_SERIAL = 'COM5'
BAUD_RATE = 9600

print(f"Conectando ao Arduino na porta {PORTA_SERIAL}...")

try:
    conexao = serial.Serial(PORTA_SERIAL, BAUD_RATE, timeout=1)
    time.sleep(2)  # Aguarda a placa estabilizar
    print("Conexão estabelecida com sucesso! Ouvindo os dados...")
except Exception as e:
    print(f"Erro ao abrir a porta serial: {e}")
    exit()

while True:
    try:
        if conexao.in_waiting > 0:
            linha = conexao.readline().decode('utf-8').strip()
            
            # Se a linha contiver os dados do sensor
            if "TEMP:" in linha and "UMID:" in linha:
                partes = linha.split(',')
                temp = float(partes[0].split(':')[1])
                umid = float(partes[1].split(':')[1])
                
                dados = {
                    "temperatura": temp,
                    "umidade_ar": umid
                }
                
                # Manda para a API Node.js rodando na porta 3000
                resposta = requests.post("http://localhost:3000/estacao/leituras", json=dados)
                print(f"Enviado ao Supabase -> Temp: {temp}°C | Umid: {umid}% (Status: {resposta.status_code})")
                
    except Exception as err:
        print("Erro na leitura da porta:", err)
        time.sleep(2)