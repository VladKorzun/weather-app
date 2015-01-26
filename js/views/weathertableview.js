define(['jquery','underscore','backbone','appCollections/data'], function ($, _, Backbone, weatherData) {

    var weatherTableView = Backbone.View.extend({

        el: $('[data-table]'),

        tagName: "table",

        template: _.template($('[data-table-template]').html()),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template({weather: this.collection.toJSON()}));

        }

    });

    return weatherTableView;

});