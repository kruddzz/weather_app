// all the code will be ready to run when the page renders
$(document).ready(function() {
  // J Query grabs the search-button id
  // .on("click", function) makes it a clickable button
  $("#search-button").on("click", function() {
    // pulls value from the text box
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");
    // calls on the searchWeather function
    searchWeather(searchValue);
  });
  // makes history list clickable
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });
  // this function makes rows to add items to the search history list
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }
  // the search weather function searches the openweathermap api and returns data about the desired city. 
  function searchWeather(searchValue) {
    // ajax makes it possbile to exchange data with the api server and update the web page withput having to reload the whole webpage. 
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=0ab6dfb51cca2642d6975b1374fdbe58&units=imperial",
      dataType: "json",
      // if search is successful in finding weather data for your city 
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        getHourly(data.coord.lat, data.coord.lon);
      }
    });
  }
  // this function gets Gets 5 day forcast
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=0ab6dfb51cca2642d6975b1374fdbe58&units=imperial",
      dataType: "json",
      // if the api succesfully grabs the forcast for your city.
      success: function(data) {
        // console.log(data);
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");
            // dislpays the date on the top of each day in the 5 day forcast
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            // grabs icon image
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            // dislpays the temp from the api data
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // displays the humidity from the api data
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  // This function will get the uv index for the city
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=0ab6dfb51cca2642d6975b1374fdbe58&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        // appends the data to the today id in the html
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }
  // Our group added an hourly function to the application
  function getHourly(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon +"&appid=0ab6dfb51cca2642d6975b1374fdbe58&units=imperial", 
      dataType: "json",
      success: function(data) {
        // console.log(data)
        $('#hourly').html("<h4 class=\"mt-3\">Hourly Forecast:</h4>").append("<div class=\"row\">");
        for (var i = 0; i < 5 ; i++) {
          var currentHourTemp = data.hourly[i].temp;
          // var hour uses moment.js to help hourly time element in the new function
          var hour = moment().startOf("hour");
          
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

          // console.log(hour.add(i, "h"));
            // print time
            // .add mutates the moments.js
            var time = $("<div>").text(hour.add(i, "h").format("h a"));
            // console.log(time);
            // grabs icon picture
            var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.hourly[i].weather[0].icon + ".png");
            // console.log(img);
            // grabs temperature
            var p1 = $("<p>").addClass("card-text").text("Temp: " + currentHourTemp + " °F");
            console.log(p1);

            // merge together and put on page
            col.append(card.append(body.append(time, img, p1)));
            $("#hourly .row").append(col);
          }
        }
    });
    
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
  // displays the last item in search history
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
  // creates a button for each item in the history
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
