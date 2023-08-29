//The URIs of the REST endpoint
PUPS = "https://prod-63.northeurope.logic.azure.com:443/workflows/fb407977247543e8b2309eb33fb69235/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dFQPaJ5uI_az7llvZRzoDYifn-9PLMYzaAZ5TFVTNqw"; //Post Upload
PRS = "https://prod-60.northeurope.logic.azure.com:443/workflows/3b83fbbd60194fefae7a1bcd155288c9/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xXQ_axgMfOUy8iTjrnqsfI6poaR54kwpzJtXVOhOo1w"; //Retrieve all Posts

// DIP1 = ""
// DIP2 = ""

BLOB_ACCOUNT = "https://blobstoragecw2b00768323.blob.core.windows.net";

//Handlers for button clicks
$(document).ready(function () {

  getPosts();
  const userDetails = getUserInfo();
  preparePage(userDetails);

  $("#retPosts").click(function () {

    //Run the get post list function
    getPosts();

  });

  //Handler for the new post submission button
  $("#subNewForm").click(function () {

    //Execute the submit new post function
    submitNewPost();

  });

});

function preparePage(userDetails){
  if(userDetails == null) {
    ShowLoggedOutDetails();
  }
  else {
    ShowLoggedInDetails();
  }
}

function ShowLoggedOutDetails() {
  $('#loginBtn').show();
  $('#logoutBtn').hide();
  $('#submitNewPostDiv').hide();
  $('#signedOutHeader1').show();
  $('#signedOutHeader2').show();
}

function showLoggedInDetails() {
  $('#loginBtn').hide();
  $('#logoutBtn').show();
  $('#submitNewPostDiv').show();
  $('#signedOutHeader1').hide();
  $('#signedOutHeader2').hide();

}

async function getUserInfo() {
  const response = await fetch('/.auth/me');
  const payload = await response.json();
  const { clientPrincipal } = payload;
  return clientPrincipal;
}

//A function to submit a new post to the REST endpoint 
function submitNewPost() {

  var userResponse = getUserInfo();

  console.log(userResponse.userName);
  console.log(userResponse.userID);

  //get file extension from file upload
  var fileExtension = $('#UpFile').val().split('.').pop().toLowerCase();
  console.log(fileExtension);

  //get filename from file upload
  var fileName = $('#UpFile').val().split('\\').pop().toLowerCase();
  console.log(fileName);

  submitData = new FormData();

  //Get form variables and append them to the form data object
  submitData.append('FileName', fileName);
  submitData.append('userID', $('#userID').val());
  submitData.append('userName', $('#userName').val());
  submitData.append('postDescription', $('#postDescription').val());
  submitData.append('File', $('#UpFile')[0].files[0]);

  //Post the form data to the endpoint, note the need to set the content type header
  $.ajax({
    url: PUPS,
    data: submitData,
    cache: false,
    enctype: 'multipart/form-data',
    contentType: false,
    processData: false,
    type: 'POST',
    success: function (data) {
      $('#FileName').val('');
      $('#userID').val('');
      $('#userName').val('');
      $('#UpFile').val('');
      $('#postDescription').val('');

      $('#submitNewPostModal').modal('hide');
      $('.modal-backdrop').remove();

      getPosts();
    }
  });


}

//A function to get a list of all the posts and write them to the Div with the postList Div
function getPosts() {
  var userResponse = getUserInfo();
  preparePage(userResponse);

  //Replace the current HTML in that div with a loading message
  $('#PostList').html('<div class="spinner-border" role="status"><span class="sr-only"> &nbsp;</span>')

  $.getJSON(PRS, function (data) {

    //Create an array to hold all the retrieved assets
    var items = [];

    console.log(data);

    //Iterate through the returned records and build HTML, incorporating the key values of the record in the data
    $.each(data, function (key, val) {

      items.push("<hr />");
      items.push("<video controls> <source type='video/mp4' src='" + BLOB_ACCOUNT + val["filePath"] + "' width='400'/></video><br />")
      items.push("File : " + val["fileName"] + "<br />");
      items.push("Uploaded by: " + val["userName"] + " (user id: " + val["userID"] + ")<br />");
      items.push("<hr />");
      items.push('<button type="button" id="subNewForm" class="btn btn-danger" onclick="deleteAsset(\'' + val["id"] + '\')">Delete</button> <br/><br/>');

    });

    //Clear the postlist div
    $('#PostList').empty();

    //Append the contents of the items array to the PostList Div
    $("<ul/>", {
      "class": "my-new-list",
      html: items.join("")
    }).appendTo("#PostList");
  });


}

function deleteAsset(id) {
  $.ajax({
    type: "DELETE",
    //Note the need to concatenate the
    url: DII1 + id + DII2,
  }).done(function (msg) {
    //On success, update the assetlist
    getPosts();
  });
}

