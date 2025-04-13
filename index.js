const API_KEY = 'YOUR API KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

document.addEventListener('DOMContentLoaded', () => {
    
    const input = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');
    const weatherIcon = document.querySelector('.weather-icon');
    const locationEl = document.querySelector('.location');
    const tempEl = document.querySelector('.temperature');
    const conditionEl = document.querySelector('.condition');
    const humidityEl = document.querySelector('.weather-details div:nth-child(1) p');
    const windEl = document.querySelector('.weather-details div:nth-child(2) p');
    const pressureEl = document.querySelector('.weather-details div:nth-child(3) p');
    const forecastContainer = document.querySelector('.forecast-cards');

    
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    searchBtn.addEventListener('click', handleSearch);

    
    function handleSearch() {
        const city = input.value.trim();
        if (city === '') {
            showError('Please enter a city name');
            return;
        }
        fetchWeather(city);
    }

    function showError(message) {
        alert(message);
        input.focus();
    }

    async function fetchWeather(city) {
        try {
            // Show loading state
            locationEl.textContent = 'Loading...';
            tempEl.textContent = '--°C';
            conditionEl.textContent = '';
            
            const response = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await response.json();
            
            if (data.cod !== 200) {
                showError('City not found. Please try another location.');
                resetWeatherDisplay();
                return;
            }

            updateCurrentWeather(data);
            fetchForecast(city);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            showError('Failed to fetch weather data. Please try again.');
            resetWeatherDisplay();
        }
    }

    function updateCurrentWeather(data) {
        locationEl.textContent = `${data.name}, ${data.sys.country}`;
        tempEl.textContent = `${Math.round(data.main.temp)}°C`;
        conditionEl.textContent = data.weather[0].description;
        humidityEl.textContent = `${data.main.humidity}%`;
        windEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
        pressureEl.textContent = `${data.main.pressure} hPa`;
        
        // Update weather icon
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.alt = data.weather[0].description;
        weatherIcon.style.display = 'block';
    }

    function resetWeatherDisplay() {
        locationEl.textContent = '--';
        tempEl.textContent = '--°C';
        conditionEl.textContent = '--';
        humidityEl.textContent = '--%';
        windEl.textContent = '-- km/h';
        pressureEl.textContent = '-- hPa';
        weatherIcon.style.display = 'none';
        forecastContainer.innerHTML = '';
    }

    async function fetchForecast(city) {
        try {
            const response = await fetch(`${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await response.json();
            
            if (data.cod !== "200") {
                return;
            }

            forecastContainer.innerHTML = '';
            const dailyForecasts = {};

            // Process forecast data to get one entry per day
            data.list.forEach((entry) => {
                const date = new Date(entry.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Use noon forecast for each day (or closest available)
                if (!dailyForecasts[day] || (date.getHours() >= 11 && date.getHours() <= 14)) {
                    dailyForecasts[day] = {
                        temp: entry.main.temp,
                        icon: entry.weather[0].icon
                    };
                }
            });

            // Display next 5 days (excluding today)
            const days = Object.keys(dailyForecasts);
            for (let i = 1; i <= Math.min(5, days.length - 1); i++) {
                const day = days[i];
                forecastContainer.innerHTML += `
                    <div class="forecast-card">
                        <div class="day">${day}</div>
                        <img src="https://openweathermap.org/img/wn/${dailyForecasts[day].icon}.png" alt="Weather icon">
                        <div class="temp">${Math.round(dailyForecasts[day].temp)}°C</div>
                    </div>`;
            }
        } catch (error) {
            console.error('Error fetching forecast data:', error);
        }
    }

    // Initialize with default city
    fetchWeather('Jaipur');
});
