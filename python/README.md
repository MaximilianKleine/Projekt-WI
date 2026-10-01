# Backend – Meeting Assistant
 
## Setup & Start
 
### 1. In den Ordner wechseln
```bash
cd python
```

### 2. Virtual Environment erstellen
```bash
python -m venv .venv
```
> Muss nur **einmal** gemacht werden.
 
### 3. Virtual Environment aktivieren
```bash
# macOS / Linux
source .venv/bin/activate
 
# Windows (Command Prompt)
.venv\Scripts\activate.bat
 
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```
> Erfolgreich aktiviert wenn **`(.venv)`** am Anfang der Konsole steht.

### 4. Abhängigkeiten installieren
```bash
pip install -r requirements.txt
```
> Muss nur **einmal** gemacht werden (oder wenn sich `requirements.txt` ändert).
 
### 5. `.env` anlegen
```bash
cp .env.example .env
```
> In der `.env` werden `OLLAMA_URL` und `WHISPER_URL` gesetzt. Die Datei wird nicht eingecheckt.

### 6. Server starten
```bash
uvicorn main:app --reload --port 8000
```
> Der Server läuft dann auf **http://localhost:8000**  
> API-Dokumentation: **http://localhost:8000/docs**

```bash
cd python
.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```
 
## Virtual Environment deaktivieren
```bash
deactivate
```