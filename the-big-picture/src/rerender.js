/* eslint-disable max-len */
/* eslint-disable no-alert */
/* eslint-disable no-case-declarations */
/* eslint-disable no-console */ //TODO: probably remove this
/* eslint-disable eqeqeq */
const sqlite3 = require('sqlite3').verbose();

let nextActorId;
let nextDirectorId;
let nextMovieId;

/**
 * TODO: likely delete this, mostly for testing
 * @param {SQL} query - SQL String
 */
function queryDatabase(query) {
    const db = new sqlite3.Database('./database/theBigPicture.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the  database.');
    });

    console.log(query);

    db.serialize(() => {
        db.each(query, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            console.log(row);
        });
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}

/**
 * Exectues a callback on the database
 * If insert == true, callback is at the end, otherwise it is on each row.
 */
function callbackOnDatabase(query, callback, insert) {
    const db = new sqlite3.Database('./database/theBigPicture.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the  database.');
    });

    //TODO: delete
    console.log(query);

    db.serialize(() => {
        db.each(query, (err, row) => {
            if (err) {
                console.error(err.message);
            }
            callback(row);
        });
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Close the database connection.');
    });

    if (insert) {
        callback();
    }
}

function getNextActorID() {
    const query = 'SELECT id FROM Actor ORDER BY id desc LIMIT 1';
    callbackOnDatabase(query, (row) => {
        nextActorId = row.id + 1;
    });
}

function getNextDirectorID() {
    const query = 'SELECT id FROM Director ORDER BY id desc LIMIT 1';
    callbackOnDatabase(query, (row) => {
        nextDirectorId = row.id + 1;
    });
}

function getNextMovieID() {
    const query = 'SELECT id FROM Movie ORDER BY id desc LIMIT 1';
    callbackOnDatabase(query, (row) => {
        nextMovieId = row.id + 1;
    });
}

getNextActorID();
getNextDirectorID();
getNextMovieID();

/* Main Menu View */
const mainMenuDiv = document.getElementsByClassName('main-menu')[0];
const findMovieButton = document.getElementById('find-a-movie-button');
const addMovieButton = document.getElementById('add-a-movie-button');

/* Find / Add View */
const findMovieDiv = document.getElementsByClassName('find-a-movie')[0];
const findAddTitle = document.getElementById('find/add-title');
const findAddbutton = document.getElementById('find/add-button');

/* View Movie Content */
const movieView = document.getElementById('movie-view');
const movieBack = document.getElementById('movie-back');

/* Edit Functionality */
const edit = document.getElementById('edit');
const editableItems = document.getElementsByClassName('edit-item');
const saveButton = document.getElementById('save');

/* Overlay Specific Code */
const shield = document.getElementById('shield');

/* Shared */
const backButton = document.getElementById('back');

backButton.addEventListener('click', () => {
    cleanupMovieView();
    movieView.classList.add('hide');
    findMovieDiv.classList.add('hide');
    mainMenuDiv.classList.remove('hide');
});

/* Actor / Director Search */
const searchCancel = document.getElementById('search-cancel');
const searchActor = document.getElementById('search-actor');
const searchDirector = document.getElementById('search-director');
const search = document.getElementById('search');
const searchPopup = document.getElementById('search-view');

/* Actor / Director Results */
const searchResultsDiv = document.getElementById('search-results');
//const searchResults = document.getElementsByClassName('result');

/* Reviews */
const closeReview = document.getElementById('close-review');
const saveReview = document.getElementById('save-review');
const reviewEditor = document.getElementById('review-editor');

/**
 * Function to return from the movie view to the find movie view
 */
function returnToFindMovie() {
    movieView.classList.add('hide');
    findMovieDiv.classList.remove('hide');
}

/**
 * Shows the find movie screen
 */
function showFindMovie() {
    mainMenuDiv.classList.add('hide');
    findAddTitle.innerText = 'Find a Movie';
    findAddbutton.innerText = 'Find';
    findMovieDiv.classList.remove('hide');
}

/**
 * Shows the add movie screen
 */
function showAddMovie() {
    mainMenuDiv.classList.add('hide');
    findAddTitle.innerText = 'Add a Movie';
    findAddbutton.innerText = 'Add';
    findMovieDiv.classList.remove('hide');
}

/**
 * Enables the editable items to be edited
 */
