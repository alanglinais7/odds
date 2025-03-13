# $ODDS Game Ecosystem Simulation

## Overview

This project is a simulation of the $ODDS token ecosystem, designed to model and visualize the economic interactions between the main $ODDS token and game tokens within the ecosystem. The simulation demonstrates how token burns, creator payouts, and price dynamics evolve over time.

## Features

- **Real-time Simulation**: Run the simulation at various speeds to see how the ecosystem evolves over time
- **Interactive Controls**: Pause, resume, and advance the simulation by hours or days
- **Game Token Creation**: Add individual games or create them in bulk
- **Customizable Parameters**: Set game volume and buy pressure for each token
- **Visual Analytics**: Track key metrics through interactive charts
- **Comprehensive Statistics**: View detailed stats on burn rates, creator payouts, and ecosystem value

## Key Metrics Tracked

- $ODDS token price and supply
- Game token prices and supplies
- Total ecosystem value
- Creator payouts
- Value burned
- Burn rates and projections

## How It Works

The simulation models a token ecosystem where:

1. The $ODDS token serves as the primary ecosystem token
2. Game tokens are created by users and operate on a simple bonding curve model
3. Each game runs on a fixed interval (20 seconds by default)
4. When games complete, fees are collected and distributed:
   - 10% goes to game creators
   - 20% is used to burn $ODDS tokens
   - 20% is used to burn the game's token
5. Buy pressure is simulated to model market demand for tokens

## Economic Model

The simulation uses a simplified bonding curve model where:
- Token price = initialPrice * (initialSupply/currentSupply)^n
- Burns reduce supply, increasing token price
- Buy volume creates upward price pressure
- Game volume increases slightly over time to simulate growing interest

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the application with `npm start`
4. Use the interface to create games and run the simulation

## Usage

1. **Start the simulation**: Click the "Start" button to begin
2. **Add games**: Enter a game name, set volume parameters, and click "Add Game"
3. **Adjust speed**: Select a simulation speed from the dropdown
4. **View metrics**: Monitor the charts and statistics as the simulation runs
5. **Fast forward**: Use the time buttons to advance by hours or days

## Customization

You can customize various aspects of the simulation:
- Game volume: The amount of value processed per game
- Buy volume: The amount of buy pressure per game
- Bulk creation: Create multiple games at once
- Simulation speed: Control how quickly time passes

## Technical Details

This application is built with:
- React.js for the UI components
- HTML5 Canvas for the charts
- CSS for styling

The simulation logic uses a time-based approach to model economic interactions between tokens in the ecosystem.

## Future Enhancements

Potential improvements for future versions:
- More sophisticated economic models
- Additional parameters for customization
- Export/import of simulation configurations
- Historical data analysis
- Multiple ecosystem scenarios

## License

[Include license information here]
