let dinos = [];

// Coding sugar addition, in order to better handle forms
// It can be further extended to library
function Form(id) {
    this.domElement = document.getElementById(id);
    this.fields = [].slice.call(this.domElement.elements);
    this.validationResult = null;
}

function Creature(species, weight, height, diet, facts) {
    this.species = species;
    this.weight = weight;
    this.height = height;
    this.diet = diet;
    this.facts = facts;
    this.image = "images/" + species.toLowerCase() + ".png";
}

// Reset values inside in the requested form
// Alternative to build-in method reset()
Form.prototype.reset = function() {
    for (i = this.domElement.elements.length - 1; i >= 0; i = i - 1) {
        switch (this.domElement.elements[i].nodeName) {
            case 'INPUT':
                switch (this.domElement.elements[i].type) {
                    case 'text':
                    case 'tel':
                    case 'email':
                    case 'hidden':
                    case 'password':
                    case 'number':
                        // Assign empty string as value
                        this.domElement.elements[i].value = '';
                        break;
                    case 'checkbox':
                    case 'radio':
                        // Assign false as checked
                        this.domElement.elements[i].checked = false;
                        break;
                }
                break;
            case 'TEXTAREA':
                this.domElement.elements[i].value = '';
                break;
            case 'SELECT':
                switch (this.domElement.elements[i].type) {
                    case 'select-one':
                        // Set the first option as default value
                        this.domElement.elements[i].value = this.domElement.elements[i].options[0].value;
                        break;
                    case 'select-multiple':
                        // Set all options selected value to false
                        for (j = this.domElement.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            this.domElement.elements[i].options[j].selected = false;
                        }
                        break;
                }
                break;
        }
    }
};

Form.prototype.serialize = function() {
    if (!this.domElement || this.domElement.nodeName !== "FORM") {
        return;
    }
    let i, j, json = {};
    for (i = this.domElement.elements.length - 1; i >= 0; i = i - 1) {
        if (this.domElement.elements[i].name === "") {
            continue;
        }
        switch (this.domElement.elements[i].nodeName) {
            case 'INPUT':
                switch (this.domElement.elements[i].type) {
                    case 'text':
                    case 'tel':
                    case 'email':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                        json[this.domElement.elements[i].name] = this.domElement.elements[i].value;
                        break;
                    case 'number':
                        json[this.domElement.elements[i].name] = parseFloat(this.domElement.elements[i].value);
                        break;
                    case 'checkbox':
                    case 'radio':
                        json[this.domElement.elements[i].name] = this.domElement.elements[i].checked;
                        break;
                }
                break;
            case 'file':
                break;
            case 'TEXTAREA':
                json[this.domElement.elements[i].name] = this.domElement.elements[i].value;
                break;
            case 'SELECT':
                switch (this.domElement.elements[i].type) {
                    case 'select-one':
                        json[this.domElement.elements[i].name] = this.domElement.elements[i].value;
                        break;
                    case 'select-multiple':
                        for (j = this.domElement.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (this.domElement.elements[i].options[j].selected) {
                                json[this.domElement.elements[i].name] = this.domElement.elements[i].options[j].value;
                            }
                        }
                        break;
                }
                break;
            case 'BUTTON':
                switch (this.domElement.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        json[this.domElement.elements[i].name] = this.domElement.elements[i].value;
                        break;
                }
                break;
        }
    }
    return json;
}

Form.prototype.validate = function() {
    let result = true;
    const data = this.serialize();

    for (key in data) {
        const field = this.fields.find(el => el.name === key);
        let isValid = true;

        if (field.type === 'text') {
            if (!data[key]) {
                isValid = false;
            }
        } else if (field.type === 'number') {
            if (isNaN(data[key])) {
                isValid = false;
            }
        }

        isValid ?
            field.classList.remove('error') :
            field.classList.add('error');

        result = result && isValid;
    }

    return result;
};

Form.prototype.validateOnInput = function() {
    this.fields.forEach((field) => {
        if (field.nodeName) {
            field.addEventListener('input', function(event) {
                event.target.value ?
                    event.target.classList.remove('error') :
                    event.target.classList.add('error');
            });
        }
    });
};

// Initialize dino-compare form
const compareForm = new Form('dino-compare');

// Init validate functionality on each input value change event
compareForm.validateOnInput();

// Create Dino Constructor
function Dino(species, weight, height, diet, facts) {
    Creature.call(this, species, weight, height, diet, facts);
}

// Create Dino Objects
function fetchDinos() {
    return fetch('./dino.json').then(response => {
        return response.json();
    }).then(data => {
        dinos = data.Dinos.map((dino) => {
            return new Dino(
                dino.species,
                dino.weight,
                dino.height,
                dino.diet, [dino.fact]
            );
        });
    });
};

