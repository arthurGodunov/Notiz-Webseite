export { };
import { utils } from './utilities';

var noteList: note[] = JSON.parse(localStorage.getItem('noteList') ?? '[]');
var key = localStorage.getItem('key') ?? '';
var deletedNote: note;
let markOn: Boolean = false;
let delOn: Boolean = false;
let recoverOn: Boolean = false;

type note = {
    id: string;
    title: string;
    text: string;
    createdAt: number;
    updatedAt: number;
    marked: boolean;
};

const elements = {
    h1: utils.$<HTMLHeadingElement>('h1'),
    /*h2: f.$<HTMLHeadingElement>('h2'),
    h3: f.$<HTMLHeadingElement>('h3'),
    h4: f.$<HTMLHeadingElement>('h4'),
    h5: f.$<HTMLHeadingElement>('h5'),*/
    h6: utils.$<HTMLHeadingElement>('h6'),
    noteList: utils.$<HTMLDivElement>('.noteList'),
    noteNew: utils.$<HTMLDivElement>('#newNote'),
    noteDel: utils.$<HTMLDivElement>('#delNote'),
    noteMark: utils.$<HTMLDivElement>('#markNote'),
    noteSearch: utils.$<HTMLInputElement>('#searcher'),
    metaState: utils.$<HTMLDivElement>('.metaInfo'),
    metaText: utils.$<HTMLSpanElement>('.state'),
    noteMenu: {
        menu: utils.$<HTMLDivElement>('.noteMenu'),
        close: utils.$<HTMLButtonElement>('.back'),
        rename: utils.$<HTMLInputElement>('.rename'),
        wordsAmount: utils.$<HTMLSpanElement>('#wordCount'),
        charAmount: utils.$<HTMLSpanElement>('#charCount'),
        mark: utils.$<HTMLButtonElement>('.mark'),
        delete: utils.$<HTMLButtonElement>('.delete'),
        save: utils.$<HTMLButtonElement>('.save'),
    },
    sorters: [utils.$<HTMLLabelElement>('#f-updated'), utils.$<HTMLLabelElement>('#f-created'), utils.$<HTMLLabelElement>('#f-marked'), utils.$<HTMLLabelElement>('#f-title'), utils.$<HTMLLabelElement>('#f-length')],
};

const variables = {
    noteList,
    key,
    TKv: 0,
    currentNoteID: '',
    lastID: noteList.length ?? 0,
    normalState: '',
    letters: [
        ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
        ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
        '!', '?', '.', ',', ';', ':', '-', '_', '(', ')', '[', ']', '{', '}',
        '<', '>', '/', '\\', '|', '@', '#', '$', '%', '^', '&', '*', '+', '=',
        '~', '`', '"', '\'', ' '
    ],
};

const randomSentences = [
    'Schreibe deine Ideen und Gedanken auf',
    'Halte fest, was dir gerade durch den Kopf geht',
    'Notiere deine nächste große Idee',
    'Was willst du nicht vergessen?',
    'Schreib es auf, bevor du es vergisst',
    'Deine Gedanken gehören hier rein',
    'Mach deine Gedanken sichtbar',
    'Halte deine Inspiration fest',
    'Ein kurzer Gedanke kann viel wert sein',
    'Was möchtest du dir merken?',
    'Ideen kommen und gehen - speichere sie hier',
    'Dein Platz für kreative Gedanken',
    'Notiere alles, was wichtig ist',
    'Was geht dir gerade durch den Kopf?',
    'Deine nächste Idee startet hier',
    'Schreibe alles auf, was dir einfällt',
    'Deine Gedanken sind wertvoll - notiere sie',
    'Halte deine kleinen Erfolge fest',
    'Was inspiriert dich gerade?',
    'Jede Idee zählt - fang an zu schreiben',
    'Notiere, was du später umsetzen willst',
    'Lass deine Kreativität frei fließen',
    'Ein Gedanke kann die Welt verändern',
    'Speichere alles, bevor es verschwindet',
    'Deine Notizen sind dein Gedächtnis',
    'Schreibe, bevor du es vergisst',
    'Halte die Funken deiner Inspiration fest',
    'Ideen sind wie Samen - notiere sie',
    'Alles beginnt mit einer kleinen Notiz',
    'Dein Gehirn ist ein Garten - pflanze Gedanken'
];

