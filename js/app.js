$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
    $('.datatable').DataTable();
});

$(document).on('click','#upload',function(e) {

	e.preventDefault();
	var formData = new FormData();
	if($('#file_upload').val() == '') {
		alert("Please choose a video to Upload");
		return true;
	}
	var action = "uploadMedia";
	var transcriptType = $('input[name=transcriptType]:checked').val();
	
	/*if($('#description').val() != '')
    	formData.append('description', $('#description').val()); */

	var myForm = document.getElementById('file-form');
	var fileSelect = document.getElementById('file_upload');
	var uploadButton = document.getElementById('upload');
    uploadButton.innerHTML = 'Uploading...';
    uploadButton.disabled = true;

	var files = fileSelect.files;

	for (var i = 0; i < files.length; i++) {
	  var file = files[i];

	  if (!file.type.match('video.mp4')) {
	    continue;
	  }

    formData.append('file', file, file.name);

    formData.append('version', version); 
    formData.append('apikey', apikey); 
    formData.append('password', password); 
    formData.append('action', action); 
    formData.append('transcriptType', transcriptType); 

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

	xhr.onload = function () {
	  if (xhr.status === 200) {
	    data = JSON.parse(xhr.responseText);
	    if(data.requestStatus == "SUCCESS"){
            $.ajax({
                url: 'api/media.php',
                type: 'POST',
                data: {'upload' : data.mediaId, 'filename' : file.name},
                dataType: 'json',
                success: function(res) {
                    if(res.status == 200)
                        alert(res.message)
                    else
                        alert(data.statusMessage);
                },
                complete: function() {
                    uploadButton.innerHTML = '<i class="glyphicon glyphicon-upload"></i> Upload Video';
                }
            });
        }
        

	  } else {
	    alert("Error processing request");
	  }
	};

	   xhr.send(formData);
    }
});


$(document).on('click','#search',function(e) {
    var action = "search"; 
    var terms = $('#terms').val();
    var formData = {'version': version, 'apikey': apikey, 'password': password, 'action': action, 'terms': terms};

    var obj = $(this);
     $.ajax({
        url: 'api/media.php',
        type: 'GET',
        data: {'terms' : terms},
        dataType: 'json',
        beforeSend: function() {
            obj.html('Searching...');
            obj.attr('disabled',true);
            $('#searchContainer tr').not(':first').remove();
            $('#searchContainer').addClass('hide');
        },
        success: function(res) {
            if(res.html != '') {
                sessionStorage.setItem('data', JSON.stringify(res.result));
                $('#searchContainer').removeClass('hide');
                $('#searchContainer').html(res.html);
                
                // $('#searchContainer tr:first').after(res.html);
            } else {
                alert('No matching record found. Please make sure you have fetched the data for all the files.');
                $('#terms').val('').focus();
            }
        },
        complete: function() {
            obj.attr('disabled',false);
            obj.html('<i class="glyphicon glyphicon-search"></i> Search');
        }
    });
    
});


$(document).on('click','.getVideo',function(e) {
	e.preventDefault();
	var obj = $(this);
	var href = 'api/view.php';
	var mediaId = obj.attr('data-media');
	var marker = Math.floor(obj.attr('data-marker').toString().split(".")[0]);
	var term = obj.attr('data-term');
	var title = $(this).closest('tr').find('td:nth-child(1)').text();

	window.location.href = href + '?media=' + mediaId + '#t=' + marker ;

	
});

$(document).ready(function(){
	if($('#terms').val() != "") {
		$('#search').trigger('click');
	}
});

$(document).on('keydown', '#terms', function(e) {

	if (e.which == 13 || e.keyCode == 13) {
        $('#search').trigger('click');
        return false;
    }
    return true;
});

function arrayToQueryString(array_in){
    var out = new Array();

    for(var key in array_in){
        out.push(key + '=' + encodeURIComponent(array_in[key]));
    }

    return out.join('&');
}

function secondToString(time) {
	// Minutes and seconds
	var mins = ~~(time / 60);
	var secs = time % 60;

	ret = "";
	
	ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	ret += "" + secs;
	return ret;
}

$(document).on('click','#save',function(e) {
    alert('This process can only be performed through a scheduler.')
    return false;

    var action = "list"; 
    var status = 'MACHINECOMPLETE';
    var formData = {'version': version, 'apikey': apikey, 'password': password, 'action': action, 'status': status};

    var obj = $(this);
     $.ajax({
        url: url,
        type: 'GET',
        data: formData,
        dataType: 'json',
        beforeSend: function() {
            obj.html('<span class="glyphicon glyphicon-refresh spinning"></span> Please Wait');
            obj.attr('disabled',true);
            $('#searchContainer tr').not(':first').remove();
            $('#searchContainer').addClass('hide');
        },
        success: function(res) {
            if(res.requestStatus == 'SUCCESS') {

                $.ajax({
                    url: 'api/media.php',
                    type: 'POST',
                    data: {'media': res.mediaIds},
                    dataType: 'json',

                    success: function(r) {
                        alert(r.message);
                    },
                    complete: function() {
                        obj.attr('disabled',false);
                        obj.html('<i class="glyphicon glyphicon-download"></i> Fetch');
                    }
                });
            } else {
                alert('No files found');
            }
        },
        complete: function() {
            
        }
    });
    
});