fetchDinos();

Dino.prototype.addFact = function(fact) {
    this.facts.push(fact);
};

// Create Human Object
function Human(name, height, weight, diet) {
    Creature.call(this, 'human', weight, height, diet, []);
    this.name = name;
}

// Use IIFE to get human data from form
function getHuman() {
    return (function() {
        const data = compareForm.serialize();
        // 12 inch = 1 feet
        return new Human(
            data.name,
            data.feet * 12 + data.inches,
            data.weight,
            data.diet
        )
    })();
}

// Create Dino Compare Method 1
// NOTE: Weight in JSON file is in lbs, height in inches. 
Dino.prototype.compareHeight = function(height) {
    if (this.height > height) {
        return 'You are small';
    } else if (this.height < height) {
        return 'You are big bro';
    } else {
        return 'Same height. What a coincidence';
    }
};

// Create Dino Compare Method 2
// NOTE: Weight in JSON file is in lbs, height in inches.
Dino.prototype.compareWeight = function(weight) {
    if (this.weight > weight) {
        return 'You need to eat more';
    } else if (this.weight < weight) {
        return 'Start a diet bro';
    } else {
        return 'Same weight. What a coincidence';
    }
}

// Create Dino Compare Method 3
Dino.prototype.compareDiet = function(diet) {
    if (this.diet === diet) {
        return 'We eat the same';
    } else {
        return 'How you can possibly eat something like this';
    }
}

// Generate Tiles for each Dino in Array
Dino.prototype.generateTile = function() {
    // Create div
    let div = document.createElement("div");
    div.className = "grid-item";
    div.style.background = genRandomColor();
    // Create heading
    const h3 = document.createElement("h3");
    h3.innerText = this.species;
    div.appendChild(h3);
    // Create image
    const img = document.createElement("img");
    img.src = this.image;
    div.appendChild(img);
    // Create paragraph in case there are facts
    const p = document.createElement("p");
    const index = Math.floor(Math.random() * 10) % this.facts.length;
    p.innerText = this.facts[index];
    div.appendChild(p);
    return div;
};

// Generate Tile for human
Human.prototype.generateTile = function() {
    // Create div
    let div = document.createElement("div");
    div.className = "grid-item";
    div.style.background = genRandomColor();
    // Create heading
    const h3 = document.createElement("h3");
    h3.innerText = this.name;
    div.appendChild(h3);
    // Create image
    const img = document.createElement("img");
    img.src = this.image;
    div.appendChild(img);
    return div;
};

// Add tiles to DOM
function addTilesToDOM(tile) {
    document.getElementById("grid").appendChild(tile);
}

// Function to perform both of the following tasks
// Remove form from screen
// Add grid to screen
function showGrid(showGrid) {
    const toShow = showGrid && 'grid-container' || 'dino-compare';
    const toHide = showGrid && 'dino-compare' || 'grid-container';
    document.getElementById(toShow).classList.remove('hide');
    document.getElementById(toHide).classList.add('hide');
}

// On button click, prepare and display infographic
document.getElementById('btn').addEventListener('click', (event) => {
    // In case the form is not valid exit callback
    if (!compareForm.validate()) {
        return;
    }

    // Get human data for the comparisons and the human tile
    const human = getHuman();

    // Loop over shuffled dinos
    shuffle(dinos).forEach((dino, index) => {
        // if weight is less than 1 then its a bird
        if (dino.weight >= 1) {
            // Add facts to dinos facts array
            dino.addFact(dino.compareHeight(human.height));
            dino.addFact(dino.compareWeight(human.weight));
            dino.addFact(dino.compareDiet(human.diet));
        } else {
            dino.facts = ["All birds are dinosaurs."];
        }

        // Add dino tile in in grid
        addTilesToDOM(dino.generateTile());
        index == 3 && addTilesToDOM(human.generateTile());
    });

    // Show grid filled with dinos and human
    showGrid(true);
});

// New compare functionality
document.getElementById('new-compare').addEventListener('click', (event) => {
    // Clear previously added tiles
    document.getElementById("grid").innerHTML = '';
    // Empty array to fill it again with data
    // Simulating the process of real APIs
    dinos = [];
    fetchDinos();
    // Reset the values of all input fields
    compareForm.reset();
    // Show dino-compare form
    showGrid();
});

// Custom shuffle method to user it for the Dino array
function shuffle(array) {
    let currentIndex = array.length,
        temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Use a random color generator for the tiles to enhance Ui
function genRandomColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}