const randomTitles = [
    'niemand brauch Titel',
    'Benenne mich \'14935\'',
    'lange Titel werden vΞrkü®z†',
    'Kein Brainrot plz',
    'wirst eh Titel vergessen',
    'warum brauchst du es?'
];



async function changeSentence() {
    await utils.sleep(3000);
    while (true) {
        let lastSentence = elements.h6.innerHTML;
        for (let i = elements.h6.innerHTML.length; i > -1; i--) {
            let text: string[] = elements.h6.innerHTML.split('');
            text.splice(i, 1);
            elements.h6.innerHTML = text.join('');
            await utils.sleep(50);
        }
        await utils.sleep(1000);
        let randomSentence = randomSentences[Math.floor(Math.random() * randomSentences.length)];
        while (randomSentence == lastSentence) {
            randomSentence = randomSentences[Math.floor(Math.random() * randomSentences.length)];
        }
        for (let i = 0; i < randomSentence.length; i++) {
            elements.h6.innerHTML += randomSentence[i];
            await utils.sleep(50);
        }
        await utils.sleep(3000);
    };
}

function newNote() {
    const noteObj: note = {
        id: createID(16),
        title: utils.encode('Note ' + (variables.lastID + 1), variables.TKv, variables.letters),
        text: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        marked: false
    };
    variables.noteList.push(noteObj);
    variables.lastID++;
    saveNotes();
    renderNotes(variables.noteList);
}

function saveNotes() {
    localStorage.setItem('noteList', JSON.stringify(variables.noteList));
};

function createID(length: number) {
    let id: string = '';

    for (let i = 0; i < length; i++) {
        id += variables.letters[Math.floor(Math.random() * variables.letters.length)];
    }

    return id;
}

function renderNotes(notes: note[]) {
    elements.noteList.innerHTML = '';
    for (let i = 0; i < notes.length; i++) {
        let noteObj = notes[i];
        let noteCard: HTMLDivElement = document.createElement('div');
        noteCard.classList.add('noteCard');
        let title: HTMLParagraphElement = document.createElement('p');
        title.classList.add('title');
        let note: HTMLDivElement = document.createElement('div');
        note.dataset.id = noteObj.id;
        note.classList.add('note');
        note.contentEditable = 'false';
        note.spellcheck = false
        createMark(noteObj, note);

        let meta: HTMLDivElement = document.createElement('div');
        meta.classList.add('meta');
        title.innerHTML = utils.decode(noteObj.title, variables.TKv, variables.letters);
        let updated: HTMLSpanElement = document.createElement('span');
        updated.classList.add('updated');
        updated.innerHTML = 'Bearbeitet ' + timeAgo(noteObj.updatedAt);
        let created: HTMLSpanElement = document.createElement('span');
        created.classList.add('created');
        created.innerHTML = 'Erstellt am ' + new Date(noteObj.createdAt).toLocaleDateString();

        noteCard.appendChild(title);
        noteCard.appendChild(note);
        noteCard.appendChild(meta);
        meta.appendChild(updated);
        meta.appendChild(created);

        note.dataset.id = noteObj.id;
        elements.noteList.appendChild(noteCard);
    }
}

function timeAgo(date: number) {
    let diff = Date.now() - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'gerade eben';
    if (minutes < 60) return `vor ${minutes} minute${minutes == 1 ? '' : 'n'}`;
    if (hours < 24) return `vor ${hours} Stunde${hours == 1 ? '' : 'n'}`;
    if (days < 7) return `vor ${days} Tag${days == 1 ? '' : 'en'}`;

    return `am ${new Date(date).toLocaleDateString()}`;
};

