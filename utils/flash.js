function setFlashMessage(res, type, message) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5000, // Flash message lasts for 5 seconds
  };

  if (type === 'success') {
    res.cookie('successMessage', message, cookieOptions);
  } else if (type === 'error') {
    res.cookie('errorMessage', message, cookieOptions);
  }
}

module.exports = { setFlashMessage };
