/*********************************************************
 * CleanPlate to-do list app by Benjamin Ortiz           *
 *    A project to learn Javascript via Codecademy       *
 *                                                       *
 * taskKeep and taskMax are customizable portions of     *
 * this code. taskMax does need a modification in the    *
 * index.html file so there are the correct number of    *
 * list elements.                                        *
 *                                                       *
 * task0 is reserved for saved tasks. Otherwise, tasks   *
 * are written to index.html with the oldest at the top. *
 * Tasks are stored using localStorage with one element  *
 * for the task and another for the expiration date.     *
 *                                                       *
 * 						June 2012*
 *********************************************************/

var savedPresent;	// tells whether or not a saved task exists
var taskCount = 0;	// keeps track of the current number of tasks
var taskMax = 7;	// sets the maximum number of tasks at a time
var daysKeep = 7;	// sets the number of days for a task to be kept
var old;			// a place to store the old task description while editing
var currentlyEditing = false;	// tells whether or not something is currently being edited

/* used to check if localStorage is supported */
function isLocalStorageSupported() {
	try {
		var supported = false;
		if (window['localStorage'] !== null) {
			supported = true;
		}
		return supported;
	} catch(e) {
		return false;
	}
} 

/* Check if there is a saved task */
function saveChecker() {
	if (localStorage["todo0"]) {
		savedPresent = true;
	} else {
		savedPresent = false;
	}
}

/* hides and unhides divs as tasks are deleted or added */
function switcher(onoff,divID) {
	var item = document.getElementById(divID);
	if (item) {
		if (onoff==="on") {
			if (item.className==="todo hidden") {
				item.className="todo unhidden";
			} else if (item.className==="todo hidden saved") {
				item.className="todo unhidden saved";
			} else if (item.className==="hidden") {
				item.className="unhidden";
			}
		} else if (onoff==="off") {
			if (item.className==="todo unhidden saved") {
				item.className="todo hidden saved";
			} else if (item.className==="todo unhidden") {
				item.className="todo hidden";
			} else if (item.className==="unhidden") {
				item.className="hidden";
			}
		}
	}
}

/* Count the number of tasks initially */
function countTasks() {
	var counter = 1;	// start at 1 to skip saved (just in case there isn't one)
	if (savedPresent) {	// account for saved so loop below works
		taskCount++;
	}
	do {
		if (localStorage["todo"+counter]) {
			taskCount++;
		} else {
			break;
		}
		counter++;
	} while (counter<=taskMax);
}

/* Takes the task number, task description, and the days left 
 * and prints it out to the HTML */
function writeTask(number,description,days) {
	var item = document.getElementById("todo"+number);
	if (number===0) { // special case for saved tasks
	switcher("on","todo"+number);
	item.innerHTML = "<p onclick=\"edit(0)\" title=\"Click to edit\" id=\"desc0\">" + description + "</p> <div class=\"tools\"><span id=\"done0\" class=\"finish\"><a href=\"#\" onclick=\"userFinishTask(\'0\')\">done</a></span> <span id=\"remove0\"><a href=\"#\" onclick=\"userDeleteTask(\'0\')\" class=\"function\">remove</a></span></div>"; // writes so each element has a special HTML ID for userFunctions
	} else {
	switcher("on","todo"+number); // makes the element visible
	item.innerHTML = "<p onclick=\"edit(" + number + ")\" title=\"Click to edit\" id=\"desc" + number + "\">" + description + "</p> <div class=\"tools\"><span id=\"done" + number + "\" class=\"finish\"><a href=\"#\" onclick=\"userFinishTask(\'" + number + "\')\">done</a></span> <span class=\"daysleft\">" + days + "</span> <a href=\"#\" onclick=\"saveTask(\'" + number + "\')\" class=\"function\">save</a> <span id=\"remove" + number + "\"><a href=\"#\" onclick=\"userDeleteTask(\'" + number + "\')\" class=\"function\">remove</a></span></div>";
	}
}

/* compute the number of days left for a given task */
function daysLeft(number) {
	var date = new Date();
	var expDate = parseInt(localStorage["exp"+number]); // get the expiration date stored in localStorage
	var result = Math.round(((expDate - date.getTime())/1000/60/60/24)*10)/10; // compute the difference between current time and expiration date
	
	if (result === 1) {
		return result + " day left";
	} else {
	return result + " days left";
	}
}

/* move task's position */
function moveTask(from,to) {
	localStorage["todo"+to] = localStorage["todo"+from]; // rewrite localStorage pay no attention to what
	localStorage["exp"+to] = localStorage["exp"+from];   // is in the destination slot. Assumed taken care of.
	deleteTask(from);	// remove the old version of the task being removed.
	writeTask(to,localStorage["todo"+to],daysLeft(to));	 // write the new task to the HTML
	taskCount++;		// add a count to counteract the task deletion.
}