function enableEditableItems() {
    for (let i = 0; i < editableItems.length; i++) {
        editableItems[i].readOnly = false;
    }
    Array.from(document.getElementsByClassName('edit-list')).forEach((element) => {
        element.setAttribute('contenteditable', true);
    });
    saveButton.classList.remove('hide');
    edit.classList.add('hide');
}

/**
 * Disables the editable items
 */
function disableEditableItems() {
    for (let i = 0; i < editableItems.length; i++) {
        editableItems[i].readOnly = true;
    }
    Array.from(document.getElementsByClassName('edit-list')).forEach((element) => {
        element.setAttribute('contenteditable', false);
    });
    saveButton.classList.add('hide');
    edit.classList.remove('hide');
}

/**
 * Hides the shield from the DOM
 */
function hideShield() {
    shield.classList.add('hide');
}

/**
 * Throws up the shield overlay
 */
function showSheild() {
    shield.classList.remove('hide');
}

/* Functions for search view */
function hideSearchResults() {
    document.getElementById('search-res-container').classList.add('hide');
}
function showSearchResults() {
    document.getElementById('search-res-container').classList.remove('hide');
}
function showSearchPopup(type) {
    searchPopup.firstElementChild.innerText = (type == 'actor') ? 'Search Actor / Actress' : 'Search Director';
    searchPopup.classList.remove('hide');
}
function hideSearchPopup() {
    searchPopup.classList.add('hide');
}

/* Functions for review editor */
function showReviewEditor() {
    showSheild();
    reviewEditor.classList.remove('hide');
    console.log(this);
    const query = `SELECT Review.id, Review.content FROM Review WHERE review.id = ${this.dataset.id}`;
    callbackOnDatabase(query, (review) => {
        document.getElementById('review-content').value = review.content;
        document.getElementById('review-content').dataset.id = review.id;
    });
}

/**
 * Hides the review editor and performs teardown actions
 */
function hideReviewEditor() {
    reviewEditor.classList.add('hide');
    //document.getElementById('review-content').value = '';
    document.getElementById('review-content').removeAttribute('data-id');
    document.getElementById('review-content').removeAttribute('data-edited');
    hideShield();
}

/**
 * Reusable object for the criteria of a query
 */
const criteria = {
    title: '',
    releaseDate: '',
    runtime: '',
    rating: '',
    ratingOperator: '',
    actorName: '',
    actorId: '',
    dirctorName: '',
    directorId: '',
    reviewString: '',
};
/**
 * Function to take input criteria and convert to an object
 */
function getSearchCriteria() {
    criteria.ratingOperator = document.getElementById('select').value;
    if (criteria.ratingOperator == '') {
        criteria.ratingOperator = '=';
    }
    Array.from(document.getElementsByClassName('criteria')).forEach((element) => {
        switch (element.name) {
        case 'title':
            criteria.title = element.value;
            break;
        case 'releaseDate':
            criteria.releaseDate = element.value;
            break;
        case 'runtime':
            criteria.runtime = element.value;
            break;
        case 'rating':
            criteria.rating = element.value;
            break;
        case 'actor':
            if (element.hasAttribute('data-id')) {
                criteria.actorId = element.dataset.id;
                criteria.actorName = '';
            }
            else {
                criteria.actorId = '';
                criteria.actorName = element.value;
            }
            break;
        case 'review-string':
            criteria.reviewString = element.value;
            break;
        case 'director':
            if (element.hasAttribute('data-id')) {
                criteria.directorId = element.dataset.id;
                criteria.dirctorName = '';
            }
            else {
                criteria.directorId = '';
                criteria.directorName = element.value;
            }
            break;
        default:
        }
    });
}

/**
 * Parses the searchCriteria object into a SQL query
 * @returns SQL Query String
 */
