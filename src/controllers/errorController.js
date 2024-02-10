exports.get404 = (req, res) => {
    res.status(404).render("error", {
        pageTitle: "Page Not Found",
        path: "/404",
        isAuthenticated: req.session.isLoggedIn
    });
};
  
exports.get500 = (req, res) => {
    res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session.isLoggedIn
    });
};
exports.handleError = (res, err) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    res.status(err.statusCode).json({ error: err.message });
};
