// Wait for the DOM content to be fully loaded before running any script logic
document.addEventListener("DOMContentLoaded", () => {
    // Select the display div element using its unique ID attribute
    const displayElement = document.getElementById("display");
    // Select all button elements inside the calculator (both basic and scientific)
    const buttons = document.querySelectorAll("button");
    // Select the outer calculator card container element
    const cardElement = document.getElementById("calculator-card");
    // Select the scientific panel wrapper element
    const scientificPanel = document.getElementById("scientific-panel");
    // Select the Basic mode switcher button
    const btnBasic = document.getElementById("btn-basic");
    // Select the Scientific mode switcher button
    const btnScientific = document.getElementById("btn-scientific");
    
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

    // --- Mode Selector Handling ---

    // Define the handler function to switch to Basic mode
    const setBasicMode = () => {
        // Remove active button classes from Scientific switcher button
        btnScientific.classList.remove("bg-white", "text-gray-800", "shadow-sm");
        // Add inactive text color to Scientific switcher button
        btnScientific.classList.add("text-gray-500");
        // Add active button classes to Basic switcher button
        btnBasic.classList.add("bg-white", "text-gray-800", "shadow-sm");
        // Remove inactive text color from Basic switcher button
        btnBasic.classList.remove("text-gray-500");
        // Collapse the calculator card width back to standard basic size
        cardElement.classList.replace("max-w-2xl", "max-w-md");
        // Hide the scientific panel by adding the tailwind hidden class
        scientificPanel.classList.add("hidden");
    };

    // Define the handler function to switch to Scientific mode
    const setScientificMode = () => {
        // Remove active button classes from Basic switcher button
        btnBasic.classList.remove("bg-white", "text-gray-800", "shadow-sm");
        // Add inactive text color to Basic switcher button
        btnBasic.classList.add("text-gray-500");
        // Add active button classes to Scientific switcher button
        btnScientific.classList.add("bg-white", "text-gray-800", "shadow-sm");
        // Remove inactive text color from Scientific switcher button
        btnScientific.classList.remove("text-gray-500");
        // Expand the calculator card width to host the scientific panel
        cardElement.classList.replace("max-w-md", "max-w-2xl");
        // Show the scientific panel by removing the hidden class and applying grid layout
        scientificPanel.classList.remove("hidden");
        // Add grid layout class to the scientific panel division
        scientificPanel.classList.add("grid");
    };

    // Add click event listener to the Basic switcher button
    btnBasic.addEventListener("click", () => {
        // Set calculator to basic mode
        setBasicMode();
    });

    // Add click event listener to the Scientific switcher button
    btnScientific.addEventListener("click", () => {
        // Set calculator to scientific mode
        setScientificMode();
    });

    // --- Calculator State Input Handlers ---

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

    // --- Expression Math Parser & Evaluator (Shunting-yard Algorithm) ---

    // Define a function to split a math string into separate operators, operands, and brackets
    const tokenize = (exprStr) => {
        // Replace all multiplication symbols 'x' with standard asterisk '*'
        let s = exprStr.replace(/x/g, "*");
        
        // Match numbers (including decimals), operators, parentheses, function names, and square roots
        const regex = /\d+(?:\.\d+)?|[+\-*/^()]|[a-zA-Z]+|√/g;
        // Parse raw tokens based on the regex matches
        const rawTokens = s.match(regex) || [];
        
        // Create an array to process and resolve unary minus signs
        const tokens = [];
        // Loop through each matched token
        for (let i = 0; i < rawTokens.length; i++) {
            // Retrieve current token
            const current = rawTokens[i];
            // Retrieve previous token for context
            const prev = i > 0 ? rawTokens[i - 1] : null;
            
            // Unary negative sign identification: '-' is unary if at index 0 or preceded by operator/bracket
            if (
                current === "-" &&
                (prev === null || ["+", "-", "*", "/", "^", "("].includes(prev))
            ) {
                // Peek at the subsequent token to see if it is a number
                const next = i + 1 < rawTokens.length ? rawTokens[i + 1] : null;
                // If the next token is a valid digit/number
                if (next && !isNaN(parseFloat(next))) {
                    // Combine the negative sign directly with the number
                    tokens.push("-" + next);
                    // Increment loop counter to skip the next number token
                    i++;
                } else {
                    // Otherwise, keep the minus sign as a standard standalone token
                    tokens.push(current);
                }
            } else {
                // For all other tokens, simply push them to the final tokens array
                tokens.push(current);
            }
        }
        // Return processed tokens ready for the Shunting-yard conversion
        return tokens;
    };

    // Define Shunting-yard infix to postfix (Reverse Polish Notation) compiler
    const compileInfixToPostfix = (tokens) => {
        // Queue to store output postfix tokens
        const outputQueue = [];
        // Stack to store operators during parsing
        const operatorStack = [];
        
        // Define standard mathematical operator precedence values
        const precedence = {
            "+": 2,
            "-": 2,
            "*": 3,
            "/": 3,
            "^": 4
        };
        
        // Define identifier checker for scientific operations
        const isFunction = (t) => ["sin", "cos", "tan", "log", "ln", "√"].includes(t);
        // Define identifier checker for standard binary operators
        const isOperator = (t) => ["+", "-", "*", "/", "^"].includes(t);
        
        // Loop through the input token list
        for (let i = 0; i < tokens.length; i++) {
            // Get current token
            const token = tokens[i];
            
            // If token is a number or constants like PI/E
            if (!isNaN(parseFloat(token)) || token === "π" || token === "e") {
                // Push operand directly to output queue
                outputQueue.push(token);
            } else if (isFunction(token)) {
                // Push functions directly onto operator stack
                operatorStack.push(token);
            } else if (token === "(") {
                // Push left brackets directly onto operator stack
                operatorStack.push(token);
            } else if (token === ")") {
                // Pop operators to output queue until a matching left bracket is found
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== "(") {
                    // Transfer operator from stack to output queue
                    outputQueue.push(operatorStack.pop());
                }
                // If operator stack is depleted without finding '(', a parenthesis mismatch has occurred
                if (operatorStack.length === 0) return null;
                // Pop off and discard the matching left bracket
                operatorStack.pop();
                // If the top element remaining on stack is a scientific function, pop it to output queue
                if (operatorStack.length > 0 && isFunction(operatorStack[operatorStack.length - 1])) {
                    // Transfer the function token to the output queue
                    outputQueue.push(operatorStack.pop());
                }
            } else if (isOperator(token)) {
                // Resolve operator precedence: pop higher/equal precedence operators to output first
                while (
                    operatorStack.length > 0 &&
                    isOperator(operatorStack[operatorStack.length - 1]) &&
                    ((token !== "^" && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
                     (token === "^" && precedence[token] < precedence[operatorStack[operatorStack.length - 1]]))
                ) {
                    // Transfer operator from stack to output queue
                    outputQueue.push(operatorStack.pop());
                }
                // Push current operator to stack
                operatorStack.push(token);
            } else {
                // If an unknown character is matched, return null error state
                return null;
            }
        }
        
        // Pop off all remaining operators from the stack to the output queue
        while (operatorStack.length > 0) {
            // Retrieve operator
            const op = operatorStack.pop();
            // If any leftover parenthesis is found, it's an unclosed bracket syntax error
            if (op === "(" || op === ")") return null;
            // Transfer operator to output queue
            outputQueue.push(op);
        }
        
        // Return output queue array containing the Postfix notation
        return outputQueue;
    };

    // Define helper to evaluate Postfix notation (Reverse Polish Notation) expressions
    const evaluatePostfix = (postfixTokens) => {
        // Stack to store values during evaluation
        const stack = [];
        
        // Loop through each token in the postfix list
        for (let i = 0; i < postfixTokens.length; i++) {
            // Retrieve current token
            const token = postfixTokens[i];
            
            // If token is a standard float value
            if (!isNaN(parseFloat(token))) {
                // Parse float and push onto execution stack
                stack.push(parseFloat(token));
            } else if (token === "π" || token === "e") {
                // Push mathematical constant values
                stack.push(token === "π" ? Math.PI : Math.E);
            } else if (["+", "-", "*", "/", "^"].includes(token)) {
                // Pop right-side operand from execution stack
                const b = stack.pop();
                // Pop left-side operand from execution stack
                const a = stack.pop();
                // If either operand is missing, return error state
                if (a === undefined || b === undefined) return "Error";
                
                // Solve the binary operation
                if (token === "+") stack.push(a + b);
                else if (token === "-") stack.push(a - b);
                else if (token === "*") stack.push(a * b);
                else if (token === "/") {
                    // Division by zero handler
                    if (b === 0) return "Error";
                    stack.push(a / b);
                }
                else if (token === "^") stack.push(Math.pow(a, b));
            } else if (["sin", "cos", "tan", "log", "ln", "√"].includes(token)) {
                // Pop operand value from execution stack
                const a = stack.pop();
                // If operand is missing, return error state
                if (a === undefined) return "Error";
                
                // Solve the unary/scientific operation
                if (token === "sin") {
                    // Convert degrees to radians and calculate sine
                    stack.push(Math.sin((a * Math.PI) / 180));
                } else if (token === "cos") {
                    // Convert degrees to radians and calculate cosine
                    stack.push(Math.cos((a * Math.PI) / 180));
                } else if (token === "tan") {
                    // Convert degrees to radians
                    const rad = (a * Math.PI) / 180;
                    // Prevent tangent division by zero at asymptotes (e.g., 90 degrees)
                    if (Math.abs(Math.cos(rad)) < 1e-10) return "Error";
                    stack.push(Math.tan(rad));
                } else if (token === "log") {
                    // Logarithm base 10 (value must be greater than zero)
                    if (a <= 0) return "Error";
                    stack.push(Math.log10(a));
                } else if (token === "ln") {
                    // Natural logarithm (value must be greater than zero)
                    if (a <= 0) return "Error";
                    stack.push(Math.log(a));
                } else if (token === "√") {
                    // Square root (value must not be negative)
                    if (a < 0) return "Error";
                    stack.push(Math.sqrt(a));
                }
            }
        }
        
        // If execution finishes and contains precisely one single output value
        if (stack.length === 1) {
            // Return calculation result safely
            return stack[0];
        }
        // In case of syntax or stack evaluation errors
        return "Error";
    };

    // Define scientific solver that unifies tokenization, postfix compilation, and evaluation
    const evaluateExpression = (exprStr) => {
        // Trim whitespace from boundaries
        const cleanExpr = exprStr.trim();
        // Return 0 if expression is currently empty
        if (cleanExpr === "") return "0";
        // Return Error if expression holds an error state
        if (cleanExpr === "Error") return "Error";
        
        // Tokenize expression
        const tokens = tokenize(cleanExpr);
        // Compile Infix expression to Postfix format
        const postfix = compileInfixToPostfix(tokens);
        // If compilation failed due to syntax or bracket mismatches
        if (postfix === null) return "Error";
        
        // Evaluate postfix expression and return final formatted value
        const rawResult = evaluatePostfix(postfix);
        // Format the raw value cleanly
        return formatNumber(rawResult);
    };

    // --- Calculator Control & Operator Handling ---

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

    // Define the handler function invoked when a scientific function button is clicked
    const handleScientificFunction = (func) => {
        // If expression is 'Error' or '0'
        if (expression === "Error" || expression === "0") {
            // Overwrite directly with the function start
            expression = `${func}(`;
        } else {
            // If the expression ends with an operator, append function directly
            if (expression.endsWith(" ")) {
                expression += `${func}(`;
            } else {
                // Otherwise, multiply implicitly by inserting an 'x' operator
                expression += ` x ${func}(`;
            }
        }
        // Reset shouldReset flag so user can input parameters directly
        shouldReset = false;
        // Sync the display screen to show the updated formula
        updateDisplay();
    };

    // Define the handler function invoked when parenthesis brackets are clicked
    const handleParenthesis = (bracket) => {
        // If expression is in Error state, clear it to '0' first
        if (expression === "Error") expression = "0";
        
        // If expression is '0' and we click left bracket '('
        if (expression === "0" && bracket === "(") {
            // Overwrite directly with the bracket
            expression = "(";
        } else {
            // If we are appending '(' and previous character is a number, insert implicit multiplication
            if (bracket === "(" && !expression.endsWith(" ") && expression !== "") {
                expression += ` x (`;
            } else {
                // Otherwise, simply append the bracket directly
                expression += bracket;
            }
        }
        // Reset the calculation evaluate flag
        shouldReset = false;
        // Sync display screen to show the bracket
        updateDisplay();
    };

    // Define the handler function invoked when constants (Pi) are clicked
    const handleConstant = (constant) => {
        // If expression is 'Error' or '0'
        if (expression === "Error" || expression === "0") {
            // Overwrite directly with the constant
            expression = constant;
        } else {
            // If the last character is a number or bracket, insert implicit multiplication
            if (!expression.endsWith(" ")) {
                expression += ` x ${constant}`;
            } else {
                // Otherwise append constant directly
                expression += constant;
            }
        }
        // Reset calculation flag
        shouldReset = false;
        // Sync display screen
        updateDisplay();
    };

    // Define the handler function invoked when the equals (=) button is clicked
    const handleEquals = () => {
        // Solve the mathematical expression with correct scientific precedence
        expression = evaluateExpression(expression);
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

    // --- Button Event Mappings ---

    // Bind event listeners to each individual button on the calculator
    buttons.forEach((button) => {
        // Attach click event handler to the button element
        button.addEventListener("click", () => {
            // Retrieve clean text representation of the clicked button
            const keyText = button.textContent.trim();
            
            // Check if switcher button is clicked (skip calculator logic for switchers)
            if (button.id === "btn-basic" || button.id === "btn-scientific") return;
            
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
            // Check if user clicked a trigonometric or logarithmic function
            } else if (["sin", "cos", "tan", "log", "ln"].includes(keyText)) {
                // Execute scientific function handler
                handleScientificFunction(keyText);
            // Check if user clicked the square root button
            } else if (keyText === "√") {
                // Execute square root handler
                handleScientificFunction("√");
            // Check if user clicked the power exponentiation button
            } else if (keyText === "^") {
                // Execute operator handler with '^'
                handleOperator("^");
            // Check if user clicked the constant Pi button
            } else if (keyText === "π") {
                // Execute constant handler
                handleConstant("π");
            // Check if user clicked parenthesis brackets
            } else if (["(", ")"].includes(keyText)) {
                // Execute parenthesis handler
                handleParenthesis(keyText);
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

    // --- Hardware Keyboard Event Mappings ---

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
        // If key is power/caret exponent key
        } else if (key === "^") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call operator handler with exponent
            handleOperator("^");
        // If key is left parenthesis bracket
        } else if (key === "(") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call left bracket parenthesis handler
            handleParenthesis("(");
        // If key is right parenthesis bracket
        } else if (key === ")") {
            // Prevent browser default behavior
            event.preventDefault();
            // Call right bracket parenthesis handler
            handleParenthesis(")");
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
