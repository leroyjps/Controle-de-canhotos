// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-bTz0DZbGVcCPgnn4AL-9AM19xICmkxE",
  authDomain: "controle-de-canhotos.firebaseapp.com",
  projectId: "controle-de-canhotos",
  storageBucket: "controle-de-canhotos.firebasestorage.app",
  messagingSenderId: "991920807018",
  appId: "1:991920807018:web:30bf7cd8fcfad3b4603e13",
  measurementId: "G-EGRVHJQBVE",
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Navegação entre telas
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
}

// Configuração inicial para exibir a tela de login
showScreen("loginScreen");

// Login
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        showScreen("menuScreen");
      })
      .catch((error) => {
        alert("Erro no login: " + error.message);
      });
  });

// Logout
function logout() {
  auth.signOut().then(() => {
    showScreen("loginScreen");
  });
}

// Adicionar Canhoto
document
  .getElementById("receiptForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const invoiceNumber = document.getElementById("invoiceNumber").value;
    const cnpj = document.getElementById("cnpj").value;
    const recipient = document.getElementById("recipient").value;
    const truckPlate = document.getElementById("truckPlate").value;
    const shipmentSelect = document.getElementById("shipmentSelect").value;

    db.collection("receipts")
      .add({
        invoiceNumber,
        cnpj,
        recipient,
        truckPlate,
        shipmentSelect,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        alert("Canhoto salvo com sucesso!");
        showScreen("menuScreen");
      })
      .catch((error) => {
        alert("Erro ao salvar canhoto: " + error.message);
      });
  });

// Carregar Histórico de Canhotos
function loadHistory() {
  db.collection("receipts")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
      const receiptsList = document.getElementById("receiptsList");
      receiptsList.innerHTML = "";
      querySnapshot.forEach((doc) => {
        const receipt = doc.data();
        receiptsList.innerHTML += `
                <div class="receipt">
                    <p><strong>Nota Fiscal:</strong> ${receipt.invoiceNumber}</p>
                    <p><strong>Destinatário:</strong> ${receipt.recipient}</p>
                    <button onclick="viewReceipt('${doc.id}')">Ver Detalhes</button>
                </div>
            `;
      });
    });
}

// Visualizar Canhoto
function viewReceipt(receiptId) {
  db.collection("receipts")
    .doc(receiptId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const receipt = doc.data();
        const receiptDetails = document.getElementById("receiptDetails");
        receiptDetails.innerHTML = `
                <p><strong>Nota Fiscal:</strong> ${receipt.invoiceNumber}</p>
                <p><strong>CNPJ:</strong> ${receipt.cnpj}</p>
                <p><strong>Destinatário:</strong> ${receipt.recipient}</p>
                <p><strong>Placa do Caminhão:</strong> ${receipt.truckPlate}</p>
                <p><strong>Embarque:</strong> ${receipt.shipmentSelect}</p>
            `;
        showScreen("viewerScreen");
      } else {
        alert("Canhoto não encontrado!");
      }
    })
    .catch((error) => {
      alert("Erro ao buscar detalhes: " + error.message);
    });
}

// Inicialização do estado do usuário
auth.onAuthStateChanged((user) => {
  if (user) {
    showScreen("menuScreen");
  } else {
    showScreen("loginScreen");
  }
});

// Navegação com melhorias para compatibilidade
window.addEventListener("load", () => {
  const currentHash = location.hash || "#loginScreen";
  showScreen(currentHash.substring(1));

  document.querySelectorAll("a.nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetScreen = e.target.getAttribute("href").substring(1);
      location.hash = targetScreen;
      showScreen(targetScreen);
    });
  });
});
