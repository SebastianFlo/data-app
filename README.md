# Data App

*Coding assignment for Front End Developent assesment*

## Table of Contents

  1. [Task](#task)
  1. [Technologies](#technologies)
  1. [Approach](#approach)
  1. [How to use](#how-to-use)
  1. [Comments](#comments)

## Task

### Data sources:

[Publishing](https://jsonblob.com/api/jsonBlob/55683150e4b03d338bd86998)  
[Reach data](http://jsonblob.com/api/jsonBlob/5208a709e4b002188ed03bdd)

### Description:

  - Setup up a webapp with nodejs and angularjs. [http://nodejs.org/](http://nodejs.org/), [https://angularjs.org/](https://angularjs.org/)
  
  - Use Less for all css rules [http://lesscss.org/](http://lesscss.org/)
  
  - Create CRUD REST endpoints for providing json blobs above
  
  - Render the publishing item and enable the ui to create, update and delete items (no validation)
  
  - Make a websocket impl. and when a new publication is created it pushes the data to the ui in real time.
  
  - Make a graph page with a graph rendering the data in the reach graph (using d3.js)
  
  - Make a websocket impl. and add data points to the reach graph in real time
  
  - Enable the project to be run from “node app.js” on localhost:3000
  
  
## Technologies

**[Back to top](#table-of-contents)**

### Sever:

  - [NodeJS](http://nodejs.org/)
  - [ExpressJS](http://expressjs.com/) (Version 4.*)
  - [Socket.IO](http://socket.io/)

### Client:

  - [Angular](https://angularjs.org/)
     -- Angular-Router 
     -- Angular-Socket-IO
  - [Gulp](http://gulpjs.com/) (gulp-less) 
  - [D3](http://d3js.org/)
  
## Approach

**[Back to top](#table-of-contents)**

I decided to use Express 4.0 for the server side, since it is the latest version, but especially as a exercise to get more familiar with the new breaking changes.

The project can be split into 2 tasks: Processing the Publish Data, and the Reach Data. 

### Published

The Publish data set is a list of items, describing social media? posts and their meta data. The original set has 6 items. 

I decided therefore to create a simple bootstrap ui (using the bootstrap.less source, to follow task guidelines) and render them as simple panels. 

The Publish view will have it's own Controller ( using ControllerAs ). The controller will activate using the data getting factory, which will poll the Express back for the published data on get.('api/publish')

Each published element will probably be rendered as a directive, but while using the view controller scope for simpicity.

Each element has it's own action buttons, that will emit the actions through sockets to the server, which then will notify the other clients of the action and element id.

    //TODO - Add more info as the work progresses
    
### Reach

The Reach data set will be received by the reach model, through the data factory, and will then be processed in the controller. 

I will attept to configure the chart parameters and rendering in the controller as well, as finding a directive online and sticking it in the project would be a bit too easy.

    //TODO - Add more info as the work progresses
    
#### Workflow

    git init
    
    npm init
    
    express --ejs

    npm install
    
    npm install socket.io --save
    

Created a server folder to hold the api and io modules, as well as the JSON blob assets.




    
## How to use

**[Back to top](#table-of-contents)**

Since using Express 4, the start of the app will be done using 

```javascript
  node bin/www
  
  // or
  
  npm start
  
```
    
*Note*: I am aware that the task description states the start of the app should be "node app.js" but I feel that more Express 3 functionality. It's easier to separate the modules, and combine them in www/bin, or reusing them somewhere else. 
If it is mandatory, there would be no problem refractoring the start of the app to "node app.js"
  
    //TODO - Add more info as the work progresses
    
## Comments
  
**[Back to top](#table-of-contents)**

    //TODO - Add more info as the work progresses