$(document).on('click','.getTranscript',function(e) {
    e.preventDefault();
    var obj = $(this);
    var keyword = $('#terms').val();
    var html = obj.html();
    $.ajax({
        url: 'api/media.php',
        type: 'POST',
        data: {'media' : obj.attr('data-id') },
        dataType: 'json',
        beforeSend: function() {
            obj.html('<span class="glyphicon glyphicon-refresh spinning"></span> Please Wait');
            obj.closest('tr').find('button').attr('disabled', true);
        },
        success: function(res) {
            if(res.status == 200) {
                console.log(res);
                var data = res.data;
                obj.closest('tr').find('.record-player').removeClass('hide');
                if(data.transcript != '') {
                    var type = '<i class="' + data.type + '">' + data.type + '</i>';
                    var button = '<button data-transcript="" type="button" class="btn btn-xs btn-info showTranscript"><i class="glyphicon glyphicon-eye-open"></i> Read</button>';
                    obj.closest('tr').find('span.read').html(button);
                    obj.closest('tr').find('.showTranscript').attr('data-transcript', data.transcript);
                    obj.closest('tr').find('td.type').html(type);
                    obj.closest('tr').addClass('row-success').delay('5000').fadeIn('slow', function() { $(this).removeClass('row-success'); });
                } else {
                    obj.closest('tr').addClass('row-danger').delay('5000').fadeIn('slow', function() { $(this).removeClass('row-danger'); });
                }
                obj.closest('tr').find('td:nth-child(4)').text(data.markers + ' out of ' + data.keywords);
                obj.closest('tr').find('.title').html(data.title);
            } else {
                alert(res.message);
            }
        },
        complete: function() {
            $('[data-toggle="tooltip"]').tooltip(); 
            obj.closest('tr').find('button').attr('disabled', false);
            obj.html(html);
        }
    });

    
});

$(document).on('click','.deleteVideo',function(e) {
    e.preventDefault();
    var obj = $(this);
    var media = obj.attr('data-id');
    var html = obj.html();
    if(window.confirm('This will permanently delete the video from the Voicebase System. Are you sure?')) {
        $.ajax({
            url: 'api/media.php',
            type: 'POST',
            data: {'delete' : obj.attr('data-id') },
            dataType: 'json',
            beforeSend: function() {
                obj.html('<span class="glyphicon glyphicon-refresh spinning"></span> Please Wait');
                obj.attr('disabled',true);
            },
            success: function(res) {
                if(res.status == 200) {
                    alert(res.message);
                    obj.closest('tr').find('button').remove();
                } else {
                    alert(res.message);
                }
            },
            complete: function() {
                obj.attr('disabled',false);
                obj.html(html);
            }
        });
    }

    
});

$(document).on('click','.archiveVideo',function(e) {
    e.preventDefault();
    var obj = $(this);
    var media = obj.attr('data-id');
    var status = obj.attr('data-status');
    var html = obj.html();
        $.ajax({
            url: 'api/media.php',
            type: 'POST',
            data: {'archive' : obj.attr('data-id'), 'status': status },
            dataType: 'json',
            beforeSend: function() {
                obj.html('<span class="glyphicon glyphicon-refresh spinning"></span> Please Wait');
                obj.attr('disabled',true);
            },
            success: function(res) {
                if(res.status == 200) {
                    obj.closest('tr').remove();
                } else {
                    alert(res.message);
                }
            },
            complete: function() {
                obj.attr('disabled',false);
                obj.html(html);
            }
        });

    
});

$(document).on('click','.showTranscript',function(e) {
    e.preventDefault();
    var obj = $(this);
    var text = obj.attr('data-transcript');
    var title = obj.closest('tr').find('.title').html();
    var modal = $('#transcript-modal');
    $('.modal-body', modal).html(text);
    $('#myModalLabel', modal).html(title);
    modal.modal('show');

    
});

$(document).on('click','#capture', function() {
    var obj = {}, txt="";
        obj = {
            video: true,
            audio: true
        };
        txt = "<video>";

        /*obj = {
            video: false,
            audio: true
        };
        txt = "<audio>";*/

    navigator.webkitGetUserMedia(obj, function(stream) {
        $("#result").empty();
        var output = $(txt).appendTo("#result")[0],
            source = window.webkitURL.createObjectURL(stream);
        output.autoplay = true;
        output.src = source;
        console.log(stream);
        window.a = stream; //debug
    }, function(err) {
        console.log(err);
        err.code == 1 && (alert("You can click the button again anytime to enable."))
    });
});

$(document).on('click','#stop', function() {
    var blob = $('video').attr('src');
    
    var fileType = 'video'; // or "audio"
    var fileName = '101010101.webm';  // or "wav"

    var formData = new FormData();
    formData.append(fileType + '-filename', fileName);
    formData.append(fileType + '-blob', blob);

    xhr('api/upload.php', formData, function (fName) {
        // window.open(location.href + fName);
    });

    function xhr(url, data, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                callback(location.href + request.responseText);
            }
        };
        request.open('POST', url);
        request.send(data);
    }

});