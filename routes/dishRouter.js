const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();
const Dishes= require('../models/dishes')
const authenticate = require('../authenticate');
const cors= require('./cors');
dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get(cors.cors,(req,res,next) => {
        Dishes.find({})
        .populate('comments.author')
        .then(
            (dishes) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => { next(err); })
            .catch((err) => {next(err);})
    }
)    
.post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
}) 
.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions,cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, { new: true })
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
    }, (err) => next(err))
    .catch((err) => next(err));
}) 
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        req.body.author = req.user._id;
        dish.comments.push(req.body);
        dish.save().then(
            (dish) =>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
                })
            }
        )
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'+ req.params.dishId + '/comments');})
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        var commentsNum = dish.comments.length;
        for(var i = 0 ; i<commentsNum ; i++ ){
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save()
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);                
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions,(req,res) => {res.sendStatus(200);})
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        if(dish.comments.id(req.params.commentId)==null){
            err = new Error("Comment not found");
            err.statusCode=404;
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments.id(req.params.commentId));
    }, (err) => next(err))
    .catch((err) => next(err));
}) 
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId + "/" + req.params.commentId);
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        var userId=req.user._id;
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        if(dish.comments.id(req.params.commentId)==null){
            err = new Error("Comment not found");
            err.statusCode=404;
            return next(err);
        }
        if(!dish.comments.id(req.params.commentId).author.equals(userId)){
            err = new Error("You can update only your own comments!");
            err.statusCode=403;
            return next(err);
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if(req.body.rating){
            dish.comments.id(req.params.commentId).rating=re.body.rating;
        }
        if(req.body.comment){
            dish.comments.id(req.params.commentId).comment=re.body.comment;
        }
        dish.save().then(
            (dish) =>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                })
            }
        )
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
        if(dish.comments.id(req.params.commentId)==null){
            err = new Error("Comment not found");
            err.statusCode=404;
            return next(err);
        }
        if(!dish.comments.id(req.params.commentId).author.equals(userId)){
            err = new Error("You can delete only your own comments!");
            err.statusCode=403;
            return next(err);
        }
        dish.comments.id(req.params.commentId).remove();
        dish.save()
        .then((dish) => {
            Dishes.findById(dish._id)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);   
            });
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;