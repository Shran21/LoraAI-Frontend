document.addEventListener('DOMContentLoaded', function() {
  const directoryList = document.getElementById('directoryList');

  // Függvény a mappa tartalmának lekérdezésére és megjelenítésére
  function fetchDirectoryList() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.testsite.hu/getDirectoryList', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Mappa tartalmának törlése a frissítés előtt
        directoryList.innerHTML = '';

        const files = JSON.parse(xhr.responseText);

        // Mappa tartalmának megjelenítése a HTML oldalon
        files.forEach(file => {
          const listItem = document.createElement('li');
          const deleteButton = document.createElement('button');

          // Törlés gomb hozzáadása
          deleteButton.textContent = 'Törlés';
		  deleteButton.style.backgroundColor  = 'rgba(255, 128, 128, 0.9)'; // Piros szín beállítása
          deleteButton.onclick = function() {
            deleteFile(file);
          };

          // Térköz hozzáadása a gomb és a fájl neve közé
          listItem.textContent = file;
          listItem.appendChild(document.createTextNode('      '));
          listItem.appendChild(deleteButton);

          directoryList.appendChild(listItem);
        });
		// Ellenőrizzük, hogy az mappa üres-e
        if (files.length === 0) {
          console.info('A mappa üres.');
		  warning('Figyelem! Ha nincs feltöltve fájl akkor a chatbot nem fog megfelelően működni!');
        }
      }
    };
    xhr.send();
  }

  // Fájl törlés funkció
  function deleteFile(fileName) {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `https://api.testsite.hu/deleteFile/${fileName}`, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Sikeres törlés esetén frissítsük a mappa tartalmát
          fetchDirectoryList();
        } else {
          console.error('Hiba történt a fájl törlése közben.');
        }
      }
    };
    xhr.send();
  }

  // Az időzítő beállítása: 10 másodpercenként hívja meg a fetchDirectoryList függvényt
  setInterval(fetchDirectoryList, 10000);

  // Azonnali lekérdezés az oldal betöltésekor
  fetchDirectoryList();
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

function warning(warning) {
		  let warningMessage;

    // Ellenőrzi, hogy az error egy szöveges üzenet vagy objektum
    if (typeof error === 'string') {
        warningMessage = warning;
    } else if (warning instanceof Error) {
        warningMessage = warning.message;
    } else {
        // Ha sem szöveg, sem Error objektum, akkor átalakítja a JSON formátumot
        warningMessage = JSON.stringify(warning);
    }
  $.notify({
	// options
	title: '<strong>Warning</strong>',
	message: warningMessage,
  icon: 'glyphicon glyphicon-warning-sign',
},{
	// settings
	element: 'body',
	position: null,
	type: "warning",
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
		enter: 'animated bounceIn',
		exit: 'animated bounceOut'
	},
	onShow: null,
	onShown: null,
	onClose: null,
	onClosed: null,
	icon_type: 'class',
});
}