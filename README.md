# battle-game

## overview
This is the repo for Battle Game, a game used by Qlik for a university hackathon

## getting started
To get up and running please follow the following steps

1. clone the repo
2. run `npm install` to install dependencies
3. add a config.js file to the root of the project. It should look like the following:
```
    module.exports = {
      mongoConnection: <connection string to the mongo db>,
      socketPort: <which port for players to connect to via WebSocket>,
      apiPort: <which port for admins to connect to via REST API>
    }
```

**Note:** If you would like to get started faster with a client that connects to this game, feel free to visit the [battle-game-client](https://github.com/rjriel/battle-game-client) repo.

## Contributing
Please feel free to contribute to this project. Work on issues, open issues for bugs/enhancements and create pull requests. You can view the [CONTRIBUTING](CONTRIBUTING.md) document for more information
