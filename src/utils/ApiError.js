class ApiError extends Error {
  constructor(
    statusCode,
    message = "Uh..oh Something Went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    (this.statusCode = statusCode),
      (this.message = message),
      (this.data = null),
      (this.success = false),
      (this.errors = errors);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError};

// Class Declaration: The code defines a class named ApiError which extends the built-in Error class.
//  This means ApiError inherits properties and behavior from Error.

// Constructor: The constructor method is used to initialize instances of the ApiError class. It takes four parameters:

// statusCode: The HTTP status code associated with the error.
// message: The error message. It defaults to 'Uh..oh Something Went wrong' if not provided.
// errors: An array containing detailed error information. It defaults to an empty array if not provided.
// stack: The stack trace associated with the error. It defaults to an empty string if not provided.
// super() Call: Inside the constructor, super(message) is called to invoke the constructor of the parent Error class.
//  This sets the error message.

// Initializing Properties: The constructor initializes various properties of the ApiError instance:

// statusCode: Assigned the value passed to the constructor.
// message: Assigned the value passed to the constructor or the default error message.
// data: Initialized to null.
// success: Initialized to false.
// errors: Assigned the value passed to the constructor or an empty array.
// Stack Trace: If a stack parameter is provided, the stack property of the instance is set to that value.
//  Otherwise, Error.captureStackTrace(this, this.constructor) is called to capture the stack trace.

// Export Statement: Finally, the ApiError class is exported as the default export from the module.




//for error;nodejs, but req,res we use express so not need to create a file