function createMark(noteObj: note, note: HTMLDivElement) {
    let mark: HTMLDivElement = document.createElement('div');
    mark.classList.add('mark');
    if (noteObj.marked == true) {
        mark.style.animation = 'pin 0s cubic-bezier(.34,1.56,.64,1) forwards';
        mark.classList.add('pin');
    }

    mark.addEventListener('click', (e) => {
        if (!mark.classList.contains('deleter')) {
            e.stopPropagation();
            noteObj.marked = true;
            mark.classList.add('pin');
        } else {
            if (recoverOn == false) {
                switchState('Notiz gelöscht, wiederrufen?', 10000);
                setTimeout(() => recoverOn = false, 10000);
                recoverOn = true;
                e.stopPropagation();
                const index = variables.noteList.indexOf(noteObj);
                deletedNote = variables.noteList[index];
                variables.noteList.splice(index, 1);
                saveNotes();
                renderNotes(variables.noteList);
            }
        }

        saveNotes();
    });

    note.appendChild(mark);
}

function triggerEE(EE: string) {
    //Dass berühmte Rickroll Video:
    if (EE.toLowerCase() == 'rickroll') window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");

    if (EE == '14935') {
        let matrixBg = document.createElement('div');
        matrixBg.classList.add('matrix-bg');
        document.body.appendChild(matrixBg);
        document.body.classList.add('glitch');
        startMatrix();
        setTimeout(() => {
            matrixBg.remove();
            document.body.classList.remove('glitch');
        }, 10000);
    }

    if (EE.toLowerCase() == 'crash') {
        const crash = document.createElement('div');
        crash.style.position = "fixed";
        crash.style.inset = "0";
        crash.style.background = "#000";
        crash.style.color = "#00ff00";
        crash.style.fontFamily = "monospace";
        crash.style.padding = "20px";
        crash.style.zIndex = "99999";

        crash.innerHTML = `
            <h1>Systemfehler</h1>
            <h3>Speicherüberlauf bei 0x0000FF</h3>
            <h6>Alle Notizen werden gelöscht...</h6>
            <p>
            Wiederherstellung nicht möglich.<br>
            Bitte kontaktieren Sie uns nicht:<br>
            ☎️0666 666666<br><br>

            P.S. Warum tust du mir das an?<br><br><br>

            Spaß
            </p>
    `;

        document.body.appendChild(crash);

        setTimeout(() => crash.remove(), 20000);
    }
}

function startMatrix() {
    const container = document.createElement('div');
    container.classList.add('matrix-bg');
    document.body.appendChild(container);

    const chars = variables.letters;

    const interval = setInterval(() => {
        const span = document.createElement('span');
        span.classList.add('matrix-char');
        span.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;

        span.textContent = chars[Math.floor(Math.random() * chars.length)];

        span.style.left = Math.random() * 100 + 'vw';

        span.style.animationDuration = (2 + Math.random() * 3) + 's';

        const rot = (Math.random() * 360 - 180) + 'deg';
        span.style.setProperty('--rot', rot);

        span.style.fontSize = (12 + Math.random() * 14) + 'px';

        container.appendChild(span);

        setTimeout(() => span.remove(), 10000);

    }, 25);

    setTimeout(() => {
        clearInterval(interval);
        container.remove();
    }, 10000);
}

function sortNotes(method: string) {
    switch (method) {
        case 'updated':
            variables.noteList.sort((a, b) => b.updatedAt - a.updatedAt);
            break;

        case 'created':
            variables.noteList.sort((a, b) => a.createdAt - b.createdAt);
            break;

        case 'marked':
            variables.noteList.sort((a, b) => Number(b.marked) - Number(a.marked));
            break;

        case 'title':
            variables.noteList.sort((a, b) => a.title.localeCompare(b.title, 'de'));
            break;

        case 'length':
            variables.noteList.sort((a, b) => utils.decode(b.text, variables.TKv, variables.letters).length - utils.decode(a.text, variables.TKv, variables.letters).length);
            break;
    }
    renderNotes(variables.noteList);
    saveNotes();
};

