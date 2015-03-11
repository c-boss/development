/**
 * 
 */

function generateUniqueId() {
  var time = new Date().getTime();
  while (time == new Date().getTime());
  return new Date().getTime();
}

function fileSelected() {

	var files = document.getElementById('fileToUpload').files;
    var xhrs = [] ;

	for (var i = 0; i < files.length; i++) {
		
		var id = generateUniqueId();
		xhrs[i] = new XMLHttpRequest();
		xhrs[i].uniqueId = id;

		var file = files[i];
		var name = file.name;
		var size = 0;
		if (file.size > 1048576)
			size = (Math.round(file.size * 100 / (1048576)) / 100).toString()
					+ 'MB';
		else
			size = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
		var type = file.type;

		var $row = $('<tr></tr>');
		$row.append('<td class="name">' + name + '</td>');
		$row.append('<td class="size">' + size + '</td>');
		$row.append('<td class="type">' + type + '</td>');

		var $progressCol = $('<td class="progress"></td>');
		var $progressBar = $('<progress id="progressBar" data-id="'+ id +'" ></progress>' )
		                   .appendTo($progressCol);
		$row.append($progressCol) ;
		
		var $abortCol = $('<td class="abort"></td>');

		 $('<a class="abort-btn" data-id="'+id+'">abort</a>').on('click',
				function() {
			console.log("i " + i );
					var btnId = $(this).attr('data-id');
					for (var i = 0; i < xhrs.length; i++) {
						var xhr = xhrs[i];
						if(xhr.uniqueId == btnId){
							console.log("fonddddddddddddddd.")
							xhr.abort();
						}
					}
					console.log("aborted ..");
				}).appendTo($abortCol);

		$row.append($abortCol);

		var $table = $('.attachments');
		$table.append($row);

		var fd = new FormData();
		fd.append("fileToUpload" + i, file);

		/*
		 * 
		 * xhr.addEventListener("load", uploadComplete, false);
		 * xhr.addEventListener("error", uploadFailed, false);
		 * xhr.addEventListener("abort", uploadCanceled, false);
		 */
		
		function uploadProgress(evt){
			console.log(evt);
			if (evt.lengthComputable) {
				var percentComplete = Math.round(evt.loaded * 100 / evt.total);
				$progressBar.width(percentComplete+"%");
			}
		}

		
		xhrs[i].upload.addEventListener("progress", uploadProgress, false);
		
		xhrs[i].open("POST", "FileUploadServlet");
		xhrs[i].send(fd);
		
		
	}
	/*
	 * hideProgressBar(); updateProgress(0);
	 * document.getElementById("uploadStatus").innerHTML = ""; var file =
	 * document.getElementById('fileToUploadForm:fileToUpload').files[0]; if
	 * (file) { var fileSize = 0; if (file.size > 1048576) fileSize =
	 * (Math.round(file.size * 100 / (1048576)) / 100).toString() + 'MB'; else
	 * fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
	 * 
	 * document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
	 * document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
	 * document.getElementById('fileType').innerHTML = 'Type: ' + file.type; }
	 */
}

/*function uploadFile() {
	showProgressBar();
	var fd = new FormData();
	fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);

	var xhr = new XMLHttpRequest();
	xhr.upload.addEventListener("progress", uploadProgress, false);
	xhr.addEventListener("load", uploadComplete, false);
	xhr.addEventListener("error", uploadFailed, false);
	xhr.addEventListener("abort", uploadCanceled, false);
	xhr.open("POST", "FileUploadServlet");
	xhr.send(fd);
}

function uploadProgress(evt) {
	if (evt.lengthComputable) {
		var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		updateProgress(percentComplete);
	}
}

function uploadComplete(evt) {
	document.getElementById("uploadStatus").innerHTML = "Upload successfully completed!";
}

function uploadFailed(evt) {
	hideProgressBar();
	document.getElementById("uploadStatus").innerHTML = "The upload cannot be complete!";
}

function uploadCanceled(evt) {
	hideProgressBar();
	document.getElementById("uploadStatus").innerHTML = "The upload was canceled!";
}

var updateProgress = function(value) {
	var pBar = document.getElementById("progressBar");
	document.getElementById("progressNumber").innerHTML = value + "%";
	pBar.value = value;
}

function hideProgressBar() {
	document.getElementById("progressBar").style.visibility = "hidden";
	document.getElementById("progressNumber").style.visibility = "hidden";
}

function showProgressBar() {
	document.getElementById("progressBar").style.visibility = "visible";
	document.getElementById("progressNumber").style.visibility = "visible";
}
*/