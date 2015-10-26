var app = {};

$(function() {

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  var whiteSpace = function(string) {
    return string.split(' ').join('');
  };

  var escapeHtml = function(string) {
    if (string === undefined) {
      return '';
    };
    return String(string).replace(/[&<>"'\/]/g, function(s) {
      return entityMap[s];
    });
  };

  var searchParams = function() {
    var search = window.location.search.substr(1),
      params = {};

    search = search.split('&');

    _.each(search, function(pair) {
      pair = pair.split('=');
      params[escapeHtml(decodeURI(pair[0]))] = escapeHtml(decodeURI(pair[1]));
    });
    return params;
  };

  app = {
    server: 'https://api.parse.com/1/classes/chatterbox',
    currentUsername: searchParams().username,
    currentRooms: {},
    messages: [],
    friends: {},
    filterFunc: null,

    $main: $('#main'),
    $send: $('#send'),
    $messageInput: $('#message'),
    $refreshMessages: $('#refreshMessages'),
    $roomSelect: $('#roomSelect'),
    $addNewRoom: $('#addNewRoom'),
    $newRoomInput: $('#newRoom'),
    $chats: $('#chats'),
    $friendList: $('#friendList'),
    $spiffyGif : $('#spiffyGif')

  };

  app.init = function() {
    
    app.toggleSpinner();

    app.fetch();

    app.$main.on('click', '.username', app.addFriend);
    app.$send.on('submit', app.handleSubmit);
    app.$refreshMessages.on('click', app.fetch);
    app.$roomSelect.on('change', app.changeRooms);
    app.$addNewRoom.on('click', app.addRoom);

    setInterval(app.fetch, 5000);
  };

  // Posts a messsage to the server
  app.send = function(message) {
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('chatterbox: Message sent. Data: ', data);
      },
      error: function(data) {
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });
  };

  // Fetches all messages from the server
  app.fetch = function() {
    app.toggleSpinner();
    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      data : { order : '-createdAt' },
      success: function(data) {
        // Results array from Data object
        app.messages = data.results;
        app.displayRooms();
        app.displayMessages();
        console.log('chatterbox: Message recieved. Data: ', data);
      },
      error: function(data) {
        console.error('chatterbox: Failed to fetch messages. Error: ', data);
      },
      complete: function(){
        app.toggleSpinner();
      }
    });
  };

  app.toggleSpinner = function() {
    app.$spiffyGif.toggle();
  };

  // Empties the messages container
  app.clearMessages = function() {
    app.$chats.html('');
  };

  // Takes an array of messages and builds the html for each one.
  // Appends to #chats element
  app.addMessage = function(message) {

    var classString = '';

    var html = $('<div>').addClass('chat');

    var username = $('<a>').attr('href', '#')
      .data('username', message.username)
      .addClass('username ' + whiteSpace(escapeHtml(message.username)))
      .html(decodeURI(escapeHtml(message.username)));

    var timeStamp = $('<span>').addClass('timeStamp').html(' : ' + moment(message.createdAt).fromNow());

    var msgText = $('<p>')
      .addClass('messageText').html(escapeHtml(message.text));

    html.append(username, timeStamp, msgText)
    app.$chats.append(html);
  };

  // Displays all messages passed through the current filter function if set
  app.displayMessages = function() {
    app.clearMessages();

    var messages = app.messages;

    if (app.filterFunc) {
      messages = _.filter(messages, app.filterFunc);
    }

    _.each(messages, function(message) {
      app.addMessage(message);
    });
  };

  app.displayRooms = function() {
    var messages = app.messages;

    if (app.filterFunc) {
      messages = _.filter(messages, app.filterFunc);
    }

    _.each(messages, function(message) {
      app.addRoom(message.roomname);
    });
  };

  // Adds a new room
  app.addRoom = function(roomname, changeToNewRoom) {

    var changeToNewRoom = changeToNewRoom || false;

    if (typeof roomname === 'object') {
      changeToNewRoom = true;
      roomname = app.$newRoomInput.val();
      app.$newRoomInput.val('');
    }

    if (roomname && !app.currentRooms[roomname]) {

      var option = $('<option>')
        .text(roomname)
        .val(roomname);

      app.$roomSelect
        .append(option);

      app.currentRooms[roomname] = true;
    }

    if (roomname && changeToNewRoom) {
      app.$roomSelect.val(roomname);
      app.changeRooms();
    }
  };

  app.changeRooms = function() {
    var room = app.$roomSelect.val();

    if(room === '__newroom'){
      room = window.prompt('New Room Name: ');
      app.addRoom(room, true);
    }
    if(room){  
      if (room === 'null') {
        app.filterFunc = null;
      } else {
        app.filterFunc = function(message) {
          return message.roomname === room;
        }
      }
      app.displayMessages();
    }
  };

  // Add a new friend
  app.addFriend = function(friend) {

    if (typeof friend === 'object') {
      friend.preventDefault();
      friend = $(this).data('username');
    }

    if (!app.friends[friend]) {
      app.friends[friend] = true;
      var html = $('<li>').text(friend);
      app.$friendList.append(html);
    }

    var classStr = whiteSpace(friend);
    $('.' + classStr).siblings('.messageText').addClass('friendText');
  };

  app.handleSubmit = function(e) {
    e.preventDefault();
    var message = {
      username: app.currentUsername,
      text: app.$messageInput.val(),
      roomname: app.$roomSelect.val()
    };
    app.send(message);
    app.$messageInput.val('');
  };
});