function openNote(note: HTMLDivElement, noteObj: note) {
    if (!note.classList.contains('animate')) {
        note.classList.add('animate');
        switchState('Notiz wird geladen...', 1500);
        if (markOn == true) {
            markOn = false;
            elements.noteMark.click();
        }
        elements.noteMenu.wordsAmount.textContent = noteObj.text.length != 0 ? `${utils.decode(noteObj.text, variables.TKv, variables.letters).trim().split(/\s+/).length}` : '0';
        elements.noteMenu.charAmount.textContent = `${utils.decode(noteObj.text, variables.TKv, variables.letters).trim().length}`;
        let title: string;
        if (Math.random() < 0.5) {
            title = 'Ahlelele Ahlelas...';
        } else {
            title = randomTitles[Math.floor(Math.random() * randomTitles.length)];
        }
        elements.noteMenu.rename.placeholder = title;
        elements.noteMenu.rename.value = utils.decode(noteObj.title, variables.TKv, variables.letters);
        setTimeout(() => note.innerHTML = utils.decode(noteObj.text, variables.TKv, variables.letters), 1150);
    }

    note.contentEditable = 'true';

    setTimeout(() => {
        elements.metaState.style.bottom = '20px';
        elements.noteMenu.menu.classList.remove('hidden');
        elements.noteMenu.close.onclick = () => {
            switchState('Notiz wird geschlossen...', 750);
            elements.metaState.style.bottom = '112.5px';
            note.contentEditable = 'false';
            note.classList.remove('animate');
            elements.noteMenu.menu.classList.add('hidden');
            noteObj.text = utils.encode(note.innerHTML, variables.TKv, variables.letters);
            note.innerHTML = '';
            let mark: HTMLDivElement = document.createElement('div');
            createMark(noteObj, note);
            saveNotes();
        };
    }, 1150);

    let savingTime = setTimeout(() => { });
    let metaDataTime = setTimeout(() => { });

    note.onkeydown = (e) => {
        clearTimeout(savingTime);
        clearTimeout(metaDataTime);

        savingTime = setTimeout(() => {
            noteObj.text = utils.encode(note.textContent, variables.TKv, variables.letters);
            noteObj.updatedAt = Date.now();
            note.closest('.noteCard')!.querySelector('.updated')!.textContent = 'Bearbeitet: ' + timeAgo(noteObj.updatedAt);
            saveNotes();
        }, 500);

        metaDataTime = setTimeout(() => {
            elements.noteMenu.wordsAmount.textContent = note.textContent.length != 0 ? `${note.textContent.trim().split(/\s+/).length}` : '0';
            elements.noteMenu.charAmount.textContent = `${note.textContent.trim().length}`;
        }, 50);

    };

    elements.noteMenu.rename.onkeydown = (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            noteObj.title = utils.encode(elements.noteMenu.rename.value, variables.TKv, variables.letters);
            note.closest('.title')!.textContent = utils.decode(noteObj.title, variables.TKv, variables.letters);
            saveNotes();
        }
    };

    elements.noteMenu.rename.onblur = () => {
        noteObj.title = utils.encode(elements.noteMenu.rename.value, variables.TKv, variables.letters);
        note.closest('.noteCard')!.querySelector('.title')!.innerHTML = utils.decode(noteObj.title, variables.TKv, variables.letters);
        triggerEE(utils.decode(noteObj.title, variables.TKv, variables.letters));
        saveNotes();
    };
}

function getNote(noteID: string) {
    let noteObj = variables.noteList.find(n => n.id == noteID);

    if (!noteObj) return;
    return noteObj;
};

function switchState(state: string, ms: number) {
    elements.metaState.style.transform = 'scale(1)';
    setTimeout(() => elements.metaState.style.maxWidth = '250px', 250);
    elements.metaText.textContent = state;

    setTimeout(() => {
        elements.metaState.style.maxWidth = '0px';
        setTimeout(() => {
            elements.metaText.textContent = '';
            elements.metaState.style.transform = 'scale(0)';
        }, 700);
    }, ms);
}



elements.noteList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const note = target.closest('.note') as HTMLDivElement;
    if (!note) return;

    variables.currentNoteID = note.dataset.id ?? '';
    const noteObj: note | undefined = variables.noteList.find(n => n.id === variables.currentNoteID);

    if (!noteObj) return;

    openNote(note, noteObj);
});

elements.noteNew.addEventListener('click', () => newNote());

