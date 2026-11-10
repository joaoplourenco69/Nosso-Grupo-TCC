cd C:\Users\Felipe\Desktop\TCC\Nosso-Grupo-TCC-main
.venv\Scripts\Activate.ps1

# terminal 1
node server.js

# terminal 2
cd C:\Users\Felipe\Desktop\TCC\Nosso-Grupo-TCC-main\guard.ia
python .\leitor_arduino.py

# terminal 3
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/estacao/leituras" -ContentType "application/json" -Body '{"temperatura":25.4,"umidade_ar":60,"motor_ligado":true}'

# terminal 4
cd C:\Users\Felipe\Desktop\TCC\Nosso-Grupo-TCC-main\guard.ia
$env:CAMERA_INDEX = "0"
python detector.py