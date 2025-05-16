import express from "express";
import path from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";
const __dirname = path.resolve();

const app = express();

const fileName = path.join(__dirname, "data", "name.json");

/**
 * Läser in JSON-filen till minnet
 */
function readJsonFile() {
	const file = fs.readFileSync(fileName, {
		encoding: "utf-8", // Teckenkodning gör att datorn kan förstå innehållet
		flag: "r+", // Läs- och skrivrättigheter
	});
	return JSON.parse(file);
}

/**
 * Skriver data till JSON-filen
 */
function writeToJsonFile(data) {
	fs.writeFileSync(fileName, JSON.stringify(data));
}

// Gör så att statiska filer (HTML, CSS, JS) kan användas
app.use(express.static(path.join(__dirname, "dist")));
// Gör så att vi kan hantera JSON i förfrågningar
app.use(bodyParser.json());

/**
 * Felhanteringsklass
 */
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}

/**
 * Endpoint för att lägga till en ny måltid
 */
app.post("/meal", (req, res) => {
	try {
		// Kontrollera att vi har all nödvändig data
		if (!req.body.dish) {
			throw new ValidationError("Maträtt saknas");
		}
		if (!req.body.date) {
			throw new ValidationError("Datum saknas");
		}
		
		// Läs in befintliga måltider
		const data = readJsonFile();

		// Lägg till den nya måltiden
		data.push({
			id: uuidv4(), // Skapa ett unikt ID
			dish: req.body.dish,
			date: req.body.date,
			served: false
		});

		// Spara till fil
		writeToJsonFile(data);

		// Skicka svar till klienten
		res.send({ message: "Vi la till en måltid till lista :) " + req.body.dish });
	} catch (error) {
		console.error(JSON.stringify({ error: error.message, fn: "/meal" }));
		if (error instanceof ValidationError) {
			res.status(400).send({ error: error.message });
		} else {
			res.status(500).send({ error: "Kunde inte lägga till måltid" });
		}
	}
});

/**
 * Endpoint för att hämta alla måltider
 */
app.get("/meals", (req, res) => {
	try {
		const data = readJsonFile();
		res.send(data);
	} catch (error) {
		console.log(JSON.stringify({ error: error.message, fn: "/meals" }));
		res.status(500).send({ error: "Kunde inte ladda måltider" });
	}
});

/**
 * Endpoint för att uppdatera status (serverad/ej serverad) för en måltid
 */
app.put("/meal/served/:id", (req, res) => {
	try {
		// Hitta måltiden och ändra dess status
		const data = readJsonFile().map((data) => {
			if (data.id === req.params.id) {
				data.served = !data.served;
			}
			return data;
		});
		
		// Spara till fil
		writeToJsonFile(data);
		
		// Skicka tillbaka den uppdaterade måltiden
		res.json(data.filter((d) => d.id === req.params.id));
	} catch (error) {
		console.log(error);
		res.status(500).send({ error: "Kunde inte uppdatera måltidsstatus" });
	}
});

/**
 * Endpoint för att ta bort en måltid
 */
app.delete("/meal/delete/:id", (req, res) => {
	try {
		// Filtrera bort måltiden med det angivna ID:t
		const data = readJsonFile().filter((d) => d.id !== req.params.id);

		// Spara till fil
		writeToJsonFile(data);
		
		// Skicka tillbaka alla återstående måltider
		res.send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ error: "Kunde inte ta bort måltid" });
	}
});

// Starta servern på port 3000
app.listen(3000, () => {
	console.log("Servern startad på http://localhost:3000");
});
