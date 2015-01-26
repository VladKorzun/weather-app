define(['backbone'], function (Backbone) {

    var weather = Backbone.Model.extend({

        defauts: {
            date: "",
            temperature: 0,
            humidity: 0,
            precipitations: 0
        }

    });

    return weather;
    
});

