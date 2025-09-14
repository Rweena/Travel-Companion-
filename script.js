document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeSwitch = document.getElementById('theme-switch');
    const themeIcon = document.getElementById('theme-icon');
    const myTripBtn = document.getElementById('myTripBtn');
    const myTicketBtn = document.getElementById('myTicketBtn');
    const apisSection = document.getElementById('apis');
    const ticketSection = document.getElementById('ticket');
    const weatherInput = document.getElementById('destinationInput');
    const getWeatherBtn = document.getElementById('getWeatherBtn');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherCondition = document.getElementById('weather-condition');
    const weatherHumidity = document.getElementById('weather-humidity');
    const dailyBudgetInput = document.getElementById('dailyBudget');
    const estimateBudgetBtn = document.getElementById('estimateBudgetBtn');
    const totalBudgetDisplay = document.getElementById('totalBudget');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startCountdownBtn = document.getElementById('startCountdownBtn');
    const countdownDisplay = document.getElementById('countdown-display');
    const destinationVideo = document.getElementById('destinationVideo');
    const downloadTicketBtn = document.getElementById('downloadTicketBtn');

    const applyTheme = () => {
        const theme = localStorage.getItem('travelAppTheme') || 'light';
        body.classList.toggle('dark-theme', theme === 'dark');
        themeIcon.innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };

    themeSwitch.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const newTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('travelAppTheme', newTheme);
        applyTheme();
    });
    applyTheme();

    myTripBtn.addEventListener('click', () => {
        apisSection.scrollIntoView({ behavior: 'smooth' });
    });

    const updateTicketView = async () => {
        const destination = weatherInput.value.trim();
        const startDateVal = startDateInput.value;
        if (!destination || !startDateVal) {
            alert("Please fill in the destination and start date first.");
            return;
        }

        document.getElementById('ticket-destination').textContent = destination;
        document.getElementById('ticket-start-date').textContent = new Date(startDateVal).toLocaleDateString();
        if (endDateInput.value) {
            document.getElementById('ticket-end-date').textContent = new Date(endDateInput.value).toLocaleDateString();
        }
        if(dailyBudgetInput.value && endDateInput.value){
            const dailyBudget = parseFloat(dailyBudgetInput.value) || 0;
            const start = new Date(startDateVal);
            const end = new Date(endDateInput.value);
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            document.getElementById('ticket-budget').textContent = `$${(dailyBudget * days).toFixed(2)}`;
        }

        const ticketCountdownContainer = document.getElementById('ticket-countdown');
        const startDate = new Date(startDateVal);
        if (window.ticketCountdownInterval) clearInterval(window.ticketCountdownInterval);
        window.ticketCountdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = startDate - now;
            if (distance < 0) {
                clearInterval(window.ticketCountdownInterval);
                ticketCountdownContainer.innerHTML = '<span>Trip has started!</span>';
                return;
            }
            const d = Math.floor(distance / 86400000);
            const h = Math.floor((distance % 86400000) / 3600000);
            const m = Math.floor((distance % 3600000) / 60000);
            const s = Math.floor((distance % 60000) / 1000);
            ticketCountdownContainer.innerHTML = `<span>${String(d).padStart(2, '0')}d</span>:<span>${String(h).padStart(2, '0')}h</span>:<span>${String(m).padStart(2, '0')}m</span>:<span>${String(s).padStart(2, '0')}s</span>`;
        }, 1000);

        try {
            const API_KEY = '35c13a9fa5b127199feafb1d433ed610';
            if (!API_KEY) throw new Error("OpenWeatherMap API Key is missing.");

            const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(destination)}&units=metric&appid=${API_KEY}`);
            const weatherData = await weatherRes.json();
            if (weatherData.cod !== 200) throw new Error(weatherData.message);

            const temp = Math.round(weatherData.main.temp);
            document.getElementById('ticket-weather-location').textContent = weatherData.name;
            document.getElementById('ticket-weather-temp').textContent = temp;
            document.getElementById('ticket-weather-condition').textContent = weatherData.weather[0].description;
            document.getElementById('ticket-weather-icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="Weather icon">`;
            
            const weatherCardTicket = document.getElementById('ticket-weather-card');
            weatherCardTicket.className = 'weather-card-ticket';
            if (temp <= 5) weatherCardTicket.classList.add('cold');
            else if (temp <= 15) weatherCardTicket.classList.add('cool');
            else if (temp <= 25) weatherCardTicket.classList.add('warm');
            else if (temp > 25) weatherCardTicket.classList.add('hot');
            else weatherCardTicket.classList.add('neutral');
        } catch (err) {
            console.error('Error fetching weather:', err);
        }

        try {
            const PEXELS_API_KEY = 'jzN7QMzwJDItRE9XjLi39p7y5GgYSXiKwrRRpUWrrqnPhZNwyeiXLDrO';
            if (!PEXELS_API_KEY) throw new Error("Pexels API Key is missing.");

            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(destination + ' travel landmark')}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await res.json();
            const imageContainer = document.getElementById('ticket-image-container');
            if (data.photos && data.photos.length > 0) {
                imageContainer.style.backgroundImage = `url('${data.photos[0].src.large2x}')`;
                imageContainer.innerHTML = '';
            }
        } catch (err) {
            console.error('Error fetching image:', err);
        }
    };

    myTicketBtn.addEventListener('click', () => {
        updateTicketView();
        ticketSection.scrollIntoView({ behavior: 'smooth' });
    });

    downloadTicketBtn.addEventListener('click', () => {
        const ticketElement = document.getElementById('planeTicket');
        const destination = document.getElementById('ticket-destination').textContent || 'trip';
        ticketElement.offsetHeight; 
        const options = {
            margin:       0,
            filename:     `${destination}-ticket.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { 
                scale: 2,
                useCORS: true,
                backgroundColor: null, 
                allowTaint: true, 
                logging: true
            },
            jsPDF:        { unit: 'in', format: [10, 5], orientation: 'landscape' }
        };
    

        const preloadImages = () => {
            const images = Array.from(ticketElement.querySelectorAll('img'));
            const bg = window.getComputedStyle(ticketElement).backgroundImage;
            if (bg && bg !== 'none') {
                const url = bg.slice(5, -2); // extract url("...")
                images.push(Object.assign(new Image(), { src: url }));
            }
            return Promise.all(images.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                });
            }));
        };
    
        preloadImages().then(() => {
            html2pdf().from(ticketElement).set(options).save();
        });
    });
    
    

    getWeatherBtn.addEventListener('click', async () => {
        const destination = weatherInput.value.trim();
        if(!destination) return;
        try{
            const API_KEY = '35c13a9fa5b127199feafb1d433ed610'; 
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(destination)}&units=metric&appid=${API_KEY}`);
            const data = await res.json();
            weatherTemp.textContent = ` ${data.main.temp} °C`;
            weatherCondition.textContent = ` ${data.weather[0].description}`;
            weatherHumidity.textContent = ` ${data.main.humidity}%`;
            weatherInfoDiv.classList.remove('hidden');
            fetchPexelsVideo(destination);
        } catch(err){
            alert('Error fetching weather: '+ err.message);
        }
    });

    estimateBudgetBtn.addEventListener('click', () => {
        const dailyBudget = parseFloat(dailyBudgetInput.value) || 0;
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        totalBudgetDisplay.textContent = `$${(dailyBudget * days).toFixed(2)}`;
    });

    let countdownInterval;
    startCountdownBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        const startDate = new Date(startDateInput.value);
        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = startDate - now;
            if(distance < 0){
                clearInterval(countdownInterval);
                countdownDisplay.querySelectorAll('span').forEach(span => span.textContent = '00');
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownDisplay.querySelector('#days').textContent = String(days).padStart(2, '0');
            countdownDisplay.querySelector('#hours').textContent = String(hours).padStart(2, '0');
            countdownDisplay.querySelector('#minutes').textContent = String(minutes).padStart(2, '0');
            countdownDisplay.querySelector('#seconds').textContent = String(seconds).padStart(2, '0');
        }, 1000);
    });

    async function fetchPexelsVideo(destination){
        const API_KEY = ' jzN7QMzwJDItRE9XjLi39p7y5GgYSXiKwrRRpUWrrqnPhZNwyeiXLDrO'; 
        try{
            const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(destination)}&per_page=1`, {
                headers: {Authorization: API_KEY}
            });
            const data = await res.json();
            if(data.videos && data.videos.length){
                destinationVideo.innerHTML = `<video controls autoplay muted loop width="100%"><source src="${data.videos[0].video_files[0].link}" type="video/mp4"></video>`;
            } else{
                destinationVideo.innerHTML = `<p class="text-center mt-3">No video available.</p>`;
            }
        } catch(err){
            console.error(err);
        }
    }
});