function parseMovieCriteria() {
    let query = 'SELECT id, title, releaseDate, rating, runtime, info FROM Movie';
    if (criteria.actorId != '') {
        query += ' INNER JOIN StarsIn ON mID = Movie.id';
    }
    else if (criteria.actorName != '') {
        query += ` INNER JOIN (SELECT Actor.name, mID FROM StarsIn INNER JOIN Actor ON StarsIn.aID = Actor.id WHERE Actor.name LIKE "%${criteria.actorName}%") ON mID = Movie.id`;
    }
    if (criteria.directorId != '') {
        query += ' INNER JOIN Directs ON mID = Movie.id';
    }
    else if (criteria.directorName != '') {
        query += ` INNER JOIN (SELECT Director.name, mID FROM Directs INNER JOIN Director ON Directs.dID = Director.id WHERE Director.name LIKE "%${criteria.directorName}%") ON mID = Movie.id`;
    }
    if (criteria.reviewString != '') {
        query += ` INNER JOIN (SELECT Review.content, mID FROM Review INNER JOIN Describes ON Describes.rID = Review.id WHERE Review.content LIKE "%${criteria.reviewString}%") ON mID = Movie.id`;
    }
    let whereClause = '';
    if (criteria.title != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        if (criteria.title.length < 3) {
            whereClause += ` Movie.title LIKE '${criteria.title}%'`;
        }
        else {
            whereClause += ` Movie.title LIKE '%${criteria.title}%'`;
        }
    }
    if (criteria.releaseDate != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        whereClause += ` strftime("%Y",Movie.releaseDate) = "${criteria.releaseDate}"`;
    }
    if (criteria.runtime != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        whereClause += ` Movie.runtime = ${criteria.runtime}`;
    }
    if (criteria.rating != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        whereClause += ` Movie.rating ${criteria.ratingOperator} ${criteria.rating} AND Movie.rating != ''`;
    }
    if (criteria.directorId != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        whereClause += ` dID = ${criteria.directorId}`;
    }
    if (criteria.actorId != '') {
        whereClause += whereClause.includes('WHERE') ? ' AND' : ' WHERE';
        whereClause += ` aID = ${criteria.actorId}`;
    }
    const res = (whereClause != '') ? query += whereClause : query;
    return res;
}

/**
 * Conversts a string of HTML into a true DOM element
 * @param {} html - string of HTML
 * @returns DOM element
 */
function htmlToElement(html) {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.firstChild;
}

/**
 * Generates a result view of the movies returned from the search
 * @param {Movie Object} movie - ID and Name
 * @returns the html string for the movie result
 */
function generateMovieResultTemplate(movie) {
    return `<div class="result" data-id="${movie.id}">
                <span>${movie.title} - ${movie.releaseDate}</span>
            </div>`;
}

function generateReviewTemplate(review) {
    return `<div class="review" data-id=${review.id} id="review-${review.id}">${review.content}</div>`;
}

function addIndividualReview(review) {
    const child = htmlToElement(generateReviewTemplate(review));
    child.addEventListener('click', showReviewEditor);
    document.getElementById('review-list').appendChild(child);
}

/**
 * Adds the reviews to the screen
 * @param {movie object} movie - movie to find reviews for
 */
function addReviews(movie) {
    const query = `SELECT review.id, review.content FROM review INNER JOIN Describes on review.id = rID where mID = ${movie.id} LIMIT 100`;
    callbackOnDatabase(query, addIndividualReview);
}

/**
 * Generates a html element for actor or director
 * @param {object} record - name and id
 * @returns html string
 */
function generateActorListItem(record, type) {
    return `<li contenteditable="false" class="edit-list" data-id=${record.id} data-type="${type}">${record.name}</li>`;
}

function displayContentEditableResults(searchName, type) {
    showSheild();
    showSearchResults();
    // eslint-disable-next-line no-use-before-define
    populateActorDirectorResults(searchName, type);
}

// eslint-disable-next-line no-unused-vars
let activeContentEditableItem = null;

/**
 * Adds the actor to the actor-list
 * @param {object} actor - the actor to add
 */
function addActor(actor) {
    const child = htmlToElement(generateActorListItem(actor, 'actor'));
    child.addEventListener('focusout', (e) => {
        activeContentEditableItem = e.target;
        displayContentEditableResults(e.target.innerText, 'actor');
    });
    child.addEventListener('keypress', (e) => {
        if (e.which == '13') {
            activeContentEditableItem = e.target;
            e.preventDefault();
            displayContentEditableResults(e.target.innerText, 'actor');
        }
    });
    child.addEventListener('contextmenu', (e) => {
        if (confirm(`Delete ${e.target.innerText}?`)) {
            const starsInQuery = `DELETE FROM StarsIn WHERE aID = ${e.target.dataset.id} AND mID = ${document.getElementById('movie-view').dataset.id}`;
            e.target.remove();
            queryDatabase(starsInQuery);
        }
    });
    document.getElementById('actor-list').appendChild(child);
    return child;
}

/**
 * Queries the actors based on a movie and adds them to the DOM
 * @param {int} movieID - movie ID
 */
function queryActorsFromMovie(movieID) {
    const query = `SELECT Actor.name, Actor.id
                    FROM StarsIn
                    INNER JOIN Actor ON Actor.id = StarsIn.aID
                    WHERE mID = ${movieID}`;
    callbackOnDatabase(query, addActor);
}

