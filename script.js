// on va se cree une constante pour la clé du localstorage
const STORAGE_KEY = "dab_account"


// cree des comptes par defauts 
let accounts = [
    { id: 1, name: "Dupont", pin: "1234", balance: 500, history: [] },
    { id: 2, name: "Durand", pin: "0000", balance: 1500, history: [] },

];

// chargement des donnees depuis le localstorage

try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
        accounts = JSON.parse(raw) // permet de transformer la chaine de caractere en tableau / objet 
    }
} catch (e) {
    console.log("Erreur de parsing des données stockées ", e)
}

// fonction pour enregistrer en locale storage 
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

// Reference du DOM
// on recupère ici les elements HTML auxquels on veut acceder depuis le js 

const accountSelect = document.getElementById("accountSelect");
const openLogin = document.getElementById("openLogin");
const session = document.getElementById("session");
const userName = document.getElementById("userName");
const userBalance = document.getElementById("userBalance");
const elHistory = document.getElementById("history");
const btnBalance = document.getElementById("btnBalance");
const btnWithdraw = document.getElementById("btnWithdraw");
const btnDeposit = document.getElementById("btnDeposit");
const btnLogout = document.getElementById("btnLogout");

//variable qui contient le compte actuellement connecte 

let current = null;

// fonction UI
//methode qui permet de remplir la liste select

function populate() {
    accountSelect.innerHTML = ''; // permet de vider la liste 
    accounts.forEach(a => {
        const opt = document.createElement("option") // <option>
        opt.value = a.id; // <option value ="1"></option>
        opt.textContent = `${a.name}(${a.balance}€)` // <option value ="1"> Dupond (500€)</option>
        // une fois que la balise a ete construite il faut l'inserer dans son parent 
        accountSelect.append(opt)
    })
}
populate();


// Evenements : action utilisateur 

// connexion : on demande le pin via prompt()

openLogin.addEventListener("click", () => {
    const id = accountSelect.value; // on recupere l'id de l'utilisateur 
    const acc = accounts.find(x => x.id == id);
    if (!acc) return alert("Compte introuvable")
    // on cree le prompt pour saisir le pin 
    const pin = prompt(`Entrez le PIN pour${acc.name}\n
    (exercice: ${acc.pin})`)
    // on verifie si le pin est ok 
    if (pin === acc.pin) {
        current = acc; // on garde la reference du compte connecte 
        enterSession()
    } else {
        alert("PIN incorect")
    }
})

// enterSession : affichage de l'interface utilisateur connecte 
function enterSession() {

    session.classList.remove("hidden"); //on supprime la classe hidden 
    userName.textContent = current.name;
    userBalance.textContent = current.balance.toFixed(2) + "€"
    renderHistory();
}

// methode pour voir le solde 

btnBalance.addEventListener("click", () => {
    if (!current) return alert("Aucun compte connecté")
    alert(`Solde: ${current.balance.toFixed(2)}€`)

})

// methode pour retirer de l'argent 
btnWithdraw.addEventListener("click", () => {
    if (!current) return alert("aucun compte connecte")
    const s = prompt("Montant a retirer ex(50):")
    const v = Number(s); // convertir les resultats du prompt en integer 
    // validation : present , positif, fond suffisant 
    if (!v || v <= 0) return alert("Montant invalide");
    if (v > current.balance) return alert("Solde insuffisant");

    // on met a jour le solde et l'historique 
    current.balance -= v;
    current.history = current.history || []
    current.history.unshift({ t: `retrait`, amount: -v, when: new Date().toISOString() });
    save();

    // on met a jour l'affichage 

    userBalance.textContent = current.balance.toFixed(2) + "€";
    renderHistory()
    alert("Retrait effectuer avec succes ");
})

// methode pour ajouter de l'argent 

btnDeposit.addEventListener("click", () => {
    if (!current) return alert("aucun compte connecte")
    const s = prompt("Montant a deposer ex(50):")
    const v = Number(s);
    if (!v || v <= 0) return alert("Montant invalide");
    current.balance += v;
    current.history.unshift({ t: `depot`, amount: v, when: new Date().toISOString() })
    save()
    // on met a jour l'affichage
    userBalance.textContent = current.balance.toFixed(2) + "€";
    renderHistory()
    alert("depot effectué avec succes")
})

// Partie affichage historique 
// Méthode pour afficher historique des transactions 

function renderHistory() {
    elHistory.innerHTML = ""; // on vide l'ellement <ul>
    // ternaire 
    const list = (current && current.history) ? current.history : [];
    //             condition 1 et 2         ?(si vrai) : (sinon)
    if (list.length === 0) {
        elHistory.innerHTML = "<li> aucune operation effectué <li>"
        return
    }
    // si j'ai des ellements dans mon tableau history on le parcours les 10 premiers elements
    list.slice(0, 10).map(tx => {
        //on doit creer un element li 
        const li = document.createElement("li");//<li><li>
        li.textContent = `${tx.t} : ${tx.amount}€ - (${new Date(tx.when).toLocaleString()})`
        // injecter li a ses parents 
        elHistory.append(li);
    })
}

//methode pour se deconnecte 

btnLogout.addEventListener("click", () => {
    current = null; // on vide les donnes utilisateur 
    session.classList.add("hidden"); //on remmet la class hidden
})