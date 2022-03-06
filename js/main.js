let weatherApp = new Vue({
    el: '#app',
    data: {
        city: "Томск",
        state:"Томская область",
        today: new Date().toLocaleString('ru', {
            hour: "2-digit",
            minute: "2-digit",
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        cords: {
            lon: null,
            lat: null
        },
        main: {},
        hourly: [],
        daily: [],
        temp_max: null,
        temp_min: null,
    },
    methods: {
        async getCoords() {
            let coords = `https://api.openweathermap.org/geo/1.0/direct?q=${this.city}&appid=54b5f11039f5546975e7028ae4a4a043&lang=ru`;

            await axios
                .get(coords)
                .then(response => {
                    this.city = response.data[0].name
                    this.state = response.data[0].state
                    this.cords.lat = response.data[0].lat;
                    this.cords.lon = response.data[0].lon;
                    this.country = response.data[0].country;
                    this.getWeather();
                })
                .catch(error => {
                    console.log(error);
                });

        },
        async getWeather() {
            let weatherToday = `https://api.openweathermap.org/data/2.5/onecall?lat=${this.cords.lat}&lon=${this.cords.lon}&appid=54b5f11039f5546975e7028ae4a4a043&lang=ru`;

            await axios
                .get(weatherToday)
                .then(response => {
                    this.main = response.data.current;
                    this.main.sunrise = this.getDateUnix(this.main.sunrise);
                    this.main.sunset = this.getDateUnix(this.main.sunset);

                    this.hourly = response.data.hourly
                        .filter(function (_, i) {
                            return i % 2 === 0;
                        });

                    this.hourly.length = 7;
                    this.daily = response.data.daily;

                    this.hourly.forEach(el => {
                        el.image = `http://openweathermap.org/img/wn/${el.weather[0].icon}@2x.png`;
                    })

                    this.main.image = `http://openweathermap.org/img/wn/${this.main.weather[0].icon}@2x.png`
                    this.getMinMax();
                })
                .catch(error => {
                    console.log(error);
                });
        },
        async getMinMax() {
            let minMaxTemp = `https://api.openweathermap.org/data/2.5/weather?lat=${this.cords.lat}&lon=${this.cords.lon}&appid=54b5f11039f5546975e7028ae4a4a043&lang=ru`;
            await axios
                .get(minMaxTemp)
                .then(response => {
                    this.temp_max = Number(response.data.main.temp_max);
                    this.temp_min = Number(response.data.main.temp_min);
                })
                .catch(error => {
                    console.log(error);
                });
        },
        async getCityAndState() {
            let Temp = `https://api.openweathermap.org/data/2.5/weather?lat=${this.cords.lat}&lon=${this.cords.lon}&appid=54b5f11039f5546975e7028ae4a4a043&lang=ru`;
            await axios
                .get(Temp)
                .then(response => {
                    this.city = response.data.name;
                   this.getCoords();
                })
                .catch(error => {
                    console.log(error);
                });
        },
        getDateUnix(el) {
            return (new Date(el * 1000)).toLocaleString('ru', {
                hour: '2-digit',
                minute: '2-digit',
            })
        },
        getWeekDay(date) {
            let days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

            return days[date.getDay()];
        },
    },
    beforeMount() {
        this.getCoords();
    },

});