/**
 * Adds the director's name to the director list
 * @param {object} director - the director to add
 */
function addDirector(director) {
    //TODO: figure out how to update when this changes
    //probably should have ID here to remove it from directs on change

    const child = htmlToElement(generateActorListItem(director, 'director'));
    child.addEventListener('focusout', (e) => {
        activeContentEditableItem = e.target;
        displayContentEditableResults(e.target.innerText, 'director');
    });
    child.addEventListener('keypress', (e) => {
        if (e.which == '13') {
            activeContentEditableItem = e.target;
            e.preventDefault();
            displayContentEditableResults(e.target.innerText, 'director');
        }
    });
    child.addEventListener('contextmenu', (e) => {
        if (confirm(`Delete ${e.target.innerText}?`)) {
            const directsQuery = `DELETE FROM Directs WHERE dID = ${e.target.dataset.id} AND mID = ${document.getElementById('movie-view').dataset.id}`;
            e.target.remove();
            queryDatabase(directsQuery);
        }
    });
    document.getElementById('director-list').appendChild(child);
}

/**
 * Queries the director given a movie's ID
 * @param {int} movieID - the movie's ID
 */
function queryDirectorFromMovie(movieID) {
    const query = `SELECT Director.name, Director.id FROM Directs
                    INNER JOIN Director ON Director.id = dID
                    WHERE mID = ${movieID}`;
    callbackOnDatabase(query, addDirector); // TODO: consider multiple directors
}

/**
 * Configures the movie view based on the content returned from the query
 * @param {object} movie - movie object
 */
function setMovieViewContent(movie) {
    // data from initial query
    console.log(movie);
    document.getElementById('movie-title').innerText = movie.title;
    document.getElementById('rating-view').value = movie.rating;
    document.getElementById('runtime-edit').value = movie.runtime;
    document.getElementById('releaseDate-movie').value = `${movie.releaseDate}`;
    document.getElementById('info').value = movie.info;
    document.getElementById('movie-view').dataset.id = movie.id;

    // get directors
    queryDirectorFromMovie(movie.id);

    // get actors/actresses
    queryActorsFromMovie(movie.id);

    // get reviews'
    addReviews(movie);
}

/**
 * Adds movie results to the results view for the user to choose
 * @param {object} movie - movie object
 */
function addMovieResults(movie) {
    const child = htmlToElement(generateMovieResultTemplate(movie)); // create element

    child.addEventListener('click', () => { // add event listener to element
        hideSearchResults();
        hideShield();
        findMovieDiv.classList.add('hide'); // hide the find movie div that's under the shield
        movieView.classList.remove('hide'); // expose the movie view

        // remove all nodes once one is clicked
        Array.from(document.getElementsByClassName('result')).forEach((element) => {
            element.remove();
        });

        // set the values in the Movie View
        setMovieViewContent(movie);
    });
    searchResultsDiv.appendChild(child); // finally add this to the div
}

/**
 * Generates the appropriate Actor query
 * @param {string} name - name to search for
 * @returns the string SQL query
 */
function queryActor(name) {
    let query = 'SELECT Actor.id, Actor.name FROM Actor ';
    const rating = document.getElementById('rating').value;
    if (rating != '') {
        query += `INNER JOIN StarsIn ON aID = Actor.id INNER JOIN Movie ON mID = Movie.id WHERE Movie.rating ${document.getElementById('select').value} ${rating} AND Movie.rating != ''`;
    }
    if (name != '') {
        query += (query.includes('WHERE')) ? ' AND ' : ' WHERE ';
        query += `Actor.name LIKE '%${name}%'`;
    }
    return query;
}

/**
 * Generates the appropriate Director query
 * @param {string} name - name to search for
 * @returns the string SQL query
 */
function queryDirector(name) {
    let query = 'SELECT Director.id, Director.name FROM Director ';
    const rating = document.getElementById('rating').value;
    if (rating != '') {
        query += `INNER JOIN Directs ON dID = Director.id INNER JOIN Movie ON mID = Movie.id WHERE Movie.rating ${document.getElementById('select').value} ${rating}`;
    }
    if (name != '') {
        query += (query.includes('WHERE')) ? ' AND ' : ' WHERE ';
        query += `Director.name LIKE '%${name}%'`;
    }
    return query;
}

/**
 * Crates a template for a search result from Actor and Director
 * @param {needs ID and Name} record - record from the SQL table
 * @returns The string of HTML
 */
