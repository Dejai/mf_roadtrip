
var roadTripVideos = { "order": [], "is_menu_open":false};

function navbarToggle()
{
	let navbar = document.getElementById("navbar_responsive");
	let navbarOpen = document.getElementById("navbar_open");
	let navbarClose = document.getElementById("navbar_close");
	let is_visible = (navbar.style.display == "block") ? true : false;

	if (is_visible){
		navbar.style.display = "none";
		roadTripVideos.is_menu_open = false;
	} else {
		navbar.style.display = "block";
		roadTripVideos.is_menu_open = true;
	}
}

function toggleBackstory()
{
	let back = document.getElementById("backstory");
	let video = document.getElementById("video_display_container");
	let disp = back.style.display;

	let showBack = (disp == "none" || disp == "") ? "block" : "none";
	let showVideo = (showBack == "none") ? "block" : "none";

	back.style.display = showBack;
	video.style.display = showVideo;
}

function clearSelected(){
	var selected = document.getElementsByClassName("selected_day");
	for (var x = 0; x < selected.length; x++){
		selected[x].classList.remove("selected_day");
	}
}
function clickedDay(event)
{

	if (roadTripVideos.is_menu_open){
		document.getElementById("navbar_close").click();
	}
	if (document.getElementById("backstory").style.display="block"){
		toggleBackstory();
	}
	
	let id = event.target.id;
	let name = event.target.innerHTML;
	setVideoDetails(id, name);
}

function clickedVideoNav(event)
{
	let action = event.target.innerHTML;
	let current_vid = document.getElementsByClassName("selected_day")[0].id;
	var indx = roadTripVideos.order.indexOf(current_vid);
	var len = roadTripVideos.order.length;

	let next_vid = "preview"; //sets a default next value to just show the preview

	if (action == "Previous"){
		let prv = (indx == 0) ? len-1 : indx-1;
		next_vid = roadTripVideos.order[prv];
	} else {
		let nxt = (indx == (len-1)) ? 0 : indx+1;
		next_vid = roadTripVideos.order[nxt];
	}
	document.getElementById(next_vid).click();
}

function selectMenuItem(dayName){
	var day_name = dayName.toLowerCase().replace(" ", "_");
	var menu_item = document.getElementById(day_name);
	clearSelected();
	menu_item.classList.add("selected_day");
}

function setVideoDetails(dayID, dayName){
	var video_frame = document.getElementById("video_frame");
	let video_title = document.getElementById("current_video_title");
	let video_time = document.getElementById("video_time");
	let editor_name = document.getElementById("editor_name");
	let video_description = document.getElementById("video_description");

	let time_formatted = (roadTripVideos[dayID].time) ? (roadTripVideos[dayID].time) : "n/a";

	video_title.innerHTML = dayName;
	video_frame.src = roadTripVideos[dayID].url;	
	editor_name.innerHTML = roadTripVideos[dayID].editor;	
	video_time.innerHTML = time_formatted;
	video_description.innerHTML = roadTripVideos[dayID].description;

	selectMenuItem(dayID);
}

function setByClassName(className, value)
{
	let elements = document.getElementsByClassName(className);
	for (var x = 0; x < elements.length; x++){
		elements[x].innerHTML = value;
	}
}

function createListOfElements(tagName, xmlElements, destinationElement)
{
	let destElement = document.getElementById("days_menu_list");

	for (var x = 0; x < xmlElements.length; x++){

		let xmlEle = xmlElements[x];
		let ele = document.createElement(tagName);
		let day_val = xmlEle.innerHTML;
		let day_id = day_val.toLowerCase().replace(" ", "_");
		ele.innerHTML = day_val;
		ele.id = day_id;
		ele.addEventListener("click", clickedDay, true);
		destElement.appendChild(ele);

		/* Add the details to the roadTripVideos object */
		roadTripVideos["order"].push(day_id);
		let parent = xmlEle.parentNode;
		let url = parent.querySelectorAll("url")[0].innerHTML;
		let editor = parent.querySelectorAll("editor")[0].innerHTML;
		let time = parent.querySelectorAll("time")[0].innerHTML;
		let desc = parent.querySelectorAll("description")[0].innerHTML
		roadTripVideos[day_id] = {"url":url, "editor":editor, "time":time, "description": desc};
	}
}

function setPageValues(xmlDoc){
	var xmldoc = xmlDoc;
	console.log(xmldoc);

	let title = xmldoc.getElementsByTagName("title")[0];
	setByClassName("title", title.innerHTML)

	let subtitle = xmldoc.getElementsByTagName("subtitle")[0];
	setByClassName("subtitle", subtitle.innerHTML);

	let days = xmldoc.querySelectorAll("day number");
	createListOfElements("li", days, "days_menu_list");

	let previewURL = xmldoc.querySelectorAll("preview url")[0].innerHTML;
	let previewEditor = xmldoc.querySelectorAll("preview editor")[0].innerHTML;
	let previewTime = xmldoc.querySelectorAll("preview time")[0].innerHTML;
	let previewDesc = "This is a snippet of our trip, somewhere in Wyoming!"
	roadTripVideos["preview"] = {"url": previewURL, "editor": previewEditor, "time":previewTime, "description":previewDesc};
	roadTripVideos["order"].unshift("preview");
	clickedDay({"target":{"id":"preview", "innerHTML":"Preview"}});
	console.log(roadTripVideos);

	let backstory = xmldoc.querySelectorAll("backstory")[0];
	document.getElementById("backstory_details").innerHTML = backstory.innerHTML;

	/* Set video navigation listeners */
	let navs = document.getElementsByClassName("video_nav");
	for(var i=0; i < navs.length; i++){
		navs[i].addEventListener("click", clickedVideoNav, true);
	}
}

function getXML(responseText){
	var parser = new DOMParser();
	let xmlDoc = parser.parseFromString(responseText, "text/xml");
	setPageValues(xmlDoc);
}

function httpRequest(filePath){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			getXML(this.responseText);
		}
	}
	xhttp.open("GET", "/RoadTrip/config/config.xml", true);
	xhttp.send();
}

document.addEventListener("DOMContentLoaded", function(){
	httpRequest();

});