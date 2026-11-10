import cv2
import requests
import time
import os
import serial 

from dotenv import load_dotenv
from supabase import create_client
from ultralytics import YOLO


# ==========================================
# COMUNICAÇÃO COM ARDUINO
# ==========================================

PORTA_ARDUINO = "COM5"
BAUD_RATE = 9600

arduino = None

ultimo_comando_arduino = 0
INTERVALO_COMANDO_ARDUINO = 1

temperatura_atual = None
umidade_atual = None
estado_bomba = "DESLIGADO"

# ==========================================
# CONFIGURAÇÃO DO SUPABASE
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(BASE_DIR, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Faltando SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY no arquivo .env")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ==========================================
# ENVIA IMAGEM PARA O SUPABASE STORAGE
# ==========================================

def enviar_imagem_supabase(caminho_foto):

    try:

        nome_arquivo = os.path.basename(caminho_foto)

        with open(caminho_foto, "rb") as arquivo:
            arquivo_bytes = arquivo.read()

        supabase.storage \
            .from_("fire-images") \
            .upload(
                nome_arquivo,
                arquivo_bytes,
                {
                    "content-type": "image/jpeg",
                    "upsert": "true"
                }
            )

        # URL pública da imagem
        imagem_url = (
            f"{SUPABASE_URL}/storage/v1/object/public/"
            f"fire-images/{nome_arquivo}"
        )

        print("☁️ Imagem enviada para o Supabase!")
        print("🔗 URL:", imagem_url)

        return imagem_url

    except Exception as erro:

        print("❌ Erro ao enviar imagem para o Supabase:")
        print(erro)

        return None


# ==========================================
# MODELO DE IA
# ==========================================

model = YOLO("models/best.pt")

print("Classes do modelo:", model.names)


# ==========================================
# CONFIGURAÇÃO DO BACKEND
# ==========================================

API_BACKEND_URL = "http://localhost:3000/ia/ocorrencias"

ID_EMPRESA = "b972f383-eef4-47e5-9137-c645077bdcd8"

ID_CAMERA = "f1dea34f-7f99-49fd-8906-dc0217055e38"
ID_DESTINATARIO = os.getenv("ID_DESTINATARIO")

cap = None


# ==========================================
# CÂMERA (ÍNDICE 1 - USB COM RESOLUÇÃO HD)
# ==========================================

def inicializar_camera():
    global cap

    candidatos = []
    try:
        indice_env = int(os.getenv("CAMERA_INDEX", "0"))
    except ValueError:
        indice_env = 0

    indices = [indice_env, 0, 1, 2, 3]
    backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]

    for backend in backends:
        for idx in dict.fromkeys(indices):
            candidatos.append((backend, idx))

    ultimo_erro = None

    for backend, idx in candidatos:
        try:
            cap = cv2.VideoCapture(idx, backend)
            if not cap.isOpened():
                cap.release()
                continue

            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

            ok, _ = cap.read()
            if not ok:
                print(f"⚠️ Falha ao capturar frame no backend {backend} / índice {idx}. Tentando outra opção...")
                cap.release()
                continue

            largura_real = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            altura_real = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            print(f"📷 Câmera iniciada com backend {backend} e índice {idx}: {largura_real}x{altura_real}")
            return cap

        except Exception as erro:
            ultimo_erro = erro
            print(f"⚠️ Não foi possível abrir camera com backend {backend} e índice {idx}: {erro}")
            if cap is not None:
                cap.release()

    if ultimo_erro:
        raise RuntimeError(
            "Não foi possível abrir a câmera. Verifique se a webcam está conectada, "
            "se não está sendo usada por outro programa e teste índices 0, 1 ou 2. "
            f"Erro último: {ultimo_erro}"
        )

    raise RuntimeError(
        "Não foi possível abrir nenhuma câmera disponível no sistema. "
        "Feche o Zoom/Teams/OBS, confirme a webcam e teste os índices 0, 1 ou 2."
    )


# ==========================================
# COMUNICACAO COM ARDUINO
# ==========================================

def conectar_arduino():

    global arduino

    try:

        arduino = serial.Serial(
            PORTA_ARDUINO,
            BAUD_RATE,
            timeout=0.05
        )

        time.sleep(2)

        print("✅ Arduino conectado na", PORTA_ARDUINO)

    except serial.SerialException as erro:

        arduino = None

        raise RuntimeError(
            f"Erro ao conectar com Arduino: {erro}"
        )


# ==========================================
# ENVIA DETECCAO DA IA PARA O ARDUINO
# ==========================================

def enviar_estado_fogo(detectado):

    if arduino is None or not arduino.is_open:
        return

    try:

        if detectado:
            comando = "FOGO:1\n"
        else:
            comando = "FOGO:0\n"

        arduino.write(comando.encode("utf-8"))

    except serial.SerialException as erro:

        print("❌ Erro ao enviar comando para Arduino:", erro)


# ==========================================
# RECEBE DADOS DOS SENSORES
# ==========================================

def ler_dados_arduino():

    global temperatura_atual
    global umidade_atual
    global estado_bomba

    if arduino is None or not arduino.is_open:
        return

    try:

        while arduino.in_waiting:

            linha = arduino.readline().decode(
                "utf-8",
                errors="ignore"
            ).strip()

            if not linha.startswith("TEMP:"):
                continue

            partes = linha.split(",")

            dados = {}

            for parte in partes:

                if ":" in parte:

                    chave, valor = parte.split(":", 1)

                    dados[chave] = valor

            if "TEMP" in dados and "UMID" in dados and "MOTOR" in dados:

                temperatura_atual = float(dados["TEMP"])

                umidade_atual = float(dados["UMID"])

                estado_bomba = dados["MOTOR"]

                print(
                    f"🌡️ Temperatura: {temperatura_atual}°C | "
                    f"💧 Umidade: {umidade_atual}% | "
                    f"🚿 Bomba: {estado_bomba}"
                )

    except (ValueError, KeyError, serial.SerialException) as erro:

        print("❌ Erro ao receber dados do Arduino:", erro)