document.addEventListener('DOMContentLoaded', () => {
    renderNotes(variables.noteList);
    switchState('wird geladen...', 1500);
});

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() == 'r') {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    }
});

elements.noteMark.addEventListener('click', () => {
    const marklist: NodeListOf<HTMLDivElement> = document.querySelectorAll('.mark');
    markOn == true ? markOn = false : markOn = true;

    markOn == true ? marklist.forEach(mark => mark.style.display = 'flex') : marklist.forEach(mark => mark.style.display = 'none');
});

elements.noteDel.addEventListener('click', () => {
    const dangeredNotes: NodeListOf<HTMLDivElement> = document.querySelectorAll('.note');
    const delbutton: NodeListOf<HTMLDivElement> = document.querySelectorAll('.mark');

    if (delOn == false) {
        dangeredNotes.forEach(note => note.classList.add('dangered'));

        delbutton.forEach(button => {
            button.classList.add('deleter');
            button.style.display = 'flex';
            button.textContent = '✖';
        });
        delOn = true;
    } else {
        dangeredNotes.forEach(note => note.classList.remove('dangered'));

        delbutton.forEach(button => {
            button.classList.remove('deleter');
            button.style.display = 'none';
            button.textContent = '';
        });
        delOn = false;
    }
});

elements.noteSearch.addEventListener('input', () => {
    const value = elements.noteSearch.value.toLowerCase();
    const filtered = variables.noteList.filter(n => utils.decode(n.title, variables.TKv, variables.letters).toLowerCase().includes(value));
    renderNotes(filtered);
});

elements.noteMenu.mark.addEventListener('click', () => {
    let noteObj = getNote(variables.currentNoteID);
    variables.noteList[variables.noteList.indexOf(noteObj!)].marked = true;
    saveNotes();
});

elements.noteMenu.delete.addEventListener('click', () => {
    let noteObj = getNote(variables.currentNoteID);
    variables.noteList.splice(variables.noteList.indexOf(noteObj!), 1);
});

elements.noteMenu.save.addEventListener('click', () => {
    let noteObj = getNote(variables.currentNoteID);
    noteObj = variables.noteList[variables.noteList.indexOf(noteObj!)];
    let note = document.querySelector(`.note[data-id = '${variables.currentNoteID}']`);

    if (!note) return;

    switchState('wird gespeichert...', 750);
    noteObj.text = utils.encode(note.textContent, variables.TKv, variables.letters);
    noteObj.updatedAt = Date.now();
    note.closest('.noteCard')!.querySelector('.updated')!.textContent = 'Bearbeitet: ' + timeAgo(noteObj.updatedAt);
    elements.noteMenu.wordsAmount.textContent = note.textContent.length != 0 ? `${note.textContent.trim().split(/\s+/).length}` : '0';
    elements.noteMenu.charAmount.textContent = `${note.textContent.trim().length}`;
    saveNotes();
});

elements.metaState.addEventListener('click', () => {
    if (recoverOn == true) {
        const index = variables.noteList.indexOf(deletedNote);
        recoverOn = false;
        variables.noteList.splice(index, 0, deletedNote);
        switchState('Prozess wiedergeruft!', 1500);
        saveNotes();
        renderNotes(variables.noteList);
    }
});



elements.h6.innerHTML = randomSentences[Math.floor(Math.random() * randomSentences.length)];
changeSentence();

if (variables.key == '') {
    for (let i = 0; i < 64; i++) {
        variables.key += variables.letters[Math.floor(Math.random() * variables.letters.length)];
    }
    localStorage.setItem('key', variables.key);
}
let TKvArr = [];
for (let i = 0; i < variables.key.length; i++) {
    let letter = variables.key[i];
    TKvArr.push(variables.letters.indexOf(letter));
}
variables.TKv = Math.abs(TKvArr.reduce((val, indexVal) => (val * 16 + indexVal) | 0, 0));

elements.sorters.forEach(sorter => {
    sorter.addEventListener('click', () => {
        let method: string = sorter.id.replace('f-', '');

        sortNotes(method);
    });
});

elements.sorters[0].click();
