const Request = require('request');
const FriseurStatus = require('../routes/friseur').FriseurStatus;

const hostUrl = "http://127.0.0.1:3000";
let kundenId;

// Wir erzeugen eine zufällige Kunden-ID bzw. holen uns die aus der Kommandozeile
for(let i = 0; i < 10; i++) {
    kundenId = process.argv.length < 3 ? 'kunde-' + Math.round(Math.random() * 5000) : process.argv[2];

    console.log("Meine Kunden-ID ist " + kundenId);
    aquireLock();
}


function aquireLock() {
    Request.put({
        url: 'http://127.0.0.1:3000/wartezimmer/lock',
        json: { lock: true }
    }, lockResponse);

    function lockResponse(err, res, body) {
        if(res.statusCode === 200) {
            // Wir schauen uns an, was der Friseur macht
            Request.get({
                url: hostUrl + '/friseur',
                json: true  // damit signalisieren wir, dass die Antwort automatisch als JSON interpretiert werden soll.
            }, friseurAntwort);
        } else {
            setTimeout(aquireLock, 100);
        }
    }
}

function friseurAntwort(error, response, body) {
    if (error) {
        throw error;
    }
    // DEBUG-Ausgabe des Friseurs
    console.log(body);
    let friseur = body;

    if (friseur.status === FriseurStatus.schlafend) {
        friseurAufwecken(friseur);
    } else if (friseur.status === FriseurStatus.schneidend) {
        setTimeout(insWartezimmerGehen, 200);   // wir gehen erst nach 200ms ins Wartezimmer
    } else {
        throw (new Error("unbekannter Friseur-Status"));
    }
}

function friseurAufwecken(friseur) {
    friseur.status = FriseurStatus.schneidend;
    friseur.kunde = kundenId;
    Request.post({
        url: hostUrl + '/friseur',
        json: friseur
    }, logResponse);
}


function insWartezimmerGehen() {

    Request.post({
        url: hostUrl + '/wartezimmer',
        json: {kundenId: kundenId}
    }, logResponse);
}


function logResponse(error, response, body) {
    // nur zur Illustration geben wir die Response aus
    console.log(body);

    // lock freigeben
    Request.put({
        url: 'http://127.0.0.1:3000/wartezimmer/lock',
        json: { lock: false }
    });
}
