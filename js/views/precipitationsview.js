define(['jquery','backbone','Chart','appCollections/data'], function ($, Backbone, Chart, weatherData) {

    var precipitationsView = Backbone.View.extend({

        el: $('[data-precipitations]'),

        tagName: "canvas",

        template: $('[data-canvas-template]').html(),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template);

            var precipitations = this.collection.pluck("precipitations").map(Number);

            var precipitationsData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {
                        fillColor: "rgba(220,220,220,0.2)",

                        strokeColor: "rgba(220,220,220,1)",

                        pointColor: "rgba(220,220,220,1)",

                        pointStrokeColor: "#fff",

                        pointHighlightFill: "#fff",

                        pointHighlightStroke: "rgba(220,220,220,1)",

                        data: precipitations
                    }
                ]

            };

            var max = _.max(precipitations) + 1;

            var min = _.min(precipitations) - 1;

            var steps = max - min;

            var ctx = $("[data-precipitations] canvas").get(0).getContext("2d");

            var precipitationsChart = new Chart(ctx).Line(precipitationsData, {

                scaleOverride: true,

                scaleSteps: steps,

                scaleStepWidth: 1,

                scaleStartValue: min
            });

        }

    });

    return precipitationsView;

});