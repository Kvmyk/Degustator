# 🚀 Uruchamianie Degustator Backend API

## Wymagania wstępne

- **Node.js** v16 lub wyżej
- **npm** v8 lub wyżej
- **Neo4j Database** (lokalnie lub w chmurze)

## 1️⃣ Instalacja zależności

```bash
npm install
```

## 2️⃣ Konfiguracja .env

Edytuj plik `.env` w katalogu głównym:

```env
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NODE_ENV=development
PORT=3001
```

### Ustawienia Neo4j:
- **URI**: Adres bazy Neo4j (domyślnie localhost)
- **USERNAME**: Nazwa użytkownika (domyślnie: neo4j)
- **PASSWORD**: Hasło (zmień na swoje!)
- **PORT**: Port aplikacji (domyślnie: 3001)

## 3️⃣ Uruchomienie

### Tryb deweloperski (z hot-reload):
```bash
npm run start:dev
```

### Tryb produkcyjny:
```bash
npm run build
npm run start:prod
```

### Debug mode:
```bash
npm run start:debug
```

## ✅ Weryfikacja

Aplikacja powinna być dostępna na:
```
http://localhost:3001/api
```

### Test endpointu:
```bash
curl http://localhost:3001/api/users
```

## 📁 Struktura projektu

```
src/backend/
├── API/                    # Kontrolery, serwisy, DTOs
│   ├── users/
│   ├── posts/
│   ├── reviews/
│   ├── tags/
│   └── ingredients/
├── db/                     # Konfiguracja Neo4j
│   ├── neo4j.service.ts
│   └── neo4j.module.ts
├── config/                 # Konfiguracja aplikacji
│   └── config.module.ts
├── app.module.ts           # Główny moduł
└── main.ts                 # Punkt wejścia
```

## 🔧 Skonfigurowanie Neo4j

### Lokalnie (Docker):
```bash
docker run --name neo4j -p 7687:7687 -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:latest
```

### Web UI:
```
http://localhost:7474
```

## 📚 API Endpoints

### Users
- `POST /api/users` - Tworzenie użytkownika
- `GET /api/users` - Lista użytkowników
- `GET /api/users/:id` - Szczegóły użytkownika
- `PUT /api/users/:id` - Aktualizacja użytkownika
- `DELETE /api/users/:id` - Usunięcie użytkownika

### Posts
- `POST /api/posts` - Tworzenie posta
- `GET /api/posts` - Lista postów
- `GET /api/posts/:id` - Szczegóły posta
- `PUT /api/posts/:id` - Aktualizacja posta
- `DELETE /api/posts/:id` - Usunięcie posta

### Reviews
- `POST /api/reviews` - Tworzenie recenzji
- `GET /api/reviews/post/:postId` - Recenzje dla posta
- `GET /api/reviews/:id` - Szczegóły recenzji
- `PUT /api/reviews/:id` - Aktualizacja recenzji
- `DELETE /api/reviews/:id` - Usunięcie recenzji

### Tags & Ingredients
- `POST /api/tags` - Tworzenie tagu
- `GET /api/tags` - Lista tagów
- `POST /api/ingredients` - Tworzenie składnika
- `GET /api/ingredients` - Lista składników

## 🐛 Troubleshooting

### Błąd: "Cannot find module '@nestjs/common'"
```bash
npm install
```

### Błąd: "Failed to connect to Neo4j"
- Sprawdź czy Neo4j jest uruchomiony
- Sprawdź URI, username i password w `.env`
- Sprawdź porty: 7687 (bolt) i 7474 (HTTP)

### Błąd: "Port 3001 is already in use"
Zmień port w `.env`:
```env
PORT=3002
```

## 📝 Notatki

- Wszystkie hasła użytkowników są haszowane przy użyciu bcrypt
- Neo4j zapytania są optymalizowane dla tego schematu
- API zwraca JSON z proper error messages
- Walidacja DTOs jest automatyczna

## 🚀 Następne kroki

1. Dodaj autentykację (JWT)
2. Dodaj autoryzację (Role-based access)
3. Dodaj paginację zaawansowaną
4. Dodaj cache (Redis)
5. Dodaj logging
6. Dodaj testy (Jest)
7. Dodaj dokumentację Swagger
