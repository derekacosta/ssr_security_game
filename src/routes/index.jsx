import Clarifai from 'clarifai';
var router = require('express').Router();
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var ReactRouter = require('react-router');
var Redux = require('redux');
var Provider = require('react-redux').Provider;

function reducer(state) {
    return state;
}

let image = 'https://picsum.photos/500/500?image=' + Math.floor(Math.random() * Math.floor(1000)).toString();

const app = new Clarifai.App({ apiKey: '4f69d7da58aa458baa84be2c3a56aff5' });

function getFacts(image) {
    return new Promise((resolve, reject) => {
    
        resolve(app
            .models
            .initModel({ id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40" })
            .then(generalModel => {
                return generalModel.predict(image);
            })
            .then(response => {
                return response['outputs'][0]['data']['concepts'].map(x => x.name);
            }));
    });
}

router
    .get('*', function (request, response) {
        
        var initialState = {
            image: image,
            concepts: getFacts(image).then(x => x)
        };
        var store = Redux.createStore(reducer, initialState);

        ReactRouter.match({
            routes: require('./routes.jsx'),
            location: request.url
        }, function (error, redirectLocation, renderProps) {
            if (renderProps) {
                var html = ReactDOMServer.renderToString(
                    <Provider store={store}>
                        <ReactRouter.RouterContext {...renderProps}/>
                    </Provider>
                );
                response.send(html);
            } else {
                response
                    .status(404)
                    .send('Not Found');
            }
        });
    });

module.exports = router;