/* Function to write out all the old tasks */
function writeOld() {
	var counter = 1;	// skip saved and check for it later.
	if (savedPresent) { // check for saved.
		writeTask(0,localStorage["todo0"],daysLeft(0));
	}
	do { 
		var currentLocal = localStorage["todo"+counter];
		if (currentLocal) {
			writeTask(counter,currentLocal,daysLeft(counter));
		} else {
			break; // stop writing if there is nothing in the localStorage.
		}
		counter++;
	} while (counter<=taskMax);
}

/* The function used when a user tries to add a task */
function addTask(description) {
	var counter = 1; // start at 1 to avoid writing over the saved task

	if (description==="") {
		humane.log("Please write a task before trying to add it");	// make sure there isn't an empty task
	} else if (taskCount >= taskMax) {
		humane.log("You have reached the maximum of " + taskMax +  " tasks");	// make sure they don't exceed the max.
	} else if (currentlyEditing) {
		humane.log("Please finish editing your task");
	} else {
		do { 	// loop through from task 1 to maxTask till there is an empty slot
			if (!localStorage["todo"+counter]) {	// check to make sure there isn't already a task there
				var date = new Date();
				var expDate = date.getTime()+(daysKeep*24*60*60*1000);
	
				try {	// try writing the task and expiration date to localStoage
					localStorage["todo"+counter] = description;
					localStorage["exp"+counter] = expDate;
				} catch (error) {
					if (error === QUOTA_EXCEEDED_ERR) {
						alert("For some reason, there is not enough room left in the storage to allow for you to add another task. Maybe the tasks you have take up too much storage. Otherwise, contact me on the \"about\" page and I'll help you through it.");
					}
				}
				switcher("off","nothingTodo");	// in case this is the first task, remove the beginning prompt.
				writeTask(counter,description,daysLeft(counter));		
				taskCount++;
				document.getElementById("newTask").value = "";	// clear the text in the input box
				break;
			}
			counter++;
			} while (counter<=taskMax);
	}
}

/* how a task is saved by a user */
function saveTask(number) {
	if (savedPresent) {
		humane.log('Could not save, you already have one task saved.', { addnCls: 'humane-libnotify-error' });
	} else if (currentlyEditing) {
		humane.log("Please finish editing your task");
	} else {
		humane.log('Task saved indefinitely', { addnCls: 'humane-libnotify-success'});
		moveTask(number,0); // move the task from where it is to position 0
		savedPresent=true;  // mark task as saved
	}
}

/* makes sure all the tasks stay in the top most containers */
function cleanUp(number) {
	var counter = parseInt(number)+1; // for some reason, number comes as a string, so it must be changed.
	
	if (localStorage["todo"+counter]) {
		moveTask(counter,counter-1);  // move task to the one above it
		counter++;
	}
}

/* clears out expired tasks on load */
function removeOld() {
	var counter = 1;		// skips 0 because saved is never removed
	var anotherCounter = 0;	// counts the number of times a task has been removed
	var date = new Date();
	var currentTime = date.getTime();

	do {
		var currentLocal = localStorage["exp"+(counter-anotherCounter)];
		if (!currentLocal) {
			break;			// checks to make sure there is a task, else it ends the loop
		} else {
			var timeDiff = currentLocal - currentTime;
			if (timeDiff <= 0) {
				deleteTask(counter-anotherCounter); // if the task is expired, it deletes it from the mix.
				anotherCounter++; // used to make sure the task moved into the deleted task's position is not also expired
			}
			counter++;
		}
	} while (counter<=taskMax);
	taskCount=0; // balances out all the deleted tasks so there isn't a negative count.
}

/* remove a single task */
function deleteTask(number) {
	if (number===0 || number==="0") {			// doesn't call cleanUp because cleanUp(0) causes problems.
		savedPresent=false;						// marks unsaved
		switcher("off","todo"+number);			// hides it from user view
		localStorage.removeItem("todo"+number); // remove task and expiration date from localStorage
		localStorage.removeItem("exp"+number);
		taskCount--;							// reduces the task count
	} else {
	switcher("off","todo"+number);
	localStorage.removeItem("todo"+number);
	localStorage.removeItem("exp"+number);
	cleanUp(number);							// moves all tasks below it up to fill in the gap
	taskCount--;
	}
}

/* extra confirmation for when the user requests to delete a task
 * rewrites the special ID of the task to ask yes or no */
function userDeleteTask(number) {
	if (currentlyEditing) {
		humane.log("Please finish editing your task");	
	} else {
	document.getElementById("remove"+number).innerHTML = "<a href=\"#\" onclick=\"deleteTask(\'" + number + "\');humane.log(\'Task deleted\', {addnCls:\'humane-libnotify-success\'})\" class=\"function yes\">yes</a><a href=\"#\" onclick=\"cancelDelete(\'" + number + "\')\" class=\"function no\">no</a>";
	}
}