function generateSearchTemplate(record) {
    return `<div class="result" data-id="${record.id}">
                <span>${record.name}</span>
            </div>`;
}

/**
 * Adds results from Actor search
 * @param {id: "", name: ""} row - row of the table
 */
function addActorResult(row) {
    const child = htmlToElement(generateSearchTemplate(row)); // create element

    child.addEventListener('click', () => { // add event listener to element
        hideSearchResults();
        hideShield();

        // remove all nodes once one is clicked
        Array.from(document.getElementsByClassName('result')).forEach((element) => {
            element.remove();
        });

        if (document.getElementById('movie-view').hasAttribute('data-id') == true) {
            if (activeContentEditableItem != null && activeContentEditableItem.hasAttribute('data-id') && activeContentEditableItem.dataset.id != row.id) {
                activeContentEditableItem.dataset.edit = true;
                if (activeContentEditableItem.hasAttribute('data-removed') == false) {
                    activeContentEditableItem.dataset.removed = activeContentEditableItem.dataset.id;
                }
            }
            else { // new actor
                if (!confirm(`Would you like to create new Actor: ${row.name}?`)) {
                    return;
                }
                activeContentEditableItem = addActor(row);
                const actorQuery = `INSERT INTO Actor (id, name) VALUES (${row.id}, "${row.name}")`;
                const StarsInQuery = `INSERT INTO StarsIn (aID, mID) VALUES (${nextActorId}, ${document.getElementById('movie-view').dataset.id})`;
                queryDatabase(actorQuery);
                queryDatabase(StarsInQuery);
                nextActorId++;
            }
            activeContentEditableItem.innerText = row.name;
            activeContentEditableItem.dataset.id = row.id;
        }
        else {
            const inputNode = document.getElementById('actor');
            inputNode.value = row.name;
            inputNode.dataset.id = row.id; // add a data attribute
            // TODO: clear this if the value is changed / cleared
        }
        document.getElementById('search-input').value = ''; // clear search input
    });
    searchResultsDiv.appendChild(child); // finally add this to the div
}

/**
 * Adds results from Director search
 * @param {id: "", name: ""} row - row of the table
 */
function addDirectorResult(row) {
    const child = htmlToElement(generateSearchTemplate(row)); // create element

    child.addEventListener('click', () => { // add event listener to element
        hideSearchResults();
        hideShield();

        // remove all nodes once one is clicked
        Array.from(document.getElementsByClassName('result')).forEach((element) => {
            element.remove();
        });

        // set the value in the find view
        if (document.getElementById('movie-view').hasAttribute('data-id') == true) {
            if (activeContentEditableItem != null && activeContentEditableItem.hasAttribute('data-id') && activeContentEditableItem.dataset.id != row.id) {
                activeContentEditableItem.dataset.edit = true;
                if (activeContentEditableItem.hasAttribute('data-removed') == false) {
                    activeContentEditableItem.dataset.removed = activeContentEditableItem.dataset.id;
                }
            }
            else { // new director
                if (!confirm(`Would you like to create new Director: ${row.name}?`)) {
                    return;
                }
                activeContentEditableItem = addDirector(row);
                const directorQuery = `INSERT INTO Director (id, name) VALUES (${row.id}, "${row.name}")`;
                const directsQuery = `INSERT INTO Directs (dID, mID) VALUES (${nextDirectorId}, ${document.getElementById('movie-view').dataset.id})`;
                queryDatabase(directorQuery);
                queryDatabase(directsQuery);
                nextDirectorId++;
            }
            activeContentEditableItem.innerText = row.name;
            activeContentEditableItem.dataset.id = row.id;
        }
        else {
            const inputNode = document.getElementById('director');
            inputNode.value = row.name;
            inputNode.dataset.id = row.id; // add a data attribute
        }
        document.getElementById('search-input').value = ''; // clear search input
    });
    searchResultsDiv.appendChild(child); // finally add this to the div
}

/**
 * Adds the new movie to the database
 */
