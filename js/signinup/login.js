

// Ellenőrzi, hogy az oldal HTTP-n vagy HTTPS-en van-e megnyitva
if (location.protocol === 'http:') {
    // Átirányítás HTTPS-re
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}


var email; // Külső szinten deklaráljuk az email változót

async function sendLoginData() {
    var data = {
        email: email.toLowerCase(),
        password: document.getElementsByName('password')[0].value,
    };

    try {
        const response = await fetch('https://api.testsite.hu/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            displaySuccess(result.message);

            // Ellenőrzi, hogy a válasz tartalmaz-e session információkat
            if (result.session) {
              
				//A sessionStorage a böngésző ablak élettartamáig él, tehát bezárásakor elvesznek az adatok.
				*/
				localStorage.setItem('sessionID', result.sessionID);
				localStorage.setItem('isLoggedIn', true);
				
				localStorage.setItem('email', result.email);
            }

            // Átirányítás a sikeres bejelentkezés után
            window.location.href = result.redirect;
        } else {
            const error = await response.json();
            handleErrorResponse(error);
        }
    } catch (error) {
        console.error('Network error occurred:', error);
    }
}

document.getElementById('login-button').addEventListener('click', function (event) {
    event.preventDefault();
    email = document.getElementsByName('username')[0].value;
    sendLoginData();
});


// Eseményfigyelő hozzáadása az input mezőkhöz
document.getElementsByName('username')[0].addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        // Enter lenyomásakor hívódik meg a bejelentkezés gomb klikk eseménye
        document.getElementById('login-button').click();
    }
});

document.getElementsByName('password')[0].addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        // Enter lenyomásakor hívódik meg a bejelentkezés gomb klikk eseménye
        document.getElementById('login-button').click();
    }
});


function handleErrorResponse(error) {
    displayError(error.error, 'message');
}

function displayError(message, elementId) {
    var element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = message;
    }
}

function displaySuccess(message) {
    // Itt a sikeres bejelentkezés utáni műveleteket hajthatod végre
    console.log(message);
	successlogin()
}






async function checkLoggedInState() {
    try {
        const response = await fetch('https://api.testsite.hu/loggedin', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const result = await response.json();

            if (result.isLoggedIn) {
                console.log(`A felhasználó be van jelentkezve! Email: ${result.email}`);
                
                // window.location.href = 'Chatbot.html'; // Példa átirányításra
				 window.location.href = result.redirect; // Átirányítás az általad meghatározott útvonalra
            } else {
                console.log('A felhasználó nincs bejelentkezve!');
			
            
            }
        } else {
            console.error('Hiba a /loggedin lekérdezés során:', response.statusText);
			displayErrorNotification('Hiba a /loggedin lekérdezés során:', response.statusText);
      
		
        }
    } catch (error) {
        console.error('Network error occurred:', error);	
		// Az error üzenet megjelenítése
		displayErrorNotification('A szerver nem elérhető!');
		
    }
}

// Példa az oldal betöltésekor való hívásra
document.addEventListener('DOMContentLoaded', function () {
    checkLoggedInState();
});


function displayErrorNotification(error) {
	  let errorMessage;

    // Ellenőrzi, hogy az error egy szöveges üzenet vagy objektum
    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        // Ha sem szöveg, sem Error objektum, akkor átalakítja a JSON formátumot
        errorMessage = JSON.stringify(error);
    }
	
    // Bootstrap Notify használata az error notify megjelenítéséhez
    $.notify({
	// options
	title: '<strong>HIBA!</strong>',
	message: errorMessage,
  icon: 'glyphicon glyphicon-remove-sign',
},{
	// settings
	element: 'body',
	position: null,
	type: "danger",
	allow_dismiss: true,
	newest_on_top: false,
	showProgressbar: false,
	placement: {
		from: "top",
		align: "right"
	},
	offset: 20,
	spacing: 10,
	z_index: 1031,
	delay: 3300,
	timer: 1000,
	url_target: '_blank',
	mouse_over: null,
	animate: {
		enter: 'animated flipInY',
		exit: 'animated flipOutX'
	},
	onShow: null,
	onShown: null,
	onClose: null,
	onClosed: null,
	icon_type: 'class',
    });
}


function successlogin() {
  $.notify({
	// options
	title: '<strong>Success</strong>',
	message: "Sikeres bejelentkezés",
    icon: 'glyphicon glyphicon-ok',
	//url: 'https://github.com/mouse0270/bootstrap-notify',
	target: '_blank'
},{
	// settings
	element: 'body',
	//position: null,
	type: "success",
	//allow_dismiss: true,
	//newest_on_top: false,
	showProgressbar: false,
	placement: {
		from: "top",
		align: "right"
	},
	offset: 20,
	spacing: 10,
	z_index: 1031,
	delay: 3300,
	timer: 1000,
	url_target: '_blank',
	mouse_over: null,
	animate: {
		enter: 'animated fadeInDown',
		exit: 'animated fadeOutRight'
	},
	onShow: null,
	onShown: null,
	onClose: null,
	onClosed: null,
	icon_type: 'class',
});
}
