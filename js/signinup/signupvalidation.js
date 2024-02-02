// Ellenőrzi, hogy az oldal HTTP-n vagy HTTPS-en van-e megnyitva
if (location.protocol === 'http:') {
    // Átirányítás HTTPS-re
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

var fieldsToValidate = ['last-name', 'first-name', 'mail', 'user-password', 'user-password-confirm'];

fieldsToValidate.forEach(function (fieldId) {
  var field = document.getElementById(fieldId);

  field.addEventListener('input', function () {
    validateField(fieldId);
  });

  field.addEventListener('focusout', function () {
    if (field.value !== '') {
      displaySuccess('');
    }
  });

  field.addEventListener('click', function () {
    clearMessages(fieldId);
  });
});

function validateField(fieldId) {
  var field = document.getElementById(fieldId);
  var fieldValue = field.value;
  var messageDiv = document.getElementById('message');

  
  clearMessages(fieldId);

  
  if (fieldValue === '') {
    displayError('*Minden mezőt ki kell tölteni.', fieldId);
    return false;
  }

  
  if (fieldId === 'user-password-confirm' && fieldValue !== document.getElementById('user-password').value) {
    displayError('*A jelszavak nem egyeznek.', 'user-password-confirm');
    return false;
  }

 
  if (fieldId === 'mail' && !isValidEmail(fieldValue)) {
    displayError('*Érvényes email címet adjon meg.', 'mail');
    return false;
  }

  
  if (fieldId === 'user-password' && !isValidPassword(fieldValue)) {
    displayError('*A jelszónak legalább 8 karakterből kell állnia, és tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert.', 'user-password');
    return false;
  }

  return true;
}

function isValidPassword(password) {
 
  var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function isValidEmail(email) {
  
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function displayError(message, fieldId) {
  var errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.setAttribute('data-field', fieldId);
  var field = document.getElementById(fieldId);
  field.classList.add('error-input');
  var parentDiv = field.parentNode;

  
  parentDiv.appendChild(errorDiv);
}

function displaySuccess(message) {
  var successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  var messageDiv = document.getElementById('message');
  messageDiv.innerHTML = ''; 
  messageDiv.appendChild(successDiv);
  document.getElementById('user-password').classList.add('success-input');
}

function clearMessages(fieldId) {
  var messageDiv = document.getElementById('message');
  var field = document.getElementById(fieldId);
  var parentDiv = field.parentNode;


  var previousErrors = parentDiv.querySelectorAll('.error-message[data-field="' + fieldId + '"]');
  previousErrors.forEach(function (previousError) {
    previousError.remove();
    field.classList.remove('error-input');
  });
}

// Új függvény, ami megadja, hogy az összes mező valid-e
function validateForm() {
  var isFormValid = true;


  fieldsToValidate.forEach(function (fieldId) {
    if (!validateField(fieldId)) {
      isFormValid = false;
    }
  });

  if (!isFormValid) {
    return false;
  }

  return true;
}
