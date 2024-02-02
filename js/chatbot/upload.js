// Fájl input változók
const fileInput = document.getElementById('file');
const fillButton = document.getElementById('fillbutton');
const uploadButton = document.getElementById('uploadButton');
const upload = document.querySelector('.upload');
const uploadButtonText = document.querySelector('.upload-button-text');
const uploadFilename = document.querySelector('.upload-filename');
const dropArea = document.querySelector('.drop-area');
const body = document.querySelector('body');
let selectedFile = null; // a kiválasztott fájl globális változója

// Feltöltött fájl eseménykezelő
fileInput.onchange = () => {
  selectedFile = fileInput.files[0];
  uploadFile(selectedFile);
};

// Fájl feltöltés függvény
async function uploadFile(file) {
  console.log('current files:', file);
  if (file) {
    // Fájlnév hozzáadása és gomb szövegének módosítása
    uploadFilename.classList.remove('inactive');
    uploadFilename.innerText = file.name;
	


    // Buttonok megjelenítése/elrejtése
    fillButton.style.display = 'none';
    uploadButton.style.display = 'block';

    // Kattintás eseménykezelő csak akkor, ha még nincs hozzáadva
    if (!uploadButton.clickListenerAdded) {
      uploadButton.clickListenerAdded = true;

      // Kattintás eseménykezelő a feltöltés gombra
      uploadButton.addEventListener('click', async () => {
        upload.classList.add('uploading');

        // Fájl küldése a szerverre a /upload-file útvonalon
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
          const response = await fetch('https://api.testsite.hu/upload-file', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          // Szerver válaszának kezelése szükség esetén
          const data = await response.json();
          console.log('Server response:', data);

          // Input visszaállítása késleltetés után
          setTimeout(() => {
            upload.classList.remove('uploading');
            if (data.message === 'Fájlfeltöltés sikeres') {
              uploadFilename.innerText = 'Sikeres feltöltés';
				setTimeout(() => {
				// Fájlnév visszaállítása
				uploadFilename.classList.add('inactive');
				uploadFilename.innerText = 'Nincs kiválasztott fájl';
        
				// Buttonok módosítása sikeres feltöltés után
				uploadButton.style.display = 'none';
			// 	fillButton.style.display = 'block'; --> Ez azért nem jó mert behelyez egy stylet amit nem kellene mert akkor eltolja az egész oldalt.
				fillButton.removeAttribute('style');  // Törli a style attribútumot			
				selectedFile = null; // nullázza a kiválasztott fájlt
			  					
			}, 3000);
         } else {
              uploadFilename.innerText = 'Sikertelen feltöltés';
            }
          }, 3000);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      });
    }
  }
}


// ...




// Eseménykezelők a drag-and-drop funkcionalitáshoz
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach((eventName) => {
  body.addEventListener(eventName, displayDropArea, false);
});

['dragleave', 'drop'].forEach((eventName) => {
  body.addEventListener(eventName, hideDropArea, false);
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

// Függvények a drag-and-drop funkcionalitáshoz
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
  if (!dropArea.classList.contains('highlight')) dropArea.classList.add('highlight');
}

function unhighlight(e) {
  dropArea.classList.remove('highlight');
}

function displayDropArea() {
  if (!dropArea.classList.contains('highlight')) dropArea.classList.add('droppable');
}

function hideDropArea() {
  dropArea.classList.remove('droppable');
}

// Fájl kezelése a letett területen
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  e.preventDefault();
  let dt = e.dataTransfer;
  let files = dt.files;
  selectedFile = files[0];
  uploadFile(selectedFile);
}
