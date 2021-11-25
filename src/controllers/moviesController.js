const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { validationResult } = require('express-validator');


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },

    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },

    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },

    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    
    add: function (req, res) {
        
        Genres.findAll()

        .then(allGenres => {
            res.render('moviesAdd', {allGenres})
        })

        .catch(err => {
            res.send(err)
        })
    },

    create: function (req, res) {

        const errors = validationResult(req);

        if (errors.isEmpty()) {

            Movies.create(req.body)

            .then(movie => {
                res.redirect("/movies")
            })

            .catch(err => {
                res.send(err)
            })

        } else {

            Genres.findAll()

            .then(allGenres => {
                res.render('moviesAdd', {allGenres, errors: errors.mapped(), old: req.body});
            })

            .catch(err => {
                res.send(err)
            })
        }
    },

    edit: function(req, res) {

        const movie = Movies.findOne({
            where: {
                id: req.params.id
            },
            include: ['genre']
        })

        const genres = Genres.findAll()

        Promise.all([movie, genres])

        .then(([movie, genres]) => {
            res.render('moviesEdit', {Movie: movie, allGenres: genres})
        })

        .catch(err => {
            res.send(err)
        })
    },

    update: function (req,res) {

        const errors = validationResult(req);

        if (errors.isEmpty()) {

            Movies.update(req.body,{
                where: {id: req.params.id}
            })
    
            .then(movie => {
                res.redirect("/movies")
            })
    
            .catch(err => {
                res.send(err)
            })
            
        } else {

            const movie = Movies.findOne({
                where: {
                    id: req.params.id
                },
                include: ['genre']
            })

            const genres = Genres.findAll()

            Promise.all([movie, genres])

            .then(([movie, genres]) => {
                res.render('moviesEdit', {Movie: movie, allGenres: genres, errors: errors.mapped(), old: req.body})
            })

            .catch(err => {
                res.send(err)
            })
        }; 
    },

    delete: function (req, res) {

        Movies.findByPk(req.params.id)

        .then(Movie => {
            res.render('moviesDelete', {Movie})
        })

        .catch(err => {
            res.send(err)
        })
    },

    destroy: function (req, res) {

        Movies.destroy({
            where: {id: req.params.id}
        })

        .then(movie => {
            res.redirect("/movies")
        })

        .catch(err => {
            res.send(err)
        })
    }

}

module.exports = moviesController;