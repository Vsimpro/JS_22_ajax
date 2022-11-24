// Global Variables
var dataDate = "00/00";
var httpRequest;
var min_treshold = 15
var max_treshold = 30
var todaysPrices = [];
// Format, {hour : 0, price : '000,00'} price in mwh.


API = "https://www.nordpoolgroup.com/api/marketdata/page/10?currency=eur"
function loadData(url) {
    // Create and follow the API call.
    httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url);
    httpRequest.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        getContents();
      }
    };

    httpRequest.send();
}


function getContents() {
    let data;
    let hour = 0;

    // Receive data from API 
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        data = JSON.parse(httpRequest.responseText);
      
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

        // After finding Name and Index, find the ones that consider Finland (FI)
        if (place == "FI" && hour < 24) {
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
}


window.onload = function(){
  // Get the data upon loading the window.
  loadData(`${API}`)

  // pressing enter triggers the "+" button
  let input_fields = document.getElementsByClassName("adjust")
  console.log(input_fields)
  for (let i = 0; i < input_fields.length; i++) {
  
    input_fields[i].addEventListener("keypress", function(event) {
    
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("treshold_button").click();
      }
    })
  }

  // Add functionalities to the button.
  document.getElementById("treshold_button").addEventListener("click", function() {
    min_treshold = parseInt(document.getElementById("min_input").value)
    max_treshold = parseInt(document.getElementById("max_input").value)
  
    updateContent();
  })
};