function addMovieToDatabase() { //TODO: actually file to the database
    getSearchCriteria();
    console.log('Adding Movie');
    console.log(criteria);
    const insertQuery = `INSERT INTO Movie (id, title, releaseDate, runtime, rating, count) VALUES(${nextMovieId}, "${criteria.title}", "${criteria.releaseDate}", ${criteria.runtime}, ${criteria.rating}, 1)`;
    queryDatabase(insertQuery);
    // actors
    queryDatabase(`INSERT INTO Directs (dID, mID) VALUES (${criteria.directorId}, ${nextMovieId})`);
    // directors
    queryDatabase(`INSERT INTO StarsIn (aID, mID) VALUES (${criteria.actorId}, ${nextMovieId})`);
    const movie = {
        id: nextMovieId,
        title: criteria.title,
        releaseDate: criteria.releaseDate,
        runtime: criteria.runtime,
        rating: criteria.rating,
    };
    nextMovieId++;
    findMovieDiv.classList.add('hide');
    document.getElementById('movie-view').classList.remove('hide');
    setTimeout(() => {
        setMovieViewContent(movie);
    }, 1000);
}

/**
 * Validates the add criteria for a movie
 * @returns the text for an alert message, no text means we're good
 */
// TODO: add more criteria
function validateAddMovieCriteria() {
    let text = '';
    getSearchCriteria();
    if (criteria.title == '') {
        text += 'Missing A Title \n';
    }
    return text;
}


/* Bind find button */
// TODO: This is for find, need to do the same for add
findAddbutton.addEventListener('click', () => {
    switch (document.getElementById('find-a-movie').dataset.type) {
    case 'add':
        const text = validateAddMovieCriteria();
        if (text == '') {
            addMovieToDatabase();
        }
        else {
            alert(text);
        }
        break;
    default:
        getSearchCriteria();
        callbackOnDatabase(parseMovieCriteria(), addMovieResults);
        showSheild();
        showSearchResults();
        break;
    }
});

function populateActorDirectorResults(name, type) {
    switch (type) {
    case 'actor':
        addActorResult({ id: nextActorId, name });
        callbackOnDatabase(queryActor(name), addActorResult);
        break;
    default:
        addDirectorResult({ id: nextDirectorId, name });
        callbackOnDatabase(queryDirector(name), addDirectorResult);
    }
}

/* Bind the search button for Actor/Director search */
search.addEventListener('click', () => {
    const name = document.getElementById('search-input').value;
    populateActorDirectorResults(name, search.dataset.type);
    hideSearchPopup();
    showSearchResults();
});

/* Bind the Find Actor button */
searchActor.addEventListener('click', () => {
    showSheild();
    const val = document.getElementById('actor').value;
    if (val != '') {
        callbackOnDatabase(queryActor(val), addActorResult);
        showSearchResults();
    }
    else {
        showSearchPopup('actor');
        search.dataset.type = 'actor'; // used by search button to determine which query to run
    }
});

/* Bind the Find Director button */
searchDirector.addEventListener('click', () => {
    showSheild();
    const val = document.getElementById('director').value;
    if (val != '') {
        callbackOnDatabase(queryDirector(val), addDirectorResult);
        showSearchResults();
    }
    else {
        showSearchPopup('director');
        search.dataset.type = 'director'; // used by search button to determine which query to run
    }
});

// Cleanup the id if the user changes the name of the director
document.getElementById('director').addEventListener('input', (e) => {
    if (e.target.dataset.id != null) {
        e.target.removeAttribute('data-id'); // if the user changes the value, don't keep the ID
    }
});

// Cleanup the id if the user changes the name of the actor
document.getElementById('actor').addEventListener('input', (e) => {
    if (e.target.dataset.id != null) {
        e.target.removeAttribute('data-id'); // if the user changes the value, don't keep the ID
    }
});

/* Bind the close button */
closeReview.addEventListener('click', hideReviewEditor);

/**
 * Handle updating a review as a callback from the database
 */
function handleReviewUpdates() {
    const searchContent = document.getElementById('review-content').value;
    const query = `SELECT id FROM Review WHERE content = "${searchContent}" ORDER BY id DESC LIMIT 1`;
    document.getElementById('review-content').value = '';

    callbackOnDatabase(query, (review) => { // second callback since insert has a poor callback function
        // add to the describes database
        const movieID = document.getElementById('movie-view').dataset.id;

        callbackOnDatabase(`INSERT INTO Describes (mID, rID) VALUES (${movieID}, ${review.id})`, (row) => {
            console.log(row);
        }, true);
        // update the review ID on the view
        document.getElementById('review-xxx').dataset.id = review.id;
        document.getElementById('review-xxx').id = `review-${review.id}`;
    });
}

/**
 * Adds the new review to the database and updates the view
 * @param {review object} review - object holding review contents
 */