/* returns the HTML back to normal if the user selects no */
function cancelDelete(number) {
	document.getElementById("remove"+number).innerHTML = "<a href=\"#\" onclick=\"userDeleteTask(\'" + number + "\')\" class=\"function\">remove</a>";
}

/* used to mark a task as finish and keep track of the number of finished tasks */
function finishTask(number) {
	deleteTask(number);		// remove the task first
	if (localStorage["finishCount"]) { 	// check that this is not the first finished task
		localStorage["finishCount"] = parseInt(localStorage["finishCount"]) + 1; // update the count of finished tasks in localStorage.
		var fc = parseInt(localStorage["finishCount"]);
		if (taskCount===0) {	// if this is the last task, special message.
			humane.log("You've finished all your tasks, good job!");
		}
		if (fc % 50 === 0) {	// super congrats to large feats.
			humane.log("Holy cow, Batman! " + fc + " tasks! keep up the good work!");
		} else { 				// encouragement for each finished task, chosen at random, encouraged by Danielle
			var congrats = [];
			var i = Math.floor(19*Math.random());

			congrats[0] = "Good Job!";
			congrats[1] = "Bravo!";
			congrats[2] = "Awesome!";
			congrats[3] = "Great Job!";
			congrats[4] = "You know what? You're the best.";
			congrats[5] = "You did it!";
			congrats[6] = "You make me proud.";
			congrats[7] = "Superb!";
			congrats[8] = "Super duper!";
			congrats[9] = "Treat. Yo. Self.";
			congrats[10] = "Great!";
			congrats[11] = "High five!";
			congrats[12] = "Pat yourself on the back.";
			congrats[13] = "Fist bump.";
			congrats[14] = "Way to go!";
			congrats[15] = "Sweet.";
			congrats[16] = "You get a gold star.";
			congrats[17] = "Success!";
			congrats[18] = "Right on!";
			congrats[19] = "You're a super-star!";
			
			humane.log(congrats[i]);
		}
	} else { // if it is the first finished task, add to localStorage plus special message.
		localStorage["finishCount"] = 1;
		humane.log("The sky is the limit, congratulations on your first task!");
	}
}

/* asks for extra confirmation before marking the task complete */
function userFinishTask(number) {
	if (currentlyEditing) {
		humane.log("Please finish editing your task");	
	} else {
	document.getElementById("done"+number).innerHTML = "<a href=\"#\" onclick=\"finishTask(\'" + number + "\')\" class=\"function yes\">yes</a><a href=\"#\" onclick=\"cancelFinish(\'" + number + "\')\" class=\"function no\">no</a>";
	}
}

/* restores the HTML if the user selects no */
function cancelFinish(number) {
	document.getElementById("done"+number).innerHTML = "<a href=\"#\" onclick=\"userFinishTask(\'" + number + "\')\">done</a>";
}

/* Allows the task to be added by using the enter key */
function submitOnEnter(e) {
	var keycode;
	if (window.event) {
		keycode = window.event.keyCode;
	} else if (e) {
		keycode = e.which;
	} else {
		 return true;
	}
	if (keycode == 13) {
   		addTask(document.getElementById('newTask').value);
   		return false;
   	} else {
   return true;
	}
}

function edit(number) {
	if (!currentlyEditing) {	// to make sure edit doesn't continue to be called
	currentlyEditing = true;
	old = document.getElementById("desc" + number).innerHTML;
	document.getElementById("desc" + number).innerHTML = "<input class=\"edit\" type=\"text\" id=\"edit" + number + "\" value=\"" + old + "\" />"
	document.getElementById("done" + number).innerHTML = "<input class=\"cancelEdit\" type=\"button\" onclick=\"cancelEdit(" + number + ")\" name=\"cancelEdit\" value=\"cancel\" /> <input class=\"saveEdit\" type=\"button\" onclick=\"saveEdit(" + number + ")\" name=\"saveEdit\" value=\"save\" />";
	document.getElementById("edit" + number).focus();
	document.getElementById("edit" + number).select();
	}
}

function cancelEdit(number) {
	writeTask(number, old, daysLeft(number));
	currentlyEditing = false;
}

function saveEdit(number) {
	localStorage["todo" + number] = document.getElementById("edit" + number).value;
	writeTask(number, localStorage["todo" + number], daysLeft(number));
	currentlyEditing= false;
}

/* Function to be called to start on loading
 * the page */
function initialize() {
	if (isLocalStorageSupported()) {	// make sure localStorage is supported.
		removeOld();					// get rid of all expired tasks
		saveChecker();					// checks for a saved task
		countTasks();					// count the number of tasks at start-up
		if (taskCount === 0) {			// if no tasks, show start message and welcome user
			switcher("on","nothingTodo")
			humane.log("Welcome!");
		} else {						// write the existing tasks into the HTML and welcome back user
			writeOld();
			humane.log("Welcome back!");
		}
	} else {	// explain why this won't work on their browser
		alert("Unfortunately, the browser you are using isn't supported\nYou should upgrade to the newest version of Firefox.");
	}
}
