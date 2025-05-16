# Måltidshanterare

Måltidshanterare är en enkel applikation för att hantera och planera måltider. Användare kan lägga till, ta bort och uppdatera måltider i en lista, samt markera dem som serverade. Applikationen använder ett backend-API för att lagra och hämta information om måltiderna.

## Funktioner
- Lägg till nya måltider med maträtt och datum.
- Markera måltider som serverade.
- Ta bort måltider från listan.
- Sortera måltider efter datum.

## Installation

För att installera nödvändiga beroenden, kör följande kommando:

```bash
npm install
```

Vi rekommenderar att använda `nodemon` för att automatiskt starta om servern vid ändringar:

```bash
npm install -g nodemon
```

Eller kör direkt från molnet:

```bash
npx nodemon
```

##  Starta Servern

För att starta servern, använd något av följande kommandon:

```bash
npx nodemon server.js
```

Eller om du installerat nodemon globalt:

```bash
nodemon server.js
```

Servern körs på `http://localhost:3000`.

## API Endpoints

- `POST /meal` - Skapa en ny måltid.
- `GET /meals` - Hämta alla måltider.
- `PUT /meal/served/:id` - Uppdatera status till serverad.
- `DELETE /meal/delete/:id` - Ta bort en måltid.