function commitNewReviewToDatabase(review) {
    const insertQuery = `INSERT INTO Review (content) VALUES ("${review.content}")`;
    callbackOnDatabase(insertQuery, () => {

    }, true);
    setTimeout(() => {
    // unfortunately sqlite 3.2 doesn't support return from an insert so let's just add a delay here
        handleReviewUpdates();
    }, 3000);
}

/**
 * Saves the content of the review
 */
function saveReviewContent() {
    const review = document.getElementById('review-content');
    if (review.hasAttribute('data-id')) { // is existing review
        if (review.dataset.edit == 'true') { // update the review
            const query = `UPDATE Review SET content = "${review.value}" WHERE id = ${review.dataset.id}`;
            queryDatabase(query);

            // make it so we can get the element easily with an id
            document.getElementById(`review-${review.dataset.id}`).innerText = review.value;
        }
    }
    else { // new review
        // using 'xxx' here so that we can easily find it in the callback
        const content = { id: 'xxx', content: review.value };
        addIndividualReview(content);
        commitNewReviewToDatabase(content);
    }
    hideReviewEditor();
}

/* Bind the save button */
saveReview.addEventListener('click', saveReviewContent);

/**
 * Clean up the movie view so things don't bleed through to new searches
 */
function cleanupMovieView() {
    returnToFindMovie();
    disableEditableItems();

    // remove list of actors
    const actorList = document.getElementById('actor-list');
    while (actorList.firstChild != null) {
        actorList.firstChild.remove();
    }

    // remove directors
    const directorList = document.getElementById('director-list');
    while (directorList.firstChild != null) {
        directorList.firstChild.remove();
    }

    // remove list of reviews
    const reviewList = document.getElementById('review-list');
    while (reviewList.firstChild != null) {
        reviewList.firstChild.remove();
    }

    document.getElementById('movie-view').removeAttribute('data-id');
}
/* Event Listners */
movieBack.addEventListener('click', cleanupMovieView);

findMovieButton.addEventListener('click', () => {
    showFindMovie();

    // make sure the type is find so we know what we're doing on save/edit
    document.getElementById('find-a-movie').dataset.type = 'find';
    const toHide = document.getElementById('releaseDate');
    const hidden = document.getElementById('hidden-input');
    hidden.name = 'releaseDate';
    hidden.id = 'releaseDate';
    toHide.name = '';
    toHide.id = 'hidden-input';
    hidden.classList.remove('hide');
    toHide.classList.add('hide');
});

addMovieButton.addEventListener('click', () => {
    showAddMovie();

    // make sure the type is add so we know what to do on save
    document.getElementById('find-a-movie').dataset.type = 'add';
    const hidden = document.getElementById('hidden-input');
    const toHide = document.getElementById('releaseDate');
    hidden.name = 'releaseDate';
    hidden.id = 'releaseDate';
    toHide.name = '';
    toHide.id = 'hidden-input';
    hidden.classList.remove('hide');
    toHide.classList.add('hide');
});

/* Bind edit button to toggle editable items */
edit.addEventListener('click', () => {
    enableEditableItems();
});

/* Bind save button to disable editable items */
saveButton.addEventListener('click', () => {
    //TODO: determine what needs to be saved
    //TODO: handle rating
    const mID = document.getElementById('movie-view').dataset.id;
    const info = document.getElementById('info').value;
    const releaseDate = document.getElementById('releaseDate-movie').value;
    const runtime = document.getElementById('runtime-edit').value;
    const query = `UPDATE Movie SET info = "${info}", releaseDate = "${releaseDate}", runtime = ${runtime} WHERE Movie.id = ${mID}`;

    queryDatabase(query);

    Array.from(document.getElementsByClassName('edit-list')).forEach((element) => {
        if (element.dataset.edit == 'true') {
            // remove the links in the tables
            switch (element.dataset.type) {
            case 'actor':
                if (element.dataset.removed != '') {
                    queryDatabase(`DELETE FROM StarsIn WHERE aID = ${element.dataset.removed} AND mID = ${mID}`);
                    queryDatabase(`INSERT INTO StarsIn (aID, mID) VALUES (${element.dataset.id}, ${mID})`);
                }
                break;
            default: // director
                if (element.dataset.removed != '') {
                    queryDatabase(`DELETE FROM Directs WHERE dID = ${element.dataset.removed} AND mID = ${mID}`);
                    queryDatabase(`INSERT INTO Directs (dID, mID) VALUES (${element.dataset.id}, ${mID})`);
                }
            }
        }
        if (element.dataset.new == 'true') {
            console.log('new thing');
            console.log(element);
        }
    });

    disableEditableItems();
});

