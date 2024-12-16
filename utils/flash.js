function setFlashMessage(res, type, message) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 5, // 5 minutes
    httpOnly: true, // Secure cookie, cannot be accessed by client-side JavaScript
  };
  res.cookie(type, message, cookieOptions); // Set the cookie properly
}

module.exports = { setFlashMessage };
