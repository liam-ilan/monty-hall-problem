## The Monty Hall Problem
A Simulation and Interactive Game

#### The Problem
The Monty Hall Problem is a question in statistics, that takes place in a theoretical game show. A contestant is given three doors. Behind one of these doors is a prize. The contestant picks a door at random (e.g door 1). The game show host then tells the contestant that the prize is NOT behind one of the two doors that *THE CONTESTANT DID NOT PICK* (e.g door 2). The host then gives the contestant the option to change their choice of doors (e.g. to door 3). **Should they switch?**

An interactive game is located at: https://monty-hall-problem.herokuapp.com/.

#### The Software
This repo includes both a simulation and a game to run against your own database and server.

#### Installation

Clone this repo using:
``` sh
    git clone https://github.com/liam-ilan/monty-hall-problem.git
```

Enter your MongoDB URI into a .env file.
```
    MONGODB_URI=<URI>
```

### Running the Game
To start up the server, use:
```
    npm start
```

To run a simulation, use:
``` sh
    node bot/simulation.js <number-of-batches> <number-of-games> > <name-of-output-file>
```

For example, to simulate 100 batches of 100 games, use:
``` sh
    node bot/simulation.js 100 100 > results.csv
```

To play the Monty Hall Problem game yourself open [localhost:3000](localhost:3000).

If you want to run the simulation against a remote server (like Heroku), enter the server URL into your .env file.
```
    SIMULATION_SERVER_URL=<URL>
```

A public version of this repo is at: https://monty-hall-problem.herokuapp.com/

### The Author
I'm Liam Ilan, a 13 year old software developer who is never working, but always playing around.