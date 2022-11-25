// Global Variables
var apiRequest;
var places = []
var selection = "FI"
var easter_egg = false;
var dataDate = "00/00";
var min_treshold = 15
var max_treshold = 30
var todaysPrices = [];
// Format, {hour : 0, price : '000,00'} price in mwh.


API = "https://api.vsim.xyz/api/nordpool"
function loadData(url) {
    // Create and follow the API call.
    apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", url);
    
    apiRequest.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
    
    
    apiRequest.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        getContents();
      }
    };

    apiRequest.send();
}


function getContents() {
    let data;
    let hour = 0;

    // Receive data from API 
    if (apiRequest.readyState === XMLHttpRequest.DONE) {
      if (apiRequest.status === 200) {
        data = JSON.parse(apiRequest.responseText);
      
      } else {
        console.log("There was a problem with the request.");
      }

    }

    if (data == undefined) {
      console.log("Data undefined. Is the API offline?")
      return;
    }

    // Parse received data.
    // Determine row & colum lengths
    let row_length =     data["data"]["Rows"].length
    let columns_length = data["data"]["Rows"][1]["Columns"].length   

    for (let i = 0; i < row_length; i++) {
      for (let j = 0; j < columns_length; j++) {
        let hourToPrice = {}
        let index = data["data"]["Rows"][i]["Columns"][j]
        let place = index["Name"]
        if (places.includes(place) != true) {
          places.push(place)
        }

        // After finding Name and Index, find the ones that consider Finland (FI)
        if (place == selection && hour < 24) {
            hourToPrice.hour = hour;
            hourToPrice.price = index["Value"];
            todaysPrices[hour] = hourToPrice;
            hour++;
            break;
        }
      }
    }

    // Parse the date of the data, as it can be either for tomorrow or today.
    dataDate =
      data["data"]["DataStartdate"].split("-")[2].replace("T00:00:00", "")
      + "/" +
      data["data"]["DataStartdate"].split("-")[1]

    updateContent()
}


function updateContent() {
  let avg = 00;
  let total = 0;
  let grid = document.getElementsByClassName("grid-item")

  // Colour in hours based on their prices
  // and calculate the sum to get the avg price.
  for (let i = 0; i < todaysPrices.length; i++) {
    let hourData = todaysPrices[i];
    let price = parseInt(hourData.price) / 10
      
    if (price <= min_treshold) {
      grid[i].id = "min"
    }

    if (price >= max_treshold) {
      grid[i].id = "max"
    }

    if (price > min_treshold && price < max_treshold) {
      grid[i].id = "avg"
    }

    let hourPrice = parseInt(hourData.price)
    total = parseInt(total) + hourPrice
  }

  avg = total / 24 / 10
  avg = avg.toString().slice(0, 5)

  document.getElementById("date").innerHTML = `${dataDate}`
  document.getElementById("average_price").innerHTML = `${avg}`

  if (places.length > 0) {
    let select = document.getElementById("location")
    select.innerHTML = ""
  }

  let first_option = document.createElement("option")
  first_option.value= "" 
  first_option.disabled = true
  first_option.selected = true
  first_option.innerHTML = selection
  document.getElementById("location").appendChild(first_option)


  for (let i = 0; i < places.length; i++) {
    let new_option = document.createElement("option");
        new_option.value = places[i];
        new_option.innerHTML = places[i];

    document.getElementById("location").appendChild(new_option)
    document.getElementById("place").innerHTML = selection;
  }
}

function toggleEasterEgg()  {  
  let color = "white"
  let bg_color = "black"
  let mainclass = "main"

  if (easter_egg != true) {
      
    easter_egg = true;
    color = "white"
    mainclass = "x-main"
    bg_color = "rgb(22,22,22)"

  } else {
    easter_egg = false;
    color = "black"
    bg_color = "white"
    mainclass = "main"
  }

  let main = document.getElementsByClassName("main")[0] 
          || document.getElementsByClassName("x-main")[0];
  let h2 = document.getElementsByTagName("h2")[0];
  let h6 = document.getElementsByTagName("h6")[0];
  let divs = document.getElementsByTagName("header");
  let paragraphs = document.getElementsByTagName("p");

  h2.style.color = color
  h6.style.color = color
  main.style.backgroundColor = bg_color 
  main.className = mainclass
  document.body.style.backgroundColor = bg_color 

  for (let i = 0; i < divs.length; i++) {
    divs[i].style.backgroundColor = bg_color 
  }

  for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.color = color
  }
}

window.onload = function() {
  // Get the data upon loading the window.
  loadData(`${API}`)

  // pressing enter triggers the "+" button
  let input_fields = document.getElementsByClassName("adjust")
  for (let i = 0; i < input_fields.length; i++) {
  
    input_fields[i].addEventListener("keypress", function(event) {
    
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("treshold_button").click();
      }
    })
  } 

  /* Add functionalities to the buttons. */
  document.getElementById("treshold_button").addEventListener("click", function() {
    min_treshold = parseInt(document.getElementById("min_input").value)
    max_treshold = parseInt(document.getElementById("max_input").value)
  
    updateContent();
  })

  // Add functionalities to the button.
  document.getElementById("location").onchange = function() {
    let new_place = document.getElementById("location").value
    selection = new_place;
    loadData(`${API}`)
  }

  // Add easter egg
  document.getElementById("top_button").addEventListener("click", function() {
    toggleEasterEgg();

  })
}