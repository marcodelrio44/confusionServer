const express = require('express');
const bodyParser = require('body-parser');

const favouritesRouter = express.Router();
const Favourites= require('../models/favourites')
const cors= require('./cors');
const authenticate= require('../authenticate');
const Dishes = require('../models/dishes');
const { Error } = require('mongoose');
favouritesRouter.use(bodyParser.json());

favouritesRouter.route('/')
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    var userId= req.user._id;
    Favourites.find({user:userId})
    .populate('dishes')
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favourites);
    },(err) => next(err))
    .catch((err) => next(err));
})    
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    if(!Array.isArray(req.body)){
        var err = new Error('Request body should be an array!');
        err.statusCode=400;
        return next(err);
    }
    var dishesToAdd= req.body.map((dish,index) => {
        return dish._id;
    });
    var userId=req.user._id;
    Favourites.findOne({user:userId})
    .then((favouriteList) => {
        if(favouriteList==null){
            Favourites.create({user:userId,dishes:[]}).then(
                (favouriteList) => {
                    dishesToAdd=dishesToAdd.filter( (dish) => favouriteList.dishes.indexOf(dish)==-1);
                    
                    if(dishesToAdd.length){
                        favouriteList.dishes=favouriteList.dishes.concat(dishesToAdd);
                        favouriteList.save()
                        .then(
                            (favourites) => {
                                Favourites.findOne({user:userId})
                                .populate('dishes')
                                .then((favourites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favourites);
                                },(err) => next(err));
                            }
                        )
                    }
                }
            )
        }
        else{
            dishesToAdd=dishesToAdd.filter( (dish) => favouriteList.dishes.indexOf(dish)==-1);
                    
            if(dishesToAdd.length){
                favouriteList.dishes=favouriteList.dishes.concat(dishesToAdd);
                favouriteList.save()
                .then(
                    (favourites) => {
                        Favourites.findOne({user:userId})
                        .populate('dishes')
                        .then((favourites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favourites);
                        },(err) => next(err));
                    }
                )
            }
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

function addFavourite(favouriteList,dishId,userId,res,next){
    if(favouriteList.dishes.indexOf(dishId)!=-1){
        var err = new Error('Dish in already in your favourites!');
        err.statusCode = 403;
        return next(err);
    }
    favouriteList.dishes.push(dishId);
    favouriteList.save().then(
        (favouriteList) =>{
            Favourites.findOne({user:userId})
            .then((favourites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            },(err) => next(err));
        }
    )
}

favouritesRouter.route('/:dishId')
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        var userId=req.user._id;
        Favourites.findOne({user:userId})
        .then((favouriteList) => {
            if(favouriteList==null){
                Favourites.create({user:userId}).then(
                    (favouriteList) => {
                        addFavourite(favouriteList,dish._id,userId,res,next);
                    }
                )
            }
            else{
                addFavourite(favouriteList,dish._id,userId,res,next);
            }
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        var userId= req.user._id;
        
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        Favourites.findOne({user:userId}).then(
            (favourites) => {
                if(favourites==null || favourites.dishes.indexOf(dish._id)==-1){
                    err = new Error("Dish not in your favourites");
                    err.statusCode=404;
                    return next(err);
                }

                favourites.dishes=favourites.dishes.filter(dishId => dishId.toString()!==dish._id.toString())
                favourites.save()
                .then((favourites) => {
                    Favourites.findOne({user:userId})
                    .then((favouritesList) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favouritesList);   
                    });
                }, (err) => next(err));
            }
        )        
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favouritesRouter;