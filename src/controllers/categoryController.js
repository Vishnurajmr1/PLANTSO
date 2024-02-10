const Category = require("../models/category");
const Product = require("../models/product");
//To Add Category page
exports.getAddCategory = (req, res) => {
    res.render("admin/edit-category", {
        pageTitle: "Plantso||Admin-Category",
        layout: "main",
        title: "categories",
    });
};

exports.getCategories = (req, res) => {
    const message = req.query.message;
    Category.find()
        .lean()
        .then((categories) => {
            res.render("admin/category", {
                pageTitle: "Plantso||Admin-Category",
                title: "Categories",
                layout: "main",
                message: message,
                categories: categories,
                hasCategory: categories.length > 0,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postAddCategory = (req, res) => {
    const categoryName = req.body.name.toLowerCase();
    if (!categoryName) {
        return res.status(409).render("admin/edit-category", {
            message: "Category name is required",
            layout: "main",
            pageTitle: "Plantso||Admin-Category",
        });
    } else {
        Category.findOne({ name: categoryName })
            .then((existingCategory) => {
                if (existingCategory) {
                    if (existingCategory.isDeleted) {
                        existingCategory.isDeleted = false;
                        existingCategory
                            .save()
                            .then((savedCategory) => {
                                console.log(savedCategory);
                                const message = "Category added Successfully.";
                                return res
                                    .status(201)
                                    .redirect(
                                        `/admin/category?message=${encodeURIComponent(message)}`
                                    );
                            })
                            .catch((err) => console.log(err));
                    } else {
                        return res.status(409).render("admin/edit-category", {
                            message: "Category already exists",
                            layout: "main",
                            pageTitle: "Plantso||Admin-Category",
                            title: "categories",
                        });
                    }
                } else {
                    const category = new Category({
                        name: categoryName,
                        isDeleted: false,
                    });
                    category
                        .save()
                        .then((savedCategory) => {
                            console.log(savedCategory);
                            const message = "Category added successfully.";
                            return res
                                .status(201)
                                .redirect(
                                    `/admin/category?message=${encodeURIComponent(message)}`
                                );
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
};



exports.getEditCategory = (req, res) => {
    const editMode = req.query.edit;
    console.log(editMode);
    if (!editMode) {
        return res.redirect("/admin/category");
    }
    const prodId = req.params.categoryId;
    console.log(prodId);
    Category.findById(prodId)
        .lean()
        .then((category) => {
            console.log(category);
            if (!category) {
                return res.redirect("/admin/category");
            }
            res.render("admin/edit-category", {
                editing: editMode,
                category: category,
                layout: "main",
                pageTitle: "Plantso||Edit-category",
                title: "categories",
            });
        });
};


exports.postEditCategory = (req, res) => {
    const categoryId = req.body.categoryId;
    const updatedName = req.body.name.toLowerCase();

    Category.findById(categoryId)
        .then((category) => {
            if (!category) {
                return res.status(409).render("admin/edit-category", {
                    message: "Category Not Found",
                    layout: "main",
                    pageTitle: "Plantso||Admin-Category",
                });
            }

            return Category.findOne({
                name: updatedName,
                _id: { $ne: categoryId },
            }).then((existingCategory) => {
                if (existingCategory) {
                    return res.status(409).render("admin/edit-category", {
                        message: "Category Already Exists",
                        layout: "main",
                        pageTitle: "Plantso||Admin-Category",
                        category: category,
                    });
                } else {
                    category.name = updatedName;
                    return category.save().then((updatedCategory) => {
                        const message = "Category Updated Successfully.";
                        console.log("UPDATED CATEGORY");
                        return Category.find().then((categories) => {
                            categories.map((category) => {
                                if (
                                    category._id.toString() === updatedCategory._id.toString()
                                ) {
                                    return updatedCategory;
                                }
                                return category;
                            });
                            res.redirect(
                                `/admin/category?message=${encodeURIComponent(message)}`
                            );
                        });
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
};



exports.postDeleteCategory = (req, res) => {
    const catId = req.body.categoryId;
    const categoryMessage = "Category not found";
    Category.findById(catId)
        .then((category) => {
            if (!category) {
                return res.status(404).render("admin/category", {
                    message: categoryMessage,
                    layout: "main",
                    pageTitle: "Plantso||Admin-Category",
                });
            }
            // Check if there are any products under the category
            Product.countDocuments({ category: catId })
                .then((productCount) => {
                    if (productCount > 0) {
                        // Products exist under the category, cannot delete/disable the category
                        const message = "Cannot delete/disable the category as it contains products";
                        return res.redirect(
                            `/admin/category?message=${encodeURIComponent(message)}`
                        );
                    }
                    // No products under the category, set the category as deleted/disabled
                    category.isDeleted = true;
                    category
                        .save()
                        .then(() => {
                            const message = "Category deleted successfully";
                            res.redirect(
                                `/admin/category?message=${encodeURIComponent(message)}`
                            );
                        })
                        .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
};
