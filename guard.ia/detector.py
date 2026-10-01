import cv2
import requests
import time
import os

from dotenv import load_dotenv
from supabase import create_client
from ultralytics import YOLO


# ==========================================
# CONFIGURAÇÃO DO SUPABASE
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(BASE_DIR, ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

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

ID_EMPRESA = "80fb02b1-4048-462d-8237-b94a34839ea3"

ID_CAMERA = "74194886-c090-4bab-ae4d-cfc84bc42834"


# ==========================================
# CÂMERA
# ==========================================

cap = cv2.VideoCapture(0)


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

while cap.isOpened():

    success, frame = cap.read()

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


            # Detecta somente FIRE
            if nome_classe == "fire" and conf > 0.50:

                detectado = True


                if conf > maior_confianca:

                    maior_confianca = conf


                # Coordenadas do objeto
                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )


                # Retângulo vermelho
                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 0, 255),
                    2
                )


                # Texto da detecção
                cv2.putText(
                    frame,
                    f"{nome_classe.upper()} {conf:.2f}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 0, 255),
                    2
                )


    # ======================================
    # VERIFICA SE DEVE CRIAR ALERTA
    # ======================================

    tempo_atual = time.time()


    if detectado and (
        tempo_atual - ULTIMO_ALERTA
        > INTERVALO_ENTRE_ALERTAS
    ):

        # ==================================
        # SALVA FOTO LOCAL
        # ==================================

        caminho_foto = (
            f"alerta_{int(tempo_atual)}.jpg"
        )


        cv2.imwrite(
            caminho_foto,
            frame
        )


        print(
            f"⚠️ DETECÇÃO REALIZADA! "
            f"Foto salva em: {caminho_foto}"
        )


        # ==================================
        # ENVIA FOTO PARA O SUPABASE
        # ==================================

        imagem_url = enviar_imagem_supabase(
            caminho_foto
        )


        # ==================================
        # SE NÃO ENVIOU A IMAGEM
        # NÃO CRIA A OCORRÊNCIA
        # ==================================

        if imagem_url is None:

            print(
                "❌ Ocorrência NÃO enviada."
            )

            print(
                "❌ A imagem não foi enviada "
                "para o Supabase."
            )


        # ==================================
        # SE A IMAGEM FOI ENVIADA
        # CRIA A OCORRÊNCIA
        # ==================================

        else:

            payload = {

                "id_empresa": ID_EMPRESA,

                "id_camera": ID_CAMERA,

                "nivel_risco": "ALTO",

                "confianca_ia": round(
                    maior_confianca,
                    2
                ),

                "imagem_url": imagem_url,

                "observacao":
                    "Fogo detectado automaticamente "
                    "pela IA YOLO"
            }


            try:

                res = requests.post(

                    API_BACKEND_URL,

                    json=payload,

                    timeout=3
                )


                print(
                    "Status do alerta enviado "
                    f"para o backend: {res.status_code}"
                )


                # ==================================
                # SUCESSO
                # ==================================

                if res.status_code == 201:

                    print(
                        "✅ Ocorrência criada "
                        "com imagem vinculada!"
                    )

                    print(
                        "🔗 URL salva:",
                        imagem_url
                    )


                # ==================================
                # ERRO NO BACKEND
                # ==================================

                else:

                    print(
                        "❌ Erro ao criar ocorrência:"
                    )

                    print(
                        res.text
                    )


                ULTIMO_ALERTA = tempo_atual


            except Exception as erro:

                print(
                    "❌ Backend não encontrado."
                )

                print(
                    erro
                )


    # ======================================
    # MOSTRA A CÂMERA
    # ======================================

    cv2.imshow(
        "FireGuard - Monitoramento IA",
        frame
    )


    # ======================================
    # TECLA Q PARA SAIR
    # ======================================

    tecla = cv2.waitKey(1)


    if tecla == ord("q"):

        print("Encerrando...")

        break


# ==========================================
# ENCERRAMENTO
# ==========================================

cap.release()

cv2.destroyAllWindows()

print("🛑 Detector encerrado.")