// todo : forecast
// todo : unit selection
// todo : time zones (geht vermutlich nicht ohne npm package)
// todo : input error handling
// todo : unit selection
// todo : tablet version size fest einstellen
// todo : mobile version

// -----------------------------------------------------------------------------------------------

// * setting variables

const API_key = '14198a73da3c334daf2c8cc21dfb50db';
let city_name = 'Berlin';
let state_code = '';
let country_code = '';
let limit = 1;

let input = document.getElementById('locationInput');
let output = document.getElementById('locationOutput');
let location_value = '';
let geocode_fetch_link = '';

const unit = document.querySelectorAll('.unit');

const weekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
let weekday = '';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
let month = '';

// -----------------------------------------------------------------------------------------------

// * real time location input

input.addEventListener('input', (event) => {
  location_value = event.target.value;
  output.innerHTML = location_value;
});

// hier kann anschließend noch eine auswahl stattfinden welchen Ort man auswählen will, wenn das limit der anzezigten orte < 1 wäre
// (idee: loop der im html ein element mit dem orten erstellt als select oder radio vielleicht,
// der müsste dann aber schon nach dem geo data fetch stehen)
//
// * set input location and start fetch via button click

button.addEventListener('click', (event) => {
  event.preventDefault();
  city_name = location_value;
  //   # city_name input value aktualisierung wieder rein kommentieren !!!
  input.value = '';

  // display elements with content & hide start headline
  document.querySelectorAll('.hidden').forEach((element) => {
    element.classList.remove('hidden');
  });
  headline.classList.add('hidden');

  // update fetch link with input location and trigger function
  geocode_fetch_link = `https://api.openweathermap.org/geo/1.0/direct?q=${city_name}${state_code}${country_code}&limit=${limit}&appid=${API_key}`;
  fetchData();
});

// geocode_fetch_link = `http://api.openweathermap.org/geo/1.0/direct?q=${city_name}${state_code}${country_code}&limit=${limit}&appid=${API_key}`;

