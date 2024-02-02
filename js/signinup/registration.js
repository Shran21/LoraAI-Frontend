var email; // Külső szinten deklaráljuk az email változót

document.getElementById('submit-button').addEventListener('click', function (event) {
  // Megakadályozza az alapértelmezett űrlapbeküldési viselkedést
  event.preventDefault();
  
  email = document.getElementById('mail').value.toLowerCase(); // Konvertálás kisbetűssé

  // Hívja meg a regisztráció küldését
  sendRegistrationData();
});

function sendRegistrationData() {
  if (!validateForm()) {
    return; // Ha a validáció nem sikerült, ne küldje el a regisztrációs adatokat
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.shrantarhely.hu/register', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  var data = {
    lastName: document.getElementById('last-name').value,
    firstName: document.getElementById('first-name').value,
    email: email,  // Módosítás: itt haszálom az előzőleg konvertált e-mail címet
    password: document.getElementById('user-password').value,
  };

  // Eseményfigyelő a sikeres kérésre
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        var response = JSON.parse(xhr.responseText);
        displaySuccess(response.message);
		
		// Időzített átirányítás 4 mp-vel később
		setTimeout(() => {
			window.location.href = response.redirect;
		}, 3000);
		
      } catch (error) {
        console.error('Error parsing JSON response:', error);
      }
    } else {
      // Sikertelen kérés
      handleErrorResponse(xhr);
    }
  };

  // Eseményfigyelő a hibás kérésre
  xhr.onerror = function () {
    console.error('Network error occurred.');
  };

  xhr.send(JSON.stringify(data));
}

function handleErrorResponse(xhr) {
  try {
    var error = JSON.parse(xhr.responseText);
    displayError(error.error, 'message');
  } catch (error) {
    console.error('Error parsing JSON error response:', error);
  }
}
