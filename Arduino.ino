#include <DHT.h>

// -----------------------------
// CONFIGURAÇÃO DO SENSOR
// -----------------------------
#define DHTPIN 8       // Sensor no pino 8
#define DHTTYPE DHT22  // DHT22 (mede temperatura e umidade)

DHT dht(DHTPIN, DHTTYPE);

// -----------------------------
// RELÉ / MOTOR
// -----------------------------
#define RELE 5         // Relé no pino 5

// Temperatura para ligar o motor
const float TEMP_LIGAR = 26.0;

// Estado do motor
bool motorLigado = false;

// Variáveis para leitura
float temperatura = 0.0;
float umidade = 0.0;

// -----------------------------
// CONTROLE DE TEMPO (DELAY INTELIGENTE)
// -----------------------------
unsigned long ultimaLeitura = 0;
const unsigned long INTERVALO_ENVIO = 5000; // 30 segundos

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(RELE, OUTPUT);

  // Relé inicialmente desligado
  digitalWrite(RELE, HIGH);

  Serial.println("Sistema iniciado com DHT22 - Estacao Meteorologica");
}

void loop() {
  unsigned long tempoAtual = millis();

  // -----------------------------
  // LEITURA DOS SENSORES
  // -----------------------------
  float novaTemperatura = dht.readTemperature();
  float novaUmidade = dht.readHumidity();

  // Verifica se a leitura é válida
  if (!isnan(novaTemperatura) && !isnan(novaUmidade)) {
    temperatura = novaTemperatura;
    umidade = novaUmidade;

    // -----------------------------
    // CONTROLE DO MOTOR
    // -----------------------------
    if (temperatura >= TEMP_LIGAR) {
      motorLigado = true;
    } else {
      motorLigado = false;
    }

    // Acionamento do relé
    if (motorLigado) {
      digitalWrite(RELE, LOW);   // Liga o relé
    } else {
      digitalWrite(RELE, HIGH);  // Desliga o relé
    }
  }

  // -----------------------------
  // ENVIO / LOG DOS DADOS (A cada 30 segundos)
  // -----------------------------
  if (tempoAtual - ultimaLeitura >= INTERVALO_ENVIO) {
    ultimaLeitura = tempoAtual;

    // Formato limpo que o Python vai ler perfeitamente
    Serial.print("TEMP:");
    Serial.print(temperatura, 1);
    Serial.print(",UMID:");
    Serial.print(umidade, 1);
    Serial.print(",MOTOR:");
    Serial.println(motorLigado ? "LIGADO" : "DESLIGADO");
  }

  // Pequena pausa para estabilizar o loop do microcontrolador
  delay(2000);
}