// Wait for the DOM content to be fully loaded before running any script logic
document.addEventListener("DOMContentLoaded", () => {
    // Select the display div element using its unique ID attribute
    const displayElement = document.getElementById("display");
    // Select all the calculator button elements present in the HTML document
    const buttons = document.querySelectorAll("button");
    
    // Initialize expression state variable to hold the primary math formula string
    let expression = "0";
    // Initialize shouldReset state to toggle formula clear on next numeric input
    let shouldReset = false;

    // Define a utility function to format numbers cleanly and avoid overflow issues
    const formatNumber = (num) => {
        // Convert the input string or number argument into a floating point format
        const val = parseFloat(num);
        // If the resulting conversion is not a valid number, return an Error string
        if (isNaN(val)) return "Error";
        // Convert the floating point number back to its standard string form
        const strVal = val.toString();
        // If the string length exceeds 10 digits, format the precision
        if (strVal.length > 10) {
            // Return precision representation limited to 10 decimal digits cleanly
            return val.toPrecision(10).replace(/\.?0+$/, "");
        }
        // Otherwise return the standard string conversion of the parsed number
        return strVal;
    };

    // Define a helper function to sync the screen with the current expression value
    const updateDisplay = () => {
        // Set the display element's text content to reflect the active expression
        displayElement.textContent = expression;
        
        // Get the character count of the active expression
        const len = expression.length;
        // Dynamically adjust the display font size based on the character length to avoid overflow
        if (len > 16) {
            // Set font size to small scale (text-3xl / 24px equivalent)
            displayElement.style.fontSize = "1.75rem";
        } else if (len > 10) {
            // Set font size to medium-small scale (text-4xl / 36px equivalent)
            displayElement.style.fontSize = "2.5rem";
        } else {
            // Set font size back to standard premium size (text-6xl / 60px equivalent)
            displayElement.style.fontSize = "3.75rem";
        }
    };

    // Define the handler function invoked when any digit button is clicked
    const handleDigit = (digit) => {
        // If screen is flagged to reset from a previous calculation or error
        if (shouldReset || expression === "Error") {
            // Set the expression directly to the clicked digit
            expression = digit;
            // Set the reset flag back to false for further digits
            shouldReset = false;
        } else {
            // If display is 0, overwrite it with the digit; else append the digit
            expression = expression === "0" ? digit : expression + digit;
        }
        // Update the user interface display with the updated formula value
        updateDisplay();
    };

    // Define the handler function invoked when the decimal button is clicked
    const handleDecimal = () => {
        // If screen is flagged to reset from a previous calculation or error
        if (shouldReset || expression === "Error") {
            // Initialize the current expression to start as '0.' for decimal numbers
            expression = "0.";
            // Reset the screen reset flag back to false for subsequent digits
            shouldReset = false;
            // Update the display screen to show the decimal value
            updateDisplay();
            // Return early as the decimal setup is fully completed
            return;
        }
        
        // Split the expression string by spaces to parse individual tokens
        const tokens = expression.split(/\s+/);
        // Retrieve the last token which is the number actively being entered
        const lastToken = tokens[tokens.length - 1];
        
        // If the active number does not already contain a decimal dot
        if (!lastToken.includes(".")) {
            // If the expression ends with an operator space (e.g., ' + ')
            if (expression.endsWith(" ")) {
                // Append '0.' to make the new operand start cleanly with a decimal
                expression += "0.";
            } else {
                // Otherwise, simply append the decimal point to the current active number
                expression += ".";
            }
            // Sync the display screen to show the updated decimal value
            updateDisplay();
        }
    };

    // Define the handler function invoked when the clear (AC) button is clicked
    const handleClear = () => {
        // Reset expression variable back to the default display value of '0'
        expression = "0";
        // Reset the screen refresh flag back to false to allow direct editing
        shouldReset = false;
        // Refresh the calculator screen display with the reset default state
        updateDisplay();
    };

    // Define the handler function invoked when the sign change (+/-) button is clicked
    const handleSignToggle = () => {
        // If current expression is 'Error' or '0', do not perform any sign conversion
        if (expression === "Error" || expression === "0") return;
        // Trim trailing space in case an operator was clicked just before this
        let cleanExpr = expression.trim();
        // Split the expression string by spaces into individual tokens
        let tokens = cleanExpr.split(/\s+/);
        // If tokens array is empty, return early to prevent errors
        if (tokens.length === 0) return;
        // Retrieve the last token which represents the active operand
        let lastToken = tokens[tokens.length - 1];
        // If the last token is not a valid number (e.g. is an operator key)
        if (isNaN(parseFloat(lastToken))) return;
        
        // If the last number starts with a minus sign
        if (lastToken.startsWith("-")) {
            // Remove the minus sign by slicing from index 1 onward
            lastToken = lastToken.slice(1);
        } else {
            // Otherwise, prepend a minus sign to invert it
            lastToken = "-" + lastToken;
        }
        
        // Replace the last token in the tokens array with the inverted token
        tokens[tokens.length - 1] = lastToken;
        // Reconstruct the expression string by joining the tokens with spaces
        expression = tokens.join(" ");
        // Sync the display screen to show the updated formula
        updateDisplay();
    };

    // Define the handler function invoked when the percentage (%) button is clicked
    const handlePercentage = () => {
        // If current expression is 'Error' or '0', do not perform any percentage math
        if (expression === "Error" || expression === "0") return;
        // Trim trailing space to ensure we operate on the active operand
        let cleanExpr = expression.trim();
        // Split the expression string by spaces into tokens
        let tokens = cleanExpr.split(/\s+/);
        // If tokens array is empty, abort the action to avoid crashes
        if (tokens.length === 0) return;
        // Retrieve the last token representing the active operand
        let lastToken = tokens[tokens.length - 1];
        // If the last token is not a valid float number, abort
        if (isNaN(parseFloat(lastToken))) return;
        
        // Divide the parsed number of the last token by 100
        const percentageValue = parseFloat(lastToken) / 100;
        // Format the percentage result cleanly to avoid decimal inaccuracies
        tokens[tokens.length - 1] = formatNumber(percentageValue);
        // Reconstruct the expression string by joining the tokens with spaces
        expression = tokens.join(" ");
        // Sync the display screen to show the updated formula with the percentage value
        updateDisplay();
    };

    // Define the core scientific arithmetic function to evaluate math expressions with operator precedence
    const evaluateScientificExpression = (exprStr) => {
        // Trim trailing operators or extra spaces to prevent parser syntax errors
        let cleanExpr = exprStr.trim();
        // Split the clean expression by spaces into discrete math tokens
        let tokens = cleanExpr.split(/\s+/);
        
        // If the expression is empty or just whitespace, default result to '0'
        if (tokens.length === 0 || tokens[0] === "") return "0";
        // If the expression is currently showing an error state, keep it as 'Error'
        if (tokens[0] === "Error") return "Error";
        
        // First Pass: Perform all Multiplication ('x') and Division ('/') operations (Higher precedence)
        for (let i = 0; i < tokens.length; i++) {
            // Retrieve the token at current index
            const token = tokens[i];
            // Check if token is multiplication or division
            if (token === "x" || token === "/") {
                // Get the left operand parsed as a float
                const leftVal = parseFloat(tokens[i - 1]);
                // Get the right operand parsed as a float
                const rightVal = parseFloat(tokens[i + 1]);
                
                // If either operand is an invalid number, return Error
                if (isNaN(leftVal) || isNaN(rightVal)) return "Error";
                
                // Declare variable to store temporary calculation result
                let result = 0;
                // If division operation
                if (token === "/") {
                    // Check if division by zero is attempted
                    if (rightVal === 0) return "Error";
                    // Calculate quotient of left and right operands
                    result = leftVal / rightVal;
                } else {
                    // Calculate product of left and right operands
                    result = leftVal * rightVal;
                }
                
                // Replace left operand, operator, and right operand with result value
                tokens.splice(i - 1, 3, result.toString());
                // Step back index to re-verify current position with new token array size
                i--;
            }
        }
        
        // Second Pass: Perform all Addition ('+') and Subtraction ('-') operations (Lower precedence)
        for (let i = 0; i < tokens.length; i++) {
            // Retrieve the token at current index
            const token = tokens[i];
            // Check if token is addition or subtraction
            if (token === "+" || token === "-") {
                // Get the left operand parsed as a float
                const leftVal = parseFloat(tokens[i - 1]);
                // Get the right operand parsed as a float
                const rightVal = parseFloat(tokens[i + 1]);
                
                // If either operand is an invalid number, return Error
                if (isNaN(leftVal) || isNaN(rightVal)) return "Error";
                
                // Declare variable to store temporary calculation result
                let result = 0;
                // If addition operation
                if (token === "+") {
                    // Calculate sum of left and right operands
                    result = leftVal + rightVal;
                } else {
                    // Calculate difference of left and right operands
                    result = leftVal - rightVal;
                }
                
                // Replace left operand, operator, and right operand with result value
                tokens.splice(i - 1, 3, result.toString());
                // Step back index to re-verify current position with new token array size
                i--;
            }
        }
        
        // If evaluation successfully resolved down to a single final token
        if (tokens.length === 1) {
            // Return final value formatted to clean scientific decimal limits
            return formatNumber(tokens[0]);
        }
        
        // In case expression evaluation failed to resolve into a single output token
        return "Error";
    };

    // Define the handler function invoked when a math operator button is clicked
    const handleOperator = (op) => {
        // If expression is in Error state, clear it to '0' first
        if (expression === "Error") expression = "0";
        
        // Reset the calculation evaluate flag so user can chain further math operations
        shouldReset = false;
        
        // If expression currently ends with an operator (i.e., with a trailing space)
        if (expression.endsWith(" ")) {
            // Slice off the last 3 characters representing the old operator
            expression = expression.slice(0, -3) + ` ${op} `;
        } else {
            // Otherwise, append the new operator wrapped with spaces for clear tokenization
            expression += ` ${op} `;
        }
        // Update the display screen to show the formula with the operator
        updateDisplay();
    };

    // Define the handler function invoked when the equals (=) button is clicked
    const handleEquals = () => {
        // Solve the mathematical expression with correct scientific precedence
        expression = evaluateScientificExpression(expression);
        // Set state to reset the screen when the next digit is pressed
        shouldReset = true;
        // Sync the display screen with the calculated final equation result
        updateDisplay();
    };

    // Define the handler function to delete the last character or token in the expression
    const handleBackspace = () => {
        // If expression is 'Error' or just '0', reset it to '0'
        if (expression === "Error" || expression === "0" || expression.length <= 1) {
            // Reset expression to '0'
            expression = "0";
        } else if (expression.endsWith(" ")) {
            // If the expression ends with an operator space (e.g., ' + '), slice the last 3 characters
            expression = expression.slice(0, -3);
            // If the sliced expression becomes empty, fall back to '0'
            if (expression === "") expression = "0";
        } else {
            // Otherwise, simply delete the last individual character
            expression = expression.slice(0, -1);
            // If the resulting expression is empty, fall back to '0'
            if (expression === "") expression = "0";
        }
        // Update the display screen to show the updated formula
        updateDisplay();
    };

    // Bind event listeners to each individual button on the calculator
    buttons.forEach((button) => {
        // Attach click event handler to the button element
        button.addEventListener("click", () => {
            // Retrieve clean text representation of the clicked button
            const keyText = button.textContent.trim();
            
            // Check if user clicked the Clear button
            if (keyText === "AC") {
                // Execute the clear function to reset calculator state
                handleClear();
            // Check if user clicked the sign toggle button
            } else if (keyText === "+/-") {
                // Execute the sign toggle function to flip values
                handleSignToggle();
            // Check if user clicked the percentage button
            } else if (keyText === "%") {
                // Execute the percentage calculation function
                handlePercentage();
            // Check if user clicked the equals button
            } else if (keyText === "=") {
                // Execute the equals function to solve the equation
                handleEquals();
            // Check if user clicked any of the basic math operators
            } else if (["+", "-", "x", "/"].includes(keyText)) {
                // Execute operator selector function with the chosen operator
                handleOperator(keyText);
            // Check if user clicked the decimal dot button
            } else if (keyText === ".") {
                // Execute decimal function to add precision dot
                handleDecimal();
            // In all other cases, user must have clicked a number digit
            } else {
                // Execute digit click function with the selected digit
                handleDigit(keyText);
            }
        });
    });

    // Listen for keydown events globally on the window to add keyboard support
    window.addEventListener("keydown", (event) => {
        // Retrieve the pressed key value representation
        const key = event.key;
        
        // If key is a digit between '0' and '9'
        if (key >= "0" && key <= "9") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call digit handler to insert number
            handleDigit(key);
        // If key is a decimal point dot
        } else if (key === ".") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call decimal handler to append dot
            handleDecimal();
        // If key is addition
        } else if (key === "+") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call operator handler with '+'
            handleOperator("+");
        // If key is subtraction
        } else if (key === "-") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call operator handler with '-'
            handleOperator("-");
        // If key is multiplication star or 'x'
        } else if (key === "*" || key.toLowerCase() === "x") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call operator handler with 'x'
            handleOperator("x");
        // If key is division slash
        } else if (key === "/") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call operator handler with '/'
            handleOperator("/");
        // If key is percentage
        } else if (key === "%") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call percentage handler
            handlePercentage();
        // If key is Enter or Equals key
        } else if (key === "Enter" || key === "=") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call equals handler to solve equation
            handleEquals();
        // If key is Backspace delete key
        } else if (key === "Backspace") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call backspace handler to delete
            handleBackspace();
        // If key is Escape key
        } else if (key === "Escape") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call clear handler to reset
            handleClear();
        }
    });
});
