class Response {
  success(data) {
    return {
      status: "Ok",
      data,
      message: "Your request completed successfully.",
    };
  }

  error(er) {
    return {
      status: "Error",
      message: er,
      data: null,
    };
  }

  serverError(er) {
    return {
      status: "Error",
      message: "Internal Server Error",
      data: er,
    };
  }
}

module.exports = Response;
