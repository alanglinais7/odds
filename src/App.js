// App.js
import React, { useState, useEffect, useRef } from 'react';
import './OddsGame.css'; // Import the CSS file

// Simple icon components
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// const PlusIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="12" y1="5" x2="12" y2="19"></line>
//     <line x1="5" y1="12" x2="19" y2="12"></line>
//   </svg>
// );

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

// const ChartLineIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M3 3v18h18"></path>
//     <path d="M18 12l-6-6-6 6"></path>
//     <path d="M8 12h8"></path>
//   </svg>
// );

const FireIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

// Tooltip component for charts
const Tooltip = ({ visible, position, content }) => {
  if (!visible) return null;
  
  return (
    <div className="chart-tooltip" style={{ left: position.x, top: position.y }}>
      {content}
    </div>
  );
};

const OddsGameSimulation = () => {
  // Initial state for the ecosystem
  const [oddsToken, setOddsToken] = useState({
    name: '$ODDS',
    supply: 1000000000,
    initialSupply: 1000000000,
    price: 0.02,
    initialPrice: 0.02,
  });

  // Game creation form state
  const [games, setGames] = useState([]);
  const [newGameName, setNewGameName] = useState('');
  const [gameVolume, setGameVolume] = useState(100);
  const [buyVolume, setBuyVolume] = useState(10);
  const [bulkAmount, setBulkAmount] = useState(1);

  // Simulation state
  const [simulationTime, setSimulationTime] = useState(0); // in seconds
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1); // seconds per tick
  const [simulationData, setSimulationData] = useState({
    timestamps: [],
    oddsPrice: [],
    totalBurned: [],
    creatorPayouts: [],
    ecosystemValue: []
  });

  // Chart state
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    content: ''
  });
  
  // Refs for chart interactions
  const chartRef = useRef(null);

  // Game duration and games per day
  const GAME_DURATION = 20; // seconds
  // const GAMES_PER_DAY = Math.floor((24 * 60 * 60) / GAME_DURATION);
  
  // Create a new game or games in bulk
  const addGame = () => {
    if (!newGameName.trim()) return;
    
    const newGames = [];
    
    for (let i = 0; i < bulkAmount; i++) {
      // Add a suffix for bulk games
      let name = newGameName.toUpperCase();
      if (bulkAmount > 1) {
        name = `${name}${i+1}`;
      }
      
      const gameToken = {
        name: `$${name}`,
        supply: 1000000,
        initialSupply: 1000000,
        price: 0.01,
        initialPrice: 0.01,
        volumePerGame: Number(gameVolume), // Use the user-defined game volume
        buyVolume: Number(buyVolume),      // New: Volume for buying this token
        creationTime: simulationTime,
        lastGameTime: simulationTime,
        totalCreatorPayout: 0,
        totalBurned: 0,
        totalVolume: 0
      };
      
      newGames.push(gameToken);
    }
    
    setGames([...games, ...newGames]);
    setNewGameName('');
  };

  // Simulate the economics of a game completion
  const processGameCompletion = (game) => {
    // Total volume for this game instance
    const gameVolume = game.volumePerGame;
    
    // Track total volume
    const newTotalVolume = game.totalVolume + gameVolume;
    
    // 5% fee skimmed from winnings
    const totalFee = gameVolume * 0.05;
    
    // Fee distribution
    const creatorFee = totalFee * 0.1; // 0.5% of total (10% of the 5% fee)
    const oddsBurnAmount = totalFee * 0.2; // 1% of total (20% of the 5% fee)
    const gameBurnAmount = totalFee * 0.2; // 1% of total (20% of the 5% fee)
    
    // Calculate tokens to burn based on current prices
    const oddsToBurn = oddsBurnAmount / oddsToken.price;
    const gameToBurn = gameBurnAmount / game.price;
    
    // NEW: Process buy volume - this puts price pressure on both tokens
    // First, calculate ODDS needed to buy the game token
    // const oddsNeededForBuy = game.buyVolume * 0.5; // 50% of buy volume goes to buying ODDS first
    // const gameTokenBuyVolume = game.buyVolume;
    
    // Calculate price impact for game token from buys
    // Using a simple bonding curve model: price = initialPrice * (initialSupply/currentSupply)^2
    // const effectiveBuyPressure = gameTokenBuyVolume / game.price; // Tokens "bought"
    
    // Update the game token supply and recalculate price accounting for buys and burns
    const newGameSupply = Math.max(0, game.supply - gameToBurn);
    // Price increases from both buy pressure and burns
    const newGamePrice = game.initialPrice * Math.pow((game.initialSupply / newGameSupply), 1.2); 
    
    // Update ODDS token supply and recalculate price
    const newOddsSupply = Math.max(0, oddsToken.supply - oddsToBurn);
    
    // ODDS price also affected by buy pressure for game tokens
    // const oddsTokenBuyPressure = oddsNeededForBuy / oddsToken.price; // ODDS "bought"
    const newOddsPrice = oddsToken.initialPrice * Math.pow((oddsToken.initialSupply / newOddsSupply), 1.1);
    
    // Update the ODDS token with new values
    setOddsToken({
      ...oddsToken,
      supply: newOddsSupply,
      price: newOddsPrice,
    });
    
    // Track creator payout and burns
    const newCreatorPayout = game.totalCreatorPayout + creatorFee;
    const newTotalBurned = game.totalBurned + oddsBurnAmount + (gameBurnAmount * game.price);
    
    // Update the game token with new values
    return {
      ...game,
      supply: newGameSupply,
      price: newGamePrice,
      lastGameTime: simulationTime,
      // Increase volume slightly for next game to simulate growing interest
      volumePerGame: game.volumePerGame * 1.01,
      totalCreatorPayout: newCreatorPayout,
      totalBurned: newTotalBurned,
      totalVolume: newTotalVolume
    };
  };

  // Advance the simulation by a specified number of seconds
  const advanceTime = (seconds) => {
    setSimulationTime(prevTime => prevTime + seconds);
  };

  // Advance simulation by specific intervals
  const advanceHour = () => advanceTime(60 * 60);
  const advance12Hours = () => advanceTime(12 * 60 * 60);
  const advanceDay = () => advanceTime(24 * 60 * 60);
  const advanceWeek = () => advanceTime(7 * 24 * 60 * 60)

  // Run or pause the simulation
  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };

  // Format time display
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  // Calculate percentage change
  const calculateChange = (current, initial) => {
    const percentChange = ((current - initial) / initial) * 100;
    return percentChange.toFixed(2) + '%';
  };

  // Draw a simple line chart
  const drawChart = (canvasId, data, labels, color) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = '#eaeaea';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i < 5; i++) {
      const y = height - (height * (i / 4));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // No data case
    if (data.length < 2) {
      ctx.fillStyle = '#888';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data yet', width / 2, height / 2);
      return;
    }
    
    // Find the min and max values
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Avoid division by zero
    
    // Draw the line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * width;
      const normalizedValue = (data[i] - min) / range;
      const y = height - (normalizedValue * height * 0.9) - (height * 0.05);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw axis labels
    ctx.fillStyle = '#888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    
    // Draw min value
    ctx.fillText(min.toFixed(4), 5, height - 5);
    
    // Draw max value
    ctx.fillText(max.toFixed(4), 5, 15);
    
    // Draw the latest value
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(data[data.length - 1].toFixed(4), width - 5, 15);
  };

  // Handle chart tooltip on mouse move
  const handleChartMouseMove = (event, chartId, data) => {
    if (!chartRef.current || data.length < 2) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Calculate the data index based on x position
    const dataIndex = Math.min(
      data.length - 1,
      Math.max(0, Math.floor((x / width) * data.length))
    );
    
    let content = '';
    switch (chartId) {
      case 'price-chart':
        content = `Time: ${formatTime(simulationData.timestamps[dataIndex])}<br>Price: ${formatCurrency(data[dataIndex])}`;
        break;
      case 'burned-chart':
        content = `Time: ${formatTime(simulationData.timestamps[dataIndex])}<br>Burned: ${formatCurrency(data[dataIndex])}`;
        break;
      case 'payouts-chart':
        content = `Time: ${formatTime(simulationData.timestamps[dataIndex])}<br>Payouts: ${formatCurrency(data[dataIndex])}`;
        break;
      case 'value-chart':
        content = `Time: ${formatTime(simulationData.timestamps[dataIndex])}<br>Value: ${formatCurrency(data[dataIndex])}`;
        break;
      default:
        content = `Time: ${formatTime(simulationData.timestamps[dataIndex])}<br>Value: ${formatCurrency(data[dataIndex])}`;
        break;
    }
    
    setTooltipState({
      visible: true,
      position: { x: event.clientX, y: event.clientY - 50 },
      content: content
    });
  };

  // Handle chart mouse leave
  const handleChartMouseLeave = () => {
    setTooltipState({ ...tooltipState, visible: false });
  };

  // Update simulation data for charts
  const updateSimulationData = () => {
    // Only record data points every 60 seconds to keep charts manageable
    if (simulationTime % 60 !== 0) return;
    
    // Calculate ecosystem stats for charts
    const totalCreatorPayouts = games.reduce((acc, game) => acc + game.totalCreatorPayout, 0);
    const totalBurned = games.reduce((acc, game) => acc + game.totalBurned, 0);
    const ecosystemValue = (oddsToken.supply * oddsToken.price) + 
      games.reduce((acc, game) => acc + (game.supply * game.price), 0);
    
    setSimulationData(prev => {
      // Keep only the last 100 data points to avoid excessive data
      const maxDataPoints = 100;
      
      const timestamps = [...prev.timestamps, simulationTime].slice(-maxDataPoints);
      const oddsPrice = [...prev.oddsPrice, oddsToken.price].slice(-maxDataPoints);
      const creatorPayouts = [...prev.creatorPayouts, totalCreatorPayouts].slice(-maxDataPoints);
      const totalBurnedArr = [...prev.totalBurned, totalBurned].slice(-maxDataPoints);
      const ecosystemValueArr = [...prev.ecosystemValue, ecosystemValue].slice(-maxDataPoints);
      
      return {
        timestamps,
        oddsPrice,
        creatorPayouts,
        totalBurned: totalBurnedArr,
        ecosystemValue: ecosystemValueArr
      };
    });
  };

  // Draw all charts
  useEffect(() => {
    drawChart('price-chart', simulationData.oddsPrice, simulationData.timestamps, '#4f46e5');
    drawChart('burned-chart', simulationData.totalBurned, simulationData.timestamps, '#ef4444');
    drawChart('payouts-chart', simulationData.creatorPayouts, simulationData.timestamps, '#10b981');
    drawChart('value-chart', simulationData.ecosystemValue, simulationData.timestamps, '#f59e0b');
  }, [simulationData]);

  // Effect to run the simulation
  useEffect(() => {
    if (!simulationRunning) return;
    
    const interval = setInterval(() => {
      advanceTime(simulationSpeed);
      
      // Process each game if enough time has passed since the last game
      setGames(currentGames => {
        return currentGames.map(game => {
          // Check if it's time for a new game (every 20 seconds)
          if (simulationTime - game.lastGameTime >= GAME_DURATION) {
            return processGameCompletion(game);
          }
          return game;
        });
      });
      
      // Update chart data periodically
      updateSimulationData();
      
    }, 100); // Update 10 times per second for smooth simulation
    
    return () => clearInterval(interval);
  }, [simulationRunning, simulationTime, simulationSpeed, processGameCompletion, updateSimulationData]);

  // Calculate total ecosystem metrics
  const totalGamesCreated = games.length;
  // const totalGameTokenSupply = games.reduce((acc, game) => acc + game.supply, 0);
  const totalGameTokenValue = games.reduce((acc, game) => acc + (game.supply * game.price), 0);
  const ecosystemTotalValue = (oddsToken.supply * oddsToken.price) + totalGameTokenValue;
  const totalCreatorPayouts = games.reduce((acc, game) => acc + game.totalCreatorPayout, 0);
  const totalBurned = games.reduce((acc, game) => acc + game.totalBurned, 0);

  return (
    <div className="odds-game-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="title">$ODDS Game Ecosystem Simulation</h1>
          <p className="subtitle">Prototype simulation of token economics</p>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="grid-layout">
          
          {/* Simulation controls */}
          <div className="control-panel">
            <h2 className="section-title">Simulation Controls</h2>
            
            <div className="time-control">
              <div className="time-display">
                <ClockIcon />
                <span>Time: {formatTime(simulationTime)}</span>
              </div>
              <button 
                onClick={toggleSimulation}
                className={`button ${simulationRunning ? 'button-stop' : 'button-start'}`}
              >
                {simulationRunning ? 'Pause' : 'Start'}
              </button>
            </div>
            
            <div className="speed-control">
              <label className="form-label">Simulation Speed</label>
              <select 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="select-input"
              >
                <option value="1">1x (1 second per tick)</option>
                <option value="5">5x (5 seconds per tick)</option>
                <option value="20">20x (20 seconds per tick)</option>
                <option value="60">60x (1 minute per tick)</option>
              </select>
            </div>
            
            <div className="time-buttons">
              <button onClick={advanceHour} className="time-button">
                +1 Hour
              </button>
              <button onClick={advance12Hours} className="time-button">
                +12 Hours
              </button>
              <button onClick={advanceDay} className="time-button">
                +24 Hours
              </button>
              <button onClick={advanceWeek} className="time-button">
                + One week
              </button>
            </div>
            
            <div className="add-game-section">
              <h3 className="subsection-title">Add New Game</h3>
              
              <div className="form-group">
                <label className="form-label">Game Name</label>
                <input
                  type="text"
                  placeholder="Game name (e.g. UP)"
                  value={newGameName}
                  onChange={(e) => setNewGameName(e.target.value)}
                  className="text-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Game Volume ($ per game)</label>
                <input
                  type="number"
                  placeholder="Volume per game"
                  value={gameVolume}
                  onChange={(e) => setGameVolume(e.target.value)}
                  className="text-input"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Buy Volume ($ per game)</label>
                <input
                  type="number"
                  placeholder="Buy pressure per game"
                  value={buyVolume}
                  onChange={(e) => setBuyVolume(e.target.value)}
                  className="text-input"
                  min="0"
                />
                <small className="helper-text">Upward price pressure from token buyers</small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Bulk Creation</label>
                <select
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(Number(e.target.value))}
                  className="select-input"
                >
                  <option value="1">Single Game</option>
                  <option value="10">10x Games</option>
                  <option value="100">100x Games</option>
                  <option value="1000">1000x Games</option>
                </select>
              </div>
              
              <button 
                onClick={addGame}
                className="button button-primary"
                disabled={!newGameName.trim()}
              >
                Add Game{bulkAmount > 1 ? `s (${bulkAmount})` : ''}
              </button>
            </div>
          </div>
          
          {/* Main token stats */}
          <div className="stats-panel">
            <div className="panel-header">
              <h2 className="section-title">Ecosystem Overview</h2>
            </div>
            
            <div className="panel-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3 className="stat-title">$ODDS Price</h3>
                  <div className="stat-value">{formatCurrency(oddsToken.price)}</div>
                  <div className={`stat-change ${oddsToken.price >= oddsToken.initialPrice ? 'positive' : 'negative'}`}>
                    {calculateChange(oddsToken.price, oddsToken.initialPrice)}
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3 className="stat-title">$ODDS Supply</h3>
                  <div className="stat-value">{formatNumber(oddsToken.supply)}</div>
                  <div className="stat-subtitle">
                    {((oddsToken.supply / oddsToken.initialSupply) * 100).toFixed(2)}% of initial
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3 className="stat-title">Games Created</h3>
                  <div className="stat-value">{totalGamesCreated}</div>
                  <div className="stat-subtitle">
                    {totalGamesCreated > 0 ? 
                      `Next game in ${GAME_DURATION - (simulationTime % GAME_DURATION)}s` : 
                      'No games yet'}
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3 className="stat-title">Ecosystem Value</h3>
                  <div className="stat-value">{formatCurrency(ecosystemTotalValue)}</div>
                  <div className="stat-subtitle">
                    {formatCurrency(oddsToken.supply * oddsToken.price)} in $ODDS
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section" ref={chartRef}>
                <h3 className="subsection-title">Key Metrics</h3>
                
                <div className="charts-grid">
                  <div className="chart-card">
                    <h4 className="chart-title">$ODDS Price</h4>
                    <canvas 
                      id="price-chart" 
                      width="300" 
                      height="150"
                      onMouseMove={(e) => handleChartMouseMove(e, 'price-chart', simulationData.oddsPrice)}
                      onMouseLeave={handleChartMouseLeave}
                    ></canvas>
                  </div>
                  
                  <div className="chart-card">
                    <h4 className="chart-title">Total Value Burned</h4>
                    <canvas 
                      id="burned-chart" 
                      width="300" 
                      height="150"
                      onMouseMove={(e) => handleChartMouseMove(e, 'burned-chart', simulationData.totalBurned)}
                      onMouseLeave={handleChartMouseLeave}
                    ></canvas>
                  </div>
                  
                  <div className="chart-card">
                    <h4 className="chart-title">Creator Payouts</h4>
                    <canvas 
                      id="payouts-chart" 
                      width="300" 
                      height="150"
                      onMouseMove={(e) => handleChartMouseMove(e, 'payouts-chart', simulationData.creatorPayouts)}
                      onMouseLeave={handleChartMouseLeave}
                    ></canvas>
                  </div>
                  
                  <div className="chart-card">
                    <h4 className="chart-title">Ecosystem Value</h4>
                    <canvas 
                      id="value-chart" 
                      width="300" 
                      height="150"
                      onMouseMove={(e) => handleChartMouseMove(e, 'value-chart', simulationData.ecosystemValue)}
                      onMouseLeave={handleChartMouseLeave}
                    ></canvas>
                  </div>
                </div>
              </div>

              {/* Game tokens table */}
              <div className="games-section">
                <h3 className="subsection-title">Game Tokens ({games.length})</h3>
                
                {games.length === 0 ? (
                  <div className="empty-state">
                    No games created yet. Add a game to get started.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Price</th>
                          <th>Supply</th>
                          <th>Game Vol</th>
                          <th>Buy Vol</th>
                          <th>Creator Earned</th>
                          <th>Burned Value</th>
                          <th>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {games.slice(0, 20).map((game, index) => (
                          <tr key={index}>
                            <td>{game.name}</td>
                            <td className="text-right">{formatCurrency(game.price)}</td>
                            <td className="text-right">{formatNumber(game.supply)}</td>
                            <td className="text-right">{formatCurrency(game.volumePerGame)}</td>
                            <td className="text-right">{formatCurrency(game.buyVolume)}</td>
                            <td className="text-right">{formatCurrency(game.totalCreatorPayout)}</td>
                            <td className="text-right">{formatCurrency(game.totalBurned)}</td>
                            <td className={`text-right ${game.price >= game.initialPrice ? 'positive' : 'negative'}`}>
                              {calculateChange(game.price, game.initialPrice)}
                            </td>
                          </tr>
                        ))}
                        {games.length > 20 && (
                          <tr>
                            <td colSpan="8" className="text-center">
                              + {games.length - 20} more games (showing first 20)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="additional-stats">
          <div className="section-header">
            <BarChartIcon />
            <h2 className="section-title">Simulation Statistics</h2>
          </div>
          
          <div className="stats-grid-four">
            <div className="stat-card">
              <h3 className="stat-title">Total Games Run</h3>
              <div className="stat-value">
                {Math.floor(simulationTime / GAME_DURATION) * games.length}
              </div>
            </div>
            
            <div className="stat-card">
              <h3 className="stat-title">$ODDS Burned</h3>
              <div className="stat-value">
                {formatNumber(oddsToken.initialSupply - oddsToken.supply)}
              </div>
            </div>
            
            <div className="stat-card">
              <h3 className="stat-title">Creator Payouts</h3>
              <div className="stat-value">
                {formatCurrency(totalCreatorPayouts)}
              </div>
            </div>
            
            <div className="stat-card">
              <h3 className="stat-title">Total Value Burned</h3>
              <div className="stat-value">
                {formatCurrency(totalBurned)}
              </div>
            </div>
          </div>
          
          <div className="burn-metrics">
            <div className="section-header">
              <FireIcon />
              <h2 className="section-title">Burn Economics</h2>
            </div>
            
            <div className="stats-grid-three">
              <div className="stat-card">
                <h3 className="stat-title">Burn Rate (ODDS/hour)</h3>
                <div className="stat-value">
                  {simulationTime > 3600 ? 
                    formatNumber((oddsToken.initialSupply - oddsToken.supply) / (simulationTime / 3600)) : 
                    'Calculating...'}
                </div>
                <div className="stat-subtitle">
                  {simulationTime > 3600 ? 
                    formatCurrency(((oddsToken.initialSupply - oddsToken.supply) / (simulationTime / 3600)) * oddsToken.price) + ' / hour' : 
                    ''}
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Projected Depletion</h3>
                <div className="stat-value">
                  {simulationTime > 3600 && (oddsToken.initialSupply - oddsToken.supply) > 0 ? 
                    `${Math.floor(oddsToken.supply / ((oddsToken.initialSupply - oddsToken.supply) / (simulationTime / 3600)))} hours` : 
                    'Calculating...'}
                </div>
                <div className="stat-subtitle">
                  {simulationTime > 3600 && (oddsToken.initialSupply - oddsToken.supply) > 0 ? 
                    `${Math.floor(oddsToken.supply / ((oddsToken.initialSupply - oddsToken.supply) / (simulationTime / 3600)) / 24)} days` : 
                    ''}
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Burn to Supply Ratio</h3>
                <div className="stat-value">
                  {simulationTime > 0 ? 
                    ((oddsToken.initialSupply - oddsToken.supply) / oddsToken.initialSupply * 100).toFixed(4) + '%' : 
                    '0.0000%'}
                </div>
                <div className="stat-subtitle">
                  of initial supply
                </div>
              </div>
            </div>
          </div>
          
          <div className="ecosystem-insights">
            <div className="section-header">
              <LayersIcon />
              <h2 className="section-title">Ecosystem Insights</h2>
            </div>
            
            <div className="stats-grid-three">
              <div className="stat-card">
                <h3 className="stat-title">Token Economic Ratio</h3>
                <div className="stat-value">
                  {(oddsToken.supply * oddsToken.price) / ecosystemTotalValue * 100 > 0 ? 
                    ((oddsToken.supply * oddsToken.price) / ecosystemTotalValue * 100).toFixed(2) + '%' : 
                    '100.00%'}
                </div>
                <div className="stat-subtitle">
                  ODDS to Game tokens value
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Creator to Burn Ratio</h3>
                <div className="stat-value">
                  {totalBurned > 0 ? 
                    (totalCreatorPayouts / totalBurned).toFixed(2) + ':1' : 
                    'N/A'}
                </div>
                <div className="stat-subtitle">
                  {totalCreatorPayouts > 0 ? 
                    `${((totalCreatorPayouts / (totalCreatorPayouts + totalBurned)) * 100).toFixed(2)}% to creators` : 
                    ''}
                </div>
              </div>
              
              <div className="stat-card">
                <h3 className="stat-title">Price Premium</h3>
                <div className="stat-value">
                  {oddsToken.initialPrice > 0 ? 
                    ((oddsToken.price / oddsToken.initialPrice) - 1).toFixed(2) + 'x' : 
                    '0.00x'}
                </div>
                <div className="stat-subtitle">
                  Multiplier from initial price
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>$ODDS Game Ecosystem Simulation | Prototype</p>
        </div>
      </footer>
      
      {/* Tooltip for charts */}
      <Tooltip 
        visible={tooltipState.visible} 
        position={tooltipState.position} 
        content={tooltipState.content} 
      />
    </div>
  );
};

export default OddsGameSimulation;