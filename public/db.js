let db;


const request = indexedDB.open("budget", 1);
request.onupgradeneeded = function(event) {

    const db = event.target.result;
    db.createObjectStore("pending", { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorcode)
};

function saveRecord(record) {

    const transaction = db.transaction(["pending"], "readwrite");
    const objectStore = transaction.objectStore("pending");
    objectStore.add(record);
}

function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");
    const objectStore = transaction.objectStore("pending");
    const getAll = objectStore.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                    },
                })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const objectStore = transaction.objectStore("pending");
                    objectStore.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);