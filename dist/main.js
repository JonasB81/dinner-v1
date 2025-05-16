console.log("Måltidshanterare startad");

// Globala variabler för att hålla koll på data
let meals = [];         // Lista med alla måltider
let dish = "";          // Nuvarande maträttnamn i inputfältet
let date = "";          // Nuvarande datum i datumfältet

// Hämta referenser till alla HTML-element vi behöver använda
const dishInput = document.getElementById("dish");         // Inmatningsfält för maträtt
const dateInput = document.getElementById("date");         // Inmatningsfält för datum
const button = document.getElementById("submit");          // Knapp för att lägga till måltid
const list = document.getElementById("meals");             // Listan där måltider visas
const loadingMessage = document.getElementById("loading"); // Laddningsmeddelande
const errorMessage = document.getElementById("error");     // Felmeddelandevisning
const mealPlanTitle = document.getElementById("mealPlanTitle"); // Rubriken för måltidslistan

/**
 * Skickar en ny måltid till servern
 */
const createMeal = async () => {
	try {
		// Kontrollera att vi har all nödvändig data
		if (!dish) {
			errorMessage.textContent = "Maträtt saknas";
			return;
		}
		if (!date) {
			errorMessage.textContent = "Datum saknas";
			return;
		}

		// Skicka data till servern med POST-metoden
		const res = await fetch("/meal", {
			method: "POST",
			body: JSON.stringify({
				dish,
				date,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});
		
		// Hämta svaret från servern
		const body = await res.json();
		
		// Kontrollera om något gick fel
		if (!res.ok) {
			throw new Error(body.error);
		}
		
		// Uppdatera rubriken med bekräftelse
		document.getElementById("heading").innerHTML = "Måltidsplanerare - " + body.message;

		// Töm inmatningsfälten
		dishInput.value = "";
		dateInput.value = "";
		// Töm variablerna
		dish = "";
		date = "";
		// Rensa eventuella felmeddelanden
		errorMessage.textContent = "";
		// Uppdatera måltidslistan
		renderMeals();
	} catch (error) {
		// Visa eventuella fel
		errorMessage.textContent = error.message;
	}
};

/**
 * Hämtar alla måltider från servern
 */
const getMeals = async () => {
	try {
		// Skicka GET-förfrågan till servern
		const res = await fetch("/meals");
		const body = await res.json();

		// Kontrollera om något gick fel
		if (!res.ok) {
			throw new Error(body.error);
		}
		
		// Spara måltiderna i vår lokala variabel
		meals = body;
	} catch (error) {
		// Visa eventuella fel
		errorMessage.textContent = error.message;
	}
};

/**
 * Uppdaterar serverad-status för en måltid
 */
const updateServed = async (event) => {
	try {
		// Skicka PUT-förfrågan för att uppdatera status
		const res = await fetch("/meal/served/" + event.target.id, {
			method: "PUT",
		});
		const body = await res.json();
		
		// Kontrollera om något gick fel
		if (!res.ok) {
			throw new Error(body.error);
		}
		
		// Uppdatera listan med måltider
		renderMeals();
	} catch (error) {
		// Visa eventuella fel
		errorMessage.textContent = error.message;
	}
};

/**
 * Tar bort en måltid
 */
const deleteMeal = async (event) => {
	try {
		// Skicka DELETE-förfrågan för att ta bort måltiden
		await fetch("/meal/delete/" + event.target.id, {
			method: "DELETE",
		});
		// Uppdatera listan med måltider
		renderMeals();
	} catch (error) {
		// Visa eventuella fel
		errorMessage.textContent = error.message;
	}
};

/**
 * Skapar ett "inga måltider" meddelande
 */
const createNoMealsMessage = () => {
	const container = document.createElement("li");
	container.textContent = "Inga måltider är planerade. Lägg till en ny!";
	return container;
};
const createNoMealsMessageh2 = () => {
	const container = document.createElement("h2");
	container.textContent = "";
	return container;
};


/**
 * Skapar kryssrutan för serverad/ej serverad
 */
const createServedCheckbox = (item) => {
	const container = document.createElement("div");
	const checkbox = document.createElement("input");
	
	// Skapa en kryssruta
	checkbox.type = "checkbox";
	checkbox.id = item.id;
	checkbox.checked = item.served;

	// Lägg till kryssrutan i behållaren
	container.appendChild(checkbox);
	
	// Lägg till händelselyssnare för klick
	checkbox.addEventListener("click", updateServed);

	return container;
};

/**
 * Skapar texten för en måltid
 */
const createMealText = (item) => {
	const container = document.createElement("div");
	
	// Formatera datumet på ett läsbart sätt
	const formattedDate = new Date(item.date).toLocaleDateString("sv-SE");
	
	// Sätt texten för måltiden
	container.textContent = item.dish + " - " + formattedDate;
	
	// Om måltiden är serverad, stryk över texten
	if (item.served) {
		container.style.textDecoration = "line-through";
	} else {
		container.style.textDecoration = "none";
	}
	
	return container;
};

/**
 * Skapar radera-knappen för en måltid
 */
const createDeleteButton = (id) => {
	const container = document.createElement("div");
	const button = document.createElement("button");
	
	// Sätt ID för knappen (samma som måltiden)
	button.id = id;
	button.innerText = "X";

	// Lägg till knappen i behållaren
	container.appendChild(button);
	
	// Lägg till händelselyssnare för klick
	button.addEventListener("click", deleteMeal);

	return container;
};

/**
 * Skapar en komplett måltidsrad
 */
const createMealRow = (item) => {
	// Skapa en listitem (li)
	const row = document.createElement("li");
	
	// Lägg till de tre delarna: kryssruta, text och radera-knapp
	row.appendChild(createServedCheckbox(item));
	row.appendChild(createMealText(item));
	row.appendChild(createDeleteButton(item.id));
	
	return row;
};

/**
 * Sorterar måltider efter datum (äldst först)
 */
const sortMealsByDate = () => {
	return meals.sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateA - dateB;
	});
};

