class AuthController {
  get_profile = (req, res) => {
    res.json({ user: req.user });
  };
}

export default new AuthController();
