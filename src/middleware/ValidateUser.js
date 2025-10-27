function ValidateUser(req, res, next) {
  const { name, email, phone, password } = req.body;
  const emailRegex = /.+\@.+\..+/;
  const phoneRegex = /^\d{10}$/;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "Invalid or missing name" });
  }

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid or missing email" });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  next();
}

export default ValidateUser;