/**
 * Uppdaterar hela måltidslistan i användargränssnittet
 */
const renderMeals = async () => {
	try {
		// Hämta senaste måltiderna från servern
		await getMeals();

		// Töm listan innan vi fyller den igen
		list.innerHTML = "";

		// Om det inte finns några måltider, visa meddelande och dölj rubriken
		if (meals.length === 0) {
			list.appendChild(createNoMealsMessage());
			mealPlanTitle.style.display = "none"; // Dölj rubriken när inga måltider finns
			return;
		}
		
		// Visa rubriken när det finns måltider
		mealPlanTitle.style.display = "block";

		// Sortera måltider efter datum
		const sortedMeals = sortMealsByDate();

		// Lägg till alla måltider i listan
		for (const meal of sortedMeals) {
			list.appendChild(createMealRow(meal));
		}
	} catch (error) {
		// Visa eventuella fel
		errorMessage.textContent = error.message;
	}
};

/**
 * Spara maträttens namn när användaren skriver
 */
const handleSetDish = (event) => {
	dish = event.target.value;
};

/**
 * Spara datumet när användaren väljer
 */
const handleSetDate = (event) => {
	date = event.target.value;
};

// Hämta element
const toggleButton = document.getElementById("dm-toggle");

// Funktion för att växla tema
const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        toggleButton.textContent = "Lightmode";
    } else {
        localStorage.setItem("theme", "light");
        toggleButton.textContent = "Darkmode";
    }
};

// Lägg till eventlyssnare på knappen
toggleButton.addEventListener("click", toggleTheme);

// Kolla om användaren tidigare valt tema
window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        toggleButton.textContent = "Lightmode";
    }
});



/**
 * Hantera Enter-tangenttryckning
 */
const handleEnter = (event) => {
	if (event.key === "Enter") {
		createMeal();
	}
};

// Lägg till händelselyssnare för interaktioner
dishInput.addEventListener("keyup", handleSetDish);
dateInput.addEventListener("change", handleSetDate);
dishInput.addEventListener("keypress", handleEnter);
dateInput.addEventListener("keypress", handleEnter);
button.addEventListener("click", createMeal);

// Ladda in måltider när sidan laddas
renderMeals();
