const express = require('express');
const router = express.Router();

// Das Wartezimmer ist eine Liste von Kunden
let wartezimmer = [];
let locked = false;

router.put('/lock', changeLock);

function changeLock(req, res) {
    let newValue = req.body.lock; // {"lock": true/false }

    if(locked !== newValue) {
        locked = newValue;
        res.status(200).end();
    } else {
        res.status(400).end();
    }
}


router.get('/', wartezimmerListe);
router.post('/', personHinzufuegen);

// bei GET wird einfach die gesamte Liste ausgegeben
function wartezimmerListe(req, res) {
    res.json(wartezimmer);
}

function personHinzufuegen(req, res) {
    setTimeout(function() {
        wartezimmer.push(req.body);
        res.status(200).end();
    }, 5);  // Wir verzögern die Antwort um 5ms
}

router.get('/:warteNr', einzelnePersonAnzeigen);
router.delete('/:warteNr', einzelnePersonLoeschen);

function einzelnePersonAnzeigen(req, res) {
    let warteNr = req.params.warteNr;
    console.log("Wartezimmer GET " + warteNr);

    let kunde = wartezimmer[warteNr];
    res.json(kunde);
}

function einzelnePersonLoeschen(req, res) {
    console.log("Wartezimmer DEL " + req.params.warteNr);

    // Wir sind schlampig und löschen immer die erste Person im Array,
    // egal welche Nummer wir erhalten. Damit funktioniert das Array wie eine Queue.
    let kunde = wartezimmer.shift();
    res.json(kunde);
}

module.exports = router;
