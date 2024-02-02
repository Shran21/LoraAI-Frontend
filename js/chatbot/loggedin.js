
 // Ellenőrzi, hogy az oldal HTTP-n vagy HTTPS-en van-e megnyitva
if (location.protocol === 'http:') {
    // Átirányítás HTTPS-re
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
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
                
            } else {
                console.log('A felhasználó nincs bejelentkezve!');
	
             
               if (result && result.redirect) {
					window.location.href = result.redirect;
				} else {
				// Ha nincs redirect információ, irányítsd át egy másik oldalra
					window.location.href = 'index.html';
				}

            }
        } else {
            console.error('Hiba a /loggedin lekérdezés során:', response.statusText);  
			// Ha nincs redirect információ, irányítsd át egy másik oldalra
					window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Network error occurred:', error);	 
		// Ha nincs redirect információ, irányítsd át egy másik oldalra
					window.location.href = 'index.html';
    }
}

// Példa az oldal betöltésekor való hívásra
document.addEventListener('DOMContentLoaded', function () {
    checkLoggedInState();
});

//figyeljük a console tartalmát és ha hiba van akkor azt olvassuk
document.addEventListener('loginError', function (event) {
    const errorMessage = event.detail;
    // Most megteheted, hogy a errorMessage-t használod a notify megjelenítésére
    console.error(errorMessage); // Csak ellenőrzés céljából, hogy lássuk a konzolon
});
