var API_KEY = 'AIzaSyAzJrieP_7_MRmqNCWFIE18Cxg8tHUiuog';
var CLIENT_ID = '188720940383-7th3orj2hv2upbfl4ik6pmcr4on06qk8.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
var SCOPES =  'https://www.googleapis.com/auth/youtube.force-ssl';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var content = document.getElementById('content');
var channelForm = document.getElementById('channel-form');
// var channelInput = document.getElementById('channel-input');
var videoContainer = document.getElementById('video-container');

var defaultChannel = 'googledevelopers';

// channelForm.addEventListener('submit', e => {
//     e.preventDefault();
//     var channel = channelInput.value;
//     getChannel(channel);
// });

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  }

function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      console.log(error);
    });
  }

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        // content.style.display = 'block';
        // videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        // content.style.display = 'none';
        // videoContainer.style.display = 'none';

    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

function handleSignoutClick(event) {
   gapi.auth2.getAuthInstance().signOut();
}

// function appendPre(message) {
//     var pre = document.getElementById('content');
//     var textContent = document.createTextNode(message + '\n');
//     pre.appendChild(textContent);
// }

function showChannelData(data) {
    var channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

function getChannel(channel) {
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        id: 'UCe56UY0Ui8Mu3RttGaJpSBQ'
    })
    .then((response) => {
        console.log(response);
        var channel = response.result.items[0];
        var output =`
        <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscribers: ${channel.statistics.subscriberCount}</li>
            <li class="collection-item">Views: ${channel.statistics.viewCount}</li>
            <li class="collection-item">Title: ${channel.snippet.title}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/channel/${channel.id}">Visit Channel</a>
        <a class="btn red" onclick="addSubscription()">Subscribe</a>
        `;
        showChannelData(output);

        var playlistId = channel.contentDetails.relatedPlaylists.uploads;
        console.log(playlistId);
        requestVideoPlaylist(playlistId);
    });
}

function requestVideoPlaylist(playlistId) {
    console.log(playlistId);
    var requestOptions = {
      playlistId: playlistId,
      part: 'snippet',
      maxResults: 12
    };
  
    var request = gapi.client.youtube.playlistItems.list(requestOptions);
  
    request.execute((response) => {
      console.log(response);
      var playListItems = response.result.items;
      if (playListItems) {
        let output = '<br><h4 class="center-align">Latest Videos</h4>';
  
        playListItems.forEach(item => {
          var videoId = item.snippet.resourceId.videoId;
  
          output += `
            <div class="col s3">
            <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            </div>
          `;
        });
  
        videoContainer.innerHTML = output;
      } else {
        videoContainer.innerHTML = 'No Uploaded Videos';
      }
    });
  }

  function addSubscription() {
    var channelId = 'UCe56UY0Ui8Mu3RttGaJpSBQ';
    // var resource = {
    //   snippet: {
    //     resourceId: {
    //       kind: 'youtube#channel',
    //       channelId: channelId
    //     }
    //   }
    // };
    return gapi.client.youtube.subscriptions.insert({
      part: 'snippet',
      resource:{
        snippet:{
          resourceId:{
            kind: 'youtube#channel',
            channelId: channelId
          }
        }
      }
    })
    .then(function(response){
      console.log(response);
    }, function(err){
      console.log(err);
    })
    // try {
    //   // var response = gapi.client.youtube.subscriptions.insert(resource, 'snippet');
    // } catch (e) {
    //   if(e.message.match('subscriptionDuplicate')) {
    //     console.log('Cannot subscribe; already subscribed to channel: ' + channelId);
    //   } else {
    //     console.log('Error adding subscription: ' + e.message);
    //   }
    // }
  }
//   function requestVideoPlaylist(playlistId){
//     gapi.client.youtube.playlistItems.list({
//         playlistId: playlistId,
//         part: 'snippet',
//         maxResults: 12
//     })
//     .then((response) => {
//         console.log(response);
//           var playListItems = response.result.items;
//           if (playListItems) {
//             let output = '<br><h4 class="center-align">Latest Videos</h4>';
      
//             playListItems.forEach(item => {
//               var videoId = item.snippet.resourceId.videoId;
      
//               output += `
//                 <div class="col s3">
//                 <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
//                 </div>
//               `;
//             });
            
//             videoContainer.innerHTML = output;
//           } else {
//             videoContainer.innerHTML = 'No Uploaded Videos';
//           }
//     });
//   }
  