const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
const minNumber = 1;
const maxNumber = 10;

// Generate a random number between minNumber and maxNumber
function generateRandomNumber() {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}

// Initialize the game with a random number
let targetNumber = generateRandomNumber();

async function playNumberGuessGame(data) {
  const guess = parseInt(data);

  if (isNaN(guess)) {
    return "Invalid input. Please enter a number.";
  }

  if (guess < minNumber || guess > maxNumber) {
    return `Please enter a number between ${minNumber} and ${maxNumber}.`;
  }

  if (guess === targetNumber) {
    return `Congratulations! You guessed the correct number ${targetNumber}. Play again?`;
  } else if (guess < targetNumber) {
    return "You lost! Try a higher number.";
  } else {
    return "You lost! Try a lower number.";
  }
}

var handlers = {
  number_guess: async (data) => playNumberGuessGame(data),
};

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accept" }),
    });

    if (finish_req.status !== 202) {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      const response = await handler(rollup_req["data"]);

      // If the player wins, reset the game with a new random number
      if (response.includes("Congratulations")) {
        targetNumber = generateRandomNumber();
      }

      await fetch(rollup_server + "/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response }),
      });
    }
  }
})();