# ==========================================
# CONTROLE DOS ALERTAS
# ==========================================

ULTIMO_ALERTA = 0

INTERVALO_ENTRE_ALERTAS = 10


print("🔥 Detector IA Iniciado!")
print("Pressione 'q' para fechar.")


# ==========================================
# LOOP PRINCIPAL
# ==========================================


def main():
    global cap
    global ULTIMO_ALERTA
    global ultimo_comando_arduino

    # Conecta primeiro ao Arduino
    conectar_arduino()

    # Inicializa a câmera
    inicializar_camera()

    print("🔥 FIREGUARD iniciado!")
    print("📡 Comunicação com Arduino ativa.")
    print("Pressione 'q' para fechar.")

    while cap.isOpened():

        try:
            success, frame = cap.read()

        except KeyboardInterrupt:
            print("\nInterrompido pelo usuário.")
            break

        if not success:
            print("Erro ao acessar a câmera.")
            break

        # ======================================
        # DETECÇÃO YOLO
        # ======================================

        results = model(
            frame,
            stream=True,
            verbose=False
        )

        detectado = False
        maior_confianca = 0.0

        # ======================================
        # ANALISA AS DETECÇÕES
        # ======================================

        for r in results:

            boxes = r.boxes

            for box in boxes:

                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                nome_classe = model.names[cls_id]

                if nome_classe == "fire" and conf > 0.80:

                    detectado = True

                    if conf > maior_confianca:
                        maior_confianca = conf

                    x1, y1, x2, y2 = map(int, box.xyxy[0])

                    cv2.rectangle(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (0, 0, 255),
                        2
                    )

                    cv2.putText(
                        frame,
                        f"FIRE {conf:.2f}",
                        (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 0, 255),
                        2
                    )

        # ======================================
        # COMUNICACAO IA + ARDUINO
        # ======================================

        tempo_atual = time.time()

        # Envia o resultado da câmera a cada 1 segundo

        if tempo_atual - ultimo_comando_arduino >= INTERVALO_COMANDO_ARDUINO:

            ultimo_comando_arduino = tempo_atual

            enviar_estado_fogo(detectado)

        # Recebe temperatura, umidade e estado da bomba

        ler_dados_arduino()

        # ======================================
        # MOSTRA INFORMACOES NA CAMERA
        # ======================================

        if temperatura_atual is not None:

            cv2.putText(
                frame,
                f"Temperatura: {temperatura_atual:.1f} C",
                (20, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Umidade: {umidade_atual:.1f}%",
                (20, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 0),
                2
            )

        cv2.putText(
            frame,
            f"IA: {'FOGO DETECTADO' if detectado else 'SEM FOGO'}",
            (20, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255) if detectado else (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"BOMBA: {estado_bomba}",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255) if estado_bomba == "LIGADO" else (0, 255, 0),
            2
        )

        # ======================================
        # ENVIO DE OCORRENCIA AO BACKEND
        # ======================================

        if detectado and (
            tempo_atual - ULTIMO_ALERTA > INTERVALO_ENTRE_ALERTAS
        ):

            ULTIMO_ALERTA = tempo_atual

            caminho_foto = f"alerta_{int(tempo_atual)}.jpg"

            cv2.imwrite(caminho_foto, frame)

            print(f"FOGO DETECTADO! Foto salva: {caminho_foto}")

            imagem_url = enviar_imagem_supabase(caminho_foto)

            if imagem_url is None:

                print("Imagem não enviada. Ocorrência não criada.")

            else:

                payload = {
                    "id_empresa": ID_EMPRESA,
                    "id_camera": ID_CAMERA,
                    "nivel_risco": "ALTO",
                    "confianca_ia": round(maior_confianca, 2),
                    "imagem_url": imagem_url,
                    "observacao": "Fogo detectado automaticamente pela IA YOLO",
                    "tipo_alerta": "FIRE_DETECTED",
                    "mensagem": "Fogo detectado automaticamente pela IA YOLO"
                }

                if ID_DESTINATARIO:
                    payload["id_destinatario"] = ID_DESTINATARIO

                try:

                    res = requests.post(
                        API_BACKEND_URL,
                        json=payload,
                        timeout=3
                    )

                    print(
                        f"Status do alerta: {res.status_code}"
                    )

                    if res.status_code == 201:

                        print("Ocorrência criada com sucesso!")
                        print("Imagem:", imagem_url)

                    else:

                        print("Erro ao criar ocorrência:")
                        print(res.text)

                except requests.RequestException as erro:

                    print("Backend não encontrado:")
                    print(erro)

        # ======================================
        # EXIBE CAMERA
        # ======================================

        cv2.imshow(
            "FireGuard - Monitoramento IA",
            frame
        )

        tecla = cv2.waitKey(1)

        if tecla == ord("q"):

            print("Encerrando monitoramento...")
            break

if __name__ == "__main__":

    try:
        main()

    except KeyboardInterrupt:
        print("\nFIREGUARD interrompido.")

    except Exception as erro:
        print("Erro no FIREGUARD:", erro)

    finally:

        # Fecha comunicacao com Arduino

        if arduino is not None and arduino.is_open:
            arduino.close()
            print("Arduino desconectado.")

        # Fecha camera

        if cap is not None:
            cap.release()

        cv2.destroyAllWindows()

        print("FIREGUARD encerrado.")
