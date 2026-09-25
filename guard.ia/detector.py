import cv2
import requests
import time
from ultralytics import YOLO

# 1. Carrega o modelo YOLOv8 (faz o download automático na primeira vez)
model = YOLO('fire.pt')
print(model.names)

# Configurações do servidor e da câmara
API_BACKEND_URL = "http://localhost:3000/ia/ocorrencias"
CAMERA_ID = "uuid-da-sua-camera-aqui"

# Abre a webcam integrada (0)
cap = cv2.VideoCapture(0)

ULTIMO_ALERTA = 0
INTERVALO_ENTRE_ALERTAS = 10 # Tempo em segundos para não entupir o servidor de requisições

print("🔥 Detector IA Iniciado! Pressione 'q' para fechar.")

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("Erro ao aceder à câmara.")
        break

    # 2. Executa a deteção no frame
    results = model(frame, stream=True, verbose = False)

    detectado = False
    maior_confianca = 0.0

    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            nome_classe = model.names[cls_id]

            # DICA: Podes trocar 'cell phone' por 'fire' se usares um modelo treinado para fogo.
            # Usar 'cell phone' permite testar a IA mostrando o telemóvel à câmara.


            if nome_classe in ['fire'] and conf > 0.50:
                detectado = True
                if conf > maior_confianca:
                    maior_confianca = conf

                # Desenha o retângulo vermelho à volta do objeto detetado
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"{nome_classe.upper()} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # 3. Salva a foto localmente e envia o alerta se detetou algo
    tempo_atual = time.time()
    if detectado and (tempo_atual - ULTIMO_ALERTA > INTERVALO_ENTRE_ALERTAS):
        # Nome da imagem salva no computador local
        caminho_foto = f"alerta_{int(tempo_atual)}.jpg"
        cv2.imwrite(caminho_foto, frame)
        print(f"⚠️ DETEÇÃO REALIZADA! Foto salva em: {caminho_foto}")

        payload = {
            "camera_id": CAMERA_ID,
            "nivel_risco": "ALTO",
            "confianca": round(maior_confianca, 2),
            "imagem_path": caminho_foto,
            "detectado_em": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }

        try:
            res = requests.post(API_BACKEND_URL, json=payload, timeout=3)
            print("Status do alerta enviado para o backend:", res.status_code)
            ULTIMO_ALERTA = tempo_atual
        except Exception as e:
            print("Backend não encontrado. Apenas salvando localmente.")
            ULTIMO_ALERTA = tempo_atual

    # Mostra a câmara a funcionar em tempo real
    cv2.imshow("FireGuard - Monitoramento IA", frame)

    tecla = cv2.waitKey(1)

    if tecla == ord('q'):
        print("Encerrando...")
        break

cap.release()
cv2.destroyAllWindows()