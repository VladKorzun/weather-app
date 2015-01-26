define(['jquery','backbone','Chart','appCollections/data'], function ($, Backbone, Chart, weatherData) {

    var humidityView = Backbone.View.extend({

        el: $('[data-humidity]'),

        tagName: "canvas",

        template: $('[data-canvas-template]').html(),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template);

            var humidity = this.collection.pluck("humidity").map(Number);

            var humidityData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {
                        fillColor: "rgba(191, 240, 142, 1)",

                        strokeColor: "rgba(220,220,220,1)",

                        pointColor: "rgba(220,220,220,1)",

                        pointStrokeColor: "#fff",

                        pointHighlightFill: "#fff",

                        pointHighlightStroke: "rgba(220,220,220,1)",

                        data: humidity
                    }
                ]

            };

            var max = _.max(humidity) + 1;

            var min = _.min(humidity) - 1;

            var steps = max - min;

            var ctx = $("[data-humidity] canvas").get(0).getContext("2d");

            var humidityChart = new Chart(ctx).Line(humidityData, {

                scaleOverride: true,

                scaleSteps: steps,

                scaleStepWidth: 1,

                scaleStartValue: min
            });

        }

    });

    return humidityView;

});