// ------------------------------------------------------------------------------------------------
// * geodata fetch ********************************************************************************
// ------------------------------------------------------------------------------------------------
//
const fetchData = () => {
  // # das wieder löschen ------------------------------------
  // document.querySelectorAll(".hidden").forEach((element) => {
  //   element.classList.remove("hidden");
  // });
  // headline.classList.add("hidden");
  // # ------------------------------------------------------

  fetch(geocode_fetch_link)
    .then((response) => response.json())
    .then((geo_data) => {
      // console.log("geocode:", { geo_data });
      //
      // * geo data processing
      let city = geo_data[0].name;
      let lat = geo_data[0].lat;
      let lon = geo_data[0].lon;
      let country = geo_data[0].country;
      // console.log(`geodata:  ${city}  ${country}  ${lon}  ${lat}`);
      //
      // output
      output.innerHTML = `${city}, ${country}`;

      //
      // ------------------------------------------------------------------------------------------
      // * current weather fetch ******************************************************************
      // ------------------------------------------------------------------------------------------
      //
      const current_weather_fetch_link = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`;

      const current_weather_fetch_link_imperial = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=imperial`;

      let unit_system = '°C';

      fetch(current_weather_fetch_link)
        .then((response) => response.json())
        .then((weather_data) => {
          console.log('current weather:', weather_data);
          //
          // * weather data processing
          //
          // * variables
          let icon = weather_data.weather[0].icon; // d oder n geht automatisch
          //
          let temp = weather_data.main.temp;
          let feels_like = weather_data.main.feels_like;
          //
          let dt = weather_data.dt;
          // ! Problem: mit new Date() bekommt man IMMER die Zeit in der system-timezone ausgegeben,
          // ! man kann sie also ohne eine geeignete Bibliothek gar nicht ohne weiteres richtig anzeigen
          // mit der toUTCString()-Methode kommt man nicht an den unix UTC timestamp, ist also nutzlos

          // ----------------------------------------------------------
          const timezone = weather_data.timezone;

          let unix_timestamp_ms = dt * 1000;
          let utc_time = new Date(unix_timestamp_ms);
          let local_timestamp = unix_timestamp_ms + timezone * 1000;
          let local_time = new Date(local_timestamp);

          // ! die Berechnung ist an sich korrekt, jedoch werden die Ergebnisse um +02:00 angezeigt
          // man könnte die 2 Stunden natürlich abziehen, aber wenn man die App in einem anderen Land
          // nutzt bringt das nichts mehr
          console.log({ utc_time });
          console.log({ local_time });
          // ----------------------------------------------------------

          // für weitere Berechnungen wird also die Systemzeit genutzt
          let data_time = new Date(dt * 1000);
          //
          let sunrise_date = new Date(weather_data.sys.sunrise * 1000);
          let sunset_date = new Date(weather_data.sys.sunset * 1000);
          //
          let humidity = weather_data.main.humidity; // in %
          let pressure = weather_data.main.pressure; // in hPa

          let clouds = weather_data.clouds.all; // in %
          let visibility = weather_data.visibility; // in m
          //
          let wind_speed = weather_data.wind.speed * 3.6; // m/s * 3.6 = km/h
          let wind_deg = weather_data.wind.deg; // 0-360°
          let wind_dir = '';
          //
          // console.log({ dt });
          // console.log({ data_time });
          // console.log({ timezone });
          // console.log({ unix_timestamp_ms });
          //
          // console.log({ sunrise });
          // console.log({ sunset });
          // console.log({ wind_dir });
          // console.log({ icon });
          //
          //
          // * output =====================================================================
          //
          // * weather & temperature
          iconHTML.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
          description.innerHTML = weather_data.weather[0].description;
          temperature.innerHTML = temp.toFixed();
          feel.innerHTML = `apparent air temperature: ${feels_like.toFixed()}`;
          unit.forEach((element) => {
            element.innerHTML = unit_system;
          });

          // * date & time
          weekday = weekdays[data_time.getDay()];
          month = months[data_time.getMonth()];

          let year = data_time.getFullYear();
          let day = data_time.getDate();
          let hour = data_time.getHours().toString().padStart(2, '0');
          let minute = data_time.getMinutes().toString().padStart(2, '0');

          date.innerHTML = `${month}  ${day}th ${year}`;

          time.innerHTML = `${weekday}, ${hour}:${minute}`;

          // * sun times
          let sunrise_hour = sunrise_date
            .getHours()
            .toString()
            .padStart(2, '0');
          let sunrise_min = sunrise_date
            .getMinutes()
            .toString()
            .padStart(2, '0');
          let sunset_hour = sunset_date.getHours().toString().padStart(2, '0');
          let sunset_min = sunset_date.getMinutes().toString().padStart(2, '0');

          sunrise.innerHTML = `${sunrise_hour}:${sunrise_min}`;
          sunset.innerHTML = `${sunset_hour}:${sunset_min}`;

          // * info
          humid.innerHTML = `${humidity} %`;
          airPressure.innerHTML = `${pressure} hPa`;
          windSpeed.innerHTML = `${wind_speed.toFixed()} km/h`;
          cloud.innerHTML = `${clouds} %`;
          view.innerHTML = `${visibility / 1000} km`;

          // function to transform wind degrees into cardinal diretions
          const windDir = () => {
            if (wind_deg >= 337.5 || wind_deg < 22.5) {
              wind_dir = 'North';
            } else if (wind_deg > 22.5 && wind_deg <= 67.5) {
              wind_dir = 'Northeast';
            } else if (wind_deg >= 67.5 && wind_deg < 112.5) {
              wind_dir = 'East';
            } else if (wind_deg >= 112.5 && wind_deg < 157.5) {
              wind_dir = 'Southeast';
            } else if (wind_deg >= 157.5 && wind_deg < 202.5) {
              wind_dir = 'South';
            } else if (wind_deg >= 202.5 && wind_deg < 247.5) {
              wind_dir = 'Southwest';
            } else if (wind_deg >= 247.5 && wind_deg < 292.5) {
              wind_dir = 'West';
            } else if (wind_deg >= 292.5 && wind_deg < 337.5) {
              wind_dir = 'Northwest';
            }
            windDirection.innerHTML = wind_dir;
          };
          windDir();
          //
          // current weather error:
        })
        .catch((error) => {
          console.error('error while loading current weather data', error);
        });
      //
      //
      // ------------------------------------------------------------------------------------------
      // * weather forecast fetch *****************************************************************
      // ------------------------------------------------------------------------------------------
      //
      const weather_forecast_fetch_link = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`;

      // console.log(weather_forecast_fetch_link);

      fetch(weather_forecast_fetch_link)
        .then((response) => response.json())
        .then((forecast_data) => {
          //
          // forecast data processing
          let pop = forecast_data.list[0].pop; // pop = probability of precipitation

          let forecast_temp = forecast_data.list[1].main.temp;
          let forecast_list = forecast_data.list;

          let pod = forecast_data.list[1].sys.pod; // pod = period od day? d/n

          // chance of rain output
          rainChance.innerHTML = `${pop * 100} %`;

          // # forecast (NOCH NICHT FERTIG) ---------------------------------------------
          // let forecast_time = new Date(forecast_data.list[1].dt * 1000);
          // let forecast_h = forecast_time.getHours().toString().padStart(2, "0");

          // console.log(forecast_temp);
          // console.log({ forecast_time });
          // console.log({ forecast_h });
          // console.log("forecast:", forecast_data);
          // console.log({ pop });
          // console.log({ pod }); // pod = period of day (d/n)
          // console.log({ forecast_list });

          //
          //
          //
          // * 24h forecast
          let temp_output_spans = document.querySelectorAll('.forecast-temp');
          let time_output_spans = document.querySelectorAll('.forecast-time');

          for (
            let i = 1;
            i < Math.min(forecast_list.length, temp_output_spans.length);
            i++
          ) {
            if (forecast_list[i]) {
              temp_output_spans[i].innerHTML = forecast_list[i].main.temp;

              //   let forecast_time = new Date(forecast_data.list[1].dt * 1000);
              //   let forecast_h = forecast_time
              //     .getHours()
              //     .toString()
              //     .padStart(2, "0");

              //   time_output_spans[i].innerHTML = forecast_h;
              //
              // # ---------------------------------------------------------------------
            }
          }

          //
          // forecast error:
        })
        .catch((error) => {
          console.error('error while loading weather forecast data', error);
        });
      //
      // ------------------------------------------------------------------------------------------
      // * current aqi fetch **********************************************************************
      // ------------------------------------------------------------------------------------------
      //
      const aqi_fetch_link = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_key}`;
      // console.log(aqi_fetch_link);
      //
      //
      fetch(aqi_fetch_link)
        .then((response) => response.json())
        .then((aqi_data) => {
          console.log('aqi data:', aqi_data);
          //
          // aqi data processing
          let aqi = aqi_data.list[0].main.aqi;
          //
          // output
          aqIndex.innerHTML = aqi;
          //
          // aqi error:
        })
        .catch((error) => {
          console.error('error while loading aqi data', error);
        });
      //
      // geocode error:
    })
    .catch((error) => {
      console.error('error while loading geocoding data', error);
    });
};
// # auch wieder löschen: -------------------------------------------
// fetchData();
