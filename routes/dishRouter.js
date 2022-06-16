const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();
const Dishes= require('../models/dishes')

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next) => {
        Dishes.find({}).then(
            (dishes) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => { next(err); })
            .catch((err) => {next(err);})
    }
)    
.post((req, res, next) => {
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Dish Created ', dish);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
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
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId);
})
.put((req, res, next) => {
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
.delete((req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
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
.post((req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish==null){
            err = new Error("Dish not found");
            err.statusCode=404;
            return next(err);
        }
        dish.comments.push(req.body);
        dish.save().then(
            (dish) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }
        )
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'+ req.params.dishId + '/comments');})
.delete((req, res, next) => {
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
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
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
.post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+ req.params.dishId + "/" + req.params.commentId);
})
.put((req, res, next) => {
    Dishes.findById(req.params.dishId)
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
        if(req.body.rating){
            dish.comments.id(req.params.commentId).rating=re.body.rating;
        }
        if(req.body.comment){
            dish.comments.id(req.params.commentId).comment=re.body.comment;
        }
        dish.save().then(
            (dish) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }
        )
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
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
        dish.comments.id(req.params.commentId).remove();
        dish.save()
        .then((dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);                
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;