import time
import cv2
from ultralytics import YOLO

model = YOLO('runs/detect/train-4/weights/best.pt')
cap = cv2.VideoCapture(0)

# Variável para controlar o tempo entre um salvamento e outro (evita flood de fotos)
ultimo_salvamento = 0
intervalo_segundos = 10  # Só salva uma nova foto a cada 10 segundos

while cap.isOpened():
  ret, frame = cap.read()
  if not ret:
    break

  results = model(frame, conf=0.5, verbose=False)
  boxes = results[0].boxes

  # Verifica se encontrou algum objeto (fogo ou fumaça)
  if len(boxes) > 0:
    tempo_atual = time.time()

    # Se já passou o tempo do intervalo, salva a imagem
    if tempo_atual - ultimo_salvamento > intervalo_segundos:
      # Nome único baseado no horário atual
      nome_arquivo = f"ocorrencia_{int(tempo_atual)}.jpg"

      # Salva a imagem na pasta local (você pode ajustar o caminho se preferir)
      cv2.imwrite(nome_arquivo, frame)
      print(f"[ALERTA] Fogo/Fumaça detetado! Imagem salva como: {nome_arquivo}")

      # Aqui é onde futuramente você colocará o requests.post para enviar
      # a imagem para a API da sua colega guardar no Supabase!

      ultimo_salvamento = tempo_atual

  cv2.imshow("Guard.ia TCC", results[0].plot())

  if cv2.waitKey(1) & 0xFF == ord('q'):
    break

cap.release()
cv2.destroyAllWindows()