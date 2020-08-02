// var CLIENT_ID = '188720940383-9h1q9rc44f0g0llre09g68b26301l81h.apps.googleusercontent.com';
// var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
var SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var content = document.getElementById('content');
var channelForm = document.getElementById('channel-form');
var channelInput = document.getElementById('channel-input');
var videoContainer = document.getElementById('video-container');

var defaultChannel = 'The IndianFirebolt';

channelForm.addEventListener('submit', e => {
    e.preventDefault();
    var channel = channelInput.value;
    getChannel(channel);
});

function handleClinetLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';
    gapi.client.init({
        // discoveryDocs: DISCOVERY_DOCS,
        // clientId: CLIENT_ID,
        // scope: SCOPES
        'apiKey': 'AIzaSyAzJrieP_7_MRmqNCWFIE18Cxg8tHUiuog',
        'clientId': '188720940383-9h1q9rc44f0g0llre09g68b26301l81h.apps.googleusercontent.com',
        'discoveryDocs': [discoveryUrl],
        'scope': SCOPE
    }).then(()=> {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';

    }
}

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

function showChannelData(data) {
    var channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

function getChannel(channel) {
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
    })
    .then(response => {
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
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
        `;
        showChannelData(output);

        var playlistId = channel.contentDetals.relatedPlaylists.uploads;
        requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No channel'));
}

function requestVideoPlaylist(playlistId){
    var requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    }

    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(response => {
        console.log(response);
        var playlistItems = response.result.items;
        if(playlistItems) {
            let = '<br><h4 class="center-align">Latest Videos</h4>';
            playlistItems.forEach(item => {
                var videoId = item.snippet.resourceId.videoId;
                output += `
                    <div class="col s3">
                    <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div> 
                `;
            });
            videoContainer.innerHTML = output;
        } else {
            videoContainer.innerHTML = 'No Uploaded Videos';
        }
    });
}