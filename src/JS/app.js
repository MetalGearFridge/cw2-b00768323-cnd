//The URIs of the REST endpoint
PUPS = "https://prod-63.northeurope.logic.azure.com:443/workflows/fb407977247543e8b2309eb33fb69235/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dFQPaJ5uI_az7llvZRzoDYifn-9PLMYzaAZ5TFVTNqw"; //Post Upload
PRS = "https://prod-60.northeurope.logic.azure.com:443/workflows/3b83fbbd60194fefae7a1bcd155288c9/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xXQ_axgMfOUy8iTjrnqsfI6poaR54kwpzJtXVOhOo1w"; //Retrieve all Posts

// DIP1 = ""
// DIP2 = ""

BLOB_ACCOUNT = "https://blobstoragecw2b00768323.blob.core.windows.net";

//Handlers for button clicks
$(document).ready(function () {

  $("#retPosts").click(function () {

    //Run the get post list function
    getPosts();

  });

  //Handler for the new post submission button
  $("#subNewForm").click(function () {

    //Execute the submit new post function
    submitNewPost();

  });

  $("#logoutBtn").click(function () {
    $.removeCookie("StaticWebAppsAuthCookie")
    ShowLoggedOutDetails();
  });

});

$(window).on('load', function () {

  //Run the get post list function
  getPosts();

  //Prepare the page based on the user info
  preparePage();

});

async function preparePage() {
  if (await getUserId()) {
    ShowLoggedInDetails();
  }
  else {
    ShowLoggedOutDetails();
  }
}

async function ShowLoggedOutDetails() {
  $('#loginBtn').show();
  $('#logoutBtn').hide();
  $('#submitNewPostDiv').hide();
  $('#signedOutHeader1').show();
  $('#signedOutHeader2').show();
}

async function ShowLoggedInDetails() {
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
async function submitNewPost() {
  userUsername = await getUsername();
  userUserId = await getUserId();

  //get file extension from file upload
  var fileExtension = $('#UpFile').val().split('.').pop().toLowerCase();
  console.log(fileExtension);

  //get filename from file upload
  var fileName = $('#UpFile').val().split('\\').pop().toLowerCase();
  console.log(fileName);

  submitData = new FormData();

  //Get form variables and append them to the form data object
  submitData.append('FileName', fileName);
  submitData.append('userID', userUserId);
  submitData.append('userName', userUsername);
  submitData.append('fileExtension', fileExtension);
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

async function getUsername() {
  // call the endpoint  
  const response = await fetch('/.auth/me');
  // convert to JSON  
  const json = await response.json();
  // ensure clientPrincipal and userDetails exist  
  if (json.clientPrincipal && json.clientPrincipal.userDetails) {
    // return userDetails (the username)  
    return json.clientPrincipal.userDetails;
  } else {
    // return null if anonymous  
    return null;
  }
}
async function getUserId() {
  // call the endpoint  
  const response = await fetch('/.auth/me');
  // convert to JSON  
  const json = await response.json();
  // ensure clientPrincipal and userDetails exist  
  if (json.clientPrincipal && json.clientPrincipal.userId) {
    // return userDetails (the username)  
    return json.clientPrincipal.userId;
  } else {
    // return null if anonymous  
    return null;
  }
}

//A function to get a list of all the posts and write them to the Div with the postList Div
function getPosts() {
  //Replace the current HTML in that div with a loading message
  $('#PostList').html('<div class="spinner-border" role="status"><span class="sr-only"> &nbsp;</span>')

  $.getJSON(PRS, function (data) {

    //Create an array to hold all the retrieved assets
    var items = [];

    console.log(data);

    //Iterate through the returned records and build HTML, incorporating the key values of the record in the data
    $.each(data, function (key, val) {

      items.push("<hr />");

      if (val["fileExtension"] === "jpg" || val["fileExtension"] === "png" || val["fileExtension"] === "gif") {
        items.push("<img src='" + BLOB_ACCOUNT + val["filePath"] + "' width='400' /><br />");
      } else if (val["fileExtension"] === "mp4") {
        items.push("<video controls width='400'>");
        items.push("<source src='" + BLOB_ACCOUNT + val["filePath"] + "' type='video/mp4' />");
        items.push("Your browser does not support the video tag.");
        items.push("</video><br />");
      } else if (val["fileExtension"] === "mp3") {
        items.push("<audio controls>");
        items.push("<source src='" + BLOB_ACCOUNT + val["filePath"] + "' type='audio/mp3' />");
        items.push("Your browser does not support the audio tag.");
        items.push("</audio><br />");
      }

      items.push(val["userName"] + ": ");
      items.push(val["postDescription"]);
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

function deletePost(id) {
  $.ajax({
    type: "DELETE",
    //Note the need to concatenate the
    url: DII1 + id + DII2,
  }).done(function (msg) {
    //On success, update the postlist
    getPosts();
  });
}

