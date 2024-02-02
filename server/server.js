const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const validator = require('validator');
const path = require('path');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const SQLiteStore = require('connect-sqlite3')(session);
const multer = require('multer');
const { exec } = require('child_process');
const cookie = require('cookie');
const { Console } = require('console');




const app = express();
const port = 3050;


const upload = multer({
  dest: '<--your-path-->/uploadedfiles/',
  fileFilter: (req, file, callback) => {
    const allowedFileTypes = /jpeg|jpg|csv|pdf|txt|docx/; // Add your allowed file types here

    const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extension && mimetype) {
      return callback(null, true);
    } else {
      return callback(new Error('Érvénytelen fájltípus!'), false);
    }
  },
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, '<--your-path-->/uploadedfiles/');
    },
    filename: function (req, file, callback) {
      // Az eredeti fájlnév használata
      callback(null, file.originalname);
    },
  }),
});



// Változó a redirect útvonalakhoz
let redirectPaths = {
  registration: 'LoginForm.html',
  login: 'Chatbot.html',
  loggedIn: 'Chatbot.html',
  notLoggedIn: 'LoginForm.html',
};


// CORS engedélyezése
const corsOptions = {
  origin: 'https://test.site.hu',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://test.site.hu');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(cors(corsOptions));


// Session inicializálása
const sessiondbPath = path.join(__dirname, 'db', 'logindatas.db');

const sessionStore = new SQLiteStore({
  db: sessiondbPath,
  concurrentDB: true,
  checkExpirationInterval: 15 * 60 * 1000,
  //expiration: 60 * 60 * 1000, //Ez a beállítás mindenképp törli az adatbázis tartalmát 1 óra elteltéve.
});



app.use(
  session({
    name: 'jsessionid', // Itt állíthatod be a sütinevet
    secret: crypto.randomBytes(64).toString('hex'), // Minden session-höz generál egy új, véletlenszerű titkos kulcsot
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'None',
    //  maxAge: 60 * 60 * 1000,
	  maxAge: 2 * 60 * 60 * 1000,
    },
  })
);

// Middleware a session élettartam hosszabbításához
app.use((req, res, next) => {
  // Felhasználó azonosítójának ellenőrzése
  const userId = req.session.email || 'unknown'; // Ha undefined, használjuk az 'unknown' értéket

  if (userId !== 'unknown') {
    // Ha van aktivitás, növeljük a session élettartamát 1 órával
    if (req.session.lastActivity) {
      const timeSinceLastActivity = Date.now() - req.session.lastActivity;

      // Az élettartamot csak akkor növeljük, ha az aktivitás történt az utolsó 5 percben
      if (timeSinceLastActivity <  5 * 60 * 1000) {
        req.session.cookie.maxAge = 2 * 60 * 60 * 1000;
      }
    }

    // Frissítjük a 'last-activity' session változót
    req.session.lastActivity = Date.now();
  }

  // Frissítjük a 'last-activity' cookie-t
  res.setHeader('Set-Cookie', cookie.serialize('lastActivity', Date.now().toString()));

  // Logoljuk a session élettartamát minden kérés során
  if (userId !== 'unknown') {
  console.log(`${userId}  -  Session maxAge:`, req.session.cookie.maxAge);
  }
  
  next();
});



// SQLite adatbázis inicializálása
const dbPath = path.join(__dirname, 'db', 'users.db');
const db = new sqlite3.Database(dbPath);

