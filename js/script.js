// Wait until the entire HTML page is fully loaded and parsed by the browser.
document.addEventListener('DOMContentLoaded', () => {
  // Retrieve the primary display container for the final calculated result.
  const displayMain = document.getElementById('display-main');
  // Retrieve the secondary display container to show the history and formula being typed.
  const displayHistory = document.getElementById('display-history');
  // Retrieve all buttons on the page to set up our interactive click handler loop.
  const buttons = document.querySelectorAll('button');
  // Retrieve the toggle button in the header to switch between Basic and Scientific views.
  const modeToggle = document.getElementById('mode-toggle');
  // Retrieve the main calculator card container to toggle active class styling on it.
  const calculatorCard = document.getElementById('calculator-card');
  // Retrieve the Radian button indicator to manage active and inactive styles.
  const btnRad = document.getElementById('btn-rad');
  // Retrieve the Degree button indicator to manage active and inactive styles.
  const btnDeg = document.getElementById('btn-deg');
  // Keep track of the full algebraic expression entered by the user.
  let expression = '';
  // Track whether the calculator is in Degree mode (true) or Radian mode (false).
  let isDegreeMode = false;
  // Use a flag to check if the user has just pressed the equals sign button.
  let justEvaluated = false;
  // Define a helper function to synchronize the main screen with current expression state.
  const updateDisplay = () => {
    // If the expression string is completely empty, default the main display to "0".
    if (expression === '') {
      // Clear out the history display line completely.
      displayHistory.textContent = '';
      // Set the main result line to "0".
      displayMain.textContent = '0';
    // If we just clicked "=" and computed a result, show it nicely.
    } else if (justEvaluated) {
      // Set the main display screen to show the computed expression or result.
      displayMain.textContent = expression;
    // Otherwise, we are actively editing a math formula.
    } else {
      // Render the current formula visually on the main display screen.
      displayMain.textContent = expression;
    }
  };
  // Define a helper function to calculate the mathematical factorial of an integer.
  const factorial = (n) => {
    // Return error if value is negative or not a whole integer number.
    if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid Input');
    // Return one if input number is zero or one (factorial bases).
    if (n === 0 || n === 1) return 1;
    // Initialize standard accumulator variable starting at value one.
    let result = 1;
    // Run an iterative multiplication loop from two up to the target integer value.
    for (let i = 2; i <= n; i++) {
      // Multiply current accumulator value by current loop index.
      result *= i;
    }
    // Return final calculated factorial integer result to caller.
    return result;
  };
  // Define a robust, safe mathematical parser using the recursive descent method.
  const parseExpression = (expr) => {
    // Initialize parsing character position tracking index at zero.
    let pos = 0;
    // Create helper function to read the character at the current parser index.
    const peek = () => {
      // Return character if index is in range, otherwise return null value.
      return pos < expr.length ? expr[pos] : null;
    };
    // Create helper function to return current character and increment index position.
    const next = () => {
      // Return and advance current character.
      return expr[pos++];
    };
    // Create helper function to consume character if it matches specified target.
    const consume = (char) => {
      // Check if current character matches specified target.
      if (peek() === char) {
        // Increment parsing index to consume matching character.
        next();
        // Return true signaling successful match consumption.
        return true;
      }
      // Return false signaling character did not match target.
      return false;
    };
    // Create helper function to parse lowest precedence addition and subtraction operators.
    const parseExpr = () => {
      // Parse left-hand side term using higher-precedence parsing function.
      let val = parseTerm();
      // Loop continuously to find any trailing addition or subtraction operators.
      while (true) {
        // If addition operator is matched and consumed.
        if (consume('+')) {
          // Add next high-precedence term to active running total value.
          val += parseTerm();
        // If subtraction operator is matched and consumed.
        } else if (consume('-')) {
          // Subtract next high-precedence term from active running total value.
          val -= parseTerm();
        // If neither addition nor subtraction is found.
        } else {
          // Break out of infinite loop since expression level parsing is done.
          break;
        }
      }
      // Return final calculated level-one value.
      return val;
    };
    // Create helper function to parse medium precedence multiplication and division.
    const parseTerm = () => {
      // Parse left-hand side factor using higher-precedence parsing function.
      let val = parseFactor();
      // Loop continuously to find any trailing multiplication or division operators.
      while (true) {
        // Check for either the standard 'x' operator or '*' symbol.
        if (consume('*') || consume('x')) {
          // Multiply next high-precedence factor with active running value.
          val *= parseFactor();
        // Check for division '/' operator symbol.
        } else if (consume('/')) {
          // Parse divisor factor using higher-precedence parsing function.
          const divisor = parseFactor();
          // Raise safety mathematical error if dividing by literal zero.
          if (divisor === 0) throw new Error('Error');
          // Divide active running value by parsed divisor value.
          val /= divisor;
        // If neither multiplication nor division is found.
        } else {
          // Break out of infinite loop since term level parsing is done.
          break;
        }
      }
      // Return final calculated level-two value.
      return val;
    };
    // Create helper function to parse high precedence factorial, percentages, and powers.
    const parseFactor = () => {
      // Parse active base using highest precedence primary parsing function.
      let val = parseBase();
      // Loop continuously to parse consecutive postfix operators like ! or %.
      while (true) {
        // If postfix factorial operator symbol is matched and consumed.
        if (consume('!')) {
          // Calculate factorial of the current active value.
          val = factorial(val);
        // If postfix percentage operator symbol is matched and consumed.
        } else if (consume('%')) {
          // Divide active value by one hundred to get percentage.
          val = val / 100;
        // If no more postfix operators are matched.
        } else {
          // Break loop to continue parsing.
          break;
        }
      }
      // If power exponent symbol '^' is matched and consumed.
      if (consume('^')) {
        // Calculate power using base and recursive exponent value.
        val = Math.pow(val, parseFactor());
      }
      // Return final calculated level-three value.
      return val;
    };
    // Create helper function to parse primary terms: numbers, constants, functions, parents.
    const parseBase = () => {
      // Loop to skip past any empty white space characters.
      while (peek() === ' ') {
        // Increment parsing index to skip spaces.
        next();
      }
      // If leading negative sign is matched (unary subtraction).
      if (consume('-')) {
        // Return negated evaluation of the following base element.
        return -parseBase();
      }
      // If leading positive sign is matched (unary addition).
      if (consume('+')) {
        // Return positive evaluation of the following base element.
        return parseBase();
      }
      // If open parenthesis group character is matched.
      if (consume('(')) {
        // Parse nested sub-expression recursively with full precedence.
        let val = parseExpr();
        // Consume matching close parenthesis group character.
        consume(')');
        // Return calculated inner parenthetical group value.
        return val;
      }
      // Retrieve the current character string in character stream.
      let ch = peek();
      // Return default zero if end of expression stream is reached.
      if (ch === null) return 0;
      // Get the remaining unparsed substring to check for functions.
      const slice = expr.substring(pos);
      // Check if substring starts with sine function call.
      if (slice.startsWith('sin(')) {
        // Advance cursor position index past function label.
        pos += 4;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Convert input degrees to radians if degree mode is toggled on.
        if (isDegreeMode) val = (val * Math.PI) / 180;
        // Return calculated sine trigonometric value.
        return Math.sin(val);
      }
      // Check if substring starts with cosine function call.
      if (slice.startsWith('cos(')) {
        // Advance cursor position index past function label.
        pos += 4;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Convert input degrees to radians if degree mode is toggled on.
        if (isDegreeMode) val = (val * Math.PI) / 180;
        // Return calculated cosine trigonometric value.
        return Math.cos(val);
      }
      // Check if substring starts with tangent function call.
      if (slice.startsWith('tan(')) {
        // Advance cursor position index past function label.
        pos += 4;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Convert input degrees to radians if degree mode is toggled on.
        if (isDegreeMode) val = (val * Math.PI) / 180;
        // Return calculated tangent trigonometric value.
        return Math.tan(val);
      }
      // Check if substring starts with natural logarithm call.
      if (slice.startsWith('ln(')) {
        // Advance cursor position index past function label.
        pos += 3;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Raise math range error if input value is zero or negative.
        if (val <= 0) throw new Error('Invalid Input');
        // Return calculated natural logarithm value.
        return Math.log(val);
      }
      // Check if substring starts with base-10 logarithm call.
      if (slice.startsWith('log(')) {
        // Advance cursor position index past function label.
        pos += 4;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Raise math range error if input value is zero or negative.
        if (val <= 0) throw new Error('Invalid Input');
        // Return calculated base-10 logarithm value.
        return Math.log10(val);
      }
      // Check if substring starts with square root function call.
      if (slice.startsWith('sqrt(') || slice.startsWith('√(')) {
        // Set cursor shift size depending on active visual symbol style.
        const shift = slice.startsWith('√(') ? 2 : 5;
        // Advance cursor position index past function label.
        pos += shift;
        // Parse inner function argument recursively.
        let val = parseExpr();
        // Consume closing parenthesis of function call.
        consume(')');
        // Raise math range error if input value is negative.
        if (val < 0) throw new Error('Invalid Input');
        // Return calculated square root float value.
        return Math.sqrt(val);
      }
      // If mathematical constant Pi symbol is matched.
      if (consume('π')) {
        // Return active float representation of Math Pi.
        return Math.PI;
      }
      // If mathematical constant e symbol is matched.
      if (consume('e')) {
        // Return active float representation of Math Euler.
        return Math.E;
      }
      // Record starting index of the active numeric parsing block.
      let start = pos;
      // Loop to capture digits and decimal points in numeric block.
      while (peek() !== null && ((peek() >= '0' && peek() <= '9') || peek() === '.')) {
        // Move parser stream pointer index forward.
        next();
      }
      // Check for scientific notation suffix inside numerical stream.
      if (consume('e') || consume('E')) {
        // Consume optional positive or negative sign indicator.
        if (peek() === '+' || peek() === '-') {
          // Advance parsing cursor past suffix sign.
          next();
        }
        // Capture digits following exponential notation suffix.
        while (peek() !== null && (peek() >= '0' && peek() <= '9')) {
          // Advance parsing cursor past exponent digit.
          next();
        }
      }
      // Check if parsing pointer moved forward capturing digit characters.
      if (pos > start) {
        // Parse captured slice of characters into float value and return.
        return parseFloat(expr.substring(start, pos));
      }
      // Raise parsing exception if no valid mathematical base could be resolved.
      throw new Error('Syntax Error');
    };
    // Evaluate full grammatical expression structure and get result.
    let result = parseExpr();
    // Skip past any final trailing empty spaces.
    while (peek() === ' ') {
      // Increment parsing index to skip spaces.
      next();
    }
    // Raise parsing exception if unparsed characters remain in stream.
    if (pos < expr.length) throw new Error('Syntax Error');
    // Return evaluated numerical result of the parsed expression.
    return result;
  };
  // Loop through all calculator buttons to attach standard event click listeners.
  buttons.forEach(button => {
    // Add click event listener handler to active button element.
    button.addEventListener('click', () => {
      // Extract clean string label of the clicked button.
      const value = button.textContent.trim();
      // Skip click handling if the button is a Rad or Deg mode indicator or layout switcher.
      if (button.id === 'btn-rad' || button.id === 'btn-deg' || button.id === 'mode-toggle') {
        // Exit click loop to prevent adding controls to text display state.
        return;
      }
      // If the clear button AC is clicked by the user.
      if (value === 'AC') {
        // Reset full mathematical expression back to empty state.
        expression = '';
        // Clear out the visual formula history display line.
        displayHistory.textContent = '';
        // Clear justEvaluated flag state.
        justEvaluated = false;
        // Sync active display nodes.
        updateDisplay();
        // Exit click listener loop.
        return;
      }
      // Handle the toggle positive/negative sign key.
      if (value === '+/-') {
        // Check if there is an active expression.
        if (expression) {
          // Match the last term or parenthesis block using custom regular expressions.
          const lastNumMatch = expression.match(/(\d+\.?\d*|\([^\)]+\)|π|e)$/);
          // If a trailing group is successfully matched.
          if (lastNumMatch) {
            // Store matched term group segment.
            const lastPart = lastNumMatch[0];
            // Split out the leading segment of the formula prefix.
            const beforePart = expression.substring(0, expression.length - lastPart.length);
            // Toggle negative signs if term is already negative.
            if (lastPart.startsWith('-')) {
              // Strip off negative sign to toggle it positive.
              expression = beforePart + lastPart.substring(1);
            // Toggle parenthetical negative groups if present.
            } else if (lastPart.startsWith('(-') && lastPart.endsWith(')')) {
              // Strip off parenthetical wrap.
              expression = beforePart + lastPart.substring(2, lastPart.length - 1);
            // Otherwise, apply negative sign.
            } else {
              // Prepend negative sign onto matching term.
              expression = beforePart + '-' + lastPart;
            }
          } else {
            // Append general minus operator to expression.
            expression += '-';
          }
        } else {
          // Start a negative number term if expression was empty.
          expression = '-';
        }
        // Update display to match changed expression.
        updateDisplay();
        // Exit click listener loop.
        return;
      }
      // Handle calculation evaluation key button click.
      if (value === '=') {
        // Verify we have active elements to perform calculations on.
        if (expression.trim() === '') {
          // Exit calculation loop.
          return;
        }
        // Attempt executing recursive parsing steps safely in try catch block.
        try {
          // Evaluate current formula expression using recursive descent parser.
          const evalResult = parseExpression(expression);
          // Update visual history element line to show formula evaluated.
          displayHistory.textContent = expression + ' =';
          // Format output float results to limit long floating values.
          expression = parseFloat(evalResult.toFixed(10)).toString();
          // Toggle evaluation flag on to handle next key typing cleanly.
          justEvaluated = true;
        // Catch any math errors or parser syntax failures.
        } catch (err) {
          // Set primary display display to indicate error type.
          expression = err.message || 'Error';
          // Clear visual history line.
          displayHistory.textContent = '';
          // Toggle evaluation flag on.
          justEvaluated = true;
        }
        // Synchronize displays to show calculated outcomes.
        updateDisplay();
        // Exit click listener loop.
        return;
      }
      // Handle customized button mappings for mathematical symbols.
      // Set value container mapping key variable.
      let buttonKey = value;
      // Map visual multiplication characters to standard syntax format.
      if (value === 'x') {
        // Map x to literal multiplication term.
        buttonKey = ' x ';
      // Map addition characters with spacing for readability.
      } else if (value === '+') {
        // Map addition to standard spaced format.
        buttonKey = ' + ';
      // Map subtraction characters with spacing for readability.
      } else if (value === '-') {
        // Map subtraction to standard spaced format.
        buttonKey = ' - ';
      // Map division characters with spacing for readability.
      } else if (value === '/') {
        // Map division to standard spaced format.
        buttonKey = ' / ';
      // Handle mapping of basic trig and log calls with parenthesis.
      } else if (value === 'sin' || value === 'cos' || value === 'tan' || value === 'ln' || value === 'log') {
        // Map standard calls to include open parenthetical brackets.
        buttonKey = value + '(';
      // Handle mapping of exponential square key operations.
      } else if (value === 'x²') {
        // Append square syntax representation to formula.
        buttonKey = '^2';
      // Handle mapping of exponential custom key power operations.
      } else if (value === 'xʸ') {
        // Append power base character separator symbol.
        buttonKey = '^';
      // Handle mapping of square root functions.
      } else if (value === '√') {
        // Append square root symbol with open parenthetical group.
        buttonKey = '√(';
      // Handle mapping of inverse fractions.
      } else if (value === '1/x') {
        // Append inverse power format.
        buttonKey = '^-1';
      // Handle mapping of factorial postfix indicators.
      } else if (value === 'x!') {
        // Append factorial postfix symbol.
        buttonKey = '!';
      // Handle mapping of eˣ exponential terms.
      } else if (value === 'eˣ') {
        // Append Euler constant power term.
        buttonKey = 'e^';
      // Handle mapping of 10ˣ exponential terms.
      } else if (value === '10ˣ') {
        // Append power-10 base term.
        buttonKey = '10^';
      // Handle random number generator key button press.
      } else if (value === 'Rand') {
        // Compute random float string and assign it as input.
        buttonKey = Math.random().toFixed(6);
      // Handle scientific notation suffix key button press.
      } else if (value === 'Exp') {
        // Append exponential character notation term.
        buttonKey = 'e';
      }
      // If we just completed a calculation.
      if (justEvaluated) {
        // Check if the next key clicked is an arithmetic operator.
        if (value === '+' || value === '-' || value === 'x' || value === '/') {
          // Keep result on screen and append operator to continue.
          justEvaluated = false;
        // Otherwise, starting typing a brand new calculation.
        } else {
          // Clear expression and history.
          expression = '';
          // Clear history display text.
          displayHistory.textContent = '';
          // Clear justEvaluated flag state.
          justEvaluated = false;
        }
      }
      // Verify expression is not currently showing syntax errors or mathematical errors.
      if (expression === 'Error' || expression === 'Invalid Input' || expression === 'Syntax Error') {
        // Reset expression to allow typing numbers.
        expression = '';
      }
      // Append resolved button key input onto expression.
      expression += buttonKey;
      // Synchronize changes back to user displays.
      updateDisplay();
    });
  });
  // Define helper function to toggle active styling visually on angle mode button keys.
  const updateAngleModeUI = () => {
    // If Degree mode is currently toggled on.
    if (isDegreeMode) {
      // Add active classes to Degree selector indicator.
      btnDeg.classList.add('text-orange-600', 'font-bold');
      // Strip out muted classes from Degree selector indicator.
      btnDeg.classList.remove('text-gray-500', 'font-normal');
      // Add muted classes onto Radian selector indicator.
      btnRad.classList.add('text-gray-500', 'font-normal');
      // Strip active classes from Radian selector indicator.
      btnRad.classList.remove('text-orange-600', 'font-bold');
    // If Radian mode is active (default).
    } else {
      // Add active classes to Radian selector indicator.
      btnRad.classList.add('text-orange-600', 'font-bold');
      // Strip out muted classes from Radian selector indicator.
      btnRad.classList.remove('text-gray-500', 'font-normal');
      // Add muted classes onto Degree selector indicator.
      btnDeg.classList.add('text-gray-500', 'font-normal');
      // Strip active classes from Degree selector indicator.
      btnDeg.classList.remove('text-orange-600', 'font-bold');
    }
  };
  // Add click listener onto Degree selector button indicator.
  btnDeg.addEventListener('click', () => {
    // Enable Degree calculations mode state.
    isDegreeMode = true;
    // Sync buttons styling indicators.
    updateAngleModeUI();
  });
  // Add click listener onto Radian selector button indicator.
  btnRad.addEventListener('click', () => {
    // Disable Degree calculations mode state.
    isDegreeMode = false;
    // Sync buttons styling indicators.
    updateAngleModeUI();
  });
  // Add event listener click handler onto scientific panels modeToggle button.
  modeToggle.addEventListener('click', () => {
    // Toggle scientific active styling class directly on calculator card container.
    calculatorCard.classList.toggle('scientific-active');
    // Check if card now contains active scientific layout class.
    if (calculatorCard.classList.contains('scientific-active')) {
      // Change toggler button label text to "Basic".
      modeToggle.textContent = 'Basic';
    // If layout was reverted back to normal mode.
    } else {
      // Change toggler button label text back to "Scientific".
      modeToggle.textContent = 'Scientific';
    }
  });
// Close DOMContentLoaded main wrapper block.
});