searchCancel.addEventListener('click', () => {
    hideShield();
    hideSearchPopup();
    document.getElementById('search-input').value = '';
});

//TODO: implement SQL query to delete
function deleteMovie() {
    const id = document.getElementById('movie-view').dataset.id;
    console.log(`Delete ${id}`);
    queryDatabase(`DELETE FROM Movie WHERE id = ${id}`);
    queryDatabase(`DELETE FROM StarsIn WHERE mID = ${id}`);
    queryDatabase(`DELETE FROM Directs WHERE mID = ${id}`);
    cleanupMovieView();
}

/* Bind delete button */
document.getElementById('delete-movie').addEventListener('click', deleteMovie);

/**
 * Shows the new review editor to add a review
 */
function newReviewEditor() {
    showSheild();
    reviewEditor.classList.remove('hide');
    document.getElementById('review-content').removeAttribute('data-id');
}

/* Binds the add review button */
document.getElementById('add-movie-review').addEventListener('click', newReviewEditor);

// setup the editor so that we can track changes
document.getElementById('review-content').addEventListener('input', (e) => {
    if (e.target.dataset.edit != null) {
        e.target.dataset.edit = true;
    }
});

document.getElementById('cancel-results').addEventListener('click', () => {
    Array.from(document.getElementsByClassName('result')).forEach((element) => {
        element.remove();
    });

    hideSearchResults();
    hideShield();
});

document.getElementById('add-actor').addEventListener('click', () => {
    search.dataset.type = 'actor';
    showSheild();
    showSearchPopup('actor');
});

document.getElementById('add-director').addEventListener('click', () => {
    search.dataset.type = 'director';
    showSheild();
    showSearchPopup('director');
});

function generateTopResultTemplate(movie) {
    return `<div class="top-result" data-id="${movie.id}">
                    <span>${movie.title} - ${movie.rating} - ${movie.count}</span>
                </div>`;
}

function addtopResult(row) {
    const child = htmlToElement(generateTopResultTemplate(row));
    child.addEventListener('click', () => { // add event listener to element
        document.getElementById('top-movie-view').classList.add('hide');
        // set the values in the Movie View
        const nodeList = document.getElementById('top-movies-list');
        while (nodeList.firstChild != null) {
            nodeList.firstChild.remove();
        }
        setMovieViewContent(row);
        movieView.classList.remove('hide'); // expose the movie view
    });
    document.getElementById('top-movies-list').appendChild(child);
}

const topMoviesButton = document.getElementById('top-movies');

topMoviesButton.addEventListener('click', () => {
    findMovieDiv.classList.add('hide');
    document.getElementById('top-movie-view').classList.remove('hide');
    const query = 'SELECT id, title, rating, count, runtime, info, releaseDate FROM movie WHERE rating > 65 AND count>1000000 AND count != ""';
    callbackOnDatabase(query, addtopResult);
});

function generateYearResultTemplate(row) {
    return `<div class="rating-result">
                <span>${row.year} - ${row.average}</span>
            </div>`;
}

function addYearResult(row) {
    const child = htmlToElement(generateYearResultTemplate(row));
    document.getElementById('rating-by-year-list').appendChild(child);
}

document.getElementById('rating-by-year').addEventListener('click', () => {
    document.getElementById('find-a-movie').classList.add('hide');
    document.getElementById('rating-by-year-view').classList.remove('hide');

    const query = 'SELECT  ROUND(AVG(rating),0) "average", strftime("%Y",releaseDate) "year" FROM Movie WHERE year != "" GROUP BY year HAVING count(*)>0 ORDER BY year DESC';
    callbackOnDatabase(query, addYearResult);
});

document.getElementById('back-from-rating-view').addEventListener('click', () => {
    document.getElementById('rating-by-year-view').classList.add('hide');
    showFindMovie();
    const nodeList = document.getElementById('rating-by-year-list');
    while (nodeList.firstChild != null) {
        nodeList.firstChild.remove();
    }
});

document.getElementById('back-from-top-movies').addEventListener('click', () => {
    document.getElementById('top-movie-view').classList.add('hide');
    showFindMovie();

    const nodeList = document.getElementById('top-movies-list');
    while (nodeList.firstChild != null) {
        nodeList.firstChild.remove();
    }
});

Array.from(document.getElementsByClassName('numeric')).forEach((element) => {
    element.addEventListener('keypress', (e) => {
        if (e.key == 'e') {
            e.preventDefault();
        }
    });
});