// Tábla létrehozása, ha még nem létezik
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lastName TEXT,
      firstName TEXT,
      email TEXT,
      password TEXT
    )
  `);
});

app.use(bodyParser.json());



// Regisztráció kezelése API
app.post('/register', async (req, res) => {
  const { lastName, firstName, email, password } = req.body;

  // Naplózza a regisztrációs kérés részleteit
  console.log(`Received registration request from ${req.ip}`);
  console.log('Request body:', {
    lastName,
    firstName,
    email,
    password: '****',
  });

  // E-mail cím validálása
  if (!validator.isEmail(email)) {
    console.error('Invalid email address:', email);
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Ellenőrzi, hogy az e-mail cím már regisztrálva van-e
  const existingUser = await checkExistingUser(email);
  if (existingUser) {
    console.error('Ez az email cím már foglalt:', email);
    return res.status(400).json({ error: '*Ez az email cím már foglalt!' });
  }

  // Jelszó biztonságos tárolása (hash)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Adatbázisba való beszúrás
  const stmt = db.prepare(
    'INSERT INTO users (lastName, firstName, email, password) VALUES (?, ?, ?, ?)'
  );
  stmt.run(lastName, firstName, email, hashedPassword, (err) => {
    if (err) {
      // Naplózza a hibát
      console.error('Error during registration:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // Naplózza a sikeres regisztrációt
    console.log(`Registration successful for email: ${email}`);
    res.json({ message: 'Sikeres regisztráció!', redirect: redirectPaths.registration });
  });

  stmt.finalize();
});

// Ellenőrzi, hogy az e-mail cím már regisztrálva van-e API
function checkExistingUser(email) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.get(query, [email], (err, row) => {
      if (err) {
        // Naplózza a hibát
        console.error('Error checking existing user:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Bejelentkezés kezelése API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Naplózza a bejelentkezési kérés részleteit
  console.log(`Received login request from ${req.ip}`);
  console.log('Request body:', {
    email,
    password: '****',
  });

  // Ellenőrzi, hogy az e-mail cím létezik-e
  const existingUser = await checkExistingUser(email);
  if (!existingUser) {
    console.error('Helytelen felhasználónév vagy jelszó:', email);
    return res.status(401).json({ error: 'Helytelen felhasználónév vagy jelszó' });
  }

  // Ellenőrzi a jelszó helyességét
  const passwordMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordMatch) {
    console.error('Helytelen felhasználónév vagy jelszó:', email);
    return res.status(401).json({ error: 'Helytelen felhasználónév vagy jelszó' });
  }

  // Bejelentkezés sikeres
  console.log(`Login successful for email: ${email}, sessionID: ${req.sessionID}`);
  req.session.isLoggedIn = true;
  req.session.email = email;
  res.json({ message: 'Sikeres bejelentkezés', redirect: redirectPaths.login });
});

// Üdvözlő oldal API
app.get('/welcome', (req, res) => {
  if (req.session.isLoggedIn) {
    res.send(`Üdvözöllek, ${req.session.email}! SessionID: ${req.sessionID}`);
  } else {
    res.send('Nincs engedélyezett hozzáférés.');
  }
});

//* Egyéb oldalakhoz is hasonló ellenőrzéseket adhatsz hozzá API
app.get('/loggedin', (req, res) => {
  if (req.session.isLoggedIn) {
    // A felhasználó be van jelentkezve, küldje vissza a bejelentkezett állapotot és az e-mail címet
    res.json({ isLoggedIn: true, email: req.session.email, redirect: redirectPaths.loggedIn });
  } else {
    // A felhasználó nincs bejelentkezve, küldje vissza, hogy nincs bejelentkezve és az átirányítási útvonalat
    res.json({ isLoggedIn: false, redirect: redirectPaths.notLoggedIn });
  }
});

// Végpont az aktív session-ök listázására API
app.get('/active-sessions', (req, res) => {
  const activeSessions = Object.keys(sessionStore.sessions);
  console.log('Aktív session-ök:', activeSessions);
  res.json({ activeSessions });
});

// HTTPS szerver indítása
const credentials = {
  key: fs.readFileSync('/etc/ssl/private/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('/etc/ssl/certs/ssl-cert-snakeoil.pem'),
};

const httpsServer = https.createServer(credentials, app);


//Fájlfeltöltés API funkció kialakítása_______________________________________________

/* app.post('/upload-file', upload.single('file'), (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ error: 'Nincs engedélyezett hozzáférés' });
  }

  // Kezeld itt a fájlfeltöltést, és ellenőrizd a jogosultságokat
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Nem sikerült a fájlfeltöltés' });
  }

  // Sikeres fájlfeltöltés esetén itt további logika vagy válasz küldése

  res.json({ message: 'Fájlfeltöltés sikeres', file });
});
*/


app.post('/upload-file', (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ error: 'Nincs engedélyezett hozzáférés' });
  }

  // Fájlfeltöltés
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt a fájlfeltöltés közben.' });
    }

    runUpdateScript();

    // Sikeres fájlfeltöltés esetén további logika vagy válasz küldése
    res.json({ message: 'Fájlfeltöltés sikeres' });
  });
});






//Fájlfeltöltés funkció vége API__________________________________________________________


//Mappa lista olvasás API__________________________________________________________

app.get('/getDirectoryList', (req, res) => {
  const directoryPath = '<--your-path-->/uploadedfiles/'; // Módosítsd erre a megfelelő mappa elérési útvonalára

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Hiba történt a mappa olvasása közben.');
    }

    res.json(files);
  });
});

//Mappa lista olvasás__________________________________________________________

//Fájl törlés API__________________________________________________________
app.delete('/deleteFile/:fileName', (req, res) => {
  const directoryPath = '<--your-path-->/uploadedfiles/';
  const fileName = req.params.fileName;
  const filePath = path.join(directoryPath, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).send('Hiba történt a fájl törlése közben.');
    }

    res.send('A fájl sikeresen törölve.');

    // 5 másodperc várakozás, majd az update.js script indítása
    setTimeout(() => {
      runUpdateScript();
    }, 5000);
  });
});

//Fájl törlés API__________________________________________________________


function runUpdateScript() {
  exec('node <--your-path-->/server/Chatflow.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}


//Logolás
// A naplófájl elérési útvonala
const logFilePath = path.join(__dirname, 'log', 'server.log');

// Naplófájl inicializálása
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });


// Közvetlenül átirányítjuk a konzol kimenetet a naplófájlba
console.log = console.error = (...args) => {
  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
  const logMessage = `[${timestamp}] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`;
  logStream.write(logMessage + '\n');
  process.stdout.write(logMessage + '\n'); // Visszaírjuk az eredeti stdout-ra is
};



// Szerver indítása HTTPS-en
httpsServer.listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);

});
